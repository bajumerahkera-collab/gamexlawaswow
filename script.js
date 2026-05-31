<script>
        (function() {
            // Menggunakan Kredensial Firebase Asli Berdasarkan script.js Kamu
            const configIsolasiJP = {
                apiKey: "AIzaSyCEbmZLDH6mQ-baQM4b58z_89bhBy3ggb8",
                authDomain: "gamelawaswow.firebaseapp.com",
                databaseURL: "https://gamelawaswow-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "gamelawaswow",
                storageBucket: "gamelawaswow.firebasestorage.app",
                messagingSenderId: "1027106854763",
                appId: "1:1027106854763:web:6b59883c73733da4c6de2e"
            };

            // Inisialisasi app terisolasi agar tidak merusak fungsi RTP/Jackpot
            let appJP;
            if (!firebase.apps.length) {
                appJP = firebase.initializeApp(configIsolasiJP);
            } else {
                appJP = firebase.apps[0];
            }

            const dbJP = appJP.database();
            const wadahGallery = document.getElementById('render-bukti-gallery');

            if (wadahGallery) {
                wadahGallery.innerHTML = '<p class="text-center text-white-50 py-5">⏳ Menghubungkan ke live feed server...</p>';

                // Tarik data secara realtime dari node 'bukti_jp'
                dbJP.ref('bukti_jp').on('value', (snapshot) => {
                    wadahGallery.innerHTML = "";

                    if (snapshot.exists()) {
                        const kumpulanData = snapshot.val();
                        
                        // Urutkan data: Yang paling baru di-post muncul paling atas
                        Object.keys(kumpulanData).reverse().forEach((key) => {
                            const item = kumpulanData[key];
                            const kartuHTML = `
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="card h-100 shadow-sm" style="background: #111827; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
                                        <div class="card-body p-3">
                                            <h6 class="text-white fw-bold mb-1" style="font-size: 0.95rem; line-height: 1.4;">${item.title}</h6>
                                            <small class="text-white-50 d-block mb-2" style="font-size: 0.75rem;">📅 lunas: ${item.date}</small>
                                        </div>
                                        <div style="background: #0f172a; padding: 12px; text-align: center; display: flex; justify-content: center; align-items: center;">
                                            <img src="${item.img}" class="img-fluid rounded" alt="Bukti Kemenangan" style="max-height: 260px; object-fit: contain;">
                                        </div>
                                    </div>
                                </div>
                            `;
                            wadahGallery.innerHTML += kartuHTML;
                        });
                    } else {
                        wadahGallery.innerHTML = '<p class="text-center text-white-50 py-5">Belum ada postingan bukti kemenangan baru.</p>';
                    }
                }, (error) => {
                    console.error("Firebase Error: ", error);
                    wadahGallery.innerHTML = '<p class="text-center text-danger py-5">❌ Gagal memuat data live feed.</p>';
                });
            }
        })();
    </script>
