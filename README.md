# gh-transactional

> **Transactional workflows for GitHub Actions.**

`gh-transactional` brings **transactional integrity** to GitHub Actions workflows by applying the **Saga Pattern**.  
It allows complex workflows—spanning multiple steps or jobs—to either **complete fully** or **roll back safely** to a consistent state.

This prevents half-applied deployments, manual recovery work, and brittle `if: failure()` logic.

⚠️ **Status:** Experimental (Phase 4 complete).  
The API is evolving and not yet considered stable.

---

## Why gh-transactional exists

GitHub Actions is excellent for linear automation, but it has no concept of **atomic execution**.

If a workflow fails halfway through:
- earlier steps remain applied
- infrastructure, databases, or environments are left inconsistent
- recovery is manual, error-prone, and stressful

In practice, this leads to:
- fragile deployment pipelines
- defensive scripting
- “we’ll fix it forward” culture

`gh-transactional` solves this by making rollback a **first-class concept**.

---

## The core idea: Saga-based orchestration

Instead of relying on conditional steps or duplicated cleanup logic, `gh-transactional` models a workflow as a **transaction**:

- Each step executes a **forward action** (`run`)
- Optionally paired with a **compensation action** (`compensate`)
- If a later step fails, previously completed steps are compensated in **reverse order**

This follows the **Saga Pattern**, adapted for CI/CD workflows.

---

## What gh-transactional provides

- **Transactional execution** across multiple steps or jobs
- **Explicit rollback semantics** (no hidden magic)
- **Reverse-order compensation** for safe recovery
- **Persistent transaction state** via `tx-state.json`
- **Predictable behavior** instead of conditional chaos

What it deliberately does **not** provide:
- ACID guarantees
- automatic rollback without compensation scripts
- implicit or “best guess” recovery

---

## How it works (high level)

1. A transaction is started using a transaction specification (`tx.yaml`)
2. Each workflow step registers itself and mutates the transaction state
3. If all steps succeed, the transaction is committed
4. If any step fails, completed steps are compensated in reverse order

The transaction state is persisted, allowing workflows to span **multiple GitHub jobs**.

---

## Example: Transactional deployment

```yaml
# tx.yaml
transaction:
  id: infrastructure-setup
  mode: strict
  state:
    path: tx-state.json
```

```yaml
# .github/workflows/deploy.yml
name: Deploy Infrastructure

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Start the transaction
      - uses: pim-kray/gh-transactional/action/start@v1
        with:
          spec: tx.yaml
      
      # Step 1: Provision infrastructure
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: provision-infra
          run: terraform apply -auto-approve
          compensate: terraform destroy -auto-approve
      
      # Step 2: Deploy database migrations
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: migrate-db
          run: ./scripts/migrate-up.sh
          compensate: ./scripts/migrate-down.sh
      
      # Step 3: Deploy application
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: deploy-app
          run: kubectl apply -f manifests/
          compensate: kubectl delete -f manifests/
      
      # Commit or rollback the transaction
      - uses: pim-kray/gh-transactional/action/end@v1
```

If step 3 fails, the transaction automatically:
1. Rolls back the application deployment
2. Rolls back the database migrations
3. Destroys the infrastructure

All in reverse order. No manual cleanup required.

---

## Installation & Usage

### 1. Create a transaction specification

Create a `tx.yaml` file in your repository:

```yaml
transaction:
  id: my-deployment
  mode: strict
  state:
    path: tx-state.json
```

### 2. Add the actions to your workflow

```yaml
name: My Transactional Workflow

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Start transaction
      - uses: pim-kray/gh-transactional/action/start@v1
        with:
          spec: tx.yaml
      
      # Add transactional steps
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: step-1
          run: echo "Executing step 1"
          compensate: echo "Rolling back step 1"
      
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: step-2
          run: echo "Executing step 2"
          compensate: echo "Rolling back step 2"
      
      # End transaction
      - uses: pim-kray/gh-transactional/action/end@v1
```

---

## Multi-Job Workflows

Transactions can span multiple GitHub Actions jobs. The state is preserved via artifacts:

```yaml
name: Multi-Job Transaction

on: [push]

jobs:
  start:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pim-kray/gh-transactional/action/start@v1
        with:
          spec: tx.yaml
  
  provision:
    needs: start
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: provision-infra
          run: terraform apply -auto-approve
          compensate: terraform destroy -auto-approve
  
  deploy:
    needs: provision
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pim-kray/gh-transactional/action/step@v1
        with:
          id: deploy-app
          run: kubectl apply -f manifests/
          compensate: kubectl delete -f manifests/
  
  finalize:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pim-kray/gh-transactional/action/end@v1
```

---

## API Reference

### `action/start`

Initializes a new transaction.

**Inputs:**
- `spec` (required): Path to the transaction specification file (e.g., `tx.yaml`)

**Example:**
```yaml
- uses: pim-kray/gh-transactional/action/start@v1
  with:
    spec: tx.yaml
```

### `action/step`

Executes a transactional step with optional compensation.

**Inputs:**
- `id` (required): Unique identifier for this step
- `run` (required): Command to execute for this step
- `compensate` (optional): Command to execute if rollback is needed

**Example:**
```yaml
- uses: pim-kray/gh-transactional/action/step@v1
  with:
    id: my-step
    run: ./deploy.sh
    compensate: ./rollback.sh
```

### `action/end`

Finalizes the transaction, either committing or rolling back.

**Inputs:** None

**Example:**
```yaml
- uses: pim-kray/gh-transactional/action/end@v1
```

**Behavior:**
- If all steps succeeded → transaction is **committed**
- If any step failed → executes compensations in **reverse order**, transaction is **aborted**

---

## Transaction Specification

The `tx.yaml` file defines the transaction configuration:

```yaml
transaction:
  id: unique-transaction-id
  mode: strict  # or 'relaxed' (future)
  state:
    path: path/to/state.json  # where to store transaction state
```

**Fields:**
- `id`: Unique identifier for this transaction
- `mode`: Execution mode (`strict` is currently the only supported mode)
- `state.path`: File path where transaction state will be persisted

---

## How Rollback Works

When a step fails:

1. The transaction status is set to `ABORTED`
2. All completed steps are examined in **reverse order**
3. For each step with a `compensate` command:
   - The compensation command is executed
   - If compensation fails, an error is logged but rollback continues
4. Steps without a `compensate` command are skipped
5. The final transaction state is saved

Example:
```
Step 1: ✅ run (provision infra) → compensate defined
Step 2: ✅ run (deploy db) → compensate defined
Step 3: ❌ run (deploy app) → FAILED

Rollback sequence:
1. Step 2: compensate (rollback db)
2. Step 1: compensate (destroy infra)
```

---

## Logging & Telemetry

All transaction actions include detailed logging:

```
[INFO] 2026-02-04T09:00:00.000Z Starting transaction initialization
[INFO] 2026-02-04T09:00:01.000Z Initialized state for transaction 'my-tx' at tx-state.json
[INFO] 2026-02-04T09:00:02.000Z Executing step 'step-1' with command: ./deploy.sh
[INFO] 2026-02-04T09:00:05.000Z Step 'step-1' completed successfully
[ERROR] 2026-02-04T09:00:10.000Z Step 'step-2' failed
[INFO] 2026-02-04T09:00:11.000Z Failure detected, rolling back transaction
[INFO] 2026-02-04T09:00:15.000Z Rollback complete
```

Logs are written to:
- GitHub Actions console output
- Local log file (`transaction.log` by default, configurable via `GH_TX_LOG_FILE` env var)

---

## Best Practices

### 1. Make compensation idempotent
```yaml
compensate: |
  kubectl delete -f manifests/ || true
  terraform destroy -auto-approve -lock=false
```

### 2. Use meaningful step IDs
```yaml
id: provision-aws-eks-cluster  # Good
id: step-1                      # Avoid
```

### 3. Test your compensations
Compensation scripts should be tested independently to ensure they work correctly.

### 4. Keep steps atomic
Each step should do one logical thing. This makes compensation clearer and more reliable.

### 5. Handle stateless operations
For operations that don't need compensation (like notifications), simply omit the `compensate` field:

```yaml
- uses: pim-kray/gh-transactional/action/step@v1
  with:
    id: notify-slack
    run: ./notify-slack.sh
    # No compensate - this is idempotent/informational
```

---

## Troubleshooting

### State file not found
Ensure the `tx.yaml` file exists and the `state.path` is writable.

### Artifact upload conflicts
If you see "artifact with this name already exists", this is expected behavior. The actions use versioned artifacts internally to maintain state across jobs.

### Compensation fails
Compensations should be defensive and handle failure gracefully. Use `|| true` or proper error handling in your scripts.

---

## Roadmap

- [x] Phase 1: Core transaction engine
- [x] Phase 2: Basic GitHub Actions integration
- [x] Phase 3: Multi-job support via artifacts
- [x] Phase 4: Artifact-based state management
- [x] Phase 5: Logging and telemetry
- [ ] Phase 6: Advanced features (parallel steps, nested transactions)
- [ ] Phase 7: GitHub Marketplace publication
- [ ] Phase 8: Observability dashboard

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

`gh-transactional` is specifically designed for GitHub Actions and CI/CD use cases.
