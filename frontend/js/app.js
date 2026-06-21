/**
 * ==========================================================================
 * TASK TRACKER — CORE FRONTEND ENGINE (REVISED ANTI-CRASH)
 * Synchronized Theme States, Active Profile Dropdowns & Live Kanban Pipeline.
 * ==========================================================================
 */

const t_dict = {
    en: {
        welcome_title: "Welcome back",
        velocity: "Weekly Completion Velocity",
        in_progress: "In Progress",
        completed: "Completed Workspace",
        create_task: "Create Task",
        task_title: "Task Title",
        subject: "Subject",
        description: "Description",
        deadline: "Deadline",
        priority: "Priority",
        status: "Status",
        cancel: "Cancel",
        save_task: "Save Task",
        modify_task: "Modify Task",
        delete_task: "Delete Task",
        update_task: "Update",
        preferences: "Preferences",
        dark_mode: "Dark Interface Mode",
        dark_desc: "Swap context color tones instantly.",
        notifications: "Push Notifications",
        notif_desc: "Receive strict alerts near target deadlines.",
        language: "System Language",
        done: "Done",
        clear_title: "Clear Completed Tasks",
        clear_desc: "Are you sure you want... This action cannot be undone.",
        clear_history: "Clear History",
        search_ph: "Search tasks, priorities, courses via fuzzy keys...",
        add_task_ph: "e.g., Thesis Chapter 1 Draft",
        subject_ph: "e.g., Computer Science",
        desc_ph: "Provide extra details...",
        edit_task: "Modify task",
        no_match: "No matching tasks inside this status.",
        tasks_rem_prefix: "You have ",
        tasks_rem_suffix: " tasks remaining for this week.",
        task_rem_suffix: " task remaining for this week."
    },
    id: {
        welcome_title: "Selamat datang",
        velocity: "Progres Mingguan",
        in_progress: "Berjalan",
        completed: "Terselesaikan",
        create_task: "Buat Tugas",
        task_title: "Judul Tugas",
        subject: "Mata Kuliah",
        description: "Deskripsi",
        deadline: "Tenggat Waktu",
        priority: "Prioritas",
        status: "Status",
        cancel: "Batal",
        save_task: "Simpan Tugas",
        modify_task: "Ubah Tugas",
        delete_task: "Hapus Tugas",
        update_task: "Perbarui",
        preferences: "Pengaturan",
        dark_mode: "Mode Antarmuka Gelap",
        dark_desc: "Ubah instan warna keseluruhan aplikasi.",
        notifications: "Notifikasi Otomatis",
        notif_desc: "Terima peringatan dekat waktu tenggat.",
        language: "Bahasa Sistem",
        done: "Selesai",
        clear_title: "Bersihkan Tugas Selesai",
        clear_desc: "Yakin ingin menghapus seluruh histori tugas? Aksi ini permanen.",
        clear_history: "Hapus Histori",
        search_ph: "Cari tugas, prioritas, atau mata kuliah...",
        add_task_ph: "mis. Draf Bab 1 Skripsi",
        subject_ph: "mis. Ilmu Komputer",
        desc_ph: "Tuliskan rincian tambahan...",
        edit_task: "Ubah",
        no_match: "Tidak ditemukan tugas pada kolom ini.",
        tasks_rem_prefix: "Anda memiliki ",
        tasks_rem_suffix: " tugas tersisa minggu ini.",
        task_rem_suffix: " tugas tersisa minggu ini."
    }
};

const dom_map = {
    ".welcome-title": "welcome_title", // Custom handling needed for name
    ".progress-labels span:first-child": "velocity",
    "#add-task-modal .modal-title": "create_task",
    "label[for='add-title']": "task_title",
    "label[for='add-subject']": "subject",
    "label[for='add-desc']": "description",
    "label[for='add-deadline']": "deadline",
    "label[for='add-priority']": "priority",
    "label[for='add-status']": "status",
    "#add-task-modal button[type='submit']": "save_task",
    "#close-add-modal": "cancel",
    "#edit-task-modal .modal-title": "modify_task",
    "label[for='edit-title']": "task_title",
    "label[for='edit-subject']": "subject",
    "label[for='edit-desc']": "description",
    "label[for='edit-deadline']": "deadline",
    "label[for='edit-priority']": "priority",
    "label[for='edit-status']": "status",
    "#delete-edit-modal": "delete_task",
    "#edit-task-modal button[type='submit']": "update_task",
    "#close-edit-modal": "cancel",
    "#settings-modal .modal-title": "preferences",
    ".flex-settings-row:nth-child(1) .block-label": "dark_mode",
    ".flex-settings-row:nth-child(1) .form-desc-text": "dark_desc",
    ".flex-settings-row:nth-child(2) .block-label": "notifications",
    ".flex-settings-row:nth-child(2) .form-desc-text": "notif_desc",
    "label[for='language-selection']": "language",
    "#close-settings-modal": "done",
    "#clear-history-modal .modal-title": "clear_title",
    "#clear-history-modal .modal-desc": "clear_desc",
    "#clear-history-modal .btn-secondary": "cancel",
    "#clear-history-modal .btn-danger": "clear_history"
};

function applyLanguage(lang) {
    const t = t_dict[lang];
    if (!t) return;

    // Static DOM mappings
    for (const [selector, key] of Object.entries(dom_map)) {
        const el = document.querySelector(selector);
        if (el) el.textContent = t[key];
    }

    // Custom handled static
    const welcomeNode = document.querySelector(".welcome-title");
    if (welcomeNode) welcomeNode.textContent = t.welcome_title + ", Nana";

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.placeholder = t.search_ph;

    const addTitle = document.getElementById("add-title");
    if (addTitle) addTitle.placeholder = t.add_task_ph;
    const addSubj = document.getElementById("add-subject");
    if (addSubj) addSubj.placeholder = t.subject_ph;
    const addDesc = document.getElementById("add-desc");
    if (addDesc) addDesc.placeholder = t.desc_ph;

    // Trigger dynamic render to update inner JS strings
    renderDynamicKanbanLanes();
}

// Determine backend API URL smartly based on environment (locally vs hosted)
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocal ? "http://localhost:5000" : "https://YOUR_BACKEND_URL_NANTI.onrender.com";

let currentUser = null;

// Tasks are now loaded from the backend API
let tasks = [];

let appPreferences = {
    theme: "light",
    notifications: true,
    language: "en"
};

let activeSearchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    loadPreferences();
    initGlobalUIListeners();

    // Auth Guard + Data Loading for protected pages
    const protectedPages = ["dashboard.html", "profile.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
        fetch(`${API_BASE}/me`, {
            method: "GET",
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) {
                    window.location.href = "login.html";
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                currentUser = data.user;
                updateUserUI();
                return fetchTasksFromAPI();
            })
            .catch(() => {
                console.warn("Auth check skipped: backend not reachable.");
                renderAllLayouts();
            });
    } else {
        renderAllLayouts();
    }
});

function updateUserUI() {
    if (!currentUser) return;
    const name = currentUser.full_name || currentUser.username || "User";

    // Update welcome title
    const welcomeEl = document.querySelector(".welcome-title");
    const t = t_dict[appPreferences.language || 'en'];
    if (welcomeEl) welcomeEl.textContent = `${t.welcome_title}, ${name}`;

    // Update navbar avatar and name
    const avatarEl = document.querySelector(".profile-avatar-sm");
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    const nameEl = document.querySelector(".profile-name-sm");
    if (nameEl) nameEl.textContent = name;

    // Profile Page Updates
    const profAvatar = document.querySelector(".profile-avatar");
    if (profAvatar) profAvatar.textContent = name.charAt(0).toUpperCase();

    const profName = document.querySelector(".profile-name");
    if (profName) profName.textContent = name;

    const profFullname = document.getElementById("prof-fullname");
    if (profFullname) profFullname.textContent = name;

    const profEmail = document.getElementById("prof-email");
    if (profEmail) profEmail.textContent = currentUser.email || "—";

    const profSchool = document.getElementById("prof-school");
    if (profSchool) profSchool.textContent = currentUser.school || "—";

    const profMajor = document.getElementById("prof-major");
    if (profMajor) profMajor.textContent = currentUser.major || "—";

    const profBio = document.getElementById("prof-bio");
    if (profBio) profBio.textContent = currentUser.bio || "—";
}

function fetchTasksFromAPI() {
    return fetch(`${API_BASE}/tasks`, {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            // Normalize status casing from backend (e.g. 'pending' -> 'Pending')
            tasks = (data.tasks || []).map(t => ({
                ...t,
                priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
                status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Pending'
            }));
            renderAllLayouts();
        })
        .catch(err => {
            console.error("Failed to fetch tasks:", err);
            renderAllLayouts();
        });
}

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

    const mobileMenuToggle = document.querySelector(".nav-hamburger-btn");
    const mobileMenu = document.getElementById("mobile-nav-menu");
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle("active");
        });
    }

    document.addEventListener("click", (event) => {
        if (mobileMenu && !event.target.closest(".nav-hamburger-btn") && !event.target.closest(".nav-mobile-menu")) {
            mobileMenu.classList.remove("active");
        }
    });

    // Language Toggle Update Handler
    const langSelect = document.getElementById("language-selection");
    if (langSelect) {
        langSelect.addEventListener("change", (e) => {
            const newLang = e.target.value;
            appPreferences.language = newLang;
            localStorage.setItem("task_tracker_pref", JSON.stringify(appPreferences));
            applyLanguage(newLang);
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
        navbarThemeBtn.innerHTML = (themeStr === "dark") ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
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
        navbarThemeBtn.innerHTML = (appPreferences.theme === "dark") ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    const langSelect = document.getElementById("language-selection");
    if (langSelect) langSelect.value = appPreferences.language;

    applyLanguage(appPreferences.language);
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

    const t = t_dict[appPreferences.language || 'en'];

    boardContainer.innerHTML = `
        <div class="board-lane" id="lane-pending">
            <div class="lane-header">
                <div class="lane-title-group">
                    <span class="lane-indicator-dot pending"></span>
                    <h2 class="lane-title">${t.in_progress}</h2>
                    <span class="lane-counter">${pendingTasks.length}</span>
                </div>
            </div>
            <div class="lane-cards-stack" id="stack-pending"></div>
        </div>

        <div class="board-lane" id="lane-completed">
            <div class="lane-header">
                <div class="lane-title-group">
                    <span class="lane-indicator-dot completed"></span>
                    <h2 class="lane-title">${t.completed}</h2>
                    <span class="lane-counter">${completedTasks.length}</span>
                </div>
                ${completedTasks.length > 0 ? `<button class="btn-clear-history" id="clear-history-btn" title="Clear all completed tasks"><i class="fas fa-trash-alt"></i> ${t.clear_history}</button>` : ''}
            </div>
            <div class="lane-cards-stack" id="stack-completed"></div>
        </div>
    `;

    populateLaneStack("stack-pending", pendingTasks);
    populateLaneStack("stack-completed", completedTasks);
    calculateHeroMetricsSummary();

    // Setup clear history button event listener
    const clearHistoryBtn = document.getElementById("clear-history-btn");
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", openClearHistoryModal);
    }
}

function populateLaneStack(stackId, laneTasks) {
    const stackContainer = document.getElementById(stackId);
    if (!stackContainer) return;

    const t = t_dict[appPreferences.language || 'en'];

    if (laneTasks.length === 0) {
        stackContainer.innerHTML = `<p class="form-desc-text" style="padding: 12px 4px;">${t.no_match}</p>`;
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
                <span class="task-edit-btn" onclick="openEditTaskModal('${task.id}')">${t.edit_task}</span>
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

    const t = t_dict[appPreferences.language || 'en'];

    if (summaryCountEl) summaryCountEl.textContent = `${t.tasks_rem_prefix}${pendingCount}${pendingCount === 1 ? t.task_rem_suffix : t.tasks_rem_suffix}`;
    if (velocityPercentageEl) velocityPercentageEl.textContent = `${rate}%`;
    if (velocityBarEl) velocityBarEl.style.width = `${rate}%`;
}

function handleAddTaskSubmit(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById("add-title").value,
        subject: document.getElementById("add-subject").value,
        description: document.getElementById("add-desc").value,
        deadline: document.getElementById("add-deadline").value,
        priority: document.getElementById("add-priority").value.toLowerCase(),
        status: document.getElementById("add-status").value.toLowerCase()
    };

    fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("add-task-form").reset();
            closeModal("add-task-modal");
            fetchTasksFromAPI();
        })
        .catch(err => {
            console.error("Error creating task:", err);
            alert("Gagal menambahkan tugas.");
        });
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
    const payload = {
        title: document.getElementById("edit-title").value,
        subject: document.getElementById("edit-subject").value,
        description: document.getElementById("edit-desc").value,
        deadline: document.getElementById("edit-deadline").value,
        priority: document.getElementById("edit-priority").value.toLowerCase(),
        status: document.getElementById("edit-status").value.toLowerCase()
    };

    fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(() => {
            closeModal("edit-task-modal");
            fetchTasksFromAPI();
        })
        .catch(err => {
            console.error("Error updating task:", err);
            alert("Gagal memperbarui tugas.");
        });
}

function handleDeleteTaskClick() {
    const id = document.getElementById("edit-id").value;

    fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        credentials: "include"
    })
        .then(res => res.json())
        .then(() => {
            closeModal("edit-task-modal");
            fetchTasksFromAPI();
        })
        .catch(err => {
            console.error("Error deleting task:", err);
            alert("Gagal menghapus tugas.");
        });
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

function openClearHistoryModal() {
    openModal("clear-history-modal");
}

function clearCompletedTasks() {
    fetch(`${API_BASE}/tasks/completed`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(() => {
            closeModal("clear-history-modal");
            fetchTasksFromAPI();
        })
        .catch(error => {
            console.error("Error clearing history:", error);
            alert("Gagal menghapus history dari server.");
            closeModal("clear-history-modal");
        });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}