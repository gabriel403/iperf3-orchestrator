# Publishing Guide

This document explains how the automated publishing system works for `@gabriel403/iperf-orchestrator-server` and `@gabriel403/iperf-orchestrator-client`.

## Overview

The project uses GitHub Actions to automatically publish packages to GitHub Packages when changes are pushed to the repository.

## Package Names

- **Server**: `@gabriel403/iperf-orchestrator-server`
- **Client**: `@gabriel403/iperf-orchestrator-client`

## Versioning Strategy

### Main Branch (Stable Releases)

- **Tag**: `latest`
- **Format**: `MAJOR.MINOR.PATCH`
- **Example**: `1.2.3`
- **Behavior**: Auto-increments patch version on each push

### Other Branches (Beta Releases)

- **Tag**: `beta`
- **Format**: `MAJOR.MINOR.PATCH-beta.COUNTER`
- **Example**: `1.2.3-beta.1`, `1.2.3-beta.2`
- **Components**:
  - Base version from package.json
  - Auto-incrementing counter (stored in `.github/versions.json`)
- **Behavior**: 
  - Counter increments on each beta publish
  - Counter resets to 0 when publishing stable release from main
  - Warns if package contents changed but version wasn't bumped (doesn't block publish)

## Workflows

### Server Publishing (`publish-server.yml`)

Triggers:
- Push to any branch when `server/` changes
- Manual workflow dispatch (main branch only)

Steps:
1. Checkout code
2. Install dependencies
3. Run tests
4. Build
5. Determine version (stable or beta)
6. Update package.json
7. Publish to npm
8. Create git tag (main only)

### Client Publishing (`publish-client.yml`)

Triggers:
- Push to any branch when `client/` changes
- Manual workflow dispatch (main branch only)

Steps:
1. Checkout code
2. Install dependencies
3. Build
4. Determine version (stable or beta)
5. Update package.json
6. Publish to GitHub Packages
7. Create git tag (main only)

## Setup Requirements

### NPM Token

Add an `NPM_TOKEN` secret to your GitHub repository:

1. Create an npm access token:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a token with "Automation" type
   - Copy the token

2. Add to GitHub:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

### Package Access

Ensure your npm account has access to publish to the `@iperf-orchestrator` scope:

```bash
npm access grant read-write @iperf-orchestrator:OWNER
```

## Manual Publishing

### Via GitHub Actions

1. Navigate to Actions tab
2. Select "Publish Server Package" or "Publish Client Package"
3. Click "Run workflow"
4. Select:
   - Branch: `main`
   - Version bump: `major`, `minor`, or `patch`
5. Click "Run workflow"

### Via Command Line

For local testing (requires GitHub authentication):

```bash
# Authenticate with GitHub Packages
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Server
cd server
npm version patch  # or major/minor
npm publish

# Client
cd client
npm version patch  # or major/minor
npm publish
```

## Version Bump Types

- **Major** (`1.0.0` → `2.0.0`): Breaking changes
- **Minor** (`1.0.0` → `1.1.0`): New features, backward compatible
- **Patch** (`1.0.0` → `1.0.1`): Bug fixes, backward compatible

## Beta Releases

Beta releases are automatically created for non-main branches:

- Useful for testing features before merging to main
- Include branch name and commit hash for traceability
- Install with: `npm install @iperf-orchestrator/server@beta`

## Troubleshooting

### Publishing Fails

1. Verify `GITHUB_TOKEN` has `packages: write` permission (automatic in GitHub Actions)
2. Check repository settings allow GitHub Packages
3. Ensure package name follows `@OWNER/package-name` format
4. Verify version hasn't been published before

### Version Conflicts

If a version already exists:
- Main branch: The workflow will auto-increment
- Beta branch: Timestamp ensures uniqueness

### Git Tag Conflicts

Tags are only created on main branch. If tag exists, the workflow will skip tag creation (non-fatal).
