with open('app.js', 'r') as f:
    content = f.read()

# Fix: In initTabs, save tab to localStorage on click + restore on load
old = '''function initTabs() {
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
}'''

new = '''function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      localStorage.setItem('activeTab', tab);
      // Re-render charts when tab becomes visible
      if (tab === 'spending') createSpendingChart('spending-chart', spending);
      if (tab === 'earnings') createIncomeChart('income-chart', students);
      if (tab === 'dashboard') {
        createDashboardChart('dashboard-chart', spending, students);
        renderDashboard();
      }
    });
  });

  // Restore last active tab
  const savedTab = localStorage.getItem('activeTab');
  if (savedTab) {
    const btn = document.querySelector('.tab-btn[data-tab="' + savedTab + '"]');
    if (btn) {
      btn.click();
    }
  }
}'''

content = content.replace(old, new, 1)

with open('app.js', 'w') as f:
    f.write(content)
print('Done')