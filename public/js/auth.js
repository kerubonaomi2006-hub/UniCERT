/**
 * Auth & Theme Manager
 * Supports 3-Tier Institutional Role Hierarchy (Proposal Section 2.3):
 * 1. GENERAL_USER (Students, Lecturers, Staff - Basic reporting, personal dashboard, no admin access)
 * 2. IT_PERSONNEL (IT Experts / Technical Team - Review incidents, risk levels, containment playbooks & SOC triage)
 * 3. ADMIN (Administrators - Executive dashboard, incident records review, authorized access management)
 */

const DEMO_PRESETS = {
  GENERAL_USER: {
    email: 'student@campus.ac.ke',
    password: 'student123',
    role: 'GENERAL_USER',
    roleLabel: 'General User (Student/Staff)',
    name: 'Brian Kipchumba',
    identifier: 'STD/2026/0481',
    department: 'School of Technology',
    avatar: '👤',
    badgeClass: 'badge-user',
    defaultPane: 'userDashboardPane'
  },
  IT_PERSONNEL: {
    email: 'tech@campus.ac.ke',
    password: 'tech123',
    role: 'IT_PERSONNEL',
    roleLabel: 'IT Personnel (Technical Expert)',
    name: 'Kenneth Ochieng',
    identifier: 'ICT/041',
    department: 'Directorate of ICT & Cyber Defense',
    avatar: '🛠️',
    badgeClass: 'badge-tech',
    defaultPane: 'techSupervisorPane'
  },
  ADMIN: {
    email: 'admin@campus.ac.ke',
    password: 'admin123',
    role: 'ADMIN',
    roleLabel: 'Administrator (Governance & Access)',
    name: 'Prof. David Mutua',
    identifier: 'ADM/002',
    department: 'Office of the Vice Chancellor / Security Governance',
    avatar: '👑',
    badgeClass: 'badge-admin',
    defaultPane: 'adminDashboardPane'
  }
};

// Backwards compatibility aliases
DEMO_PRESETS.STUDENT = DEMO_PRESETS.GENERAL_USER;
DEMO_PRESETS.TECH_TEAM = DEMO_PRESETS.IT_PERSONNEL;

const Theme = {
  current: 'dark',

  init() {
    const saved = localStorage.getItem('unicert_theme') || 'dark';
    this.setTheme(saved);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  },

  setTheme(theme) {
    this.current = theme;
    localStorage.setItem('unicert_theme', theme);
    const body = document.body;
    const btn = document.getElementById('themeToggleBtn');

    if (theme === 'light') {
      body.classList.add('light-theme');
      if (btn) btn.innerHTML = `<span>🌙</span> Dark Mode`;
    } else {
      body.classList.remove('light-theme');
      if (btn) btn.innerHTML = `<span>☀️</span> Light Mode`;
    }
  },

  toggle() {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  }
};

const Auth = {
  currentUser: null,

  init() {
    const saved = localStorage.getItem('unicert_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        // Normalize role if stored under older name
        if (this.currentUser.role === 'STUDENT') this.currentUser.role = 'GENERAL_USER';
        if (this.currentUser.role === 'TECH_TEAM') this.currentUser.role = 'IT_PERSONNEL';
      } catch (e) {
        this.currentUser = DEMO_PRESETS.GENERAL_USER;
      }
    } else {
      this.currentUser = DEMO_PRESETS.GENERAL_USER;
    }

    this.applyRoleUI(this.currentUser.role);
    this.bindEvents();
  },

  getCurrentUser() {
    return this.currentUser || DEMO_PRESETS.GENERAL_USER;
  },

  async login(email, password) {
    try {
      const user = await API.login(email, password);
      this.setUserSession(user);
      this.closeAuthModal();
      return user;
    } catch (err) {
      alert('Login Error: ' + err.message);
      throw err;
    }
  },

  async register(data) {
    try {
      const user = await API.register(data);
      this.setUserSession(user);
      this.closeAuthModal();
      alert(`Welcome, ${user.name}! Your account as ${this.getRoleDisplay(user.role)} has been created.`);
      return user;
    } catch (err) {
      alert('Registration Error: ' + err.message);
      throw err;
    }
  },

  getRoleDisplay(role) {
    if (role === 'ADMIN') return 'Administrator (Security & Governance)';
    if (role === 'IT_PERSONNEL' || role === 'TECH_TEAM') return 'IT Personnel (Technical Expert)';
    return 'General User (Student/Lecturer/Staff)';
  },

  demoLogin(roleKey) {
    const preset = DEMO_PRESETS[roleKey] || DEMO_PRESETS.GENERAL_USER;
    this.setUserSession(preset);
    this.closeAuthModal();
  },

  setUserSession(user) {
    let normalizedRole = user.role;
    if (normalizedRole === 'STUDENT') normalizedRole = 'GENERAL_USER';
    if (normalizedRole === 'TECH_TEAM') normalizedRole = 'IT_PERSONNEL';

    let avatar = '👤';
    let roleLabel = 'General User';
    let badgeClass = 'badge-user';
    let defaultPane = 'userDashboardPane';

    if (normalizedRole === 'IT_PERSONNEL') {
      avatar = '🛠️';
      roleLabel = 'IT Personnel (Technical Expert)';
      badgeClass = 'badge-tech';
      defaultPane = 'techSupervisorPane';
    } else if (normalizedRole === 'ADMIN') {
      avatar = '👑';
      roleLabel = 'Administrator (Governance)';
      badgeClass = 'badge-admin';
      defaultPane = 'adminDashboardPane';
    } else {
      avatar = '👤';
      roleLabel = 'General User (Student/Staff)';
      badgeClass = 'badge-user';
      defaultPane = 'userDashboardPane';
    }

    this.currentUser = {
      ...user,
      role: normalizedRole,
      avatar,
      roleLabel,
      badgeClass,
      defaultPane
    };

    localStorage.setItem('unicert_session', JSON.stringify(this.currentUser));
    this.applyRoleUI(this.currentUser.role);

    if (window.switchTab) {
      window.switchTab(this.currentUser.defaultPane);
    }
  },

  logout() {
    this.demoLogin('GENERAL_USER');
    alert('Signed out. Switched to General User Portal view.');
  },

  applyRoleUI(role) {
    let normalizedRole = role;
    if (normalizedRole === 'STUDENT') normalizedRole = 'GENERAL_USER';
    if (normalizedRole === 'TECH_TEAM') normalizedRole = 'IT_PERSONNEL';

    const isGeneral = normalizedRole === 'GENERAL_USER';
    const isIT = normalizedRole === 'IT_PERSONNEL';
    const isAdmin = normalizedRole === 'ADMIN';

    const user = this.getCurrentUser();

    // 1. Update Header Info
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const avatarEl = document.getElementById('headerUserAvatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      roleEl.textContent = this.getRoleDisplay(normalizedRole);
      roleEl.className = `role-pill-badge ${user.badgeClass || (isAdmin ? 'badge-admin' : isIT ? 'badge-tech' : 'badge-user')}`;
    }
    if (avatarEl) avatarEl.textContent = user.avatar || (isAdmin ? '👑' : isIT ? '🛠️' : '👤');

    // 2. Adapt Navigation Tabs
    const userTab = document.querySelector('[data-target="userDashboardPane"]');
    const techTab = document.querySelector('[data-target="techSupervisorPane"]');
    const adminTab = document.querySelector('[data-target="adminDashboardPane"]');
    const triageTab = document.querySelector('[data-target="triagePane"]');
    const simTab = document.querySelector('[data-target="simulatorPane"]');
    const usersTab = document.querySelector('[data-target="usersPane"]');

    if (isGeneral) {
      // General User: My Portal, Report Incident, Track Ticket
      if (userTab) userTab.style.display = 'flex';
      if (techTab) techTab.style.display = 'none';
      if (adminTab) adminTab.style.display = 'none';
      if (triageTab) triageTab.style.display = 'none';
      if (simTab) simTab.style.display = 'none';
      if (usersTab) usersTab.style.display = 'none';
    } else if (isIT) {
      // IT Personnel: IT Console, SOC Triage, Risk Simulator, Report, Track
      if (userTab) userTab.style.display = 'none';
      if (techTab) techTab.style.display = 'flex';
      if (adminTab) adminTab.style.display = 'none';
      if (triageTab) triageTab.style.display = 'flex';
      if (simTab) simTab.style.display = 'flex';
      if (usersTab) usersTab.style.display = 'none';
    } else if (isAdmin) {
      // Administrator: Governance Hub, Triage/Archive, User Management, Report, Track
      if (userTab) userTab.style.display = 'none';
      if (techTab) techTab.style.display = 'none';
      if (adminTab) adminTab.style.display = 'flex';
      if (triageTab) triageTab.style.display = 'flex';
      if (simTab) simTab.style.display = 'flex';
      if (usersTab) usersTab.style.display = 'flex';
    }

    // Refresh active dashboards
    if (window.refreshAllDashboards) {
      window.refreshAllDashboards();
    }
    if (isAdmin && window.refreshUserManagement) {
      window.refreshUserManagement();
    }
  },

  openAuthModal() {
    document.getElementById('authModal')?.classList.add('open');
  },

  closeAuthModal() {
    document.getElementById('authModal')?.classList.remove('open');
  },

  bindEvents() {
    document.getElementById('headerProfileBtn')?.addEventListener('click', () => {
      this.openAuthModal();
    });

    document.getElementById('authModalCloseBtn')?.addEventListener('click', () => {
      this.closeAuthModal();
    });

    const signInTabBtn = document.getElementById('tabSignInBtn');
    const registerTabBtn = document.getElementById('tabRegisterBtn');
    const signInForm = document.getElementById('signInFormContainer');
    const registerForm = document.getElementById('registerFormContainer');

    signInTabBtn?.addEventListener('click', () => {
      signInTabBtn.classList.add('active');
      registerTabBtn.classList.remove('active');
      signInForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    registerTabBtn?.addEventListener('click', () => {
      registerTabBtn.classList.add('active');
      signInTabBtn.classList.remove('active');
      registerForm.style.display = 'block';
      signInForm.style.display = 'none';
    });

    // 1-Click Demo Logins for all 3 roles
    document.getElementById('demoLoginUserBtn')?.addEventListener('click', () => {
      this.demoLogin('GENERAL_USER');
    });

    document.getElementById('demoLoginStudentBtn')?.addEventListener('click', () => {
      this.demoLogin('GENERAL_USER');
    });

    document.getElementById('demoLoginTechBtn')?.addEventListener('click', () => {
      this.demoLogin('IT_PERSONNEL');
    });

    document.getElementById('demoLoginAdminBtn')?.addEventListener('click', () => {
      this.demoLogin('ADMIN');
    });

    // Sign In Form submission
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const pass = document.getElementById('loginPassword')?.value;
      if (email && pass) {
        await this.login(email, pass);
      }
    });

    // Registration Role Selection
    const roleBoxes = document.querySelectorAll('.role-choice-box');
    let selectedRegRole = 'GENERAL_USER';
    roleBoxes.forEach(box => {
      box.addEventListener('click', () => {
        roleBoxes.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        selectedRegRole = box.dataset.role;
      });
    });

    // Register Form submission
    document.getElementById('registrationForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName')?.value;
      const email = document.getElementById('regEmail')?.value;
      const password = document.getElementById('regPassword')?.value;
      const identifier = document.getElementById('regIdentifier')?.value;
      const department = document.getElementById('regDept')?.value;

      if (name && email && password) {
        await this.register({
          name,
          email,
          password,
          role: selectedRegRole,
          identifier,
          department
        });
      }
    });
  }
};

window.Theme = Theme;
window.Auth = Auth;
