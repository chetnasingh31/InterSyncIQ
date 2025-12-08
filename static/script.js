// ===== GLOBAL VARIABLES =====
let resumes = [];
let currentResults = null;
let candidateAnalysis = null;
let currentMode = 'recruiter';

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
const charCount = document.getElementById("charCount");
const fileCount = document.getElementById("fileCount");
const sortSelect = document.getElementById("sortSelect");
const exportBtn = document.getElementById("exportBtn");
const modal = document.getElementById("detailModal");
const closeModal = document.querySelector(".close-modal");
const modalBody = document.getElementById("modalBody");
const skillsContainer = document.getElementById("skillsContainer");
const statsGrid = document.getElementById("statsGrid");

// Candidate View Elements
const modeToggle = document.querySelector('.mode-toggle');
const recruiterModeBtn = document.getElementById('recruiterMode');
const candidateModeBtn = document.getElementById('candidateMode');
const currentModeIndicator = document.getElementById('currentMode');
const recruiterView = document.getElementById('recruiterView');
const candidateView = document.getElementById('candidateView');
const candidateResults = document.getElementById('candidateResults');

const candidateResumeInput = document.getElementById('candidateResume');
const candidateJDText = document.getElementById('candidateJD');
const candidateCharCount = document.getElementById('candidateCharCount');
const analyzeCandidateBtn = document.getElementById('analyzeCandidateBtn');
const candidateFitCircle = document.getElementById('candidateFitCircle');
const candidateFitScore = document.getElementById('candidateFitScore');
const fitFeedback = document.getElementById('fitFeedback');
const candidateMatched = document.getElementById('candidateMatched');
const candidateMissing = document.getElementById('candidateMissing');
const candidateExtra = document.getElementById('candidateExtra');
const learningPath = document.getElementById('learningPath');
const alternativeRoles = document.getElementById('alternativeRoles');
const improvementTips = document.getElementById('improvementTips');
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

    // Drag and drop functionality
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);
    
    // File input
    resumeInput.addEventListener("change", handleFileSelect);
    
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
    if (resumes.length === 0) return;
    
    if (confirm("Are you sure you want to clear all uploaded files?")) {
        resumes = [];
        fileList.innerHTML = "";
        updateFileCount();
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
        
        // Add JD text
        if (jdText.value.trim()) {
            formData.append("jd_text", jdText.value);
        }
        
        // Add JD file if exists
        const jdFile = document.getElementById("jdFile").files[0];
        if (jdFile) {
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
        resultsSection.scrollIntoView({ behavior: "smooth" });
        
        showNotification("Analysis complete!", "success");
        
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
    // Clear previous results
    resultsContent.innerHTML = "";
    skillsContainer.innerHTML = "";
    statsGrid.innerHTML = "";
    
    // 1. Render required skills
    renderRequiredSkills(data.required_skills);
    
    // 2. Render statistics
    renderStatistics(data);
    
    // 3. Render comparison table
    renderComparisonTable(data.results);
}

function renderRequiredSkills(skills) {
    skills.forEach(skill => {
        const chip = document.createElement("span");
        chip.className = "skill-tag";
        chip.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
        chip.title = skill;
        skillsContainer.appendChild(chip);
    });
}

function renderStatistics(data) {
    const results = data.results;
    const avgFit = Math.round(results.reduce((sum, r) => sum + r.fit, 0) / results.length);
    const maxFit = Math.max(...results.map(r => r.fit));
    const minFit = Math.min(...results.map(r => r.fit));
    const totalSkills = results.reduce((sum, r) => sum + r.matched.length + r.extras.length, 0);
    const avgSkills = Math.round(totalSkills / results.length);
    
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
        statsGrid.appendChild(statItem);
    });
}

function renderComparisonTable(candidates) {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    const table = document.createElement('table');
    table.className = 'comparison-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        { text: 'Resume Name', width: '20%' },
        { text: 'Fit %', width: '10%' },
        { text: 'Matched Skills', width: '25%' },
        { text: 'Missing Skills', width: '25%' },
        { text: 'Extra Skills', width: '20%' }
    ];
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.text;
        th.style.width = header.width;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    candidates.forEach((candidate, index) => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'candidate-name-cell';
        nameDiv.innerHTML = `
            <i class="fas fa-file-alt" style="color: var(--primary); margin-right: 8px;"></i>
            <span class="truncated-name" title="${candidate.name}">${candidate.name}</span>
        `;
        nameCell.appendChild(nameDiv);
        row.appendChild(nameCell);
        
        // Fit % cell
        const fitCell = document.createElement('td');
        fitCell.innerHTML = `
            <div class="fit-display">
                <div class="fit-percentage" style="color: ${getFitColor(candidate.fit)}">
                    ${candidate.fit}%
                </div>
                <div class="fit-bar">
                    <div class="fit-progress" style="width: ${candidate.fit}%; background: ${getFitColor(candidate.fit)};"></div>
                </div>
            </div>
        `;
        row.appendChild(fitCell);
        
        // Matched Skills cell
        const matchedCell = document.createElement('td');
        matchedCell.appendChild(createSkillCell(candidate.matched, 'matched', index));
        row.appendChild(matchedCell);
        
        // Missing Skills cell
        const missingCell = document.createElement('td');
        missingCell.appendChild(createSkillCell(candidate.missing, 'missing', index));
        row.appendChild(missingCell);
        
        // Extra Skills cell
        const extraCell = document.createElement('td');
        extraCell.appendChild(createSkillCell(candidate.extras, 'extra', index));
        row.appendChild(extraCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    resultsContent.appendChild(tableContainer);
}

function createSkillCell(skills, type, index) {
    const container = document.createElement('div');
    container.className = 'scrollable-skills';
    
    if (skills.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'no-skills';
        emptyMsg.textContent = 'None';
        emptyMsg.style.cssText = 'color: var(--gray); font-style: italic;';
        container.appendChild(emptyMsg);
        return container;
    }
    
    const skillCount = document.createElement('div');
    skillCount.className = 'skill-count';
    skillCount.textContent = `${skills.length} skills`;
    skillCount.style.cssText = 'font-size: 0.8rem; color: var(--gray); margin-bottom: 5px;';
    container.appendChild(skillCount);
    
    skills.forEach((skill, skillIndex) => {
        const chip = document.createElement('span');
        chip.className = `table-skill-chip ${type}`;
        chip.textContent = skill;
        chip.title = skill; // Tooltip shows full text on hover
        
        // Add click to view details
        chip.addEventListener('click', () => {
            showSkillDetails(skill, type);
        });
        
        container.appendChild(chip);
    });
    
    return container;
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
    
    const sortBy = sortSelect.value;
    let sortedResults = [...currentResults.results];
    
    switch (sortBy) {
        case "name":
            sortedResults.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "skills":
            sortedResults.sort((a, b) => b.matched.length - a.matched.length);
            break;
        case "fit":
        default:
            sortedResults.sort((a, b) => b.fit - a.fit);
    }
    
    currentResults.results = sortedResults;
    renderComparisonTable(sortedResults);
}

// ===== DETAILED VIEW =====
function showCandidateDetails(index) {
    if (!currentResults || !currentResults.results[index]) return;
    
    const candidate = currentResults.results[index];
    
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
    let recommendations = [];
    
    if (candidate.fit >= 90) {
        recommendations.push("Excellent match! Strong candidate for interview.");
    } else if (candidate.fit >= 70) {
        recommendations.push("Good match. Consider for next round.");
    } else if (candidate.fit >= 50) {
        recommendations.push("Moderate match. Review missing skills carefully.");
    } else {
        recommendations.push("Low match. May not be suitable unless other qualifications are exceptional.");
    }
    
    if (candidate.missing.length > 0) {
        recommendations.push(`Focus on developing: ${candidate.missing.slice(0, 3).join(', ')}`);
    }
    
    if (candidate.extras.length > 0) {
        recommendations.push(`Has additional valuable skills: ${candidate.extras.slice(0, 3).join(', ')}`);
    }
    
    return recommendations.map(rec => `<p><i class="fas fa-arrow-right"></i> ${rec}</p>`).join('');
}

// ===== EXPORT FUNCTIONALITY =====
// ===== EXPORT FUNCTIONS =====
function exportResults() {
    if (!currentResults) {
        showNotification("No results to export", "error");
        return;
    }

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
                    <button class="export-option-btn" onclick="exportToCSV()">
                        <i class="fas fa-file-csv"></i>
                        <div>
                            <strong>CSV Format</strong>
                            <small>Compatible with Excel, Google Sheets</small>
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
                        <p><i class="fas fa-info-circle"></i> <strong>Preview:</strong> ${currentResults.results.length} candidates, ${currentResults.required_skills.length} skills detected</p>
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

function exportToCSV() {
    if (!currentResults) return;
    
    const data = currentResults;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = [
        "Candidate Name",
        "Fit Score (%)",
        "Matched Skills Count",
        "Missing Skills Count",
        "Extra Skills Count",
        "Matched Skills",
        "Missing Skills",
        "Extra Skills",
        "Required Skills"
    ];
    
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    data.results.forEach(candidate => {
        const row = [
            `"${candidate.name}"`,
            candidate.fit,
            candidate.matched_count,
            candidate.missing_count,
            candidate.extra_count,
            `"${candidate.matched.join(", ")}"`,
            `"${candidate.missing.join(", ")}"`,
            `"${candidate.extras.join(", ")}"`,
            `"${data.required_skills.join(", ")}"`
        ];
        csvContent += row.join(",") + "\n";
    });
    
    // Add summary row
    csvContent += "\nSUMMARY\n";
    csvContent += `Total Candidates,${data.results.length}\n`;
    csvContent += `Average Fit Score,${Math.round(data.results.reduce((sum, r) => sum + r.fit, 0) / data.results.length)}%\n`;
    csvContent += `Required Skills,"${data.required_skills.join(", ")}"\n`;
    csvContent += `Analysis Date,${new Date().toLocaleDateString()}\n`;
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Results exported as CSV", "success");
    document.querySelector('.modal')?.remove();
}

function exportToExcel() {
    if (!currentResults) return;
    
    try {
        const data = currentResults;
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "AI Job Analyzer Results",
            Subject: "Candidate Analysis",
            Author: "AI Job Analyzer",
            CreatedDate: new Date()
        };
        
        // Sheet 1: Candidate Analysis
        const candidateData = data.results.map(candidate => ({
            "Candidate Name": candidate.name,
            "Fit Score (%)": candidate.fit,
            "Matched Skills Count": candidate.matched_count,
            "Missing Skills Count": candidate.missing_count,
            "Extra Skills Count": candidate.extra_count,
            "Matched Skills": candidate.matched.join(", "),
            "Missing Skills": candidate.missing.join(", "),
            "Extra Skills": candidate.extras.join(", ")
        }));
        
        const ws1 = XLSX.utils.json_to_sheet(candidateData);
        
        // Add header style
        const headerRange = XLSX.utils.decode_range(ws1['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!ws1[address]) continue;
            ws1[address].s = {
                fill: { fgColor: { rgb: "4361EE" } },
                font: { color: { rgb: "FFFFFF" }, bold: true },
                alignment: { horizontal: "center" }
            };
        }
        
        // Add conditional formatting for fit scores
        data.results.forEach((candidate, index) => {
            const cell = "B" + (index + 2); // Fit score column
            if (!ws1[cell]) return;
            
            let color = "FF6B6B"; // Red for low scores
            if (candidate.fit >= 80) color = "4CAF50"; // Green for high scores
            else if (candidate.fit >= 60) color = "FF9800"; // Orange for medium scores
            
            ws1[cell].s = {
                fill: { fgColor: { rgb: color } },
                font: { color: { rgb: "FFFFFF" }, bold: true },
                numFmt: "0%"
            };
        });
        
        ws1["!cols"] = [
            { wch: 30 }, // Candidate Name
            { wch: 15 }, // Fit Score
            { wch: 20 }, // Matched Skills Count
            { wch: 20 }, // Missing Skills Count
            { wch: 20 }, // Extra Skills Count
            { wch: 40 }, // Matched Skills
            { wch: 40 }, // Missing Skills
            { wch: 40 }  // Extra Skills
        ];
        
        XLSX.utils.book_append_sheet(wb, ws1, "Candidate Analysis");
        
        // Sheet 2: Skills Summary
        const skillsData = [
            ["Required Skills"],
            ...data.required_skills.map(skill => [skill])
        ];
        
        const ws2 = XLSX.utils.aoa_to_sheet(skillsData);
        ws2["!cols"] = [{ wch: 30 }];
        
        // Style skills sheet
        const skillsHeader = ws2["A1"];
        if (skillsHeader) {
            skillsHeader.s = {
                fill: { fgColor: { rgb: "7209B7" } },
                font: { color: { rgb: "FFFFFF" }, bold: true }
            };
        }
        
        XLSX.utils.book_append_sheet(wb, ws2, "Skills Summary");
        
        // Sheet 3: Statistics
        const statsData = [
            ["Metric", "Value"],
            ["Total Candidates", data.results.length],
            ["Average Fit Score", Math.round(data.results.reduce((sum, r) => sum + r.fit, 0) / data.results.length) + "%"],
            ["Highest Score", Math.max(...data.results.map(r => r.fit)) + "%"],
            ["Lowest Score", Math.min(...data.results.map(r => r.fit)) + "%"],
            ["Required Skills Count", data.required_skills.length],
            ["Analysis Date", new Date().toLocaleDateString()]
        ];
        
        const ws3 = XLSX.utils.aoa_to_sheet(statsData);
        ws3["!cols"] = [{ wch: 25 }, { wch: 20 }];
        
        // Style stats sheet
        const statsRange = XLSX.utils.decode_range(ws3['!ref']);
        for (let R = statsRange.s.r; R <= statsRange.e.r; ++R) {
            for (let C = statsRange.s.c; C <= statsRange.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (R === 0) { // Header row
                    ws3[address].s = {
                        fill: { fgColor: { rgb: "4CC9F0" } },
                        font: { color: { rgb: "FFFFFF" }, bold: true }
                    };
                }
            }
        }
        
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
    
    if (!resumeFile) {
        showNotification("Please upload your resume", "error");
        return;
    }
    
    if (!jdText) {
        showNotification("Please enter a job description", "error");
        return;
    }
    
    // Show loading
    analyzeCandidateBtn.disabled = true;
    analyzeCandidateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    try {
        const formData = new FormData();
        formData.append("candidate_resume", resumeFile);
        formData.append("jd_text", jdText);
        
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
        candidateResults.scrollIntoView({ behavior: "smooth" });
        
        showNotification("Analysis complete! Check your results below.", "success");
        
    } catch (error) {
        console.error("Candidate analysis error:", error);
        showNotification("Analysis failed. Please try again.", "error");
    } finally {
        analyzeCandidateBtn.disabled = false;
        analyzeCandidateBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze My Fit';
    }
}

function renderCandidateResults(data) {
    // Update fit score
    const fitScore = data.fit_score;
    candidateFitScore.textContent = `${fitScore}%`;
    fitFeedback.textContent = getFitFeedback(fitScore);
    
    // Update progress circle
    const progress = (fitScore / 100) * 360;
    candidateFitCircle.style.background = `conic-gradient(var(--primary) ${progress}deg, var(--gray-light) 0deg)`;
    
    // Render skills
    renderCandidateSkills(data.skills.matched, candidateMatched, "matched");
    renderCandidateSkills(data.skills.missing, candidateMissing, "missing");
    renderCandidateSkills(data.skills.extras, candidateExtra, "extra");
    
    // Generate recommendations
    generateRecommendations(data);
    generateActionPlan(data);
}

function renderCandidateSkills(skills, container, type) {
    container.innerHTML = "";
    
    if (skills.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'no-skills';
        emptyMsg.textContent = type === 'matched' ? 'No matching skills found' : 
                              type === 'missing' ? 'All required skills found!' : 
                              'No additional skills detected';
        container.appendChild(emptyMsg);
        return;
    }
    
    skills.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = `skill-tag ${type}`;
        chip.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
        chip.title = skill;
        chip.addEventListener('click', () => showSkillDetails(skill, type));
        container.appendChild(chip);
    });
}

function getFitFeedback(fitScore) {
    if (fitScore >= 90) {
        return "Excellent match! You're highly qualified for this position.";
    } else if (fitScore >= 75) {
        return "Strong candidate! You meet most requirements.";
    } else if (fitScore >= 60) {
        return "Good potential. Focus on developing missing skills.";
    } else if (fitScore >= 40) {
        return "Moderate match. Consider additional training.";
    } else {
        return "Consider other roles or significant skill development.";
    }
}

function generateRecommendations(data) {
    const fitScore = data.fit_score;
    const missingSkills = data.skills.missing;
    const extraSkills = data.skills.extras;
    
    // Learning Path
    learningPath.innerHTML = `
        <p>Based on your missing skills, here's your learning path:</p>
        <ul>
            ${missingSkills.slice(0, 3).map(skill => `
                <li>
                    <strong>${skill.toUpperCase()}:</strong> 
                    ${getLearningResource(skill)}
                </li>
            `).join('')}
        </ul>
        <p><em>Estimated time: 2-4 weeks per skill</em></p>
    `;
    
    // Alternative Roles
    const roles = suggestAlternativeRoles(data);
    alternativeRoles.innerHTML = `
        <p>With your current skills, consider these roles:</p>
        <ul>
            ${roles.map(role => `
                <li>
                    <strong>${role.title}:</strong> 
                    ${role.match}% match
                    <br><small>${role.description}</small>
                </li>
            `).join('')}
        </ul>
    `;
    
    // Improvement Tips
    improvementTips.innerHTML = `
        <p>Quick wins to improve your profile:</p>
        <ul>
            <li><strong>Update Resume:</strong> Highlight ${data.skills.matched.slice(0, 2).join(', ')}</li>
            <li><strong>Portfolio:</strong> Create 1-2 projects using ${missingSkills[0] || 'key skills'}</li>
            <li><strong>Networking:</strong> Connect with professionals in target role</li>
            <li><strong>Certifications:</strong> Consider ${getCertificationSuggestions(missingSkills)}</li>
        </ul>
    `;
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

function getLearningResource(skill) {
    const resources = {
        "python": "Python for Everybody (Coursera) - Free course",
        "sql": "SQL Bootcamp (Udemy) - Hands-on practice",
        "aws": "AWS Certified Solutions Architect - Official training",
        "machine learning": "Machine Learning by Andrew Ng (Coursera)",
        "react": "React - The Complete Guide (Udemy)",
        "tableau": "Tableau Training (LinkedIn Learning)",
        "excel": "Excel Advanced Skills (YouTube tutorials)",
        "communication": "Effective Communication (Coursera)"
    };
    
    return resources[skill.toLowerCase()] || "Online courses and practice projects";
}

function getCertificationSuggestions(missingSkills) {
    const certifications = {
        "aws": "AWS Certified Solutions Architect",
        "python": "Python Institute PCAP",
        "sql": "Microsoft SQL Server Certification",
        "machine learning": "Google Machine Learning Certification",
        "project management": "PMP or CAPM"
    };
    
    const suggestions = missingSkills
        .filter(skill => certifications[skill.toLowerCase()])
        .slice(0, 2)
        .map(skill => certifications[skill.toLowerCase()]);
    
    return suggestions.length > 0 ? suggestions.join(' or ') : "relevant industry certifications";
}

function generateActionPlan(data) {
    const steps = [
        {
            title: "Immediate Action (Week 1)",
            content: `Update your resume to highlight: ${data.skills.matched.slice(0, 3).join(', ')}`
        },
        {
            title: "Skill Development (Week 2-3)",
            content: `Start learning: ${data.skills.missing.slice(0, 2).join(' and ')} through online courses`
        },
        {
            title: "Practical Application (Week 4)",
            content: `Build a small project using ${data.skills.missing[0] || 'a key skill'} to demonstrate capability`
        },
        {
            title: "Networking & Application (Week 5-6)",
            content: "Connect with 10 professionals in your target role and apply to 5 relevant positions"
        },
        {
            title: "Interview Preparation (Week 7-8)",
            content: "Prepare STAR method answers for common interview questions and practice mock interviews"
        }
    ];
    
    actionPlan.innerHTML = steps.map((step, index) => `
        <div class="plan-step">
            <h4>${step.title}</h4>
            <p>${step.content}</p>
        </div>
    `).join('');
}

function exportActionPlan() {
    if (!candidateAnalysis) {
        showNotification("No analysis to export", "error");
        return;
    }
    
    const planContent = `
AI Job Analyzer - Personal Action Plan
Generated: ${new Date().toLocaleDateString()}
========================================

OVERVIEW:
Fit Score: ${candidateAnalysis.fit_score}%
Matched Skills: ${candidateAnalysis.skills.matched.length}
Missing Skills: ${candidateAnalysis.skills.missing.length}
Extra Skills: ${candidateAnalysis.skills.extras.length}

30-DAY ACTION PLAN:
${actionPlan.textContent.replace(/\n/g, '\n')}

RECOMMENDATIONS:
${learningPath.textContent.replace(/\n/g, '\n')}

ALTERNATIVE ROLES:
${alternativeRoles.textContent.replace(/\n/g, '\n')}

IMPROVEMENT TIPS:
${improvementTips.textContent.replace(/\n/g, '\n')}
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