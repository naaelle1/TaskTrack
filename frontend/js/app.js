/**
 * ==========================================================================
 * TASK TRACKER — CORE FRONTEND ENGINE (REVISED ANTI-CRASH)
 * Synchronized Theme States, Active Profile Dropdowns & Live Kanban Pipeline.
 * ==========================================================================
 */

// Initial Static Data State Array
let tasks = [
    {
        id: "task-1",
        title: "Advanced Data Structures Assignment 2",
        subject: "Computer Science",
        description: "Implement balanced AVL trees and custom hashing functions with collision logs.",
        deadline: "2026-06-25",
        priority: "High",
        status: "Pending"
    },
    {
        id: "task-2",
        title: "Organic Chemistry Lab Report",
        subject: "Chemistry",
        description: "Document distillation phase results and yield calculus metrics.",
        deadline: "2026-06-28",
        priority: "Medium",
        status: "Pending"
    },
    {
        id: "task-3",
        title: "Macroeconomics Essay Review",
        subject: "Economics",
        description: "Analyze dynamic monetary choices under modern quantitative structural rules.",
        deadline: "2026-07-02",
        priority: "Low",
        status: "Completed"
    }
];

let appPreferences = {
    theme: "light",
    notifications: true,
    language: "en"
};

let activeSearchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    loadPreferences();
    initGlobalUIListeners();
    renderAllLayouts();
});

function initGlobalUIListeners() {
    // FIX: Klik Nama Profile Berfungsi Akurat Tanpa Mogok
    const profileTrigger = document.getElementById("profile-menu-trigger");
    if (profileTrigger) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            profileTrigger.classList.toggle("active");
        });
    }

    document.addEventListener("click", () => {
        if (profileTrigger) profileTrigger.classList.remove("active");
    });

    // FIX: Lonceng Notifikasi diarahkan langsung untuk membuka Preferences Modal
    const notificationBtns = document.querySelectorAll('button[title="Notifications"]');
    notificationBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("settings-modal");
        });
    });

    // Filter Pipeline via Fuzzy Keys (Safe Checking)
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            activeSearchQuery = e.target.value.toLowerCase().trim();
            renderDynamicKanbanLanes();
        });
    }

    // Modal Action Bindings
    setupModalControls("open-add-modal", "close-add-modal", "add-task-modal");
    setupModalControls("open-settings-modal", "close-settings-modal", "settings-modal");
    
    const closeEditBtn = document.getElementById("close-edit-modal");
    if (closeEditBtn) {
        closeEditBtn.addEventListener("click", () => closeModal("edit-task-modal"));
    }

    // CRUD Event Listeners
    const addTaskForm = document.getElementById("add-task-form");
    if (addTaskForm) addTaskForm.addEventListener("submit", handleAddTaskSubmit);

    const editTaskForm = document.getElementById("edit-task-form");
    if (editTaskForm) editTaskForm.addEventListener("submit", handleEditTaskSubmit);

    const deleteBtn = document.getElementById("delete-edit-modal");
    if (deleteBtn) deleteBtn.addEventListener("click", handleDeleteTaskClick);

    // FIX BARU: Toggle Tema Navbar Universal (Jalan di index, dashboard, & profile)
    const navbarThemeBtn = document.getElementById("theme-toggle-btn");
    if (navbarThemeBtn) {
        navbarThemeBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const targetTheme = (currentTheme === "dark") ? "light" : "dark";
            updateTheme(targetTheme);
        });
    }

    // Modal Checkbox Theme Sync
    const themeCheckbox = document.getElementById("theme-toggle-checkbox");
    if (themeCheckbox) {
        themeCheckbox.addEventListener("change", (e) => {
            updateTheme(e.target.checked ? "dark" : "light");
        });
    }
}

function setupModalControls(openId, closeId, modalId) {
    const openBtn = document.getElementById(openId);
    if (openBtn) {
        openBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal(modalId);
        });
    }
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) {
        closeBtn.addEventListener("click", () => closeModal(modalId));
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
}

// Global Theme Custom Sync Engine
function updateTheme(themeStr) {
    appPreferences.theme = themeStr;
    document.documentElement.setAttribute("data-theme", themeStr);
    
    const themeCheckbox = document.getElementById("theme-toggle-checkbox");
    if (themeCheckbox) themeCheckbox.checked = (themeStr === "dark");

    const navbarThemeBtn = document.getElementById("theme-toggle-btn");
    if (navbarThemeBtn) {
        navbarThemeBtn.textContent = (themeStr === "dark") ? "🌙" : "☀️";
    }
    localStorage.setItem("task_tracker_pref", JSON.stringify(appPreferences));
}

function loadPreferences() {
    const stored = localStorage.getItem("task_tracker_pref");
    if (stored) appPreferences = JSON.parse(stored);
    
    document.documentElement.setAttribute("data-theme", appPreferences.theme);
    
    const themeCheckbox = document.getElementById("theme-toggle-checkbox");
    if (themeCheckbox) themeCheckbox.checked = (appPreferences.theme === "dark");

    const navbarThemeBtn = document.getElementById("theme-toggle-btn");
    if (navbarThemeBtn) {
        navbarThemeBtn.textContent = (appPreferences.theme === "dark") ? "🌙" : "☀️";
    }
}

function renderAllLayouts() {
    renderDynamicKanbanLanes();
    renderProfileStats();
}

function renderDynamicKanbanLanes() {
    const boardContainer = document.querySelector(".board-lane-container");
    if (!boardContainer) return; // Mencegah crash jika tidak di halaman dashboard

    const filteredTasks = tasks.filter(task => {
        if (!activeSearchQuery) return true;
        return task.title.toLowerCase().includes(activeSearchQuery) ||
               task.subject.toLowerCase().includes(activeSearchQuery) ||
               task.priority.toLowerCase().includes(activeSearchQuery);
    });

    const pendingTasks = filteredTasks.filter(t => t.status === "Pending");
    const completedTasks = filteredTasks.filter(t => t.status === "Completed");

    boardContainer.innerHTML = `
        <div class="board-lane" id="lane-pending">
            <div class="lane-header">
                <div class="lane-title-group">
                    <span class="lane-indicator-dot pending"></span>
                    <h2 class="lane-title">In Progress</h2>
                    <span class="lane-counter">${pendingTasks.length}</span>
                </div>
            </div>
            <div class="lane-cards-stack" id="stack-pending"></div>
        </div>

        <div class="board-lane" id="lane-completed">
            <div class="lane-header">
                <div class="lane-title-group">
                    <span class="lane-indicator-dot completed"></span>
                    <h2 class="lane-title">Completed Workspace</h2>
                    <span class="lane-counter">${completedTasks.length}</span>
                </div>
            </div>
            <div class="lane-cards-stack" id="stack-completed"></div>
        </div>
    `;

    populateLaneStack("stack-pending", pendingTasks);
    populateLaneStack("stack-completed", completedTasks);
    calculateHeroMetricsSummary();
}

function populateLaneStack(stackId, laneTasks) {
    const stackContainer = document.getElementById(stackId);
    if (!stackContainer) return;

    if (laneTasks.length === 0) {
        stackContainer.innerHTML = `<p class="form-desc-text" style="padding: 12px 4px;">No matching tasks inside this status.</p>`;
        return;
    }

    laneTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
            <div class="task-card-top">
                <div class="task-card-header">
                    <span class="task-subject">${escapeHtml(task.subject)}</span>
                    <span class="task-priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <h3 class="task-title-text">${escapeHtml(task.title)}</h3>
                <p class="task-description">${escapeHtml(task.description || '')}</p>
            </div>
            <div class="task-card-bottom">
                <div class="task-deadline-info">Due: <strong>${task.deadline}</strong></div>
                <span class="task-edit-btn" onclick="openEditTaskModal('${task.id}')">Modify task</span>
            </div>
        `;
        stackContainer.appendChild(card);
    });
}

function calculateHeroMetricsSummary() {
    const summaryCountEl = document.getElementById("summary-pending-count");
    const velocityPercentageEl = document.getElementById("velocity-percentage");
    const velocityBarEl = document.getElementById("velocity-bar");

    const totalCount = tasks.length;
    const pendingCount = tasks.filter(t => t.status === "Pending").length;
    const completedCount = totalCount - pendingCount;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (summaryCountEl) summaryCountEl.textContent = `${pendingCount} task${pendingCount === 1 ? '' : 's'}`;
    if (velocityPercentageEl) velocityPercentageEl.textContent = `${rate}%`;
    if (velocityBarEl) velocityBarEl.style.width = `${rate}%`;
}

function handleAddTaskSubmit(e) {
    e.preventDefault();
    const newTask = {
        id: "task-" + Date.now(),
        title: document.getElementById("add-title").value,
        subject: document.getElementById("add-subject").value,
        description: document.getElementById("add-desc").value,
        deadline: document.getElementById("add-deadline").value,
        priority: document.getElementById("add-priority").value,
        status: document.getElementById("add-status").value
    };
    tasks.unshift(newTask);
    document.getElementById("add-task-form").reset();
    closeModal("add-task-modal");
    renderAllLayouts();
}

function openEditTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById("edit-id").value = task.id;
    document.getElementById("edit-title").value = task.title;
    document.getElementById("edit-subject").value = task.subject;
    document.getElementById("edit-desc").value = task.description;
    document.getElementById("edit-deadline").value = task.deadline;
    document.getElementById("edit-priority").value = task.priority;
    document.getElementById("edit-status").value = task.status;

    openModal("edit-task-modal");
}

function handleEditTaskSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex !== -1) {
        tasks[taskIndex].title = document.getElementById("edit-title").value;
        tasks[taskIndex].subject = document.getElementById("edit-subject").value;
        tasks[taskIndex].description = document.getElementById("edit-desc").value;
        tasks[taskIndex].deadline = document.getElementById("edit-deadline").value;
        tasks[taskIndex].priority = document.getElementById("edit-priority").value;
        tasks[taskIndex].status = document.getElementById("edit-status").value;
    }

    closeModal("edit-task-modal");
    renderAllLayouts();
}

function handleDeleteTaskClick() {
    const id = document.getElementById("edit-id").value;
    tasks = tasks.filter(t => t.id !== id);
    closeModal("edit-task-modal");
    renderAllLayouts();
}

function renderProfileStats() {
    if (!document.getElementById("prof-total")) return;
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById("prof-total").textContent = total;
    document.getElementById("prof-completed").textContent = completed;
    document.getElementById("prof-pending").textContent = pending;
    document.getElementById("prof-rate").textContent = rate + "%";
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}