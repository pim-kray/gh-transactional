# gh-transactional

> **Transactional workflows for GitHub Actions.**

`gh-transactional` brings **transactional integrity** to GitHub Actions workflows by applying the **Saga Pattern**.  
It allows complex workflows—spanning multiple steps or jobs—to either **complete fully** or **roll back safely** to a consistent state.

This prevents half-applied deployments, manual recovery work, and brittle `if: failure()` logic.

⚠️ **Status:** Early development (Phase 3).  
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
    path: .tx/infrastructure-setup.json
