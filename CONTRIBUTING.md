# Contributing to HCL CDP Web SDK

Thank you for contributing to the HCL CDP Web SDK! This document provides guidelines for contributing to the project.

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This is **required** for automatic versioning and changelog generation via Release Please.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature (triggers **minor** version bump: 1.0.0 → 1.1.0)
- **fix**: A bug fix (triggers **patch** version bump: 1.0.0 → 1.0.1)
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi colons, etc)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Breaking Changes

To indicate a breaking change (triggers **major** version bump: 1.0.0 → 2.0.0):

1. Add `!` after the type: `feat!: remove deprecated API`
2. Or include `BREAKING CHANGE:` in the footer:

   ```
   feat: change config interface

   BREAKING CHANGE: The config interface has been restructured
   ```

### Examples

#### Good Examples ✅

```bash
feat: add automatic session renewal
fix: prevent empty session IDs after expiration
docs: update README with session management details
feat(destinations): add new analytics destination
fix(sessions)!: change session ID format
refactor: simplify cookie collection logic
perf: optimize event queue processing
test: add session renewal tests
```

#### Bad Examples ❌

```bash
Added new feature          # Missing type
Fix bug                    # Missing colon and proper format
feat(sessions) Fix issue   # Missing colon
FEAT: new feature          # Type should be lowercase
feat: Added new feature.   # Subject ends with period
```

### Scope (Optional)

The scope is optional and provides additional context:

- `feat(sessions): add auto-renewal`
- `fix(cookies): correct _ga cookie parsing`
- `docs(readme): update installation instructions`

### Subject

- Use imperative, present tense: "add" not "added" or "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 100 characters for the entire header

### Body (Optional)

- Explain **what** and **why**, not **how**
- Wrap at 72 characters per line
- Separate from subject with a blank line

### Footer (Optional)

- Reference issues: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

## Development Workflow

### 1. Install Dependencies

```bash
npm install
```

This will automatically set up husky for commit message validation.

### 2. Make Your Changes

Create a feature branch:

```bash
git checkout -b feat/my-new-feature
```

### 3. Commit Your Changes

The commit message will be automatically validated by commitlint:

```bash
git commit -m "feat: add new feature"
```

If your commit message doesn't follow the format, the commit will be rejected with an error message.

### 4. Create a Pull Request

When you create a PR, the GitHub Action will validate all commit messages in the PR. If any commits don't follow the format, the PR checks will fail and you'll receive guidance on how to fix them.

### Fixing Commit Messages

If you need to fix commit messages:

```bash
# For the last commit
git commit --amend

# For multiple commits (interactive rebase)
git rebase -i HEAD~3  # Last 3 commits

# Force push to update PR
git push --force
```

## Automated Release Process

Once your PR is merged:

1. **Release Please** automatically creates/updates a release PR
2. The release PR includes:
   - Updated version number (based on commit types)
   - Generated CHANGELOG.md
   - Updated package.json
3. When the release PR is merged:
   - A GitHub release is created
   - The package is automatically published to npm

## Questions?

If you have questions about the commit format or contribution process, please open an issue!
