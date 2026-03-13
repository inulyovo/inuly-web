const VerticalPageTransition = (function () {
    const STORAGE_KEY_VT = 'vpt_incoming';
    const OVERLAY_CLASS_VT = 'vertical-transition-overlay';
    let isTransitioningVT = false;

    function init() {
        console.log('[VPT] Module initialized');

        if (sessionStorage.getItem(STORAGE_KEY_VT)) {
            console.log('[VPT] Playing ENTER animation');
            playEnterAnimationVT();
            sessionStorage.removeItem(STORAGE_KEY_VT);
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-vertical-transition]');
            if (!link || !link.href) return;

            e.preventDefault();
            const url = link.href;
            if (isTransitioningVT) {
                console.warn('[VPT] Already transitioning, ignored');
                return;
            }

            const nav = document.getElementById('hbnav-nav');
            const isNavLink = nav && nav.contains(link);
            const isSamePage = url === window.location.href ||
                url.replace(/\/$/, '') === window.location.href.replace(/\/$/, '');

            if (isSamePage && isNavLink) {
                console.log('[VPT] Triggering shake');
                triggerShakeAnimationVT(nav);
                return;
            }

            console.log('[VPT] Triggering EXIT animation to:', url);
            triggerExitAnimationVT(url);
        });
    }

    function triggerExitAnimationVT(url) {
        isTransitioningVT = true;

        const overlay = document.createElement('div');
        overlay.className = OVERLAY_CLASS_VT;
        overlay.style.border = '2px solid #e4e9f5bb';
        overlay.style.zIndex = '999999';
        overlay.textContent = ''; // 文字辅助定位
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';
        overlay.style.lineHeight = '100vh';
        overlay.style.fontSize = '20px';

        document.body.appendChild(overlay);
        console.log('[VPT] Exit overlay created', overlay);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight; // 圆心在底部
        const radius = Math.hypot(centerX, window.innerHeight) * 1.2; // 覆盖全屏

        gsap.set(overlay, {
            position: 'fixed',
            top: centerY,
            left: centerX,
            width: 0,
            height: 0,
            borderRadius: '50%',
            backgroundColor: '#e4e9f5bb',
            'backdrop-filter': 'blur(5px)',              
            '-webkit-backdrop-filter': 'blur(5px)',
            transform: 'translate(-50%, -50%)',
            opacity: 1
        });

        gsap.to(overlay, {
            width: radius * 2,
            height: radius * 2,
            duration: 1.2, // 放慢便于观察
            ease: "power2.out",
            onComplete: () => {
                console.log('[VPT] Exit animation done, navigating...');
                sessionStorage.setItem(STORAGE_KEY_VT, 'true');
                window.location.href = url;
            }
        });
    }

    function playEnterAnimationVT() {
        const overlay = document.createElement('div');
        overlay.className = OVERLAY_CLASS_VT;
        overlay.style.border = '2px solid #e4e9f5bb';
        overlay.style.zIndex = '999999';
        overlay.textContent = '';
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';
        overlay.style.lineHeight = '100vh';
        overlay.style.fontSize = '20px';

        document.body.appendChild(overlay);
        console.log('[VPT] Enter overlay created', overlay);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight;
        const radius = Math.hypot(centerX, window.innerHeight) * 1.2;

        gsap.set(overlay, {
            position: 'fixed',
            top: centerY,
            left: centerX,
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            backgroundColor: '#e4e9f5bb',
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
                console.log('[VPT] Enter animation finished');
            }
        });
    }

    function triggerShakeAnimationVT(element) {
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