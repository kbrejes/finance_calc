# 🧠 Student Payment Prediction Plan: Phase 2

## 🎯 Goal
To accurately predict when students will pay their tuition and how much income will be generated over the next 30 days. This will allow the **Dashboard Accumulation Graph** to show a "Projected" line based on historical behavior rather than just flat estimates.

---

## 🛠 Choice of Technology: Random Forest (Decision Trees)
I have chosen **Random Forest** for this implementation. 

### Why this technology?
*   **Non-Linear Patterns**: Students don't pay in a straight line. They pay based on complex "If-Then" conditions (e.g., *If I have 1 lesson left AND it's payday*). Random Forest is a collection of decision trees that are experts at discovering these rules.
*   **Small Data Expert**: Unlike Deep Learning, which needs millions of rows, Random Forest can learn very effectively from your current list of students.
*   **Robustness**: It handles "noise" well (like a student missing a class or paying a day late) without getting confused.

---

## 🧬 How the "Brain" Will Work (The Features)
We will translate your `db.json` logs into **Features** (numeric signals) that the model can process:

1.  **Credit Balance**: `(Total Payments / Lesson Price) - Total Attendance`. This is the strongest signal. If balance = 0, payment probability spikes.
2.  **Temporal Context**: 
    *   Day of Week (Do they usually pay on Mondays?)
    *   Day of Month (Do they pay after their own salary arrives on the 1st/15th?)
3.  **Attendance Momentum**: Average lessons per week over the last 30 days. This tells the brain how "fast" the student is burning through their credits.
4.  **Payment Recency**: Days since the last payment.

---

## 🚀 Implementation Roadmap

### Step 1: Data Preprocessing (The "Translator")
*   Convert ISO date strings into "Days since epoch" or "Day of week" integers.
*   Calculate the running balance for every student for every day in history.

### Step 2: Model Training
*   We will use a Node.js library (like `ml-random-forest`) to train the model on your history.
*   The "Brain" will learn the difference between "Alex" (who pays for 6 lessons at once) and "Kirill" (who pays for 12).

### Step 3: Future Forecasting
*   The model will look at the next 30 days.
*   For each day, it will calculate the probability of a "Payment Event."
*   If probability > 70%, we plot a point on your Dashboard Accumulation Graph.

---

## 📚 Study Note for Kirill
If you want to research this further, look up **"Random Forest Regressor"** and **"Time Series Feature Engineering."** You don't need to be a math genius—just think of it as the computer building a giant flow-chart of your students' habits!
