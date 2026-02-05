# Feature: Add E2E Tests to Deployment Pipeline

## Summary
The deploy workflow only runs unit tests before deployment. Consider adding E2E tests for higher confidence before production releases.

## Context
- `frontend.yml` already includes Cypress E2E tests
- These are not included in the deployment pipeline (`deploy.yml`)
- E2E tests catch integration issues that unit tests miss

## Options

### Option A: Add E2E Tests to Deploy Pipeline
Add Cypress E2E tests as a required job before deployment.

**Pros:**
- Higher confidence before production deployment
- Catches integration issues

**Cons:**
- Slower pipeline (E2E tests take longer)
- May require additional setup (browser, display)

### Option B: Keep E2E Tests Separate
Document that E2E tests should be run manually or via separate workflow before tagging a release.

**Pros:**
- Faster deployment pipeline
- Simpler CI/CD configuration

**Cons:**
- Risk of deploying without E2E verification

### Option C: Run E2E Tests Post-Deploy (Smoke Tests)
Run a subset of E2E tests against production after deployment as smoke tests.

**Pros:**
- Verifies production actually works
- Doesn't slow down deployment

**Cons:**
- Issues discovered after deployment
- Requires production-safe test data

## Recommendation
Start with Option B (document the process), then evaluate if Option A or C is needed based on deployment frequency and confidence level.

## Priority
Low - Unit tests + health checks provide reasonable confidence for now.

## Labels
`testing`, `ci-cd`, `e2e`
