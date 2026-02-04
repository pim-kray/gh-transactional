---
name: General Issue
about: Report a bug, suggest an improvement, or propose a new feature.
title: "[TYPE] Short description of the issue"
labels: triage
assignees: ''

---

## Description
A clear and concise description of what the issue is or what you want to achieve.

---

## Current Behavior (if applicable)
If reporting a bug, describe what is currently happening. If proposing a feature, describe the current limitation.

## Expected Behavior
Describe what should happen or how the new feature should work.

---

## Proposed Solution / Implementation Details
* How should this be fixed or implemented?
* Does it align with the **Saga/Transactional** model?
* Are there any potential side effects or rollback concerns?

---

## Reproducible Example (for bugs)
If this is a bug, please provide a minimal workflow file or a series of steps to reproduce the behavior:

1. Go to '...'
2. Run workflow '...'
3. See error '...'

```yaml
# Example snippet if relevant
- name: Test gh-transactional
  uses: ./
  with:
    step: some-action