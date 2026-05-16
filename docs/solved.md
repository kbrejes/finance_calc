1. Mixed Data Types in purchaseDates (Major Red Flag)
The database (db.json) stores purchaseDates as a mix of primitive strings and objects. Some entries are just strings ("2026-05-02"), while newer entries are objects ({ date: "...", cost: 8200, account: "..." }). Because of this, the frontend code is littered with ternary operators like typeof d === 'string' ? ... : d.cost to avoid crashing. A new developer expects an array of objects to have a consistent schema.

2. The "Frankenstein" Git Backup Script in server.js
Inside the Node backend (server.js), the writeDB function triggers a syncToGithub() function every time data is saved. This function runs raw shell commands: it stages db.json, commits it, force-pushes to a data-backup branch, and then runs git reset HEAD~1 to hide what it just did. This is incredibly non-standard. It actively fights against a normal developer's Git workflow and is exactly what caused your deployment server to get stuck in a detached state earlier.

3. Hardcoded Currency Exchange Rates
In DashboardTab.jsx, the total liquid capital calculation contains hardcoded, inline currency multipliers: const multiplier = acc.currency === 'USDT' ? 36 : (acc.currency === 'USD' ? 35 : 1) If the exchange rate changes, a new developer would have to hunt down this specific line buried inside a React component to update the math.

4. "Triple-Fallback" Account Logic
When calculating deductions in SpendingTab and SpendingCalendarModal, the code uses entry.account || item.account || 'none'. This means an expense tries to pull its funding source from the specific calendar entry first, then falls back to the parent category's default account, and finally falls back to a string 'none'. Tracing exactly where money is being deducted from is highly ambiguous because of these silent fallbacks.

5. Massive Inline Calculations in UI Components
DashboardTab.jsx doesn't just render UI; it acts as a massive data-processing engine. Inside a single useMemo hook, it loops through dates, calculates cumulative spending arrays, processes lifetime income, and transforms data for Chart.js all at once. This tightly couples the business logic to the view layer, making it very hard to test or read.