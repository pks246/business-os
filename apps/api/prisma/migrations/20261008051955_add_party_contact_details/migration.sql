-- CreateTable
CREATE TABLE "PartyContactMethod" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyContactMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyAddress" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartyContactMethod_partyId_idx" ON "PartyContactMethod"("partyId");

-- CreateIndex
CREATE INDEX "PartyContactMethod_partyId_channel_idx" ON "PartyContactMethod"("partyId", "channel");

-- CreateIndex
CREATE INDEX "PartyAddress_partyId_idx" ON "PartyAddress"("partyId");

-- CreateIndex
CREATE INDEX "PartyAddress_partyId_type_idx" ON "PartyAddress"("partyId", "type");

-- AddForeignKey
ALTER TABLE "PartyContactMethod" ADD CONSTRAINT "PartyContactMethod_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyAddress" ADD CONSTRAINT "PartyAddress_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
