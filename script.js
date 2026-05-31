document.addEventListener('DOMContentLoaded', () => {
    // Ambil data secara live dari file JSON harian
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderApp(data);
        })
        .catch(err => console.error('Gagal memuat database JSON harian:', err));
});

function renderApp(data) {
    // 1. RENDER SLIDER PROVIDERS
    const providerWrap = document.getElementById('render-providers');
    providerWrap.innerHTML = data.providers.map(p => `
        <li class="splide__slide">
            <div class="provider-card">
                <img src="${p.img}" alt="${p.name}">
            </div>
        </li>
    `).join('');

    // Inisialisasi Slider Provider
    new Splide('#providerSlide', {
        type: 'slide', perPage: 3, perMove: 1, gap: '10px', arrows: true, pagination: false,
        breakpoints: { 576: { perPage: 2.5 }, 768: { perPage: 3 } }
    }).mount();

    // Inisialisasi Banner Atas
    new Splide('#mainSlide', { type: 'loop', autoplay: true, interval: 3000, arrows: false, pagination: true }).mount();

    // 2. RENDER 5 JACKPOT TERAKHIR
    const jpWrap = document.getElementById('render-jackpots');
    jpWrap.innerHTML = data.jackpots.slice(0, 5).map(j => `
        <div class="jp-item">
            <img src="${j.avatar}" class="jp-profile-img" alt="User">
            <div class="jp-info">
                <div class="jp-user">${j.user}</div>
                <div class="jp-game">${j.game}</div>
            </div>
            <div class="jp-values">
                <div class="jp-amt">JP: ${j.jp}</div>
                <div class="jp-wd">WD: ${j.wd}</div>
            </div>
        </div>
    `).join('');

    // 3. RENDER REKOMENDASI SLOT & POLA
    const slotWrap = document.getElementById('render-slots');
    slotWrap.innerHTML = data.slots.map(s => `
        <div class="col-6">
            <div class="slot-card">
                <div class="slot-img-wrap">
                    ${s.promo ? '<span class="badge-promo">PROMO</span>' : ''}
                    <span class="badge-online">${s.online} Online</span>
                    <img src="${s.img}" alt="${s.name}">
                </div>
                <div class="slot-rtp-container">
                    <div class="slot-rtp-bar">
                        <div class="slot-rtp-progress" style="width: ${s.rtp}%;">${s.rtp}%</div>
                    </div>
                </div>
                <div class="pola-box">
                    ${s.pola.map(p => {
                        const split = p.split(':');
                        const isAuto = split[0].toLowerCase().includes('auto');
                        return `
                            <div class="pola-line">
                                <span>${split[0]}</span>
                                <span class="${isAuto ? 'pola-val-auto' : 'pola-val-man'}">${split[1]}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="pola-hint">Klik Pola untuk lebih lengkap.</div>
                <div class="slot-actions">
                    <button class="btn-pola">Pola</button>
                    <button class="btn-main-game" onclick="window.open('https://shorturl.at/YSBTy', '_blank')">Main</button>
                </div>
            </div>
        </div>
    `).join('');

    // 4. RENDER FEED GALERI BUKTI JP (image_0335db.jpg)
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

// FUNGSI NAVIGASI TAB HALAMAN (HOME / BUKTI JP)
function switchPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
    // Hapus status aktif tombol navigasi bawah
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));

    // Tampilkan halaman target dan aktifkan tombolnya
    if(pageId === 'home') {
        document.getElementById('page-home').classList.remove('d-none');
        document.getElementById('nav-home').classList.add('active');
    } else if(pageId === 'buktijp') {
        document.getElementById('page-buktijp').classList.remove('d-none');
        document.getElementById('nav-buktijp').classList.add('active');
    }
}
