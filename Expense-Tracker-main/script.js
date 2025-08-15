document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const typeInput = document.getElementById('type');
    const categoryInput = document.getElementById('category');
    const transactionsList = document.getElementById('transactions');
    const balanceElement = document.getElementById('balance');
    const incomeTotalElement = document.getElementById('income-total');
    const expenseTotalElement = document.getElementById('expense-total');
    const filterTypeInput = document.getElementById('filter-type');
    const filterCategoryInput = document.getElementById('filter-category');
    const themeToggle = document.getElementById('theme-toggle');
    const noteInput = document.getElementById('note');
    const clearAllBtn = document.getElementById('clear-all');
    const totalTransactions = document.getElementById('total-transactions');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    init();

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }


        const transaction = {
            id: customId(),
            description: descriptionInput.value.trim(),
            amount: parseFloat(amountInput.value),
            date: dateInput.value,
            type: typeInput.value,
            category: categoryInput.value,
            note: noteInput.value.trim()
        };
    clearAllBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete all transactions?')) {
            transactions = [];
            updateLocalStorage();
            updateUI();
            showSuccessMessage('All transactions cleared!');
        }
    });

        addTransaction(transaction);
        updateLocalStorage();
        updateUI();
        resetForm();
        showSuccessMessage('Transaction added successfully!');
    });

    filterTypeInput.addEventListener('change', updateUI);
    filterCategoryInput.addEventListener('change', updateUI);

    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    function init() {
        updateUI();
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function addTransaction(transaction) {
        transactions.unshift(transaction);
    }

    function removeTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== parseInt(id));
    }

    function updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateUI() {
        const filteredTransactions = filterTransactions();
        displayTransactions(filteredTransactions);
        updateBalance();
        updateSummary();
        updateTotalTransactions(filteredTransactions.length);
    }

    function filterTransactions() {
        const typeFilter = filterTypeInput.value;
        const categoryFilter = filterCategoryInput.value;

        return transactions.filter(transaction => {
            const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
            const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
            return typeMatch && categoryMatch;
        });
    }

    function displayTransactions(transactionsToDisplay) {
        transactionsList.innerHTML = '';

        if (transactionsToDisplay.length === 0) {
            transactionsList.innerHTML = '<li class="no-transactions"><i class="fas fa-coins"></i> No transactions found</li>';
            return;
        }


        transactionsToDisplay.forEach(transaction => {
            const sign = transaction.type === 'income' ? '+' : '-';
            const transactionElement = document.createElement('li');
            transactionElement.classList.add('transaction', transaction.type, 'compact-transaction');
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-description" style="font-weight:500;">${transaction.description}</span>
                    <span class="transaction-category" style="font-size:0.8em;color:var(--gray-medium);margin-left:8px;">${transaction.category}</span>
                    <span class="transaction-date" style="font-size:0.8em;color:var(--gray-medium);margin-left:8px;">${formatDate(transaction.date)}</span>
                    ${transaction.note ? `<span class="transaction-note" style="font-size:0.8em;color:var(--primary-color);margin-left:8px;"><i class='fas fa-sticky-note'></i> ${transaction.note}</span>` : ''}
                </div>
                <span class="transaction-amount" style="font-size:1em;margin-left:10px;">${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
                <button class="delete-btn" data-id="${transaction.id}" aria-label="Delete transaction" style="margin-left:8px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            transactionsList.appendChild(transactionElement);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                removeTransaction(id);
                updateLocalStorage();
                updateUI();
                showSuccessMessage('Transaction deleted!');
            });
        });
    }
    function updateTotalTransactions(count) {
        totalTransactions.textContent = `Total: ${count}`;
    }

    function updateBalance() {
        const amounts = transactions.map(transaction =>
            transaction.type === 'income' ? transaction.amount : -transaction.amount
        );

        const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
        balanceElement.textContent = `₹${total}`;

        if (total > 0) {
            balanceElement.style.color = 'var(--income-color)';
        } else if (total < 0) {
            balanceElement.style.color = 'var(--expense-color)';
        } else {
            balanceElement.style.color = 'var(--primary-color)';
        }
    }

    function updateSummary() {
        const income = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0)
            .toFixed(2);

        const expense = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0)
            .toFixed(2);

        incomeTotalElement.textContent = `₹${income}`;
        expenseTotalElement.textContent = `₹${expense}`;
    }

    function resetForm() {
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function validateForm() {
        if (descriptionInput.value.trim() === '') {
            showErrorMessage('Please enter a description');
            descriptionInput.focus();
            return false;
        }

        if (amountInput.value === '' || parseFloat(amountInput.value) <= 0) {
            showErrorMessage('Please enter a valid amount greater than 0');
            amountInput.focus();
            return false;
        }

        if (dateInput.value === '') {
            showErrorMessage('Please select a date');
            dateInput.focus();
            return false;
        }

        if (categoryInput.value === '') {
            showErrorMessage('Please select a category');
            categoryInput.focus();
            return false;
        }

        return true;
    }

    function showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message success';
        toast.style.background = 'var(--secondary-color)';
        toast.style.color = 'var(--primary-color)';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    function showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message error';
        toast.style.background = 'var(--accent-color)';
        toast.style.color = '#fff';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    function customId() {
        // Custom ID: ATK-<timestamp>-<random>
        return 'ATK-' + Date.now().toString(36) + '-' + Math.floor(Math.random()*1000).toString(36);
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
