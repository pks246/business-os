-- CreateTable
CREATE TABLE "OrganisationModule" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "settings" JSONB,

    CONSTRAINT "OrganisationModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganisationModule_organisationId_idx" ON "OrganisationModule"("organisationId");

-- CreateIndex
CREATE INDEX "OrganisationModule_moduleId_idx" ON "OrganisationModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationModule_organisationId_moduleId_key" ON "OrganisationModule"("organisationId", "moduleId");

-- AddForeignKey
ALTER TABLE "OrganisationModule" ADD CONSTRAINT "OrganisationModule_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
