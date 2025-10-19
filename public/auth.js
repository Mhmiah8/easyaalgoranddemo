function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('algorand-features').style.display = 'none';
}

function showAlgorandFeatures() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('algorand-features').style.display = 'block';
}

async function register() {
    const user = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    
    if (!user.username || !user.password) {
        alert('Please enter username and password');
        return;
    }
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    
    const result = await response.json();
    alert(result.message || 'Registered successfully!');
    
    if (result.success) {
        // Auto login after registration
        await login();
    }
}

async function login() {
    const user = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    
    const result = await response.json();
    if (result.success) {
        localStorage.setItem('username', user.username);
        localStorage.setItem('role', result.role);
        window.location.href = result.role + '.html';
    } else {
        alert('Login failed: ' + result.message);
    }
}
// Direct login function for returning users
async function loginDirect() {
    const user = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };
    
    if (!user.username || !user.password) {
        alert('Please enter both username and password');
        return;
    }
    
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    
    const result = await response.json();
    if (result.success) {
        localStorage.setItem('username', user.username);
        localStorage.setItem('role', result.role);
        window.location.href = result.role + '.html';
    } else {
        alert('Login failed: ' + result.message);
    }
}

// Update the register function to use new field IDs
async function register() {
    const user = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value
    };
    
    if (!user.username || !user.password) {
        alert('Please enter username and password');
        return;
    }
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    
    const result = await response.json();
    alert(result.message);
    
    if (result.success) {
        // Switch to login tab after successful registration
        document.getElementById('login-tab').click();
        // Pre-fill the login form
        document.getElementById('login-username').value = user.username;
        document.getElementById('login-password').value = user.password;
    }
}