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
  const uniqueDateStrings = [...new Set(item.purchaseDates.map(p => p.date))];
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
  let entryCount = item.purchaseDates.length;
  for (const p of item.purchaseDates) {
    totalCost += (p.cost || 0);
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
  const attendanceCount = (student.attendanceDates || []).length;
  const lessonPrice = student.price || 0;
  const totalCost = attendanceCount * lessonPrice;
  
  const payments = student.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const adjustments = student.adjustments || [];
  const totalAdjustments = adjustments.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  const balance = totalPaid - totalCost + totalAdjustments;

  if (!student.attendanceDates || student.attendanceDates.length < 2) {
    return {
      hasData: false,
      avgDays: null,
      lessonsPerMonth: 0,
      dailyIncome: 0,
      monthlyProjection: 0,
      totalCost,
      totalPaid,
      totalAdjustments,
      balance,
      ltv: totalCost
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
  const ltv = totalCost;

  return {
    hasData: true,
    avgDays,
    lessonsPerMonth,
    dailyIncome,
    monthlyProjection,
    ltv,
    totalCost,
    totalPaid,
    totalAdjustments,
    balance
  };
}

export function calculateDashboardStats({ students, spending, assets, currentMonth, currentYear, daysInMonth }) {
  const dailyIncome = new Array(daysInMonth).fill(0);
  const dailySpending = new Array(daysInMonth).fill(0);
  const dailyItems = new Array(daysInMonth).fill(null).map(() => ({ earnings: [], spendings: [] }));

  (students || []).forEach(student => {
    (student.payments || []).forEach(payment => {
      const d = new Date(payment.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate() - 1;
        dailyIncome[day] += payment.amount || 0;
        dailyItems[day].earnings.push({ name: student.name, amount: payment.amount });
      }
    });
  });

  (spending || []).forEach(item => {
    (item.purchaseDates || []).forEach(dateEntry => {
      const d = new Date(dateEntry.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate() - 1;
        const cost = dateEntry.cost || 0;
        dailySpending[day] += cost;
        dailyItems[day].spendings.push({ name: item.className, amount: cost });
      }
    });
  });

  const cumulativeIncome = [];
  const cumulativeSpending = [];
  let incSum = 0;
  let spendSum = 0;

  for (let i = 0; i < daysInMonth; i++) {
    incSum += dailyIncome[i];
    spendSum += dailySpending[i];
    cumulativeIncome.push(incSum);
    cumulativeSpending.push(spendSum);
  }

  const totalLifetimeIncome = (students || []).reduce((acc, s) => {
    const pTotal = (s.payments || []).reduce((pAcc, p) => pAcc + (p.amount || 0), 0);
    const aTotal = (s.adjustments || []).reduce((aAcc, a) => aAcc + (a.amount || 0), 0);
    return acc + pTotal + aTotal;
  }, 0);
  
  const totalLifetimeSpending = (spending || []).reduce((acc, s) => acc + (s.purchaseDates || []).reduce((dAcc, d) => {
    return dAcc + (d.cost || 0);
  }, 0), 0);

  const totalLiquidCapital = (assets?.financial || []).reduce((sum, acc) => {
    const multiplier = acc.currency === 'USDT' ? 36 : (acc.currency === 'USD' ? 35 : 1);
    return sum + ((acc.value || 0) * multiplier);
  }, 0);

  return { 
    cumulativeIncome, 
    cumulativeSpending, 
    dailyIncome, 
    dailySpending,
    dailyItems,
    totalIncome: incSum,
    totalSpending: spendSum,
    balance: totalLifetimeIncome,
    totalLiquidCapital
  };
}
