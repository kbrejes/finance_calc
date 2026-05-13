/* ============================================
   App Logic — Rendering, CRUD, Event Handling
   ============================================ */

// ---------- State ----------
let spending = [];
let students = [];

// ---------- DOM Ready ----------
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderAll();
  // Fetch persisted data from server, then re-render
  initDataFromServer();
});

// ---------- Tab Navigation ----------
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      // Re-render charts when tab becomes visible
      if (tab === 'spending') createSpendingChart('spending-chart', spending);
      if (tab === 'earnings') createIncomeChart('income-chart', students);
      if (tab === 'dashboard') {
        createDashboardChart('dashboard-chart', spending, students);
        renderDashboard();
      }
    });
  });
}

// ---------- Render All ----------
function renderAll() {
  renderSpendingTable();
  renderStudentCards();
  renderBanner();
  // Charts — render the currently active tab
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  if (activeTab === 'spending') createSpendingChart('spending-chart', spending);
  else if (activeTab === 'earnings') createIncomeChart('income-chart', students);
  else if (activeTab === 'dashboard') createDashboardChart('dashboard-chart', spending, students);
}

// ==========================================
//  SPENDING TABLE
// ==========================================

function renderSpendingTable() {
  const tbody = document.getElementById('spending-tbody');
  if (!tbody) return;

  let html = '';
  let grandTotal = 0;

  for (const item of spending) {
    const total = calcItemTotal(item);
    grandTotal += total;
    const icon = CATEGORY_ICONS[item.category] || '📦';
    const metrics = getCalculatedSpendingMetrics(item);
    const hasData = metrics.hasData;
    
    let itemNameHtml = escHtml(item.instanceName);
    if (hasData && metrics.daysUntilNext !== null) {
      const daysText = metrics.daysUntilNext < 0 ? `Overdue by ${Math.abs(metrics.daysUntilNext)}d` : `Next in ${metrics.daysUntilNext}d`;
      itemNameHtml += `<div class="spending-prediction text-muted" style="font-size:0.75rem; margin-top:2px;">📅 ${daysText}</div>`;
    }

    const essentialBadge = item.isEssential ? ' <span style="font-size: 0.7rem; background: #2f855a; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">Essential</span>' : '';

    html += `
      <tr data-id="${item.id}">
        <td><span class="category-badge">${icon} ${escHtml(item.className)}</span>${essentialBadge}</td>
        <td>${itemNameHtml}</td>
        <td class="text-right">${CURRENCY}${formatNum(item.pricePerUnit)}</td>
        <td class="text-right">${hasData ? `<span title="Calculated from history">${metrics.calcMonthlyUnits.toFixed(1)} <span style="font-size:0.7em">📅</span></span>` : item.units}</td>
        <td class="text-right total-cell">${hasData ? `<span title="Calculated from history">${CURRENCY}${formatNum(total)} <span style="font-size:0.7em">📅</span></span>` : `${CURRENCY}${formatNum(total)}`}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" onclick="openSpendingCalendarModal(${item.id})" title="Purchase History">📅</button>
            <button class="btn-icon" onclick="editSpendingItem(${item.id})" title="Edit">✏️</button>
            <button class="btn-icon delete" onclick="deleteSpendingItem(${item.id})" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`;
  }

  html += `
    <tr class="grand-total-row">
      <td colspan="4" class="text-right">Total Monthly Spending</td>
      <td class="text-right text-red">${CURRENCY}${formatNum(grandTotal)}</td>
      <td></td>
    </tr>`;

  tbody.innerHTML = html;

  // Update spending summary in header
  const el = document.getElementById('spending-total-display');
  if (el) el.textContent = CURRENCY + formatNum(grandTotal);

  renderBanner();
}

function deleteSpendingItem(id) {
  spending = spending.filter(i => i.id !== id);
  saveSpending(spending);
  renderSpendingTable();
  createSpendingChart('spending-chart', spending);
}

function editSpendingItem(id) {
  const item = spending.find(i => i.id === id);
  if (!item) return;
  openSpendingModal(item);
}

// ---------- Spending Modal ----------
function openSpendingModal(existing = null) {
  const modal = document.getElementById('spending-modal');
  const form = document.getElementById('spending-form');
  const title = document.getElementById('spending-modal-title');

  title.textContent = existing ? '✏️ Edit Item' : '➕ Add Spending Item';
  form.dataset.editId = existing ? existing.id : '';

  form.elements['sp-category'].value = existing ? existing.category : 'Food';
  form.elements['sp-essential'].value = existing ? (existing.isEssential ? 'true' : 'false') : 'true';
  form.elements['sp-class-name'].value = existing ? existing.className : '';
  form.elements['sp-instance-name'].value = existing ? existing.instanceName : '';
  form.elements['sp-price'].value = existing ? existing.pricePerUnit : '';
  form.elements['sp-units'].value = existing ? existing.units : 1;

  modal.classList.add('active');
  setTimeout(() => form.elements['sp-class-name'].focus(), 100);
}

function closeSpendingModal() {
  document.getElementById('spending-modal').classList.remove('active');
}

function handleSpendingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const editId = form.dataset.editId ? parseInt(form.dataset.editId) : null;

  const data = {
    category: form.elements['sp-category'].value,
    isEssential: form.elements['sp-essential'].value === 'true',
    className: form.elements['sp-class-name'].value.trim(),
    instanceName: form.elements['sp-instance-name'].value.trim(),
    pricePerUnit: parseFloat(form.elements['sp-price'].value) || 0,
    units: parseFloat(form.elements['sp-units'].value) || 1,
  };

  if (!data.className || !data.instanceName) return;

  if (editId) {
    const idx = spending.findIndex(i => i.id === editId);
    if (idx >= 0) spending[idx] = { ...spending[idx], ...data };
  } else {
    spending.push({ id: nextId(spending), ...data });
  }

  saveSpending(spending);
  closeSpendingModal();
  renderSpendingTable();
  createSpendingChart('spending-chart', spending);
}

// ==========================================
//  STUDENT CARDS
// ==========================================

function renderStudentCards() {
  const grid = document.getElementById('students-grid');
  if (!grid) return;

  if (students.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="empty-icon">👨‍🏫</div>
        <p>No students yet. Add your first student!</p>
      </div>`;
    return;
  }

  let html = '';
  for (const s of students) {
    const m = calcStudentMonthly(s);
    const metrics = getCalculatedStudentMetrics(s);
    const hasData = metrics.hasData;

    html += `
      <div class="student-card" data-id="${s.id}">
        <div class="card-actions">
          <button class="btn-icon" onclick="openCalendarModal(${s.id})" title="Attendance Calendar">📅</button>
          <button class="btn-icon" onclick="editStudent(${s.id})" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteStudent(${s.id})" title="Delete">🗑️</button>
        </div>
        <div class="student-card-header">
          <span class="student-name">${escHtml(s.name)}</span>
          ${hasData ? `<span class="student-consistency consistency-consistent">● Active</span>` : `<span class="student-consistency consistency-inconsistent">◐ Needs Data</span>`}
        </div>
        <div class="student-fields">
          <div class="student-field">
            <label>Lesson Price</label>
            <div class="text-primary" style="font-weight:600">${CURRENCY}${formatNum(s.lessonPrice)}</div>
          </div>
          <div class="student-field">
            <label>Avg Frequency</label>
            <div class="text-primary" style="font-weight:600">
              ${hasData ? `1 per ${Math.round(metrics.avgDays)}d` : '-'}
            </div>
          </div>
          <div class="student-field">
            <label>Lessons/Month</label>
            <div class="text-primary" style="font-weight:600">
              ${hasData ? `${metrics.monthlyLessons.toFixed(1)} <span style="font-size:0.7em">📅</span>` : '-'}
            </div>
          </div>
          <div class="student-field">
            <label>Daily Income</label>
            <div class="text-primary" style="font-weight:600">
              ${hasData ? `${CURRENCY}${formatNum(metrics.dailyIncome)}/d <span style="font-size:0.7em">📅</span>` : '-'}
            </div>
          </div>
        </div>
        <div class="student-projected">
          <span class="proj-label">Monthly Projection</span>
          <div>
            ${hasData ? `<span class="proj-value" title="Calculated from history">${CURRENCY}${formatNum(m.expected)}</span>` : `<span class="proj-value text-muted" style="font-size:0.9rem">Log at least 2 classes</span>`}
          </div>
        </div>
      </div>`;
  }

  grid.innerHTML = html;

  // Update earnings summary
  const income = calcTotalIncome(students);
  const el = document.getElementById('earnings-total-display');
  if (el) el.textContent = CURRENCY + formatNum(income.expected);

  renderBanner();
}

function deleteStudent(id) {
  students = students.filter(s => s.id !== id);
  saveStudents(students);
  renderStudentCards();
  createIncomeChart('income-chart', students);
}

function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;
  openStudentModal(s);
}

// ---------- Student Modal ----------
function openStudentModal(existing = null) {
  const modal = document.getElementById('student-modal');
  const form = document.getElementById('student-form');
  const title = document.getElementById('student-modal-title');

  title.textContent = existing ? '✏️ Edit Student' : '➕ Add Student';
  form.dataset.editId = existing ? existing.id : '';

  form.elements['st-name'].value = existing ? existing.name : '';
  form.elements['st-price'].value = existing ? existing.lessonPrice : '';

  modal.classList.add('active');
  setTimeout(() => form.elements['st-name'].focus(), 100);
}

function closeStudentModal() {
  document.getElementById('student-modal').classList.remove('active');
}

function handleStudentSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const editId = form.dataset.editId ? parseInt(form.dataset.editId) : null;

  const data = {
    name: form.elements['st-name'].value.trim(),
    lessonPrice: parseFloat(form.elements['st-price'].value) || 0,
  };

  if (!data.name) return;

  if (editId) {
    const idx = students.findIndex(s => s.id === editId);
    if (idx >= 0) students[idx] = { ...students[idx], ...data };
  } else {
    students.push({ id: nextId(students), ...data });
  }

  saveStudents(students);
  closeStudentModal();
  renderStudentCards();
  createIncomeChart('income-chart', students);
}

// ==========================================
//  DASHBOARD BANNER
// ==========================================

function renderBanner() {
  const totalSpending = calcTotalSpending(spending);
  const income = calcTotalIncome(students);
  const rec = generateRecommendation(totalSpending, income);

  // Status icon
  const statusEl = document.getElementById('banner-status');
  const infoEl = document.getElementById('banner-info');
  const statsEl = document.getElementById('banner-stats');

  if (!statusEl) return;

  statusEl.className = 'banner-status';
  if (rec.status === 'good') {
    statusEl.classList.add('status-good');
    statusEl.textContent = '✓';
  } else if (rec.status === 'warning') {
    statusEl.classList.add('status-warning');
    statusEl.textContent = '⚠';
  } else {
    statusEl.classList.add('status-danger');
    statusEl.textContent = '✕';
  }

  infoEl.innerHTML = `
    <h2>${rec.status === 'good' ? 'Looking Good!' : rec.status === 'warning' ? 'Heads Up' : 'Action Needed'}</h2>
    <p>${rec.message}</p>
  `;

  statsEl.innerHTML = `
    <div class="banner-stat">
      <span class="stat-value stat-income">${CURRENCY}${formatNum(income.expected)}</span>
      <span class="stat-label">Income</span>
    </div>
    <div class="banner-stat">
      <span class="stat-value stat-spending">${CURRENCY}${formatNum(totalSpending)}</span>
      <span class="stat-label">Spending</span>
    </div>
    <div class="banner-stat">
      <span class="stat-value ${rec.surplus > 0 ? 'stat-surplus' : 'stat-deficit'}">${rec.surplus > 0 ? '+' : '-'}${CURRENCY}${formatNum(rec.surplus || rec.shortfall)}</span>
      <span class="stat-label">${rec.surplus > 0 ? 'Surplus' : 'Shortfall'}</span>
    </div>
  `;
}

function renderDashboard() {
  const totalSpending = calcTotalSpending(spending);
  const income = calcTotalIncome(students);
  const rec = generateRecommendation(totalSpending, income);

  // Summary cards
  document.getElementById('dash-income').textContent = CURRENCY + formatNum(income.expected);
  document.getElementById('dash-income-range').textContent = `${CURRENCY}${formatNum(income.min)} – ${CURRENCY}${formatNum(income.max)}`;
  document.getElementById('dash-spending').textContent = CURRENCY + formatNum(totalSpending);
  document.getElementById('dash-students').textContent = students.length;
  document.getElementById('dash-items').textContent = spending.length;

  const balanceEl = document.getElementById('dash-balance');
  const balance = income.expected - totalSpending;
  balanceEl.textContent = (balance >= 0 ? '+' : '') + CURRENCY + formatNum(balance);
  balanceEl.className = 'card-value ' + (balance >= 0 ? 'text-green' : 'text-red');

  // Recommendation
  const recCard = document.getElementById('recommendation-card');
  const recText = document.getElementById('recommendation-text');

  recCard.className = 'glass-card recommendation-card rec-' + rec.status;
  recText.innerHTML = `
    <p>${rec.message}</p>
    <p style="margin-top:8px">${rec.details}</p>
  `;
}

// ==========================================
//  CALENDAR
// ==========================================

let currentCalendarStudentId = null;
let currentCalendarDate = new Date();

function openCalendarModal(studentId) {
  currentCalendarStudentId = studentId;
  currentCalendarDate = new Date();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  
  if (!student.attendedDates) {
    student.attendedDates = [];
  }
  
  document.getElementById('calendar-modal-title').textContent = `📅 ${student.name}'s Attendance`;
  renderCalendar();
  document.getElementById('calendar-modal').classList.add('active');
}

function closeCalendarModal() {
  document.getElementById('calendar-modal').classList.remove('active');
}

function calendarNextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
}

function calendarPrevMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
}

function renderCalendar() {
  const student = students.find(s => s.id === currentCalendarStudentId);
  if (!student) return;
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('cal-month-label').textContent = `${monthNames[month]} ${year}`;
  
  const grid = document.getElementById('calendar-grid');
  let html = '';
  
  // Headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(d => {
    html += `<div class="cal-header">${d}</div>`;
  });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isAttended = student.attendedDates && student.attendedDates.includes(dateStr);
    const isToday = d.toDateString() === today.toDateString();
    const isFuture = d > today && !isToday;
    
    let classes = 'cal-day';
    if (isAttended) classes += ' attended';
    if (isToday) classes += ' today';
    if (isFuture) classes += ' future';
    
    html += `<div class="${classes}" onclick="toggleAttendance('${dateStr}')">${i}</div>`;
  }
  
  grid.innerHTML = html;
  
  // Render stats
  const stats = document.getElementById('calendar-stats');
  const metrics = getCalculatedStudentMetrics(student);
  const totalAttended = student.attendedDates ? student.attendedDates.length : 0;
  
  let statsHtml = `
    <div>
      <span class="cal-stat-value text-green">${totalAttended}</span>
      <span class="cal-stat-label">Total Logs</span>
    </div>`;

  if (metrics.hasData) {
    statsHtml += `
      <div>
        <span class="cal-stat-value text-cyan">~${Math.round(metrics.avgDays)}d</span>
        <span class="cal-stat-label">Avg Freq</span>
      </div>
      <div>
        <span class="cal-stat-value">${metrics.monthlyLessons.toFixed(1)}</span>
        <span class="cal-stat-label">Lessons/Mo</span>
      </div>
    `;
  } else {
    statsHtml += `
      <div style="grid-column: span 2; text-align: left; padding-left: 10px; color: #8b95b0; font-size: 0.8rem; display: flex; align-items: center;">
        Log at least 2 dates to see prediction.
      </div>
    `;
  }
  
  stats.innerHTML = statsHtml;
}

function toggleAttendance(dateStr) {
  const student = students.find(s => s.id === currentCalendarStudentId);
  if (!student) return;
  
  if (!student.attendedDates) {
    student.attendedDates = [];
  }
  
  const idx = student.attendedDates.indexOf(dateStr);
  if (idx > -1) {
    student.attendedDates.splice(idx, 1);
  } else {
    student.attendedDates.push(dateStr);
  }
  
  saveStudents(students);
  renderCalendar();
  
  // Update charts and cards because the rate might have changed
  renderStudentCards();
  createIncomeChart('income-chart', students);
}

// ==========================================
//  SPENDING CALENDAR
// ==========================================

let currentSpendingCalendarItemId = null;
let currentSpendingCalendarDate = new Date();

function openSpendingCalendarModal(itemId) {
  currentSpendingCalendarItemId = itemId;
  currentSpendingCalendarDate = new Date();
  const item = spending.find(i => i.id === itemId);
  if (!item) return;
  
  if (!item.purchaseDates) {
    item.purchaseDates = [];
  }
  
  document.getElementById('spending-calendar-modal-title').textContent = `📅 ${item.instanceName} Purchases`;
  renderSpendingCalendar();
  document.getElementById('spending-calendar-modal').classList.add('active');
}

function closeSpendingCalendarModal() {
  document.getElementById('spending-calendar-modal').classList.remove('active');
}

function spendingCalendarNextMonth() {
  currentSpendingCalendarDate.setMonth(currentSpendingCalendarDate.getMonth() + 1);
  renderSpendingCalendar();
}

function spendingCalendarPrevMonth() {
  currentSpendingCalendarDate.setMonth(currentSpendingCalendarDate.getMonth() - 1);
  renderSpendingCalendar();
}

function renderSpendingCalendar() {
  const item = spending.find(i => i.id === currentSpendingCalendarItemId);
  if (!item) return;
  
  const year = currentSpendingCalendarDate.getFullYear();
  const month = currentSpendingCalendarDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('sp-cal-month-label').textContent = `${monthNames[month]} ${year}`;
  
  const grid = document.getElementById('spending-calendar-grid');
  let html = '';
  
  // Headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(d => {
    html += `<div class="cal-header">${d}</div>`;
  });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isAttended = item.purchaseDates && item.purchaseDates.includes(dateStr);
    const isToday = d.toDateString() === today.toDateString();
    const isFuture = d > today && !isToday;
    
    let classes = 'cal-day';
    if (isAttended) classes += ' attended';
    if (isToday) classes += ' today';
    if (isFuture) classes += ' future';
    
    html += `<div class="${classes}" onclick="togglePurchaseDate('${dateStr}')">${i}</div>`;
  }
  
  grid.innerHTML = html;
  
  // Render stats
  const stats = document.getElementById('spending-calendar-stats');
  const metrics = getCalculatedSpendingMetrics(item);
  const totalPurchases = item.purchaseDates ? item.purchaseDates.length : 0;
  
  let statsHtml = `
    <div>
      <span class="cal-stat-value text-green">${totalPurchases}</span>
      <span class="cal-stat-label">Total Logs</span>
    </div>`;

  if (metrics.hasData) {
    const daysText = metrics.daysUntilNext < 0 ? `Overdue ${Math.abs(metrics.daysUntilNext)}d` : `In ${metrics.daysUntilNext}d`;
    statsHtml += `
      <div>
        <span class="cal-stat-value text-cyan">~${Math.round(metrics.avgDays)}d</span>
        <span class="cal-stat-label">Avg Freq</span>
      </div>
      <div>
        <span class="cal-stat-value">${daysText}</span>
        <span class="cal-stat-label">Next Purc.</span>
      </div>
    `;
  } else {
    statsHtml += `
      <div style="grid-column: span 2; text-align: left; padding-left: 10px; color: #8b95b0; font-size: 0.8rem; display: flex; align-items: center;">
        Log at least 2 dates to see prediction.
      </div>
    `;
  }
  
  stats.innerHTML = statsHtml;
}

function togglePurchaseDate(dateStr) {
  const item = spending.find(i => i.id === currentSpendingCalendarItemId);
  if (!item) return;
  
  if (!item.purchaseDates) {
    item.purchaseDates = [];
  }
  
  const idx = item.purchaseDates.indexOf(dateStr);
  if (idx > -1) {
    item.purchaseDates.splice(idx, 1);
  } else {
    item.purchaseDates.push(dateStr);
  }
  
  saveSpending(spending);
  renderSpendingCalendar();
  
  // Update UI components
  renderSpendingTable();
  createSpendingChart('spending-chart', spending);
  
  // Dashboard might also change because total spending changed
  if (document.getElementById('tab-dashboard').classList.contains('active')) {
    createDashboardChart('dashboard-chart', spending, students);
    renderDashboard();
  } else {
    renderBanner();
  }
}

// ==========================================
//  UTILITIES
// ==========================================

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});
