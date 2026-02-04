# gh-transactional — Phased TODO Roadmap

This document is the **single practical roadmap** for building `gh-transactional`.
Each phase is intentionally small, testable, and shippable.

---

## Phase 0 — Project Initialization (Foundation)

**Goal:** create a clean, extensible repository structure. No behavior.

* [x] Initialize repository
* [x] Define monorepo structure (actions / packages)
* [x] Create action folders (`start`, `step`, `end`)
* [x] Create engine and shared packages
* [x] Add `README.md`, `DESIGN.md`, `TODO.md`
* [x] Set up TypeScript configuration
* [x] Set up Jest for TypeScript

✅ Phase 0 complete when repo builds and tests can run.

---

## Phase 1 — Transaction Start (Initialization)

**Goal:** initialize a transaction from a spec file.

### Functionality

* [x] Load `tx.yaml`
* [x] Validate transaction spec
* [x] Create transaction state file
* [x] Fail fast on invalid specs

### Code

* [x] `loadSpec()`
* [x] `validateSpec()`
* [x] `initState()`
* [x] `gh-transactional/start` action wiring

### Tests

* [x] Happy-path test (valid spec)
* [x] Negative test (invalid spec)

✅ Phase 1 complete when `start.spec.ts` is green.

---

## Phase 2 — Transaction Step (State Mutation)

**Goal:** register and execute a transactional step.

### Functionality

* [x] Load existing transaction state
* [x] Append step to state
* [x] Mark step as `STARTED`
* [x] Execute `run` command
* [x] Mark step as `COMPLETED` or `FAILED`

### Code

* [x] `loadState()`
* [x] `saveState()`
* [x] `executeStep()`
* [x] `gh-transactional/step` action

### Tests

* [x] Step success updates state
* [x] Step failure updates state
* [x] Multiple steps in execution order
* [x] Compensate command storage

✅ Phase 2 complete when `step.spec.ts` is green.

---

## Phase 3 — Transaction End (Commit / Rollback Decision)

**Goal:** decide and perform commit or rollback.

### Functionality

* [x] Load final transaction state
* [x] Detect failed steps
* [x] Decide commit vs rollback
* [x] Execute compensations in reverse order
* [x] Update transaction status

### Code

* [x] Rollback executor
* [x] Reverse-step traversal
* [x] `gh-transactional/end` action

### Tests

* [x] Commit path test (all steps succeed)
* [x] Rollback path test (one step fails)

✅ Phase 3 complete when `endTransaction.spec.ts` is green.

---

## Phase 4 — Multi-Job Support

**Goal:** allow transactions to span multiple jobs.

### Functionality

* [x] Upload transaction state as artifact
* [x] Download state in subsequent jobs
* [x] Resume transaction execution

### Code

* [x] `artifact.ts` - Upload/download helpers
* [x] Updated `start` action - Upload initial state
* [x] Updated `step` action - Download → mutate → upload
* [x] Updated `end` action - Download → commit/rollback → upload

### Tests

* [x] Multi-job workflow example (`examples/multi-job.yml`)

✅ Phase 4 complete when multi-job workflow runs successfully.

---

## Phase 5 — Observability & UX

**Goal:** make behavior obvious and debuggable.

* [ ] Structured logging
* [ ] Clear error messages
* [ ] Final transaction summary output

---

## Phase 6 — CI & Release

**Goal:** ship a credible v1.

* [ ] CI workflow (`npm test`)
* [ ] Version tagging (`v1.0.0`)
* [ ] Release notes
* [ ] Public usage example

---

## Working Rules

* One phase at a time
* Every phase must be testable
* No behavior added without a test
* Stop after Phase 3 if scope grows

---

**Current status:** Phase 4 code complete - ready for GitHub Actions testing
**Next step:** Push to GitHub and test workflows in real environment

See `TESTING.md` for testing instructions.
