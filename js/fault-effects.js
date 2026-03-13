// 使用 IIFE 封裝避免全域變數汙染
(function () {
  'use strict';

  class FaultEffects {
    constructor(container) {
      this.container = container;
      this.bg = container.querySelector('[data-fault-effect="bg"]');
      this.scanLines = container.querySelector('[data-fault-effect="scan-lines"]');
      this.textElements = [...container.querySelectorAll('[data-fault-effect="text"]')];

      this.isFaulting = false;
      this.player = null;

      // 綁定方法
      this.startFault = this.startFault.bind(this);
      this.endFault = this.endFault.bind(this);
      this.triggerFault = this.triggerFault.bind(this);
    }

    init() {
      // 設置文字內容（避免硬編碼）
      this.textElements.forEach(el => {
        el.setAttribute('data-text', el.textContent);
      });

      // 啟動隨機觸發
      this.startRandomFault();
    }

    startFault() {
      if (this.isFaulting) return;
      this.isFaulting = true;

      // 背景效果
      const offsetRed = (Math.random() * 8 - 4).toFixed(1);
      const offsetGreen = (Math.random() * 8 - 4).toFixed(1);

      this.bg.style.setProperty('--offset-red', `${offsetRed}px`);
      this.bg.style.setProperty('--offset-green', `${offsetGreen}px`);
      this.bg.classList.add('fault-active');
      this.scanLines.classList.add('active');

      // 文字效果
      clearInterval(this.player);
      this.textElements.forEach(text => {
        text.classList.add("fault-active");
      });

      this.player = setInterval(() => {
        this.textElements.forEach(text => {
          text.style.transform = `translate(${Math.random() * 60 - 30}%, ${Math.random() * 60 - 30}%)`;
          let x = Math.random() * 100;
          let y = Math.random() * 100;
          let h = Math.random() * 50 + 50;
          let w = Math.random() * 40 + 10;
          text.style.clipPath = `polygon(${x}% ${y}%, ${x + w}% ${y}%, ${x + w}% ${y + h}%, ${x}% ${y + h}%)`;
        });
      }, 30);
      const sheet = document.styleSheets[0];
      for (let i = 0; i < sheet.cssRules.length; i++) {
        const rule = sheet.cssRules[i];
        if (rule.selectorText === ".fault-effect-bg.fault-active::after") {
          rule.style.transform = `translateX(${offsetRed}px)`;
        }
        if (rule.selectorText === ".fault-effect-bg.fault-active::before") {
          rule.style.transform = `translateX(${offsetGreen}px)`;
        }
      }
    }


    endFault() {
      // 背景效果
      this.bg.classList.remove('fault-active');
      this.scanLines.classList.remove('active');

      // 文字效果
      clearInterval(this.player);
      this.textElements.forEach(text => {
        text.classList.remove("fault-active");
        text.style.transform = '';
        text.style.clipPath = '';
      });

      this.isFaulting = false;
    }

    triggerFault() {
      if (this.isFaulting) return;

      this.startFault();

      // 800ms 後同時結束
      setTimeout(() => {
        this.endFault();
      }, 800);
    }

    startRandomFault() {
      const trigger = () => {
        const delay = Math.floor(Math.random() * 5000) + 2000; // 2~7秒
        setTimeout(() => {
          this.triggerFault();
          trigger();
        }, delay);
      };
      trigger();
    }
  }

  // 自動初始化所有 fault-effect-container
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fault-effect-container').forEach(container => {
      const effect = new FaultEffects(container);
      effect.init();
    });
  });
})();