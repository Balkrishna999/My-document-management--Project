// API utility for backend communication
const API_URL = 'http://localhost:5000/api';

// Fetch all documents for the current user (for data usage)
export async function fetchAllDocuments(token) {
  const res = await fetch(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

// Notes API functions
export async function fetchNotes(token) {
  const res = await fetch(`${API_URL}/notes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function createNote(token, noteData) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(noteData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create note');
  }
  return res.json();
}

export async function updateNote(token, noteId, noteData) {
  const res = await fetch(`${API_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(noteData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update note');
  }
  return res.json();
}

export async function deleteNote(token, noteId) {
  const res = await fetch(`${API_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete note');
  }
  return res.json();
}

// Fetch recent history for the logged-in user
export async function fetchRecents(token) {
  const res = await fetch(`${API_URL}/recents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch recents');
  return res.json();
}

export async function fetchUserStats(token) {
  const res = await fetch(`${API_URL}/analytics/user-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user stats');
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  return res.json();
}

export async function register(username, password, role = 'user') {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
  return res.json();
}

export async function fetchDocuments(token) {
  const res = await fetch(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument({ token, file, title, description, category, accessLevel }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('accessLevel', accessLevel);
  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
