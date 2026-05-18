import { RandomForestRegression } from 'ml-random-forest';

// Helper to calculate days between two dates
const daysBetween = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2 - date1);
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

// Generates features from a single purchase record
const extractFeatures = (purchaseDateStr, cost) => {
  const d = new Date(purchaseDateStr);
  return [
    cost || 0,        // Feature 1: Amount of this purchase
    d.getDate(),      // Feature 2: Day of the month (1-31)
    d.getDay()        // Feature 3: Day of the week (0-6)
  ];
};

export async function generateSpendingPredictions(spendingData) {
  const predictions = {};

  spendingData.forEach(item => {
    // Only attempt ML if we have at least 3 purchases to learn a pattern
    if (!item.purchaseDates || item.purchaseDates.length < 3) {
      return; 
    }

    // Sort chronologically
    const sorted = [...item.purchaseDates].sort((a, b) => new Date(a.date) - new Date(b.date));

    const X = []; // Features Matrix
    const y_days = []; // Target 1: Days until next purchase
    const y_amount = []; // Target 2: Amount of next purchase

    // Build training data by pairing adjacent purchases (A -> B)
    for (let i = 0; i < sorted.length - 1; i++) {
      const A = sorted[i];
      const B = sorted[i + 1];

      // Features known at time A
      X.push(extractFeatures(A.date, A.cost));
      
      // What actually happened at time B (The Labels to learn)
      y_days.push(daysBetween(A.date, B.date));
      y_amount.push(B.cost || 0);
    }

    // Train the models
    const options = {
      seed: 42,
      replacement: true,
      nEstimators: 50,
      noOOB: true
    };

    const daysModel = new RandomForestRegression(options);
    daysModel.train(X, y_days);

    const amountModel = new RandomForestRegression(options);
    amountModel.train(X, y_amount);

    // Predict the FUTURE!
    const lastPurchase = sorted[sorted.length - 1];
    const currentFeatures = [extractFeatures(lastPurchase.date, lastPurchase.cost)];
    
    const predictedDaysUntilNext = daysModel.predict(currentFeatures)[0];
    const predictedNextAmount = amountModel.predict(currentFeatures)[0];

    const nextDate = new Date(lastPurchase.date);
    nextDate.setDate(nextDate.getDate() + Math.round(predictedDaysUntilNext));

    // Save prediction for this class
    predictions[item.id] = {
      className: item.className,
      predictedNextDate: nextDate.toISOString().split('T')[0],
      predictedDaysUntilNext: Math.round(predictedDaysUntilNext),
      predictedNextAmount: Math.round(predictedNextAmount),
      confidenceScore: 'Moderate',
      currency: item.currency
    };
  });

  return predictions;
}

export async function generateIncomePredictions(studentsData) {
  const predictions = {};

  studentsData.forEach(student => {
    // We need at least 3 payments to establish a reliable temporal pattern
    if (!student.payments || student.payments.length < 3) {
      return; 
    }

    // Sort chronologically
    const sorted = [...student.payments].sort((a, b) => new Date(a.date) - new Date(b.date));

    const X = []; // Features Matrix
    const y_days = []; // Target 1: Days until next payment
    const y_amount = []; // Target 2: Amount of next payment

    // Build training data by pairing adjacent payments (A -> B)
    for (let i = 0; i < sorted.length - 1; i++) {
      const A = sorted[i];
      const B = sorted[i + 1];

      // Features known at time A
      X.push(extractFeatures(A.date, A.amount));
      
      // What actually happened at time B
      y_days.push(daysBetween(A.date, B.date));
      y_amount.push(B.amount || 0);
    }

    // Train the models
    const options = {
      seed: 42,
      replacement: true,
      nEstimators: 50,
      noOOB: true
    };

    const daysModel = new RandomForestRegression(options);
    daysModel.train(X, y_days);

    const amountModel = new RandomForestRegression(options);
    amountModel.train(X, y_amount);

    // Predict the FUTURE!
    const lastPayment = sorted[sorted.length - 1];
    const currentFeatures = [extractFeatures(lastPayment.date, lastPayment.amount)];
    
    const predictedDaysUntilNext = daysModel.predict(currentFeatures)[0];
    const predictedNextAmount = amountModel.predict(currentFeatures)[0];

    const nextDate = new Date(lastPayment.date);
    nextDate.setDate(nextDate.getDate() + Math.round(predictedDaysUntilNext));

    // Save prediction for this student
    predictions[student.id] = {
      name: student.name,
      predictedNextDate: nextDate.toISOString().split('T')[0],
      predictedDaysUntilNext: Math.round(predictedDaysUntilNext),
      predictedNextAmount: Math.round(predictedNextAmount),
      confidenceScore: 'Moderate',
      currency: student.currency
    };
  });

  return predictions;
}
