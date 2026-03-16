// hbnav.js - 950px 專用無抖動版（響應式高度修正 + 斷點區分預設 hover）
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
        const BREAKPOINT = 950; // 🔑 斷點設定

        gsap.set(nav, { y: 150 });

        // 🔧 初始化時：僅非響應式預設 active
        if (window.innerWidth > BREAKPOINT && items[0]) {
            items[0].classList.add('active');
            if (overlay) overlay.style.left = NAV_PADDING + 'px';
        } else if (overlay) {
            overlay.style.left = '-9999px'; // 響應式時隱藏 overlay
        }

        // 🔑 判斷是否為非響應式
        function isDesktop() {
            return window.innerWidth > BREAKPOINT;
        }

        // 🔑 同步 active 狀態（供 resize 使用）
        function syncActiveState() {
            if (!isOpen) return;
            
            if (isDesktop() && items[0]) {
                // 切回桌面版：若無 active 則預設第一個
                const hasActive = Array.from(items).some(item => item.classList.contains('active'));
                if (!hasActive) {
                    items[0].classList.add('active');
                    if (overlay) {
                        overlay.style.left = NAV_PADDING + 'px';
                        overlay.style.opacity = '1';
                    }
                }
            } else {
                // 切換到響應式：移除預設 active，隱藏 overlay
                items.forEach(el => el.classList.remove('active'));
                if (overlay) {
                    overlay.style.left = '-9999px';
                    overlay.style.opacity = '0';
                }
            }
        }

        function toggleNav() {
            if (isAnimating) return;
            isAnimating = true;

            const isMobile = window.innerWidth <= 576;
            const isSuperSmall = window.innerWidth <= 375;
            
            const expandBottom = isSuperSmall ? '90px'
                             : isMobile ? '100px'
                             : '130px';
            
            const collapseBottom = isMobile ? '15px' : '30px';

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

                // 🔧 僅非響應式時預設 active + 顯示 overlay
                if (isDesktop() && items[0]) {
                    setTimeout(() => {
                        items[0].classList.add('active');
                        if (overlay) {
                            overlay.style.left = NAV_PADDING + 'px';
                            overlay.style.opacity = '1';
                        }
                    }, 100);
                }

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
                
                // 關閉時：響應式模式下隱藏 overlay
                if (!isDesktop() && overlay) {
                    overlay.style.left = '-9999px';
                    overlay.style.opacity = '0';
                }
                
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
                
                if (overlay) {
                    overlay.style.left = (NAV_PADDING + index * ITEM_WIDTH) + 'px';
                    overlay.style.opacity = '1'; // 確保可見
                }
            });
        });

        document.body.addEventListener('click', (e) => {
            if (nav.contains(e.target) || toggleBtn.contains(e.target)) return;
            if (isOpen) toggleNav();
        });

        // 🔑 監聽 resize：斷點切換時同步狀態
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                syncActiveState();
                
                // 若處於開啟狀態且為響應式，重新計算 overlay 位置（防抖）
                if (isOpen) {
                    const activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
                    if (activeIndex >= 0 && overlay) {
                        overlay.style.left = (NAV_PADDING + activeIndex * ITEM_WIDTH) + 'px';
                    }
                }
            }, 150);
        });
    }
})();

// <script src="./js/hbnav.js"></script>
// <script src="./js/gsap.js"></script>