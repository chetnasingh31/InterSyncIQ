// ===== GLOBAL VARIABLES =====
let resumes = [];
let currentResults = null;
let candidateAnalysis = null;
let currentMode = 'recruiter';
let selectedJDIndex = 0;
let selectedCandidateJDIndex = 0;

// ===== DOM ELEMENTS =====
const dropArea = document.getElementById("dropArea");
const resumeInput = document.getElementById("resumeInput");
const fileList = document.getElementById("fileList");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsSection = document.getElementById("resultsSection");
const resultsContent = document.getElementById("resultsContent");
const loadingSpinner = document.getElementById("loadingSpinner");
const jdText = document.getElementById("jdText");
const jdFileInput = document.getElementById("jdFile");
const jdFileCount = document.getElementById("jdFileCount");
const jdFileList = document.getElementById("jdFileList");
const charCount = document.getElementById("charCount");
const fileCount = document.getElementById("fileCount");
const sortSelect = document.getElementById("sortSelect");
const exportBtn = document.getElementById("exportBtn");
const modal = document.getElementById("detailModal");
const closeModal = document.querySelector(".close-modal");
const modalBody = document.getElementById("modalBody");
const skillsContainer = document.getElementById("skillsContainer");
const statsGrid = document.getElementById("statsGrid");
const resultsSummary = document.querySelector(".results-summary");
const resultsHeader = document.querySelector(".results-header");

// Candidate View Elements
const modeToggle = document.querySelector('.mode-toggle');
const recruiterModeBtn = document.getElementById('recruiterMode');
const candidateModeBtn = document.getElementById('candidateMode');
const currentModeIndicator = document.getElementById('currentMode');
const recruiterView = document.getElementById('recruiterView');
const candidateView = document.getElementById('candidateView');
const candidateResults = document.getElementById('candidateResults');

const candidateResumeInput = document.getElementById('candidateResume');
const candidateResumePreview = document.getElementById('candidateResumePreview');
const candidateResumeName = document.getElementById('candidateResumeName');
const candidateJDText = document.getElementById('candidateJD');
const candidateCharCount = document.getElementById('candidateCharCount');
const candidateJDFileInput = document.getElementById('candidateJDFile');
const candidateJDFileCount = document.getElementById('candidateJDFileCount');
const candidateJDFileList = document.getElementById('candidateJDFileList');
const candidateJDSelectorWrap = document.getElementById('candidateJDSelectorWrap');
const candidateJDSelect = document.getElementById('candidateJDSelect');
const analyzeCandidateBtn = document.getElementById('analyzeCandidateBtn');
const candidateFitCircle = document.getElementById('candidateFitCircle');
const candidateFitScore = document.getElementById('candidateFitScore');
const fitFeedback = document.getElementById('fitFeedback');
const candidateMatched = document.getElementById('candidateMatched');
const candidateMissing = document.getElementById('candidateMissing');
const candidateInsights = document.getElementById('candidateInsights');
const candidateActionHigh = document.getElementById('candidateActionHigh');
const candidateActionMedium = document.getElementById('candidateActionMedium');
const candidateActionOptional = document.getElementById('candidateActionOptional');
const alternativeRoles = document.getElementById('alternativeRoles');
const actionPlan = document.getElementById('actionPlan');
const exportPlanBtn = document.getElementById('exportPlanBtn');

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    // Mode switching
    recruiterModeBtn.addEventListener('click', () => switchMode('recruiter'));
    candidateModeBtn.addEventListener('click', () => switchMode('candidate'));
    
    // JD text character counter
    jdText.addEventListener("input", () => {
        charCount.textContent = jdText.value.length;
    });
    
    // Candidate JD character counter
    candidateJDText.addEventListener("input", () => {
        candidateCharCount.textContent = candidateJDText.value.length;
    });
    candidateResumeInput.addEventListener("change", handleCandidateResumeChange);
    candidateJDFileInput.addEventListener("change", handleCandidateJDFileSelection);

    // Drag and drop functionality
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);
    
    // File input
    resumeInput.addEventListener("change", handleFileSelect);
    jdFileInput.addEventListener("change", handleJDFileSelection);
    
    // Buttons
    analyzeBtn.addEventListener("click", analyzeResumes);
    clearBtn.addEventListener("click", clearAllFiles);
    sortSelect.addEventListener("change", sortResults);
    exportBtn.addEventListener("click", exportResults);
    analyzeCandidateBtn.addEventListener("click", analyzeCandidate);
    exportPlanBtn.addEventListener("click", exportActionPlan);
    closeModal.addEventListener("click", () => modal.style.display = "none");
    
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
    
    // Set initial mode
    switchMode('recruiter');
    
    // Trigger initial character count
    jdText.dispatchEvent(new Event('input'));
    candidateJDText.dispatchEvent(new Event('input'));
    handleCandidateResumeChange();
    handleJDFileSelection();
    handleCandidateJDFileSelection();
}

// ===== MODE SWITCHING =====
function switchMode(mode) {
    currentMode = mode;
    
    // Update UI
    if (mode === 'recruiter') {
        recruiterModeBtn.classList.add('active');
        candidateModeBtn.classList.remove('active');
        recruiterView.classList.add('active');
        candidateView.classList.remove('active');
        currentModeIndicator.innerHTML = '<i class="fas fa-user-tie"></i> Recruiter View';
        currentModeIndicator.style.background = 'rgba(67, 97, 238, 0.1)';
        currentModeIndicator.style.borderColor = 'rgba(67, 97, 238, 0.2)';
        currentModeIndicator.style.color = 'var(--primary)';
        
        // Show recruiter results if they exist
        if (currentResults) {
            resultsSection.style.display = 'block';
        }
    } else {
        candidateModeBtn.classList.add('active');
        recruiterModeBtn.classList.remove('active');
        candidateView.classList.add('active');
        recruiterView.classList.remove('active');
        currentModeIndicator.innerHTML = '<i class="fas fa-user-graduate"></i> Candidate View';
        currentModeIndicator.style.background = 'rgba(114, 9, 183, 0.1)';
        currentModeIndicator.style.borderColor = 'rgba(114, 9, 183, 0.2)';
        currentModeIndicator.style.color = 'var(--secondary)';
        
        // Hide recruiter results when switching to candidate view
        resultsSection.style.display = 'none';
        
        // Show candidate results if they exist
        if (candidateAnalysis) {
            candidateResults.style.display = 'block';
        }
    }

    updateRecruiterCompactMode();
}

function updateRecruiterCompactMode() {
    const recruiterActive = currentMode === 'recruiter';
    const recruiterResultsVisible = resultsSection.style.display === 'block';
    document.body.classList.toggle('recruiter-compact', recruiterActive && !recruiterResultsVisible);

    const candidateActive = currentMode === 'candidate';
    const candidateResultsVisible = candidateResults.style.display === 'block';
    document.body.classList.toggle('candidate-compact', candidateActive && !candidateResultsVisible);
}

// ===== DRAG & DROP HANDLERS =====
function handleDragOver(e) {
    e.preventDefault();
    dropArea.classList.add("dragover");
}

function handleDragLeave() {
    dropArea.classList.remove("dragover");
}

function handleDrop(e) {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

function handleJDFileSelection() {
    const jdFiles = Array.from(jdFileInput.files || []);
    const label = `${jdFiles.length} JD file${jdFiles.length === 1 ? "" : "s"} selected`;
    jdFileCount.textContent = label;

    jdFileList.innerHTML = "";
    jdFiles.forEach(file => {
        const item = document.createElement("li");
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        item.innerHTML = `
            <i class="fas ${getFileIcon(file.name)}"></i>
            <span class="jd-file-name">${escapeHtml(file.name)}</span>
            <span class="jd-file-size">${fileSize} MB</span>
        `;
        jdFileList.appendChild(item);
    });
}

function handleCandidateResumeChange() {
    const resumeFile = candidateResumeInput.files[0];

    if (!resumeFile) {
        candidateResumePreview.style.display = "none";
        candidateResumeName.textContent = "";
        return;
    }

    const validTypes = [".pdf", ".docx", ".txt"];
    const fileExt = "." + resumeFile.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileExt)) {
        showNotification(`File type not supported: ${fileExt}`, "error");
        candidateResumeInput.value = "";
        candidateResumePreview.style.display = "none";
        candidateResumeName.textContent = "";
        return;
    }

    if (resumeFile.size > 10 * 1024 * 1024) {
        showNotification(`File "${resumeFile.name}" is too large (max 10MB)`, "error");
        candidateResumeInput.value = "";
        candidateResumePreview.style.display = "none";
        candidateResumeName.textContent = "";
        return;
    }

    const fileSizeMb = (resumeFile.size / 1024 / 1024).toFixed(2);
    candidateResumeName.textContent = `${resumeFile.name} (${fileSizeMb} MB)`;
    candidateResumePreview.style.display = "flex";
}

function handleCandidateJDFileSelection() {
    const jdFiles = Array.from(candidateJDFileInput.files || []);
    const label = `${jdFiles.length} JD file${jdFiles.length === 1 ? "" : "s"} selected`;
    candidateJDFileCount.textContent = label;

    candidateJDFileList.innerHTML = "";
    jdFiles.forEach(file => {
        const item = document.createElement("li");
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        item.innerHTML = `
            <i class="fas ${getFileIcon(file.name)}"></i>
            <span class="jd-file-name">${escapeHtml(file.name)}</span>
            <span class="jd-file-size">${fileSize} MB</span>
        `;
        candidateJDFileList.appendChild(item);
    });
}

// ===== FILE MANAGEMENT =====
function addFiles(files) {
    files.forEach(file => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification(`File "${file.name}" is too large (max 10MB)`, "error");
            return;
        }
        
        // Check file type
        const validTypes = [".pdf", ".docx", ".txt"];
        const fileExt = "." + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExt)) {
            showNotification(`File type not supported: ${fileExt}`, "error");
            return;
        }
        
        // Check for duplicates
        if (!resumes.some(r => r.name === file.name && r.size === file.size)) {
            resumes.push(file);
            addFileToList(file);
            updateFileCount();
        }
    });
}

function addFileToList(file) {
    const li = document.createElement("li");
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const fileIcon = getFileIcon(file.name);
    
    li.innerHTML = `
        <div class="file-info">
            <i class="fas ${fileIcon} file-icon"></i>
            <div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize} MB</div>
            </div>
        </div>
        <button class="remove-file" onclick="removeFile('${file.name}', ${file.size})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    fileList.appendChild(li);
    
    // Add animation
    li.style.animation = "slideIn 0.3s ease-out";
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf': return 'fa-file-pdf';
        case 'docx': return 'fa-file-word';
        case 'txt': return 'fa-file-alt';
        default: return 'fa-file';
    }
}

function removeFile(name, size) {
    resumes = resumes.filter(r => !(r.name === name && r.size === size));
    
    // Remove from UI
    const items = fileList.querySelectorAll('li');
    items.forEach(item => {
        if (item.querySelector('.file-name').textContent === name) {
            item.style.animation = "slideIn 0.3s ease-out reverse";
            setTimeout(() => item.remove(), 300);
        }
    });
    
    updateFileCount();
}

function clearAllFiles() {
    const hasJDFiles = (jdFileInput.files || []).length > 0;
    if (resumes.length === 0 && !hasJDFiles) return;
    
    if (confirm("Are you sure you want to clear all uploaded files?")) {
        resumes = [];
        fileList.innerHTML = "";
        updateFileCount();
        jdFileInput.value = "";
        handleJDFileSelection();
        showNotification("All files cleared", "success");
    }
}

function updateFileCount() {
    fileCount.textContent = resumes.length;
    
    // Update button state
    analyzeBtn.disabled = resumes.length === 0;
}

// ===== RECRUITER ANALYSIS FUNCTION =====
async function analyzeResumes() {
    if (resumes.length === 0) {
        showNotification("Please upload at least one resume", "error");
        return;
    }
    
    // Show loading
    loadingSpinner.style.display = "block";
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analyzing...';
    
    try {
        const formData = new FormData();
        const jdFiles = Array.from(jdFileInput.files || []);
        const validTypes = [".pdf", ".docx", ".txt"];
        
        // Add JD text
        if (jdText.value.trim()) {
            formData.append("jd_text", jdText.value);
        }
        
        // Add JD files (supports multiple uploads)
        for (const jdFile of jdFiles) {
            const fileExt = "." + jdFile.name.split('.').pop().toLowerCase();
            if (!validTypes.includes(fileExt)) {
                showNotification(`JD file type not supported: ${fileExt}`, "error");
                return;
            }
            if (jdFile.size > 10 * 1024 * 1024) {
                showNotification(`JD file "${jdFile.name}" is too large (max 10MB)`, "error");
                return;
            }
            formData.append("jd_file", jdFile);
        }
        
        // Add resumes
        resumes.forEach((resume, index) => {
            formData.append("resumes[]", resume);
        });
        
        // Send request
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentResults = data;
        
        // Render results
        renderResults(data);
        
        // Show results section
        resultsSection.style.display = "block";
        updateRecruiterCompactMode();
        resultsSection.scrollIntoView({ behavior: "smooth" });
        
        const jdCount = getJdAnalyses(data).length;
        if (jdCount > 1) {
            showNotification("Select Job Description to view analysis results", "success");
        } else {
            showNotification("Analysis complete!", "success");
        }
        
    } catch (error) {
        console.error("Analysis error:", error);
        showNotification("Analysis failed. Please try again.", "error");
    } finally {
        // Reset button
        loadingSpinner.style.display = "none";
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Resumes';
    }
}

// ===== RENDER RECRUITER RESULTS =====
function renderResults(data) {
    const analyses = getJdAnalyses(data);
    const isMultiJD = analyses.length > 1;

    resultsContent.innerHTML = "";
    skillsContainer.innerHTML = "";
    statsGrid.innerHTML = "";

    setResultsLayoutMode(isMultiJD);

    if (!isMultiJD) {
        selectedJDIndex = 0;
        const analysis = analyses[0] || { required_skills: [], results: [], statistics: {} };
        const sortedResults = getSortedResults(analysis.results || []);

        renderRequiredSkills(analysis.required_skills, sortedResults, skillsContainer);
        renderStatistics(analysis, statsGrid);
        renderComparisonTable(sortedResults, resultsContent);
        return;
    }

    renderMultiJDResults(analyses);
}

function setResultsLayoutMode(isMultiJD) {
    resultsSummary.style.display = isMultiJD ? "none" : "grid";
    resultsHeader.style.display = isMultiJD ? "none" : "flex";
}

function getJdAnalyses(data) {
    if (Array.isArray(data?.jd_analyses) && data.jd_analyses.length > 0) {
        return data.jd_analyses.map((analysis, index) => ({
            jd_name: analysis.jd_name || `JD ${index + 1}`,
            jd_profile: analysis.jd_profile || {},
            required_skills: analysis.required_skills || [],
            results: analysis.results || [],
            statistics: analysis.statistics || {}
        }));
    }

    return [{
        jd_name: "Job Description",
        jd_profile: {},
        required_skills: data?.required_skills || [],
        results: data?.results || [],
        statistics: data?.statistics || {}
    }];
}

function getSortedResults(results) {
    const sortedResults = [...(results || [])];
    const sortBy = sortSelect.value;

    switch (sortBy) {
        case "name":
            sortedResults.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            break;
        case "skills":
            sortedResults.sort((a, b) => (b.matched?.length || 0) - (a.matched?.length || 0));
            break;
        case "fit":
        default:
            sortedResults.sort((a, b) => (b.fit || 0) - (a.fit || 0));
    }

    return sortedResults;
}

function renderMultiJDResults(analyses) {
    if (selectedJDIndex < 0 || selectedJDIndex >= analyses.length) {
        selectedJDIndex = 0;
    }

    const selectorPanel = document.createElement("div");
    selectorPanel.className = "jd-selector-panel";

    const options = analyses.map((analysis, index) => {
        const candidateCount = (analysis.results || []).length;
        return `<option value="${index}" ${index === selectedJDIndex ? "selected" : ""}>${escapeHtml(analysis.jd_name)} (${candidateCount} candidates)</option>`;
    }).join("");

    selectorPanel.innerHTML = `
        <div class="jd-selector-title">
            <i class="fas fa-filter"></i>
            <span>Select Job Description to view analysis results</span>
        </div>
        <div class="jd-selector-control">
            <label for="jdCompareSelect">Select JD</label>
            <select id="jdCompareSelect">${options}</select>
        </div>
    `;

    resultsContent.appendChild(selectorPanel);

    const jdCompareSelect = selectorPanel.querySelector("#jdCompareSelect");
    jdCompareSelect.addEventListener("change", (event) => {
        selectedJDIndex = Number(event.target.value) || 0;
        renderResults(currentResults);
    });

    const selectedAnalysis = analyses[selectedJDIndex] || analyses[0];
    renderSingleJDAnalysisBlock(selectedAnalysis, selectedJDIndex);
}

function renderSingleJDAnalysisBlock(analysis, index) {
    const sortedResults = getSortedResults(analysis.results || []);
    const topFit = sortedResults[0]?.fit || 0;
    const jdProfile = analysis.jd_profile || {};
    const profileTools = (jdProfile.tools || []).slice(0, 8).join(", ") || "Not specified";
    const profileKeywords = (jdProfile.keywords || []).slice(0, 8).join(", ") || "Not specified";
    const profileExperience = jdProfile.experience_level || "Not specified";

    const block = document.createElement("article");
    block.className = "jd-result-block";
    block.innerHTML = `
        <div class="jd-result-header">
            <h3><i class="fas fa-briefcase"></i> ${escapeHtml(analysis.jd_name || `JD ${index + 1}`)}</h3>
            <div class="jd-result-meta">
                <span>${sortedResults.length} candidates</span>
                <span>Top fit: ${topFit}%</span>
            </div>
        </div>
        <div class="jd-profile-strip">
            <div><strong>Experience Level:</strong> ${escapeHtml(profileExperience)}</div>
            <div><strong>Tools:</strong> ${escapeHtml(profileTools)}</div>
            <div><strong>Keywords:</strong> ${escapeHtml(profileKeywords)}</div>
        </div>
        <div class="jd-summary-grid">
            <div class="summary-card">
                <i class="fas fa-tasks"></i>
                <h3>Skill Coverage Insights</h3>
                <div class="jd-skills-container skills-container"></div>
            </div>
            <div class="summary-card">
                <i class="fas fa-chart-pie"></i>
                <h3>Overall Statistics</h3>
                <div class="jd-stats-grid stats-grid"></div>
            </div>
        </div>
        <div class="results-header jd-inner-results-header">
            <h3><i class="fas fa-user-tie"></i> Candidate Comparison</h3>
        </div>
        <div class="jd-table-container"></div>
    `;

    resultsContent.appendChild(block);

    const skillsHost = block.querySelector(".jd-skills-container");
    const statsHost = block.querySelector(".jd-stats-grid");
    const tableHost = block.querySelector(".jd-table-container");

    renderRequiredSkills(analysis.required_skills, sortedResults, skillsHost);
    renderStatistics(analysis, statsHost);
    renderComparisonTable(sortedResults, tableHost);
}

function renderRequiredSkills(skills, results = [], targetContainer = skillsContainer) {
    const required = (skills || [])
        .map(skill => (skill || "").trim())
        .filter(Boolean)
        .map(skill => ({ key: skill.toLowerCase(), label: toTitleCase(skill) }));

    if (required.length === 0) {
        targetContainer.innerHTML = `
            <div class="skills-insights-empty">
                <i class="fas fa-info-circle"></i>
                <span>No required skills detected from the job description.</span>
            </div>
        `;
        return;
    }

    const candidateCount = (results || []).length;
    const matchedMap = new Map();
    const missingMap = new Map();
    required.forEach(({ key }) => {
        matchedMap.set(key, 0);
        missingMap.set(key, 0);
    });

    results.forEach(candidate => {
        const matchedSet = new Set((candidate.matched || []).map(skill => (skill || "").trim().toLowerCase()));
        const missingSet = new Set((candidate.missing || []).map(skill => (skill || "").trim().toLowerCase()));

        required.forEach(({ key }) => {
            if (matchedSet.has(key)) {
                matchedMap.set(key, (matchedMap.get(key) || 0) + 1);
            }
            if (missingSet.has(key)) {
                missingMap.set(key, (missingMap.get(key) || 0) + 1);
            }
        });
    });

    const skillStats = required.map(({ key, label }) => {
        const matchedCount = matchedMap.get(key) || 0;
        const missingCount = missingMap.get(key) || 0;
        const coveragePct = candidateCount ? Math.round((matchedCount / candidateCount) * 100) : 0;

        let tone = "gap";
        if (coveragePct >= 70) {
            tone = "strong";
        } else if (coveragePct >= 40) {
            tone = "moderate";
        }

        return { key, label, matchedCount, missingCount, coveragePct, tone };
    });

    const avgCoverage = skillStats.length
        ? Math.round(skillStats.reduce((sum, item) => sum + item.coveragePct, 0) / skillStats.length)
        : 0;

    const topGap = [...skillStats]
        .sort((a, b) => b.missingCount - a.missingCount || a.coveragePct - b.coveragePct)[0];
    const bestCovered = [...skillStats]
        .sort((a, b) => b.coveragePct - a.coveragePct || b.matchedCount - a.matchedCount)[0];

    const renderedRows = skillStats
        .sort((a, b) => b.missingCount - a.missingCount || a.coveragePct - b.coveragePct)
        .map(item => `
            <div class="skill-progress-item">
                <div class="skill-progress-top">
                    <span class="skill-progress-name">${escapeHtml(item.label)}</span>
                    <span class="skill-progress-score">${item.matchedCount}/${candidateCount || 0}</span>
                </div>
                <div class="skill-progress-track">
                    <span class="skill-progress-fill tone-${item.tone}" style="width: ${item.coveragePct}%"></span>
                </div>
                <div class="skill-progress-meta">
                    <span>${item.coveragePct}% matched</span>
                    <span>${item.missingCount} missing</span>
                </div>
            </div>
        `)
        .join("");

    targetContainer.innerHTML = `
        <div class="skills-insights">
            <div class="skills-kpi-grid">
                <div class="skills-kpi">
                    <span class="skills-kpi-label">Coverage</span>
                    <strong>${avgCoverage}%</strong>
                </div>
                <div class="skills-kpi">
                    <span class="skills-kpi-label">Highest Gap</span>
                    <strong>${topGap ? escapeHtml(topGap.label) : "None"}</strong>
                </div>
                <div class="skills-kpi">
                    <span class="skills-kpi-label">Best Covered</span>
                    <strong>${bestCovered ? escapeHtml(bestCovered.label) : "None"}</strong>
                </div>
            </div>
            <div class="skills-progress-list">
                ${renderedRows}
            </div>
        </div>
    `;
}

function toTitleCase(value) {
    return (value || "")
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderStatistics(data, targetGrid = statsGrid) {
    const results = data.results || [];
    targetGrid.innerHTML = "";

    const avgFit = results.length
        ? Math.round(results.reduce((sum, r) => sum + (r.fit || 0), 0) / results.length)
        : 0;
    const maxFit = results.length ? Math.max(...results.map(r => r.fit || 0)) : 0;
    const totalSkills = results.reduce((sum, r) => sum + (r.matched?.length || 0) + (r.extras?.length || 0), 0);
    const avgSkills = results.length ? Math.round(totalSkills / results.length) : 0;
    
    const stats = [
        { label: "Average Fit", value: `${avgFit}%`, icon: "fa-chart-line" },
        { label: "Best Fit", value: `${maxFit}%`, icon: "fa-trophy" },
        { label: "Candidates", value: results.length, icon: "fa-users" },
        { label: "Avg Skills", value: avgSkills, icon: "fa-cogs" }
    ];
    
    stats.forEach(stat => {
        const statItem = document.createElement("div");
        statItem.className = "stat-item";
        statItem.innerHTML = `
            <i class="fas ${stat.icon} fa-2x" style="color: var(--primary); margin-bottom: 10px;"></i>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        targetGrid.appendChild(statItem);
    });
}

function renderComparisonTable(candidates, targetContainer = resultsContent) {
    const board = document.createElement('section');
    board.className = 'candidate-comparison-board';

    const header = document.createElement('div');
    header.className = 'candidate-comparison-header comparison-grid';
    header.innerHTML = `
        <div>Resume</div>
        <div>Match Score</div>
        <div>Matched Skills</div>
        <div>Missing Skills</div>
        <div>Recommendations</div>
    `;
    board.appendChild(header);

    (candidates || []).forEach(candidate => {
        const row = document.createElement('article');
        row.className = 'candidate-comparison-card comparison-grid';

        const resumeCell = document.createElement('div');
        resumeCell.className = 'comparison-cell resume-cell';
        resumeCell.setAttribute('data-label', 'Resume');
        resumeCell.innerHTML = `
            <div class="resume-name-wrap">
                <i class="fas fa-file-alt"></i>
                <span class="resume-name" title="${escapeHtml(candidate.name || "Unknown Resume")}">${escapeHtml(candidate.name || "Unknown Resume")}</span>
            </div>
        `;

        const scoreCell = document.createElement('div');
        scoreCell.className = 'comparison-cell score-cell';
        scoreCell.setAttribute('data-label', 'Match Score');
        scoreCell.innerHTML = `
            <div class="score-value" style="color: ${getFitColor(candidate.fit || 0)}">${candidate.fit || 0}%</div>
            <div class="score-track">
                <span class="score-fill" style="width: ${Math.max(0, Math.min(100, candidate.fit || 0))}%; background: ${getFitColor(candidate.fit || 0)}"></span>
            </div>
        `;

        const matchedCell = document.createElement('div');
        matchedCell.className = 'comparison-cell';
        matchedCell.setAttribute('data-label', 'Matched Skills');
        matchedCell.appendChild(createSkillCell(candidate.matched, 'matched'));

        const missingCell = document.createElement('div');
        missingCell.className = 'comparison-cell';
        missingCell.setAttribute('data-label', 'Missing Skills');
        missingCell.appendChild(createSkillCell(candidate.missing, 'missing'));

        const recommendationsCell = document.createElement('div');
        recommendationsCell.className = 'comparison-cell';
        recommendationsCell.setAttribute('data-label', 'Recommendations');
        recommendationsCell.appendChild(createRecommendationsCell(candidate));

        row.appendChild(resumeCell);
        row.appendChild(scoreCell);
        row.appendChild(matchedCell);
        row.appendChild(missingCell);
        row.appendChild(recommendationsCell);

        board.appendChild(row);
    });

    targetContainer.appendChild(board);
}

function createSkillCell(skills, type) {
    const container = document.createElement('div');
    container.className = 'skill-chip-group';
    
    if (!Array.isArray(skills) || skills.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'comparison-empty-text';
        emptyMsg.textContent = type === 'missing' ? 'No gaps detected' : 'No matched skills';
        container.appendChild(emptyMsg);
        return container;
    }

    skills.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = `comparison-skill-chip ${type}`;
        chip.textContent = skill;
        chip.title = skill;

        chip.addEventListener('click', () => {
            showSkillDetails(skill, type);
        });

        container.appendChild(chip);
    });

    return container;
}

function createRecommendationsCell(candidate) {
    const container = document.createElement('div');
    container.className = 'recommendation-cell';

    const recommendations = buildRecommendationInsights(candidate);
    if (recommendations.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'comparison-empty-text';
        emptyMsg.textContent = 'No recommendations';
        container.appendChild(emptyMsg);
        return container;
    }

    const list = document.createElement('ul');
    list.className = 'recommendation-list';
    recommendations.slice(0, 3).forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
    container.appendChild(list);

    return container;
}

function buildRecommendationInsights(candidate) {
    const backendRecommendations = Array.isArray(candidate.recommendations) ? candidate.recommendations : [];
    const cleaned = backendRecommendations
        .map(text => String(text || "").trim())
        .filter(Boolean)
        .filter(text => !/missing skills?:|matched skills?:|strength:|weakness:/i.test(text));

    if (cleaned.length > 0) {
        return cleaned.slice(0, 2);
    }

    const missingCount = (candidate.missing || []).length;
    const fit = candidate.fit || 0;
    if (fit >= 80) {
        return ["Strong alignment with required technical stack.", "Ready for technical screening and role-fit interview."];
    }
    if (missingCount <= 1) {
        return ["High potential match with minimal upskilling required.", "One targeted improvement area before final round."];
    }
    if (fit >= 55) {
        return ["Moderate alignment with the role requirements.", "Focused upskilling plan recommended before shortlist decision."];
    }
    return ["Partial alignment with the role expectations.", "Significant upskilling recommended before proceeding."];
}

function getVerdictFromFit(fit) {
    if (fit >= 75) return "Good Fit";
    if (fit >= 50) return "Moderate";
    return "Low Fit";
}

function getFitColor(fit) {
    if (fit >= 80) return '#4cc9f0';
    if (fit >= 60) return '#f8961e';
    return '#f94144';
}

function showSkillDetails(skill, type) {
    const modalTitle = {
        'matched': 'Matched Skill',
        'missing': 'Missing Skill', 
        'extra': 'Extra Skill'
    }[type];
    
    const modalColor = {
        'matched': '#4cc9f0',
        'missing': '#f8961e',
        'extra': '#7209b7'
    }[type];
    
    modalBody.innerHTML = `
        <div class="skill-detail-modal">
            <div class="skill-header" style="background: ${modalColor}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-${type === 'matched' ? 'check-circle' : type === 'missing' ? 'times-circle' : 'plus-circle'}"></i>
                    ${modalTitle}
                </h3>
            </div>
            
            <div class="skill-content">
                <h4 style="color: var(--dark); margin-bottom: 10px;">Skill Name</h4>
                <div class="skill-name-display" style="background: var(--light); padding: 15px; border-radius: 8px; border-left: 4px solid ${modalColor};">
                    <span style="font-size: 1.2rem; font-weight: 600;">${skill}</span>
                </div>
                
                <h4 style="color: var(--dark); margin: 20px 0 10px 0;">Description</h4>
                <p style="color: var(--gray); line-height: 1.6;">
                    This skill is ${type === 'matched' ? 'present in both the job description and resume.' : type === 'missing' ? 'required in the job description but not found in the resume.' : 'present in the resume but not explicitly required in the job description.'}
                </p>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--gray-light);">
                    <button onclick="copyToClipboard('${skill}')" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-copy"></i> Copy Skill Name
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification(`Copied: ${text}`, 'success');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy text', 'error');
        });
}

// ===== SORTING =====
function sortResults() {
    if (!currentResults) return;
    renderResults(currentResults);
}

// ===== DETAILED VIEW =====
function showCandidateDetails(index) {
    if (!currentResults) return;

    const analyses = getJdAnalyses(currentResults);
    const primaryResults = getSortedResults(analyses[0]?.results || []);
    if (!primaryResults[index]) return;

    const candidate = primaryResults[index];
    
    modalBody.innerHTML = `
        <div class="candidate-details">
            <div class="detail-header">
                <h3>${candidate.name}</h3>
                <div class="detail-score" style="color: ${candidate.fit >= 80 ? '#4cc9f0' : candidate.fit >= 60 ? '#f8961e' : '#f94144'}">
                    ${candidate.fit}% Match
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-chart-pie"></i> Match Breakdown</h4>
                <div class="match-breakdown">
                    <div class="breakdown-item">
                        <div class="breakdown-label">Matched Skills</div>
                        <div class="breakdown-value">${candidate.matched.length}</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-label">Missing Skills</div>
                        <div class="breakdown-value">${candidate.missing.length}</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-label">Extra Skills</div>
                        <div class="breakdown-value">${candidate.extras.length}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-check-circle" style="color: #4cc9f0;"></i> Matched Skills</h4>
                <div class="skills-detailed">
                    ${candidate.matched.map(skill => `
                        <div class="skill-detail matched">
                            <i class="fas fa-check"></i>
                            <span>${skill}</span>
                        </div>
                    `).join('')}
                    ${candidate.matched.length === 0 ? '<p class="no-skills">No matched skills found</p>' : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-times-circle" style="color: #f8961e;"></i> Missing Skills</h4>
                <div class="skills-detailed">
                    ${candidate.missing.map(skill => `
                        <div class="skill-detail missing">
                            <i class="fas fa-times"></i>
                            <span>${skill}</span>
                        </div>
                    `).join('')}
                    ${candidate.missing.length === 0 ? '<p class="no-skills">No missing skills - perfect match!</p>' : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-plus-circle" style="color: #7209b7;"></i> Extra Skills</h4>
                <div class="skills-detailed">
                    ${candidate.extras.map(skill => `
                        <div class="skill-detail extra">
                            <i class="fas fa-plus"></i>
                            <span>${skill}</span>
                        </div>
                    `).join('')}
                    ${candidate.extras.length === 0 ? '<p class="no-skills">No additional skills found</p>' : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                <div class="recommendations">
                    ${getRecommendations(candidate)}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = "flex";
}

function getRecommendations(candidate) {
    if (Array.isArray(candidate.recommendations) && candidate.recommendations.length > 0) {
        return candidate.recommendations
            .map(rec => `<p><i class="fas fa-arrow-right"></i> ${escapeHtml(rec)}</p>`)
            .join('');
    }

    let recommendations = [];
    const fit = candidate.fit || 0;
    const missingCount = (candidate.missing || []).length;
    
    if (fit >= 85) {
        recommendations.push("Strong alignment with role requirements; proceed with technical validation.");
    } else if (fit >= 65) {
        recommendations.push("Good alignment overall; shortlist with targeted follow-up assessment.");
    } else if (fit >= 45) {
        recommendations.push("Moderate role fit; consider development plan before final decision.");
    } else {
        recommendations.push("Limited alignment for this role; prioritize candidates with stronger fit.");
    }
    
    if (missingCount <= 1 && fit >= 60) {
        recommendations.push("Only one focused upskilling area identified.");
    } else if (missingCount >= 3) {
        recommendations.push("Multiple capability gaps suggest structured upskilling is needed.");
    }
    
    return recommendations.map(rec => `<p><i class="fas fa-arrow-right"></i> ${rec}</p>`).join('');
}

// ===== EXPORT FUNCTIONALITY =====
// ===== EXPORT FUNCTIONS =====
function getExportAnalyses() {
    return getJdAnalyses(currentResults).map((analysis, index) => ({
        jd_name: analysis.jd_name || `JD ${index + 1}`,
        required_skills: analysis.required_skills || [],
        statistics: analysis.statistics || {},
        results: getSortedResults(analysis.results || [])
    }));
}

function exportResults() {
    if (!currentResults) {
        showNotification("No results to export", "error");
        return;
    }

    const analyses = getExportAnalyses();
    const jdCount = analyses.length;
    const totalRows = analyses.reduce((sum, analysis) => sum + analysis.results.length, 0);
    const avgSkills = jdCount
        ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.required_skills.length, 0) / jdCount)
        : 0;

    // Create export modal
    const exportModal = document.createElement('div');
    exportModal.className = 'modal';
    exportModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-download"></i> Export Results</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 20px; color: var(--dark);">Select export format:</p>
                <div class="export-options">
                    <button class="export-option-btn" onclick="exportToBIDataset('Power BI / Tableau')">
                        <i class="fas fa-chart-area"></i>
                        <div>
                            <strong>BI Dataset (Recommended)</strong>
                            <small>Flattened CSV for Power BI and Tableau dashboards</small>
                        </div>
                    </button>
                    <button class="export-option-btn" onclick="exportToCSV()">
                        <i class="fas fa-file-csv"></i>
                        <div>
                            <strong>CSV Format</strong>
                            <small>Compatible with Excel and Google Sheets</small>
                        </div>
                    </button>
                    <button class="export-option-btn" onclick="exportToExcel()">
                        <i class="fas fa-file-excel"></i>
                        <div>
                            <strong>Excel Format</strong>
                            <small>XLSX format with styling</small>
                        </div>
                    </button>
                    <button class="export-option-btn" onclick="exportToJSON()">
                        <i class="fas fa-file-code"></i>
                        <div>
                            <strong>JSON Format</strong>
                            <small>Raw data for developers</small>
                        </div>
                    </button>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--gray-light);">
                    <div class="export-preview">
                        <p><i class="fas fa-info-circle"></i> <strong>Preview:</strong> ${jdCount} JD result set(s), ${totalRows} candidate row(s), ${avgSkills} avg required skills</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for export options
    const style = document.createElement('style');
    style.textContent = `
        .export-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .export-option-btn {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border: 2px solid var(--gray-light);
            border-radius: var(--radius-sm);
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            width: 100%;
        }
        
        .export-option-btn:hover {
            border-color: var(--primary);
            background: rgba(67, 97, 238, 0.05);
            transform: translateY(-2px);
        }
        
        .export-option-btn i {
            font-size: 2rem;
            color: var(--primary);
        }
        
        .export-option-btn strong {
            display: block;
            color: var(--dark);
            margin-bottom: 4px;
        }
        
        .export-option-btn small {
            color: var(--gray);
            font-size: 0.85rem;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(exportModal);
    exportModal.style.display = 'flex';
}

function exportToBIDataset(platformName = "BI Tool") {
    if (!currentResults) return;

    const rows = buildBIRows(getExportAnalyses());
    const csvContent = rowsToCSV(rows);
    const dateKey = new Date().toISOString().split("T")[0];
    const platformKey = platformName.toLowerCase().includes("tableau") ? "tableau" :
        platformName.toLowerCase().includes("power") ? "powerbi" : "bi";
    const filename = `job-analysis-${platformKey}-${dateKey}.csv`;

    downloadFile(csvContent, filename, "text/csv;charset=utf-8");
    showNotification(`Dashboard dataset exported for ${platformName}`, "success");
    document.querySelector('.modal')?.remove();
}

function buildBIRows(analyses = []) {
    const analysisDate = new Date().toISOString();

    return analyses.flatMap((analysis, jdIndex) => {
        const requiredSkills = (analysis.required_skills || []).map(skill => (skill || "").trim()).filter(Boolean);
        const requiredSet = new Set(requiredSkills.map(skill => skill.toLowerCase()));

        return (analysis.results || []).flatMap((candidate, candidateIndex) => {
            const matched = (candidate.matched || []).map(skill => (skill || "").trim()).filter(Boolean);
            const missing = (candidate.missing || []).map(skill => (skill || "").trim()).filter(Boolean);
            const extras = (candidate.extras || []).map(skill => (skill || "").trim()).filter(Boolean);

            const matchedSet = new Set(matched.map(skill => skill.toLowerCase()));
            const missingSet = new Set(missing.map(skill => skill.toLowerCase()));
            const extrasSet = new Set(extras.map(skill => skill.toLowerCase()));

            const skillNames = Array.from(new Set([...requiredSkills, ...matched, ...missing, ...extras]));
            if (skillNames.length === 0) {
                return [{
                    analysis_date: analysisDate,
                    jd_index: jdIndex + 1,
                    jd_name: analysis.jd_name || `JD ${jdIndex + 1}`,
                    candidate_name: candidate.name || "Unknown Candidate",
                    candidate_rank: candidateIndex + 1,
                    fit_score: candidate.fit ?? 0,
                    matched_count: candidate.matched_count ?? matched.length,
                    missing_count: candidate.missing_count ?? missing.length,
                    extra_count: candidate.extra_count ?? extras.length,
                    required_skills_count: requiredSkills.length,
                    skill_name: "",
                    skill_status: "None",
                    is_required: 0,
                    is_matched: 0,
                    is_missing: 0,
                    is_extra: 0
                }];
            }

            return skillNames.map(skillName => {
                const normalized = skillName.toLowerCase();
                const isRequired = requiredSet.has(normalized) ? 1 : 0;
                const isMatched = matchedSet.has(normalized) ? 1 : 0;
                const isMissing = missingSet.has(normalized) ? 1 : 0;
                const isExtra = extrasSet.has(normalized) ? 1 : 0;

                let skillStatus = "Related";
                if (isMatched) {
                    skillStatus = "Matched";
                } else if (isMissing) {
                    skillStatus = "Missing";
                } else if (isExtra) {
                    skillStatus = "Extra";
                } else if (isRequired) {
                    skillStatus = "Required";
                }

                return {
                    analysis_date: analysisDate,
                    jd_index: jdIndex + 1,
                    jd_name: analysis.jd_name || `JD ${jdIndex + 1}`,
                    candidate_name: candidate.name || "Unknown Candidate",
                    candidate_rank: candidateIndex + 1,
                    fit_score: candidate.fit ?? 0,
                    matched_count: candidate.matched_count ?? matched.length,
                    missing_count: candidate.missing_count ?? missing.length,
                    extra_count: candidate.extra_count ?? extras.length,
                    required_skills_count: requiredSkills.length,
                    skill_name: skillName,
                    skill_status: skillStatus,
                    is_required: isRequired,
                    is_matched: isMatched,
                    is_missing: isMissing,
                    is_extra: isExtra
                };
            });
        });
    });
}

function rowsToCSV(rows) {
    if (!rows || rows.length === 0) return "";

    const headers = Object.keys(rows[0]);
    const csvRows = [headers.join(",")];

    rows.forEach(row => {
        const line = headers.map(header => escapeCsvValue(row[header])).join(",");
        csvRows.push(line);
    });

    return csvRows.join("\n");
}

function escapeCsvValue(value) {
    if (value === null || value === undefined) return "";
    const valueString = String(value);
    if (/[",\n]/.test(valueString)) {
        return `"${valueString.replace(/"/g, '""')}"`;
    }
    return valueString;
}

function exportToCSV() {
    if (!currentResults) return;

    const analyses = getExportAnalyses();
    const headers = [
        "JD Name",
        "Candidate Name",
        "Fit Score (%)",
        "Matched Skills Count",
        "Missing Skills Count",
        "Extra Skills Count",
        "Matched Skills",
        "Missing Skills",
        "Extra Skills",
        "Required Skills",
        "Recommendations",
        "Final Verdict"
    ];

    const lines = [headers.join(",")];

    analyses.forEach(analysis => {
        (analysis.results || []).forEach(candidate => {
            const row = [
                analysis.jd_name || "",
                candidate.name || "",
                candidate.fit ?? 0,
                candidate.matched_count ?? (candidate.matched || []).length,
                candidate.missing_count ?? (candidate.missing || []).length,
                candidate.extra_count ?? (candidate.extras || []).length,
                (candidate.matched || []).join(", "),
                (candidate.missing || []).join(", "),
                (candidate.extras || []).join(", "),
                (analysis.required_skills || []).join(", "),
                (candidate.recommendations || []).join(" | "),
                candidate.verdict_label || candidate.verdict || getVerdictFromFit(candidate.fit)
            ];
            lines.push(row.map(escapeCsvValue).join(","));
        });
    });

    const csvContent = lines.join("\n");
    const filename = `job-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8");
    
    showNotification("Results exported as CSV", "success");
    document.querySelector('.modal')?.remove();
}

function exportToExcel() {
    if (!currentResults) return;
    
    try {
        const analyses = getExportAnalyses();
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "InterSyncIQ Results",
            Subject: "Candidate Analysis",
            Author: "InterSyncIQ",
            CreatedDate: new Date()
        };
        
        const candidateData = analyses.flatMap(analysis =>
            (analysis.results || []).map(candidate => ({
                "JD Name": analysis.jd_name,
                "Candidate Name": candidate.name || "",
                "Fit Score (%)": candidate.fit ?? 0,
                "Matched Skills Count": candidate.matched_count ?? (candidate.matched || []).length,
                "Missing Skills Count": candidate.missing_count ?? (candidate.missing || []).length,
                "Extra Skills Count": candidate.extra_count ?? (candidate.extras || []).length,
                "Matched Skills": (candidate.matched || []).join(", "),
                "Missing Skills": (candidate.missing || []).join(", "),
                "Extra Skills": (candidate.extras || []).join(", "),
                "Required Skills": (analysis.required_skills || []).join(", "),
                "Recommendations": (candidate.recommendations || []).join(" | "),
                "Final Verdict": candidate.verdict_label || candidate.verdict || getVerdictFromFit(candidate.fit)
            }))
        );

        if (candidateData.length === 0) {
            candidateData.push({
                "JD Name": "",
                "Candidate Name": "",
                "Fit Score (%)": 0,
                "Matched Skills Count": 0,
                "Missing Skills Count": 0,
                "Extra Skills Count": 0,
                "Matched Skills": "",
                "Missing Skills": "",
                "Extra Skills": "",
                "Required Skills": "",
                "Recommendations": "",
                "Final Verdict": ""
            });
        }
        
        const ws1 = XLSX.utils.json_to_sheet(candidateData);
        ws1["!cols"] = [
            { wch: 24 }, // JD Name
            { wch: 30 }, // Candidate Name
            { wch: 15 }, // Fit Score
            { wch: 20 }, // Matched Skills Count
            { wch: 20 }, // Missing Skills Count
            { wch: 20 }, // Extra Skills Count
            { wch: 40 }, // Matched Skills
            { wch: 40 }, // Missing Skills
            { wch: 40 }, // Extra Skills
            { wch: 45 }, // Required Skills
            { wch: 50 }, // Recommendations
            { wch: 18 }  // Final Verdict
        ];
        
        XLSX.utils.book_append_sheet(wb, ws1, "Candidate Analysis");
        
        const skillsData = [["JD Name", "Required Skill"]];
        analyses.forEach(analysis => {
            const skills = analysis.required_skills || [];
            if (skills.length === 0) {
                skillsData.push([analysis.jd_name, ""]);
                return;
            }
            skills.forEach(skill => skillsData.push([analysis.jd_name, skill]));
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(skillsData);
        ws2["!cols"] = [{ wch: 24 }, { wch: 40 }];
        
        XLSX.utils.book_append_sheet(wb, ws2, "Skills Summary");
        
        const statsData = [["JD Name", "Candidates", "Average Fit", "Top Fit", "Skills Detected"]];
        analyses.forEach(analysis => {
            const stats = analysis.statistics || {};
            statsData.push([
                analysis.jd_name,
                stats.total_candidates ?? (analysis.results || []).length,
                `${stats.average_fit ?? 0}%`,
                `${stats.top_fit ?? 0}%`,
                stats.skills_detected ?? (analysis.required_skills || []).length
            ]);
        });

        const totalCandidates = analyses.reduce((sum, analysis) => sum + (analysis.results || []).length, 0);
        const weightedFitNumerator = analyses.reduce((sum, analysis) => {
            const stats = analysis.statistics || {};
            const candidates = stats.total_candidates ?? (analysis.results || []).length;
            const avgFit = stats.average_fit ?? 0;
            return sum + (avgFit * candidates);
        }, 0);
        const overallAvgFit = totalCandidates ? Math.round(weightedFitNumerator / totalCandidates) : 0;
        const overallTopFit = analyses.reduce((maxValue, analysis) => {
            const topFit = analysis.statistics?.top_fit ?? 0;
            return Math.max(maxValue, topFit);
        }, 0);
        const avgSkillsDetected = analyses.length
            ? Math.round(analyses.reduce((sum, analysis) => sum + (analysis.required_skills || []).length, 0) / analyses.length)
            : 0;

        statsData.push([]);
        statsData.push(["Overall", totalCandidates, `${overallAvgFit}%`, `${overallTopFit}%`, avgSkillsDetected]);
        
        const ws3 = XLSX.utils.aoa_to_sheet(statsData);
        ws3["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
        
        XLSX.utils.book_append_sheet(wb, ws3, "Statistics");
        
        // Generate and download
        const filename = `job-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        showNotification("Results exported as Excel file", "success");
        document.querySelector('.modal')?.remove();
        
    } catch (error) {
        console.error("Excel export error:", error);
        showNotification("Excel export failed. Please try CSV format.", "error");
    }
}

function exportToJSON() {
    if (!currentResults) return;
    
    const dataStr = JSON.stringify(currentResults, null, 2);
    const filename = `job-analysis-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(dataStr, filename, 'application/json');
    showNotification("Results exported as JSON", "success");
    document.querySelector('.modal')?.remove();
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== CANDIDATE ANALYSIS =====
async function analyzeCandidate() {
    const resumeFile = candidateResumeInput.files[0];
    const jdText = candidateJDText.value.trim();
    const jdFiles = Array.from(candidateJDFileInput.files || []);
    
    if (!resumeFile) {
        showNotification("Please upload your resume", "error");
        return;
    }
    
    if (!jdText && jdFiles.length === 0) {
        showNotification("Please provide at least one job description", "error");
        return;
    }
    
    // Show loading
    analyzeCandidateBtn.disabled = true;
    analyzeCandidateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    try {
        const formData = new FormData();
        const validTypes = [".pdf", ".docx", ".txt"];

        formData.append("candidate_resume", resumeFile);
        if (jdText) {
            formData.append("jd_text", jdText);
        }

        for (const jdFile of jdFiles) {
            const fileExt = "." + jdFile.name.split('.').pop().toLowerCase();
            if (!validTypes.includes(fileExt)) {
                showNotification(`JD file type not supported: ${fileExt}`, "error");
                return;
            }
            if (jdFile.size > 10 * 1024 * 1024) {
                showNotification(`JD file "${jdFile.name}" is too large (max 10MB)`, "error");
                return;
            }
            formData.append("candidate_jd_file", jdFile);
        }
        
        const response = await fetch("/analyze-candidate", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        candidateAnalysis = data;
        
        // Render candidate results
        renderCandidateResults(data);
        
        // Show results section
        candidateResults.style.display = "block";
        updateRecruiterCompactMode();
        candidateResults.scrollIntoView({ behavior: "smooth" });

        const jdCount = getCandidateJDAnalyses(data).length;
        showNotification(
            jdCount > 1
                ? "Select Job Description to view your eligibility"
                : "Analysis complete! Check your results below.",
            "success"
        );
        
    } catch (error) {
        console.error("Candidate analysis error:", error);
        showNotification("Analysis failed. Please try again.", "error");
    } finally {
        analyzeCandidateBtn.disabled = false;
        analyzeCandidateBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze My Fit';
    }
}

function renderCandidateResults(data) {
    const analyses = getCandidateJDAnalyses(data);
    if (selectedCandidateJDIndex < 0 || selectedCandidateJDIndex >= analyses.length) {
        selectedCandidateJDIndex = 0;
    }

    if (analyses.length > 1) {
        candidateJDSelectorWrap.style.display = "block";
        candidateJDSelect.innerHTML = analyses
            .map((analysis, index) => `<option value="${index}" ${index === selectedCandidateJDIndex ? "selected" : ""}>${escapeHtml(analysis.jd_name || `JD ${index + 1}`)}</option>`)
            .join("");

        candidateJDSelect.onchange = (event) => {
            selectedCandidateJDIndex = Number(event.target.value) || 0;
            renderCandidateResults(candidateAnalysis);
        };
    } else {
        candidateJDSelectorWrap.style.display = "none";
        candidateJDSelect.innerHTML = "";
    }

    const activeAnalysis = analyses[selectedCandidateJDIndex] || analyses[0];

    // Update fit score
    const fitScore = activeAnalysis.fit_score;
    candidateFitScore.textContent = `${fitScore}%`;
    fitFeedback.textContent = getFitFeedback(fitScore, activeAnalysis.skills?.missing?.length || 0);
    
    // Update progress circle
    const progress = (fitScore / 100) * 360;
    candidateFitCircle.style.background = `conic-gradient(var(--primary) ${progress}deg, var(--gray-light) 0deg)`;
    
    // Render skills
    renderCandidateSkills(activeAnalysis.skills.matched, candidateMatched, "matched");
    renderCandidateSkills(activeAnalysis.skills.missing, candidateMissing, "missing");
    
    // Generate recommendations
    generateRecommendations(activeAnalysis);
    generateActionPlan(activeAnalysis);
}

function getCandidateJDAnalyses(data) {
    if (Array.isArray(data?.candidate_jd_analyses) && data.candidate_jd_analyses.length > 0) {
        return data.candidate_jd_analyses;
    }

    return [{
        jd_name: "Job Description",
        fit_score: data?.fit_score || 0,
        skills: data?.skills || { matched: [], missing: [], extras: [] },
        skill_gaps: data?.skill_gaps || [],
        suggestions: data?.suggestions || [],
        alternative_roles: data?.alternative_roles || [],
        learning_path: data?.learning_path || [],
        summary: data?.summary || {}
    }];
}

function renderCandidateSkills(skills, container, type) {
    const safeSkills = Array.isArray(skills) ? skills : [];
    container.innerHTML = "";
    
    if (safeSkills.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'no-skills';
        emptyMsg.textContent = type === 'matched' ? 'No matching skills found' : 
                              type === 'missing' ? 'All required skills found!' : 
                              'No additional skills detected';
        container.appendChild(emptyMsg);
        return;
    }
    
    safeSkills.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = `skill-tag ${type}`;
        chip.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
        chip.title = skill;
        chip.addEventListener('click', () => showSkillDetails(skill, type));
        container.appendChild(chip);
    });
}

function getFitFeedback(fitScore, missingCount = 0) {
    const band = fitScore >= 75 ? "Strong fit" : fitScore >= 50 ? "Moderate fit" : "Low fit";
    const gapLabel = missingCount === 0
        ? "no critical skill gaps identified"
        : `${missingCount} critical skill gap${missingCount > 1 ? "s" : ""} identified`;
    return `${band} — ${gapLabel}`;
}

function generateRecommendations(data) {
    const insights = buildKeyInsights(data);
    renderCompactList(candidateInsights, insights, "No insights available yet.");

    const actions = buildPrioritizedActions(data);
    renderCompactList(candidateActionHigh, actions.high, "No immediate blockers.");
    renderCompactList(candidateActionMedium, actions.medium, "No medium-priority actions.");
    renderCompactList(candidateActionOptional, actions.optional, "No optional improvements.");

    renderAlternativeRoleCards(data);
}

function suggestAlternativeRoles(data) {
    const roleDatabase = {
        "Data Analyst": {
            skills: ["sql", "excel", "python", "tableau", "power bi", "statistics"],
            description: "Analyze data to help businesses make decisions"
        },
        "Software Developer": {
            skills: ["python", "java", "javascript", "c++", "sql", "git"],
            description: "Design, develop, and maintain software applications"
        },
        "DevOps Engineer": {
            skills: ["aws", "docker", "kubernetes", "jenkins", "linux", "python"],
            description: "Bridge between development and IT operations"
        },
        "Product Manager": {
            skills: ["agile", "scrum", "jira", "communication", "strategy", "market research"],
            description: "Lead product development from concept to launch"
        },
        "UX Designer": {
            skills: ["figma", "adobe xd", "user research", "wireframing", "prototyping", "html/css"],
            description: "Design user-centered digital experiences"
        }
    };
    
    const suggestedRoles = [];
    
    for (const [role, info] of Object.entries(roleDatabase)) {
        const matchedSkills = info.skills.filter(skill => 
            data.skills.matched.includes(skill) || data.skills.extras.includes(skill)
        );
        const matchPercentage = Math.round((matchedSkills.length / info.skills.length) * 100);
        
        if (matchPercentage >= 50) {
            suggestedRoles.push({
                title: role,
                match: matchPercentage,
                description: info.description,
                skills: matchedSkills
            });
        }
    }
    
    // Sort by match percentage
    return suggestedRoles.sort((a, b) => b.match - a.match).slice(0, 3);
}

function buildKeyInsights(data) {
    const matchedCount = data.skills?.matched?.length || 0;
    const missingCount = data.skills?.missing?.length || 0;
    const extraCount = data.skills?.extras?.length || 0;
    const fitScore = data.fit_score || 0;
    const insights = [];

    if (fitScore >= 75) {
        insights.push("Strong alignment with the role's core requirements.");
    } else if (fitScore >= 50) {
        insights.push("Baseline alignment exists with a few important gaps.");
    } else {
        insights.push("Current profile only partially aligns with role expectations.");
    }

    if (missingCount === 0) {
        insights.push("No critical skill gaps detected for this JD.");
    } else if (missingCount === 1) {
        insights.push("One critical skill gap is limiting overall fit.");
    } else {
        insights.push(`${missingCount} critical skill gaps are reducing match quality.`);
    }

    if (matchedCount >= 3) {
        insights.push("Strong foundation across key technical capabilities.");
    } else if (matchedCount > 0) {
        insights.push("Some relevant strengths are already in place.");
    }

    if (extraCount > 0) {
        insights.push("Additional cross-domain skills improve flexibility for adjacent roles.");
    }

    return insights.slice(0, 4);
}

function buildPrioritizedActions(data) {
    const missing = data.skills?.missing || [];
    const matched = data.skills?.matched || [];

    const high = [];
    if (missing.length > 0) {
        high.push(`Learn ${toTitleCase(missing[0])} to close the top gap.`);
    }
    if (missing.length > 1) {
        high.push(`Strengthen ${toTitleCase(missing[1])} through guided practice.`);
    }
    if (high.length === 0) {
        high.push("Maintain readiness by revising interview-relevant fundamentals.");
    }

    const medium = [
        "Build one project aligned with this JD to prove practical ability.",
        "Optimize resume bullets with measurable outcomes for relevant work."
    ];
    if (matched.length > 0) {
        medium[1] = `Highlight ${toTitleCase(matched[0])} impact with quantified outcomes.`;
    }

    const optional = [
        "Add one role-relevant certification or short credential.",
        "Expand networking with targeted hiring communities."
    ];

    return {
        high: high.slice(0, 2),
        medium: medium.slice(0, 2),
        optional: optional.slice(0, 2)
    };
}

function renderCompactList(target, items, emptyMessage) {
    if (!target) return;
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (safeItems.length === 0) {
        target.innerHTML = `<li class="compact-empty">${escapeHtml(emptyMessage)}</li>`;
        return;
    }

    target.innerHTML = safeItems
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join('');
}

function renderAlternativeRoleCards(data) {
    if (!alternativeRoles) return;
    const roles = suggestAlternativeRoles(data).slice(0, 3);
    if (roles.length === 0) {
        alternativeRoles.innerHTML = `<div class="compact-empty role-empty">No close alternative roles detected yet.</div>`;
        return;
    }

    alternativeRoles.innerHTML = roles.map(role => `
        <article class="role-mini-card">
            <div class="role-mini-top">
                <h4>${escapeHtml(role.title)}</h4>
                <span>${role.match}%</span>
            </div>
            <p>${escapeHtml(role.description)}</p>
        </article>
    `).join('');
}

function generateActionPlan(data) {
    const missing = data.skills?.missing || [];
    const firstGap = missing[0] ? toTitleCase(missing[0]) : "the top missing skill";

    const lines = [
        `Week 1–2: Learn ${firstGap} fundamentals with focused practice.`,
        "Week 3–4: Build one JD-aligned project for portfolio proof.",
        "Week 5: Apply to targeted roles and schedule networking outreach."
    ];

    actionPlan.innerHTML = lines
        .map(line => `<div class="quick-plan-line">${escapeHtml(line)}</div>`)
        .join('');
}

function exportActionPlan() {
    if (!candidateAnalysis) {
        showNotification("No analysis to export", "error");
        return;
    }

    const analyses = getCandidateJDAnalyses(candidateAnalysis);
    const activeAnalysis = analyses[selectedCandidateJDIndex] || analyses[0];
    const activeJDName = activeAnalysis.jd_name || "Selected Job Description";
    
    const planContent = `
InterSyncIQ - Personal Action Plan
Generated: ${new Date().toLocaleDateString()}
========================================
Target JD: ${activeJDName}

OVERVIEW:
Fit Score: ${activeAnalysis.fit_score}%
Matched Skills: ${activeAnalysis.skills.matched.length}
Missing Skills: ${activeAnalysis.skills.missing.length}
Extra Skills: ${activeAnalysis.skills.extras.length}

KEY INSIGHTS:
${candidateInsights.textContent.replace(/\n/g, '\n')}

RECOMMENDED ACTIONS:
High Priority: ${candidateActionHigh.textContent.replace(/\n/g, ' ').trim()}
Medium Priority: ${candidateActionMedium.textContent.replace(/\n/g, ' ').trim()}
Optional: ${candidateActionOptional.textContent.replace(/\n/g, ' ').trim()}

ALTERNATIVE ROLES:
${alternativeRoles.textContent.replace(/\n/g, '\n')}

QUICK ACTION PLAN:
${actionPlan.textContent.replace(/\n/g, '\n')}
    `;
    
    const blob = new Blob([planContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-plan-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    
    showNotification("Action plan downloaded!", "success");
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 350px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background: linear-gradient(135deg, #4cc9f0, #4361ee);
        border-left: 4px solid #3a56d4;
    }
    
    .notification.error {
        background: linear-gradient(135deg, #f94144, #f8961e);
        border-left: 4px solid #e67700;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(notificationStyles);

