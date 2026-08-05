// ===== ADD EXPENSE ROW =====
function addExpenseRow() {
  const list = document.getElementById('expense-list');
  const row  = document.createElement('div');
  row.className = 'expense-row';
  row.innerHTML = `
    <select class="input-field expense-category" style="max-width:130px;"
            onchange="updateTotal()">
      <option value="food">🍜 Food</option>
      <option value="transport">🚗 Transport</option>
      <option value="hotel">🏨 Hotel</option>
      <option value="activities">🎭 Activities</option>
      <option value="shopping">🛍️ Shopping</option>
      <option value="other">💰 Other</option>
    </select>
    <input type="number" placeholder="Amount (₹)"
           class="input-field expense-amount"
           oninput="updateTotal()" min="0"/>
    <button class="btn-remove" onclick="removeExpense(this)">✕</button>`;
  list.appendChild(row);
  updateTotal();
}

// ===== REMOVE EXPENSE ROW =====
function removeExpense(btn) {
  btn.parentElement.remove();
  updateTotal();
}

// ===== UPDATE TOTAL =====
function updateTotal() {
  const amounts = document.querySelectorAll('.expense-amount');
  let total = 0;
  amounts.forEach((input) => {
    total += parseFloat(input.value || 0);
  });
  document.getElementById('total-amount').innerText =
    '₹' + total.toLocaleString('en-IN');
}

// ===== GET ALL EXPENSES =====
function getExpenses() {
  const rows      = document.querySelectorAll('.expense-row');
  const expenses  = [];
  rows.forEach((row) => {
    const category = row.querySelector('.expense-category').value;
    const amount   = row.querySelector('.expense-amount').value;
    if (amount) {
      expenses.push({ category, amount: parseFloat(amount) });
    }
  });
  return expenses;
}