'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  AvailableOrganisationModule,
  BusinessTemplate,
  Organisation,
} from '@/lib/types';

export default function Home() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [templates, setTemplates] = useState<BusinessTemplate[]>([]);
  const [moduleData, setModuleData] = useState<{
    organisationId: string;
    modules: AvailableOrganisationModule[];
  } | null>(null);

  const [selectedOrganisationId, setSelectedOrganisationId] =
    useState('');

  const [organisationName, setOrganisationName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingModuleId, setSavingModuleId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [organisationData, templateData] = await Promise.all([
          apiFetch<Organisation[]>('/organisations'),
          apiFetch<BusinessTemplate[]>('/templates'),
        ]);

        setOrganisations(organisationData);
        setTemplates(templateData);

        if (templateData.length > 0) {
          setSelectedTemplateId(templateData[0].id);
        }

        if (organisationData.length > 0) {
          setSelectedOrganisationId(organisationData[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load BusinessOS',
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
        const data = await apiFetch<
          AvailableOrganisationModule[]
        >(
          `/organisations/${selectedOrganisationId}/modules`,
        );

        if (active) {
          setModuleData({
            organisationId: selectedOrganisationId,
            modules: data,
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load modules',
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedOrganisationId]);

  async function handleCreateOrganisation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');

    try {
      const organisation = await apiFetch<Organisation>(
        '/organisations',
        {
          method: 'POST',
          body: JSON.stringify({
            name: organisationName,
            templateId: selectedTemplateId,
          }),
        },
      );

      const updatedOrganisations = await apiFetch<Organisation[]>(
        '/organisations',
      );

      setOrganisations(updatedOrganisations);
      setSelectedOrganisationId(organisation.id);
      setOrganisationName('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create organisation',
      );
    }
  }

  async function handleToggleModule(
    module: AvailableOrganisationModule,
  ) {
    if (!selectedOrganisationId) {
      return;
    }

    const organisationId = selectedOrganisationId;
    setSavingModuleId(module.id);
    setError('');

    try {
      await apiFetch(
        `/organisations/${organisationId}/modules/${module.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            enabled: !module.enabled,
          }),
        },
      );

      const updatedModules = await apiFetch<
        AvailableOrganisationModule[]
      >(
        `/organisations/${organisationId}/modules`,
      );

      setModuleData({
        organisationId,
        modules: updatedModules,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update module',
      );
    } finally {
      setSavingModuleId(null);
    }
  }

  const modules =
    moduleData?.organisationId === selectedOrganisationId
      ? moduleData.modules
      : [];

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading BusinessOS...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-medium">
            BusinessOS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Control Center
          </h1>

          <p className="mt-2 text-gray-600">
            Create businesses from reusable templates and
            configure their capabilities.
          </p>
        </header>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="rounded border p-6">
          <h2 className="text-xl font-semibold">
            Create Organisation
          </h2>

          <form
            onSubmit={handleCreateOrganisation}
            className="mt-4 grid gap-4 md:grid-cols-3"
          >
            <input
              value={organisationName}
              onChange={(event) =>
                setOrganisationName(event.target.value)
              }
              placeholder="Business name"
              className="rounded border px-3 py-2"
              required
            />

            <select
              value={selectedTemplateId}
              onChange={(event) =>
                setSelectedTemplateId(event.target.value)
              }
              className="rounded border px-3 py-2"
              required
            >
              {templates.map((template) => (
                <option
                  key={template.id}
                  value={template.id}
                >
                  {template.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded border px-4 py-2 font-medium"
            >
              Create Business
            </button>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded border p-6">
            <h2 className="text-xl font-semibold">
              Organisations
            </h2>

            <div className="mt-4 space-y-2">
              {organisations.length === 0 ? (
                <p className="text-gray-500">
                  No organisations yet.
                </p>
              ) : (
                organisations.map((organisation) => (
                  <button
                    key={organisation.id}
                    type="button"
                    onClick={() =>
                      setSelectedOrganisationId(
                        organisation.id,
                      )
                    }
                    className={`block w-full rounded border p-3 text-left ${
                      selectedOrganisationId ===
                      organisation.id
                        ? 'font-semibold'
                        : ''
                    }`}
                  >
                    <div>{organisation.name}</div>
                    <div className="text-sm text-gray-500">
                      {organisation.templateId}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded border p-6 md:col-span-2">
            <h2 className="text-xl font-semibold">
              Modules
            </h2>

            {!selectedOrganisationId ? (
              <p className="mt-4 text-gray-500">
                Select an organisation.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded border p-4"
                  >
                    <div>
                      <div className="font-medium">
                        {module.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {module.description}
                      </div>

                      {module.dependencies.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          Requires:{' '}
                          {module.dependencies.join(', ')}
                        </div>
                      )}

                      {module.settings &&
                        Object.keys(module.settings).length >
                          0 && (
                          <pre className="mt-2 overflow-auto text-xs">
                            {JSON.stringify(
                              module.settings,
                              null,
                              2,
                            )}
                          </pre>
                        )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        savingModuleId === module.id
                      }
                      onClick={() =>
                        handleToggleModule(module)
                      }
                      className="rounded border px-4 py-2"
                    >
                      {module.enabled
                        ? 'Enabled'
                        : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
