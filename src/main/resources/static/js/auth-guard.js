// Authentication Guard & UI Helper
(function () {
    const isLoginPage = window.location.pathname.endsWith('index.html') || 
                         window.location.pathname === '/' || 
                         window.location.pathname.endsWith('/');

    const currentUser = localStorage.getItem('hospital_user');

    if (!currentUser && !isLoginPage) {
        window.location.href = 'index.html';
        return;
    }

    if (currentUser && isLoginPage) {
        window.location.href = 'dashboard.html';
        return;
    }

    // When DOM loaded, populate user info & highlight active menu
    document.addEventListener('DOMContentLoaded', () => {
        if (!isLoginPage) {
            const userNameDisplay = document.getElementById('loggedInUserName');
            const userRoleDisplay = document.getElementById('loggedInUserRole');
            if (currentUser) {
                try {
                    const parsed = JSON.parse(currentUser);
                    if (userNameDisplay) {
                        const uname = parsed.username || 'User';
                        userNameDisplay.textContent = uname.charAt(0).toUpperCase() + uname.slice(1);
                    }
                    if (userRoleDisplay) {
                        userRoleDisplay.textContent = (parsed.role === 'ROLE_STAFF') ? 'Hospital Staff' : 'Administrator';
                    }
                } catch (e) {
                    if (userNameDisplay) userNameDisplay.textContent = currentUser;
                }
            }

            // Highlight active sidebar item
            const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
            const links = document.querySelectorAll('.sidebar-link');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href === currentPath || (currentPath === '' && href === 'dashboard.html'))) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
})();

function logout() {
    localStorage.removeItem('hospital_user');
    window.location.href = 'index.html';
}
