// INISIALISASI DATABASE FIREBASE (Dari Proyek gamelawaswow)
const firebaseConfig = {
  apiKey: "AIzaSyCEbmZLDH6mQ-baQM4b58z_89bhBy3ggb8",
  authDomain: "gamelawaswow.firebaseapp.com",
  databaseURL: "https://gamelawaswow-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gamelawaswow",
  storageBucket: "gamelawaswow.firebasestorage.app",
  messagingSenderId: "1027106854763",
  appId: "1:1027106854763:web:6b59883c73733da4c6de2e",
  measurementId: "G-76ZEXGLM6T"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(res => res.json())
        .then(data => renderApp(data))
        .catch(err => console.error('Gagal memuat JSON:', err));
});

// Generator Angka Acak Berdasarkan Rumus Waktu HP User (Seed-based)
function getSeededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function renderApp(data) {
    const now = new Date();
    // Normalisasi standarisasi waktu ke format zona WIB (UTC+7)
    const wibOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
    
    const daySeed = wibTime.getFullYear() * 10000 + (wibTime.getMonth() + 1) * 100 + wibTime.getDate();
    const hourSeed = daySeed + wibTime.getHours();

    // 1. GENERATOR LIVE LIST PEMENANG JACKPOT (Otomatis Acak per Jam)
    const jpWrap = document.getElementById('render-jackpots');
    const initials = ["ID", "JU", "SL", "MA", "BO", "RE", "FE", "RI", "KI", "CE", "ZA", "OP", "LI"];
    let jpHTML = "";
    
    for (let i = 0; i < 5; i++) {
        const seedVal = hourSeed + i;
        const user = initials[Math.floor(getSeededRandom(seedVal) * initials.length)] + "****" + Math.floor(getSeededRandom(seedVal + 1) * 9);
        const game = data.pool_slots[Math.floor(getSeededRandom(seedVal + 2) * data.pool_slots.length)];
        const jp = (Math.floor(getSeededRandom(seedVal + 3) * 12) + 3) * 1000000;
        const wd = jp - (Math.floor(getSeededRandom(seedVal + 4) * 200) * 1000);

        jpHTML += `
            <div class="jp-item">
                <img src="${game.img}" class="jp-profile-img">
                <div class="jp-info">
                    <div class="jp-user">${user}</div>
                    <div class="jp-game">${game.name} (${game.provider})</div>
                </div>
                <div class="jp-values">
                    <div class="jp-amt">JP: Rp ${jp.toLocaleString('id-ID')}</div>
                    <div class="jp-wd">WD: Rp ${wd.toLocaleString('id-ID')}</div>
                </div>
            </div>
        `;
    }
    jpWrap.innerHTML = jpHTML;

    // 2. OTOMATISASI LIST SLOT (Update Urutan Game Setiap Jam 00:00 WIB)
    let shuffled = [...data.pool_slots];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(getSeededRandom(daySeed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedSlots = shuffled.slice(0, 4);

    // 3. GENERATOR RTP BAR & ANGKA POLA SPIN (Otomatis Ganti Angka Setiap 1 Jam)
    const slotWrap = document.getElementById('render-slots');
    slotWrap.innerHTML = selectedSlots.map((s, idx) => {
        const sSeed = hourSeed + idx;
        const rtp = Math.floor(getSeededRandom(sSeed) * (98 - 77 + 1)) + 77;
        const man = Math.floor(getSeededRandom(sSeed + 1) * 20) + 5;
        const turbo = Math.floor(getSeededRandom(sSeed + 2) * 100) + 20;
        const fast = Math.floor(getSeededRandom(sSeed + 3) * 40) + 10;
        const online = (getSeededRandom(sSeed + 4) * 15 + 3).toFixed(1);

        return `
            <div class="col-6">
                <div class="slot-card">
                    <div class="slot-img-wrap">
                        <span class="badge-online">${online}K Live</span>
                        <img src="${s.img}">
                    </div>
                    <div class="slot-rtp-container">
                        <div class="slot-rtp-bar">
                            <div class="slot-rtp-progress" style="width: ${rtp}%;">${rtp}%</div>
                        </div>
                    </div>
                    <div class="pola-box">
                        <div class="pola-line"><span>Manual</span><span>${man}X</span></div>
                        <div class="pola-line"><span>Turbo</span><span>${turbo}X</span></div>
                        <div class="pola-line"><span>Fast</span><span>${fast}X</span></div>
                    </div>
                    <div class="slot-actions">
                        <button class="btn-main-game" onclick="window.open('https://shorturl.at/YSBTy', '_blank')">MAIN</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 4. RENDER PROVIDER SLIDER
    document.getElementById('render-providers').innerHTML = data.providers.map(p => `
        <li class="splide__slide"><div class="provider-card"><img src="${p.img}"></div></li>
    `).join('');

    new Splide('#providerSlide', { type: 'slide', perPage: 3, gap: '8px', arrows: false, pagination: false }).mount();
    new Splide('#mainSlide', { type: 'loop', autoplay: true, interval: 3000, arrows: false }).mount();

    // 5. PENARIK DATA LIVE BUKTI JP REALTIME (SISTEM BLOGGER DARI DASHBOARD ADMIN)
    const galleryWrap = document.getElementById('render-bukti-gallery');
    database.ref('bukti_jp').on('value', (snapshot) => {
        const posts = snapshot.val();
        if (!posts) {
            galleryWrap.innerHTML = '<div class="col-12 text-center text-muted small py-5">Belum ada postingan bukti kemenangan baru.</div>';
            return;
        }
        const items = Object.keys(posts).map(k => posts[k]).reverse();
        galleryWrap.innerHTML = items.map(b => `
            <div class="col-12 col-sm-6">
                <div class="gallery-card shadow">
                    <img src="${b.img}" class="gallery-img">
                    <div class="gallery-title">${b.title} <br><small class="text-white-50" style="font-size:0.7rem;">Tanggal: ${b.date}</small></div>
                </div>
            </div>
        `).join('');
    });
}

// Navigasi Pindah Halaman SPA
function switchPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    if(pageId === 'home') {
        document.getElementById('page-home').classList.remove('d-none');
        document.getElementById('nav-home').classList.add('active');
    } else {
        document.getElementById('page-buktijp').classList.remove('d-none');
        document.getElementById('nav-buktijp').classList.add('active');
    }
}
