// Login handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.classList.add('d-none');
            loginError.textContent = '';

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                loginError.textContent = 'Please enter both username and password.';
                loginError.classList.remove('d-none');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('hospital_user', JSON.stringify({
                        username: data.username,
                        role: data.role
                    }));
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = data.message || 'Invalid credentials. Please try again.';
                    loginError.classList.remove('d-none');
                }
            } catch (err) {
                console.error('Login error:', err);
                loginError.textContent = 'Server connection error. Please ensure the backend is running.';
                loginError.classList.remove('d-none');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});

function fillCredentials(username, password) {
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    if (userField) userField.value = username;
    if (passField) passField.value = password;
}

