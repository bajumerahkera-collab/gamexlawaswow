document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(masterData => {
            processAutomatedData(masterData);
            initBannerSlider();
        })
        .catch(error => console.error("Gagal memuat master data:", error));
});

function processAutomatedData(masterData) {
    const ONE_HOUR = 60 * 60 * 1000; 
    const now = new Date().getTime();
    
    let lastUpdate = localStorage.getItem('lawastoto_last_update');
    let savedGames = localStorage.getItem('lawastoto_games');
    let savedJackpots = localStorage.getItem('lawastoto_jackpots');

    if (!lastUpdate || !savedGames || !savedJackpots || (now - lastUpdate) > ONE_HOUR) {
        
        // 1. Pembuatan Data Acak Game (RTP, Online Player, Pola)
        const freshGames = masterData.masterGames.map((game, index) => {
            const randomRtp = Math.floor(Math.random() * (98 - 65 + 1)) + 65; 
            const randomOnline = (Math.random() * (25 - 2) + 2).toFixed(2); 
            
            const polaTemplates = [
                ["🟢 80X Spin Auto", "⚡ 180X Spin Turbo", "❌ 10X Spin Auto"],
                ["⚡ 5X Spin Manual", "🟢 30X Spin Manual", "⚡ 20X Spin Auto"],
                ["❌ 15X Spin Manual", "⚡ 50X Spin Turbo", "🟢 40X Spin Turbo"],
                ["🟢 20X Spin Turbo", "❌ 10X Spin Manual", "⚡ 80X Spin Auto"]
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

        // 2. Pembuatan Data Acak 10 Live Jackpot Terbaru beserta Gambar Asli Gamenya
        const freshJackpots = [];
        for (let i = 0; i < 10; i++) {
            const randomGameObj = masterData.masterGames[Math.floor(Math.random() * masterData.masterGames.length)];
            const randomUser = masterData.masterUsers[Math.floor(Math.random() * masterData.masterUsers.length)];
            
            const randomAmountNum = Math.floor(Math.random() * (35000000 - 1500000 + 1)) + 1500000;
            const formattedAmount = new Intl.NumberFormat('id-ID').format(randomAmountNum);

            freshJackpots.push({
                user: randomUser,
                game: randomGameObj.name,
                image: randomGameObj.image,
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

// Menampilkan list jackpot yang dilengkapi dengan miniatur gambar game agar valid/menarik
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#1f1f1f] p-2 rounded-xl flex items-center justify-between border border-gray-800/60";
        item.innerHTML = `
            <div class="flex items-center space-x-3">
                <!-- Mini thumbnail game agar mirip image_6b13c8.jpg -->
                <img src="${jp.image}" class="w-10 h-10 object-cover rounded-lg border border-blue-500/20">
                <div>
                    <p class="text-xs font-bold text-blue-400">${jp.user}</p>
                    <p class="text-[10px] text-gray-400 truncate max-w-[120px]">${jp.game}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-[11px] font-bold text-white">JP: <span class="text-blue-400">Rp ${jp.amount}</span></p>
                <p class="text-[9px] text-gray-500">WD: Rp ${jp.amount}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Menampilkan grid rekomendasi slot game
function renderGames(games) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    games.forEach(game => {
        // Teks pola diperbagus dengan badge khusus gelap list tepi biru samar
        const polaHtml = game.pola.map(p => `
            <p class="text-[10px] bg-black/60 border border-gray-800 py-1 rounded-md text-cyan-400 font-mono tracking-wide font-medium shadow-sm">${p}</p>
        `).join('');
        
        let barColor = "from-blue-600 to-cyan-400";
        if (game.rtp < 75) barColor = "from-yellow-600 to-amber-400";

        const card = document.createElement('div');
        // Gunakan aspect-square pada bungkus gambar agar tidak ketarik pipih/terpotong seperti image_602ef5.png
        card.className = "bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800/80 p-3 relative flex flex-col justify-between shadow-lg";
        card.innerHTML = `
            <div>
                <!-- Badge Live Player Atas Kanan -->
                <span class="absolute top-5 right-5 bg-black/85 text-[9px] text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold z-10">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> <span class="live-count">${game.online}</span>K Online
                </span>
                
                <!-- Mengatasi gambar terpotong: Menggunakan aspect-video / aspect-square + object-cover yang proporsional -->
                <div class="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-gray-800">
                    <img src="${game.image}" alt="${game.name}" class="w-full h-full object-cover transform hover:scale-105 transition duration-500">
                </div>
                
                <!-- Progress Bar RTP: Angka RTP dipastikan pas di tengah rata tengah (Absolute Center) -->
                <div class="w-full bg-gray-900 h-5 rounded-full overflow-hidden mb-3 relative flex items-center">
                    <div class="bg-gradient-to-r ${barColor} h-full transition-all duration-500" style="width: ${game.rtp}%"></div>
                    <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        RTP ${game.rtp}%
                    </span>
                </div>

                <!-- Desain Pola Baru -->
                <div class="space-y-1 mb-3 text-center">
                    ${polaHtml}
                </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="grid grid-cols-2 gap-2 mt-1">
                <button class="border border-blue-500/40 text-blue-400 text-[11px] py-1.5 rounded-xl font-bold hover:bg-blue-500/10 transition">Pola</button>
                <button class="neon-bg text-black text-[11px] py-1.5 rounded-xl font-bold">Main</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Logic Slider untuk Banner Foto Otomatis
function initBannerSlider() {
    const slides = document.querySelectorAll('#banner-slider .slide');
    if (slides.length === 0) return; // Jaga-jaga kalau foto belum dimasukkan
    
    let currentSlide = 0;

    setInterval(() => {
        // Sembunyikan foto lama
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');
        
        // Pindah ke foto berikutnya
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Tampilkan foto baru
        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }, 4000); // Banner berganti foto otomatis setiap 4 detik
}

// Simulasi variasi live player fluktuatif (beberapa detik sekali)
function startLiveSimulation() {
    setInterval(() => {
        const counts = document.querySelectorAll('.live-count');
        counts.forEach(count => {
            const currentNum = parseFloat(count.innerText);
            if(!isNaN(currentNum)) {
                const fluctuation = (Math.random() * 0.2 - 0.1).toFixed(2);
                let finalNum = (currentNum + parseFloat(fluctuation)).toFixed(2);
                if(finalNum < 1) finalNum = 2.45;
                count.innerText = finalNum;
            }
        });
    }, 5000);
}
