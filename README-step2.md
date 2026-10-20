BusinessOS Step 2 overlay: pinned template versions and consistent overrides

Target base inspected: pks246/business-os main at commit
b0e3b2e1b3b7b2596062803581955d30b40fb087.
The connected GitHub account is read-only; these are local overlay files, not a GitHub commit.

Before applying:
1. Commit or back up local work, especially if any of these files have uncommitted changes.
2. Extract this ZIP into the business-os repository root and allow the paths to merge/overwrite.
3. Review `git diff` before running anything.

This step intentionally makes these behaviour changes:
- Every template has a stable version (`1.0.0` in this release).
- Each Organisation is pinned to templateId + templateVersion; unknown pinned versions fail clearly instead of silently using the latest.
- Newly created organisations no longer copy all template module defaults into override rows. A missing row means inherit the pinned template; an existing row means an organisation override.
- Existing rows are preserved unchanged by the additive migration. Since older rows don't record whether they were originally seeded or explicitly changed, they are conservatively treated as overrides to avoid changing existing businesses.
- For both module and party-role configuration, an omitted/null settings value inherits the pinned template setting; a supplied settings object replaces the setting object as a whole.
- Module changes validate the whole effective config, including a module enabled through an organisation override even when the template doesn't list that module.
- Admin UI types and labels show the pinned template version.

Database migration:
- Check your local `DATABASE_URL` before applying any migration. Your earlier local setup used PostgreSQL host port `5433`.
- From `apps/api`, run `npx prisma validate`, then `npx prisma migrate dev`, then `npx prisma generate`.
- The migration only adds a NOT NULL `templateVersion` column with default `1.0.0`; existing records are backfilled to `1.0.0`.

Suggested local checks from `apps/api`:
  npx prisma validate
  npx prisma migrate dev
  npx prisma generate
  npm test -- --runInBand
  npm run build

Then from `apps/web`:
  npm run build

Do not deploy publicly on the strength of this step alone. API authentication/tenant membership and public-site isolation remain separate high-priority work. Run checks locally; these changes have not been runtime-tested in your environment.

Suggested commit after the checks pass:
  git add apps/api/prisma/schema.prisma apps/api/prisma/migrations/20261020150000_add_organisation_template_version apps/api/src/platform/business-template.ts apps/api/src/platform/templates/validate-template.ts apps/api/src/platform/templates/validate-template.spec.ts apps/api/src/templates apps/api/src/organisations apps/web/src/lib/types.ts apps/web/src/app/page.tsx
  git commit -m "feat: pin organisations to versioned business templates"
