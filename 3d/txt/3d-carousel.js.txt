document.addEventListener('DOMContentLoaded', function () {
    // 檢查 GSAP 是否存在，若不存在則動態加載
    if (typeof gsap === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
        script.onload = function () {
            initApp();
        };
        document.head.appendChild(script);
    } else {
        initApp();
    }

    function initApp() {
        let carouselInterval = null;
        let isLightboxOpen = false;
        let carouselCurrentIndex = 1;
        let lastKnownBackground = '';
        let allImageSources = [];
        let tarotCards = []; // 儲存塔羅牌資料，包括正逆位說明
        
        // 🔑 關鍵修改1：將燈箱索引提升為全局變量
        window.lightboxCurrentIndex = 0;
        
        let keyboardHintTimeline = null;
        let userHasInteracted = false;
        
        // 🔑 關鍵修改2：確保 cardOrientations 是全局可訪問
        window.cardOrientations = []; // true = 正位, false = 逆位
        let lightBoxRotateTimeline = null;

        // 塔羅牌資料 - 每張牌有正位和逆位的不同說明
        const tarotData = [
            {
                name: "愚者 (The Fool)",
                upright: {
                    title: "愚者 - 正位",
                    meaning: "新的開始、自發性、信念、天真、冒險精神",
                    description: "愚者代表著全新旅程的開始，無畏無懼地面對未知。正位的愚者象徵著純真、冒險精神和對生命的信任。這是一張代表潛力和可能性的牌，鼓勵你勇敢踏出舒適圈，追隨你的直覺和熱情。"
                },
                reversed: {
                    title: "愚者 - 逆位",
                    meaning: "魯莽、輕率、拖延、不負責任",
                    description: "逆位的愚者提醒你要注意魯莽的行為和不切實際的期望。這可能表示你正在逃避責任，或是在沒有充分準備的情況下做出重要決定。這張牌鼓勵你平衡冒險精神和實際考量，三思而後行。"
                }
            },
            {
                name: "魔術師 (The Magician)",
                upright: {
                    title: "魔術師 - 正位",
                    meaning: "意志力、創造力、資源豐富、潛能、自信",
                    description: "魔術師代表你擁有將想法轉化為現實的能力。正位時，這張牌象徵著清晰的思維、創造力和資源的有效運用。你擁有所有需要的工具來達成目標，關鍵在於集中意志力並採取行動。"
                },
                reversed: {
                    title: "魔術師 - 逆位",
                    meaning: "欺騙、操縱、缺乏方向、能量不集中",
                    description: "逆位的魔術師可能表示你缺乏明確的方向或未能有效運用你的資源。也可能暗示著操縱行為或欺騙。這張牌提醒你要誠實地面對自己，重新聚焦你的能量，並確保你的行動與你的真實意圖一致。"
                }
            },
            {
                name: "女祭司 (The High Priestess)",
                upright: {
                    title: "女祭司 - 正位",
                    meaning: "直覺、潛意識、神祕、內在智慧",
                    description: "女祭司代表深層的直覺和內在智慧。正位時，她鼓勵你傾聽你內在的聲音，信任你的直覺。這是一張關於耐心、神秘和連結潛意識的牌。在做決定前，給自己時間沉思和內省。"
                },
                reversed: {
                    title: "女祭司 - 逆位",
                    meaning: "情緒不穩定、壓抑直覺、秘密暴露",
                    description: "逆位的女祭司表示你可能忽略了自己的直覺或內在智慧。你可能過於依賴邏輯而忽略了感受，或是情緒變得不穩定。這張牌提醒你要平衡理性與感性，不要害怕探索你內在的黑暗面。"
                }
            },
            {
                name: "女皇 (The Empress)",
                upright: {
                    title: "女皇 - 正位",
                    meaning: "豐收、創造力、母性、富足、成長",
                    description: "女皇象徵著豐盛、創造力和母性的能量。正位時，她代表著豐收、滋養和成長。這是一張關於富足、美麗和連接自然的牌。無論是創造項目、培育關係還是孕育新想法，女皇都鼓勵你擁抱豐盛的能量。"
                },
                reversed: {
                    title: "女皇 - 逆位",
                    meaning: "依賴、無助、創造力受阻、缺乏自信",
                    description: "逆位的女皇可能表示你感到依賴或無助，或是你的創造力受到阻礙。這可能反映在人際關係中過度依賴，或是對自己能力的不自信。這張牌提醒你要重新連接你的內在力量，尋找創造表達的新方式。"
                }
            },
            {
                name: "皇帝 (The Emperor)",
                upright: {
                    title: "皇帝 - 正位",
                    meaning: "權威、結構、控制、領導力、穩定",
                    description: "皇帝代表結構、權威和控制。正位時，他象徵著穩定、領導力和建立秩序的能力。這是一張關於設定界限、採取行動和建立基礎的牌。皇帝鼓勵你運用你的權威，以負責任的方式引導自己和他人。"
                },
                reversed: {
                    title: "皇帝 - 逆位",
                    meaning: "專制、僵化、缺乏紀律、不負責任",
                    description: "逆位的皇帝可能表示權威的濫用或缺乏必要的結構。你可能感到被過度控制，或是自己變得專制。這張牌提醒你要在紀律和靈活性之間找到平衡，避免過度僵化或完全缺乏結構。"
                }
            },
            {
                name: "教皇 (The Hierophant)",
                upright: {
                    title: "教皇 - 正位",
                    meaning: "傳統、精神指引、教育、道德規範",
                    description: "教皇代表傳統價值觀、精神學習和社會規範。正位時，他鼓勵你尋求指導，尊重傳統，並在已建立的系統中找到你的位置。這是一張關於精神成長、教育和群體歸屬感的牌。"
                },
                reversed: {
                    title: "教皇 - 逆位",
                    meaning: "反叛、打破傳統、個人精神探索",
                    description: "逆位的教皇表示對傳統權威的挑戰和個人精神探索的開始。你可能正在質疑社會規範或尋找非傳統的智慧來源。這張牌鼓勵你尋找符合你真實自我的精神道路，即使這意味著打破常規。"
                }
            },
            {
                name: "戀人 (The Lovers)",
                upright: {
                    title: "戀人 - 正位",
                    meaning: "愛、和諧、關係、選擇、價值觀一致",
                    description: "戀人牌代表愛情、和諧與連結。正位時，它不僅象徵浪漫關係，還代表著和諧、平衡和真實的連結。這是一張關於重要選擇、價值觀一致和真誠溝通的牌。戀人鼓勵你跟隨你的心，尋找真實的連結。"
                },
                reversed: {
                    title: "戀人 - 逆位",
                    meaning: "關係衝突、不和諧、不良選擇、價值觀衝突",
                    description: "逆位的戀人可能表示關係中的衝突或不和諧。這可能 reflect 在溝通不良、價值觀衝突或做出不符合你真實自我的選擇。這張牌提醒你要誠實地面對自己和他人，確保你的行動與你的核心價值觀一致。"
                }
            },
            {
                name: "戰車 (The Chariot)",
                upright: {
                    title: "戰車 - 正位",
                    meaning: "意志力、勝利、自律、掌控、決心",
                    description: "戰車代表意志力、決心和掌控。正位時，它象徵著通過自律和堅持達成目標的能力。這是一張關於克服障礙、自我控制和前進的牌。戰車鼓勵你駕馭你的情緒和衝動，以達成你的目標。"
                },
                reversed: {
                    title: "戰車 - 逆位",
                    meaning: "缺乏控制、方向迷失、衝突、敗退",
                    description: "逆位的戰車表示你可能失去控制或方向。你可能面臨內在衝突，無法協調不同的欲望，或是缺乏向前邁進的決心。這張牌提醒你要重新找回你的紀律，設立明確目標，並學習平衡你的情感和理性。"
                }
            },
            {
                name: "力量 (Strength)",
                upright: {
                    title: "力量 - 正位",
                    meaning: "內在力量、勇氣、耐心、自制力、溫和的權威",
                    description: "力量牌代表內在力量和勇氣。正位時，它象徵著通過溫和和耐心而非蠻力來掌控局勢的能力。這是一張關於情感控制、同理心和持久勇氣的牌。力量鼓勵你相信自己內在的力量，以愛和理解面對挑戰。"
                },
                reversed: {
                    title: "力量 - 逆位",
                    meaning: "內在脆弱、缺乏自信、濫用力量、自我懷疑",
                    description: "逆位的力量表示內在的脆弱和缺乏自信。你可能在與自己的情緒或恐懼掙扎，或是濫用你的權力。這張牌提醒你要培養自我接納，尋找內在的勇氣，並學習平衡力量和同情心。"
                }
            },
            {
                name: "隱士 (The Hermit)",
                upright: {
                    title: "隱士 - 正位",
                    meaning: "內省、智慧、獨處、指引、靈性探索",
                    description: "隱士代表內省、智慧和靈性探索。正位時，他鼓勵你暫時脫離外界喧囂，尋求內在指引。這是一張關於沉思、自我發現和尋找真理的牌。隱士提醒你，真正的智慧來自於聆聽你內在的聲音。"
                },
                reversed: {
                    title: "隱士 - 逆位",
                    meaning: "孤立、孤獨、過度批判、逃避社會",
                    description: "逆位的隱士可能表示不健康的孤立或逃避社會責任。你可能過度批判自己或他人，或是被困在自己的思想中。這張牌提醒你要在獨處和社交之間找到平衡，不要讓內省變成了孤立。"
                }
            },
            {
                name: "命運之輪 (Wheel of Fortune)",
                upright: {
                    title: "命運之輪 - 正位",
                    meaning: "變化、命運、好運、轉機、循環",
                    description: "命運之輪代表人生的起伏和命運的變化。正位時，它象徵著好運、轉機和積極的變化。這是一張關於接納生命循環、信任過程和擁抱變化的牌。命運之輪提醒我們，低谷之後總會有高峰。"
                },
                reversed: {
                    title: "命運之輪 - 逆位",
                    meaning: "壞運氣、抵抗變化、負面循環、外部干擾",
                    description: "逆位的命運之輪可能表示一段不順的時期，或是抵抗必要的變化。你可能感到被困在負面循環中，或受到外部因素的不利影響。這張牌提醒你要保持彈性，接受有些事情超出你的控制，並尋找在混亂中的平靜。"
                }
            },
            {
                name: "正義 (Justice)",
                upright: {
                    title: "正義 - 正位",
                    meaning: "公平、平衡、真理、法律、因果",
                    description: "正義牌代表公平、平衡和因果。正位時，它鼓勵你誠實面對自己和他人，為自己的行為負責。這是一張關於道德抉擇、法律事務和尋找平衡的牌。正義提醒你，每個行動都會帶來相應的結果。"
                },
                reversed: {
                    title: "正義 - 逆位",
                    meaning: "不公、偏見、逃避責任、失衡",
                    description: "逆位的正義可能表示不公、偏見或逃避責任。你可能面臨不公平的 treatment，或在自己的生活中缺乏平衡。這張牌提醒你要直面真相，承擔責任，並在所有關係中尋求公平和誠實。"
                }
            },
            {
                name: "吊人 (The Hanged Man)",
                upright: {
                    title: "吊人 - 正位",
                    meaning: "犧牲、等待、新視角、投降、接受",
                    description: "吊人代表犧牲、耐心和新視角。正位時，他鼓勵你暫停行動，從不同角度看問題。這是一張關於自我犧牲、接受現狀和精神成長的牌。吊人提醒我們，有時放棄控制反而能獲得更深的智慧。"
                },
                reversed: {
                    title: "吊人 - 逆位",
                    meaning: "抗拒犧牲、不願等待、自我中心、拖延",
                    description: "逆位的吊人可能表示不願犧牲或無法看到長期利益。你可能抗拒必要的等待，或過於自我中心。這張牌提醒你要評估什麼是真正重要的，並願意為更大的目標做出短暫的犧牲。"
                }
            },
            {
                name: "死神 (Death)",
                upright: {
                    title: "死神 - 正位",
                    meaning: "轉變、結束、重生、蛻變、釋放",
                    description: "死神牌代表重大轉變和結束。正位時，它象徵著必要結束帶來的新生機會。這是一張關於蛻變、釋放過去和擁抱新開始的牌。死神提醒我們，結束往往是成長的必要部分，為新生騰出空間。"
                },
                reversed: {
                    title: "死神 - 逆位",
                    meaning: "抗拒改變、執著過去、拖延結束、恐懼轉變",
                    description: "逆位的死神表示抗拒必要的結束或改變。你可能執著於已經結束的關係、工作或生活方式，無法向前邁進。這張牌提醒你要勇氣面對轉變，接受某些事物的結束，為新的可能性創造空間。"
                }
            },
            {
                name: "節制 (Temperance)",
                upright: {
                    title: "節制 - 正位",
                    meaning: "平衡、和諧、耐心、適度、融合",
                    description: "節制代表平衡、和諧與適度。正位時，它鼓勵你在生活的各個方面尋找平衡，調和對立的力量。這是一張關於耐心、適度和內在和諧的牌。節制提醒我們，真正的進步通常是漸進的，需要耐心和調適。"
                },
                reversed: {
                    title: "節制 - 逆位",
                    meaning: "失衡、極端、缺乏耐心、衝突",
                    description: "逆位的節制表示失衡、極端或缺乏耐心。你可能在生活的某些方面走極端，或難以調和內在的衝突。這張牌提醒你要尋找中庸之道，在給予和接受、工作和休息、理性與感性之間找到平衡。"
                }
            },
            {
                name: "惡魔 (The Devil)",
                upright: {
                    title: "惡魔 - 正位",
                    meaning: "束縛、物質主義、慾望、上癮、幻覺",
                    description: "惡魔牌代表束縛、上癮和限制性模式。正位時，它提醒我們注意那些看似有吸引力卻實際上奴役我們的事物。這是一張關於慾望、物質主義和自我設限的牌。惡魔鼓勵我們認清哪些模式控制著我們的生活，並找到釋放的方法。"
                },
                reversed: {
                    title: "惡魔 - 逆位",
                    meaning: "釋放、打破束縛、克服上癮、自由",
                    description: "逆位的惡魔象徵著打破束縛、克服上癮和重獲自由。你可能正在擺脫限制性信念或有害關係。這張牌提醒我們，即使在最黑暗的時刻，我們也擁有解開自己枷鎖的力量。真正的自由來自於認識到我們永遠有選擇的權利。"
                }
            },
            {
                name: "塔 (The Tower)",
                upright: {
                    title: "塔 - 正位",
                    meaning: "突變、崩潰、真相揭露、釋放、重生",
                    description: "塔牌代表突如其來的變化和結構的崩潰。正位時，它象徵著必要但痛苦的真相揭露和舊有模式的瓦解。這是一張關於釋放虛假安全感、面對真相和為新生重建基礎的牌。塔提醒我們，有時必須先拆除，才能建造更堅固的東西。"
                },
                reversed: {
                    title: "塔 - 逆位",
                    meaning: "避免危機、漸進改變、內部衝突、抵抗真相",
                    description: "逆位的塔表示對必要變化的抵抗，或危機正在內部醞釀。你可能預感到某種崩潰即將到來，但試圖避免面對它。這張牌提醒你要勇敢面對現實，主動做出必要的改變，而不是被動等待災難降臨。"
                }
            },
            {
                name: "星星 (The Star)",
                upright: {
                    title: "星星 - 正位",
                    meaning: "希望、靈感、信念、療癒、無條件的愛",
                    description: "星星代表希望、靈感和療癒。正位時，她象徵著在黑暗中看到光明的能力，以及對未來的樂觀期待。這是一張關於信念、無條件的愛和內在平和的牌。星星提醒我們，即使在最黑暗的時刻，希望和指引也永遠存在。"
                },
                reversed: {
                    title: "星星 - 逆位",
                    meaning: "失去希望、悲觀、失望、自我懷疑",
                    description: "逆位的星星表示失去希望、悲觀或對未來感到絕望。你可能正在經歷失望或質疑自己的信念系統。這張牌提醒你要重新連接你的內在光源，尋找小的希望跡象，並記住黑暗總會過去。"
                }
            },
            {
                name: "月亮 (The Moon)",
                upright: {
                    title: "月亮 - 正位",
                    meaning: "幻象、直覺、未知、隱藏真相、情緒波動",
                    description: "月亮牌代表幻象、直覺和潛意識。正位時，它提醒我們注意可能存在的誤導和隱藏的真相。這是一張關於信任直覺、探索內在世界和面對恐懼的牌。月亮鼓勵我們穿過表面的迷霧，尋找深層真相。"
                },
                reversed: {
                    title: "月亮 - 逆位",
                    meaning: "真相顯現、克服恐懼、清晰思考、情緒穩定",
                    description: "逆位的月亮象徵著真相的顯現和恐懼的克服。你可能正在從迷惑中走出，獲得更清晰的視野。這張牌提醒我們，當我們勇敢面對內在的陰影，就能轉化恐懼為智慧，謎團將逐漸明朗。"
                }
            },
            {
                name: "太陽 (The Sun)",
                upright: {
                    title: "太陽 - 正位",
                    meaning: "成功、快樂、活力、清晰、積極",
                    description: "太陽牌代表成功、快樂和清晰。正位時，它象徵著光明、活力和積極的結果。這是一張關於成就、真誠表達和純粹喜悅的牌。太陽提醒我們享受當下，擁抱生命的豐富和美好，並相信自己的光芒。"
                },
                reversed: {
                    title: "太陽 - 逆位",
                    meaning: "暫時挫折、悲觀、缺乏方向、能量低落",
                    description: "逆位的太陽表示暫時的挫折或能量低落。你可能感到缺乏方向或信心，或正經歷一段不太明亮的時期。這張牌提醒我們，即使太陽被雲遮住，它仍然存在。這只是一個暫時的階段，光明將再次出現。"
                }
            },
            {
                name: "審判 (Judgement)",
                upright: {
                    title: "審判 - 正位",
                    meaning: "覺醒、重生、反思、救贖、召喚",
                    description: "審判牌代表覺醒、重生和深刻的反思。正位時，它象徵著對過去的重新評估和新的開始。這是一張關於回應內在召喚、接受救贖和擁抱轉變的牌。審判鼓勵我們傾聽內在的聲音，做出必要的改變，邁向更高的意識層次。"
                },
                reversed: {
                    title: "審判 - 逆位",
                    meaning: "抗拒改變、自我批判、忽視召喚、過去陰影",
                    description: "逆位的審判表示抗拒必要的內在工作或對過去的執著。你可能過度自我批判，或忽略內在的召喚。這張牌提醒我們，真正成長需要誠實面對自己，原諒過去，並對新的可能性保持開放態度。"
                }
            },
            {
                name: "世界 (The World)",
                upright: {
                    title: "世界 - 正位",
                    meaning: "完成、整體性、成就、整合、圓滿",
                    description: "世界牌代表完成、成就和圓滿。正位時，它象徵著一個重要循環的結束和目標的達成。這是一張關於整合經驗、感受到成就和準備迎接新循環的牌。世界提醒我們珍惜已經完成的旅程，同時為下一個篇章做好準備。"
                },
                reversed: {
                    title: "世界 - 逆位",
                    meaning: "未完成、延遲、缺乏閉合、內部不完整",
                    description: "逆位的世界表示某個項目或階段尚未完成，或缺乏閉合感。你可能感到被困在循環中，或難以達到滿足。這張牌提醒我們，有時需要放手完美主義，接納過程的不完美，並找到方法完成那些未竟之事。"
                }
            }
        ];

        // 初始化塔羅牌狀態和資料
        const items = document.querySelectorAll('.item');
        items.forEach((item, i) => {
            // 設定正逆位初始狀態
            window.cardOrientations.push(true); // 預設全部為正位

            // 設定塔羅牌資料
            if (i < tarotData.length) {
                tarotCards.push(tarotData[i]);
            } else {
                // 如果輪播項目超過預定的塔羅牌數量，則使用通用資料
                tarotCards.push({
                    name: `牌 ${i + 1}`,
                    upright: {
                        title: `牌 ${i + 1} - 正位`,
                        meaning: "正位含義",
                        description: "正位詳細解釋內容。"
                    },
                    reversed: {
                        title: `牌 ${i + 1} - 逆位`,
                        meaning: "逆位含義",
                        description: "逆位詳細解釋內容。"
                    }
                });
            }
        });
        window.tarotCards = tarotCards;
        // 設置背景圖片並獲取所有圖片數據
        items.forEach((item, i) => {
            const frame = item.querySelector('.frame');
            const frontBox = frame.querySelector('.front');
            const leftBox = frame.querySelector('.left');
            const rightBox = frame.querySelector('.right');

            const imgNum = (i + 1).toString().padStart(2, '0');
            const imgUrl = `./img-2/${imgNum}.jpg`;

            // 設置背景圖 (回退方案)
            frontBox.style.backgroundImage = `url(${imgUrl})`;
            leftBox.style.backgroundImage = `url(${imgUrl})`;
            rightBox.style.backgroundImage = `url(${imgUrl})`;

            // 創建 .img-2 元素 (主要圖片來源)
            const imgElement = document.createElement('img');
            imgElement.className = 'img-2';
            imgElement.src = imgUrl;
            imgElement.alt = `塔羅牌 ${i + 1}`;
            imgElement.style.display = 'none'; // 預設隱藏，避免影響輪播設計

            // 處理加載錯誤
            imgElement.onerror = function () {
                console.error(`圖片載入失敗: ${imgUrl}`);
                frontBox.innerHTML += `<div class="image-error">圖片載入失敗: ${imgNum}.jpg</div>`;
            };

            // 將圖片元素添加到 .front 容器
            frontBox.appendChild(imgElement);

            allImageSources.push(imgUrl);
        });

        // 創建燈箱結構
        createLightboxStructure();

        // 初始化3D輪播
        initCarousel();

        // 初始化燈箱
        initLightbox();

        function createLightboxStructure() {
            let lightboxHTML = `
        <div id="lightbox-overlay">
            <div class="lightbox-container">
                <img id="lightbox-img" src="" alt="塔羅牌" />
                <div id="rotate-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.558"></path>
                        <path d="M18 3v4"></path>
                        <path d="M21 6h-4"></path>
                    </svg>
                </div>
                <div id="orientation-indicator">
                    <span class="upright">正位</span>
                    <span class="reversed">逆位</span>
                </div>
            </div>
            <div id="caption-container">
                <div class="lightbox-panel">
                    <div class="panel-content">
                        <div class="upright-panel">
                            <div class="panel-title">命運之輪 - 正位<span class="activity-indicator"></span></div>
                            <div class="panel-tags">
                                <span class="tag">變化</span>
                                <span class="tag">命運</span>
                                <span class="tag">好運</span>
                                <span class="tag">轉機</span>
                                <span class="tag">循環</span>
                            </div>
                            <div class="panel-description">命運之輪代表人生的起伏和命運的變化。正位時，它象徵著好運、轉機和積極的變化。這是一張關於接納生命循環、信任過程和擁抱變化的牌。命運之輪提醒我們，低谷之後總會有高峰。</div>
                        </div>
                        <div class="reversed-panel">
                            <div class="panel-title">命運之輪 - 逆位<span class="activity-indicator"></span></div>
                            <div class="panel-tags">
                                <span class="tag">壞運氣</span>
                                <span class="tag">抵抗變化</span>
                                <span class="tag">負面循環</span>
                                <span class="tag">外部干擾</span>
                            </div>
                            <div class="panel-description">逆位的命運之輪可能表示一段不順的時期，或是抵抗必要的變化。你可能感到被困在負面循環中，或受到外部因素的不利影響。這張牌提醒我們，保持彈性，接受有些事情超出你的控制，並尋找在混亂中的平靜。</div>
                        </div>
                    </div>
                    <div class="panel-number"></div>
                </div>
            </div>
            <div id="keyboard-hint">⌨</div>
        </div>
    `;

            document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        }

        function initCarousel() {
            const shell = document.querySelector('.shell');
            const slider = shell.querySelector('.shell_slider');
            const prevBtn = shell.querySelector('.prev');
            const nextBtn = shell.querySelector('.next');

            let width, height, totalWidth, margin = 20,
                intervalTime = 3000;

            resize();
            move(Math.floor(items.length / 2));
            bindEvents();
            timer();

            function resize() {
                width = Math.max(window.innerWidth * .20, 275);
                height = window.innerHeight * .5;
                totalWidth = width * items.length;
                slider.style.width = totalWidth + "px";

                items.forEach(item => {
                    item.style.width = (width - (margin * 2)) + "px";
                    item.style.height = height + "px";
                });
            }

            function bindEvents() {
                window.addEventListener('resize', resize);
                prevBtn.addEventListener('click', prev);
                nextBtn.addEventListener('click', next);
            }

            function move(index) {
                if (index < 1) index = items.length;
                if (index > items.length) index = 1;
                carouselCurrentIndex = index;

                items.forEach((item, i) => {
                    const box = item.querySelector('.frame');
                    if (i === index - 1) {
                        item.classList.add('item--active');
                        box.style.transform = "perspective(1200px)";
                    } else {
                        item.classList.remove('item--active');
                        const rotation = (i < index - 1) ? 40 : -40;
                        box.style.transform = `perspective(1200px) rotateY(${rotation}deg)`;
                    }
                });

                const translateX = (index * -width) + (width / 2) + (window.innerWidth / 2);
                slider.style.transform = `translate3d(${translateX}px, 0, 0)`;

                const frontBox = items[index - 1].querySelector('.front');
                document.body.style.backgroundImage = frontBox.style.backgroundImage;
                lastKnownBackground = frontBox.style.backgroundImage;
            }

            function timer() {
                clearInterval(carouselInterval);

                if (!isLightboxOpen) {
                    carouselInterval = setInterval(() => {
                        move(carouselCurrentIndex + 1);
                    }, intervalTime);
                }
            }

            function prev() {
                if (!isLightboxOpen) {
                    move(carouselCurrentIndex - 1);
                    timer();
                }
            }

            function next() {
                if (!isLightboxOpen) {
                    move(carouselCurrentIndex + 1);
                    timer();
                }
            }

            window.carousel = {
                move: move,
                prev: prev,
                next: next,
                timer: timer,
                items: items,
                getCurrentIndex: function () {
                    return carouselCurrentIndex;
                },
                setCurrentIndex: function (index) {
                    carouselCurrentIndex = index;
                }
            };
        }

        function initLightbox() {
            const lightboxOverlay = document.getElementById('lightbox-overlay');
            const lightboxImg = document.getElementById('lightbox-img');
            const keyboardHint = document.getElementById('keyboard-hint');
            const rotateButton = document.getElementById('rotate-button');
            const orientationIndicator = document.getElementById('orientation-indicator');

            // 🔑 關鍵修改3：暴露設置燈箱索引的接口
            window.setLightboxIndex = function(index) {
                window.lightboxCurrentIndex = index;
                console.log('燈箱索引已同步:', index);
            };

            // 為每個 front 元素添加點擊事件
            document.querySelectorAll('.front').forEach((front, index) => {
                front.addEventListener('click', function (e) {
                    if (e.target.classList.contains('image-error')) return;
                    e.stopPropagation();
                    openLightbox(index);
                });
            });

            // 點擊遮罩層關閉/切換 - 修復點擊區域
            lightboxOverlay.addEventListener('click', function (e) {
                if (!isLightboxOpen) return;

                // 檢查點擊是否在旋轉按鈕上
                if (rotateButton.contains(e.target)) return;

                // 檢查點擊是否在面板內容上
                const panels = document.querySelectorAll('.upright-panel, .reversed-panel');
                for (let panel of panels) {
                    if (panel.contains(e.target)) return;
                }

                const rect = lightboxOverlay.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;

                if (clickX < width * 0.3) {
                    prevLightbox();
                } else if (clickX > width * 0.7) {
                    nextLightbox();
                } else {
                    closeLightbox();
                }
            });

            // 鼠標移動更新光標 - 修復光標反饋
            lightboxOverlay.addEventListener('mousemove', function (e) {
                if (!isLightboxOpen) return;

                const rect = lightboxOverlay.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;

                // 檢查是否懸停在旋轉按鈕或面板上
                const panels = document.querySelectorAll('.upright-panel, .reversed-panel');
                let isOverPanel = false;
                for (let panel of panels) {
                    const panelRect = panel.getBoundingClientRect();
                    if (e.clientX >= panelRect.left && e.clientX <= panelRect.right &&
                        e.clientY >= panelRect.top && e.clientY <= panelRect.bottom) {
                        isOverPanel = true;
                        break;
                    }
                }

                if (isOverPanel || rotateButton.contains(e.target)) {
                    lightboxOverlay.classList.remove('lightbox-prev-area', 'lightbox-next-area');
                    return;
                }

                lightboxOverlay.classList.remove('lightbox-prev-area', 'lightbox-next-area');

                if (clickX < width * 0.3) {
                    lightboxOverlay.classList.add('lightbox-prev-area');
                } else if (clickX > width * 0.7) {
                    lightboxOverlay.classList.add('lightbox-next-area');
                }
            });

            // 旋轉按鈕事件
            rotateButton.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleCardOrientation();
            });

            // 鍵盤導航
            document.addEventListener('keydown', function (e) {
                if (!isLightboxOpen) return;

                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        prevLightbox();
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'ArrowUp':
                        nextLightbox();
                        e.preventDefault();
                        break;
                    case 'r':
                    case 'R':
                        toggleCardOrientation();
                        e.preventDefault();
                        break;
                    case 'Escape':
                    case ' ':
                        closeLightbox();
                        break;
                }
            });

            // 更新光標樣式
            function updateCursor(e) {
                const lightboxOverlay = document.getElementById('lightbox-overlay');
                const rect = lightboxOverlay.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;

                lightboxOverlay.classList.remove('lightbox-prev-area', 'lightbox-next-area');

                if (clickX < width * 0.3) {
                    lightboxOverlay.classList.add('lightbox-prev-area');
                } else if (clickX > width * 0.7) {
                    lightboxOverlay.classList.add('lightbox-next-area');
                }
            }

            // 切換塔羅牌正逆位 - 2D旋轉（整張圖片倒轉180度）
            function toggleCardOrientation() {
                if (!isLightboxOpen) return;

                // 切換當前牌的狀態
                window.cardOrientations[window.lightboxCurrentIndex] = !window.cardOrientations[window.lightboxCurrentIndex];
                const isUpright = window.cardOrientations[window.lightboxCurrentIndex];

                // 更新指示器
                updateOrientationIndicator(isUpright);

                // 更新說明內容
                updateLightboxContent(window.lightboxCurrentIndex, isUpright);

                // 執行2D旋轉動畫（整張圖片倒轉180度）
                const lightboxImg = document.getElementById('lightbox-img');
                const rotateButton = document.getElementById('rotate-button');

                if (lightBoxRotateTimeline) {
                    lightBoxRotateTimeline.kill();
                }

                // 創建2D旋轉效果
                lightBoxRotateTimeline = gsap.timeline();

                if (isUpright) {
                    // 逆位 -> 正位 (旋轉回0度)
                    lightBoxRotateTimeline.to(lightboxImg, {
                        rotation: 0,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                } else {
                    // 正位 -> 逆位 (旋轉180度 - 完全倒轉)
                    lightBoxRotateTimeline.to(lightboxImg, {
                        rotation: 180,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }

                // 旋轉按鈕的動畫
                lightBoxRotateTimeline.to(rotateButton, {
                    rotation: isUpright ? 360 : -360,
                    duration: 0.6,
                    ease: "power2.out"
                }, 0);
            }

            // 更新方向指示器
            function updateOrientationIndicator(isUpright) {
                const indicator = document.getElementById('orientation-indicator');

                if (isUpright) {
                    indicator.classList.remove('reversed');
                    indicator.classList.add('upright');
                } else {
                    indicator.classList.remove('upright');
                    indicator.classList.add('reversed');
                }
            }

            // 更新燈箱內容 - 根據正逆位顯示不同內容
            function updateLightboxContent(index, isUpright) {
                const uprightPanel = document.querySelector('.upright-panel');
                const reversedPanel = document.querySelector('.reversed-panel');
                const panelNumber = document.querySelector('.panel-number');

                const card = tarotCards[index];

                // 隱藏所有面板
                uprightPanel.classList.remove('active');
                reversedPanel.classList.remove('active');

                // 設置正位內容
                uprightPanel.querySelector('.panel-title').innerHTML = `${card.name} - 正位<span class="activity-indicator"></span>`;
                uprightPanel.querySelector('.panel-description').innerHTML = card.upright.description;
                uprightPanel.querySelector('.panel-tags').innerHTML = card.upright.meaning.split(',').map(tag =>
                    `<span class="tag">${tag.trim()}</span>`
                ).join('');

                // 設置逆位內容
                reversedPanel.querySelector('.panel-title').innerHTML = `${card.name} - 逆位<span class="activity-indicator"></span>`;
                reversedPanel.querySelector('.panel-description').innerHTML = card.reversed.description;
                reversedPanel.querySelector('.panel-tags').innerHTML = card.reversed.meaning.split(',').map(tag =>
                    `<span class="tag">${tag.trim()}</span>`
                ).join('');

                // 設置編號


                // 顯示當前活動面板
                if (isUpright) {
                    uprightPanel.classList.add('active');
                } else {
                    reversedPanel.classList.add('active');
                }
            }

            // 打開燈箱
            function openLightbox(index) {
                if (isLightboxOpen) return;

                userHasInteracted = true;
                isLightboxOpen = true;
                window.lightboxCurrentIndex = index; // 使用全局變量

                clearInterval(carouselInterval);

                const lightboxOverlay = document.getElementById('lightbox-overlay');
                const lightboxImg = document.getElementById('lightbox-img');
                const keyboardHint = document.getElementById('keyboard-hint');
                const captionContainer = document.getElementById('caption-container');
                const rotateButton = document.getElementById('rotate-button');

                // 重置狀態
                lightboxImg.src = '';
                lightboxImg.style.opacity = '0';
                lightboxOverlay.style.display = 'flex';
                lightboxOverlay.style.opacity = '0';
                keyboardHint.style.opacity = '0';

                // 設置初始方向
                updateOrientationIndicator(window.cardOrientations[index]);

                document.body.style.overflow = 'hidden';

                // 同步輪播
                if (window.carousel) {
                    window.carousel.move(index + 1);
                    window.carousel.setCurrentIndex(index + 1);
                    carouselCurrentIndex = index + 1;
                }

                // 預載入並顯示圖片
                const tempImg = new Image();
                tempImg.onload = function () {
                    showLightboxImage(index);
                };
                tempImg.src = allImageSources[index];
            }

            // 顯示燈箱圖片
            function showLightboxImage(index) {
                const lightboxOverlay = document.getElementById('lightbox-overlay');
                const lightboxImg = document.getElementById('lightbox-img');
                const keyboardHint = document.getElementById('keyboard-hint');
                const captionContainer = document.getElementById('caption-container');

                const isUpright = window.cardOrientations[index];

                lightboxImg.src = allImageSources[index];

                // 應用當前方向 - 2D旋轉（整張圖片倒轉）
                if (!window.cardOrientations[index]) {
                    // 逆位：設置為旋轉180度（完全倒轉）
                    gsap.set(lightboxImg, { rotation: 180 });
                } else {
                    // 正位：重置旋轉
                    gsap.set(lightboxImg, { rotation: 0 });
                }

                // 更新內容
                updateLightboxContent(index, isUpright);

                lightboxImg.offsetHeight;

                // 顯示燈箱並動畫
                gsap.to(lightboxOverlay, {
                    opacity: 1,
                    duration: 0.3
                });

                gsap.to(lightboxImg, {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power3.out"
                });

                gsap.to(captionContainer, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    delay: 0.2
                });

                // 鍵盤提示動畫
                gsap.to(keyboardHint, {
                    opacity: 0.6,
                    duration: 0.4,
                    delay: 0.2,
                    onComplete: function () {
                        if (keyboardHintTimeline) {
                            keyboardHintTimeline.kill();
                        }
                        keyboardHintTimeline = gsap.to(keyboardHint, {
                            opacity: 0.3,
                            duration: 1.2,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut"
                        });
                    }
                });
            }

            // 關閉燈箱
            function closeLightbox() {
                if (!isLightboxOpen) return;

                isLightboxOpen = false;

                const lightboxOverlay = document.getElementById('lightbox-overlay');
                const lightboxImg = document.getElementById('lightbox-img');
                const keyboardHint = document.getElementById('keyboard-hint');
                const captionContainer = document.getElementById('caption-container');
                const rotateButton = document.getElementById('rotate-button');

                if (keyboardHintTimeline) {
                    keyboardHintTimeline.kill();
                    keyboardHintTimeline = null;
                }

                if (lightBoxRotateTimeline) {
                    lightBoxRotateTimeline.kill();
                    lightBoxRotateTimeline = null;
                }

                gsap.to([lightboxOverlay, lightboxImg], {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in"
                });

                gsap.to(captionContainer, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    ease: "power2.in"
                });

                gsap.to(rotateButton, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: function () {
                        lightboxOverlay.style.display = 'none';
                        lightboxImg.src = '';
                        lightboxImg.style.opacity = '0';
                        keyboardHint.style.opacity = '0';
                        rotateButton.style.transform = 'rotate(0deg)';
                        rotateButton.style.scale = '1';
                        rotateButton.style.opacity = '1';
                        lightboxOverlay.classList.remove('lightbox-prev-area', 'lightbox-next-area');
                    }
                });

                document.body.style.overflow = '';

                // 恢復輪播
                setTimeout(function () {
                    const frontBox = document.querySelector('.item--active .front');
                    if (frontBox) {
                        document.body.style.backgroundImage = frontBox.style.backgroundImage;
                        lastKnownBackground = frontBox.style.backgroundImage;
                    }

                    if (window.carousel) {
                        window.carousel.timer();
                    }
                }, 400);
            }

            // 上一張
            function prevLightbox() {
                if (!isLightboxOpen) return;
                let newIndex = window.lightboxCurrentIndex - 1;
                if (newIndex < 0) newIndex = allImageSources.length - 1;
                window.lightboxCurrentIndex = newIndex; // 使用全局變量
                showLightboxImage(newIndex);

                // 同步輪播
                if (window.carousel) {
                    window.carousel.move(newIndex + 1);
                    window.carousel.setCurrentIndex(newIndex + 1);
                    carouselCurrentIndex = newIndex + 1;
                }
            }

            // 下一張
            function nextLightbox() {
                if (!isLightboxOpen) return;
                let newIndex = window.lightboxCurrentIndex + 1;
                if (newIndex >= allImageSources.length) newIndex = 0;
                window.lightboxCurrentIndex = newIndex; // 使用全局變量
                showLightboxImage(newIndex);

                // 同步輪播
                if (window.carousel) {
                    window.carousel.move(newIndex + 1);
                    window.carousel.setCurrentIndex(newIndex + 1);
                    carouselCurrentIndex = newIndex + 1;
                }
            }
        }
    }
});