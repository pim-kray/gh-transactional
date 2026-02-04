# gh-transactional

> **Transactional workflows for GitHub Actions — because half-applied pipelines are worse than failures.**

`gh-transactional` is an open-source experiment that brings **transactional behavior** to GitHub Actions workflows using the **Saga Pattern**.

It lets you define workflows where:
- side effects are explicit
- failures are expected
- rollback is intentional, not an afterthought

This project exists because I got tired of fixing broken pipelines *after* they already changed the world.

⚠️ **Status:** Experimental (`0.0.x-alpha`)  
The core is stable, the API is still evolving.

---

## Why this exists (personal context)

GitHub Actions is great at automation — until something fails halfway through.

If a workflow crashes mid-run:
- tags are already pushed
- secrets are already rotated
- deployments are already live
- databases are half-migrated

At that point you’re no longer debugging CI —  
you’re doing **production recovery inside a log viewer**.

Most workflows “solve” this with:
- `if: failure()` blocks
- duplicated cleanup logic
- best-effort bash scripts
- or just fixing things manually

That doesn’t scale.  
And it definitely doesn’t feel safe.

So I built `gh-transactional`.

---

## The idea (simple, not magical)

`gh-transactional` treats a workflow like a **transaction**:

- each step does something
- optionally defines how to undo it
- if anything fails later → earlier changes are rolled back

This follows the **Saga Pattern**, adapted for CI/CD.

There is:
- no hidden logic
- no guessing
- no automatic “smart” rollback

If you want something undone, **you define how**.

---

## What it gives you

✔ Explicit rollback semantics  
✔ Reverse-order compensation (LIFO)  
✔ Transaction state persisted across jobs  
✔ Works with real side effects (GitHub, infra, files, secrets, DBs)  
✔ Predictable behavior

What it **does not** try to be:

✖ ACID transactions  
✖ A workflow scheduler  
✖ A DAG engine  
✖ “Undo everything automatically” magic

This is about **control**, not convenience.

---

## How it works (high level)

1. You start a transaction using a `tx.yaml` spec
2. Each transactional step:
    - executes a command
    - records its status
3. If all steps succeed → transaction commits
4. If any step fails → completed steps are compensated in reverse order
5. State is persisted using GitHub artifacts, so it works across jobs

That’s it.

---

## Minimal example

### Transaction spec (`tx.yaml`)

```yaml
transaction:
  id: deploy-example
  mode: strict
  state:
    path: tx-state.json
```

### Workflow Example

```yaml
name: Transactional Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pim-kray/gh-transactional/action/start@v0.0.7-alpha
        with:
          spec: tx.yaml

      - uses: pim-kray/gh-transactional/action/step@v0.0.7-alpha
        with:
          id: create-tag
          run: git tag v1.2.3 && git push origin v1.2.3
          compensate: git push --delete origin v1.2.3 || true

      - uses: pim-kray/gh-transactional/action/step@v0.0.7-alpha
        with:
          id: deploy
          run: ./deploy.sh
          compensate: ./rollback.sh

      - uses: pim-kray/gh-transactional/action/end@v0.0.7-alpha
```

### Multi-job transactions

Transactions can span multiple jobs.

State is stored as a versioned artifact and restored automatically.

```yaml
jobs:
  start:
    runs-on: ubuntu-latest
    steps:
      - uses: pim-kray/gh-transactional/action/start@v0.0.7-alpha
        with:
          spec: tx.yaml

  deploy:
    needs: start
    runs-on: ubuntu-latest
    steps:
      - uses: pim-kray/gh-transactional/action/step@v0.0.7-alpha
        with:
          id: deploy-app
          run: ./deploy.sh
          compensate: ./rollback.sh

  end:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: pim-kray/gh-transactional/action/end@v0.0.7-alpha
```

## Rollback Semantics (Important!)

Rollback is:
- Explicit
- Reverse-order
- Best-effort

rules: 
- Only steps that completed successfully are compensated.
- Steps without `compensate` are skipped.
- compensation failures are logged but do not stop rollback
- the transaction ends as `ABORTED`

This keeps behavior deteministic and auditable.


---

## What is this good for?
- Versioning & Release
- secret rotation
- infrastructure changes
- database migrations
- deployments
- stages rollouts
- destructive workflow you really want to undo safely

---

## What you need to do yourself
- write idempotent compensation scripts
- think about side effects
- accept that rollback is a design decision, not a fallback

This tool won't save you from bad scripts...

It just gives you a clean structure to reason about them.


---
## Roadmap
- [x] Transaction engine
- [x] Multi-job support
- [x] Artifact-based state
- [x] Real-world rollback tests
- [ ] parallel steps
- [ ] failure policies per group
- [ ] GitHub Marketplace release
- [ ] Better state introspection
- [ ] Simplify usage

---
# Why is this open-source?

As a devops engineer, I often had scripts that couldn't be run in a transactional context. but that would be great to have in CI/CD.
I Did not research any existing solutions, since I am also learning more about CI/CD, so this was the perfect chance to try something new.

I built this, because I needed it, and figured it might be useful to others.


---
# Contributing
PRs are welcome! I will review them myself.
Please read [CONTRIBUTING](CONTRIBUTING.md)

---
# LICENSE
MIT
[LICENSE](LICENSE)