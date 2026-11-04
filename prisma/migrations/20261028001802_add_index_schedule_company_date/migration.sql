-- Create index
CREATE UNIQUE INDEX schedule_company_date_active_unique
ON "Schedule" ("companyId", "date")
WHERE "status" != 'CANCELLED' AND 'deletedAt' IS NULL;
