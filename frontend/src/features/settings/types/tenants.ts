export type TenantUser = {
  name: string;
  email: string;
};

export type TenantInfo = {
  id: string;
  name: string;
  users: TenantUser[];
};
