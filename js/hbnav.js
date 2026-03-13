// hbnav.js - 950px 專用無抖動版
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
        const ITEM_WIDTH = 160; // 每個項目寬度
        const NAV_PADDING = 75; // 左側邊距 (950-800)/2

        // 初始化位置
        gsap.set(nav, { y: 150 });

        // 設置初始 active 項
        if (items[0]) {
            items[0].classList.add('active');
            overlay.style.left = NAV_PADDING + 'px'; // 初始位置 = 邊距
        }

        function toggleNav() {
            if (isAnimating) return;
            isAnimating = true;

            if (!isOpen) {
                gsap.to(nav, {
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                gsap.to(toggleBtn, {
                    bottom: '130px',
                    duration: 0.55,
                    ease: 'power2.out'
                });
                gsap.to(toggleBtn.querySelector('svg'), {
                    rotation: 180,
                    duration: 0.55,
                    ease: 'power2.inOut'
                });

                // 展開後重置位置
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
                    bottom: '20px',
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

        // 關鍵修復：精準位置計算
        items.forEach((item, index) => {
            item.addEventListener('mouseenter', (e) => {
                e.stopPropagation();

                if (!isOpen || isAnimating) return;

                // 移除所有 active
                items.forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                // 精準計算位置：邊距 + 项目索引×宽度
                overlay.style.left = (NAV_PADDING + index * ITEM_WIDTH) + 'px';
            });
        });

        // 點擊外部關閉
        document.body.addEventListener('click', (e) => {
            if (nav.contains(e.target) || toggleBtn.contains(e.target)) return;
            if (isOpen) toggleNav();
        });

        // 視窗大小變化時重置
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