-- CreateTable
CREATE TABLE "OrganisationPartyRolePolicy" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "captureMode" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationPartyRolePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganisationPartyRolePolicy_organisationId_idx" ON "OrganisationPartyRolePolicy"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationPartyRolePolicy_organisationId_roleId_key" ON "OrganisationPartyRolePolicy"("organisationId", "roleId");

-- AddForeignKey
ALTER TABLE "OrganisationPartyRolePolicy" ADD CONSTRAINT "OrganisationPartyRolePolicy_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
