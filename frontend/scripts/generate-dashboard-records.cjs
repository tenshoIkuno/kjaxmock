const fs = require('fs');
const path = require('path');

const FRONT = path.resolve(__dirname, '..');
const CLIENTS_PATH = path.join(FRONT, 'public', 'mock-clients.json');
const USERS_PATH = path.join(FRONT, 'public', 'mock-users.json');
const OUT_PATH = path.join(FRONT, 'public', 'dashboard-records.json');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const clients = readJSON(CLIENTS_PATH);
const users = readJSON(USERS_PATH);

// build users by tenant map (use staff array if exists)
const staff = Array.isArray(users.staff) ? users.staff : [];
const usersByTenant = {};
for (const u of staff) {
  if (!usersByTenant[u.tenant_id]) usersByTenant[u.tenant_id] = [];
  usersByTenant[u.tenant_id].push(u.name);
}

// statuses and weights (to create realistic spread)
const statuses = [
  { key: '承認済み', weight: 45 },
  { key: '承認待ち', weight: 30 },
  { key: '作成中', weight: 45 },
  { key: '未承認', weight: 20 }
];

function weightedPick(arr) {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const a of arr) {
    if (r < a.weight) return a.key;
    r -= a.weight;
  }
  return arr[arr.length - 1].key;
}

function randomDateWithinDays(days) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * days * 24 * 3600 * 1000);
  return new Date(past).toISOString();
}

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// small pool of summary texts
const notes = [
  '資料未提出',
  '軽微な修正のみ',
  '重要な指摘あり',
  '確認中',
  '売上計上の取り扱いについて再確認要',
  '領収書の不足あり、確認中',
  '在庫評価の差異あり',
  '入金データの突合が未完了',
  '追加資料要請中',
  '帳票不足'
];

// build candidate records
const out = [];
const TARGET = 200;
for (let i = 0; i < TARGET; i++) {
  const client = sample(clients);
  const tenantId = client.tenant_id || 'tenant-1';
  const possibleStaff = usersByTenant[tenantId] || [];
  const staffName = possibleStaff.length ? sample(possibleStaff) : (users.me && users.me.name) || '未割当';
  const needsEscalation = Math.random() < 0.08; // ~8% of records require escalation
  const escalationLevels = ['low','medium','high'];
  const rec = {
    id: `br-${String(1000 + i)}`,
    委嘱者名称: client.name,
    整理番号: `R-${2000 + i}`,
    処理年月日: randomDateWithinDays(180),
    担当職員_氏名: staffName,
    ステータス: weightedPick(statuses),
    てん末: Math.random() < 0.12 ? sample(notes) : '特になし',
    tenant_id: tenantId
  };
  // attach AI analysis summary
  rec.ai_analysis = {
    profitability_score: Math.round(Math.random() * 100),
    customer_rank: sample(['A','B','C']),
    notes: Math.random() < 0.18 ? sample(notes) : ''
  };
  if (needsEscalation) {
    rec.escalation = {
      level: sample(escalationLevels),
      urgent: Math.random() < 0.5,
      resolved: Math.random() < 0.25 ? true : false,
      created_at: new Date().toISOString(),
      history: [
        { by: staffName, at: new Date().toISOString(), note: '自動検出によるエスカレーション' }
      ]
    };
  }
  out.push(rec);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf-8');
console.log(`Wrote ${out.length} records to ${OUT_PATH}`);
