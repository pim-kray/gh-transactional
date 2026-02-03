# Design Document

## Transactional Workflows for GitHub Actions

### Status

Draft v0.1

### Authors

Pim Doornekamp

---

## 1. Problem Statement

GitHub Actions provides powerful primitives for CI/CD automation, but it lacks **transactional guarantees**.
When workflows consist of multiple steps or jobs, failure in a later stage can leave the system in an **inconsistent or partially modified state**.

### Example scenario

* **Job 1**: deletes files or resources
* **Job 2**: undeploys an application

If **Job 2 fails**:

* Job 1 has already completed
* The original state is lost
* Recovery requires:

    * manual intervention
    * reconstructing what was executed
    * increased risk of human error

This results in:

* wasted time
* operational stress
* “fix-forward” behavior
* fragile CI/CD pipelines

---

## 2. Project Goal

The goal of this project is to provide a **transactional orchestration layer** on top of GitHub Actions that allows multiple steps or jobs to be executed **atomically**:

> *Either all steps succeed, or the system is returned to a consistent state.*

Important constraints:

* This project does **not** implement true ACID transactions
* It is based on the **Saga pattern** using explicit compensation steps

---

## 3. Scope

### In scope

* Transactional execution of:

    * multiple steps within a single job
    * multiple jobs within a workflow
* Explicit compensation (rollback) per step
* Deterministic execution and logging
* Open-source distribution as a GitHub Action

### Out of scope

* Automatic rollback without user-defined compensation
* Rollback guarantees (compensation itself may fail)
* External persistent state (e.g. databases)
* Native GitHub Actions modifications

---

## 4. Conceptual Model

### Transaction

A **transaction** consists of:

* a unique identifier
* an ordered list of **steps**
* a transaction execution mode

Each step defines:

* a forward action (`run`)
* an optional compensation action (`compensate`)

### Transaction modes

| Mode          | Behavior                                                 |
| ------------- | -------------------------------------------------------- |
| `strict`      | On failure, all completed steps are compensated          |
| `best-effort` | Compensation is attempted, failures do not stop rollback |

---

## 5. Core Use Case

```yaml
transaction:
  id: cleanup-and-undeploy
  mode: strict
  steps:
    - id: remove-files
      run: ./remove_files.sh
      compensate: ./restore_files.sh

    - id: undeploy-app
      run: ./undeploy.sh
      compensate: ./redeploy.sh
```

### Execution flow

1. `remove-files` is executed
2. `undeploy-app` fails
3. Transaction transitions to **FAILED**
4. Rollback starts:

    * `restore-files` is executed
5. Transaction ends in **ABORTED**

Result:

* No partially applied state
* No manual recovery required

---

## 6. Architecture Overview

```
+--------------------+
| GitHub Workflow    |
|                    |
| uses: gh-transaction
+----------+---------+
           |
           v
+--------------------+
| Transaction Engine |
+--------------------+
| - Spec parser      |
| - State machine    |
| - Step executor    |
| - Rollback logic   |
+----------+---------+
           |
           v
+--------------------+
| GitHub Environment |
| (logs, artifacts) |
+--------------------+
```

---

## 7. State Machine

Each transaction progresses through explicit states:

```
PENDING
  ↓
RUNNING
  ↓
COMMITTED
  ↓
FAILED → COMPENSATING → ABORTED
```

### State transitions

* **RUNNING → FAILED**: a step fails
* **FAILED → COMPENSATING**: rollback begins
* **COMPENSATING → ABORTED**: rollback completes (successful or not)

Transaction state is persisted in a **transaction state file** (`tx-state.json`).

---

## 8. Step Execution

For each step:

1. Mark step as `started`
2. Execute `run`
3. On success → mark `completed`
4. On failure:

    * mark `failed`
    * initiate rollback

Rollback behavior:

* only steps marked `completed`
* executed in **reverse order**

---

## 9. Multi-Job Transactions

### Challenge

GitHub Actions jobs are isolated.

### Solution

* Persist transaction state as an **artifact**
* Subsequent jobs download the artifact
* The engine resumes the transaction from persisted state

This enables transactional workflows across:

* build → deploy → migrate
* infrastructure → application → cleanup

---

## 10. Observability

Minimal but explicit feedback:

* Console output:

    * `▶ Step remove-files`
    * `❌ Step undeploy-app failed`
    * `↩ Rolling back remove-files`
* Final summary:

  ```
  Transaction aborted
  Executed steps: remove-files
  Rolled back: remove-files
  ```

Future enhancements:

* GitHub Check Runs
* Pull Request comments

---

## 11. Failure Scenarios

| Scenario                | Behavior                                 |
| ----------------------- | ---------------------------------------- |
| Step fails              | Rollback is triggered                    |
| Compensation fails      | Logged; rollback continues (best-effort) |
| Engine crashes          | State allows resumption                  |
| No compensation defined | Step marked as non-revertible            |

---

## 12. Non-Goals

This project:

* does not guarantee recovery
* does not hide complexity
* does not replace proper deployment scripts

It enforces **explicit responsibility**:

> *If something must be reversible, its reversal must be defined.*

---

## 13. Summary

This design introduces:

* transactional thinking into CI/CD
* explicit rollback semantics
* predictable workflow behavior

For teams, this results in:

* fewer manual recovery actions
* safer deployments
* clearer operational understanding

---

## 14. Next Steps

1. Finalize the transaction spec (`tx.yaml`)
2. Formalize the state file schema
3. Implement the transaction engine
4. Create the GitHub Action wrapper
