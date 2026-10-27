// Smart Bed Allocation JavaScript
let waitingPatients = [];
let currentRecommendation = null;

document.addEventListener('DOMContentLoaded', () => {
    loadWaitingPatients();

    document.getElementById('patientSelect').addEventListener('change', onPatientSelected);
    document.getElementById('acceptBtn').addEventListener('click', acceptAllocation);
    document.getElementById('cancelBtn').addEventListener('click', cancelRecommendation);
});

async function loadWaitingPatients() {
    try {
        const response = await fetch('/api/patients/waiting');
        waitingPatients = await response.json();

        const select = document.getElementById('patientSelect');
        select.innerHTML = '<option value="">-- Select Waiting Patient --</option>';

        const tbody = document.getElementById('waitingTableBody');
        tbody.innerHTML = '';

        if (!waitingPatients || waitingPatients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No waiting patients found! All patients are admitted or discharged.</td></tr>`;
            return;
        }

        waitingPatients.forEach((p, idx) => {
            // Populate select dropdown
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.priority} - Requires: ${p.requiredBedType})`;
            select.appendChild(opt);

            // Populate waiting table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">#${idx + 1}</td>
                <td>
                    <div class="fw-semibold text-dark">${escapeHtml(p.name)}</div>
                    <small class="text-muted">Age: ${p.age}, ${p.gender}</small>
                </td>
                <td>${escapeHtml(p.symptoms || 'General')}</td>
                <td>${getPriorityBadge(p.priority)}</td>
                <td>${getBedTypeBadge(p.requiredBedType)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-primary" onclick="selectAndRecommend(${p.id})">
                        <i class="bi bi-cpu me-1"></i> Recommend Bed
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error loading waiting patients:', err);
        showAlert('danger', 'Failed to fetch waiting patients.');
    }
}

function selectAndRecommend(patientId) {
    const select = document.getElementById('patientSelect');
    select.value = patientId;
    fetchRecommendation(patientId);
}

function onPatientSelected(e) {
    const patientId = e.target.value;
    if (patientId) {
        fetchRecommendation(patientId);
    } else {
        hideRecommendation();
    }
}

async function fetchRecommendation(patientId) {
    const recommendCard = document.getElementById('recommendationCard');
    const noBedCard = document.getElementById('noBedCard');
    const loadingCard = document.getElementById('loadingCard');

    recommendCard.classList.add('d-none');
    noBedCard.classList.add('d-none');
    loadingCard.classList.remove('d-none');

    try {
        const response = await fetch(`/api/allocation/recommend/${patientId}`, {
            method: 'POST'
        });
        const data = await response.json();
        currentRecommendation = data;

        loadingCard.classList.add('d-none');

        if (data.found && data.recommendedBed) {
            displayRecommendation(data);
        } else {
            displayNoBed(data);
        }
    } catch (err) {
        console.error('Recommendation error:', err);
        loadingCard.classList.add('d-none');
        showAlert('danger', 'Error while calculating bed recommendation.');
    }
}

function displayRecommendation(data) {
    const p = data.patient;
    const b = data.recommendedBed;

    document.getElementById('recPatientName').textContent = p.name;
    document.getElementById('recPatientPriority').innerHTML = getPriorityBadge(p.priority);
    document.getElementById('recRequiredBed').innerHTML = getBedTypeBadge(p.requiredBedType);
    document.getElementById('recPriorityScore').textContent = `${data.priorityScore} / 4`;

    document.getElementById('recBedNumber').textContent = b.bedNumber;
    document.getElementById('recBedType').innerHTML = getBedTypeBadge(b.bedType);
    document.getElementById('recBedFloor').textContent = `Floor ${b.floor}`;

    // Reasons list
    const reasonsList = document.getElementById('recReasonsList');
    reasonsList.innerHTML = '';
    (data.reasons || []).forEach(r => {
        const li = document.createElement('li');
        li.className = 'list-group-item bg-transparent border-0 ps-0 py-1';
        li.innerHTML = `<span class="reason-check"><i class="bi bi-check-circle-fill"></i></span> ${escapeHtml(r)}`;
        reasonsList.appendChild(li);
    });

    // Load available equipment choices
    loadAvailableEquipmentForAllocation();

    document.getElementById('recommendationCard').classList.remove('d-none');
    document.getElementById('recommendationCard').scrollIntoView({ behavior: 'smooth' });
}

async function loadAvailableEquipmentForAllocation() {
    const container = document.getElementById('equipmentCheckboxes');
    if (!container) return;
    try {
        const res = await fetch('/api/equipment/available');
        const items = await res.json();
        if (!items || items.length === 0) {
            container.innerHTML = `<div class="col-12 text-muted small"><i class="bi bi-info-circle me-1"></i>No equipment currently available in storage.</div>`;
            return;
        }
        container.innerHTML = items.map(eq => `
            <div class="col-md-6">
                <div class="form-check p-2 bg-white rounded border d-flex align-items-center">
                    <input class="form-check-input ms-0 me-2" type="checkbox" value="${eq.id}" id="eqCheck_${eq.id}">
                    <label class="form-check-label w-100" for="eqCheck_${eq.id}" style="cursor: pointer;">
                        <span class="fw-semibold text-dark">${escapeHtml(eq.name)}</span>
                        <small class="text-muted d-block" style="font-size: 0.75rem;">${escapeHtml(eq.locationOrRoom || 'Storage')} &bull; ${escapeHtml(eq.type)}</small>
                    </label>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div class="col-12 text-muted small">Could not load equipment.</div>`;
    }
}

function displayNoBed(data) {
    const noBedCard = document.getElementById('noBedCard');
    const msg = data.message || 'No suitable bed is currently available.';
    document.getElementById('noBedMessage').textContent = msg;
    noBedCard.classList.remove('d-none');
    noBedCard.scrollIntoView({ behavior: 'smooth' });
}

function hideRecommendation() {
    document.getElementById('recommendationCard').classList.add('d-none');
    document.getElementById('noBedCard').classList.add('d-none');
    document.getElementById('loadingCard').classList.add('d-none');
    currentRecommendation = null;
}

function cancelRecommendation() {
    hideRecommendation();
    document.getElementById('patientSelect').value = '';
}

async function acceptAllocation() {
    if (!currentRecommendation || !currentRecommendation.patient || !currentRecommendation.recommendedBed) {
        showAlert('warning', 'No active recommendation to accept.');
        return;
    }

    const patientId = currentRecommendation.patient.id;
    const bedId = currentRecommendation.recommendedBed.id;
    const patientName = currentRecommendation.patient.name;
    const bedNumber = currentRecommendation.recommendedBed.bedNumber;

    // Collect selected equipment IDs
    const checkedBoxes = document.querySelectorAll('#equipmentCheckboxes input[type="checkbox"]:checked');
    const equipmentIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value)).filter(id => !isNaN(id));

    const acceptBtn = document.getElementById('acceptBtn');
    const origText = acceptBtn.innerHTML;
    acceptBtn.disabled = true;
    acceptBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Allocating...';

    try {
        const response = await fetch('/api/allocation/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, bedId, equipmentIds })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message || `Bed ${bedNumber} successfully allocated to ${patientName}! Patient is now Admitted.`);
            hideRecommendation();
            loadWaitingPatients();
        } else {
            showAlert('danger', data.message || 'Failed to allocate bed.');
        }
    } catch (err) {
        console.error('Accept allocation error:', err);
        showAlert('danger', 'Error connecting to server.');
    } finally {
        acceptBtn.disabled = false;
        acceptBtn.innerHTML = origText;
    }
}

function showAlert(type, msg) {
    const alertBox = document.getElementById('pageAlert');
    if (alertBox) {
        alertBox.className = `alert alert-${type} alert-dismissible fade show`;
        alertBox.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertBox.classList.remove('d-none');
        setTimeout(() => { alertBox.classList.add('d-none'); }, 5000);
    }
}

function getPriorityBadge(priority) {
    switch ((priority || '').toUpperCase()) {
        case 'CRITICAL': return '<span class="badge badge-critical">CRITICAL (Score: 4)</span>';
        case 'HIGH': return '<span class="badge badge-high">HIGH (Score: 3)</span>';
        case 'MEDIUM': return '<span class="badge badge-medium">MEDIUM (Score: 2)</span>';
        case 'LOW': return '<span class="badge badge-low">LOW (Score: 1)</span>';
        default: return `<span class="badge bg-secondary">${priority}</span>`;
    }
}

function getBedTypeBadge(type) {
    switch ((type || '').toUpperCase()) {
        case 'ICU': return '<span class="badge badge-bed-icu">ICU</span>';
        case 'PRIVATE': return '<span class="badge badge-bed-private">PRIVATE</span>';
        case 'GENERAL': return '<span class="badge badge-bed-general">GENERAL</span>';
        default: return `<span class="badge bg-secondary">${type}</span>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
