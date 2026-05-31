// ==========================================
// INTEGRASI LIVE FEED BUKTI JP (FIREBASE)
// ==========================================

// 1. Konfigurasi Firebase (Samakan dengan admin.html kamu)
const firebaseConfig = {
  apiKey: "AIzaSyCEbmZLDH6mQ-baQM4b58z_89bhBy3ggb8",
  authDomain: "gamelawaswow.firebaseapp.com",
  databaseURL: "https://gamelawaswow-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gamelawaswow",
  storageBucket: "gamelawaswow.firebasestorage.app",
  messagingSenderId: "1027106854763",
  appId: "1:1027106854763:web:6b59883c73733da4c6de2e",
};

// Validasi agar Firebase tidak di-inisialisasi dua kali jika ada script lain
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. Ambil elemen wadah gallery dari index.html kamu
const galleryContainer = document.getElementById('render-bukti-gallery');

// Tampilkan teks loading awal di dalam container sebelum data muncul
if (galleryContainer) {
    galleryContainer.innerHTML = '<p class="text-center text-white-50 py-5">Menghubungkan ke live server...</p>';
}

// 3. Tarik data realtime dari path 'bukti_jp' di Firebase
database.ref('bukti_jp').on('value', (snapshot) => {
    if (!galleryContainer) return; // Keamanan jika element tidak sengaja terhapus
    
    galleryContainer.innerHTML = ""; // Bersihkan isi container / teks loading
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Loop data, urutkan dari yang paling baru di-post (reverse)
        Object.keys(data).reverse().forEach((key) => {
            const item = data[key];
            
            // Generate HTML kartu Bukti JP menyesuaikan style gelap LAWASTOTO
            const postCard = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100" style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
                        <div class="card-body p-3">
                            <h6 class="text-white fw-bold mb-1" style="font-size: 0.95rem; line-height: 1.4;">${item.title}</h6>
                            <small class="text-white-50 d-block mb-2" style="font-size: 0.75rem;">📅 lunas: ${item.date}</small>
                        </div>
                        <div style="background: #0f172a; padding: 10px; display: flex; align-items: center; justify-content: center;">
                            <img src="${item.img}" class="img-fluid rounded" alt="Bukti JP Lawastoto" style="max-height: 280px; object-fit: contain;">
                        </div>
                    </div>
                </div>
            `;
            galleryContainer.innerHTML += postCard;
        });
    } else {
        // Jika database di Firebase kamu masih kosong/belum pernah post
        galleryContainer.innerHTML = '<p class="text-center text-white-50 py-5">Belum ada postingan bukti kemenangan baru hari ini.</p>';
    }
});
