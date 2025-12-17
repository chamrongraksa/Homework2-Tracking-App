
const content = document.getElementById("content");
const homeHTML = content.innerHTML;

const createStore = () => {
    const STORAGE_KEY = "tracker_history";

    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    };

    return {
        add: record => {
            records.push(record);
            save();
        },
        remove: index => {
            records.splice(index, 1);
            save();
        },
        get: () => [...records]
    };
};

const store = createStore();


const render = element => {
    content.innerHTML = "";
    content.appendChild(element);
};


const createForm = (title, fields, type) => {
    const form = document.createElement("form");
    form.innerHTML = `<h2>${title}</h2>`;

    fields.forEach(({ label, name, inputType }) => {
        const input = document.createElement("input");
        input.placeholder = label;
        input.name = name;
        input.type = inputType;
        input.required = true;
        form.appendChild(input);
    });

    const button = document.createElement("button");
    button.textContent = "Save";
    button.type = "submit";
    form.appendChild(button);

    form.addEventListener("submit", e => {
        e.preventDefault();

        const record = {
            type,
            date: new Date().toLocaleDateString(),
            ...Object.fromEntries(new FormData(form))
        };

        store.add(record);
        alert("Record saved!");
        form.reset();
    });

    return form;
};


const expenseForm = () =>
    createForm("Expense Tracking", [
        { label: "Amount", name: "amount", inputType: "number" },
        { label: "Category", name: "category", inputType: "text" },
        { label: "Payment Method", name: "method", inputType: "text" },
        { label: "Note", name: "note", inputType: "text" },
        { label: "Date", name: "date", inputType: "date" }
    ], "expense");


const activityForm = () =>
    createForm("Activity Tracking", [
        { label: "Activity Name", name: "activity", inputType: "text" },
        { label: "Duration (minutes)", name: "duration", inputType: "number" },
        { label: "Intensity", name: "intensity", inputType: "text" },
        { label: "Location", name: "location", inputType: "text" },
        { label: "Date", name: "date", inputType: "date" }
    ], "activity");


const habitForm = () =>
    createForm("Health Tracking", [
        { label: "Habit Name", name: "habit", inputType: "text" },
        { label: "Status (Done / Missed)", name: "status", inputType: "text" },
        { label: "Mood", name: "mood", inputType: "text" },
        { label: "Hours (if applicable)", name: "hours", inputType: "number" },
        { label: "Date", name: "date", inputType: "date" }
    ], "habit");


const workStudyForm = () =>
    createForm("Work & Study Tracking", [
        { label: "Task / Subject", name: "task", inputType: "text" },
        { label: "Category (Work / Study)", name: "category", inputType: "text" },
        { label: "Focus Level (1-5)", name: "focus", inputType: "number" },
        { label: "Hours Spent", name: "hours", inputType: "number" },
        { label: "Date", name: "date", inputType: "date" }
    ], "work");



const summaryView = () => {
    const div = document.createElement("div");
    div.className = "summary";

    const data = store.get();

    const stats = {
        total: data.length,
        expense: data.filter(r => r.type === "expense").length,
        activity: data.filter(r => r.type === "activity").length,
        habit: data.filter(r => r.type === "habit").length,
        work: data.filter(r => r.type === "work").length,
        totalExpense: data
            .filter(r => r.type === "expense")
            .reduce((s, r) => s + Number(r.amount || 0), 0)
    };

    div.innerHTML = `
    <h2 class="summary-title">Summary Overview</h2>

    <div class="summary-cards">
        <div class="card total">
            <span>Total Records</span>
            <strong>${stats.total}</strong>
        </div>

        <div class="card expense">
            <span>Expenses</span>
            <strong>${stats.expense}</strong>
        </div>

        <div class="card activity">
            <span>Activities</span>
            <strong>${stats.activity}</strong>
        </div>

        <div class="card habit">
            <span>Health</span>
            <strong>${stats.habit}</strong>
        </div>

        <div class="card work">
            <span>Work</span>
            <strong>${stats.work}</strong>
        </div>

        <div class="card highlight">
            <span>Total Spent</span>
            <strong>$${stats.totalExpense}</strong>
        </div>
    </div>

    <h3 class="history-title">History</h3>
    ${renderHistoryTable(data)}
`;


    return div;
};


const renderHistoryTable = data => {
    if (!data.length) return `<p>No history yet.</p>`;

    return `
        <table class="history-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Main Info</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((r, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${r.type}</td>
                        <td>${primaryInfo(r)}</td>
                        <td>${r.date}</td>
                        <td>
                            <button class="btn-delete" data-index="${i}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
};


const primaryInfo = r => {
    switch (r.type) {
        case "expense":
            return `$${r.amount} • ${r.category}`;
        case "activity":
            return `${r.activity} • ${r.duration} min`;
        case "habit":
            return `${r.habit} • ${r.status}`;
        case "work":
            return `${r.task} • ${r.hours} hrs`;
        default:
            return "";
    }
};

const formatDetails = record => {
    switch (record.type) {
        case "expense":
            return `
                Amount: $${record.amount}<br>
                Category: ${record.category}<br>
                Method: ${record.method}<br>
                Note: ${record.note}
            `;

        case "activity":
            return `
                Activity: ${record.activity}<br>
                Duration: ${record.duration} min<br>
                Intensity: ${record.intensity}<br>
                Location: ${record.location}
            `;

        case "habit":
            return `
                Habit: ${record.habit}<br>
                Status: ${record.status}<br>
                Mood: ${record.mood}<br>
                Hours: ${record.hours || "-"}
            `;

        case "work":
            return `
                Task: ${record.task}<br>
                Category: ${record.category}<br>
                Focus Level: ${record.focus}<br>
                Hours: ${record.hours}
            `;

        default:
            return "";
    }
};




const actionMap = {
    home: () => content.innerHTML = homeHTML,
    expense: () => render(expenseForm()),
    activity: () => render(activityForm()),
    habit: () => render(habitForm()),
    work: () => render(workStudyForm()),
    summary: () => render(summaryView())
};


document.addEventListener("click", e => {
    const link = e.target.closest("[data-type]");
    if (!link) return;

    e.preventDefault();
    actionMap[link.dataset.type]?.();
});

document.addEventListener("click", e => {
    if (e.target.classList.contains("btn-delete")) {
        const index = e.target.dataset.index;

        if (confirm("Delete this record?")) {
            store.remove(index);
            render(summaryView());
        }
    }
});

const totalExpense = data
    .filter(r => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);



