const fs = require('fs');

const content = fs.readFileSync('seed_july_complete.ts', 'utf-8');
const startIdx = content.indexOf('const financialRecords = [');
const endIdx = content.indexOf('];', startIdx);
const recordsStr = content.substring(startIdx + 'const financialRecords = ['.length, endIdx);

const jsCode = `
const financialRecords = [ ${recordsStr} ];
module.exports = financialRecords;
`;

const tempFile = 'temp_records.cjs';
fs.writeFileSync(tempFile, jsCode);

const financialRecords = require('./' + tempFile);
fs.unlinkSync(tempFile);

function isCustodyTransfer(r) {
  if (r.flowType === 'OUT_PERSONAL_TRANSFER') return true;
  const catUpper = (r.category || '').toUpperCase();
  const isPattyCash =
    catUpper === 'PATTY CASH' ||
    catUpper === 'PATTYCASH' ||
    catUpper === 'KAS KECIL' ||
    catUpper === 'PETTY CASH' ||
    catUpper === 'PETTYCASH' ||
    catUpper === 'PATTYCASH PROYEK';
  return isPattyCash && r.flowType !== 'OUT_PERSONAL_SPEND';
}

const bankTransfers = financialRecords.filter(r => r.customId.startsWith('BNK-') && isCustodyTransfer(r));
const prsSpends = financialRecords.filter(r => r.customId.startsWith('PRS-') && r.sumberDana !== 'REKENING PRIBADI');

const holdersMap = {};

function normalizeName(name) {
  if (!name) return 'Other';
  const n = name.toLowerCase();
  if (n.includes('jidan')) return 'Jidan Ramadhan';
  if (n.includes('faisal')) return 'Faisal Mustopa (Admin)';
  if (n.includes('yasin')) return 'Muhammad Yasin';
  return name;
}

// Initialize holders map from June + July bank transfers
bankTransfers.forEach(b => {
  const recipient = b.rekPenerima || b.personalHolder || 'Other';
  const normName = normalizeName(recipient);
  if (!holdersMap[normName]) {
    holdersMap[normName] = { name: normName, receivedJune: 0, receivedJuly: 0, spentJune: 0, spentJuly: 0 };
  }
  if (b.date.startsWith('2026-06')) {
    holdersMap[normName].receivedJune += b.amount;
  } else {
    holdersMap[normName].receivedJuly += b.amount;
  }
});

// Attribute PRS spends
prsSpends.forEach(s => {
  let recipient = s.personalHolder || 'Other';
  
  // If there is refIdBank, we look up the bank transfer recipient
  if (s.refIdBank) {
    const b = bankTransfers.find(rec => rec.customId === s.refIdBank);
    if (b) {
      recipient = b.rekPenerima || b.personalHolder || 'Other';
    }
  }
  
  const normName = normalizeName(recipient);
  if (!holdersMap[normName]) {
    holdersMap[normName] = { name: normName, receivedJune: 0, receivedJuly: 0, spentJune: 0, spentJuly: 0 };
  }
  
  if (s.date.startsWith('2026-06')) {
    holdersMap[normName].spentJune += s.amount;
  } else {
    holdersMap[normName].spentJuly += s.amount;
  }
});

console.log('=== PRECISE PATTY CASH FLOWS BY PERSONNEL (JUNE + JULY) ===');
Object.values(holdersMap).forEach(h => {
  const totalReceived = h.receivedJune + h.receivedJuly;
  const totalSpent = h.spentJune + h.spentJuly;
  const balance = totalReceived - totalSpent;
  console.log(`\nPersonnel: ${h.name}`);
  console.log(`- JUNE: Received: ${h.receivedJune} | Spent: ${h.spentJune} | Balance: ${h.receivedJune - h.spentJune}`);
  console.log(`- JULY: Received: ${h.receivedJuly} | Spent: ${h.spentJuly} | Balance: ${h.receivedJuly - h.spentJuly}`);
  console.log(`- TOTAL: Received: ${totalReceived} | Spent: ${totalSpent} | Sisa: ${balance}`);
});
