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
  if (!item.purchaseDates || item.purchaseDates.length === 0) {
    return {
      hasData: false,
      calcMonthlyCost: (item.pricePerUnit || 0) * (item.units || 1),
      daysUntilNext: null
    };
  }

  const now = new Date();
  
  // 1. Get unique days for frequency calculation
  const uniqueDateStrings = [...new Set(item.purchaseDates.map(p => typeof p === 'string' ? p : p.date))];
  const uniqueDates = uniqueDateStrings
    .map(d => new Date(d))
    .sort((a, b) => a - b);
  
  let avgDays = 0;
  let daysUntilNext = null;
  let nextDate = null;

  if (uniqueDates.length >= 2) {
    const firstDate = uniqueDates[0];
    const lastDate = uniqueDates[uniqueDates.length - 1];
    const totalDaysSpan = Math.max(1, Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    avgDays = totalDaysSpan / (uniqueDates.length - 1);

    // Predict next purchase based on last date + avgDays
    nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + Math.round(avgDays));
    
    // Calculate days from today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDateOnly = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    daysUntilNext = Math.round((nextDateOnly - today) / (1000 * 60 * 60 * 24));
  }

  // 2. Calculate Total Cost and Monthly Projections
  let totalCost = 0;
  let entryCount = 0;
  for (const p of item.purchaseDates) {
    if (typeof p === 'object' && p.cost !== undefined) {
      totalCost += p.cost;
      entryCount++;
    } else if (typeof p === 'string') {
      const legacyCost = (item.pricePerUnit || 0) * (item.units || 1);
      totalCost += legacyCost;
      entryCount++;
    }
  }
  
  let calcMonthlyCost = totalCost;
  
  if (uniqueDates.length >= 2 && avgDays > 0) {
    const avgCostPerEntry = totalCost / entryCount;
    // Projection: (Average Cost per Purchase) * (Expected Purchases per Month)
    const expectedEntriesPerMonth = 30.44 / avgDays;
    calcMonthlyCost = avgCostPerEntry * expectedEntriesPerMonth;
  } else {
    // For single entries or very little data, just show the total for now
    calcMonthlyCost = totalCost;
  }

  return {
    hasData: uniqueDates.length >= 2,
    avgDays,
    nextDate,
    daysUntilNext,
    calcMonthlyCost,
    totalCost
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
  const ltv = (student.attendanceDates || []).length * student.price;

  return {
    hasData: true,
    avgDays,
    lessonsPerMonth,
    dailyIncome,
    monthlyProjection,
    ltv
  };
}
