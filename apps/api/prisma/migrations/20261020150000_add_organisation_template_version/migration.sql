-- Pin each organisation to the template version it was created from.
-- All templates in the current registry are version 1.0.0, so existing
-- organisations can be backfilled without changing their current defaults.
ALTER TABLE "Organisation"
ADD COLUMN "templateVersion" TEXT NOT NULL DEFAULT '1.0.0';
