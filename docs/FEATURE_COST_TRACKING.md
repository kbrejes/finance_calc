# Cost Input & Average Cost Feature - Implementation Summary

## Overview
Added cost tracking and average cost calculation to the purchase calendar modal for each spending item.

## Features Implemented

### 1. **Cost Input Modal** (HTML/CSS/JS)
- Replaced `prompt()` with a proper modal dialog for better UX
- Shows formatted date of purchase
- Allows entry of cost per purchase  
- Better user experience, works with browser automation
- Keyboard support: Press Enter to save, Escape to cancel

### 2. **Cost Persistence** (data.js)
- Updated data structure: purchases now store `{ date, cost }` objects
- Backward compatible with old string format (`"YYYY-MM-DD"`)
- Costs are persisted to `db.json`

### 3. **Average Cost Calculation** (data.js)
- Updated `getCalculatedSpendingMetrics()` function
- Calculates `avgCostPerPurchase` from purchase history
- Falls back to `pricePerUnit` if no cost data available
- Handles mixed old/new data formats

### 4. **Calendar Stats Display** (app.js / style.css)
- Extended stats from 3 columns to 4 columns
- New stat displayed: **AVG COST** 
- Shows average cost per purchase (formatted with currency symbol)
- Stats displayed when at least 2 purchase dates are logged

### 5. **UI Layout** (style.css)
- Updated `.calendar-stats` grid from `grid-template-columns: 1fr 1fr 1fr` to `1fr 1fr 1fr 1fr`
- Maintains visual consistency with existing stats

## Files Modified

1. **index.html**
   - Added cost input modal HTML structure
   - Form with date display and cost input field
   - Save/Cancel buttons

2. **app.js**
   - Added state variables: `pendingCostInputDate`, `pendingCostInputItemId`
   - New functions: `openCostInputModal()`, `closeCostInputModal()`, `confirmCostInput()`
   - Modified `togglePurchaseDate()` to use modal instead of `prompt()`
   - Updated stats display to show average cost
   - Added Enter key support for saving

3. **data.js**
   - Updated return object of `getCalculatedSpendingMetrics()` to include `avgCostPerPurchase`
   - Calculates average cost from purchase history

4. **style.css**
   - Updated `.calendar-stats` grid layout to 4 columns
   - Form styling already available (`.form-group`, `.inline-input`)

## Data Flow

```
User clicks calendar date
  ↓
openCostInputModal(dateStr, itemId, defaultCost)
  ↓
User enters cost and clicks Save
  ↓
confirmCostInput() saves purchase: { date, cost }
  ↓
saveSpending(spending) persists to db.json
  ↓
renderSpendingCalendar() recalculates metrics including avgCostPerPurchase
  ↓
Stats display updated with ฿XX.XX AVG COST
```

## Usage

1. Click the 📅 button on any spending item to open purchase history calendar
2. Click on any date to add a purchase
3. Enter the cost in the modal dialog
4. Click Save
5. View the average cost in the stats below the calendar

## Testing

Run: `node test_avg_cost.js`

Test coverage:
- ✓ Average cost calculation with different costs
- ✓ Mixed data formats (old string format + new object format)
- ✓ Fallback to pricePerUnit when no costs available

## Backward Compatibility

- Old purchase data (strings) still works
- New cost data (objects) is added alongside
- If migration is needed, existing string dates are converted to objects with default cost
