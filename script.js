// Variabel Global untuk state aplikasi
let currentSlideIndex = 0;
let slideInterval;
let allGamesData = []; 
let activeProviderFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
    localStorage.clear(); // Bersihkan sisa data 'undefined' lama

    fetch('data.json')
        .then(response => response.json())
        .then(masterData => {
            allGamesData = masterData.masterGames;
            
            // Render menu klik provider & data awal
            renderProviderSlider(masterData.masterGames);
            processAutomatedData(masterData);
            
            // Jalankan banner slideshow ultra-wide
            initBannerSlider();
        })
        .catch(error => console.error("Gagal memuat master data:", error));
});

// 1. LOGIC RENDER PROVIDER DENGAN LOGO + EVENT KLIK FILTER GACOR
function renderProviderSlider(games) {
    const track = document.getElementById('provider-track');
    const uniqueProviders = [...new Set(games.map(g => g.provider))];
    
    // Mapping URL Logo Official Provider biar gampang dicerna visualnya
    const providerLogos = {
        "Pragmatic Play": "https://www.vhv.rs/dpng/d/423-4237801_pragmatic-play-2018-logo-hd-png-download.png",
        "PG Soft": "https://img.viva88athenae.com/pg-w.png",
        "Habanero": "https://img.viva88athenae.com/hb-w.png",
        "Joker Gaming": "https://img.viva88athenae.com/jg-w.png"
    };

    let trackContent = `
        <div onclick="filterByProvider('ALL', this)" class="provider-btn inline-flex items-center space-x-2 bg-blue-600/20 border-2 border-blue-500 py-1.5 px-4 rounded-xl text-center font-bold text-xs text-blue-400 cursor-pointer transition select-none">
            <span>✨ ALL GAMES</span>
        </div>
    `;

    uniqueProviders.forEach(provider => {
        // Cari logo, jika tidak terdaftar pakai text backup standar
        const logoUrl = providerLogos[provider] || "https://placehold.co/80x30/1e1e1e/3b82f6?text=" + provider;
        
        trackContent += `
            <div onclick="filterByProvider('${provider}', this)" class="provider-btn inline-flex items-center space-x-2 bg-[#1e1e1e] border border-gray-800 py-1.5 px-4 rounded-xl text-center font-bold text-xs text-gray-400 hover:text-blue-400 hover:border-gray-700 cursor-pointer transition select-none">
                <img src="${logoUrl}" alt="${provider}" class="h-4 object-contain max-w-[70px]" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <span class="hidden text-[11px]">${provider.toUpperCase()}</span>
            </div>
        `;
    });
    
    // Satukan ke track slider
    track.innerHTML = trackContent;
}

// Fungsi Eksekusi ketika Logo Provider di-klik
function filterByProvider(providerName, element) {
    activeProviderFilter = providerName;
    
    // Ubah highlight border tombol aktif
    document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-600/20', 'text-blue-400');
        btn.classList.add('border-gray-800', 'bg-[#1e1e1e]', 'text-gray-400');
    });
    element.classList.remove('border-gray-800', 'bg-[#1e1e1e]', 'text-gray-400');
    element.classList.add('border-blue-500', 'bg-blue-600/20', 'text-blue-400');

    // Ambil data game lokal yang sudah memiliki live RTP hasil generate
    const savedGames = JSON.parse(localStorage.getItem('lawastoto_games')) || [];
    
    if (providerName === 'ALL') {
        renderGames(savedGames);
    } else {
        const filtered = savedGames.filter(g => g.provider === providerName);
        renderGames(filtered);
    }
}

// 2. MANAGEMENT LIVE DATA GENERATOR
function processAutomatedData(masterData) {
    const now = new Date().getTime();
    
    const freshGames = masterData.masterGames.map((game, index) => {
        const randomRtp = Math.floor(Math.random() * (98 - 65 + 1)) + 65; 
        const randomOnline = (Math.random() * (25 - 2) + 2).toFixed(2); 
        
        const polaTemplates = [
            ["🟢 80X Spin Auto", "⚡ 180X Spin Turbo", "❌ 10X Spin Auto"],
            ["⚡ 5X Spin Manual", "🟢 30X Spin Manual", "⚡ 20X Spin Auto"]
        ];
        const randomPola = polaTemplates[Math.floor(Math.random() * polaTemplates.length)];

        return {
            id: index + 1,
            name: game.name,
            provider: game.provider,
            image: game.image,
            rtp: randomRtp,
            online: randomOnline,
            pola: randomPola
        };
    });

    const freshJackpots = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 10; i++) {
        const randomGameObj = masterData.masterGames[Math.floor(Math.random() * masterData.masterGames.length)];
        const randomUser = masterData.masterUsers[Math.floor(Math.random() * masterData.masterUsers.length)];
        
        const dateObj = new Date(now - (i * 15 * 60 * 1000));
        const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

        const randomAmountNum = Math.floor(Math.random() * (25000000 - 3000000 + 1)) + 3000000;
        const formattedAmount = new Intl.NumberFormat('id-ID').format(randomAmountNum);

        freshJackpots.push({
            user: randomUser,
            game: randomGameObj.name,
            image: randomGameObj.image,
            date: formattedDate,
            amount: formattedAmount
        });
    }

    localStorage.setItem('lawastoto_games', JSON.stringify(freshGames));
    renderJackpots(freshJackpots);
    renderGames(freshGames); 
}

// 3. RENDER LIVE JP LIST
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#1f1f1f] p-2.5 rounded-xl flex items-center justify-between border border-gray-800/80";
        item.innerHTML = `
            <div class="flex items-center space-x-3 min-w-0">
                <img src="${jp.image}" onerror="this.src='https://placehold.co/150'" class="w-12 h-12 object-cover rounded-xl border border-gray-700 flex-shrink-0">
                <div class="min-w-0 flex flex-col justify-center">
                    <p class="text-xs font-bold text-blue-400 truncate">${jp.user}</p>
                    <p class="text-[10px] text-gray-300 font-medium">${jp.date}</p>
                    <p class="text-[10px] text-gray-500 truncate max-w-[140px] font-light">${jp.game}</p>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <p class="text-xs font-black text-white">JP: <span class="text-emerald-400">Rp ${jp.amount}</span></p>
                <p class="text-[10px] text-gray-500 font-semibold">WD: Rp ${jp.amount}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// 4. RENDER GRID GAME SLOT BOX (SQUARE ANTI-POTONG BORDER)
function renderGames(games) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    if (games.length === 0) {
        container.innerHTML = `<p class="col-span-2 text-center text-xs text-gray-500 py-8">Belum ada game dari provider ini.</p>`;
        return;
    }

    games.forEach(game => {
        const polaHtml = game.pola.map(p => `
            <p class="text-[10px] bg-[#141414] border border-gray-800/60 py-1.5 rounded-lg text-cyan-400 font-mono font-bold">${p}</p>
        `).join('');
        
        let barColor = "from-blue-600 to-cyan-400";
        if (game.rtp < 75) barColor = "from-yellow-600 to-amber-400";

        const card = document.createElement('div');
        card.className = "bg-[#1e1e1e] rounded-2xl border border-gray-800/80 p-3 relative flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <span class="absolute top-5 right-5 bg-black/85 text-[9px] text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold z-10">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> ${game.online}K Online
                </span>
                
                <div class="w-full aspect-square rounded-xl overflow-hidden mb-3 border border-gray-800/80 bg-gray-900">
                    <img src="${game.image}" onerror="this.src='https://placehold.co/150'" alt="${game.name}" class="w-full h-full object-cover">
                </div>
                
                <div class="w-full bg-gray-900 h-5 rounded-md overflow-hidden mb-3 relative flex items-center">
                    <div class="bg-gradient-to-r ${barColor} h-full" style="width: ${game.rtp}%"></div>
                    <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white tracking-wider drop-shadow-md">
                        RTP ${game.rtp}%
                    </span>
                </div>

                <div class="space-y-1 mb-3 text-center">
                    ${polaHtml}
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-1">
                <button class="border border-blue-500/40 text-blue-400 text-[11px] py-1.5 rounded-xl font-bold">Pola</button>
                <button class="neon-bg text-black text-[11px] py-1.5 rounded-xl font-bold">Main</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 5. MANUAL & AUTOMATIC INTERACTIVE SLIDER (PERSIS BANNER MADETOTO)
function initBannerSlider() {
    const slides = document.querySelectorAll('#banner-slider .slide');
    const dotsContainer = document.getElementById('slide-dots');
    if (slides.length === 0) return;

    // Buat indikator titik bulat di bawah banner
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-white w-3' : 'bg-white/40'}`;
        dot.setAttribute('onclick', `goToSlide(${idx})`);
        dot.style.cursor = 'pointer';
        dotsContainer.appendChild(dot);
    });

    startAutoSlide();
}

function updateSlideVisibility() {
    const slides = document.querySelectorAll('#banner-slider .slide');
    const dots = document.querySelectorAll('#slide-dots div');
    
    slides.forEach((slide, idx) => {
        if (idx === currentSlideIndex) {
            slide.classList.remove('opacity-0');
            slide.classList.add('opacity-100');
            if(dots[idx]) {
                dots[idx].classList.remove('bg-white/40', 'w-1.5');
                dots[idx].classList.add('bg-white', 'w-3');
            }
        } else {
            slide.classList.remove('opacity-100');
            slide.classList.add('opacity-0');
            if(dots[idx]) {
                dots[idx].classList.remove('bg-white', 'w-3');
                dots[idx].classList.add('bg-white/40', 'w-1.5');
            }
        }
    });
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('#banner-slider .slide');
    clearInterval(slideInterval);
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    updateSlideVisibility();
    startAutoSlide();
}

function goToSlide(index) {
    clearInterval(slideInterval);
    currentSlideIndex = index;
    updateSlideVisibility();
    startAutoSlide();
}

function startAutoSlide() {
    const slides = document.querySelectorAll('#banner-slider .slide');
    slideInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSlideVisibility();
    }, 5000); 
}
