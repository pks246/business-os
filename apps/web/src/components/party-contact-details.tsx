'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  PartyAddress,
  PartyContactMethod,
} from '@/lib/types';

interface PartyContactDetailsProps {
  organisationId: string;
  partyId: string;
}

export function PartyContactDetails({
  organisationId,
  partyId,
}: PartyContactDetailsProps) {
  const [contactMethods, setContactMethods] =
    useState<PartyContactMethod[]>([]);

  const [addresses, setAddresses] =
    useState<PartyAddress[]>([]);

  const [channel, setChannel] = useState('email');
  const [contactValue, setContactValue] =
    useState('');

  const [addressType, setAddressType] =
    useState('business');

  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] =
    useState('');
  const [countryCode, setCountryCode] =
    useState('AU');

  const [error, setError] = useState('');

  const loadDetails = useCallback(async () => {
    const [contactData, addressData] =
      await Promise.all([
        apiFetch<PartyContactMethod[]>(
          `/organisations/${organisationId}/parties/${partyId}/contact-methods`,
        ),
        apiFetch<PartyAddress[]>(
          `/organisations/${organisationId}/parties/${partyId}/addresses`,
        ),
      ]);

    setContactMethods(contactData);
    setAddresses(addressData);
  }, [organisationId, partyId]);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        await loadDetails();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load contact details',
        );
      }
    })();
  }, [loadDetails]);

  async function handleCreateContactMethod(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError('');

      await apiFetch(
        `/organisations/${organisationId}/parties/${partyId}/contact-methods`,
        {
          method: 'POST',
          body: JSON.stringify({
            channel,
            value: contactValue,
          }),
        },
      );

      setContactValue('');
      await loadDetails();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create contact method',
      );
    }
  }

  async function handleCreateAddress(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError('');

      await apiFetch(
        `/organisations/${organisationId}/parties/${partyId}/addresses`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: addressType,
            line1,
            city,
            state: state || undefined,
            postalCode: postalCode || undefined,
            countryCode,
          }),
        },
      );

      setLine1('');
      setCity('');
      setState('');
      setPostalCode('');

      await loadDetails();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create address',
      );
    }
  }

  async function removeContactMethod(
    id: string,
  ) {
    try {
      setError('');

      await apiFetch(
        `/organisations/${organisationId}/parties/${partyId}/contact-methods/${id}`,
        {
          method: 'DELETE',
        },
      );

      await loadDetails();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove contact method',
      );
    }
  }

  async function removeAddress(id: string) {
    try {
      setError('');

      await apiFetch(
        `/organisations/${organisationId}/parties/${partyId}/addresses/${id}`,
        {
          method: 'DELETE',
        },
      );

      await loadDetails();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove address',
      );
    }
  }

  return (
    <section className="space-y-6 rounded border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Contact Details
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Optional persistent contact information for
          this party.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <h3 className="font-semibold">
          Contact Methods
        </h3>

        <div className="mt-3 space-y-2">
          {contactMethods.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">
                  {contact.channel}
                </div>

                <div className="text-sm text-gray-600">
                  {contact.value}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  removeContactMethod(
                    contact.id,
                  )
                }
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleCreateContactMethod}
          className="mt-4 grid gap-3 md:grid-cols-3"
        >
          <select
            value={channel}
            onChange={(event) =>
              setChannel(event.target.value)
            }
            className="rounded border px-3 py-2"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          <input
            value={contactValue}
            onChange={(event) =>
              setContactValue(event.target.value)
            }
            placeholder="Contact value"
            className="rounded border px-3 py-2"
            required
          />

          <button
            type="submit"
            className="rounded border px-4 py-2 font-medium"
          >
            Add Contact
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-semibold">
          Addresses
        </h3>

        <div className="mt-3 space-y-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">
                  {address.type}
                </div>

                <div className="text-sm text-gray-600">
                  {address.line1}, {address.city}
                  {address.state
                    ? `, ${address.state}`
                    : ''}
                  {address.postalCode
                    ? ` ${address.postalCode}`
                    : ''}
                  , {address.countryCode}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  removeAddress(address.id)
                }
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleCreateAddress}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <select
            value={addressType}
            onChange={(event) =>
              setAddressType(event.target.value)
            }
            className="rounded border px-3 py-2"
          >
            <option value="business">
              Business
            </option>
            <option value="residential">
              Residential
            </option>
            <option value="billing">
              Billing
            </option>
            <option value="shipping">
              Shipping
            </option>
          </select>

          <input
            value={countryCode}
            onChange={(event) =>
              setCountryCode(
                event.target.value.toUpperCase(),
              )
            }
            maxLength={2}
            className="rounded border px-3 py-2"
            placeholder="AU"
            required
          />

          <input
            value={line1}
            onChange={(event) =>
              setLine1(event.target.value)
            }
            placeholder="Address line"
            className="rounded border px-3 py-2 md:col-span-2"
            required
          />

          <input
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            placeholder="City"
            className="rounded border px-3 py-2"
            required
          />

          <input
            value={state}
            onChange={(event) =>
              setState(event.target.value)
            }
            placeholder="State"
            className="rounded border px-3 py-2"
          />

          <input
            value={postalCode}
            onChange={(event) =>
              setPostalCode(event.target.value)
            }
            placeholder="Postal code"
            className="rounded border px-3 py-2"
          />

          <button
            type="submit"
            className="rounded border px-4 py-2 font-medium"
          >
            Add Address
          </button>
        </form>
      </div>
    </section>
  );
}
