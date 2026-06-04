async function login({ email, password }) {
  const json = await window.BudgetAPI.apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  window.BudgetNav.setAuthState({ token: json.token, user: json.user });
  return json;
}

async function register({ name, email, password }) {
  const json = await window.BudgetAPI.apiFetch('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  return json;
}

window.BudgetAuth = { login, register };


