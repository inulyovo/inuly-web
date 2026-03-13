// CircularLeftPageTransition - 从左侧中心圆形扩散（使用 data-transition）
const CircularLeftPageTransition = (function () {
    const STORAGE_KEY_CL = 'clpt_incoming';
    const OVERLAY_CLASS_CL = 'circular-left-transition-overlay';
    let isTransitioningCL = false;

    function init() {
        console.log('[CLPT] Module initialized');

        if (sessionStorage.getItem(STORAGE_KEY_CL)) {
            console.log('[CLPT] Playing ENTER animation');
            playEnterAnimationCL();
            sessionStorage.removeItem(STORAGE_KEY_CL);
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-transition]');
            if (!link || !link.href) return;

            e.preventDefault();
            const url = link.href;
            if (isTransitioningCL) {
                console.warn('[CLPT] Already transitioning, ignored');
                return;
            }

            const nav = document.getElementById('hbnav-nav');
            const isNavLink = nav && nav.contains(link);
            const isSamePage = url === window.location.href ||
                url.replace(/\/$/, '') === window.location.href.replace(/\/$/, '');

            if (isSamePage && isNavLink) {
                console.log('[CLPT] Triggering shake');
                triggerShakeAnimationCL(nav);
                return;
            }

            console.log('[CLPT] Triggering EXIT animation to:', url);
            triggerExitAnimationCL(url);
        });
    }

    function triggerExitAnimationCL(url) {
        isTransitioningCL = true;

        const overlay = document.createElement('div');
        overlay.className = OVERLAY_CLASS_CL;
        overlay.style.border = '2px solid #0a0a0acc';
        overlay.style.zIndex = '999999';
        overlay.textContent = '';
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';
        overlay.style.lineHeight = '100vh';
        overlay.style.fontSize = '20px';

        document.body.appendChild(overlay);
        console.log('[CLPT] Exit overlay created', overlay);

        // 圆心：左侧中心 (x=0, y=50%)
        const centerX = 0;
        const centerY = window.innerHeight / 2;
        // 半径需覆盖到右上角或右下角
        const radius = Math.hypot(window.innerWidth, centerY) * 1.1;

        gsap.set(overlay, {
            position: 'fixed',
            top: centerY,
            left: centerX,
            width: 0,
            height: 0,
            minWidth: '1px',
            minHeight: '1px',
            borderRadius: '50%',
            backgroundColor: '#0a0a0acc',
            'backdrop-filter': 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
            transform: 'translate(-50%, -50%)', // 以 (left, top) 为圆心
            opacity: 1
        });

        gsap.to(overlay, {
            width: radius * 2,
            height: radius * 2,
            duration: 1.2,
            ease: "power2.out",
            onComplete: () => {
                console.log('[CLPT] Exit animation done, navigating...');
                sessionStorage.setItem(STORAGE_KEY_CL, 'true');
                window.location.href = url;
            }
        });
    }

    function playEnterAnimationCL() {
        const overlay = document.createElement('div');
        overlay.className = OVERLAY_CLASS_CL;
        overlay.style.border = '2px solid #0a0a0acc';
        overlay.style.zIndex = '999999';
        overlay.textContent = '';
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';
        overlay.style.lineHeight = '100vh';
        overlay.style.fontSize = '20px';

        document.body.appendChild(overlay);
        console.log('[CLPT] Enter overlay created', overlay);

        const centerX = 0;
        const centerY = window.innerHeight / 2;
        const radius = Math.hypot(window.innerWidth, centerY) * 1.1;

        gsap.set(overlay, {
            position: 'fixed',
            top: centerY,
            left: centerX,
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            backgroundColor: '#0a0a0acc',
            'backdrop-filter': 'blur(5px)',
            '-webkit-backdrop-filter': 'blur(5px)',
            transform: 'translate(-50%, -50%)',
            opacity: 1
        });

        gsap.to(overlay, {
            width: 0,
            height: 0,
            duration: 1.2,
            ease: "power2.out",
            onComplete: () => {
                overlay.remove();
                console.log('[CLPT] Enter animation finished');
            }
        });
    }

    function triggerShakeAnimationCL(element) {
        if (!element) return;
        const toggleBtn = document.getElementById('hbnav-toggle-btn');
        if (!toggleBtn) return;

        const btnStyle = window.getComputedStyle(toggleBtn);
        const btnBottom = parseFloat(btnStyle.bottom);
        const isOpen = btnBottom > 100;
        if (!isOpen) return;

        gsap.killTweensOf(element);
        gsap.fromTo(element,
            { x: 0, rotation: 0 },
            {
                keyframes: [
                    { x: 8, rotation: 3, duration: 0.08 },
                    { x: -8, rotation: -3, duration: 0.08 },
                    { x: 5, rotation: 2, duration: 0.07 },
                    { x: -3, rotation: -1, duration: 0.07 },
                    { x: 0, rotation: 0, duration: 0.05 }
                ],
                ease: "power2.out"
            }
        );
    }

    return { init };
})();