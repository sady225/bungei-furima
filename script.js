'use strict';

const EXHIBITORS = [
    {
        name: "木の子まき",
        content: "絵画・オリジナルグッズ販売",
        imageUrl: "./photo/251213/011.jpg",
        activity_intro: "重曹アートや手描きハット、ポストカードなどをご出展🍄 独自の感性が光る作品たちが会場を彩りました。"
    },
    {
        name: "平和学習の旅 神田志有",
        content: "戦跡記録・資料展示",
        imageUrl: "./photo/251213/037.jpg",
        imagePosition: "top",
        activity_intro: "沖縄から北海道まで、日本縦断して調べた「戦跡記録」を一挙公開。中学1年生とは思えない圧倒的な情報量と情熱に多くの大人が驚嘆しました。"
    },
    {
        name: "SHIAN",
        content: "手作りミニカー・作品展示",
        imageUrl: "https://pbs.twimg.com/media/G7-R6xbboAAhdA1?format=jpg&name=4096x4096",
        activity_intro: "沖縄東青年会の地謡軽トラを再現！細部までこだわった工作と、最新作の版画出展で子どもたちの注目を集めました。"
    },
    {
        name: "具志川東中",
        content: "作品展示",
        imageUrl: "./photo/251213/042.jpg",
        activity_intro: "中学生による創造性豊かな作品展示。自由な感性から生まれる表現が、来場者の目を楽しませました。"
    },
    {
        name: " Ichimura",
        content: "フライトシミュレーター",
        imageUrl: "./photo/251213/025.jpg",
        activity_intro: "本格的なフライト体験！子どもから大人まで、大空への挑戦を楽しみました。"
    },
    {
        name: "LOVELY ZIPPER",
        content: "ダンスパフォーマンス",
        imageUrl: "./photo/251213/014.jpg",
        activity_intro: "舞台を華麗に彩るダンスパフォーマンス。エネルギッシュな動きに会場全体が魅了されました。"
    },
    {
        name: "田場小金管バンド",
        content: "楽器演奏",
        imageUrl: "./photo/251213/028.jpg",
        activity_intro: "力強い演奏を披露してくれた金管バンド。地域の子どもたちの活躍が中庭を包み込みました。"
    },
    {
        name: "福島太郎",
        content: "文学作品（福島文学）",
        imageUrl: "./photo/fukusima.png",
        activity_intro: "独自の視点で描かれる「福島文学」。公務員の日常から人間讃歌まで、深い物語の世界を提供しました。"
    },
    {
        name: "バーチャル花火",
        content: "VR体験",
        imageUrl: "./photo/251213/068.jpg",
        activity_intro: "高校生によるVR花火体験。季節外れの大輪の花が、デジタルの世界で会場に咲き誇りました。"
    },
    {
        name: "えたに あやこ",
        content: "パステルアート",
        imageUrl: "./photo/251213/055.jpg",
        activity_intro: "上手い下手にこだわらない。アートを通じ自分らしさを愉しむ活動が、多くの人の心に寄り添いました。"
    },
    {
        name: "バッシーのパン作りワークショップ🥐",
        content: "バターロールパン作り",
        imageUrl: "./photo/251213/023.jpg",
        activity_intro: "焼き立てパンのいい香りに包まれるワークショップ。自分の手で作る楽しさを親子で満喫しました。"
    },
    {
        name: "日本の五節句 阿賀嶺 正子",
        content: "季節の彩り展示",
        imageUrl: "./photo/251213/054.jpg",
        activity_intro: "日本の五節句をテーマにした、季節の彩りを感じる展示。伝統文化の奥深さに触れる貴重な機会となりました。"
    },
    {
        name: "さささりん&ボブリ",
        content: "イラスト展示・グッズ販売",
        imageUrl: "./photo/251213/043.jpg",
        activity_intro: "高校生イラストレーターによる力強いイラスト。その溢れる才能に、これからの活躍を感じさせる出展でした。"
    },
    {
        name: "モモ",
        content: "缶バッジワークショップ",
        imageUrl: "./photo/251213/044.jpg",
        activity_intro: "世界に一つだけの缶バッジ！子どもたちが自分だけのデザインに夢中になっていました。"
    },
    {
        name: "nekozukitati🐱",
        content: "動物ブローチ販売",
        imageUrl: "./photo/251213/053.jpg",
        activity_intro: "ひとつひとつ違う表情のゆるかわ動物ブローチ。手作りの温もりが詰まった作品に癒されました。"
    },
    {
        name: "大城うた",
        content: "イラスト展示",
        imageUrl: "./photo/251213/052.jpg",
        imagePosition: "center 20%",
        activity_intro: "小学一年生の頃からアニメの絵を描くようになり、チェンソーマンやダンダダン、ジョジョの奇妙な物語、進撃の巨人、呪術廻戦などを描き始めると何時間でも集中して描きすすめています"
    },
    {
        name: "mimamorineko & CheePluss",
        content: "宝石石鹸・編み物グッズ",
        imageUrl: "./photo/251213/048.jpg",
        activity_intro: "本来の自分らしさを導く宝石石鹸や、心のこもった編み物グッズ。日々の暮らしを彩る素敵な作品が集まりました。"
    },
    {
        name: "りつ",
        content: "絵画作品展示",
        imageUrl: "./photo/251213/032.jpg",
        activity_intro: "表情豊かな絵画展示。個性溢れる筆使いが、見る人の想像力を掻き立てる空間を作りました。"
    },
    {
        name: "枯花（かればな）",
        content: "イラスト、作品展示",
        imageUrl: "./photo/251213/040.jpg",
        imagePosition: "top",
        activity_intro: "X（旧Twitter）を中心に活動。イラストを軸に、ハンドメイドや小説など幅広く手掛けるマルチな創作活動を展開。多彩な表現ジャンルを横断し、独自の世界観を会場に披露しました。"
    },
    {
        name: "中学生(中部地区)",
        content: "作品展示（小説・イラストなど）",
        imageUrl: "https://pbs.twimg.com/media/G7-RU1VagAM2Wd_?format=jpg&name=4096x4096",
        activity_intro: "多様な創作ジャンルに挑む中学生たち。感想のお礼として作成された「サンタの指輪」など、来場者との交流を大切にする温かな姿勢が注目を集めました。"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // すべての初期化関数をまとめたマスター関数
    function initializeWebsite() {
        initExhibitors(); // 出展者紹介の生成
        initGallery(); // ギャラリー生成
        initSlideshow();
        initScrollObserver();
        initPetalAnimation();
        initThemeSwitcher();
        initImageModal();
    }

    // 出展者紹介の自動生成
    function initExhibitors() {
        const exhibitorGrid = document.getElementById('exhibitorGrid');
        if (!exhibitorGrid) return;

        EXHIBITORS.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'exhibitor-card fade-in';

            card.innerHTML = `
                ${ex.imageUrl ? `<img src="${ex.imageUrl}" class="exhibitor-card__image" alt="${ex.name}" style="${ex.imagePosition ? `object-position: ${ex.imagePosition};` : ''}">` : '<div class="exhibitor-card__image" style="background:#ddd; display:flex; align-items:center; justify-content:center;">No Image</div>'}
                <div class="exhibitor-card__name">${ex.name}</div>
                <div class="exhibitor-card__content">${ex.content}</div>
                <div class="exhibitor-card__intro">${ex.activity_intro}</div>
            `;

            exhibitorGrid.appendChild(card);
        });
    }

    // ギャラリーの自動生成
    function initGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        for (let i = 1; i <= 69; i++) {
            // ゼロパディング（001, 002...）
            const num = i.toString().padStart(3, '0');
            const fileName = `${num}.jpg`;
            const filePath = `./photo/251213/${fileName}`;

            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = filePath;
            img.alt = `Gallery Image ${num}`;
            // 必要に応じてキャプション属性などを追加
            // img.setAttribute('data-caption', `Image ${num}`);

            item.appendChild(img);
            galleryGrid.appendChild(item);
        }
    }

    // スライドショーの初期化
    function initSlideshow() {
        const images = [
            './photo/251213/001.jpg',
            './photo/251213/002.jpg',
            './photo/251213/003.jpg',
            './photo/251213/004.jpg',
            './photo/251213/005.jpg'
        ];
        let currentIndex = 0;
        const slideshowImage = document.getElementById('footerSlideshowImage');
        const heroSlideshowImage = document.getElementById('heroSlideshowImage'); // ヒーロー用追加

        function changeImage() {
            if (slideshowImage) slideshowImage.src = images[currentIndex];
            if (heroSlideshowImage) heroSlideshowImage.src = images[currentIndex]; // ヒーロー用追加
            currentIndex = (currentIndex + 1) % images.length;
        }

        changeImage();
        setInterval(changeImage, 3000);
    }

    // スクロール時のフェードインアニメーションを初期化
    function initScrollObserver() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    // 花びらが舞うアニメーションを初期化
    function initPetalAnimation() {
        const petalCount = 15;
        const body = document.body;
        for (let i = 0; i < petalCount; i++) {
            setTimeout(() => {
                createPetal(body);
                setInterval(() => createPetal(body), 4000);
            }, Math.random() * 4000);
        }
        function createPetal(parent) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.left = `${Math.random() * 100}vw`;
            petal.style.animationDuration = `${Math.random() * 3 + 4}s`;
            petal.style.opacity = (Math.random() * 0.5 + 0.3).toString();
            parent.appendChild(petal);
            setTimeout(() => petal.remove(), 7000);
        }
    }

    // カラーテーマ切り替え機能を初期化
    function initThemeSwitcher() {
        const colorButtons = document.querySelectorAll('.color-btn');
        const body = document.body;
        const themeKey = 'okinawa-bungei-theme';
        const themes = ['yamabuki', 'mizuiro', 'uguisu', 'monochrome'];
        const savedTheme = localStorage.getItem(themeKey);
        if (savedTheme) {
            body.classList.add(savedTheme);
            colorButtons.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`[data-theme="${savedTheme}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        } else {
            document.querySelector('[data-theme="default"]').classList.add('active');
        }
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                colorButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                body.classList.remove(...themes);
                if (theme !== 'default') body.classList.add(theme);
                localStorage.setItem(themeKey, theme);
            });
        });
    }

    // 画像モーダル機能の初期化
    function initImageModal() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        const closeBtn = document.querySelector('.modal-close');
        // class="gallery-item" 内の img を対象にする
        const galleryImages = document.querySelectorAll('.gallery-item img');

        galleryImages.forEach(img => {
            // キャプション（data-caption）があればオーバーレイを追加
            const captionText = img.getAttribute('data-caption');
            if (captionText) {
                const overlay = document.createElement('div');
                overlay.className = 'gallery-caption-overlay';
                overlay.textContent = captionText;
                img.parentElement.appendChild(overlay);
            }

            img.addEventListener('click', () => {
                modal.classList.add('active');
                modalImg.src = img.src;
                // モーダルにキャプションを表示
                const modalCaption = document.getElementById('modalCaption');
                if (captionText) {
                    modalCaption.textContent = captionText;
                } else {
                    modalCaption.textContent = "";
                }
            });
        });

        // 閉じるボタン
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // 背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Escapeキーで閉じる
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Escape' || e.key === 'Esc') && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    // ページロード時にすべての機能を初期化
    initializeWebsite();
});
