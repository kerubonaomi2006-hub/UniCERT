/**
 * User Store & Access Management Service
 * Supports 3-Tier Institutional Role Hierarchy (Proposal Section 2.3):
 * 1. GENERAL_USER (Students, Lecturers, Staff - Report incidents & view authorized results)
 * 2. IT_PERSONNEL (IT Experts / Technical Team - Review incidents, risk levels, containment playbooks & SOC triage)
 * 3. ADMIN (Administrators - Executive dashboard, full incident archive review, authorized access management)
 */

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Normalize legacy roles for full backwards compatibility
function normalizeRole(role) {
  if (!role) return 'GENERAL_USER';
  const upper = role.toUpperCase();
  if (upper === 'STUDENT' || upper === 'GENERAL_USER') return 'GENERAL_USER';
  if (upper === 'TECH_TEAM' || upper === 'IT_STAFF' || upper === 'IT_PERSONNEL') return 'IT_PERSONNEL';
  if (upper === 'ADMIN' || upper === 'ADMINISTRATOR') return 'ADMIN';
  return 'GENERAL_USER';
}

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(raw);
    return users.map(u => ({
      ...u,
      role: normalizeRole(u.role),
      status: u.status || 'ACTIVE'
    }));
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving users file:', err);
    return false;
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    role: normalizeRole(safeUser.role)
  };
}

function findUserByEmail(email) {
  if (!email) return null;
  const users = readUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  return found || null;
}

function findUserById(id) {
  if (!id) return null;
  const users = readUsers();
  const found = users.find(u => u.id === id);
  return found || null;
}

const DEMO_PASSWORDS = {
  'student@campus.ac.ke': 'student123',
  'lecturer@campus.ac.ke': 'lecturer123',
  'tech@campus.ac.ke': 'tech123',
  'admin@campus.ac.ke': 'admin123'
};

function validateCredentials(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  const expected = user.password || DEMO_PASSWORDS[user.email.toLowerCase()];
  if (expected && expected === password) {
    return sanitizeUser(user);
  }
  return null;
}

function registerUser(data) {
  const users = readUsers();
  const email = (data.email || '').trim().toLowerCase();

  if (findUserByEmail(email)) {
    throw new Error('An account with this email address already exists.');
  }

  const role = normalizeRole(data.role);
  let prefix = 'USR-GEN';
  if (role === 'IT_PERSONNEL') prefix = 'USR-IT';
  if (role === 'ADMIN') prefix = 'USR-ADM';

  const id = `${prefix}-${String(users.length + 1).padStart(3, '0')}`;

  const newUser = {
    id,
    name: (data.name || 'Campus User').trim(),
    email,
    password: data.password || 'password123',
    role,
    identifier: (data.identifier || 'N/A').trim(),
    department: (data.department || 'General Campus').trim(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return sanitizeUser(newUser);
}

function getAllUsers() {
  const users = readUsers();
  return users.map(sanitizeUser);
}

function updateUser(id, updateData) {
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  if (updateData.role) {
    users[index].role = normalizeRole(updateData.role);
  }
  if (updateData.status) {
    users[index].status = updateData.status;
  }
  if (updateData.department) {
    users[index].department = updateData.department.trim();
  }
  if (updateData.name) {
    users[index].name = updateData.name.trim();
  }

  saveUsers(users);
  return sanitizeUser(users[index]);
}

function deleteUser(id) {
  const users = readUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

module.exports = {
  readUsers,
  findUserByEmail,
  findUserById,
  validateCredentials,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
  sanitizeUser,
  normalizeRole
};
