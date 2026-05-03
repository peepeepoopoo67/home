/**
 * ARCANA course-player.js
 * Handles:
 * 1. Sequential Intern Course Player with LocalStorage Progression
 * 2. postMessage listening to bridge with Articulate Rise 360
 */

/* ============================================================
   COURSE DATA — 4 Chapters, 3 Lessons Each
   ============================================================ */
const COURSES = {
    sped: {
        title: "Gamified Learning Design: From Frameworks to Interactive Development		",
        chapters: [
            {
                name: "Chapter 1 – Foundations of Gamified Learning",
                lessons: [
                    { title: "What is Gamification",                          src: "modules/interns/chapter1/lesson1/content/index.html" },
                    { title: "Why Gamification Works",                        src: "modules/interns/chapter1/lesson2/content/index.html" },
                    { title: "Trends in Learning Design",                     src: "modules/interns/chapter1/lesson3/content/index.html" }
                ]
            },
            {
                name: "Chapter 2 – Instructional Design Frameworks",
                lessons: [
                    { title: "What is Instructional Design",                  src: "modules/interns/chapter2/lesson1/content/index.html" },
                    { title: "Instructional Design Frameworks",               src: "modules/interns/chapter2/lesson2/content/index.html" },
                    { title: "Integrated Design Blueprint",                   src: "modules/interns/chapter2/lesson3/content/index.html" }
                ]
            },
            {
                name: "Chapter 3 – Building Gamified Learning in Rise360",
                lessons: [
                    { title: "Introduction to Articulate Rise 360",           src: "modules/interns/chapter3/lesson1/content/index.html" },
                    { title: "Structuring a Gamified Lesson",                 src: "modules/interns/chapter3/lesson2/content/index.html" },
                    { title: "Creating Interactive Activities",               src: "modules/interns/chapter3/lesson3/content/index.html" }
                ]
            },
            {
                name: "Chapter 4 – Code Blocks and Deployment",
                lessons: [
                    { title: "HTML, CSS, and JavaScript Basics",              src: "modules/interns/chapter4/lesson1/index.html" },
                    { title: "Using Code Blocks in Rise360",                  src: "modules/interns/chapter4/lesson2/index.html" },
                    { title: "Capstone: Build and Deploy a Gamified Lesson",  src: "modules/interns/chapter4/lesson3/index.html" }
                ]
            }
        ]
    },
};

/* ============================================================
   COURSE PLAYER STATE & LOGIC
   ============================================================ */
let flatLessons = [];
let currentCourseKey = "sped";
let totalLessons = 0;
let completedCount = 0; // Number of completed lessons retrieved from local storage
let activeLessonIndex = -1; // Currently viewing index

function initPlayer() {
    const sidebar = document.getElementById("player-sidebar");
    if (!sidebar) return; // Halt if not on the player page

    // 1. Establish Course Context
    const params = new URLSearchParams(window.location.search);
    currentCourseKey = params.get("course") || "sped";
    const course = COURSES[currentCourseKey] || COURSES.sped;

    const courseTitleEl = document.getElementById("player-course-title");
    if (courseTitleEl) courseTitleEl.textContent = course.title;
    document.title = `${course.title} — Intern Course`;

    // 2. Fetch Progress from Local Storage
    const storageKey = `alps_progress_${currentCourseKey}`;
    completedCount = parseInt(localStorage.getItem(storageKey) || "0", 10);

    // 3. Flatten lessons for easy indexing
    let globalIndex = 0;
    course.chapters.forEach((chapter, chIdx) => {
        chapter.lessons.forEach((lesson, lIdx) => {
            flatLessons.push({
                ...lesson,
                globalIndex: globalIndex,
                chapterIndex: chIdx
            });
            globalIndex++;
        });
    });
    totalLessons = flatLessons.length;

    // 4. Render Sidebar UI
    renderSidebar(course);

    // 5. Sidebar Toggle listener (Mobile/Desktop collapse)
    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                sidebar.classList.toggle("mobile-open");
            } else {
                sidebar.classList.toggle("collapsed");
            }
        });
    }

    // 6. Setup iframe Bridge Listener
    setupBridgeListener(storageKey);
}

function renderSidebar(course) {
    const sidebarScroll = document.getElementById("sidebar-scroll");
    sidebarScroll.innerHTML = ""; // Clear existing

    course.chapters.forEach((chapter, ci) => {
        const chapterId = `ch-${ci}`;
        const chEl = document.createElement("div");
        chEl.className = "sidebar-chapter";

        const btnEl = document.createElement("button");
        btnEl.className = "sidebar-chapter-btn is-open";
        btnEl.setAttribute("data-panel", chapterId);
        btnEl.innerHTML = `
            <svg class="sidebar-chapter-chevron" viewBox="0 0 16 16">
                <path d="M5 3l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${chapter.name}`;

        const lessonsEl = document.createElement("div");
        lessonsEl.className = "sidebar-lessons is-open";
        lessonsEl.id = chapterId;

        // Populate Lessons
        const chapterLessons = flatLessons.filter(l => l.chapterIndex === ci);
        
        chapterLessons.forEach((lesson) => {
            const lNum = lesson.globalIndex + 1;
            const lEl = document.createElement("div");
            
            const isCompleted = lesson.globalIndex < completedCount;
            const isLocked = lesson.globalIndex > completedCount;

            lEl.className = "sidebar-lesson";
            if (isLocked) lEl.classList.add("locked");
            if (isCompleted) lEl.classList.add("completed");

            lEl.dataset.index = lesson.globalIndex;

            // Icons: Completed (Check), Locked (Lock), Available (Play/Circle)
            let iconSvg = '';
            if (isCompleted) {
                iconSvg = `<svg class="lesson-icon" viewBox="0 0 20 20"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            } else if (isLocked) {
                iconSvg = `<svg class="lesson-icon" viewBox="0 0 20 20"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
            } else {
                iconSvg = `<svg class="lesson-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M8 7l5 3-5 3V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
            }

            lEl.innerHTML = `${iconSvg}<span>${lesson.title}</span>`;
            lessonsEl.appendChild(lEl);
        });

        // Chapter toggle behavior
        btnEl.addEventListener("click", () => {
            const isOpen = btnEl.classList.contains("is-open");
            btnEl.classList.toggle("is-open", !isOpen);
            lessonsEl.classList.toggle("is-open", !isOpen);
        });

        chEl.appendChild(btnEl);
        chEl.appendChild(lessonsEl);
        sidebarScroll.appendChild(chEl);
    });

    updateProgressBar();
    bindSidebarClicks();

    // Auto-open highest unlocked lesson (or latest incomplete)
    const targetIndex = completedCount < totalLessons ? completedCount : totalLessons - 1;
    loadLesson(targetIndex);
}

function bindSidebarClicks() {
    const sidebarScroll = document.getElementById("sidebar-scroll");
    sidebarScroll.addEventListener("click", e => {
        const lessonEl = e.target.closest(".sidebar-lesson");
        if (!lessonEl) return;

        const idx = parseInt(lessonEl.dataset.index, 10);
        
        // Prevent loading if locked
        if (idx > completedCount) {
            showLockedWall();
            return;
        }

        loadLesson(idx);
    });
}

function loadLesson(index) {
    if (index >= totalLessons) return;

    activeLessonIndex = index;
    const lessonData = flatLessons[index];

    const iframe        = document.getElementById("player-iframe");
    const placeholder   = document.getElementById("player-placeholder");
    const lockedWall    = document.getElementById("player-locked-wall");
    const lessonInfo    = document.getElementById("player-lesson-info");
    const lessonNumEl   = document.getElementById("lesson-info-number");
    const lessonTitleEl = document.getElementById("lesson-info-title");

    lockedWall.style.display = "none";
    
    // Manage UI active classes
    document.querySelectorAll(".sidebar-lesson").forEach(l => {
        l.classList.remove("active");
        if (parseInt(l.dataset.index, 10) === index) {
            l.classList.add("active");
        }
    });

    if (lessonData.src) {
        placeholder.style.display = "none";
        iframe.src = lessonData.src;
        iframe.style.display = "block";
    } else {
        iframe.style.display = "none";
        placeholder.style.display = "flex";
        placeholder.querySelector("h3").textContent = lessonData.title;
        placeholder.querySelector("p").textContent = "Module export not yet linked for this placeholder.";
    }

    if (lessonInfo) {
        lessonInfo.style.display = "flex";
        if (lessonNumEl)   lessonNumEl.textContent   = `Lesson ${index + 1}`;
        if (lessonTitleEl) lessonTitleEl.textContent = lessonData.title;
    }
}

function showLockedWall() {
    document.getElementById("player-placeholder").style.display = "none";
    document.getElementById("player-iframe").style.display = "none";
    document.getElementById("player-lesson-info").style.display = "none";
    document.getElementById("player-locked-wall").style.display = "flex";
}

function updateProgressBar() {
    const fillEl = document.getElementById("sidebar-progress-fill");
    const textEl = document.getElementById("progress-text");
    const fracEl = document.getElementById("progress-fraction");
    
    if(!fillEl) return;

    const percentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
    
    fillEl.style.width = `${percentage}%`;
    textEl.textContent = `${percentage}% Completed`;
    fracEl.textContent = `${completedCount}/${totalLessons}`;
}

/* ============================================================
   THE BRIDGE: Listening for Rise 360 Completion
   ============================================================ */
/* ============================================================
   THE BRIDGE: Listening for Rise 360 Completion
   ============================================================ */
/* ============================================================
   THE BRIDGE: Listening for Rise 360 Completion & Sheets Sync
   ============================================================ */
/* ============================================================
   THE BRIDGE: Listening for Rise 360 Completion & Sheets Sync
   ============================================================ */
/* ============================================================
   THE BRIDGE: Listening for Rise 360 Completion & Sheets Sync
   ============================================================ */
function setupBridgeListener(storageKey) {
    const internDirectory = {
        "2026-010": "JOSHUA RODWIN S. CRUZ",
        "2026-011": "CHARLIE MARGARET A. BALAGTAS",
        "2026-012": "MIKAYLA R. BAÑADA",
        "2026-013": "CARL EMMANUEL A. CARSON",
        "2026-014": "LARAH SUZANNE C. LIBIRAN",
        "2026-015": "LYWELL B. PALARCA",
        "2026-016": "TREVOR BASTI G. TORRES",
        "2026-017": "ALDRIN C. VICTORIA",
        "2026-018": "JON BERNARD M. CALMA",
        "2026-019": "JOHRIN ASHLEIGH SP. CHAN",
        "2026-020": "KIRBY BENJ D. GUTIERREZ",
        "2026-021": "ALLEN WILSON D. TUAZON",
        "6767-666": "PEEPEEPOOPOO J. TRUMP",
        "6969-696": "PLAYBOI CARTI D. GOAT",
      "0000-000": "KANYE WEST"
    };

    window.addEventListener('message', (event) => {
        // Tracker 1: Catching EVERYTHING the iframe shouts
        console.log("👉 [BRIDGE] Message received from iframe:", event.data);

        if (event.data && event.data.type === 'complete') {
            console.log("👉 [BRIDGE] 'complete' signal officially detected!");
            
            try {
                // Tracker 2: Checking the Secret Handshake
                const durationString = localStorage.getItem('alps_lesson_final_time');
                console.log("👉 [BRIDGE] Checked LocalStorage for time. Result:", durationString);
                
                if (durationString) {
                    console.log(`👉 [BRIDGE] Handshake Verified! Active Index: ${activeLessonIndex} | Completed Count: ${completedCount}`);
                    
                    localStorage.removeItem('alps_lesson_final_time');

                    if (activeLessonIndex === completedCount) {
                        console.log("👉 [BRIDGE] Index matched. Unlocking sidebar now...");
                        
                        completedCount++;
                        localStorage.setItem(storageKey, completedCount);
                        renderSidebar(COURSES[currentCourseKey]);
                        updateProgressBar();

                        if (completedCount >= totalLessons) {
                            const badge = document.getElementById("course-status-badge");
                            if (badge) badge.textContent = "Course Complete";
                        }

                        const internID = localStorage.getItem('arcana_active_intern') || "Unknown ID";
                        const internName = internDirectory[internID] || "Unknown Intern";
                        const lessonTitle = flatLessons[activeLessonIndex].title;

                        const payload = {
                            internID: internID,
                            fullName: internName,
                            lessonID: lessonTitle,
                            duration: durationString,
                            status: "Completed"
                        };

                        console.log("👉 [BRIDGE] Preparing to send payload to Netlify:", payload);

                        fetch('/.netlify/functions/save-progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })
                        .then(response => response.json())
                        .then(data => console.log("👉 [BRIDGE] GOOGLE SHEETS SUCCESS:", data))
                        .catch(error => console.error("👉 [BRIDGE] GOOGLE SHEETS FAILED:", error));
                        
                    } else {
                        console.log("👉 [BRIDGE] Ignored: Lesson already completed or index mismatch.");
                    }
                } else {
                    console.error("👉 [BRIDGE] ERROR: LocalStorage is empty. The 'Secret Handshake' failed.");
                }
            } catch (err) {
                console.error("👉 [BRIDGE] CRITICAL JS ERROR in listener:", err);
            }
        }
    });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    initPlayer();
});

async function markLessonComplete(lessonID) {
    if (!progressData.completed.includes(lessonID)) {
        progressData.completed.push(lessonID);
        localStorage.setItem('alps_progress', JSON.stringify(progressData));

        // Get the duration from the ID's timer
        const duration = localStorage.getItem('alps_lesson_final_time') || "00:00";
        const internName = internDirectory[activeInternID] || "Unknown Intern";

        // SHOUT TO THE DATABASE
        try {
            await fetch('/.netlify/functions/save-progress', {
                method: 'POST',
                body: JSON.stringify({
                    internId: activeInternID,
                    name: internName,
                    lessonId: lessonID,
                    duration: duration
                })
            });
            console.log("Sheet updated for " + internName);
        } catch (err) {
            console.error("Failed to sync with Google Sheets:", err);
        }

        renderSidebar(); 
        updateProgressBar();
    }
}