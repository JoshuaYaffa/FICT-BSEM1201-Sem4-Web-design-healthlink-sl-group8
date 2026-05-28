// ============================================
// HEALTHLINK SL - ADMIN PANEL JAVASCRIPT
// ============================================

// Admin credentials (change these)
let adminCredentials = {
    username: "admin",
    password: "admin123"
};

// Check login status
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminDashboard();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

// Handle login
const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            checkAdminLogin();
        } else {
            alert('Invalid username or password. Use admin / admin123');
        }
    });
}

// Load admin dashboard
function loadAdminDashboard() {
    loadClinicsTable();
    updateStats();
    setupTabs();
    setupEventListeners();
}

// Update statistics
function updateStats() {
    const clinics = window.masterClinics || [];
    document.getElementById('totalClinics').textContent = clinics.length;
    document.getElementById('verifiedClinics').textContent = clinics.filter(c => c.verified).length;
    const districts = [...new Set(clinics.map(c => c.district))];
    document.getElementById('totalDistricts').textContent = districts.length;
    document.getElementById('totalMessages').textContent = localStorage.getItem('contactMessages') ? JSON.parse(localStorage.getItem('contactMessages')).length : 0;
}

// Load clinics table
function loadClinicsTable() {
    let clinics = window.masterClinics || [];
    const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    const districtFilter = document.getElementById('adminDistrictFilter')?.value || 'all';
    
    let filtered = clinics.filter(clinic => {
        let match = true;
        if (searchTerm && !clinic.name.toLowerCase().includes(searchTerm) && !clinic.address.toLowerCase().includes(searchTerm)) {
            match = false;
        }
        if (districtFilter !== 'all' && clinic.district !== districtFilter) {
            match = false;
        }
        return match;
    });
    
    const tbody = document.getElementById('clinicsTableBody');
    if (tbody) {
        tbody.innerHTML = filtered.map(clinic => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${clinic.id}</td>
                <td style="padding: 10px;">${clinic.name}</td>
                <td style="padding: 10px;">${clinic.district}</td>
                <td style="padding: 10px;">${clinic.phone}</td>
                <td style="padding: 10px;">${clinic.type}</td>
                <td style="padding: 10px;">${clinic.verified ? '✅ Yes' : '❌ No'}</td>
                <td style="padding: 10px;">
                    <button class="btn btn-outline edit-clinic" data-id="${clinic.id}" style="padding: 5px 10px; margin-right: 5px;">Edit</button>
                    <button class="btn btn-emergency delete-clinic" data-id="${clinic.id}" style="padding: 5px 10px;">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to edit/delete buttons
        document.querySelectorAll('.edit-clinic').forEach(btn => {
            btn.addEventListener('click', () => editClinic(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.delete-clinic').forEach(btn => {
            btn.addEventListener('click', () => deleteClinic(parseInt(btn.dataset.id)));
        });
    }
}

// Edit clinic
function editClinic(id) {
    const clinic = window.masterClinics.find(c => c.id === id);
    if (clinic) {
        const newName = prompt('Edit Clinic Name:', clinic.name);
        if (newName) clinic.name = newName;
        const newPhone = prompt('Edit Phone Number:', clinic.phone);
        if (newPhone) clinic.phone = newPhone;
        const newAddress = prompt('Edit Address:', clinic.address);
        if (newAddress) clinic.address = newAddress;
        
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        alert('Clinic updated successfully!');
    }
}

// Delete clinic
function deleteClinic(id) {
    if (confirm('Are you sure you want to delete this clinic?')) {
        window.masterClinics = window.masterClinics.filter(c => c.id !== id);
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        alert('Clinic deleted successfully!');
    }
}

// Add new clinic
const addClinicForm = document.getElementById('addClinicForm');
if (addClinicForm) {
    addClinicForm.addEventListener('submit', (e) => {
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
            rating: 4.0,
            verified: false,
            services: (document.getElementById('newServices').value || "General Care").split(',').map(s => s.trim()),
            hours: "Monday-Friday: 8am-6pm",
            image: document.getElementById('newImage').value || `https://placehold.co/400x200/2E7D32/white?text=${encodeURIComponent(document.getElementById('newName').value)}`
        };
        
        window.masterClinics.push(newClinic);
        saveClinicsToLocalStorage();
        loadClinicsTable();
        updateStats();
        addClinicForm.reset();
        alert('Clinic added successfully!');
        
        // Switch to clinics tab
        document.querySelector('.tab-btn[data-tab="clinics"]').click();
    });
}

// Export as JSON
const exportBtn = document.getElementById('exportJSON');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const data = JSON.stringify(window.masterClinics, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthlink_clinics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Clinics exported successfully!');
    });
}

// Export as CSV
const exportCSVBtn = document.getElementById('exportCSV');
if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', () => {
        const headers = ['id', 'name', 'district', 'address', 'phone', 'type', 'rating', 'verified'];
        const rows = window.masterClinics.map(c => headers.map(h => `"${c[h] || ''}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthlink_clinics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Clinics exported as CSV successfully!');
    });
}

// Reset to default
window.confirmReset = function() {
    if (confirm('⚠️ WARNING: This will reset all clinics to default and delete all changes. This cannot be undone. Continue?')) {
        localStorage.removeItem('healthlink_clinics');
        location.reload();
    }
};

// Settings form
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('settingUsername').value;
        const newPassword = document.getElementById('settingPassword').value;
        const confirmPassword = document.getElementById('settingConfirmPassword').value;
        
        if (newUsername) adminCredentials.username = newUsername;
        if (newPassword) {
            if (newPassword === confirmPassword) {
                adminCredentials.password = newPassword;
                alert('Password changed successfully!');
            } else {
                alert('Passwords do not match!');
                return;
            }
        }
        alert('Settings saved! Please login again.');
        sessionStorage.removeItem('adminLoggedIn');
        checkAdminLogin();
    });
}

// Tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.id === 'logoutBtn') {
                sessionStorage.removeItem('adminLoggedIn');
                checkAdminLogin();
                return;
            }
            
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tabName}Tab`).style.display = 'block';
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('adminSearch');
    if (searchInput) searchInput.addEventListener('keyup', () => loadClinicsTable());
    
    const districtFilter = document.getElementById('adminDistrictFilter');
    if (districtFilter) districtFilter.addEventListener('change', () => loadClinicsTable());
}

// Save site settings
const saveSiteSettings = document.getElementById('saveSiteSettings');
if (saveSiteSettings) {
    saveSiteSettings.addEventListener('click', () => {
        const hotline = document.getElementById('emergencyHotline').value;
        const email = document.getElementById('contactEmail').value;
        localStorage.setItem('siteHotline', hotline);
        localStorage.setItem('siteEmail', email);
        alert('Site settings saved!');
    });
}

// Check login on page load
checkAdminLogin();