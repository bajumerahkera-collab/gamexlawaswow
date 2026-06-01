document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(masterData => {
            renderProviderSlider(masterData.masterGames);
            processAutomatedData(masterData);
            initBannerSlider();
        })
        .catch(error => console.error("Gagal memuat master data:", error));
});

// 1. RENDER & LOGIC PROVIDER SLIDE OTOMATIS KE SAMPING
function renderProviderSlider(games) {
    const track = document.getElementById('provider-track');
    // Ambil daftar unik provider dari master data game
    const uniqueProviders = [...new Set(games.map(g => g.provider))];
    
    let trackContent = '';
    uniqueProviders.forEach(provider => {
        trackContent += `
            <div class="inline-block min-w-[130px] bg-[#1e1e1e] py-2.5 px-4 rounded-xl border border-gray-800 text-center font-bold text-xs text-blue-400 font-sans tracking-wide">
                ${provider.toUpperCase()}
            </div>
        `;
    });
    
    // Gandakan konten agar efek infinite scroll-nya mulus tanpa putus
    track.innerHTML = trackContent + trackContent;
}

function processAutomatedData(masterData) {
    const ONE_HOUR = 60 * 60 * 1000; 
    const now = new Date().getTime();
    
    let lastUpdate = localStorage.getItem('lawastoto_last_update');
    let savedGames = localStorage.getItem('lawastoto_games');
    let savedJackpots = localStorage.getItem('lawastoto_jackpots');

    if (!lastUpdate || !savedGames || !savedJackpots || (now - lastUpdate) > ONE_HOUR) {
        
        const freshGames = masterData.masterGames.map((game, index) => {
            const randomRtp = Math.floor(Math.random() * (98 - 65 + 1)) + 65; 
            const randomOnline = (Math.random() * (25 - 2) + 2).toFixed(2); 
            
            const polaTemplates = [
                ["🟢 80X Spin Auto", "⚡ 180X Spin Turbo", "❌ 10X Spin Auto"],
                ["⚡ 5X Spin Manual", "🟢 30X Spin Manual", "⚡ 20X Spin Auto"],
                ["❌ 15X Spin Manual", "⚡ 50X Spin Turbo", "🟢 40X Spin Turbo"]
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

        // 2. DATA JACKPOT LENGKAP DENGAN DATA TANGGAL & JAM SEKARANG
        const freshJackpots = [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        for (let i = 0; i < 10; i++) {
            const randomGameObj = masterData.masterGames[Math.floor(Math.random() * masterData.masterGames.length)];
            const randomUser = masterData.masterUsers[Math.floor(Math.random() * masterData.masterUsers.length)];
            
            // Generate simulasi waktu random mundur beberapa menit ke belakang
            const dateObj = new Date(now - (i * 12 * 60 * 1000));
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
        localStorage.setItem('lawastoto_jackpots', JSON.stringify(freshJackpots));
        localStorage.setItem('lawastoto_last_update', now);

        savedGames = JSON.stringify(freshGames);
        savedJackpots = JSON.stringify(freshJackpots);
    }

    renderJackpots(JSON.parse(savedJackpots));
    renderGames(JSON.parse(savedGames));
    startLiveSimulation();
}

// 3. TAMPILAN 10 JACKPOT SEPERTI image_601474.png (ADA JAM, TANGGAL & GAME)
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#1f1f1f] p-2.5 rounded-xl flex items-center justify-between border border-gray-800/80 shadow-inner";
        item.innerHTML = `
            <div class="flex items-center space-x-3 min-w-0">
                <!-- Desain melingkar proporsional -->
                <img src="${jp.image}" class="w-12 h-12 object-cover rounded-xl border border-gray-700 flex-shrink-0">
                <div class="min-w-0 flex flex-col justify-center">
                    <p class="text-xs font-bold text-blue-400 truncate">${jp.user}</p>
                    <p class="text-[10px] text-gray-300 font-medium">${jp.date}</p>
                    <p class="text-[10px] text-gray-500 truncate max-w-[130px] font-light">${jp.game}</p>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <p class="text-xs font-black text-white">JP: <span class="text-blue-400">Rp ${jp.amount}</span></p>
                <p class="text-[10px] text-gray-500 font-semibold">WD: Rp ${jp.amount}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// 4. GRID GAME DENGAN IMAGE PAS SQUARED (ANTI-KEPOTONG BORDER HITAM)
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
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> <span class="live-count">${game.online}</span>K Online
                </span>
                
                <!-- FIX KEPOTONG: dikunci pakai w-full aspect-square agar presisi mengikuti bentuk box gambar slot asli -->
                <div class="w-full aspect-square rounded-xl overflow-hidden mb-3 border border-gray-800/80">
                    <img src="${game.image}" alt="${game.name}" class="w-full h-full object-cover">
                </div>
                
                <!-- RTP BAR CENTERED -->
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

function startLiveSimulation() {
    setInterval(() => {
        const counts = document.querySelectorAll('.live-count');
        counts.forEach(count => {
            const currentNum = parseFloat(count.innerText);
            if(!isNaN(currentNum)) {
                const fluctuation = (Math.random() * 0.2 - 0.1).toFixed(2);
                let finalNum = (currentNum + parseFloat(fluctuation)).toFixed(2);
                if(finalNum < 1) finalNum = 3.50;
                count.innerText = finalNum;
            }
        });
    }, 5000);
}
