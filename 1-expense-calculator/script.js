let expenses = [];

function addExpense() {
    const categoryInput = document.getElementById('categoryInput');
    const amountInput = document.getElementById('amountInput');
    
    const category = categoryInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!category || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid category and amount');
        return;
    }
    
    expenses.push({ category, amount });
    updateExpensesTable();
    
    // Clear inputs
    categoryInput.value = '';
    amountInput.value = '';
    categoryInput.focus();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    updateExpensesTable();
}

function updateExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="3">No expenses added yet. Add some expenses to get started!</td></tr>';
        return;
    }
    
    tbody.innerHTML = expenses.map((expense, index) => `
        <tr>
            <td>${expense.category}</td>
            <td>$${expense.amount.toLocaleString()}</td>
            <td><button class="delete-btn" onclick="deleteExpense(${index})">Delete</button></td>
        </tr>
    `).join('');
}

function calculateExpenses() {
    if (expenses.length === 0) {
        alert('Please add some expenses first');
        return;
    }
    
    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average daily (assuming 30 days)
    const averageDaily = total / 30;
    
    // Get top 3 largest expenses
    const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
    const top3 = sortedExpenses.slice(0, 3);
    
    // Update UI
    document.getElementById('totalAmount').textContent = `$${total.toLocaleString()}`;
    document.getElementById('averageDaily').textContent = `$${averageDaily.toLocaleString()}`;
    
    const topExpensesList = document.getElementById('topExpensesList');
    if (top3.length === 0) {
        topExpensesList.innerHTML = '<div class="empty-state">No expenses to display</div>';
    } else {
        topExpensesList.innerHTML = top3.map((expense, index) => `
            <div class="top-expense-item">
                <span>${index + 1}. ${expense.category}</span>
                <span>$${expense.amount.toLocaleString()}</span>
            </div>
        `).join('');
    }
    
    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function clearAllExpenses() {
    if (expenses.length === 0) {
        alert('No expenses to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all expenses?')) {
        expenses = [];
        updateExpensesTable();
        document.getElementById('results').style.display = 'none';
    }
}

// Allow Enter key to add expense
document.getElementById('amountInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addExpense();
    }
});

// Load sample data on page load
window.addEventListener('load', function() {
    // Add sample data
    const sampleExpenses = [
        { category: 'Groceries', amount: 15000 },
        { category: 'Rent', amount: 40000 },
        { category: 'Transportation', amount: 5000 },
        { category: 'Entertainment', amount: 10000 },
        { category: 'Communication', amount: 2000 },
        { category: 'Gym', amount: 3000 }
    ];
    
    expenses = sampleExpenses;
    updateExpensesTable();
});
