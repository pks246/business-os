'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  Organisation,
  OrganisationPartyRolePolicy,
} from '@/lib/types';

export default function PartyRolePoliciesPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState('');
  const [policies, setPolicies] = useState<OrganisationPartyRolePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadPolicies(organisationId: string) {
    const result = await apiFetch<OrganisationPartyRolePolicy[]>(
      `/organisations/${organisationId}/party-role-policies`,
    );

    setPolicies(result);
  }

  useEffect(() => {
    void (async () => {
      try {
        const result = await apiFetch<Organisation[]>('/organisations');
        setOrganisations(result);

        if (result.length > 0) {
          setSelectedOrganisationId(result[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organisations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedOrganisationId) {
      setPolicies([]);
      return;
    }

    void (async () => {
      try {
        setError('');
        setMessage('');
        await loadPolicies(selectedOrganisationId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load role policies');
      }
    })();
  }, [selectedOrganisationId]);

  function updateDraft(
    roleId: string,
    changes: Partial<OrganisationPartyRolePolicy>,
  ) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === roleId ? { ...policy, ...changes } : policy,
      ),
    );
  }

  async function savePolicy(policy: OrganisationPartyRolePolicy) {
    if (!selectedOrganisationId) {
      return;
    }

    setSavingRoleId(policy.id);
    setError('');
    setMessage('');

    try {
      await apiFetch(
        `/organisations/${selectedOrganisationId}/party-role-policies/${policy.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            enabled: policy.enabled,
            captureMode: policy.captureMode,
            ...(policy.settings !== null ? { settings: policy.settings } : {}),
          }),
        },
      );

      await loadPolicies(selectedOrganisationId);
      setMessage(`Saved policy for ${policy.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setSavingRoleId(null);
    }
  }

  if (loading) {
    return <main className="p-8">Loading BusinessOS...</main>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium">BusinessOS</p>
          <h1 className="mt-2 text-3xl font-bold">Party Role Policies</h1>
          <p className="mt-2 text-gray-600">
            Configure which roles a business uses and whether their
            workflows require persistent identity.
          </p>
          <nav className="mt-4 flex gap-4 text-sm underline">
            <a href="/">Control Center</a>
            <a href="/parties">Parties</a>
          </nav>
        </header>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}

        <section className="rounded border p-6">
          <label htmlFor="organisation" className="block font-medium">
            Business
          </label>
          <select
            id="organisation"
            value={selectedOrganisationId}
            onChange={(event) => setSelectedOrganisationId(event.target.value)}
            className="mt-2 rounded border px-3 py-2"
          >
            {organisations.map((organisation) => (
              <option key={organisation.id} value={organisation.id}>
                {organisation.name}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-4">
          {policies.map((policy) => (
            <article key={policy.id} className="rounded border p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold">{policy.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {policy.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Current source: {policy.source}
                  </p>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={policy.enabled}
                    onChange={(event) =>
                      updateDraft(policy.id, { enabled: event.target.checked })
                    }
                  />
                  Enabled
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <label className="block text-sm">
                  Persistent identity requirement
                  <select
                    value={policy.captureMode}
                    onChange={(event) =>
                      updateDraft(policy.id, {
                        captureMode: event.target.value as 'optional' | 'required',
                      })
                    }
                    className="mt-1 block rounded border px-3 py-2"
                  >
                    <option value="optional">
                      Optional — anonymous activity can be allowed
                    </option>
                    <option value="required">
                      Required — persistent Party required
                    </option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => void savePolicy(policy)}
                  disabled={savingRoleId === policy.id}
                  className="rounded border px-4 py-2 font-medium"
                >
                  {savingRoleId === policy.id ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </article>
          ))}
        </section>

        <p className="text-sm text-gray-500">
          These settings define policy. Transaction workflows will enforce
          the capture requirement when those workflows are implemented.
        </p>
      </div>
    </main>
  );
}