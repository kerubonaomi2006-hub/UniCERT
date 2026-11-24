/**
 * REST API Client for Cyber Incident Reporting System
 */

const API = {
  baseUrl: window.location.origin,

  async login(email, password) {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data.user;
  },

  async register(payload) {
    const res = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data.user;
  },

  async getTaxonomies() {
    const res = await fetch(`${this.baseUrl}/api/taxonomies`);
    return await res.json();
  },

  async getStats() {
    const res = await fetch(`${this.baseUrl}/api/stats`);
    return await res.json();
  },

  async getIncidents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.riskLevel && filters.riskLevel !== 'ALL') params.append('riskLevel', filters.riskLevel);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${this.baseUrl}/api/incidents?${params.toString()}`);
    return await res.json();
  },

  async getIncidentById(id) {
    const res = await fetch(`${this.baseUrl}/api/incidents/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Incident ${id} not found`);
    return await res.json();
  },

  async createIncident(payload) {
    const res = await fetch(`${this.baseUrl}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit incident');
    }
    return await res.json();
  },

  async updateIncident(id, updates) {
    const res = await fetch(`${this.baseUrl}/api/incidents/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update incident');
    return await res.json();
  },

  async previewRiskAssessment(payload) {
    const res = await fetch(`${this.baseUrl}/api/assess-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getKenetDossier(id) {
    const res = await fetch(`${this.baseUrl}/api/export/kenet-cert/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch KENET dossier');
    return await res.json();
  },

  async getUsers() {
    const res = await fetch(`${this.baseUrl}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  async createUser(payload) {
    const res = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  async updateUser(id, updates) {
    const res = await fetch(`${this.baseUrl}/api/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data.user;
  },

  async deleteUser(id) {
    const res = await fetch(`${this.baseUrl}/api/users/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async getCampusAlert() {
    const res = await fetch(`${this.baseUrl}/api/alerts/campus`);
    if (!res.ok) throw new Error('Failed to fetch campus alert');
    const data = await res.json();
    return data.alert;
  },

  async updateCampusAlert(payload) {
    const res = await fetch(`${this.baseUrl}/api/alerts/campus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update campus alert');
    return data.alert;
  }
};

window.API = API;
