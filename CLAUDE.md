# Project Guidelines for Claude Code

## Source Code Comment Rules

### Must Do
- Write all comments in English only
- Add comments for core models (interfaces or classes) explaining their responsibility, role, and design principles
- For complex functions (not simple mapping) exceeding 30 lines, add a summary comment explaining what the function does

### Must Not Do
- Do not leave comments just for section-dividing purposes
- Do not write comments for things that can be understood from the code alone

## Test Code Rules

### File Structure
- Test files use the `*.spec.ts` naming convention
- Test files are placed at the same directory depth as the target `.ts` file

### Test Coverage Strategy
- Tests are based on user scenarios of the module
- Initially include only core functionality tests
- Variations that represent essential behavior of core features should be included
- Do not include all edge case variations in the initial test suite
- Edge case tests are added incrementally over time as needed
