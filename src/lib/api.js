const API_BASE = '/api'

// ============ SPENDING ENDPOINTS ============

export async function fetchSpending() {
  try {
    const res = await fetch(`${API_BASE}/spending`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch spending:', error)
    return []
  }
}

export async function addSpending(item) {
  try {
    const res = await fetch(`${API_BASE}/spending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to add spending:', error)
    return null
  }
}

export async function deleteSpending(id) {
  try {
    const res = await fetch(`${API_BASE}/spending/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (error) {
    console.error('Failed to delete spending:', error)
    return false
  }
}

export async function updateSpending(id, data) {
  try {
    const res = await fetch(`${API_BASE}/spending/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to update spending:', error)
    return null
  }
}

export async function updateSpendingPurchaseDates(id, purchaseDates) {
  try {
    const res = await fetch(`${API_BASE}/spending/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseDates }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to update spending purchase dates:', error)
    return null
  }
}

// ============ STUDENTS ENDPOINTS ============

export async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch students:', error)
    return []
  }
}

export async function addStudent(student) {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to add student:', error)
    return null
  }
}

export async function deleteStudent(id) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (error) {
    console.error('Failed to delete student:', error)
    return false
  }
}

export async function updateStudentAttendance(id, attendanceDates) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendanceDates }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to update student attendance:', error)
    return null
  }
}

export async function updateStudent(id, data) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to update student:', error)
    return null
  }
}

export async function fetchAssets() {
  const response = await fetch(`${API_BASE}/assets`);
  return response.json();
}

export async function saveAssets(assets) {
  const response = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assets),
  });
  return response.json();
}

// ============ SETTINGS ENDPOINTS ============

export async function fetchSettings() {
  try {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return { baseCurrency: 'USD', rates: { USD: 1, THB: 35, RUB: 90, USDT: 1 } };
  }
}

// ============ ML ENDPOINTS ============

export async function fetchMLSpendingPredictions() {
  try {
    const res = await fetch(`${API_BASE}/ml/predict-spending`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch ML predictions:', error)
    return {}
  }
}

export async function fetchMLIncomePredictions() {
  try {
    const res = await fetch(`${API_BASE}/ml/predict-income`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch ML income predictions:', error)
    return {}
  }
}
