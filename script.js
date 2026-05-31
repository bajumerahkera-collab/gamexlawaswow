// Mengambil data dari data.json saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderJackpots(data.jackpots);
            renderGames(data.games);
            startLiveSimulation();
        })
        .catch(error => console.error("Gagal memuat data template:", error));
});

// Fungsi menampilkan daftar 10 Jackpot Terakhir
function renderJackpots(jackpots) {
    const container = document.getElementById('jackpot-container');
    container.innerHTML = '';
    
    jackpots.forEach(jp => {
        const item = document.createElement('div');
        item.className = "bg-[#222] p-3 rounded-xl flex justify-between items-center border-l-4 border-blue-500 animate-fade-in";
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

// Fungsi menampilkan Grid Game Slot & Pola RTP
function renderGames(games) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    games.forEach(game => {
        // Buat list element untuk kumpulan pola spin
        const polaHtml = game.pola.map(p => `<p class="text-[10px] bg-black/50 py-1 rounded text-blue-400 font-mono tracking-wide">${p}</p>`).join('');
        
        const card = document.createElement('div');
        card.className = "bg-[#1e1e1e] rounded-2xl overflow-hidden border border-gray-800 p-3 relative flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <!-- Badge Live Player -->
                <span class="absolute top-4 right-4 bg-black/80 text-[9px] text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold live-player">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> ${game.online}K Online
                </span>
                
                <!-- Thumbnail Game -->
                <img src="${game.image}" alt="${game.name}" class="w-full h-28 object-cover rounded-xl mb-3 border border-gray-800">
                
                <!-- Progress Bar RTP -->
                <div class="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-3 relative flex items-center">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-400 h-full text-[9px] flex items-center justify-center font-black text-black" style="width: ${game.rtp}%">
                        ${game.rtp}%
                    </div>
                </div>

                <!-- Wadah Pola -->
                <div class="space-y-1 mb-3 text-center">
                    ${polaHtml}
                </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="grid grid-cols-2 gap-2 mt-2">
                <button class="border border-blue-500/50 text-blue-400 text-[11px] py-1.5 rounded-lg font-bold hover:bg-blue-500/10 transition">Pola</button>
                <button class="neon-bg text-black text-[11px] py-1.5 rounded-lg font-bold">Main</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Simulasi realtime update berkala biar data bergerak interaktif
function startLiveSimulation() {
    setInterval(() => {
        const liveBadges = document.querySelectorAll('.live-player');
        liveBadges.forEach(badge => {
            // Mengubah digit player online secara berkala (+/- 0.5K)
            const currentText = badge.innerText.replace('K Online', '').trim();
            const currentNum = parseFloat(currentText);
            if(!isNaN(currentNum)) {
                const change = (Math.random() * (0.4) - 0.2).toFixed(2);
                const newNum = Math.max(1.0, currentNum + parseFloat(change)).toFixed(2);
                badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> ${newNum}K Online`;
            }
        });
    }, 4000);
}
