# 🛒 Purchase Price Tracking Feature - Implementation Plan

## Overview
Enhance the spending calendar to track actual purchase prices alongside frequency. Each logged purchase will include an editable price input field, enabling calculation of average cost per purchase for each tracked item.

---

## Phase 1: Data Structure Updates ✅ (Already Completed)

### Current State:
- `purchaseDates` array stores `{date, cost}` objects instead of just date strings
- Cost defaults to estimated monthly cost when first clicked

### Required Changes:
**No additional changes needed.**

---

## Phase 2: HTML - Add Input Field to Calendar Cells

### File: `/Users/kirill/Desktop/finance_calc/index.html`

**Location:** Inside `renderSpendingCalendar()` function, within the `.cal-day` div generation.

```html
<!-- Replace this line -->
<div class="${classes}" onclick="togglePurchaseDate('${dateStr}')">${i}</div>

<!-- With -->
<div class="${classes}"
     onclick="togglePurchaseDate('${dateStr}')">
  ${i}
  
  <!-- Cost display (badge or input) -->
  ${(costHtml || '')}
</div>
```

### Code Block: `renderSpendingCalendar()` - Cell Generation
```javascript
let costHtml = '';

// Check if purchase data exists for this date
if (purchaseData) {
  // Show existing cost badge with cyan styling
  costHtml = `
    <span class="purchase-cost text-cyan">
      ${CURRENCY}${formatNum(purchaseData.cost)}
    </span>`;
} else if (isFuture && !purchaseData.dateExists) {
  // Future cell - show hidden input field for editing
  costHtml = `
    <input 
      type="number" 
      class="purchase-cost-input"
      placeholder="${CURRENCY}0.00"
      step="0.01"
      min="0"
      max="99999"
      id="cost-input-${dateStr}"
      onblur="handleCostBlur('${dateStr}', ${item.id})"
    >
  `;
}

// Build the full day cell HTML
html += `<div class="${classes}" onclick="togglePurchaseDate('${dateStr}')">
  ${i}${costHtml || ''}</div>`;
```

---

## Phase 3: CSS Styling for Cost Input Fields

### File: `/Users/kirill/Desktop/finance_calc/style.css`

**Append these styles to the end of the file:**

```css
/* ============================================
   Purchase Price Input & Badge Styles
   ============================================ */

/* Cost input field (hidden by default, shown on focus/hover) */
.purchase-cost-input {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  height: 36px;
  padding: 4px 8px;
  font-size: 0.7rem;
  line-height: 1;
  background-color: rgba(99, 179, 237, 0.05);
  border: 1px solid var(--border-glass-hover);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: inherit;
  transition: all var(--transition-fast);
  outline: none;
  overflow: hidden; /* Prevent text truncation */
}

.purchase-cost-input:focus {
  background-color: rgba(99, 179, 237, 0.15);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.1);
}

.purchase-cost-input::placeholder {
  color: var(--text-muted);
  font-size: 0.65rem;
}

/* Cost badge (existing cyan styling) */
.purchase-cost.text-cyan {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  background-color: rgba(99, 179, 237, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(99, 179, 237, 0.3);
}

/* Badge clear button (optional) */
.clear-cost-btn {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all var(--transition-fast);
}

.clear-cost-btn:hover {
  background-color: rgba(248, 113, 113, 0.9);
  color: var(--accent-red);
}

/* Show input when cell is focused or clicked */
.cal-day.future:focus-within .purchase-cost-input,
.cal-day.future:hover .purchase-cost-input {
  display: block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .purchase-cost-input {
    width: 100px;
    font-size: 0.6rem;
  }
}
```

---

## Phase 4: JavaScript Logic - Price Input Handling

### New Functions to Add:

#### A. `handleCostBlur(dateStr, itemId)` 
Handles cost input blur event (when user leaves the field)
```javascript
function handleCostBlur(dateStr, itemId) {
  const item = spending.find(i => i.id === itemId);
  if (!item || !item.purchaseDates) return;
  
  // Get current input element and its value
  let inputEl = document.getElementById(`cost-input-${dateStr}`);
  if (!inputEl) return;
  
  const userValue = parseFloat(inputEl.value.trim());
  
  // Validate: reject negative or non-numeric values
  if (isNaN(userValue) || userValue < 0 || userValue > 99999) {
    inputEl.value = ''; // Clear invalid value
    return;
  }
  
  // If no valid value, default to estimated monthly cost
  let finalCost = userValue !== undefined ? userValue : null;
  if (finalCost === null || !isFinite(finalCost)) {
    const estCost = Math.round((item.pricePerUnit * (item.units / 30)) * 10) / 10;
    inputEl.value = `${CURRENCY}${formatNum(estCost)}`;
    finalCost = parseFloat(inputEl.value.replace(/[\s฿]/g, ''));
  }
  
  // Update the purchase date entry with actual cost
  const idx = item.purchaseDates.findIndex(pd => pd.date === dateStr);
  if (idx > -1) {
    // Replace existing entry
    item.purchaseDates[idx].cost = finalCost;
  } else {
    // Add new entry (should not happen, but handle gracefully)
    item.purchaseDates.push({
      date: dateStr,
      cost: finalCost,
      note: ''
    });
  }
  
  // Save to localStorage
  saveSpending(spending);
  
  // Update the display badge
  updateCostBadge(dateStr, finalCost);
  
  // If on Dashboard tab, refresh dashboard stats if needed
  if (document.getElementById('tab-dashboard').classList.contains('active')) {
    renderDashboard();
  } else {
    renderBanner(); // Refresh top banner with updated spending
  }
}
```

#### B. `handleCostFocus(dateStr)` 
Clears placeholder and shows hint when input is focused
```javascript
function handleCostFocus(dateStr) {
  const inputEl = document.getElementById(`cost-input-${dateStr}`);
  if (inputEl && !inputEl.value) {
    // Remove placeholder to allow custom text entry
    inputEl.placeholder = '';
    inputEl.select(); // Auto-select for easy editing
  }
}
```

#### C. `updateCostBadge(dateStr, cost)` 
Renders the cyan cost badge in place of input field
```javascript
function updateCostBadge(dateStr, cost) {
  let el = document.querySelector(`.cal-day[data-date="${dateStr}"]`);
  if (!el) return;
  
  const oldSpan = el.querySelector('.purchase-cost.text-cyan');
  if (oldSpan) {
    // Already has badge, nothing to do
    return;
  }
  
  // Create new badge with clear button (optional)
  el.innerHTML += `
    <span class="purchase-cost text-cyan">
      ${CURRENCY}${formatNum(cost)}
    </span>`;
}
```

#### D. `clearCost(dateStr, itemId)` 
Removes a purchase entry entirely (with clear button)
```javascript
function clearCost(dateStr, itemId) {
  const item = spending.find(i => i.id === itemId);
  if (!item || !item.purchaseDates) return;
  
  // Remove the specific date entry
  item.purchaseDates = item.purchaseDates.filter(pd => pd.date !== dateStr);
  
  saveSpending(spending);
  renderSpendingCalendar();
}
```

---

## Phase 5: Updated `togglePurchaseDate()` Logic

**File:** `/Users/kirill/Desktop/finance_calc/app.js`

```javascript
function togglePurchaseDate(dateStr) {
  const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
  const year = currentDate.split('-')[0];
  const month = currentDate.split('-')[1].padStart(2, '0');
  
  // Check if the clicked date is today or past (already handled)
  if (dateStr <= currentDate) {
    return; // Cannot toggle on past dates
  }
  
  // Get current item for this calendar
  const itemId = document.getElementById('spending-calendar-item-id')?.value || null;
  if (!itemId) {
    showNotification('Please select a spending category first.', 'error');
    return;
  }
  
  const item = spending.find(i => i.id === parseInt(itemId));
  if (!item) return;
  
  // Check if there's already a purchase data entry for this date
  let purchaseData = null;
  for (const pd of item.purchaseDates || []) {
    if (pd.date === dateStr) {
      purchaseData = pd;
      break;
    }
  }
  
  // If exists, remove and re-add with new cost from input
  if (purchaseData) {
    // Remove existing entry
    item.purchaseDates = item.purchaseDates.filter(pd => pd.date !== dateStr);
    
    // Get current value from input field if visible
    const inputEl = document.getElementById(`cost-input-${dateStr}`);
    let newCost = purchaseData.cost; // Default to old cost
    
    if (inputEl && inputEl.value) {
      const userInput = parseFloat(inputEl.value.replace(/[\s฿]/g, ''));
      if (!isNaN(userInput)) {
        newCost = Math.max(0, userInput);
      }
    } else {
      // No user input - use estimated cost
      newCost = item.pricePerUnit * (item.units / 30);
    }
    
    // Add back with new cost and focus the input
    const estCost = Math.round((newCost) * 10) / 10;
    
    item.purchaseDates.push({
      date: dateStr,
      cost: estCost,
      note: ''
    });
    
    saveSpending(spending);
    renderSpendingCalendar(); // Re-render to show updated state
  } else {
    // New purchase - use estimated cost as default, then let user edit
    const estCost = Math.round((item.pricePerUnit * (item.units / 30)) * 10) / 10;
    
    item.purchaseDates.push({
      date: dateStr,
      cost: estCost,
      note: ''
    });
    
    saveSpending(spending);
    renderSpendingCalendar(); // Re-render to show input field
  }
}
```

---

## Phase 6: Update Stats Display (Average Price Calculation)

### Location: Inside `renderSpendingCalendar()` - Stats section

**Current stats display:**
- Total purchases count
- Avg days between purchases
- Next expected purchase

**Add new stats after existing ones:**
```javascript
// Calculate price metrics
const totalPurchases = item.purchaseDates?.length || 0;
let totalCost = 0;
if (item.purchaseDates) {
  totalCost = item.purchaseDates.reduce((sum, pd) => sum + pd.cost, 0);
}

const avgPrice = totalPurchases > 0 
  ? Math.round(totalCost / totalPurchases * 10) / 10 
  : '—';

// Add price statistics to the HTML after frequency stats
let statsHtml = `
  <div class="calendar-stats">
    ${existingStatsHtml} <!-- Frequency stats -->
    
    <!-- Price Statistics (NEW) -->
    <div style="margin-top: 8px;">
      <span class="cal-stat-value text-purple">${CURRENCY}${formatNum(totalCost)}</span>
      <span class="cal-stat-label">Total Spent</span>
    </div>
    <div style="margin-top: 2px;">
      <span class="cal-stat-value text-pink">~${avgPrice}</span>
      <span class="cal-stat-label">Avg Cost per Purchase</span>
    </div>
  </div>`;
```

---

## Phase 7: Testing & Edge Cases

### Test Scenarios:

| Scenario | Expected Behavior |
|----------|------------------|
| **Multiple purchases same day** | Allow it - different instances tracked separately |
| **Cost changes over time** | Update existing entry OR create new one (current logic: replace) |
| **User enters negative cost** | Reject with validation, default to estimated monthly |
| **User enters zero** | Accept but warn (optional), or reject and use estimated |
| **Very large/small number** | Validate range: 0-99999 ฿ |
| **Keyboard navigation** | Tab between inputs works smoothly |
| **Mobile touch** | Input field appears on tap, keyboard opens correctly |

### Validation Logic in `handleCostBlur`:
```javascript
const minPrice = 0;
const maxPrice = item.pricePerUnit * 10; // Reasonable upper limit

if (costValue < minPrice || costValue > maxPrice) {
  const estCost = Math.round((item.pricePerUnit * (item.units / 30)) * 10) / 10;
  inputEl.value = `${CURRENCY}${formatNum(estCost)}`;
}
```

---

## Phase 8: Future Enhancements (Optional)

### Enhancement Ideas:

1. **Price Trend Chart** - Show how purchase prices have changed over time on dashboard
2. **Category-based Averages** - Compare average costs across categories (Housing vs Food, etc.)
3. **Budget Alerts** - Notify when total spending in category exceeds monthly budget
4. **Export Data** - Backup all purchases with timestamps and prices as JSON/CSV
5. **Import Data** - Restore backed-up data with price history
6. **Price History Graph** - Visualize cost changes on main dashboard chart

---

## Summary of Changes Required:

| File | Lines to Add | Complexity | Priority |
|------|-------------|------------|----------|
| `index.html` | +2 lines per cell (inside loop) | Easy | **High** |
| `style.css` | +40 lines | Medium | **High** |
| `app.js` | +150-200 lines | Medium-High | Critical |
| - | - | - | - |

**Total new code: ~250+ lines across 3 files**

---

## Deployment Checklist:

- [ ] Add CSS styles to `style.css`
- [ ] Update HTML template in `index.html` (inside render loop)
- [ ] Implement `handleCostBlur()` and related functions in `app.js`
- [ ] Test on Chrome, Safari, Firefox, mobile browsers
- [ ] Verify localStorage persistence works correctly
- [ ]