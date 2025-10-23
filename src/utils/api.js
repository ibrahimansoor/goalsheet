const API_URL = '/api';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Auth APIs
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Daily Performance APIs
export async function getDailyPerformance(userId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/daily-performance/user/${userId}?${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getPreviousDayPerformance(userId, date) {
  const query = date ? `?date=${date}` : '';
  const response = await fetch(`${API_URL}/daily-performance/user/${userId}/previous${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function submitDailyPerformance(userId, data) {
  const response = await fetch(`${API_URL}/daily-performance/user/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getTeamPerformance(date) {
  const query = date ? `?date=${date}` : '';
  const response = await fetch(`${API_URL}/daily-performance/team${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Weekly Goals APIs
export async function getWeeklyGoals(userId, weekStart) {
  const query = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await fetch(`${API_URL}/weekly-goals/user/${userId}${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getWeeklyGoalsHistory(userId, limit = 12) {
  const response = await fetch(`${API_URL}/weekly-goals/user/${userId}/history?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function saveWeeklyGoals(userId, data) {
  const response = await fetch(`${API_URL}/weekly-goals/user/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// 6996 Goals APIs
export async function getSix996Goals(userId, weekStart) {
  const query = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await fetch(`${API_URL}/six996-goals/user/${userId}${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function saveSix996Goals(userId, data) {
  const response = await fetch(`${API_URL}/six996-goals/user/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Coaching APIs
export async function getCoachingHistory(userId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/coaching/user/${userId}?${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getTodayCoaching(userId) {
  const response = await fetch(`${API_URL}/coaching/user/${userId}/today`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function acknowledgeCoaching(coachingId) {
  const response = await fetch(`${API_URL}/coaching/${coachingId}/acknowledge`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getWeeklySummary(userId, weekStart) {
  const query = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await fetch(`${API_URL}/coaching/user/${userId}/weekly-summary${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getTeamCoachingOverview(date) {
  const query = date ? `?date=${date}` : '';
  const response = await fetch(`${API_URL}/coaching/team/overview${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Users APIs
export async function getTeamMembers() {
  const response = await fetch(`${API_URL}/users/team/members`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
