-- Drop the broken index: 'deletedAt' was quoted as a string literal instead of a
-- column reference, so the predicate was always false and the index never applied.
DROP INDEX IF EXISTS schedule_company_date_active_unique;

-- Recreate it with the column correctly referenced.
CREATE UNIQUE INDEX schedule_company_date_active_unique
ON "Schedule" ("companyId", "date")
WHERE "status" != 'CANCELLED' AND "deletedAt" IS NULL;
