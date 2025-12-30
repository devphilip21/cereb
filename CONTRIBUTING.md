# Contributing to Cereb

Thank you for your interest in contributing to Cereb! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+

If you use [mise](https://mise.jdx.dev/), run `mise install` to set up the correct versions automatically. Otherwise, refer to `.mise.toml` for the required versions.

### Setup

```bash
git clone https://github.com/user/cereb.git
cd cereb
pnpm install
```

### Development

```bash
# Run tests
pnpm nx test cereb

# Run linter
pnpm lint

# Fix lint issues
pnpm lint:fix

# Run docs site
pnpm docs
```

## How to Contribute

### Reporting Issues

- Use the issue templates for bug reports and feature requests
- Search existing issues before creating a new one
- Provide as much detail as possible

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
   ```bash
   git checkout -b feat/your-feature
   ```
3. Make your changes
4. Ensure tests pass and lint is clean
5. Commit using the commit message format below
6. Push and open a Pull Request

### Commit Message Format

```
{type}({package}): {title}

- Key point 1
- Key point 2
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`, `chore`

**Packages:** `core`, `pan`, `pinch`, `docs`

**Example:**
```
feat(pan): add velocity threshold option

- Add minVelocity option to filter slow gestures
- Update tests for new option
```

## Code Style

- Write comments in English only
- Use `*.spec.ts` naming for test files
- Place test files alongside source files
- Follow existing code patterns

## Review Process

All PRs require review and approval from the maintainer before merging. Please be patient and responsive to feedback.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
