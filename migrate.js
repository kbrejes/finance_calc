const fs = require('fs');
const dbPath = './db.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (data.spending) {
  data.spending = data.spending.map(item => {
    // If already migrated, skip
    if (item.className) return item;
    
    return {
      id: item.id,
      className: item.item,
      category: item.category,
      isEssential: true, // Mark all existing as essential
      instanceName: item.item, // Temporary copy
      pricePerUnit: item.pricePerUnit,
      units: item.units,
      purchaseDates: item.purchaseDates || []
    };
  });
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Migration complete.');
