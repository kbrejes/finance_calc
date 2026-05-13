/* ============================================
   Data Layer — Models, Defaults & Persistence
   ============================================ */

const CURRENCY = '฿';
const WEEKS_PER_MONTH = 4.33;

// ---------- Default Sample Data ----------

const DEFAULT_SPENDING = [
  { id: 1, className: 'Rent', category: 'Housing', isEssential: true, instanceName: 'Rent', pricePerUnit: 8000, units: 1, purchaseDates: [] },
  { id: 2, className: 'Yoghurt', category: 'Food', isEssential: true, instanceName: 'Yoghurt', pricePerUnit: 165, units: 13, purchaseDates: [] },
  { id: 3, className: 'Gas', category: 'Transport', isEssential: true, instanceName: 'Gas', pricePerUnit: 100, units: 15, purchaseDates: [] },
  { id: 4, className: 'Oil', category: 'Transport', isEssential: true, instanceName: 'Oil', pricePerUnit: 300, units: 1, purchaseDates: [] },
  { id: 5, className: 'Phone Plan', category: 'Personal', isEssential: true, instanceName: 'Phone Plan', pricePerUnit: 550, units: 1, purchaseDates: [] },
  { id: 6, className: '30x eggs', category: 'Food', isEssential: true, instanceName: '30x eggs', pricePerUnit: 125, units: 9, purchaseDates: [] },
  { id: 7, className: 'Bananas', category: 'Food', isEssential: true, instanceName: 'Bananas', pricePerUnit: 15, units: 20, purchaseDates: [] },
  { id: 8, className: 'Chechevitsa, pasta, grechka 3kg', category: 'Food', isEssential: true, instanceName: 'Chechevitsa, pasta, grechka 3kg', pricePerUnit: 220, units: 2.5, purchaseDates: [] },
  { id: 9, className: '8 x water', category: 'Food', isEssential: true, instanceName: '8 x water', pricePerUnit: 60, units: 15, purchaseDates: [] },
  { id: 10, className: '500g coffee', category: 'Food', isEssential: true, instanceName: '500g coffee', pricePerUnit: 280, units: 2.5, purchaseDates: [] },
  { id: 11, className: '1kg veggies', category: 'Food', isEssential: true, instanceName: '1kg veggies', pricePerUnit: 50, units: 5, purchaseDates: [] },
  { id: 12, className: 'Tooth paste', category: 'Food', isEssential: true, instanceName: 'Tooth paste', pricePerUnit: 105, units: 1.5, purchaseDates: [] },
  { id: 13, className: 'Shampoo', category: 'Food', isEssential: true, instanceName: 'Shampoo', pricePerUnit: 110, units: 1.5, purchaseDates: [] },
];

const DEFAULT_STUDENTS = [
  {
    id: 1,
    name: 'Alex Belyaev',
    lessonPrice: 750,
    attendedDates: []
  },
  {
    id: 2,
    name: 'Kirill Maslow',
    lessonPrice: 1300,
    attendedDates: []
  },
];

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Subscriptions', 'Personal', 'Other'];

const CATEGORY_ICONS = {
  Housing: '🏠',
  Food: '🍜',
  Transport: '🚕',
  Subscriptions: '📱',
  Personal: '🧑',
  Other: '📦',
};

// ---------- Data Access (JSON file via API) ----------

// Synchronous loaders removed. Server handles data persistence exclusively.

function saveSpending(data) {
  fetch('/api/spending', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(err => console.warn('Save spending failed:', err));
}

function saveStudents(data) {
  fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(err => console.warn('Save students failed:', err));
}

async function initDataFromServer() {
  try {
    const [spRes, stRes] = await Promise.all([
      fetch('/api/spending'),
      fetch('/api/students'),
    ]);
    
    if (!spRes.ok || !stRes.ok) throw new Error('Network response was not ok');
    
    spending = await spRes.json();
    students = await stRes.json();

    renderAll();
  } catch (err) {
    console.error('Server not available:', err);
    alert('CRITICAL ERROR: Cannot connect to the local server. Your data could not be loaded. Please ensure the server is running (npm start) and refresh the page to prevent data loss.');
  }
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(i => i.id)) + 1;
}

// ---------- Calculations ----------

function getCalculatedSpendingMetrics(item) {
  if (!item.purchaseDates || item.purchaseDates.length < 2) {
    return {
      hasData: false,
      avgDays: null,
      nextDate: null,
      daysUntilNext: null,
      calcMonthlyUnits: item.units,
      calcMonthlyCost: item.pricePerUnit * item.units
    };
  }

  const now = new Date();
  // Sort dates oldest to newest
  const dates = item.purchaseDates.map(d => new Date(d)).sort((a, b) => a - b);
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const totalDaysSpan = Math.max(1, Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  // Number of intervals is dates.length - 1
  const avgDays = totalDaysSpan / (dates.length - 1);

  // Predict next purchase based on last date + avgDays
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + Math.round(avgDays));
  
  // Calculate days from today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDateOnly = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  const daysUntilNext = Math.round((nextDateOnly - today) / (1000 * 60 * 60 * 24));

  const calcMonthlyUnits = 30.44 / avgDays;
  const calcMonthlyCost = calcMonthlyUnits * item.pricePerUnit;

  return {
    hasData: true,
    avgDays,
    nextDate,
    daysUntilNext,
    calcMonthlyUnits,
    calcMonthlyCost
  };
}

function calcItemTotal(item) {
  const metrics = getCalculatedSpendingMetrics(item);
  return metrics.calcMonthlyCost;
}

function calcTotalSpending(spending) {
  return spending.reduce((sum, item) => sum + calcItemTotal(item), 0);
}

function calcCategoryTotals(spending) {
  const totals = {};
  for (const item of spending) {
    totals[item.category] = (totals[item.category] || 0) + calcItemTotal(item);
  }
  return totals;
}

function getCalculatedStudentMetrics(student) {
  if (!student.attendedDates || student.attendedDates.length < 2) {
    return {
      hasData: false,
      avgDays: null,
      monthlyLessons: 0,
      dailyIncome: 0,
      expectedIncome: 0
    };
  }

  const dates = student.attendedDates.map(d => new Date(d)).sort((a, b) => a - b);
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const totalDaysSpan = Math.max(1, Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const avgDays = totalDaysSpan / (dates.length - 1);
  const monthlyLessons = 30.44 / avgDays;
  const expectedIncome = monthlyLessons * student.lessonPrice;
  const dailyIncome = student.lessonPrice / avgDays;

  return {
    hasData: true,
    avgDays,
    monthlyLessons,
    dailyIncome,
    expectedIncome
  };
}

function calcStudentMonthly(student) {
  const metrics = getCalculatedStudentMetrics(student);
  return { expected: metrics.expectedIncome, min: metrics.expectedIncome, max: metrics.expectedIncome };
}

function calcTotalIncome(students) {
  let expected = 0, min = 0, max = 0;
  for (const s of students) {
    const m = calcStudentMonthly(s);
    expected += m.expected;
    min += m.min;
    max += m.max;
  }
  return { expected, min, max };
}

function generateRecommendation(totalSpending, income) {
  const shortfall = totalSpending - income.expected;
  const shortfallMin = totalSpending - income.max; // best case
  const shortfallMax = totalSpending - income.min; // worst case

  if (shortfall <= 0) {
    const surplus = -shortfall;
    return {
      status: 'good',
      surplus,
      shortfall: 0,
      message: `You're in good shape! Projected surplus of <strong class="text-green">${CURRENCY}${formatNum(surplus)}</strong>/month.`,
      details: 'Your expected income covers all of your projected expenses.',
    };
  }

  // Calculate recommendation
  const defaultLessonPrice = 700;
  const defaultLessonsPerWeek = 2;
  const monthlyPerStudent = defaultLessonPrice * defaultLessonsPerWeek * WEEKS_PER_MONTH;
  const studentsNeeded = Math.ceil(shortfall / monthlyPerStudent);

  return {
    status: shortfall > totalSpending * 0.3 ? 'danger' : 'warning',
    surplus: 0,
    shortfall,
    message: `Projected shortfall of <strong class="text-red">${CURRENCY}${formatNum(shortfall)}</strong>/month.`,
    details: `You need <span class="highlight">${studentsNeeded} more student${studentsNeeded > 1 ? 's' : ''}</span> at <span class="highlight">${CURRENCY}${formatNum(defaultLessonPrice)}/lesson</span>, <span class="highlight">${defaultLessonsPerWeek}×/week</span> to break even.`,
    studentsNeeded,
    assumedPrice: defaultLessonPrice,
    assumedFrequency: defaultLessonsPerWeek,
  };
}

function formatNum(n) {
  return Math.round(n).toLocaleString();
}

// ---------- Projection helpers ----------

function getMonthLabels(count = 6) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const labels = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(months[d.getMonth()] + ' ' + d.getFullYear());
  }
  return labels;
}

function projectSpending(totalMonthly, months = 6) {
  // Fixed spending with ±5% monthly variance for realism
  const data = [];
  for (let i = 0; i < months; i++) {
    const variance = 1 + (Math.random() * 0.1 - 0.05);
    data.push(Math.round(totalMonthly * variance));
  }
  return data;
}

function projectIncome(income, months = 6) {
  const expected = [], min = [], max = [];
  for (let i = 0; i < months; i++) {
    const v = 1 + (Math.random() * 0.06 - 0.03);
    expected.push(Math.round(income.expected * v));
    min.push(Math.round(income.min * (1 - Math.random() * 0.05)));
    max.push(Math.round(income.max * (1 + Math.random() * 0.05)));
  }
  return { expected, min, max };
}
