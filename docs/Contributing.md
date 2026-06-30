# StockFlow Contributing Guidelines

We follow strict standards to keep this project production-grade.

## Pull Request Lifecycle

1.  **Work Locally**:
    *   Initialize feature branches following conventional prefixes: `feature/`, `bugfix/`, `chore/`, `ci/`.
2.  **Verify Quality Checks**:
    *   Before committing, run our local CI validation suite:
        ```bash
        npm run ci
        ```
    *   Pre-commit hooks will automatically lint and verify code standards.
3.  **Git Commit Standards**:
    *   Write descriptive, imperative commit messages: `feat(auth): integrate jwt http cookies`.
