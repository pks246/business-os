'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  Organisation,
  Party,
  PartyRoleDefinition,
} from '@/lib/types';

async function fetchPartyData(organisationId: string) {
  const [parties, roles] = await Promise.all([
    apiFetch<Party[]>(
      `/organisations/${organisationId}/parties`,
    ),
    apiFetch<PartyRoleDefinition[]>(
      `/organisations/${organisationId}/parties/available-roles`,
    ),
  ]);

  return { parties, roles };
}

export default function PartiesPage() {
  const [organisations, setOrganisations] = useState<
    Organisation[]
  >([]);

  const [partyData, setPartyData] = useState<{
    organisationId: string;
    parties: Party[];
    roles: PartyRoleDefinition[];
  } | null>(null);

  const [selectedOrganisationId, setSelectedOrganisationId] =
    useState('');

  const [displayName, setDisplayName] = useState('');
  const [partyType, setPartyType] = useState<
    'PERSON' | 'ORGANISATION'
  >('PERSON');

  const [selectedPartyId, setSelectedPartyId] =
    useState('');

  const [selectedRoleId, setSelectedRoleId] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<Organisation[]>(
          '/organisations',
        );

        setOrganisations(data);

        if (data.length > 0) {
          setSelectedOrganisationId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load organisations',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedOrganisationId) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        setError('');

        const data = await fetchPartyData(
          selectedOrganisationId,
        );

        if (active) {
          setPartyData({
            organisationId: selectedOrganisationId,
            ...data,
          });
          setSelectedPartyId(data.parties[0]?.id ?? '');
          setSelectedRoleId(data.roles[0]?.id ?? '');
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load parties',
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedOrganisationId]);

  async function handleCreateParty(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedOrganisationId) {
      return;
    }

    const organisationId = selectedOrganisationId;

    try {
      setError('');

      const createdParty = await apiFetch<Party>(
        `/organisations/${organisationId}/parties`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: partyType,
            displayName,
          }),
        },
      );

      setDisplayName('');

      const data = await fetchPartyData(organisationId);
      setPartyData({ organisationId, ...data });
      setSelectedPartyId(createdParty.id);
      setSelectedRoleId(data.roles[0]?.id ?? '');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create party',
      );
    }
  }

  async function handleAssignRole(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedOrganisationId ||
      !selectedPartyId ||
      !selectedRoleId
    ) {
      return;
    }

    const organisationId = selectedOrganisationId;

    try {
      setError('');

      await apiFetch(
        `/organisations/${organisationId}/parties/${selectedPartyId}/roles`,
        {
          method: 'POST',
          body: JSON.stringify({
            roleId: selectedRoleId,
          }),
        },
      );

      const data = await fetchPartyData(organisationId);
      setPartyData({ organisationId, ...data });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to assign role',
      );
    }
  }

  const parties =
    partyData?.organisationId === selectedOrganisationId
      ? partyData.parties
      : [];
  const roles =
    partyData?.organisationId === selectedOrganisationId
      ? partyData.roles
      : [];

  if (loading) {
    return (
      <main className="p-8">
        Loading BusinessOS...
      </main>
    );
  }

  const selectedParty = parties.find(
    (party) => party.id === selectedPartyId,
  );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-medium">
            BusinessOS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Parties
          </h1>

          <p className="mt-2 text-gray-600">
            Manage persistent people and organisations
            associated with a business.
          </p>
        </header>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="rounded border p-6">
          <label
            htmlFor="organisation"
            className="block font-medium"
          >
            Business
          </label>

          <select
            id="organisation"
            value={selectedOrganisationId}
            onChange={(event) =>
              setSelectedOrganisationId(
                event.target.value,
              )
            }
            className="mt-2 rounded border px-3 py-2"
          >
            {organisations.map((organisation) => (
              <option
                key={organisation.id}
                value={organisation.id}
              >
                {organisation.name}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded border p-6">
          <h2 className="text-xl font-semibold">
            Create Party
          </h2>

          <form
            onSubmit={handleCreateParty}
            className="mt-4 grid gap-4 md:grid-cols-3"
          >
            <input
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              placeholder="Name"
              className="rounded border px-3 py-2"
              required
            />

            <select
              value={partyType}
              onChange={(event) =>
                setPartyType(
                  event.target.value as
                    | 'PERSON'
                    | 'ORGANISATION',
                )
              }
              className="rounded border px-3 py-2"
            >
              <option value="PERSON">
                Person
              </option>

              <option value="ORGANISATION">
                Organisation
              </option>
            </select>

            <button
              type="submit"
              className="rounded border px-4 py-2 font-medium"
            >
              Create Party
            </button>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded border p-6">
            <h2 className="text-xl font-semibold">
              Parties
            </h2>

            <div className="mt-4 space-y-2">
              {parties.length === 0 ? (
                <p className="text-gray-500">
                  No persistent parties yet.
                </p>
              ) : (
                parties.map((party) => (
                  <button
                    key={party.id}
                    type="button"
                    onClick={() =>
                      setSelectedPartyId(
                        party.id,
                      )
                    }
                    className={`block w-full rounded border p-3 text-left ${
                      party.id === selectedPartyId
                        ? 'font-semibold'
                        : ''
                    }`}
                  >
                    <div>
                      {party.displayName}
                    </div>

                    <div className="text-sm text-gray-500">
                      {party.type}
                    </div>

                    {party.roleAssignments.length >
                      0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Roles:{' '}
                        {party.roleAssignments
                          .map(
                            (assignment) =>
                              assignment.roleId,
                          )
                          .join(', ')}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded border p-6">
            <h2 className="text-xl font-semibold">
              Assign Role
            </h2>

            {!selectedParty ? (
              <p className="mt-4 text-gray-500">
                Select a party first.
              </p>
            ) : (
              <form
                onSubmit={handleAssignRole}
                className="mt-4 space-y-4"
              >
                <div>
                  <p className="font-medium">
                    {selectedParty.displayName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedParty.type}
                  </p>
                </div>

                <select
                  value={selectedRoleId}
                  onChange={(event) =>
                    setSelectedRoleId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded border px-3 py-2"
                >
                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="rounded border px-4 py-2 font-medium"
                >
                  Assign Role
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
