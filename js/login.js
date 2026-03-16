// ===== 原有功能：背景視差效果 =====
var back = document.getElementById('back');
window.onmousemove = function (event) {
    var x = -event.clientX / 20;
    var y = -event.clientY / 30;
    if (back) {
        back.style.backgroundPositionX = x + "px";
        back.style.backgroundPositionY = y + "px";
    }
}

// ===== 原有功能：載入動畫 =====
var con = document.getElementById('con');
function loadoff() {
    if (!con) return;
    con.style.opacity = '0';
    setTimeout(function () {
        if (con) con.style.display = "none";
    }, 300);
}

function loadon() {
    if (!con) return;
    con.style.display = "flex";
    setTimeout(function () {
        if (con) con.style.opacity = '1';
    }, 10);
}

window.onload = function () {
    loadon();
    setTimeout(loadoff, 1000);
};

// ===== 新增功能：顯示/隱藏密碼 + 光束追蹤 =====
document.addEventListener('DOMContentLoaded', function () {
    const eye = document.getElementById('eyeball');
    const beam = document.getElementById('beam');
    const passwordInput = document.getElementById('mm');
    const passwordContainer = document.querySelector('.password-container');

    // 調整眼睛按鈕位置
    function adjustEyePosition() {
        if (!passwordContainer || !passwordInput) return;
        const rect = passwordInput.getBoundingClientRect();
        const containerRect = passwordContainer.getBoundingClientRect();
        const rightPos = containerRect.right - rect.right + 15;
        if (eye) eye.style.right = Math.max(10, rightPos) + 'px';
    }

    if (eye && passwordInput) {
        window.addEventListener('resize', adjustEyePosition);
        adjustEyePosition();

        eye.addEventListener('click', function (e) {
            e.preventDefault();
            document.body.classList.toggle('show-password');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            adjustEyePosition();
        });
    }

    // 光束追蹤滑鼠
    document.documentElement.addEventListener('mousemove', function (e) {
        if (!beam || !document.body.classList.contains('show-password')) return;
        const rect = beam.getBoundingClientRect();
        const mouseX = rect.right + (rect.width / 2);
        const mouseY = rect.top + (rect.height / 2);
        const rad = Math.atan2(mouseX - e.pageX, mouseY - e.pageY);
        const degrees = (rad * (20 / Math.PI) * -1) - 350;
        document.documentElement.style.setProperty('--beamDegrees', `${degrees}deg`);
    });

    // ===== 新增：綁定訪客登入按鈕 =====
    const guestBtn = document.getElementById('ykbt');
    if (guestBtn) {
        guestBtn.addEventListener('click', function (e) {
            e.preventDefault();
            guestLogin();
        });
    }

    // ===== 新增：綁定表單提交 =====
    const loginForm = document.getElementById('loginForm');  // ← 用正確的 ID
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();  // 阻止預設提交
            login();             // 呼叫登入函數
        });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();  // 阻止預設提交
            register();          // 呼叫註冊函數
        });
    }
});

// ===== 新功能：登入主函數（呼叫 API）=====
async function login() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm && loginForm.style.display === 'none') {
        console.log('⚠️ loginForm 是隱藏的，不執行登入');
        return false;
    }
    const zh = document.getElementById('zh');
    const mm = document.getElementById('mm');
    const username = zh ? zh.value.trim() : '';
    const password = mm ? mm.value : '';

    // 基礎驗證
    if (!username || !password) {
        showFeedback('帳號或密碼不可為空', 'error');
        triggerFaultEffect();
        return false;
    }

    // 顯示載入狀態
    const submitBtn = document.getElementById('sub');
    const originalText = submitBtn ? submitBtn.value : '';

    if (submitBtn) {
        submitBtn.value = '登入中...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // 登入成功：儲存使用者資訊
            localStorage.setItem('user', JSON.stringify(result.user));

            showFeedback('登入成功！', 'success');

            // 1 秒後跳轉
            setTimeout(() => {
                window.location.href = './me.html';
            }, 1000);
            return true;
        } else {
            showFeedback(result.error || '帳號或密碼錯誤', 'error');
            triggerFaultEffect();
            return false;
        }
    } catch (err) {
        console.error('Login error:', err);
        showFeedback('網路錯誤，請重試', 'error');
        triggerFaultEffect();
        return false;
    } finally {
        if (submitBtn) {
            submitBtn.value = originalText;
            submitBtn.disabled = false;
        }
    }
}

// ===== 新功能：訪客登入 =====
async function guestLogin() {
    const guestBtn = document.getElementById('ykbt');
    if (!guestBtn) return;

    const originalText = guestBtn.value;
    guestBtn.value = '登入中...';
    guestBtn.disabled = true;

    try {
        console.log('📡 Sending guest login request...');

        const response = await fetch('/api/auth/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('📥 Response status:', response.status);

        const result = await response.json();
        console.log('📥 Response data:', result);

        if (response.ok && result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            console.log('✅ Guest login successful, redirecting...');
            window.location.href = './me.html';
        } else {
            console.error('❌ Guest login failed:', result.error);
            showFeedback(result.error || '訪客登入失敗', 'error');
        }
    } catch (err) {
        console.error('❌ Guest login error:', err);
        showFeedback('訪客登入失敗', 'error');
    } finally {
        guestBtn.value = originalText;
        guestBtn.disabled = false;
    }
}

// ===== 輔助功能：顯示回饋訊息 =====
function showFeedback(message, type = 'info') {
    console.log(`[${type}] ${message}`);

    // 可替換為自訂 UI，這裡先用 alert
    if (type === 'error') {
        alert('❌ ' + message);
    } else if (type === 'success') {
        alert('✅ ' + message);
    }
}

// ===== 輔助功能：觸發故障效果 =====
function triggerFaultEffect() {
    // 如果同步器存在且未在動畫中，觸發故障效果
    if (typeof synchronizer !== 'undefined' && !synchronizer.isFaulting) {
        synchronizer.triggerFault();
    }
}

async function register() {
    // 🔍 檢查註冊表單是否可見
    const registerForm = document.getElementById('registerForm');
    if (registerForm && registerForm.style.display === 'none') {
        console.log('⚠️ registerForm 是隱藏的，不執行註冊');
        return false;
    }

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    // 基礎驗證
    if (!username || !password) {
        showFeedback('帳號與密碼為必填', 'error');
        triggerFaultEffect();
        return false;
    }
    if (username.length < 3) {
        showFeedback('帳號至少 3 個字元', 'error');
        triggerFaultEffect();
        return false;
    }
    if (password.length < 6) {
        showFeedback('密碼至少 6 個字元', 'error');
        triggerFaultEffect();
        return false;
    }
    if (password !== confirm) {
        showFeedback('兩次密碼不一致', 'error');
        triggerFaultEffect();
        return false;
    }

    // 顯示載入狀態
    const regBtn = document.getElementById('regSub');
    const originalText = regBtn ? regBtn.value : '';
    if (regBtn) {
        regBtn.value = '註冊中...';
        regBtn.disabled = true;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showFeedback('✅ 註冊成功！請登入', 'success');

            // 1.5 秒後自動切換回登入模式並填入帳號
            setTimeout(() => {
                const toggleLogin = document.getElementById('toggleLogin');
                if (toggleLogin) toggleLogin.click();

                const zh = document.getElementById('zh');
                if (zh) zh.value = username;
                const mm = document.getElementById('mm');
                if (mm) mm.focus();
            }, 1500);
            return true;
        } else {
            showFeedback(result.error || '註冊失敗', 'error');
            triggerFaultEffect();
            return false;
        }
    } catch (err) {
        console.error('Register error:', err);
        showFeedback('網路錯誤，請重試', 'error');
        triggerFaultEffect();
        return false;
    } finally {
        if (regBtn) {
            regBtn.value = originalText;
            regBtn.disabled = false;
        }
    }
}