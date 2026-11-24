/**
 * Main Application Controller
 * Coordinates tab switching, initialization, and multi-role views
 */

function switchTab(targetPaneId) {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  const panes = document.querySelectorAll('.tab-content-pane');

  tabs.forEach(t => {
    if (t.dataset.target === targetPaneId) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  panes.forEach(p => {
    if (p.id === targetPaneId) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  // Call pane-specific refresh handlers
  if (window.refreshAllDashboards) window.refreshAllDashboards();
  if (targetPaneId === 'triagePane' && window.refreshTriage) window.refreshTriage();
  if (targetPaneId === 'usersPane' && window.refreshUserManagement) window.refreshUserManagement();
  if (targetPaneId === 'trackerPane' && window.refreshTracker) window.refreshTracker();
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🛡️ Initializing UniCERT Cyber Incident & Risk Assessment Platform...');

  // Setup Tab Navigation
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPaneId = tab.dataset.target;
      switchTab(targetPaneId);
    });
  });

  // Modal close handlers
  document.getElementById('confirmModalCloseBtn')?.addEventListener('click', () => {
    document.getElementById('confirmationModal')?.classList.remove('open');
  });

  document.getElementById('closeKenetDossierBtn')?.addEventListener('click', () => {
    window.closeKenetModal();
  });

  document.getElementById('printKenetBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Export CSV button
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    window.location.href = `${window.location.origin}/api/export/csv`;
  });

  // Initialize subsystems
  if (window.Theme) window.Theme.init();
  if (window.initReportingForm) await window.initReportingForm();
  if (window.bindTriageControls) window.bindTriageControls();
  if (window.refreshTriage) await window.refreshTriage();
  if (window.initTracker) window.initTracker();
  if (window.initSimulator) window.initSimulator();
  if (window.Auth) window.Auth.init();
  if (window.initAdminAlertForm) window.initAdminAlertForm();
  if (window.loadCampusAlert) await window.loadCampusAlert();

  // ── Handle ?register=ROLE or ?login=true redirect from landing page ───────
  const urlParams = new URLSearchParams(window.location.search);
  const regRole = urlParams.get('register');
  const isLogin = urlParams.get('login');

  if (regRole) {
    // Clean URL without reloading page
    window.history.replaceState({}, '', window.location.pathname);

    // Open the auth modal on the Registration tab
    setTimeout(() => {
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.add('open');

      const registerTabBtn = document.getElementById('tabRegisterBtn');
      const signInTabBtn   = document.getElementById('tabSignInBtn');
      const signInForm     = document.getElementById('signInFormContainer');
      const registerForm   = document.getElementById('registerFormContainer');
      if (registerTabBtn) {
        registerTabBtn.classList.add('active');
        if (signInTabBtn)   signInTabBtn.classList.remove('active');
        if (signInForm)     signInForm.style.display = 'none';
        if (registerForm)   registerForm.style.display = 'block';
      }

      // Pre-select role
      const targetRole = (regRole === 'true' || !regRole) ? 'GENERAL_USER' : regRole;
      const roleBoxes = document.querySelectorAll('.role-choice-box');
      roleBoxes.forEach(box => {
        box.classList.remove('selected');
        if (box.dataset.role === targetRole) box.classList.add('selected');
      });
    }, 120);
  } else if (isLogin) {
    // Clean URL without reloading page
    window.history.replaceState({}, '', window.location.pathname);

    // Open the auth modal on the Sign In tab
    setTimeout(() => {
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.add('open');

      const registerTabBtn = document.getElementById('tabRegisterBtn');
      const signInTabBtn   = document.getElementById('tabSignInBtn');
      const signInForm     = document.getElementById('signInFormContainer');
      const registerForm   = document.getElementById('registerFormContainer');
      if (signInTabBtn) {
        signInTabBtn.classList.add('active');
        if (registerTabBtn) registerTabBtn.classList.remove('active');
        if (signInForm)     signInForm.style.display = 'block';
        if (registerForm)   registerForm.style.display = 'none';
      }
    }, 120);
  }

  console.log('✅ UniCERT system live and ready.');
});

window.switchTab = switchTab;
