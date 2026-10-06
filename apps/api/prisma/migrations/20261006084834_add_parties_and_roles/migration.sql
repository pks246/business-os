-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('PERSON', 'ORGANISATION');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "type" "PartyType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyRoleAssignment" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Party_organisationId_idx" ON "Party"("organisationId");

-- CreateIndex
CREATE INDEX "Party_organisationId_displayName_idx" ON "Party"("organisationId", "displayName");

-- CreateIndex
CREATE INDEX "PartyRoleAssignment_partyId_idx" ON "PartyRoleAssignment"("partyId");

-- CreateIndex
CREATE INDEX "PartyRoleAssignment_partyId_roleId_idx" ON "PartyRoleAssignment"("partyId", "roleId");

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyRoleAssignment" ADD CONSTRAINT "PartyRoleAssignment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
