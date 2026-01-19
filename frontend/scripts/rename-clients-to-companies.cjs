const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'mock-clients.json');
const raw = fs.readFileSync(file, 'utf8');
const clients = JSON.parse(raw);

const companyTemplates = [
  '株式会社サンプル',
  '株式会社テック',
  '合同会社フロー',
  '株式会社ミナト',
  '株式会社ノース',
  '株式会社サウス',
  '株式会社グリーン',
  '株式会社レッド',
  '株式会社ブルー',
  '株式会社京橋',
  '株式会社中之島',
  '株式会社福岡',
  '合同会社横浜',
  '株式会社名古屋',
  '株式会社札幌',
];

for (let i = 0; i < clients.length; i++) {
  const base = companyTemplates[i % companyTemplates.length];
  clients[i].name = `${base}${i + 1}`;
}

fs.writeFileSync(file, JSON.stringify(clients, null, 2), 'utf8');
console.log('Renamed', clients.length, 'clients to company-style names.');
