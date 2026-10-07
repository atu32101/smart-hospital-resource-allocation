// Patient Management JavaScript
let patientsList = [];
let patientModal = null;

document.addEventListener('DOMContentLoaded', () => {
    patientModal = new bootstrap.Modal(document.getElementById('patientModal'));
    loadPatients();

    document.getElementById('savePatientBtn').addEventListener('click', savePatient);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
});

async function loadPatients() {
    try {
        const response = await fetch('/api/patients');
        patientsList = await response.json();
        renderPatientsTable(patientsList);
    } catch (err) {
        console.error('Error fetching patients:', err);
        showAlert('danger', 'Failed to load patients list.');
    }
}

function renderPatientsTable(list) {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No patients found.</td></tr>`;
        return;
    }

    list.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">#${p.id}</td>
            <td>
                <div class="fw-semibold text-dark">${escapeHtml(p.name)}</div>
                <small class="text-muted">${p.gender}, ${p.age} yrs</small>
            </td>
            <td>${p.phone || '<span class="text-muted">-</span>'}</td>
            <td><span class="text-truncate d-inline-block" style="max-width: 180px;" title="${escapeHtml(p.symptoms || '')}">${escapeHtml(p.symptoms || 'None')}</span></td>
            <td>${getPriorityBadge(p.priority)}</td>
            <td>${getBedTypeBadge(p.requiredBedType)}</td>
            <td>${getStatusBadge(p.status)}</td>
            <td><small class="text-muted">${formatDate(p.admissionDate)}</small></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${p.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePatient(${p.id}, '${escapeHtml(p.name)}', '${p.status}')" ${p.status === 'ADMITTED' ? 'title="Discharge before deleting"' : ''}>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderPatientsTable(patientsList);
        return;
    }
    const filtered = patientsList.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.symptoms && p.symptoms.toLowerCase().includes(query)) ||
        (p.phone && p.phone.includes(query)) ||
        p.priority.toLowerCase().includes(query) ||
        p.requiredBedType.toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
    renderPatientsTable(filtered);
}

function openAddModal() {
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    document.getElementById('patientModalTitle').textContent = 'Add New Patient';
    document.getElementById('patientError').classList.add('d-none');
    patientModal.show();
}

function openEditModal(id) {
    const patient = patientsList.find(p => p.id === id);
    if (!patient) return;

    document.getElementById('patientId').value = patient.id;
    document.getElementById('name').value = patient.name;
    document.getElementById('age').value = patient.age;
    document.getElementById('gender').value = patient.gender;
    document.getElementById('phone').value = patient.phone || '';
    document.getElementById('symptoms').value = patient.symptoms || '';
    document.getElementById('priority').value = patient.priority;
    document.getElementById('requiredBedType').value = patient.requiredBedType;

    document.getElementById('patientModalTitle').textContent = 'Edit Patient Details';
    document.getElementById('patientError').classList.add('d-none');
    patientModal.show();
}

async function savePatient() {
    const id = document.getElementById('patientId').value;
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.trim();
    const symptoms = document.getElementById('symptoms').value.trim();
    const priority = document.getElementById('priority').value;
    const requiredBedType = document.getElementById('requiredBedType').value;

    const errorDiv = document.getElementById('patientError');
    errorDiv.classList.add('d-none');

    // Basic frontend validations
    if (!name) {
        showModalError('Patient name cannot be empty.');
        return;
    }
    if (isNaN(age) || age < 0 || age > 120) {
        showModalError('Age must be between 0 and 120.');
        return;
    }
    if (!gender) {
        showModalError('Please select gender.');
        return;
    }
    if (phone && !/^\d{7,15}$/.test(phone)) {
        showModalError('Phone number must contain between 7 and 15 digits.');
        return;
    }
    if (!priority) {
        showModalError('Please select priority.');
        return;
    }
    if (!requiredBedType) {
        showModalError('Please select required bed type.');
        return;
    }

    const payload = { name, age, gender, phone, symptoms, priority, requiredBedType };
    const isEdit = !!id;
    const url = isEdit ? `/api/patients/${id}` : '/api/patients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            patientModal.hide();
            showAlert('success', data.message);
            loadPatients();
        } else {
            showModalError(data.message || 'Operation failed.');
        }
    } catch (err) {
        console.error('Save error:', err);
        showModalError('Network error while saving patient.');
    }
}

async function deletePatient(id, name, status) {
    if (status === 'ADMITTED') {
        showAlert('warning', `Cannot delete admitted patient "${name}". Discharge patient first.`);
        return;
    }

    if (!confirm(`Are you sure you want to delete patient "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message);
            loadPatients();
        } else {
            showAlert('danger', data.message || 'Failed to delete patient.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        showAlert('danger', 'Error connecting to server.');
    }
}

function showModalError(msg) {
    const errorDiv = document.getElementById('patientError');
    errorDiv.textContent = msg;
    errorDiv.classList.remove('d-none');
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
        setTimeout(() => { alertBox.classList.add('d-none'); }, 4000);
    }
}

function getPriorityBadge(priority) {
    switch ((priority || '').toUpperCase()) {
        case 'CRITICAL': return '<span class="badge badge-critical">CRITICAL</span>';
        case 'HIGH': return '<span class="badge badge-high">HIGH</span>';
        case 'MEDIUM': return '<span class="badge badge-medium">MEDIUM</span>';
        case 'LOW': return '<span class="badge badge-low">LOW</span>';
        default: return `<span class="badge bg-secondary">${priority}</span>`;
    }
}

function getBedTypeBadge(type) {
    switch ((type || '').toUpperCase()) {
        case 'ICU': return '<span class="badge badge-bed-icu">ICU</span>';
        case 'PRIVATE': return '<span class="badge badge-bed-private">PRIVATE</span>';
        case 'GENERAL': return '<span class="badge badge-bed-general">GENERAL</span>';
        default: return `<span class="badge bg-light text-dark">${type}</span>`;
    }
}

function getStatusBadge(status) {
    switch ((status || '').toUpperCase()) {
        case 'WAITING': return '<span class="badge badge-waiting">WAITING</span>';
        case 'ADMITTED': return '<span class="badge badge-admitted">ADMITTED</span>';
        case 'DISCHARGED': return '<span class="badge badge-discharged">DISCHARGED</span>';
        default: return `<span class="badge bg-secondary">${status}</span>`;
    }
}

function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
