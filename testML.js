import { generateSpendingPredictions } from './mlEngine.js';

// Define a fake "Groceries" spending class with a clear pattern:
// Purchased roughly every 7 days for about 500
const testData = [
  {
    id: 1,
    className: "Groceries (Every ~7 Days)",
    purchaseDates: [
      { date: "2026-05-01", cost: 500 },
      { date: "2026-05-08", cost: 480 },
      { date: "2026-05-15", cost: 520 }
    ]
  },
  {
    id: 2,
    className: "Rent (Monthly)",
    purchaseDates: [
      { date: "2026-03-01", cost: 10000 },
      { date: "2026-04-01", cost: 10000 },
      { date: "2026-05-01", cost: 10000 }
    ]
  },
  {
    id: 3,
    className: "Not Enough Data (Should be skipped)",
    purchaseDates: [
      { date: "2026-05-01", cost: 100 }
    ]
  }
];

async function runTests() {
  console.log("=== Running ML Predictions Test ===");
  console.log("Input Data:");
  console.log(JSON.stringify(testData, null, 2));
  console.log("\n-----------------------------------\n");

  try {
    const predictions = await generateSpendingPredictions(testData);
    console.log("ML Engine Output:");
    console.log(JSON.stringify(predictions, null, 2));
    console.log("\n===================================");
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

runTests();
