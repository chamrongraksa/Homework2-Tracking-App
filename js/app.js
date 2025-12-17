const content = document.getElementById("content");
const homeHTML = content.innerHTML;

const createStore = () => {
    const STORAGE_KEY = "my_tracker_data";

    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const saveToDisk = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    };

    return {
        add: record => {
            records.push(record);
            saveToDisk();
        },
        remove: index => {
            records.splice(index, 1);
            saveToDisk();
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
        if (inputType !== "date") input.required = true;
        form.appendChild(input);
    });

    const button = document.createElement("button");
    button.textContent = "Save";
    button.type = "submit";
    form.appendChild(button);

    form.addEventListener("submit", e => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form));

        const record = {
            type,
            ...formData,
            date: formData.date || new Date().toISOString().split("T")[0]
        };

        store.add(record);
        alert("Record saved to local storage!");
        form.reset();
    });

    return form;
};

const expenseForm = () => createForm("Expense Tracking", [
    { label: "Merchant/Store", name: "merchant", inputType: "text" },
    { label: "Amount", name: "amount", inputType: "number" },
    { label: "Category (Food, Rent, etc.)", name: "category", inputType: "text" },
    { label: "Payment Method", name: "method", inputType: "text" },
    { label: "Date", name: "date", inputType: "date" },
    { label: "Notes", name: "note", inputType: "text" }
], "expense");

const activityForm = () => createForm("Activity Tracking", [
    { label: "Activity Name", name: "activity", inputType: "text" },
    { label: "Duration (minutes)", name: "duration", inputType: "number" },
    { label: "Intensity (1-10)", name: "intensity", inputType: "range" },
    { label: "Location", name: "location", inputType: "text" },
    { label: "Date", name: "date", inputType: "date" }
], "activity");

const habitForm = () => createForm("Health Tracking", [
    { label: "Habit Name", name: "habit", inputType: "text" },
    { label: "Status (Done / Partial / Missed)", name: "status", inputType: "text" },
    { label: "Mood Today", name: "mood", inputType: "text" },
    { label: "Date", name: "date", inputType: "date" }
], "habit");

const workStudyForm = () => createForm("Work & Study Tracking", [
    { label: "Project / Subject", name: "project", inputType: "text" },
    { label: "Specific Task", name: "task", inputType: "text" },
    { label: "Hours Spent", name: "hours", inputType: "number" },
    { label: "Focus Level (1-5)", name: "focus", inputType: "number" },
    { label: "Date", name: "date", inputType: "date" }
], "work");

const summaryView = () => {
    const div = document.createElement("div");
    div.className = "summary";
    const data = store.get();

    const stats = {
        total: data.length,
        totalExpense: data
            .filter(r => r.type === "expense")
            .reduce((s, r) => s + Number(r.amount || 0), 0)
    };

    div.innerHTML = `
        <h2>Summary</h2>
        <div class="summary-cards" ">
            <div class="card" style="background-color:#9090d4; color:white">Entries<br><strong>${stats.total}</strong></div>
            <div class="card highlight">Spent<br><strong>$${stats.totalExpense}</strong></div>
        </div>
        <h3>History</h3>
        ${renderHistoryTable(data)}
    `;
    return div;
};

const renderHistoryTable = data => {
    if (!data.length) return `<p>No records found in storage.</p>`;

    return `
        <table class="history-table" >
            <thead style="background-color:#63ffd8">
                <tr>
                    <th>Type</th>
                    <th>Info</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody style="background-color:#ffc49c">
                ${data.map((r, i) => `
                    <tr>
                        <td>${r.type.toUpperCase()}</td>
                        <td>${primaryInfo(r)}</td>
                        <td>${r.date}</td>
                        <td><button class="btn-delete" data-index="${i}">Delete</button></td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
};

const primaryInfo = record => {
    const { type, merchant, amount, category, activity, duration, habit, status, task, project } = record;

    switch (type) {
        case "expense":
            return `<strong>${merchant || "Expense"}</strong>: $${amount} (${category})`;
        case "activity":
            return `${activity} for ${duration}m`;
        case "habit":
            return `${habit}: ${status}`;
        case "work":
            return `[${project}] ${task}`;
        default:
            return "View details";
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
    if (link) {
        e.preventDefault();
        actionMap[link.dataset.type]?.();
        return;
    }

    if (e.target.classList.contains("btn-delete")) {
        const index = e.target.dataset.index;
        if (confirm("Delete this record permanently?")) {
            store.remove(index);
            render(summaryView());
        }
    }
});
