// PageTransition 模块（ 可复用转场动画）
const PageTransition = (function () {
    const STORAGE_KEY = 'pt_incoming';
    let isTransitioning = false;

    // 初始化：绑定所有带 data-transition 的链接
    function init() {
        // 1. 播放入场动画（如果标记存在）
        if (sessionStorage.getItem(STORAGE_KEY)) {
            playEnterAnimation();
            sessionStorage.removeItem(STORAGE_KEY);
        }

        // 2. 绑定点击事件（支持动态添加的链接）
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-transition]');
            if (!link || !link.href) return;

            e.preventDefault();
            const url = link.href;
            if (isTransitioning) return;
            
            // 👇 新增：判斷是否導向當前頁面且在導覽列內
            const nav = document.getElementById('hbnav-nav');
            const isNavLink = nav && nav.contains(link);
            const isSamePage = url === window.location.href || 
                              url.replace(/\/$/, '') === window.location.href.replace(/\/$/, '');
            
            if (isSamePage && isNavLink) {
                triggerShakeAnimation(nav);
                return;
            }

            triggerExitAnimation(url);
        });
    }

    function triggerExitAnimation(url) {
        if (isTransitioning) return;
        isTransitioning = true;

        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        gsap.set(overlay, { x: '-100%', opacity: 1 });
        gsap.to(overlay, {
            x: '0%',
            duration: 0.8,
            ease: "cubic-bezier(1, 0, 0.07, 1)",
            onComplete: () => {
                // 👇 关键：完全覆盖后，移除圆角，变成完整矩形
                overlay.style.borderTopRightRadius = '0';
                overlay.style.borderBottomRightRadius = '0';

                setTimeout(() => {
                    sessionStorage.setItem(STORAGE_KEY, 'true');
                    window.location.href = url;
                }, 300);
            }
        });
    }

    // 播放入场动画
    function playEnterAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        // 初始无圆角（因为要全屏覆盖）
        overlay.style.borderTopRightRadius = '0';
        overlay.style.borderBottomRightRadius = '0';
        document.body.appendChild(overlay);
        
        gsap.set(overlay, { x: '0%', opacity: 1 });

        // 先恢复圆角，再滑出（可选）
        gsap.set(overlay, {
            borderTopRightRadius: '100px',
            borderBottomRightRadius: '100px'
        });

        gsap.to(overlay, {
            x: '-100%',
            duration: 0.8,
            ease: "cubic-bezier(1, 0, 0.07, 1)",
            onComplete: () => {
                overlay.remove();
            }
        });
    }
    
    // 👇 新增：導覽列晃動動畫
    function triggerShakeAnimation(element) {
        if (!element) return;
        
        // 獲取按鈕判斷是否展開
        const toggleBtn = document.getElementById('hbnav-toggle-btn');
        if (!toggleBtn) return;
        
        // 檢查導覽列是否處於展開狀態
        const btnStyle = window.getComputedStyle(toggleBtn);
        const btnBottom = parseFloat(btnStyle.bottom);
        const isOpen = btnBottom > 100; // 130px 表示展開
        
        if (!isOpen) return;
        
        // 重置任何現有動畫
        gsap.killTweensOf(element);
        
        // 播放晃動動畫
        gsap.fromTo(element, 
            { 
                x: 0, 
                rotation: 0,
                ease: "power2.out"
            },
            { 
                keyframes: [
                    { x: 8, rotation: 3, duration: 0.08 },
                    { x: -8, rotation: -3, duration: 0.08 },
                    { x: 5, rotation: 2, duration: 0.07 },
                    { x: -3, rotation: -1, duration: 0.07 },
                    { x: 0, rotation: 0, duration: 0.05 }
                ],
                onComplete: () => {
                    gsap.set(element, { clearProps: "all" });
                }
            }
        );
    }

    return { init };
})();

// <style>
//     .page-transition-overlay {
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: #e4e9f5;
//         z-index: 99999;
//         pointer-events: none;
//         border-bottom-right-radius: 100px;
//         border-top-right-radius: 100px;
//         pointer-events: none;
//         transition: border-radius 0.3s ease;
//     }
// </style>

//     <script src="./js/gsap.js"></script>
// <script src="./page-transition.js"></script>