// ============================================
// HEALTHLINK SL - ADMIN PANEL
// ============================================

let adminCredentials = { username: "admin", password: "admin123" };

function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');
    if (isLoggedIn === 'true') {
        if (loginSection) loginSection.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        loadAdminDashboard();
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    }
}

const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        if (username === adminCredentials.username && password === adminCredentials.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            checkAdminLogin();
        } else alert('Invalid credentials. Use admin / admin123');
    });
}

function loadAdminDashboard() {
    loadClinicsTable();
    updateStats();
    setupTabs();
    setupEventListeners();
}

function updateStats() {
    const clinics = window.masterClinics || [];
    document.getElementById('totalClinics').textContent = clinics.length;
    document.getElementById('verifiedClinics').textContent = clinics.filter(c => c.verified).length;
    const districts = [...new Set(clinics.map(c => c.district))];
    document.getElementById('totalDistricts').textContent = districts.length;
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    document.getElementById('totalMessages').textContent = messages.length;
}

function loadClinicsTable() {
    let clinics = window.masterClinics || [];
    const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    const districtFilter = document.getElementById('adminDistrictFilter')?.value || 'all';
    let filtered = clinics.filter(c => {
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm) && !c.address.toLowerCase().includes(searchTerm)) return false;
        if (districtFilter !== 'all' && c.district !== districtFilter) return false;
        return true;
    });
    const tbody = document.getElementById('clinicsTableBody');
    if (tbody) {
        tbody.innerHTML = filtered.map(c => `
            <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:10px;">${c.id}</td>
                <td style="padding:10px;">${c.name}</td>
                <td style="padding:10px;">${c.district}</td>
                <td style="padding:10px;">${c.phone}</td>
                <td style="padding:10px;">${c.type}</td>
                <td style="padding:10px;">${c.verified ? '✅ Yes' : '❌ No'}</td>
                <td style="padding:10px;">
                    <button class="btn btn-outline edit-clinic" data-id="${c.id}" style="padding:5px 10px;">Edit</button>
                    <button class="btn btn-emergency delete-clinic" data-id="${c.id}" style="padding:5px 10px;">Delete</button>
                </td>
            </tr>
        `).join('');
        document.querySelectorAll('.edit-clinic').forEach(btn => btn.addEventListener('click', () => editClinic(parseInt(btn.dataset.id))));
        document.querySelectorAll('.delete-clinic').forEach(btn => btn.addEventListener('click', () => deleteClinic(parseInt(btn.dataset.id))));
    }
}

function editClinic(id) {
    const clinic = window.masterClinics.find(c => c.id === id);
    if (clinic) {
        const newName = prompt('Edit Clinic Name:', clinic.name);
        if (newName) clinic.name = newName;
        const newPhone = prompt('Edit Phone:', clinic.phone);
        if (newPhone) clinic.phone = newPhone;
        const newAddress = prompt('Edit Address:', clinic.address);
        if (newAddress) clinic.address = newAddress;
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        alert('Clinic updated!');
    }
}

function deleteClinic(id) {
    if (confirm('Delete this clinic?')) {
        window.masterClinics = window.masterClinics.filter(c => c.id !== id);
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        alert('Clinic deleted!');
    }
}

const addForm = document.getElementById('addClinicForm');
if (addForm) {
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newClinic = {
            id: window.masterClinics.length + 1,
            name: document.getElementById('newName').value,
            district: document.getElementById('newDistrict').value,
            address: document.getElementById('newAddress').value,
            phone: document.getElementById('newPhone').value,
            type: document.getElementById('newType').value,
            lat: parseFloat(document.getElementById('newLat').value) || 8.48,
            lng: parseFloat(document.getElementById('newLng').value) || -13.23,
            rating: 4.0, verified: false,
            services: (document.getElementById('newServices').value || "General Care").split(',').map(s => s.trim()),
            hours: "8am-6pm",
            image: "https://placehold.co/400x200/2E7D32/white?text=New+Clinic"
        };
        window.masterClinics.push(newClinic);
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        addForm.reset();
        alert('Clinic added!');
        document.querySelector('.tab-btn[data-tab="clinics"]').click();
    });
}

document.getElementById('exportJSON')?.addEventListener('click', () => {
    const data = JSON.stringify(window.masterClinics, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clinics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
});

document.getElementById('exportCSV')?.addEventListener('click', () => {
    const headers = ['id', 'name', 'district', 'address', 'phone', 'type', 'rating'];
    const rows = window.masterClinics.map(c => headers.map(h => `"${c[h] || ''}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clinics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
});

window.confirmReset = function() {
    if (confirm('Reset all clinics to default? This cannot be undone.')) {
        localStorage.removeItem('healthlink_clinics');
        location.reload();
    }
};

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.id === 'logoutBtn') {
                sessionStorage.removeItem('adminLoggedIn');
                checkAdminLogin();
                return;
            }
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(`${tab.dataset.tab}Tab`).style.display = 'block';
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

function setupEventListeners() {
    document.getElementById('adminSearch')?.addEventListener('keyup', () => loadClinicsTable());
    document.getElementById('adminDistrictFilter')?.addEventListener('change', () => loadClinicsTable());
}

checkAdminLogin();