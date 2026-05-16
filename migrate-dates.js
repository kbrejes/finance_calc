import fs from 'fs';

const dbPath = './db.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let migratedCount = 0;

if (data.spending) {
  data.spending = data.spending.map(item => {
    if (!item.purchaseDates) return item;
    
    item.purchaseDates = item.purchaseDates.map(d => {
      if (typeof d === 'string') {
        migratedCount++;
        return {
          date: d,
          cost: (item.pricePerUnit || 0) * (item.units || 1),
          account: item.account || 'none'
        };
      } else if (typeof d === 'object') {
        // Ensure all objects have cost and account set
        const cost = d.cost !== undefined ? d.cost : (item.pricePerUnit || 0) * (item.units || 1);
        const account = d.account || item.account || 'none';
        if (d.cost === undefined || !d.account) {
          migratedCount++;
        }
        return {
          ...d,
          cost,
          account
        };
      }
      return d;
    });
    return item;
  });
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log(`Migrated ${migratedCount} date entries to full objects.`);
