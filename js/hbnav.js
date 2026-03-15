// hbnav.js - 950px 專用無抖動版（響應式高度修正）
(function () {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHbNav);
    } else {
        initHbNav();
    }

    function initHbNav() {
        const nav = document.getElementById('hbnav-nav');
        const toggleBtn = document.getElementById('hbnav-toggle-btn');

        if (!nav || !toggleBtn) return;

        const overlay = nav.querySelector('.hbnav-overlay');
        const items = nav.querySelectorAll('.hbnav-nav-item, .hbnav-nav a.hbnav-nav-item');

        let isOpen = false;
        let isAnimating = false;
        const ITEM_WIDTH = 160;
        const NAV_PADDING = 75;

        gsap.set(nav, { y: 150 });

        if (items[0]) {
            items[0].classList.add('active');
            overlay.style.left = NAV_PADDING + 'px';
        }

        function toggleNav() {
            if (isAnimating) return;
            isAnimating = true;

            // 🔑 響應式高度設定
            const isMobile = window.innerWidth <= 576;
            const isSuperSmall = window.innerWidth <= 375;
            
            const expandBottom = isSuperSmall ? '90px'
                             : isMobile ? '100px'
                             : '130px';
            
            const collapseBottom = isMobile ? '15px' : '20px';

            if (!isOpen) {
                gsap.to(nav, {
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                gsap.to(toggleBtn, {
                    bottom: expandBottom,
                    duration: 0.55,
                    ease: 'power2.out'
                });
                gsap.to(toggleBtn.querySelector('svg'), {
                    rotation: 180,
                    duration: 0.55,
                    ease: 'power2.inOut'
                });

                setTimeout(() => {
                    const activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
                    if (activeIndex >= 0) {
                        overlay.style.left = (NAV_PADDING + activeIndex * ITEM_WIDTH) + 'px';
                    }
                }, 100);

                isOpen = true;
                isAnimating = false;
            } else {
                gsap.to(nav, {
                    y: 150,
                    duration: 0.5,
                    ease: 'power2.in'
                });
                gsap.to(toggleBtn, {
                    bottom: collapseBottom,
                    duration: 0.55,
                    ease: 'power2.in'
                });
                gsap.to(toggleBtn.querySelector('svg'), {
                    rotation: 0,
                    duration: 0.55,
                    ease: 'power2.inOut'
                });
                isOpen = false;
                isAnimating = false;
            }
        }

        toggleBtn.addEventListener('click', toggleNav);

        items.forEach((item, index) => {
            item.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                if (!isOpen || isAnimating) return;
                items.forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                overlay.style.left = (NAV_PADDING + index * ITEM_WIDTH) + 'px';
            });
        });

        document.body.addEventListener('click', (e) => {
            if (nav.contains(e.target) || toggleBtn.contains(e.target)) return;
            if (isOpen) toggleNav();
        });

        window.addEventListener('resize', () => {
            if (isOpen) {
                const activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
                if (activeIndex >= 0) {
                    overlay.style.left = (NAV_PADDING + activeIndex * ITEM_WIDTH) + 'px';
                }
            }
        });
    }
})();

// <script src="./js/hbnav.js"></script>
// <script src="./js/gsap.js"></script>