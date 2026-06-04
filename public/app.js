// Legacy single-page localStorage app (superseded by multi-page MongoDB-backed UI)
(() => {
  const STORAGE_KEY = 'budget_entries_v1';


  const els = {
    monthInput: document.getElementById('monthInput'),
    form: document.getElementById('entryForm'),
    editId: document.getElementById('editId'),
    typeInput: document.getElementById('typeInput'),
    amountInput: document.getElementById('amountInput'),
    categoryInput: document.getElementById('categoryInput'),
    dateInput: document.getElementById('dateInput'),
    submitBtn: document.getElementById('submitBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),

    incomeTotal: document.getElementById('incomeTotal'),
    expenseTotal: document.getElementById('expenseTotal'),
    netTotal: document.getElementById('netTotal'),

    entriesBody: document.getElementById('entriesBody'),
    emptyState: document.getElementById('emptyState'),

    clearMonthBtn: document.getElementById('clearMonthBtn'),

    categoryChart: document.getElementById('categoryChart'),
  };

  let chart;

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function monthKeyFromDate(dateStr) {
    // dateStr: YYYY-MM-DD
    return dateStr.slice(0, 7); // YYYY-MM
  }

  function formatMoney(n) {
    const num = Number(n) || 0;
    return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  function formatMoneyPlain(n) {
    const num = Number(n) || 0;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeCategory(s) {
    return String(s || '').trim();
  }

  function getSelectedMonth() {
    return els.monthInput.value; // YYYY-MM
  }

  function setEditMode(entry) {
    els.editId.value = entry.id;
    els.typeInput.value = entry.type;
    els.amountInput.value = entry.amount;
    els.categoryInput.value = entry.category;
    els.dateInput.value = entry.date;

    els.submitBtn.textContent = 'Save Changes';
    els.cancelEditBtn.style.display = 'inline-flex';
  }

  function clearEditMode() {
    els.editId.value = '';
    els.form.reset();
    els.submitBtn.textContent = 'Add Entry';
    els.cancelEditBtn.style.display = 'none';
    els.dateInput.value = todayISO();
    els.typeInput.value = 'expense';
  }

  function computeTotals(entries) {
    let income = 0;
    let expense = 0;
    for (const e of entries) {
      if (e.type === 'income') income += Number(e.amount) || 0;
      else expense += Number(e.amount) || 0;
    }
    return { income, expense, net: income - expense };
  }

  function buildCategoryTotals(entries) {
    // expenses only
    const map = new Map();
    for (const e of entries) {
      if (e.type !== 'expense') continue;
      const cat = normalizeCategory(e.category) || 'Uncategorized';
      map.set(cat, (map.get(cat) || 0) + (Number(e.amount) || 0));
    }
    // Sort desc
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  function monthLabel(ym) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }

  function renderChart(categoryTotals) {
    const labels = categoryTotals.map(x => x.category);
    const data = categoryTotals.map(x => x.amount);

    const bgColors = labels.map((_, idx) => {
      const palette = ['#ff5a6a', '#ff9f43', '#ffd166', '#4f8cff', '#3ee6b6', '#b36bff', '#5dd6ff', '#9cff57'];
      return palette[idx % palette.length];
    });

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Expenses',
            data,
            backgroundColor: bgColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            },
          },
        },
      },
    };

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(els.categoryChart.getContext('2d'), config);
  }

  function renderTable(entries) {
    const tbody = els.entriesBody;
    tbody.innerHTML = '';

    if (!entries.length) {
      els.emptyState.classList.add('show');
      return;
    }

    els.emptyState.classList.remove('show');

    // Sort by date desc
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

    for (const e of sorted) {
      const tr = document.createElement('tr');

      const badgeClass = e.type === 'income' ? 'income' : 'expense';
      const badgeText = e.type === 'income' ? 'Income' : 'Expense';

      tr.innerHTML = `
        <td>${e.date}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>${escapeHtml(normalizeCategory(e.category) || 'Uncategorized')}</td>
        <td class="right">${formatMoneyPlain(e.amount)}</td>
        <td class="right">
          <div class="row-actions">
            <button class="icon-btn edit" type="button" data-action="edit" data-id="${e.id}">Edit</button>
            <button class="icon-btn delete" type="button" data-action="delete" data-id="${e.id}">Del</button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    }

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const entriesAll = loadEntries();
        const entry = entriesAll.find(x => x.id === id);
        if (!entry) return;

        if (action === 'edit') {
          setEditMode(entry);
          // Ensure month selection matches the entry date (so it stays visible)
          els.monthInput.value = monthKeyFromDate(entry.date);
          render();
          return;
        }

        if (action === 'delete') {
          if (!confirm('Delete this entry?')) return;
          const updated = entriesAll.filter(x => x.id !== id);
          saveEntries(updated);
          clearEditMode();
          render();
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  }

  function render() {
    const selectedMonth = getSelectedMonth();
    const all = loadEntries();
    const entries = all.filter(e => monthKeyFromDate(e.date) === selectedMonth);

    const totals = computeTotals(entries);
    els.incomeTotal.textContent = formatMoneyPlain(totals.income);
    els.expenseTotal.textContent = formatMoneyPlain(totals.expense);
    els.netTotal.textContent = formatMoneyPlain(totals.net);

    const categoryTotals = buildCategoryTotals(entries).slice(0, 8);
    // If no expenses, show empty chart
    renderChart(categoryTotals.length ? categoryTotals : [{ category: 'No expenses', amount: 0 }]);

    renderTable(entries);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const editId = els.editId.value;
    const type = els.typeInput.value;
    const amount = Number(els.amountInput.value);
    const category = normalizeCategory(els.categoryInput.value);
    const date = els.dateInput.value;

    if (!date) return;
    if (!category) {
      alert('Please enter a category.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const entriesAll = loadEntries();

    const payload = {
      id: editId || uid(),
      type,
      amount: Number(amount.toFixed(2)),
      category,
      date,
    };

    let updated;
    if (editId) {
      updated = entriesAll.map(x => (x.id === editId ? payload : x));
    } else {
      updated = [...entriesAll, payload];
    }

    saveEntries(updated);
    clearEditMode();
    render();
  }

  function init() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    els.monthInput.value = `${yyyy}-${mm}`;

    // Default date = today
    els.dateInput.value = todayISO();

    els.form.addEventListener('submit', handleSubmit);

    els.cancelEditBtn.addEventListener('click', () => {
      clearEditMode();
      render();
    });

    els.monthInput.addEventListener('change', () => {
      clearEditMode();
      render();
    });

    els.clearMonthBtn.addEventListener('click', () => {
      const selectedMonth = getSelectedMonth();
      const entriesAll = loadEntries();
      const monthEntries = entriesAll.filter(e => monthKeyFromDate(e.date) === selectedMonth);
      if (!monthEntries.length) {
        alert('No entries to clear for this month.');
        return;
      }
      if (!confirm(`Clear ${monthLabel(selectedMonth)} entries (${monthEntries.length})?`)) return;
      const updated = entriesAll.filter(e => monthKeyFromDate(e.date) !== selectedMonth);
      saveEntries(updated);
      clearEditMode();
      render();
    });

    render();
    clearEditMode();
  }

  init();
})();

