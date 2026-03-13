// ===== 原有功能：背景視差效果 =====
var back = document.getElementById('back');
window.onmousemove = function(event) {
    var x = -event.clientX / 20;
    var y = -event.clientY / 30;
    back.style.backgroundPositionX = x + "px";
    back.style.backgroundPositionY = y + "px";
}

// ===== 原有功能：登入驗證 =====
var zh = document.getElementById('zh');
var mm = document.getElementById('mm');
function login() {
    if (zh.value == "" || mm.value == "") {
        alert("帳號或密碼不可為空");
        return false;
    } else if (zh.value != "123" || mm.value != "123456") {
        alert("帳號或密碼錯誤(可以選擇遊客登入)");
        return false;
    }
    return true;
}

// ===== 原有功能：載入動畫 =====
var con = document.getElementById('con');
function loadoff() {
    // 添加淡出效果
    con.style.opacity = '0';
    setTimeout(function() {
        con.style.display = "none";
    }, 300);
}

function loadon() {
    con.style.display = "flex";
    // 確保淡入效果
    setTimeout(function() {
        con.style.opacity = '1';
    }, 10);
}

window.onload = function() {
    loadon();
    setTimeout(loadoff, 1000);
};

// ===== 新增功能：顯示/隱藏密碼 =====
document.addEventListener('DOMContentLoaded', function() {
    const eye = document.getElementById('eyeball');
    const beam = document.getElementById('beam');
    const passwordInput = document.getElementById('mm');
    const passwordContainer = document.querySelector('.password-container');
    
    if (eye && passwordInput) {
        // 調整眼睛按鈕位置
        function adjustEyePosition() {
            if (!passwordContainer) return;
            
            const rect = passwordInput.getBoundingClientRect();
            const containerRect = passwordContainer.getBoundingClientRect();
            const rightPos = containerRect.right - rect.right + 15;
            
            eye.style.right = Math.max(10, rightPos) + 'px';
        }
        
        window.addEventListener('resize', adjustEyePosition);
        adjustEyePosition();
        
        eye.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('show-password');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            adjustEyePosition();
        });
    }
    
    // ===== 新增功能：光束追蹤滑鼠 =====
    document.documentElement.addEventListener('mousemove', function(e) {
        if (!beam || !document.body.classList.contains('show-password')) return;
        
        const rect = beam.getBoundingClientRect();
        const mouseX = rect.right + (rect.width / 2);
        const mouseY = rect.top + (rect.height / 2);
        
        const rad = Math.atan2(mouseX - e.pageX, mouseY - e.pageY);
        const degrees = (rad * (20 / Math.PI) * -1) - 350;
        
        document.documentElement.style.setProperty('--beamDegrees', `${degrees}deg`);
    });
});