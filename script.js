document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(masterData => {
            processAutomatedData(masterData);
        })
        .catch(error => console.error("Gagal memuat master data:", error));
});

function processAutomatedData(masterData) {
    const ONE_HOUR = 60 * 60 * 1000; // Jam dalam milidetik
    const now = new Date().getTime();
    
    // Ambil data lama & waktu update terakhir dari browser storage
    let lastUpdate = localStorage.getItem('lawastoto_last_update');
    let savedGames = localStorage.getItem('lawastoto_games');
    let savedJackpots = localStorage.getItem('lawastoto_jackpots');

    // Jika belum ada data ATAU waktu sudah lewat dari 1 jam, kita acak ulang semuanya
    if (!lastUpdate || !savedGames || !savedJackpots || (now - lastUpdate) > ONE_HOUR) {
        
        // 1. Acak Data Games (RTP, Online, Pola)
        const freshGames = masterData.masterGames.map((game, index) => {
            const randomRtp = Math.floor(Math.random() * (98 - 65 + 1)) + 65; // Acak RTP 65% sampai 98%
            const randomOnline = (Math.random() * (25 - 2) + 2).toFixed(2); // Acak 2.00K sampai 25.00K Online
            
            // Kumpulan template pola random
            const polaTemplates = [
                ["80X Spin Auto", "180X Spin Auto", "10X Spin Auto"],
                ["5X Spin Manual", "30X Spin Manual", "20X Spin Auto"],
                ["15X Spin Manual", "50X Spin Auto", "40X Spin Turbo"],
                ["20X Spin Turbo", "10X Spin Manual", "80X Spin Auto"],
                ["50X Spin Auto", "20X Spin Turbo", "15X Spin Auto"]
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

        // 2. Acak Data 10 Jackpot Terakhir
        const freshJackpots = [];
        for (let i = 0; i < 10; i++) {
            const randomUser = masterData.masterUsers[Math.floor(Math.random() * masterData.masterUsers.length)];
            const randomGame = masterData.masterGames[Math.floor(Math.random() * masterData.masterGames.length)].name;
            
            // Bikin nominal JP acak antara 2.000.000 sampai 50.000.000
            const randomAmountNum = Math.floor(Math.random() * (50000000 - 2000000 + 1)) + 2000000;
            const formattedAmount = new Intl.NumberFormat('id-ID').format(randomAmountNum);

            freshJackpots.push({
                user: randomUser,
                game: randomGame,
                amount: formattedAmount
            });
        }

        // Simpan data hasil acakan baru ke storage browser agar bertahan selama 1 jam ke depan
        localStorage.setItem('lawastoto_games', JSON.stringify(freshGames));
        localStorage.setItem('lawastoto_jackpots', JSON.stringify(freshJackpots));
        localStorage.setItem('lawastoto_last_update', now);

        savedGames = JSON.stringify(freshGames);
        savedJackpots = JSON.stringify(freshJackpots);
    }

    // Tampilkan data ke halaman web
    renderJackpots(JSON.parse(savedJackpots));
    renderGames(JSON.parse(savedGames));
}

// Fungsi Render List Jackpot ke HTML
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#222] p-3 rounded-xl flex justify-between items-center border-l-4 border-blue-500";
        item.innerHTML = `
            <div>
                <p class="text-xs font-bold text-blue-400">${jp.user}</p>
                <p class="text-[10px] text-gray-400">${jp.game}</p>
            </div>
            <div class="text-right">
                <p class="text-xs font-bold text-white">JP: <span class="text-blue-400">Rp ${jp.amount}</span></p>
                <p class="text-[10px] text-gray-500">WD: Rp ${jp.amount}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Fungsi Render Grid Game ke HTML
function renderGames(games) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    games.forEach(game => {
        const polaHtml = game.pola.map(p => `<p class="text-[10px] bg-black/50 py-1 rounded text-blue-400 font-mono tracking-wide">${p}</p>`).join('');
        
        // Tentukan warna bar RTP berdasarkan tinggi rendahnya persentase
        let barColor = "from-blue-600 to-blue-400";
        if (game.rtp < 75) barColor = "from-amber-600 to-yellow-400";

        const card = document.createElement('div');
        card.className = "bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800 p-3 relative flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <span class="absolute top-4 right-4 bg-black/80 text-[9px] text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> ${game.online}K Online
                </span>
                
                <img src="${game.image}" alt="${game.name}" class="w-full h-28 object-cover rounded-xl mb-3 border border-gray-800">
                
                <div class="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-3 relative flex items-center">
                    <div class="bg-gradient-to-r ${barColor} h-full text-[9px] flex items-center justify-center font-black text-black" style="width: ${game.rtp}%">
                        ${game.rtp}%
                    </div>
                </div>

                <div class="space-y-1 mb-3 text-center">
                    ${polaHtml}
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-2">
                <button class="border border-blue-500/50 text-blue-400 text-[11px] py-1.5 rounded-lg font-bold hover:bg-blue-500/10 transition">Pola</button>
                <button class="neon-bg text-black text-[11px] py-1.5 rounded-lg font-bold">Main</button>
            </div>
        `;
        container.appendChild(card);
    });
}
