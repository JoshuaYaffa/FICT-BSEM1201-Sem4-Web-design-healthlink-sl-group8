// ============================================
// HEALTHLINK SL - CLINIC DATABASE
// ============================================

let masterClinics = [];

function generateClinics() {
    const clinics = [];
    let id = 1;
    
    const baseClinics = [
        { name: "Connaught Government Hospital", district: "Freetown", address: "1 Percival Street, Freetown", phone: "+232 76 865597", type: "Public", lat: 8.4844, lng: -13.2344, rating: 4.5, verified: true, services: ["Emergency", "Maternity", "Surgery"] },
        { name: "Choithrams Memorial Hospital", district: "Freetown", address: "Hill Station, Freetown", phone: "+232 76 980000", type: "Private", lat: 8.3963, lng: -13.2370, rating: 4.8, verified: true, services: ["Emergency", "Maternity", "Dental"] },
        { name: "Kenema Government Hospital", district: "Kenema", address: "Dama Road, Kenema", phone: "+232 76 601234", type: "Public", lat: 7.8760, lng: -11.1894, rating: 4.2, verified: true, services: ["Emergency", "Maternity"] },
        { name: "Makeni Regional Hospital", district: "Makeni", address: "Mena Boulevard, Makeni", phone: "+232 76 602345", type: "Public", lat: 8.8833, lng: -12.0500, rating: 4.3, verified: true, services: ["Emergency", "Surgery"] },
        { name: "Bo Government Hospital", district: "Bo", address: "New Gerihun Road, Bo", phone: "+232 76 603456", type: "Public", lat: 7.9667, lng: -11.7333, rating: 4.2, verified: true, services: ["Emergency", "Maternity"] },
        { name: "Kono District Hospital", district: "Kono", address: "Sefadu Road, Koidu", phone: "+232 76 604567", type: "Public", lat: 8.6333, lng: -10.9667, rating: 4.0, verified: true, services: ["Emergency"] },
        { name: "Emergency Hospital Goderich", district: "Freetown", address: "Peninsular Road, Goderich", phone: "+232 76 611386", type: "Private", lat: 8.4167, lng: -13.2833, rating: 4.7, verified: true, services: ["Emergency", "ICU"] },
        { name: "Port Loko Government Hospital", district: "Port Loko", address: "Port Loko Town", phone: "+232 76 608901", type: "Public", lat: 8.7667, lng: -12.7833, rating: 3.9, verified: true, services: ["Emergency"] },
        { name: "Kabala Government Hospital", district: "Koinadugu", address: "Kabala Town", phone: "+232 76 609012", type: "Public", lat: 9.5833, lng: -11.5500, rating: 3.8, verified: true, services: ["Emergency"] },
        { name: "Kailahun District Hospital", district: "Kailahun", address: "Kailahun Town", phone: "+232 76 614567", type: "Public", lat: 8.2833, lng: -10.5667, rating: 3.9, verified: true, services: ["Emergency"] }
    ];
    
    baseClinics.forEach(c => {
        clinics.push({ id: id++, ...c, hours: "24/7", image: `https://placehold.co/400x200/2E7D32/white?text=${encodeURIComponent(c.name)}` });
    });
    
    for (let i = 1; i <= 20; i++) {
        clinics.push({
            id: id++, name: `Community Health Center ${i}`, district: "Freetown",
            address: `Street ${i}, Freetown`, phone: `+232 76 ${600000 + i}`, type: i % 2 === 0 ? "Public" : "Private",
            lat: 8.48 + Math.random() * 0.1, lng: -13.23 + Math.random() * 0.1, rating: 3.5 + Math.random(), verified: Math.random() > 0.5,
            services: ["General Care"], hours: "8am-6pm", image: "https://placehold.co/400x200/2E7D32/white?text=Health+Center"
        });
    }
    
    return clinics;
}

masterClinics = generateClinics();

function saveClinicsToLocalStorage() {
    localStorage.setItem('healthlink_clinics', JSON.stringify(masterClinics));
}

function loadClinicsFromLocalStorage() {
    const saved = localStorage.getItem('healthlink_clinics');
    if (saved) masterClinics = JSON.parse(saved);
    return masterClinics;
}

window.masterClinics = masterClinics;
window.saveClinicsToLocalStorage = saveClinicsToLocalStorage;
window.loadClinicsFromLocalStorage = loadClinicsFromLocalStorage;

document.addEventListener('DOMContentLoaded', () => loadClinicsFromLocalStorage());