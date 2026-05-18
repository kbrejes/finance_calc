export let globalSettings = {
  baseCurrency: 'USD',
  rates: { USD: 1, THB: 35, RUB: 90, USDT: 1 }
};

export function updateGlobalSettings(settings) {
  if (settings) {
    globalSettings = { ...globalSettings, ...settings };
  }
}

const WEEKS_PER_MONTH = 4.33;

export function formatNum(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatMoney(amount, currency = globalSettings.baseCurrency) {
  if (amount === undefined || amount === null) return '';
  const symbols = {
    USD: '$',
    USDT: '₮',
    THB: '฿',
    RUB: '₽'
  };
  const sym = symbols[currency] || currency + ' ';
  return `${sym}${formatNum(amount)}`;
}

export function convertToBase(amount, fromCurrency) {
  if (!amount) return 0;
  const currency = fromCurrency || 'THB';
  if (currency === globalSettings.baseCurrency) return amount;
  
  // Rates are relative to 1 USD. e.g. THB: 35 means 1 USD = 35 THB.
  const rateToUSD = globalSettings.rates[currency] || 1;
  const amountInUSD = amount / rateToUSD;
  
  const baseRate = globalSettings.rates[globalSettings.baseCurrency] || 1;
  return amountInUSD * baseRate;
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
  // Use billingDate if set (for early payments covering a future cycle), otherwise use actual payment date
  const uniqueDateStrings = [...new Set(item.purchaseDates.map(p => p.billingDate || p.date))];
  const uniqueDates = uniqueDateStrings
    .map(d => new Date(d))
    .sort((a, b) => a - b);
  
  let avgDays = 0;
  let daysUntilNext = null;
  let nextDate = null;

  if (uniqueDates.length >= 3) {
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
    totalCost += convertToBase(p.cost || 0, p.currency);
  }
  
  let calcMonthlyCost = totalCost;
  
  if (uniqueDates.length >= 3 && avgDays > 0) {
    const avgCostPerEntry = totalCost / entryCount;
    // Projection: (Average Cost per Purchase) * (Expected Purchases per Month)
    const expectedEntriesPerMonth = 30.44 / avgDays;
    calcMonthlyCost = avgCostPerEntry * expectedEntriesPerMonth;
  } else {
    // For single entries or very little data, just show the total for now
    calcMonthlyCost = totalCost;
  }

  return {
    hasData: uniqueDates.length >= 3,
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

export function calculateDashboardStats({ students, spending, assets, currentMonth, currentYear, daysInMonth, mlPredictions, mlIncomePredictions }) {
  const dailyIncome = new Array(daysInMonth).fill(0);
  const dailySpending = new Array(daysInMonth).fill(0);
  const dailyItems = new Array(daysInMonth).fill(null).map(() => ({ earnings: [], spendings: [] }));

  (students || []).forEach(student => {
    (student.payments || []).forEach(payment => {
      const d = new Date(payment.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate() - 1;
        const convertedAmount = convertToBase(payment.amount || 0, student.currency);
        dailyIncome[day] += convertedAmount;
        dailyItems[day].earnings.push({ name: student.name, amount: convertedAmount, rawAmount: payment.amount, currency: student.currency });
      }
    });
  });

  (spending || []).forEach(item => {
    (item.purchaseDates || []).forEach(dateEntry => {
      const d = new Date(dateEntry.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate() - 1;
        const convertedCost = convertToBase(dateEntry.cost || 0, dateEntry.currency);
        dailySpending[day] += convertedCost;
        dailyItems[day].spendings.push({ name: item.className, amount: convertedCost, rawAmount: dateEntry.cost, currency: dateEntry.currency });
      }
    });
  });

  // --- ML PREDICTION LOGIC & CHART TIMELINE ---
  const today = new Date();
  today.setHours(0,0,0,0);
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const FORECAST_DAYS = 365;
  const timelineLength = isCurrentMonth ? (today.getDate() + FORECAST_DAYS) : daysInMonth;
  const labels = [];
  const chartCumulativeIncome = [];
  const chartCumulativeSpending = [];
  const chartProjectedSpending = [];
  const chartProjectedIncome = [];
  const chartDailyItems = [];

  // Calculate liquid capital FIRST so we can use it as the income baseline
  const totalLiquidCapital = (assets?.financial || []).reduce((sum, acc) => {
    return sum + convertToBase(acc.amount || 0, acc.currency);
  }, 0);

  // We want the green line's value on "Today" to exactly equal totalLiquidCapital.
  // Since we add dailyIncome as we loop from day 1 to today, we need to start at
  // totalLiquidCapital minus the income we've already earned this month.
  let earningsSoFarThisMonth = 0;
  if (isCurrentMonth) {
    for (let i = 0; i < today.getDate() && i < daysInMonth; i++) {
      earningsSoFarThisMonth += dailyIncome[i];
    }
  }

  let incSum = isCurrentMonth ? (totalLiquidCapital - earningsSoFarThisMonth) : totalLiquidCapital; 
  let spendSum = 0;

  for (let i = 0; i < timelineLength; i++) {
    const loopDate = new Date(currentYear, currentMonth, i + 1);
    
    // Formatting label
    if (i < daysInMonth) {
      labels.push(String(i + 1));
    } else {
      // For future dates, only show label on the 1st of each month to avoid overcrowding
      if (loopDate.getDate() === 1) {
        labels.push(`${loopDate.toLocaleString('default', { month: 'short' })} '${String(loopDate.getFullYear()).slice(2)}`);
      } else {
        labels.push('');
      }
    }

    const dayItems = { earnings: [], spendings: [], projected: [] };

    if (i < daysInMonth) {
      dayItems.earnings = dailyItems[i].earnings;
      dayItems.spendings = dailyItems[i].spendings;
    }

    // Actual Data
    if (!isCurrentMonth || i < today.getDate()) {
      if (i < daysInMonth) {
        incSum += dailyIncome[i];
        spendSum += dailySpending[i];
      }
      chartCumulativeIncome.push(incSum);
      chartCumulativeSpending.push(spendSum);
      chartProjectedSpending.push(i === today.getDate() - 1 ? spendSum : null);
      chartProjectedIncome.push(i === today.getDate() - 1 ? incSum : null);
    } else {
      chartCumulativeIncome.push(null);
      chartCumulativeSpending.push(null);
      chartProjectedSpending.push(0);
      chartProjectedIncome.push(0);
    }
    
    chartDailyItems.push(dayItems);
  }

  if (isCurrentMonth && mlPredictions) {
    Object.values(mlPredictions).forEach(pred => {
      const interval = pred.predictedDaysUntilNext;
      const firstDate = new Date(pred.predictedNextDate);
      firstDate.setHours(0,0,0,0);
      
      // Place recurring dots: first occurrence, then repeat at the interval
      let predDate = new Date(firstDate);
      while (true) {
        const diffDays = Math.round((predDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays > FORECAST_DAYS) break;
        if (diffDays >= 1) {
          const targetIndex = (today.getDate() - 1) + diffDays;
          if (targetIndex < timelineLength) {
            chartDailyItems[targetIndex].projected.push({
              name: pred.className,
              amount: convertToBase(pred.predictedNextAmount, pred.currency),
              rawAmount: pred.predictedNextAmount,
              currency: pred.currency
            });
          }
        }
        predDate = new Date(predDate);
        predDate.setDate(predDate.getDate() + Math.max(1, interval));
      }
    });

    let currentProjSpendSum = chartCumulativeSpending[today.getDate() - 1];
    for (let i = today.getDate(); i < timelineLength; i++) {
      const dailyProjSpend = chartDailyItems[i].projected.reduce((sum, item) => sum + item.amount, 0);
      currentProjSpendSum += dailyProjSpend;
      chartProjectedSpending[i] = currentProjSpendSum;
    }
  }

  // --- ML INCOME PREDICTIONS ---
  if (isCurrentMonth && mlIncomePredictions) {
    Object.values(mlIncomePredictions).forEach(pred => {
      const interval = pred.predictedDaysUntilNext;
      const firstDate = new Date(pred.predictedNextDate);
      firstDate.setHours(0,0,0,0);
      
      // Place recurring dots: first occurrence, then repeat at the interval
      let predDate = new Date(firstDate);
      while (true) {
        const diffDays = Math.round((predDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays > FORECAST_DAYS) break;
        if (diffDays >= 1) {
          const targetIndex = (today.getDate() - 1) + diffDays;
          if (targetIndex < timelineLength) {
            if (!chartDailyItems[targetIndex].projectedIncome) {
              chartDailyItems[targetIndex].projectedIncome = [];
            }
            chartDailyItems[targetIndex].projectedIncome.push({
              name: pred.name,
              amount: convertToBase(pred.predictedNextAmount, pred.currency),
              rawAmount: pred.predictedNextAmount,
              currency: pred.currency
            });
          }
        }
        predDate = new Date(predDate);
        predDate.setDate(predDate.getDate() + Math.max(1, interval));
      }
    });

    let currentProjIncSum = chartCumulativeIncome[today.getDate() - 1];
    for (let i = today.getDate(); i < timelineLength; i++) {
      const dailyProjInc = (chartDailyItems[i].projectedIncome || []).reduce((sum, item) => sum + item.amount, 0);
      currentProjIncSum += dailyProjInc;
      chartProjectedIncome[i] = currentProjIncSum;
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



  return { 
    labels,
    chartCumulativeIncome, 
    chartCumulativeSpending, 
    chartProjectedSpending,
    chartProjectedIncome,
    chartDailyItems,
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
