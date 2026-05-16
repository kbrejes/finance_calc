import fs from 'fs';
import { calculateDashboardStats } from './src/lib/financeUtils.js';

// Load mock data
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

// Mock ML predictions
const mlPredictions = {
  "1": {
    "className": "Groceries",
    "predictedNextDate": "2026-05-20",
    "predictedDaysUntilNext": 4,
    "predictedNextAmount": 1500,
    "confidenceScore": "Moderate"
  }
};

const stats = calculateDashboardStats({
  students: db.students || [],
  spending: db.spending || [],
  assets: db.assets || { financial: [] },
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  daysInMonth: 31, // May
  mlPredictions
});

console.log("=== Verification of Chart Logic ===");
console.log("Labels Array Length:", stats.labels.length);
console.log("Labels Sample (End):", stats.labels.slice(-5));
console.log("Cumulative Spending (Past):", stats.chartCumulativeSpending.slice(12, 18));
console.log("Projected Spending (Future):", stats.chartProjectedSpending.slice(12, 22));

const todayIndex = new Date().getDate() - 1;
console.log(`\nToday Index: ${todayIndex} (${stats.labels[todayIndex]})`);
console.log(`Past Spending at Today: ${stats.chartCumulativeSpending[todayIndex]}`);
console.log(`Projected Spending at Today: ${stats.chartProjectedSpending[todayIndex]}`);
console.log(`Projected Spending 5 Days from Today: ${stats.chartProjectedSpending[todayIndex + 5]}`);
