export type ClientState = {
  currentClientId: string | null;
  currentClientName?: string | null;
  selectClient: (clientId: string | null) => void;
  selectClientName?: (name: string | null) => void;
};

export type ClientFormProps = {
  mode: 'create' | 'edit' | null;
  defaultValues?: Client;
  onClose: () => void;
};

export type Client = {
  id: string;
  name: string;
  created_at: string;
};

export type CreateClientPayload = {
  name: string;
};

export type ClientUpdatePayload = {
  name?: string;
};
