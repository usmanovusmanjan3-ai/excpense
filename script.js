// ================================
// EXPENSE TRACKER
// ================================

let expenses = JSON.parse(
    localStorage.getItem("expenses")
) || [];


// ================================
// ELEMENTLAR
// ================================

const modal = document.getElementById("modal");
const expenseForm = document.getElementById("expenseForm");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const expenseDate = document.getElementById("expenseDate");


// ================================
// BUGUNGI SANANI O'RNATISH
// ================================

const today = new Date();

const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

expenseDate.value = todayString;


// ================================
// MODAL
// ================================

function openModal() {
    modal.classList.add("active");

    document.getElementById("expenseName").focus();
}

function closeModal() {
    modal.classList.remove("active");
}


// Modal tashqarisiga bosilganda yopish

modal.addEventListener("click", function(event) {

    if (event.target === modal) {
        closeModal();
    }

});


// ESC orqali yopish

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeModal();
    }

});


// ================================
// FORM
// ================================

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("expenseName").value.trim();

    const amount =
        Number(document.getElementById("expenseAmount").value);

    const category =
        document.getElementById("expenseCategory").value;

    const date =
        document.getElementById("expenseDate").value;

    const note =
        document.getElementById("expenseNote").value.trim();


    if (!name || amount <= 0 || !category || !date) {
        alert("Iltimos, barcha kerakli maydonlarni to‘ldiring!");
        return;
    }


    const expense = {

        id: Date.now(),

        name: name,

        amount: amount,

        category: category,

        date: date,

        note: note

    };


    expenses.unshift(expense);

    saveExpenses();

    renderExpenses();

    updateStatistics();

    renderAnalytics();

    expenseForm.reset();

    expenseDate.value = todayString;

    closeModal();

});


// ================================
// LOCAL STORAGE
// ================================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


// ================================
// PUL FORMAT
// ================================

function formatMoney(number) {

    return new Intl.NumberFormat("uz-UZ").format(number) + " so‘m";

}


// ================================
// KATEGORIYA ICON
// ================================

function getCategoryIcon(category) {

    const icons = {

        "Oziq-ovqat": "🍔",

        "Uy-joy": "🏠",

        "Transport": "🚗",

        "Xaridlar": "🛍️",

        "Ta’lim": "📚",

        "Sog‘liq": "❤️",

        "Ko‘ngilochar": "🎮",

        "Kommunal": "💡",

        "Aloqa": "📱",

        "Boshqa": "💰"

    };

    return icons[category] || "💰";

}


// ================================
// SANANI FORMATLASH
// ================================

function formatDate(date) {

    const parts = date.split("-");

    return `${parts[2]}.${parts[1]}.${parts[0]}`;

}


// ================================
// XARAJATLARNI CHIQARISH
// ================================

function renderExpenses() {

    const search =
        searchInput.value.toLowerCase().trim();

    const selectedCategory =
        categoryFilter.value;


    let filteredExpenses = expenses.filter(expense => {

        const matchesSearch =
            expense.name.toLowerCase().includes(search) ||
            expense.category.toLowerCase().includes(search) ||
            expense.note.toLowerCase().includes(search);

        const matchesCategory =
            selectedCategory === "all" ||
            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });


    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        emptyMessage.style.display = "block";

        return;

    }

    emptyMessage.style.display = "none";


    filteredExpenses.forEach(expense => {

        const item =
            document.createElement("div");

        item.className = "expense-item";


        item.innerHTML = `

            <div class="expense-icon">
                ${getCategoryIcon(expense.category)}
            </div>

            <div>
                <div class="expense-name">
                    ${escapeHTML(expense.name)}
                </div>

                <div class="expense-meta">
                    ${expense.category}
                    •
                    ${formatDate(expense.date)}
                    ${expense.note
                        ? " • " + escapeHTML(expense.note)
                        : ""
                    }
                </div>
            </div>

            <div class="expense-amount">
                - ${formatMoney(expense.amount)}
            </div>

            <button
                class="delete-btn"
                onclick="deleteExpense(${expense.id})"
                title="O‘chirish"
            >
                ×
            </button>

        `;


        expenseList.appendChild(item);

    });

}


// ================================
// XARAJATNI O'CHIRISH
// ================================

function deleteExpense(id) {

    const confirmation =
        confirm("Ushbu xarajatni o‘chirmoqchimisiz?");

    if (!confirmation) return;


    expenses =
        expenses.filter(expense => expense.id !== id);


    saveExpenses();

    renderExpenses();

    updateStatistics();

    renderAnalytics();

}


// ================================
// STATISTIKA
// ================================

function updateStatistics() {

    const total =
        expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


    const todayExpenses =
        expenses.filter(
            expense => expense.date === todayString
        );


    const todayTotal =
        todayExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


    const currentYear =
        today.getFullYear();

    const currentMonth =
        String(today.getMonth() + 1).padStart(2, "0");


    const monthExpenses =
        expenses.filter(expense => {

            return expense.date.startsWith(
                `${currentYear}-${currentMonth}`
            );

        });


    const monthTotal =
        monthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


    document.getElementById("totalExpense").textContent =
        formatMoney(total);

    document.getElementById("todayExpense").textContent =
        formatMoney(todayTotal);

    document.getElementById("monthExpense").textContent =
        formatMoney(monthTotal);

    document.getElementById("expenseCount").textContent =
        expenses.length + " ta";


    document.getElementById("heroTotal").textContent =
        formatMoney(total);

    document.getElementById("heroToday").textContent =
        formatMoney(todayTotal);

}


// ================================
// TAHLIL
// ================================

function renderAnalytics() {

    const analyticsGrid =
        document.getElementById("analyticsGrid");


    analyticsGrid.innerHTML = "";


    const categoryTotals = {};


    expenses.forEach(expense => {

        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += expense.amount;

    });


    const total =
        expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );


    if (total === 0) {

        analyticsGrid.innerHTML = `

            <div class="analytics-card">

                <p style="color:#777;">
                    Tahlil ko‘rsatish uchun
                    avval xarajat qo‘shing.
                </p>

            </div>

        `;

        return;

    }


    const sortedCategories =
        Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);


    sortedCategories.forEach(
        ([category, amount]) => {

            const percentage =
                (amount / total) * 100;


            const card =
                document.createElement("div");

            card.className =
                "analytics-card";


            card.innerHTML = `

                <div class="analytics-top">

                    <span>
                        ${getCategoryIcon(category)}
                        ${category}
                    </span>

                    <strong>
                        ${formatMoney(amount)}
                    </strong>

                </div>

                <div class="progress">

                    <span
                        style="width:${percentage}%"
                    ></span>

                </div>

                <small style="
                    display:block;
                    color:#666;
                    margin-top:10px;
                ">
                    ${percentage.toFixed(1)}%
                </small>

            `;


            analyticsGrid.appendChild(card);

        }
    );

}


// ================================
// QIDIRUV
// ================================

searchInput.addEventListener(
    "input",
    renderExpenses
);


// ================================
// FILTER
// ================================

categoryFilter.addEventListener(
    "change",
    renderExpenses
);


// ================================
// XAVFSIZ MATN
// ================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ================================
// DEMO MA'LUMOTLAR
// ================================

if (expenses.length === 0) {

    expenses = [

        {
            id: 1,
            name: "Tushlik",
            amount: 45000,
            category: "Oziq-ovqat",
            date: todayString,
            note: "Restoranda tushlik"
        },

        {
            id: 2,
            name: "Yo‘l xarajati",
            amount: 20000,
            category: "Transport",
            date: todayString,
            note: "Taksi"
        },

        {
            id: 3,
            name: "Internet",
            amount: 70000,
            category: "Aloqa",
            date: todayString,
            note: "Oylik internet to‘lovi"
        }

    ];

    saveExpenses();

}


// ================================
// ISHGA TUSHIRISH
// ================================

renderExpenses();

updateStatistics();

renderAnalytics();