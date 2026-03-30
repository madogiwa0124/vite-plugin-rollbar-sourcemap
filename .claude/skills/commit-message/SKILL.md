---
name: commit-message
description: "Generates OSS-quality Git commit messages that double as PR descriptions. Use when you want a subject line + body ready for both git log and GitHub Pull Requests."
argument-hint: "Describe what changed, why it was needed, any breaking changes, and related issue numbers."
---

# Commit Message / PR Description Generator

## Output Format

```
<type>(<scope>): <subject>

## Why

<Explain the motivation. What problem does this solve? What was broken or missing?>

## What changed

<Bullet list of concrete changes. Focus on the "what", not the "how".>

- ...
- ...

## Breaking changes (if any)

<Describe any breaking changes and migration steps. Omit this section if none.>

Closes #<issue number> (if applicable)
```

## Rules

### Subject line
- 50 characters or fewer
- Conventional Commits type prefix: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`
- Add `!` after the type for breaking changes: `feat!: drop Node 18 support`
- Scope is optional but encouraged for this plugin: `feat(plugin):`, `fix(upload):`, `chore(deps):`
- Imperative mood, no period: "add retry logic" not "added retry logic"

### Body
- Wrap at 72 characters
- "Why" section first — reviewers need context before details
- "What changed" as a bullet list — easy to scan in GitHub PR view
- Mention related issues with `Closes #N` or `Refs #N`

## Examples

### Feature
```
feat(plugin): add retry logic for failed sourcemap uploads

## Why

Transient network errors caused builds to silently drop sourcemaps,
leading to missing stack traces in Rollbar without any indication of
failure.

## What changed

- Add `retries` option (default: 3) to `RollbarSourcemapsOptions`
- Retry with exponential backoff on non-4xx HTTP errors
- Log each retry attempt at warn level unless `silent: true`

Closes #42
```

### Bug fix
```
fix(upload): resolve minified_url duplication when base ends with slash

## Why

When `base` was set to `/assets/`, the resulting `minified_url` became
`https://example.com//assets/app.js` (double slash), causing Rollbar to
reject the upload with a 422 error.

## What changed

- Normalize `base` by stripping trailing slashes before constructing URLs
- Add test cases covering base values with and without trailing slashes
```

### Breaking change
```
feat!: require vite ^8.0.0 as peer dependency

## Why

Vite 8 introduced changes to the `writeBundle` hook signature that this
plugin relies on. Supporting both Vite 7 and 8 would require conditional
branching that adds complexity without meaningful benefit.

## Breaking changes

`vite` peer dependency bumped from `^7.0.0` to `^8.0.0`. Users on
Vite 7 should remain on the previous version of this plugin.
```
