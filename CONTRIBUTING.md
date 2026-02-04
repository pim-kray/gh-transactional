# Contributing to gh-transactional

Thank you for your interest in contributing to **gh-transactional**.

This project brings transactional semantics to GitHub Actions using the Saga pattern.
Contributions are welcome, provided they align with the project’s core design goals
and technical constraints.

Please read this document before opening an issue or pull request.

---

## Core Principles

All contributions should respect the following principles:

* Deterministic behavior over convenience
* Explicit failure handling
* No implicit or hidden behavior
* Predictable rollback semantics
* CI environments are unreliable by default

Changes that weaken these guarantees are unlikely to be accepted.

---

## Ways to Contribute

You may contribute by:

* Reporting bugs or edge cases
* Proposing architectural or design improvements
* Adding edge case, chaos, or regression tests
* Improving documentation or examples
* Fixing bugs or refactoring internal logic

---

## Branch Naming Convention

All contributions must be made from a dedicated branch.

**Do not open pull requests directly from `main` or `develop`.**

Use the following naming convention:

### Allowed prefixes

* `feat/`
* `fix/`
* `chore/`
* `docs/`
* `test/`
* `refactor/`

### Format

`<prefix>/<short-description>`

### Examples

* `feat/cross-job-state-persistence`
* `fix/rollback-order-bug`
* `chore/update-build-pipeline`
* `docs/transaction-model-explanation`
* `test/add-timeout-edge-case`
* `refactor/state-store-abstraction`

Branches that do not follow this convention may be asked to be renamed before review.

---

## Reporting Issues

When opening an issue, please include:

* A clear description of the problem
* A minimal workflow or configuration that reproduces the issue
* Expected versus actual behavior
* Relevant logs or error output
* The version or tag being used (for example: `v0.0.2-alpha`)

Issues without sufficient context may be closed or deferred.

---

## Proposing Features

Feature requests should:

* Clearly describe the problem being solved
* Explain how the proposal fits the Saga or transactional model
* Explicitly consider failure modes and rollback behavior
* Avoid introducing implicit state or hidden control flow

If the scope or impact is unclear, open an issue for discussion before submitting a pull request.

---

## Pull Request Guidelines

Pull requests should:

* Be focused on a single concern
* Avoid unrelated refactors or formatting changes
* Preserve backward compatibility unless explicitly discussed
* Include tests where behavior changes or edge cases are involved

### Required for Pull Requests

* Clear description of the change
* Rationale for design decisions
* Tests updated or added where applicable
* No breaking changes without prior discussion

---

## Code Style and Architecture

* Keep logic explicit and readable
* Prefer small, composable units
* Avoid unnecessary side effects
* Fail fast on invalid or corrupted state
* Do not swallow errors unless explicitly intentional

Clarity and correctness take precedence over clever abstractions.

---

## Versioning

This project follows semantic versioning:

* **alpha** versions are unstable and experimental
* **minor** versions introduce backward-compatible improvements
* **major** versions may contain breaking changes

Do not bump versions in pull requests unless explicitly requested.

---

## Security

If you discover a security issue, do not open a public issue.
Please contact the maintainer directly so it can be handled responsibly.

---

## License

By contributing to this project, you agree that your contributions will be licensed
under the **MIT License**, consistent with the rest of the codebase.

---

## Notes

This project is intentionally strict in scope and behavior.
Not all feature requests will be accepted, particularly if they compromise
determinism, rollback guarantees, or failure transparency.