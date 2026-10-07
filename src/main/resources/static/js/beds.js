// Bed Management JavaScript
let bedsList = [];
let bedModal = null;

document.addEventListener('DOMContentLoaded', () => {
    bedModal = new bootstrap.Modal(document.getElementById('bedModal'));
    loadBeds();

    document.getElementById('saveBedBtn').addEventListener('click', saveBed);
    document.getElementById('typeFilter').addEventListener('change', loadBeds);
    document.getElementById('statusFilter').addEventListener('change', loadBeds);
    document.getElementById('searchInput').addEventListener('input', handleBedSearch);
});

async function loadBeds() {
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;

    let url = '/api/beds';
    const params = new URLSearchParams();
    if (type && type !== 'ALL') params.append('type', type);
    if (status && status !== 'ALL') params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url);
        bedsList = await response.json();
        renderBedsTable(bedsList);
    } catch (err) {
        console.error('Error fetching beds:', err);
        showAlert('danger', 'Failed to load beds.');
    }
}

function renderBedsTable(list) {
    const tbody = document.getElementById('bedsTableBody');
    tbody.innerHTML = '';

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No beds found matching criteria.</td></tr>`;
        return;
    }

    list.forEach(b => {
        const tr = document.createElement('tr');
        const patientInfo = b.patient ? `
            <div class="fw-semibold text-primary">${escapeHtml(b.patient.name)}</div>
            <small class="text-muted">ID: #${b.patient.id} (${b.patient.priority})</small>
        ` : `<span class="text-muted fst-italic">None</span>`;

        tr.innerHTML = `
            <td class="fw-bold">#${b.id}</td>
            <td><span class="bed-tag">${escapeHtml(b.bedNumber)}</span></td>
            <td>${getBedTypeBadge(b.bedType)}</td>
            <td><i class="bi bi-layers me-1 text-muted"></i> Floor ${b.floor}</td>
            <td>${getBedStatusBadge(b.status)}</td>
            <td>${patientInfo}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditBedModal(${b.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBed(${b.id}, '${escapeHtml(b.bedNumber)}', '${b.status}')" ${b.status === 'OCCUPIED' ? 'title="Occupied bed cannot be deleted"' : ''}>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleBedSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
        renderBedsTable(bedsList);
        return;
    }
    const filtered = bedsList.filter(b =>
        b.bedNumber.toLowerCase().includes(q) ||
        b.bedType.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        (b.patient && b.patient.name.toLowerCase().includes(q))
    );
    renderBedsTable(filtered);
}

function openAddBedModal() {
    document.getElementById('bedForm').reset();
    document.getElementById('bedId').value = '';
    document.getElementById('bedModalTitle').textContent = 'Add New Bed';
    document.getElementById('bedError').classList.add('d-none');
    bedModal.show();
}

function openEditBedModal(id) {
    const bed = bedsList.find(b => b.id === id);
    if (!bed) return;

    document.getElementById('bedId').value = bed.id;
    document.getElementById('bedNumber').value = bed.bedNumber;
    document.getElementById('bedType').value = bed.bedType;
    document.getElementById('floor').value = bed.floor;

    document.getElementById('bedModalTitle').textContent = 'Edit Bed Details';
    document.getElementById('bedError').classList.add('d-none');
    bedModal.show();
}

async function saveBed() {
    const id = document.getElementById('bedId').value;
    const bedNumber = document.getElementById('bedNumber').value.trim().toUpperCase();
    const bedType = document.getElementById('bedType').value;
    const floor = parseInt(document.getElementById('floor').value);

    const errorDiv = document.getElementById('bedError');
    errorDiv.classList.add('d-none');

    if (!bedNumber) {
        showBedModalError('Bed number cannot be empty.');
        return;
    }
    if (!bedType) {
        showBedModalError('Please select bed type.');
        return;
    }
    if (isNaN(floor) || floor < 0) {
        showBedModalError('Valid floor number is required.');
        return;
    }

    const payload = { bedNumber, bedType, floor };
    const isEdit = !!id;
    const url = isEdit ? `/api/beds/${id}` : '/api/beds';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            bedModal.hide();
            showAlert('success', data.message);
            loadBeds();
        } else {
            showBedModalError(data.message || 'Operation failed.');
        }
    } catch (err) {
        console.error('Save bed error:', err);
        showBedModalError('Network error while saving bed.');
    }
}

async function deleteBed(id, bedNumber, status) {
    if (status === 'OCCUPIED') {
        showAlert('warning', `Bed ${bedNumber} is occupied. Discharge or reassign patient before deleting.`);
        return;
    }

    if (!confirm(`Are you sure you want to delete Bed ${bedNumber}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/beds/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message);
            loadBeds();
        } else {
            showAlert('danger', data.message || 'Failed to delete bed.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        showAlert('danger', 'Error connecting to server.');
    }
}

function showBedModalError(msg) {
    const errorDiv = document.getElementById('bedError');
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

function getBedTypeBadge(type) {
    switch ((type || '').toUpperCase()) {
        case 'ICU': return '<span class="badge badge-bed-icu">ICU</span>';
        case 'PRIVATE': return '<span class="badge badge-bed-private">PRIVATE</span>';
        case 'GENERAL': return '<span class="badge badge-bed-general">GENERAL</span>';
        default: return `<span class="badge bg-secondary">${type}</span>`;
    }
}

function getBedStatusBadge(status) {
    if ((status || '').toUpperCase() === 'AVAILABLE') {
        return '<span class="badge badge-available"><i class="bi bi-check-circle me-1"></i> AVAILABLE</span>';
    } else {
        return '<span class="badge badge-occupied"><i class="bi bi-x-circle me-1"></i> OCCUPIED</span>';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
