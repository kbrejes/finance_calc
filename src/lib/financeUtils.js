const CURRENCY = '฿';
const WEEKS_PER_MONTH = 4.33;

export const EXCHANGE_RATES = {
  USDT: 36,
  USD: 35,
  THB: 1
};

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

export function calculateSpendingForecast(spending, startDate, daysToForecast = 30) {
  const forecast = new Array(daysToForecast).fill(0);
  const thirtyDaysAgo = new Date(startDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  (spending || []).forEach(item => {
    const metrics = getCalculatedSpendingMetrics(item);
    
    // 1. Essential Recurring Items
    if (item.isEssential) {
      if (metrics.hasData && metrics.avgDays > 0 && metrics.nextDate) {
        let projectedDate = new Date(metrics.nextDate);
        // Fast forward past dates
        while (projectedDate < startDate) {
          projectedDate.setDate(projectedDate.getDate() + Math.max(1, Math.round(metrics.avgDays)));
        }
        
        while (true) {
          const diffDays = Math.round((projectedDate - startDate) / (1000 * 60 * 60 * 24));
          if (diffDays >= daysToForecast) break;
          
          const avgCost = metrics.totalCost / item.purchaseDates.length;
          if (diffDays >= 0) {
            forecast[diffDays] += avgCost;
          }
          
          projectedDate.setDate(projectedDate.getDate() + Math.max(1, Math.round(metrics.avgDays)));
        }
      } else if (item.purchaseDates?.length === 1) {
        // Essential but only paid once. Assume monthly recurring
        const pDate = new Date(item.purchaseDates[0].date);
        let projectedDate = new Date(pDate);
        while (projectedDate < startDate) {
          projectedDate.setDate(projectedDate.getDate() + 30);
        }
        while (true) {
          const diffDays = Math.round((projectedDate - startDate) / (1000 * 60 * 60 * 24));
          if (diffDays >= daysToForecast) break;
          if (diffDays >= 0) {
            forecast[diffDays] += (item.purchaseDates[0].cost || 0);
          }
          projectedDate.setDate(projectedDate.getDate() + 30);
        }
      }
    } 
    // 2. Non-Essential (Variable) Items
    else {
      // Anomaly Prevention: Must have > 1 purchase to establish velocity
      if (item.purchaseDates && item.purchaseDates.length > 1) {
        let recentSpend = 0;
        item.purchaseDates.forEach(p => {
          const d = new Date(p.date);
          if (d >= thirtyDaysAgo && d <= startDate) {
            recentSpend += (p.cost || 0);
          }
        });
        
        const dailyVelocity = recentSpend / 30;
        for (let i = 0; i < daysToForecast; i++) {
          forecast[i] += dailyVelocity;
        }
      }
    }
  });

  return forecast;
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

  // --- PREDICTION LOGIC ---
  const today = new Date();
  today.setHours(0,0,0,0);
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  
  let projectedSpending = [];
  let futureLabels = [];
  
  if (isCurrentMonth) {
    const daysRemaining = daysInMonth - today.getDate();
    const daysToForecast = daysRemaining + 30; // Finish the month + 30 days
    
    const dailyForecast = calculateSpendingForecast(spending, today, daysToForecast);
    
    // We want the projected line to start where the actual line currently is (today)
    let currentProjSpendSum = cumulativeSpending[today.getDate() - 1] || 0;
    
    // Fill the projected array with nulls up to "yesterday" so it connects properly
    projectedSpending = new Array(today.getDate() - 1).fill(null);
    projectedSpending.push(currentProjSpendSum); // Point for today
    
    for (let i = 1; i <= daysToForecast; i++) { // Start from tomorrow
      currentProjSpendSum += dailyForecast[i];
      projectedSpending.push(currentProjSpendSum);
      
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      futureLabels.push(`${futureDate.toLocaleString('default', { month: 'short' })} ${futureDate.getDate()}`);
    }
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
    const multiplier = EXCHANGE_RATES[acc.currency] || 1;
    return sum + ((acc.value || 0) * multiplier);
  }, 0);

  return { 
    cumulativeIncome, 
    cumulativeSpending, 
    projectedSpending,
    futureLabels,
    isCurrentMonth,
    dailyIncome, 
    dailySpending,
    dailyItems,
    totalIncome: incSum,
    totalSpending: spendSum,
    balance: totalLifetimeIncome,
    totalLiquidCapital
  };
}
