// 塔羅牌抽選功能 - 精確修復版
document.addEventListener('DOMContentLoaded', function () {
    // 等待主要應用初始化完成
    function waitForApp() {
        if (typeof window.carousel !== 'undefined' &&
            document.querySelector('.shell') !== null &&
            document.getElementById('lightbox-img') &&
            document.querySelector('.panel-content')) {
            initDrawFeature();
        } else {
            setTimeout(waitForApp, 100);
        }
    }

    waitForApp();
});

function initDrawFeature() {
    // 檢查必要元素
    const shell = document.querySelector('.shell');
    if (!shell) return;

    // 創建抽選按鈕
    createDrawButton();
    let particleController = null;  // 新增：粒子控制器
    let isDrawing = false;
    let animationQueue = [];


    // 按鈕事件綁定
    const drawButton = document.getElementById('tarot-draw-button');
    if (drawButton) {
        drawButton.addEventListener('click', function () {
            if (!isDrawing) {
                startDrawAnimation();
            }
        });
    }

    // 保存原始 closeLightbox 函數
    const originalCloseLightbox = window.closeLightbox;

    // 重寫 closeLightbox 以確保燈箱狀態正確重置
    window.closeLightbox = function () {
        // 先執行原始關閉功能
        if (typeof originalCloseLightbox === 'function') {
            originalCloseLightbox();
        }

        // 確保抽牌狀態重置
        isDrawing = false;
        window.isDrawing = false;

        // 恢復按鈕
        setTimeout(() => {
            const drawButton = document.getElementById('tarot-draw-button');
            if (drawButton) drawButton.disabled = false;
        }, 300);

        // 關閉燈箱後恢復自動輪播
        if (typeof window.carousel !== 'undefined' && typeof window.carousel.timer === 'function') {
            window.carousel.timer();
        }
    };

    function createDrawButton() {
        // 檢查按鈕是否已經存在
        if (document.getElementById('tarot-draw-button')) return;

        const buttonHTML = `
            <button id="tarot-draw-button">
                <div class="button-glow"></div>
                <div class="button-content">
                    <span class="sparkle"></span>
                    抽選塔羅牌
                    <span class="sparkle"></span>
                </div>
                <div class="button-orb orb-1"></div>
                <div class="button-orb orb-2"></div>
            </button>
        `;

        // 插入按鈕 - 放在輪播容器下方
        const shellBody = document.querySelector('.shell_body');
        if (shellBody) {
            shellBody.insertAdjacentHTML('beforeend', buttonHTML);
        }

        // 添加按鈕樣式
        addDrawButtonStyles();
    }

    function addDrawButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #tarot-draw-button {
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                padding: 16px 45px;
                background: linear-gradient(135deg, #2c0b3a, #1a0626);
                color: #fff;
                border: 2px solid rgba(138, 43, 226, 0.6);
                border-radius: 60px;
                font-size: 22px;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3),
                            0 0 20px rgba(100, 30, 180, 0.4),
                            inset 0 0 15px rgba(74, 144, 226, 0.2);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 100;
                overflow: hidden;
                letter-spacing: 1px;
                position: relative;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }
            
            #tarot-draw-button:hover {
                transform: translateX(-50%) scale(1.05);
                box-shadow: 0 15px 35px rgba(138, 43, 226, 0.5),
                            0 0 25px rgba(100, 30, 180, 0.6),
                            inset 0 0 20px rgba(74, 144, 226, 0.3);
                border-color: rgba(138, 43, 226, 0.9);
            }
            
            #tarot-draw-button:active {
                transform: translateX(-50%) scale(0.98);
            }
            
            #tarot-draw-button:disabled {
                cursor: wait;
                opacity: 0.8;
                transform: translateX(-50%) scale(0.98);
                box-shadow: 0 5px 20px rgba(138, 43, 226, 0.2);
            }
            
            .button-glow {
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.5s ease;
                pointer-events: none;
            }
            
            #tarot-draw-button:hover .button-glow {
                opacity: 1;
            }
            
            .button-content {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .sparkle {
                font-size: 24px;
                display: inline-block;
                animation: twinkle 1.5s infinite alternate;
            }
            
            .sparkle:nth-child(2) {
                animation-delay: 0.5s;
            }
            
            @keyframes twinkle {
                0% { opacity: 0.3; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }
            
            .button-orb {
                position: absolute;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.8);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
                            0 0 20px rgba(138, 43, 226, 0.8);
                opacity: 0.6;
                z-index: 1;
            }
            
            .orb-1 {
                top: 30%;
                left: 10%;
                animation: orbit 4s linear infinite;
            }
            
            .orb-2 {
                bottom: 30%;
                right: 10%;
                animation: orbit 5s reverse infinite;
            }
            
            @keyframes orbit {
                0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
            }
            
            #reversed-indicator {
                position: absolute;
                background: rgba(226, 74, 138, 0.40);
                color: white;
                padding: 8px 20px;
                border-radius: 30px;
                font-size: 18px;
                font-weight: bold;
                z-index: 2000;
                transform: translateX(-59%) translateY(-50%);
                box-shadow: 0 0 20px rgba(226, 74, 138, 0.2),
                            0 0 40px rgba(226, 74, 138, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                pointer-events: none;
                opacity: 0;
                text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
            }
            
            .upright-indicator {
                background: rgba(74, 226, 138, 0.40) !important;
                box-shadow: 0 0 20px rgba(74, 226, 138, 0.2),
                            0 0 40px rgba(74, 226, 138, 0.1) !important;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 20px rgba(226, 74, 138, 0.8); }
                50% { box-shadow: 0 0 30px rgba(226, 74, 138, 1); }
                100% { box-shadow: 0 0 20px rgba(226, 74, 138, 0.8); }
            }
            
            #reversed-indicator.animate {
                animation: pulse 1.5s infinite;
            }
            
            /* 抽牌動畫時的邊框閃爍效果 */
            #lightbox-img.draw-animating {
                position: relative;
                animation: borderFlash 0.6s infinite alternate;
                box-shadow: 0 0 15px rgba(138, 43, 226, 0.7);
            }
            
            @keyframes borderFlash {
                0% { 
                    box-shadow: 0 0 15px rgba(138, 43, 226, 0.7),
                                0 0 25px rgba(255, 215, 0, 0.5);
                }
                100% { 
                    box-shadow: 0 0 20px rgba(138, 43, 226, 0.9),
                                0 0 35px rgba(255, 215, 0, 0.8),
                                0 0 45px rgba(255, 255, 255, 0.7);
                }
            }
            
            @media (max-width: 768px) {
                #tarot-draw-button {
                    bottom: 80px;
                    font-size: 18px;
                    padding: 14px 35px;
                }
                
                .sparkle {
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function stopCarousel() {
        // 停止自動輪播
        clearInterval(window.carouselInterval);

        // 隱藏導航按鈕
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    function restoreCarousel() {
        // 恢復導航按鈕
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }

    function startDrawAnimation() {
        if (isDrawing) return;
        if (typeof gsap !== 'undefined') {
            gsap.fromTo("#tarot-draw-button",
                { scale: 1 },
                { scale: 1.1, duration: 0.25, yoyo: true, repeat: 1 }
            );
        }
        isDrawing = true;
        const drawButton = document.getElementById('tarot-draw-button');
        if (drawButton) {
            drawButton.disabled = true;
        }

        // 停止輪播
        stopCarousel();

        // 清空動畫隊列
        animationQueue.forEach(id => clearTimeout(id));
        animationQueue = [];

        // 獲取所有卡牌數據
        const items = document.querySelectorAll('.item');
        const totalItems = items.length;

        // 隨機選擇目標卡牌 (1到totalItems之間)
        const targetIndex = Math.floor(Math.random() * totalItems) + 1;
        const isReversed = Math.random() > 0.5; // 50% 機率逆位

        // 先打開第一張卡牌的燈箱
        const firstCard = items[0];
        const frontBox = firstCard.querySelector('.front');

        if (!frontBox) {
            isDrawing = false;
            restoreCarousel(); // 恢復輪播
            if (drawButton) drawButton.disabled = false;
            return;
        }

        // 設置抽牌狀態
        window.isDrawing = true;

        // 模擬點擊第一張卡牌打開燈箱
        setTimeout(() => {

            // ⭐ 提前隱藏介紹（關鍵修正）
            const captionContainer = document.getElementById('caption-container');
            if (captionContainer) {
                captionContainer.style.visibility = 'hidden';
                captionContainer.style.opacity = '0';
            }

            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            frontBox.dispatchEvent(clickEvent);

            // 等待燈箱完全打開後開始抽牌
            requestAnimationFrame(() => {
                beginCardRotation(items, targetIndex, isReversed);
            });

        }, 200);
    }

    function beginCardRotation(items, targetIndex, isReversed) {
        const captionContainer = document.getElementById('caption-container');
        if (captionContainer) {
            captionContainer.style.visibility = 'hidden';
        }
        const lightboxImg = document.getElementById('lightbox-img');
        showTarotFlash();
        if (!lightboxImg) {
            finishDraw(items, targetIndex, isReversed);
            return;
        }
        particleController = spawnTarotParticles();
        const lightboxContainer = document.querySelector('.lightbox-container');
        const particleContainer = document.getElementById('tarot-particle-container');
        if (lightboxContainer && particleContainer) {
            lightboxContainer.appendChild(particleContainer);
        }
        if (captionContainer) {
            captionContainer.style.opacity = '0';
        }

        // 開始抽牌動畫時添加閃爍邊框
        lightboxImg.classList.add('draw-animating');

        let currentIndex = 1;
        const totalItems = items.length;

        // 調整抽牌速度：修改這裡的值（毫秒）
        const totalDuration = 10000; // 10秒完成整個動畫
        const displayCount = totalItems + 5; // 一圈 + 5張額外卡牌

        // 計算所有需要展示的卡牌索引
        const allIndexes = [];

        // 生成序列
        for (let i = 0; i < displayCount; i++) {
            const index = (i % totalItems) + 1;
            allIndexes.push(index);

            // 確保最後一張是目標卡牌
            if (i === displayCount - 1) {
                allIndexes[i] = targetIndex;
            }
        }

        // 計算每個卡牌的顯示時間
        const interval = totalDuration / displayCount;

        // 執行所有卡牌輪播
        allIndexes.forEach((index, i) => {
            const delay = i * interval;

            const timeoutId = setTimeout(() => {
                if (!window.isDrawing) return;

                const cardNumber = index.toString().padStart(2, '0');
                const imgUrl = `./img-2/${cardNumber}.jpg`;

                // 更新燈箱圖片
                lightboxImg.src = imgUrl;
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'rotate(0deg)';

                // 如果是最後一張，完成抽牌
                if (i === allIndexes.length - 1) {
                    setTimeout(() => {
                        finishDraw(items, targetIndex, isReversed);
                    }, 200);
                }

            }, delay);

            animationQueue.push(timeoutId);
        });

        // 清理函數
        function cleanup() {
            animationQueue.forEach(id => clearTimeout(id));
            animationQueue = [];
            // 移除邊框閃爍
            if (lightboxImg) lightboxImg.classList.remove('draw-animating');
            // 恢復輪播
            restoreCarousel();
        }

        // 如果用戶在抽牌過程中關閉燈箱
        const currentCloseLightbox = window.closeLightbox;
        window.closeLightbox = function () {
            if (window.isDrawing) {
                window.isDrawing = false;
                isDrawing = false;
                if (particleController && typeof particleController.stop === 'function') {
                    particleController.stop();
                    particleController = null;
                }
                cleanup();
                // 恢復原始函數
                window.closeLightbox = currentCloseLightbox;
            }
            currentCloseLightbox();
        };
    }

    function finishDraw(items, finalIndex, isReversed) {
        window.isDrawing = false;
        isDrawing = false;
        if (particleController && typeof particleController.stop === 'function') {
            particleController.stop();
            particleController = null;
        }
        const lightboxImg = document.getElementById('lightbox-img');

        // 移除邊框閃爍
        if (lightboxImg) {
            lightboxImg.classList.remove('draw-animating');
        }

        // 設置燈箱狀態 - 確保與主應用同步
        const cardIndex = finalIndex - 1;
        window.lightboxCurrentIndex = cardIndex;

        // 確保 cardOrientations 初始化
        window.cardOrientations = window.cardOrientations || [];
        while (window.cardOrientations.length < items.length) {
            window.cardOrientations.push(true); // 預設全部為正位
        }

        // 🔑 關鍵修復1: 設置當前卡牌的正確狀態
        // 正位 = true, 逆位 = false
        const isUpright = !isReversed;
        window.cardOrientations[cardIndex] = isUpright;

        // 關鍵增強：同步輪播位置
        if (window.carousel) {
            window.carousel.move(finalIndex);
            window.carousel.setCurrentIndex(finalIndex);
        }

        // 更新燈箱圖片
        const cardNumber = finalIndex.toString().padStart(2, '0');
        const finalImgUrl = `./img-2/${cardNumber}.jpg`;

        if (lightboxImg) {
            // 確保圖像加載完成後再進行下一步
            const tempImg = new Image();
            tempImg.onload = function () {
                lightboxImg.src = finalImgUrl;

                // 設置旋轉狀態
                setTimeout(() => {
                    if (!isUpright) {
                        gsap.to(lightboxImg, {
                            rotation: 180,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                    } else {
                        gsap.to(lightboxImg, {
                            rotation: 0,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                    }

                    // 更新方向指示器
                    const orientationIndicator = document.getElementById('orientation-indicator');
                    if (orientationIndicator) {
                        orientationIndicator.classList.remove('upright', 'reversed');
                        orientationIndicator.classList.add(isUpright ? 'upright' : 'reversed');
                    }

                    // 恢復面板容器可見性
                    setTimeout(() => {
                        const captionContainer = document.getElementById('caption-container');
                        if (captionContainer) {
                            captionContainer.style.visibility = 'visible';
                        }
                    }, 1000);

                    // 呼叫主應用更新函數
                    setTimeout(() => {
                        if (typeof window.updateLightboxContent === 'function') {
                            window.updateLightboxContent(cardIndex, isUpright);
                        }
                    }, 400);

                    // 關鍵新增：抽完後快速按兩次R的效果
                    setTimeout(() => {
                        // 第一次按R
                        const rEvent1 = new KeyboardEvent('keydown', {
                            key: 'r',
                            bubbles: true,
                            cancelable: true
                        });
                        document.dispatchEvent(rEvent1);

                        // 100毫秒後第二次按R
                        setTimeout(() => {
                            const rEvent2 = new KeyboardEvent('keydown', {
                                key: 'r',
                                bubbles: true,
                                cancelable: true
                            });
                            document.dispatchEvent(rEvent2);

                            // 顯示指示器
                            setTimeout(() => {
                                showOrientationIndicator(isUpright ? 'upright' : 'reversed');
                            }, 200);
                        }, 100);
                    }, 500);
                }, 100);
            };
            tempImg.src = finalImgUrl;
        }
        // 恢復輪播功能
        restoreCarousel();
        setTimeout(showTarotMessage, 1200);
        // 恢復按鈕
        setTimeout(() => {
            const drawButton = document.getElementById('tarot-draw-button');
            if (drawButton) drawButton.disabled = false;
        }, 800);
    }

    function showOrientationIndicator(orientation) {
        // 創建或更新指示器
        let indicator = document.getElementById('reversed-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'reversed-indicator';
            document.body.appendChild(indicator);
        }

        // 設置指示器內容和樣式
        if (orientation === 'upright') {
            indicator.innerHTML = '正 位';
            indicator.className = 'upright-indicator'; // 使用專用類
        } else {
            indicator.innerHTML = '逆 位';
            indicator.className = ''; // 移除正位類
        }

        // 禁用 CSS 動畫避免衝突
        indicator.style.animation = 'none';

        // 定位在燈箱中央偏上
        gsap.set(indicator, {
            left: '50%',
            top: '7%',
            x: '-50%',
            y: '-50%',
            opacity: 0.2
        });

        // 顯示動畫
        gsap.to(indicator, {
            opacity: 1,
            scale: 1.2,
            duration: 0.4,
            ease: "back.out(1.7)",
            onComplete: function () {
                // 2秒後淡出
                setTimeout(() => {
                    gsap.to(indicator, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.4,
                        ease: "power2.in",
                        onComplete: function () {
                            // 動畫完成後移除元素
                            if (indicator.parentNode) {
                                indicator.parentNode.removeChild(indicator);
                            }
                        }
                    });
                }, 2000);
            }
        });
    }

    // GSAP 回退機制
    if (typeof gsap === 'undefined') {
        console.warn('GSAP未加載，將使用基本動畫');

        window.gsap = {
            to: function (element, config) {
                if (!element) return;

                if (Array.isArray(element)) {
                    element.forEach(el => {
                        applyAnimation(el, config);
                    });
                } else {
                    applyAnimation(element, config);
                }

                if (config.onComplete) {
                    setTimeout(config.onComplete, config.duration ? config.duration * 1000 : 300);
                }

                return {
                    kill: function () { }
                };
            },
            fromTo: function (element, fromConfig, toConfig) {
                if (!element) return;

                // 先應用 from 狀態
                for (let prop in fromConfig) {
                    if (element.style) {
                        element.style[prop] = fromConfig[prop];
                    }
                }

                // 然後應用 to 狀態
                setTimeout(function () {
                    for (let prop in toConfig) {
                        if (element.style && prop !== 'onComplete') {
                            element.style[prop] = toConfig[prop];
                        }
                    }

                    if (toConfig.onComplete) {
                        toConfig.onComplete();
                    }
                }, toConfig.duration ? toConfig.duration * 1000 : 300);

                return {
                    kill: function () { }
                };
            },
            set: function (element, config) {
                if (!element) return;

                for (let prop in config) {
                    if (element.style) {
                        element.style[prop] = config[prop];
                    }
                }

                return this;
            }
        };

        function applyAnimation(element, config) {
            if (element instanceof HTMLElement) {
                const style = element.style;

                if ('opacity' in config) {
                    style.transition = `opacity ${config.duration || 0.3}s ${config.ease || 'ease'}`;
                    style.opacity = config.opacity;
                }

                if ('y' in config) {
                    style.transition = `transform ${config.duration || 0.3}s ${config.ease || 'ease'}`;
                    style.transform = `translateY(${config.y}px)`;
                }

                if ('rotation' in config) {
                    style.transition = `transform ${config.duration || 0.3}s ${config.ease || 'ease'}`;
                    style.transform = `rotate(${config.rotation}deg)`;
                }

                if ('scale' in config) {
                    style.transition = `transform ${config.duration || 0.3}s ${config.ease || 'ease'}`;
                    style.transform = `scale(${config.scale})`;
                }

                if ('boxShadow' in config) {
                    style.transition = `box-shadow ${config.duration || 0.3}s ${config.ease || 'ease'}`;
                    style.boxShadow = config.boxShadow;
                }
            }
        }
    }
}

function showTarotFlash() {

    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.left = "0";
    flash.style.top = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "0";
    flash.style.pointerEvents = "none";
    flash.style.zIndex = "9999";

    document.body.appendChild(flash);

    if (typeof gsap !== "undefined") {

        gsap.to(flash, {
            opacity: 0.6,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            onComplete: () => flash.remove()
        });

    } else {

        flash.style.transition = "opacity 0.2s";
        flash.style.opacity = "0.6";

        setTimeout(() => {
            flash.style.opacity = "0";
            setTimeout(() => flash.remove(), 200);
        }, 200);

    }

}


// 抽牌結果訊息
function showTarotMessage() {

    const msg = document.createElement("div");

    msg.innerText = "這張牌就是命運給你的訊息";

    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.background = "rgba(20,10,30,0.85)";
    msg.style.color = "white";
    msg.style.padding = "12px 24px";
    msg.style.borderRadius = "30px";
    msg.style.fontSize = "16px";
    msg.style.zIndex = "9999";
    msg.style.opacity = "0";

    document.body.appendChild(msg);

    if (typeof gsap !== "undefined") {

        gsap.to(msg, {
            opacity: 1,
            duration: 0.5,
            y: -10,
            onComplete() {

                setTimeout(() => {

                    gsap.to(msg, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => msg.remove()
                    });

                }, 2000);

            }
        });

    } else {

        msg.style.transition = "opacity 0.5s";
        msg.style.opacity = "1";

        setTimeout(() => {

            msg.style.opacity = "0";

            setTimeout(() => msg.remove(), 500);

        }, 2000);

    }

}


// 魔法粒子
// 持續生成魔法粒子（抽卡專用版）
function spawnTarotParticles() {
    const container = document.createElement("div");
    container.id = "tarot-particle-container";
    container.style.position = "absolute";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "5";
    document.body.appendChild(container);

    let particleCount = 0;
    let spawnInterval;

    // 粒子參數設定
    const config = {
        spawnInterval: 150,    // 粒子生成間隔（毫秒）
        maxParticles: 50,      // 同時存在最大粒子數
        minHeight: -400,       // 粒子浮動最小高度
        maxHeight: -600,       // 粒子浮動最大高度
        minDuration: 2,        // 粒子動畫最短時間（秒）
        maxDuration: 4,        // 粒子動畫最長時間（秒）
        minSize: 4,            // 粒子最小尺寸（px）
        maxSize: 8             // 粒子最大尺寸（px）
    };

    // 單個粒子生成函數
    function createParticle() {
        if (particleCount >= config.maxParticles) return;
        particleCount++;

        const p = document.createElement("div");
        p.className = "tarot-particle";
        p.style.position = "absolute";
        p.style.width = (config.minSize + Math.random() * (config.maxSize - config.minSize)) + "px";
        p.style.height = p.style.width;
        p.style.borderRadius = "50%";
        p.style.background = "rgba(200,150,255,0.8)";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = (window.innerHeight + 20) + "px";
        p.style.boxShadow = "0 0 6px rgba(138,43,226,0.8)";

        container.appendChild(p);

        if (typeof gsap !== "undefined") {
            gsap.to(p, {
                y: config.minHeight + Math.random() * (config.maxHeight - config.minHeight),
                opacity: 0,
                duration: config.minDuration + Math.random() * (config.maxDuration - config.minDuration),
                ease: "power1.out",
                onComplete: function () {
                    if (p.parentNode) p.parentNode.removeChild(p);
                    particleCount--;
                }
            });
        } else {
            p.style.transition = "transform " + config.minDuration + "s linear, opacity " + config.minDuration + "s";
            setTimeout(function () {
                p.style.transform = "translateY(" + config.minHeight + "px)";
                p.style.opacity = "0";
                setTimeout(function () {
                    if (p.parentNode) p.parentNode.removeChild(p);
                    particleCount--;
                }, 1000);
            }, 50);
        }
    }

    // 開始持續生成
    function startSpawning() {
        for (let i = 0; i < 6; i++) {
            setTimeout(createParticle, i * 100);
        }
        spawnInterval = setInterval(createParticle, config.spawnInterval);
    }

    // 停止生成並清理
    function stopSpawning() {
        clearInterval(spawnInterval);
        const particles = container.querySelectorAll('.tarot-particle');
        particles.forEach(function (p, i) {
            setTimeout(function () {
                if (p.parentNode) {
                    if (typeof gsap !== "undefined") {
                        gsap.to(p, { opacity: 0, duration: 0.3, onComplete: function () { p.remove(); } });
                    } else {
                        p.remove();
                    }
                }
            }, i * 30);
        });
        setTimeout(function () {
            if (container.parentNode) container.parentNode.removeChild(container);
        }, 500);
    }

    startSpawning();

    return { stop: stopSpawning, container: container };
}