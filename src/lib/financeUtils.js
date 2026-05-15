const CURRENCY = '฿';
const WEEKS_PER_MONTH = 4.33;

export function formatNum(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function getCalculatedSpendingMetrics(item) {
  if (!item.purchaseDates || item.purchaseDates.length < 2) {
    return {
      hasData: false,
      calcMonthlyCost: (item.pricePerUnit || 0) * (item.units || 1),
      daysUntilNext: null
    };
  }

  const now = new Date();
  // Sort dates oldest to newest
  const dates = item.purchaseDates
    .map(p => new Date(typeof p === 'string' ? p : p.date))
    .sort((a, b) => a - b);
  
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const totalDaysSpan = Math.max(1, Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const avgDays = totalDaysSpan / (dates.length - 1);

  // Predict next purchase based on last date + avgDays
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + Math.round(avgDays));
  
  // Calculate days from today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDateOnly = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  const daysUntilNext = Math.round((nextDateOnly - today) / (1000 * 60 * 60 * 24));

  const calcMonthlyUnits = 30.44 / avgDays;

  let totalCost = 0;
  let count = 0;
  for (const p of item.purchaseDates) {
    if (typeof p === 'object' && p.cost !== undefined) {
      totalCost += p.cost;
      count++;
    }
  }
  
  const avgCostPerPurchase = count > 0 ? (totalCost / count) : (item.pricePerUnit || 0);
  const calcMonthlyCost = calcMonthlyUnits * avgCostPerPurchase;

  return {
    hasData: true,
    avgDays,
    nextDate,
    daysUntilNext,
    calcMonthlyUnits,
    calcMonthlyCost,
    avgCostPerPurchase
  };
}

export function getCalculatedStudentMetrics(student) {
  if (!student.attendanceDates || student.attendanceDates.length < 2) {
    return {
      hasData: false,
      avgDays: null,
      lessonsPerMonth: 0,
      dailyIncome: 0,
      monthlyProjection: 0
    };
  }

  const dates = student.attendanceDates
    .map(d => new Date(typeof d === 'string' ? d : d.date))
    .sort((a, b) => a - b);

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const totalDaysSpan = Math.max(1, Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  
  const avgDays = totalDaysSpan / (dates.length - 1);
  const lessonsPerMonth = 30.44 / avgDays;
  const dailyIncome = student.price / avgDays;
  const monthlyProjection = student.price * lessonsPerMonth;

  return {
    hasData: true,
    avgDays,
    lessonsPerMonth,
    dailyIncome,
    monthlyProjection
  };
}
