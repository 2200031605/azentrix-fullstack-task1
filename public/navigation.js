(() => {
  const KEY = 'budget_nav_v1';

  function getAuthState() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setAuthState(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function clearAuthState() {
    localStorage.removeItem(KEY);
  }

  function isAuthed() {
    const s = getAuthState();
    return Boolean(s && s.token);
  }

  function token() {
    const s = getAuthState();
    return s?.token || '';
  }

  function renderNav() {
    const el = document.getElementById('nav');
    if (!el) return;

    if (!isAuthed()) {
      el.innerHTML = `
        <div class="nav-left">
          <span class="brand">Budget Tracker</span>
        </div>
        <div class="nav-right">
          <a class="nav-link" href="/dashboard.html">Dashboard</a>
          <a class="nav-link" href="/login.html">Login</a>
          <a class="nav-link" href="/register.html">Register</a>
        </div>

      `;
      return;
    }

    el.innerHTML = `
      <div class="nav-left">
        <span class="brand">Budget Tracker</span>
      </div>
      <div class="nav-right">
        <a class="nav-link" href="/">Dashboard</a>
        <a class="nav-link" href="/transactions.html">Transactions</a>
        <a class="nav-link" href="/reports.html">Reports</a>
        <button class="nav-link btn-link" id="logoutBtn" type="button">Logout</button>
      </div>
    `;

    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        clearAuthState();
        window.location.href = '/login.html';
      });
    }
  }

  window.BudgetNav = {
    renderNav,
    isAuthed,
    token,
    setAuthState,
    getAuthState,
    clearAuthState,
  };
})();

