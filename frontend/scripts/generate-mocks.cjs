const fs = require('fs');
const path = require('path');

const out = (p, data) => fs.writeFileSync(path.join(__dirname, '..', 'public', p), JSON.stringify(data, null, 2));

const genTenants = (n = 10) => {
  const t = {};
  for (let i = 1; i <= n; i++) {
    t[`tenant-${i}`] = {
      id: `tenant-${i}`,
      name: `顧問先${i}`,
      users: [
        { name: `担当 ${i}郎`, email: `tanto${i}@example.com` },
      ],
    };
  }
  return t;
};

const genClients = (count = 200, tenants = []) => {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const tenant = tenants[(i - 1) % tenants.length];
    arr.push({ id: `client-${i}`, name: `${tenant.name} クライアント${i}`, address: `住所 ${i}`, tenant_id: tenant.id });
  }
  return arr;
};

const genChats = (count = 500, clients = []) => {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const client = clients[(i - 1) % clients.length];
    arr.push({ id: `chat-${i}`, client_id: client.id, title: `${client.name} の相談 ${i}` });
  }
  return arr;
};

const genUsers = (tenants = [], staffPerTenant = 5) => {
  const me = { id: 'user-me', name: 'ログインユーザー', email: 'me@example.com', tenant_id: 'tenant-1' };
  const staff = [];
  let id = 2;
  for (const t of tenants) {
    for (let i = 0; i < staffPerTenant; i++) {
      staff.push({ id: `user-${id++}`, name: `担当 ${t.id}-${i+1}`, email: `user${id}@example.com`, tenant_id: t.id });
    }
  }
  return { me, staff };
};

const genDashboardRecords = (count = 300, tenants = []) => {
  const statuses = ['未承認', '作成中', '承認待ち', '承認済み'];
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const t = tenants[(i - 1) % tenants.length];
    const rec = {
      id: `br-${i}`,
      委嘱者名称: t.name,
      整理番号: `R-${1000 + i}`,
      処理年月日: new Date(Date.now() - i * 86400000).toISOString(),
      担当職員_氏名: `担当 ${Math.floor((i % 10) + 1)}郎`,
      ステータス: statuses[i % statuses.length],
      てん末: i % 10 === 0 ? '重要な指摘あり' : ''
    };
    arr.push(rec);
  }
  return arr;
};

(function () {
  const tenantsObj = genTenants(10);
  const tenants = Object.values(tenantsObj);
  out('mock-tenants.json', tenantsObj);

  const clients = genClients(200, tenants);
  out('mock-clients.json', clients);

  const chats = genChats(500, clients);
  out('mock-chats.json', chats);

  const users = genUsers(tenants, 6);
  out('mock-users.json', users);

  const dashboard = genDashboardRecords(400, tenants);
  out('dashboard-records.json', dashboard);

  console.log('Generated:');
  console.log('tenants:', tenants.length);
  console.log('clients:', clients.length);
  console.log('chats:', chats.length);
  console.log('users.staff:', users.staff.length);
  console.log('dashboard records:', dashboard.length);
})();
