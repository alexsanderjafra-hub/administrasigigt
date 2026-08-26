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

// Helper to check if a record is a custody transfer (patty cash top-up from PT to person)
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

console.log('=== CALCULATION FOR JUNE 2026 ===');

// Let's find all June bank transfers that represent petty cash top-ups
const juneBankTopups = financialRecords.filter(r => r.date.startsWith('2026-06') && r.customId.startsWith('BNK-') && isCustodyTransfer(r));

console.log('\n--- JUNE BANK TOPUPS ---');
juneBankTopups.forEach(b => {
  console.log(`${b.customId} | ${b.date} | Recipient: ${b.rekPenerima} | Amount: ${b.amount} | Desc: ${b.description}`);
});

// Let's find all June personal spends that represent payments from petty cash (Sumber Uang is NOT REKENING PRIBADI, meaning it's REKENING PT)
const junePrsSpendsPT = financialRecords.filter(r => r.date.startsWith('2026-06') && r.customId.startsWith('PRS-') && r.sumberDana !== 'REKENING PRIBADI');

console.log('\n--- JUNE PRS SPENDS (FROM REKENING PT) ---');
junePrsSpendsPT.forEach(s => {
  console.log(`${s.customId} | ${s.date} | Holder: ${s.personalHolder} | Amount: ${s.amount} | RefBank: ${s.refIdBank} | Desc: ${s.description}`);
});

// Now let's calculate totals for June by person!
const summary = {};

// We can look at how bank topups are distributed
juneBankTopups.forEach(b => {
  const recipient = b.rekPenerima || 'Unknown';
  let name = 'Other';
  if (recipient.toLowerCase().includes('jidan')) name = 'Jidan Ramadhan';
  else if (recipient.toLowerCase().includes('faisal')) name = 'Faisal Mustopa';
  else if (recipient.toLowerCase().includes('yasin')) name = 'Muhammad Yasin';
  else name = recipient;

  if (!summary[name]) {
    summary[name] = { received: 0, spent: 0 };
  }
  summary[name].received += b.amount;
});

// We can look at how spends from PT account are distributed
junePrsSpendsPT.forEach(s => {
  const holder = s.personalHolder || 'Unknown';
  let name = 'Other';
  if (holder.toLowerCase().includes('jidan')) name = 'Jidan Ramadhan';
  else if (holder.toLowerCase().includes('faisal')) name = 'Faisal Mustopa';
  else if (holder.toLowerCase().includes('yasin')) name = 'Muhammad Yasin';
  else name = holder;

  // Wait, let's also look at refIdBank to trace the original person if holder doesn't match or to be precise!
  if (s.refIdBank) {
    const b = financialRecords.find(rec => rec.customId === s.refIdBank);
    if (b) {
      const bRecipient = b.rekPenerima || '';
      let bName = 'Other';
      if (bRecipient.toLowerCase().includes('jidan')) bName = 'Jidan Ramadhan';
      else if (bRecipient.toLowerCase().includes('faisal')) bName = 'Faisal Mustopa';
      else if (bRecipient.toLowerCase().includes('yasin')) bName = 'Muhammad Yasin';
      else bName = bRecipient;
      
      // We attribute the spend to the bank transfer's recipient (the one who got the cash)!
      name = bName;
    }
  }

  if (!summary[name]) {
    summary[name] = { received: 0, spent: 0 };
  }
  summary[name].spent += s.amount;
});

console.log('\n--- JUNE SUMMARY BY PERSONNEL ---');
for (const [name, data] of Object.entries(summary)) {
  console.log(`${name} | Received: ${data.received} | Spent: ${data.spent} | Balance: ${data.received - data.spent}`);
}
