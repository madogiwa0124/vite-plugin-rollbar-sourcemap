---
name: release
description: "Releases a new patch version of vite-plugin-rollbar-sourcemap to npm. Bumps version in package.json, commits, tags, pushes the tag, and publishes."
argument-hint: "Optionally specify version bump type: patch (default), minor, or major."
---

# Release Skill

## Pre-flight checks

Before starting, verify:

1. Working tree is clean — no uncommitted changes
   ```
   git status
   ```
2. On the `main` branch and up to date
   ```
   git pull origin main
   ```
3. Build passes and tests are green
   ```
   pnpm build && pnpm test && pnpm lint
   ```

If any check fails, stop and resolve before proceeding.

## Release procedure

### 1. Bump version in package.json

Read the current `version` field in `package.json`, compute the next version
(default: patch increment), and update the file.

Example: `0.0.11` → `0.0.12`

**Important:** Do NOT run `npm version` — edit `package.json` directly to
avoid auto-creating a git tag before the build is verified.

### 2. Build

```
pnpm build
```

Confirm `dist/` is updated before continuing.

### 3. Commit

Use the commit-message skill to craft the message, or follow this template:

```
chore(release): v<NEW_VERSION>
```

Stage only `package.json`:

```
git add package.json
git commit -m "chore(release): v<NEW_VERSION>"
```

### 4. Tag

```
git tag v<NEW_VERSION>
```

### 5. Push the tag

```
git push origin tags/v<NEW_VERSION>
```

Do not push the branch separately unless the user asks — pushing the tag is sufficient to trigger any CI release workflow.

### 6. Publish to npm

```
pnpm publish ./
```

## After release

Confirm the package is live:

```
npm view vite-plugin-rollbar-sourcemap version
```

Report the published version to the user.

## Version bump reference

| Type  | Example            | When to use                        |
|-------|--------------------|------------------------------------|
| patch | 0.0.11 → 0.0.12   | Bug fixes, dependency updates      |
| minor | 0.0.11 → 0.1.0    | New backwards-compatible features  |
| major | 0.0.11 → 1.0.0    | Breaking changes                   |
