/* ============================================
   Charts — Chart.js configuration & rendering
   ============================================ */

// Chart.js global defaults
Chart.defaults.color = '#8b95b0';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(16, 21, 56, 0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };

let spendingChart = null;
let incomeChart = null;
let dashboardChart = null;

function createSpendingChart(canvasId, spending) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const totalMonthly = calcTotalSpending(spending);
  const labels = getMonthLabels(6);
  const data = projectSpending(totalMonthly, 6);

  // Category breakdown for stacked effect
  const catTotals = calcCategoryTotals(spending);
  const catColors = {
    Housing: '#63b3ed',
    Food: '#f472b6',
    Transport: '#fbbf24',
    Subscriptions: '#a78bfa',
    Personal: '#34d399',
    Other: '#8b95b0',
  };

  const datasets = Object.entries(catTotals).map(([cat, total]) => {
    const ratio = total / totalMonthly;
    return {
      label: cat,
      data: data.map(d => Math.round(d * ratio)),
      backgroundColor: catColors[cat] || catColors.Other,
      borderRadius: 4,
      borderSkipped: false,
    };
  });

  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${CURRENCY}${formatNum(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
        },
        y: {
          stacked: true,
          ticks: {
            callback: (v) => CURRENCY + formatNum(v),
          },
        },
      },
    },
  });
}

function createIncomeChart(canvasId, students) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const income = calcTotalIncome(students);
  const labels = getMonthLabels(6);
  const proj = projectIncome(income, 6);

  if (incomeChart) incomeChart.destroy();

  incomeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Best Case',
          data: proj.max,
          borderColor: 'rgba(52, 211, 153, 0.3)',
          backgroundColor: 'rgba(52, 211, 153, 0.05)',
          fill: '+1',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Expected',
          data: proj.expected,
          borderColor: '#63b3ed',
          backgroundColor: 'rgba(99, 179, 237, 0.08)',
          fill: false,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#63b3ed',
          pointBorderColor: '#0a0e27',
          pointBorderWidth: 2,
          tension: 0.3,
        },
        {
          label: 'Worst Case',
          data: proj.min,
          borderColor: 'rgba(248, 113, 113, 0.3)',
          backgroundColor: 'rgba(248, 113, 113, 0.05)',
          fill: '-1',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${CURRENCY}${formatNum(ctx.parsed.y)}`,
          },
        },
        filler: {
          propagate: true,
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          ticks: {
            callback: (v) => CURRENCY + formatNum(v),
          },
        },
      },
    },
  });
}

function createDashboardChart(canvasId, spending, students) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const totalSpending = calcTotalSpending(spending);
  const income = calcTotalIncome(students);
  const labels = getMonthLabels(6);
  const spendingProj = projectSpending(totalSpending, 6);
  const incomeProj = projectIncome(income, 6);

  if (dashboardChart) dashboardChart.destroy();

  dashboardChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income (Expected)',
          data: incomeProj.expected,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.08)',
          fill: true,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#34d399',
          pointBorderColor: '#0a0e27',
          pointBorderWidth: 2,
          tension: 0.3,
        },
        {
          label: 'Spending',
          data: spendingProj,
          borderColor: '#f87171',
          backgroundColor: 'rgba(248, 113, 113, 0.06)',
          fill: true,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#f87171',
          pointBorderColor: '#0a0e27',
          pointBorderWidth: 2,
          tension: 0.3,
        },
        {
          label: 'Income (Worst Case)',
          data: incomeProj.min,
          borderColor: 'rgba(251, 191, 36, 0.4)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${CURRENCY}${formatNum(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          ticks: {
            callback: (v) => CURRENCY + formatNum(v),
          },
        },
      },
    },
  });
}
