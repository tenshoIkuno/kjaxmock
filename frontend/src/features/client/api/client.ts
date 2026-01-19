import { readTable, createRecord, updateRecord, deleteRecord } from '@/common/api/mockBackend';
import type {
  Client,
  ClientUpdatePayload,
  CreateClientPayload,
} from '@/features/client/types/clientTypes';

// --- クライアント一覧取得 ---
export const getClients = async (): Promise<Client[]> => {
  const clients = await readTable<Client[]>('clients', '/mock-clients.json');
  // try to load profiles and merge into client object when available
  try {
    const profiles = await readTable<any[]>('client_profiles', '/mock-client-profiles.json');
    const contacts = await readTable<any[]>('client_contacts', '/mock-client-contacts.json');
    const engagements = await readTable<any[]>('client_engagements', '/mock-client-engagements.json');
    const owners = await readTable<any[]>('owner_profiles', '/mock-owner-profiles.json');

    const profilesByClient: Record<string, any> = {};
    profiles.forEach((p) => {
      if (p.client_id) profilesByClient[p.client_id] = p;
    });

    const contactsByClient: Record<string, any[]> = {};
    contacts.forEach((c) => {
      if (c.profile_id && c.profile_id.startsWith('profile-')) {
        // try to map by profile_id -> find profile -> client
        const prof = profiles.find((p) => p.id === c.profile_id);
        if (prof && prof.client_id) {
          contactsByClient[prof.client_id] = contactsByClient[prof.client_id] || [];
          contactsByClient[prof.client_id].push(c);
        }
      }
      if (c.client_id) {
        contactsByClient[c.client_id] = contactsByClient[c.client_id] || [];
        if (!contactsByClient[c.client_id].includes(c)) contactsByClient[c.client_id].push(c);
      }
    });

    const engagementsByClient: Record<string, any[]> = {};
    engagements.forEach((e) => {
      if (e.client_id) {
        engagementsByClient[e.client_id] = engagementsByClient[e.client_id] || [];
        engagementsByClient[e.client_id].push(e);
      }
    });

    const ownersByClient: Record<string, any[]> = {};
    owners.forEach((o) => {
      if (o.client_id) {
        ownersByClient[o.client_id] = ownersByClient[o.client_id] || [];
        ownersByClient[o.client_id].push(o);
      }
    });

    return clients.map((c) => ({
      ...(c as any),
      ...(profilesByClient[c.id] ?? {}),
      contacts: contactsByClient[c.id] ?? [],
      engagements: engagementsByClient[c.id] ?? [],
      owners: ownersByClient[c.id] ?? [],
    }));
  } catch (e) {
    return clients;
  }
};

// --- クライアント作成 ---
export const createClient = async (
  payload: CreateClientPayload,
): Promise<Client> => {
  return createRecord<Client>('clients', '/mock-clients.json', payload as any);
};

// --- クライアント更新 ---
export const updateClient = async ({
  clientId,
  payload,
}: {
  clientId: string;
  payload: ClientUpdatePayload;
}): Promise<Client> => {
  // separate payload into client-level fields and profile-level fields
  const profileKeys = new Set([
    'established',
    'client_type',
    'industry_category_major',
    'industry_category_minor',
    'corporate_num',
    'invoice_num',
    'fiscal_end_day',
    'tax_office_code',
    'tax_office_name',
    'note',
    'contacts_id',
  ]);

  const clientPatch: Record<string, any> = {};
  const profilePatch: Record<string, any> = {};

  Object.keys(payload as any).forEach((k) => {
    if (profileKeys.has(k)) profilePatch[k] = (payload as any)[k];
    else clientPatch[k] = (payload as any)[k];
  });

  // update clients table for client-level fields
  let updatedClient = null as any;
  if (Object.keys(clientPatch).length > 0) {
    updatedClient = await updateRecord<Client>('clients', '/mock-clients.json', clientId, clientPatch as any);
  } else {
    // read existing client to return later
    const clients = await readTable<Client[]>('clients', '/mock-clients.json');
    updatedClient = clients.find((c) => c.id === clientId) as any;
  }

  // update or create profile record when profile fields provided
  if (Object.keys(profilePatch).length > 0) {
    const profiles = await readTable<any[]>('client_profiles', '/mock-client-profiles.json');
    const existing = profiles.find((p) => p.client_id === clientId);
    if (existing) {
      await updateRecord<any>('client_profiles', '/mock-client-profiles.json', existing.id, { ...existing, ...profilePatch });
    } else {
      await createRecord<any>('client_profiles', '/mock-client-profiles.json', { client_id: clientId, ...profilePatch });
    }
  }

  // handle contacts payload (array of contact objects)
  if ((payload as any).contacts) {
    const contacts = await readTable<any[]>('client_contacts', '/mock-client-contacts.json');
    for (const c of (payload as any).contacts) {
      if (c.id) {
        const existing = contacts.find((x) => x.id === c.id);
        if (existing) {
          await updateRecord<any>('client_contacts', '/mock-client-contacts.json', c.id, { ...existing, ...c });
        }
      } else {
        await createRecord<any>('client_contacts', '/mock-client-contacts.json', { client_id: clientId, profile_id: (c.profile_id ?? null), ...c });
      }
    }
  }

  // handle engagements payload (array)
  if ((payload as any).engagements) {
    const engagementsTable = await readTable<any[]>('client_engagements', '/mock-client-engagements.json');
    for (const e of (payload as any).engagements) {
      if (e.id) {
        const existing = engagementsTable.find((x) => x.id === e.id);
        if (existing) await updateRecord<any>('client_engagements', '/mock-client-engagements.json', e.id, { ...existing, ...e });
      } else {
        await createRecord<any>('client_engagements', '/mock-client-engagements.json', { client_id: clientId, ...e });
      }
    }
  }

  // handle owner profiles payload (array)
  if ((payload as any).owners) {
    const ownersTable = await readTable<any[]>('owner_profiles', '/mock-owner-profiles.json');
    for (const o of (payload as any).owners) {
      if (o.id) {
        const existing = ownersTable.find((x) => x.id === o.id);
        if (existing) await updateRecord<any>('owner_profiles', '/mock-owner-profiles.json', o.id, { ...existing, ...o });
      } else {
        await createRecord<any>('owner_profiles', '/mock-owner-profiles.json', { client_id: clientId, ...o });
      }
    }
  }

  // merge latest profile into returned client
  try {
    const profiles = await readTable<any[]>('client_profiles', '/mock-client-profiles.json');
    const profile = profiles.find((p) => p.client_id === clientId);
    return { ...(updatedClient ?? {}), ...(profile ?? {}) } as Client;
  } catch (e) {
    return updatedClient as Client;
  }
};

// --- クライアント削除 ---
export const deleteClient = async (clientId: string): Promise<Client> => {
  return deleteRecord<Client>('clients', '/mock-clients.json', clientId);
};
