# Publishing Guide

This document explains how the automated publishing system works for `@iperf-orchestrator/server` and `@iperf-orchestrator/client`.

## Overview

The project uses GitHub Actions to automatically publish packages to npm when changes are pushed to the repository.

## Package Names

- **Server**: `@iperf-orchestrator/server`
- **Client**: `@iperf-orchestrator/client`

## Versioning Strategy

### Main Branch (Stable Releases)

- **Tag**: `latest`
- **Format**: `MAJOR.MINOR.PATCH`
- **Example**: `1.2.3`
- **Behavior**: Auto-increments patch version on each push

### Other Branches (Beta Releases)

- **Tag**: `beta`
- **Format**: `MAJOR.MINOR.PATCH-beta.BRANCH.TIMESTAMP.COMMIT`
- **Example**: `1.2.3-beta.feature-xyz.20241218143022.a1b2c3d`
- **Components**:
  - Base version from package.json
  - Branch name (sanitized)
  - Timestamp (YYYYMMDDHHMMSS)
  - Short commit hash

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
6. Publish to npm
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

For local testing (requires npm login):

```bash
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

1. Check `NPM_TOKEN` secret is set correctly
2. Verify npm account has publish permissions
3. Check package name doesn't conflict with existing packages
4. Ensure version hasn't been published before

### Version Conflicts

If a version already exists:
- Main branch: The workflow will auto-increment
- Beta branch: Timestamp ensures uniqueness

### Git Tag Conflicts

Tags are only created on main branch. If tag exists, the workflow will skip tag creation (non-fatal).
