// ============================================
// HEALTHLINK SL - MAIN JAVASCRIPT
// FIXED for Mobile/Tablet Hamburger Menu
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== HAMBURGER MENU - FIXED FOR MOBILE/TABLET ==========
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        // Remove any existing listeners to prevent duplicates
        const newHamburger = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        
        // Get the new reference
        const finalHamburger = document.querySelector('.hamburger');
        const finalNavMenu = document.querySelector('.nav-menu');
        
        // Toggle menu on click (works on both desktop and mobile)
        finalHamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            finalNavMenu.classList.toggle('active');
            finalHamburger.classList.toggle('active');
            console.log('Menu toggled - active:', finalNavMenu.classList.contains('active'));
        });
        
        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                finalNavMenu.classList.remove('active');
                finalHamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside (on mobile)
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = finalNavMenu.contains(event.target);
            const isClickOnHamburger = finalHamburger.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnHamburger && finalNavMenu.classList.contains('active')) {
                finalNavMenu.classList.remove('active');
                finalHamburger.classList.remove('active');
            }
        });
        
        // Handle touchstart for mobile devices
        finalHamburger.addEventListener('touchstart', function(e) {
            e.preventDefault();
            finalNavMenu.classList.toggle('active');
            finalHamburger.classList.toggle('active');
        });
    } else {
        console.log('Hamburger or nav-menu not found');
    }
    
    // ========== SCROLL PROGRESS BAR ==========
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:4px;background:#D62828;z-index:10000;transition:width 0.1s;';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / winHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // ========== BACK TO TOP BUTTON ==========
    const backBtn = document.createElement('button');
    backBtn.className = 'back-to-top';
    backBtn.innerHTML = '↑';
    backBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;background:#2E7D32;color:white;border:none;border-radius:50%;cursor:pointer;display:none;font-size:24px;z-index:999;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
    document.body.appendChild(backBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backBtn.style.display = 'flex';
            backBtn.style.alignItems = 'center';
            backBtn.style.justifyContent = 'center';
        } else {
            backBtn.style.display = 'none';
        }
    });
    
    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // ========== CLICK TO CALL ==========
    document.querySelectorAll('.call-btn, [data-phone]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let phone = btn.getAttribute('data-phone');
            if (!phone) {
                const text = btn.textContent;
                const match = text.match(/[\+0-9\s\-\(\)]{8,}/);
                if (match) phone = match[0];
            }
            if (phone) {
                if (confirm(`📞 Call ${phone}?`)) {
                    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
                }
            } else {
                alert('Phone number not available');
            }
        });
    });
    
    // ========== VALIDATE EMAIL HELPER ==========
    window.validateEmail = function(email) {
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    };
    
    console.log('Main.js loaded - Menu should work on mobile');
});

// ========== SERVICE WORKER REGISTRATION (Offline Mode) ==========
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('✅ Service Worker registered:', reg))
        .catch(err => console.log('❌ Service Worker error:', err));
}