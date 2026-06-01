document.addEventListener("DOMContentLoaded", () => {
    // Memaksa hapus cache lama agar tulisan 'undefined' hilang total
    localStorage.clear(); 

    fetch('data.json')
        .then(response => response.json())
        .then(masterData => {
            renderProviderSlider(masterData.masterGames);
            processAutomatedData(masterData);
            initBannerSlider();
        })
        .catch(error => console.error("Gagal memuat master data:", error));
});

// 1. RENDER PROVIDER SLIDER
function renderProviderSlider(games) {
    const track = document.getElementById('provider-track');
    const uniqueProviders = [...new Set(games.map(g => g.provider))];
    
    let trackContent = '';
    uniqueProviders.forEach(provider => {
        trackContent += `
            <div class="inline-block min-w-[130px] bg-[#1e1e1e] py-2.5 px-4 rounded-xl border border-gray-800 text-center font-bold text-xs text-blue-400 tracking-wide">
                ${provider.toUpperCase()}
            </div>
        `;
    });
    track.innerHTML = trackContent + trackContent;
}

// 2. PROSES AUTOMATED DATA
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

    // MEMBUAT DATA TANGGAL DAN JAM LIVE YANG VALID
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

    renderJackpots(freshJackpots);
    renderGames(freshGames);
}

// 3. RENDER LIVE JACKPOT (FIXED IMAGE & UNDEFINED)
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#1f1f1f] p-2.5 rounded-xl flex items-center justify-between border border-gray-800/80 shadow-md";
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

// 4. RENDER GRID GAME
function renderGames(games) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

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

function initBannerSlider() {
    const slides = document.querySelectorAll('#banner-slider .slide');
    if (slides.length === 0) return;
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }, 4000);
}
