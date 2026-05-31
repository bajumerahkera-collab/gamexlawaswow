document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderApp(data);
        })
        .catch(err => console.error('Gagal memuat database:', err));
});

// Fungsi Generator Angka Acak Konsisten Berdasarkan Jam / Hari (Pseudo-Random Seed)
function getSeededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function renderApp(data) {
    const now = new Date();
    
    // Konversi waktu ke WIB (UTC+7) untuk standarisasi reset jam 00:00
    const wibOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
    
    const currentYear = wibTime.getFullYear();
    const currentMonth = wibTime.getMonth();
    const currentDate = wibTime.getDate();
    const currentHour = wibTime.getHours();

    // ID unik gabungan tanggal untuk pengacak harian (Reset setiap 00:00 WIB)
    const daySeed = currentYear * 10000 + (currentMonth + 1) * 100 + currentDate;
    // ID unik gabungan tanggal + jam untuk pengacak per 1 jam sekali
    const hourSeed = daySeed + currentHour;

    // ----------------------------------------------------
    // 1. OTOMATISASI LIST 5 JACKPOT TERAKHIR (Real-time Simulation)
    // ----------------------------------------------------
    const jpWrap = document.getElementById('render-jackpots');
    const userInitials = ["AN", "BU", "CH", "DA", "ED", "FA", "GI", "HE", "IR", "JU", "KI", "LO", "MO", "NU", "RE", "SU", "WI"];
    
    let jackpotHTML = "";
    for (let i = 0; i < 5; i++) {
        const seedValue = hourSeed + i;
        const randUser = userInitials[Math.floor(getSeededRandom(seedValue) * userInitials.length)];
        const randNum = Math.floor(getSeededRandom(seedValue + 1) * 900) + 100;
        const randEnd = Math.floor(getSeededRandom(seedValue + 2) * 9);
        
        const gameObj = data.pool_slots[Math.floor(getSeededRandom(seedValue + 3) * data.pool_slots.length)];
        
        const rawJp = Math.floor(getSeededRandom(seedValue + 4) * 12) + 3; // Rentang 3jt - 15jt
        const jpAmount = rawJp * 1000000;
        const wdAmount = jpAmount - (Math.floor(getSeededRandom(seedValue + 5) * 400) * 1000);

        jackpotHTML += `
            <div class="jp-item">
                <img src="${gameObj.img}" class="jp-profile-img" alt="Avatar">
                <div class="jp-info">
                    <div class="jp-user">${randUser}****${randEnd}</div>
                    <div class="jp-game">${gameObj.name} (${gameObj.provider})</div>
                </div>
                <div class="jp-values">
                    <div class="jp-amt">JP: Rp ${jpAmount.toLocaleString('id-ID')}</div>
                    <div class="jp-wd">WD: Rp ${wdAmount.toLocaleString('id-ID')}</div>
                </div>
            </div>
        `;
    }
    jpWrap.innerHTML = jackpotHTML;

    // ----------------------------------------------------
    // 2. OTOMATISASI URUTAN REKOMENDASI SLOT (Update Setiap Jam 00:00 WIB)
    // ----------------------------------------------------
    // Mengacak susunan list game bersumber dari pool_slots memakai daySeed (hanya berubah saat ganti hari)
    let recommendedSlots = [...data.pool_slots];
    for (let i = recommendedSlots.length - 1; i > 0; i--) {
        const j = Math.floor(getSeededRandom(daySeed + i) * (i + 1));
        [recommendedSlots[i], recommendedSlots[j]] = [recommendedSlots[j], recommendedSlots[i]];
    }
    
    // Ambil top 4 game hasil acakan hari ini untuk ditampilkan di halaman utama
    const slotsToShow = recommendedSlots.slice(0, 4);

    // ----------------------------------------------------
    // 3. OTOMATISASI ANGKA PERCENTAGE RTP & POLA SPIN (Update Setiap 1 Jam Sekali)
    // ----------------------------------------------------
    const slotWrap = document.getElementById('render-slots');
    slotWrap.innerHTML = slotsToShow.map((s, idx) => {
        const slotSeed = hourSeed + idx; // Unik per game per jam
        
        // Generator nilai RTP diatur logis di kisaran hoki (78% sampai 97%)
        const calculatedRtp = Math.floor(getSeededRandom(slotSeed) * (97 - 78 + 1)) + 78;
        
        // Generator angka pola secara otomatis
        const manualSpin = Math.floor(getSeededRandom(slotSeed + 1) * 25) + 5;
        const turboSpin = Math.floor(getSeededRandom(slotSeed + 2) * 150) + 30;
        const fastSpin = Math.floor(getSeededRandom(slotSeed + 3) * 50) + 10;
        
        const isPromo = getSeededRandom(slotSeed + 4) > 0.6;
        const activeOnline = (getSeededRandom(slotSeed + 5) * (20 - 5) + 5).toFixed(2);

        return `
            <div class="col-6">
                <div class="slot-card">
                    <div class="slot-img-wrap">
                        ${isPromo ? '<span class="badge-promo">HOT GAME</span>' : ''}
                        <span class="badge-online">${activeOnline}K Online</span>
                        <img src="${s.img}" alt="${s.name}">
                    </div>
                    <div class="slot-rtp-container">
                        <div class="slot-rtp-bar">
                            <div class="slot-rtp-progress" style="width: ${calculatedRtp}%;">${calculatedRtp}%</div>
                        </div>
                    </div>
                    <div class="pola-box">
                        <div class="pola-line"><span>Manual</span><span class="pola-val-man">${manualSpin}X</span></div>
                        <div class="pola-line"><span>Auto Turbo</span><span class="pola-val-auto">${turboSpin}X</span></div>
                        <div class="pola-line"><span>Auto Fast</span><span class="pola-val-auto">${fastSpin}X</span></div>
                    </div>
                    <div class="pola-hint">Klik Pola untuk lebih lengkap.</div>
                    <div class="slot-actions">
                        <button class="btn-pola">Pola</button>
                        <button class="btn-main-game" onclick="window.open('https://shorturl.at/YSBTy', '_blank')">Main</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 4. RENDER PROVIDERS & JALANKAN SLIDERS
    const providerWrap = document.getElementById('render-providers');
    providerWrap.innerHTML = data.providers.map(p => `
        <li class="splide__slide"><div class="provider-card"><img src="${p.img}" alt="${p.name}"></div></li>
    `).join('');

    new Splide('#providerSlide', {
        type: 'slide', perPage: 3, perMove: 1, gap: '10px', arrows: true, pagination: false,
        breakpoints: { 576: { perPage: 2.5 }, 768: { perPage: 3 } }
    }).mount();

    new Splide('#mainSlide', { type: 'loop', autoplay: true, interval: 3000, arrows: false, pagination: true }).mount();

    // 5. RENDER MANUAL KHUSUS GALERI BUKTI JP (Tetap manual agar foto asli valid)
    const galleryWrap = document.getElementById('render-bukti-gallery');
    galleryWrap.innerHTML = data.bukti_jp.map(b => `
        <div class="col-12 col-sm-6">
            <div class="gallery-card shadow">
                <img src="${b.img}" class="gallery-img" alt="Bukti Transfer">
                <div class="gallery-title">${b.title}</div>
            </div>
        </div>
    `).join('');
}

function switchPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    if(pageId === 'home') {
        document.getElementById('page-home').classList.remove('d-none');
        document.getElementById('nav-home').classList.add('active');
    } else if(pageId === 'buktijp') {
        document.getElementById('page-buktijp').classList.remove('d-none');
        document.getElementById('nav-buktijp').classList.add('active');
    }
}
