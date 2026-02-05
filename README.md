![CI](https://github.com/pim-kray/gh-transactional/actions/workflows/ci.yml/badge.svg) 
![Status](https://img.shields.io/badge/status-experimental-orange)
![GitHub Actions](https://img.shields.io/badge/platform-GitHub%20Actions-black?logo=github)
![Release](https://img.shields.io/github/v/release/pim-kray/gh-transactional)
![License](https://img.shields.io/github/license/pim-kray/gh-transactional)
![Discussions](https://img.shields.io/github/discussions/pim-kray/gh-transactional)
![Last commit](https://img.shields.io/github/last-commit/pim-kray/gh-transactional)

Please provide feedback, we are interested in your thoughts and suggestions!

---

# Table of Contents
- [About](#about)
- [How to use it](#how-to-use-it)
- [Who is the maintainer](#who-is-the-maintainer)
- [Collaborate](#collaborate)
- [License](#license)

---

## About
`gh-transactional` has been inspired by my own experience with learning CI-CD. After making the jump from being a backend-engineer to a CI/CD engineer, I noticed that I was looking for something similar to how `@Transactional` works in Spring.

The idea is to be able to rollback changes that have been made by your workflows in case of an error. Imagine if you are
updating the version of your app, but the tests are failing. It would be nice to revert that version and first fix your tests.

This is done by using a SAGA pattern. A SAGA pattern is a way to manage long-running or distributed processes by splititng them into steps.
The steps are used in our project as well. When you start a chain of jobs or steps in your `.yml` file, you can annotate them with
`start`, then `step` and finally `end`.

Ideally, it would then revert all changes that have been made. However, there are limitations. For example, database changes
are not easily reverted at this stage.

## How to use it

> **warning: This is very experimental, if your workflows have a lot of powerful steps, avoid using it.**

**step 1**: Create a simple spec file:
```yaml
transaction:
  id: spec-example
  mode: strict
  state:
    path: tx-state.json
```

The reason for this spec file is that we are creating a "contract" for GitHub actions. We tell it how strict it should be,
where the state 'lives.' I am currently investigating if this could be more flexible or easy to work with. The reason for
the spec file to be used now is that you can create multiple specs, so you can 'configure' each workflow based on your needs.

**step 2**: Create a workflow file that uses the spec:

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

You can see that we are using the 'start' 'step' and 'end' actions. These actions are how the SAGA pattern is implemented.
The `compensate` step is optional, and is used to revert changes that have been made.

**Multi-job example:**
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

in this case state is stored as a versioned artifact and restored automatically.

---

## Who is the maintainer?

This project is currently maintained by me: [Pim Doornekamp](https://github.com/pim-kray). 
To tell more about myself, I am a backend-engineer and a CI/CD engineer.

I am currently working on a new project called Seekoo, which will release in an alpha version soon!

`gh-transactional` is a side-project made for my own learning experience and for fun.

---

## Collaborate
Collaboration is very welcome! This project is made for my own learning experience and for fun. But I do believe that 
if conditions are met and the project is safely able to reverse changes, it could be a great tool for CI/CD. 
If you want to collaborate, please feel free to open an issue or a pull request. I am open to any suggestions or feedback.

---
# LICENSE
MIT
[LICENSE](LICENSE)