// js/script.js

// 1. Sesi & Login
function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const userDitemukan = dataPengguna.find(u => u.email === emailInput && u.password === passwordInput);

    if (userDitemukan) {
        localStorage.setItem('currentUser', JSON.stringify(userDitemukan));
        window.location.href = "dashboard.html";
    } else {
        alert("Email atau password yang Anda masukkan salah!");
    }
}

function checkSession() {
    let userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        const defaultUser = { id: 1, nama: "Rina Wulandari", email: "rina@gmail.com", role: "User" };
        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        userJson = JSON.stringify(defaultUser);
    }
    return JSON.parse(userJson);
}

// FUNGSI KELUAR AKUN (DIJAMIN BALIK KE INDEX.HTML)
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = "index.html";
}

function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.style.display = 'flex';
}
function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.style.display = 'none';
}

// 2. Dashboard Init
function initDashboard() {
    const user = checkSession();
    if (!user) return;

    const namaLabel = document.getElementById('userNamaLabel');
    if (namaLabel) namaLabel.innerText = user.nama;
    const roleLabel = document.getElementById('userRoleLabel');
    if (roleLabel) roleLabel.innerText = user.role;

    const hours = new Date().getHours();
    let greeting = "Selamat Malam";
    if (hours >= 3 && hours < 11) greeting = "Selamat Pagi";
    else if (hours >= 11 && hours < 15) greeting = "Selamat Siang";
    else if (hours >= 15 && hours < 18) greeting = "Selamat Sore";

    const greetingEl = document.getElementById('greetingText');
    if (greetingEl) greetingEl.innerText = `${greeting}, ${user.nama}!`;

    const tbody = document.getElementById('tabelRiwayatBody');
    if (tbody && typeof dataPengguna !== 'undefined') {
        tbody.innerHTML = dataPengguna.map(u => `
            <tr>
                <td><strong>#00${u.id}</strong></td>
                <td><div style="font-weight: 600; color: #0f172a;">${u.nama}</div></td>
                <td><span style="color: #475569;">${u.email}</span></td>
                <td><span style="background: ${u.role === 'Admin' ? '#dcfce7; color: #166534;' : '#f1f5f9; color: #334155;'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${u.role}</span></td>
            </tr>
        `).join('');
    }
}

// 3. Katalog & Stok
function loadKatalogStok() {
    const user = checkSession();
    if (!user) return;
    document.getElementById('userNamaLabel').innerText = user.nama;
    document.getElementById('userRoleLabel').innerText = user.role;
    renderTabelStok();
}

function renderTabelStok() {
    const tbody = document.getElementById('tabelStokBody');
    if (tbody && typeof dataKatalogBuku !== 'undefined') {
        tbody.innerHTML = dataKatalogBuku.map(buku => `
            <tr>
                <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #1e3d2f;">${buku.kodeBarang}</code></td>
                <td style="text-align: center;">
                    <img src="${buku.cover}" alt="cover" style="width: 45px; height: 60px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" onerror="this.src='https://via.placeholder.com/45x60?text=Buku'">
                </td>
                <td><strong style="color: #0f172a;">${buku.namaBarang}</strong></td>
                <td><span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">${buku.jenisBarang}</span></td>
                <td>Edisi ${buku.edisi}</td>
                <td><strong style="color: #1e3d2f;">${buku.harga}</strong></td>
                <td><span style="background: #f0fdf4; color: #15803d; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${buku.stok} Pcs</span></td>
            </tr>
        `).join('');
    }
}

function tambahStokBaru() {
    const kode = document.getElementById('inputKode').value;
    const nama = document.getElementById('inputNama').value;
    const jenis = document.getElementById('inputJenis').value;
    const edisi = document.getElementById('inputEdisi').value;
    const stok = document.getElementById('inputStok').value;
    const harga = document.getElementById('inputHarga').value;

    if (!kode || !nama || !harga) {
        alert("Kode, Nama, dan Harga wajib diisi!");
        return;
    }

    const bukuBaru = {
        kodeBarang: kode,
        namaBarang: nama,
        jenisBarang: jenis || "Buku Ajar",
        edisi: edisi || "1",
        stok: parseInt(stok) || 0,
        harga: harga.includes('Rp') ? harga : `Rp ${harga}`,
        cover: "img/buku1.png"
    };

    dataKatalogBuku.push(bukuBaru);
    renderTabelStok();
    alert("Stok buku baru berhasil ditambahkan!");
    document.getElementById('formTambahStok').reset();
}

// 4. Checkout / Pemesanan
function initCheckoutPage() {
    const user = checkSession();
    if (!user) return;

    document.getElementById('userNamaLabel').innerText = user.nama;
    document.getElementById('userRoleLabel').innerText = user.role;

    const inputNama = document.getElementById('namaPemesan');
    if (inputNama) inputNama.value = user.nama;

    const selectBuku = document.getElementById('pilihanBuku');
    if (selectBuku && typeof dataKatalogBuku !== 'undefined') {
        selectBuku.innerHTML = dataKatalogBuku.map((buku, idx) => `
            <option value="${idx}">${buku.namaBarang} — (${buku.harga})</option>
        `).join('');
        hitungTotal();
    }
}

function hitungTotal() {
    const idx = document.getElementById('pilihanBuku').value;
    const jumlah = document.getElementById('jumlahBeli').value;
    if (idx !== "" && typeof dataKatalogBuku !== 'undefined') {
        let hargaClean = dataKatalogBuku[idx].harga.replace(/[^0-9]/g, '');
        let hargaNum = parseInt(hargaClean) || 0;
        let total = hargaNum * (parseInt(jumlah) || 1);
        document.getElementById('totalBayar').value = `Rp ${total.toLocaleString('id-ID')}`;
    }
}

function prosesCheckout(event) {
    event.preventDefault();
    const user = checkSession();
    const idx = document.getElementById('pilihanBuku').value;
    const jumlah = document.getElementById('jumlahBeli').value;
    const totalBayar = document.getElementById('totalBayar').value;

    const bukuDipilih = dataKatalogBuku[idx];
    const noDOBaru = "2026" + Math.floor(1000 + Math.random() * 9000);

    const transaksiBaru = {
        nomorDO: noDOBaru,
        nama: user.nama,
        buku: bukuDipilih.namaBarang,
        jumlah: jumlah,
        status: "Diproses / Dikemas",
        ekspedisi: "JNE Express",
        tanggalKirim: new Date().toISOString().split('T')[0],
        total: totalBayar
    };

    let riwayat = JSON.parse(localStorage.getItem('riwayatTransaksi')) || [];
    riwayat.unshift(transaksiBaru);
    localStorage.setItem('riwayatTransaksi', JSON.stringify(riwayat));

    tampilkanModalSukses(noDOBaru, bukuDipilih.namaBarang, totalBayar);
}

function tampilkanModalSukses(noDO, namaBuku, total) {
    let modalExist = document.getElementById('modalSuksesBesar');
    if (modalExist) modalExist.remove();

    const modalHTML = `
        <div id="modalSuksesBesar" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="background: white; padding: 40px; border-radius: 20px; width: 440px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="width: 70px; height: 70px; background: #dcfce7; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; font-weight: bold;">
                    ✓
                </div>
                <h2 style="font-size: 22px; color: #0f172a; margin-bottom: 8px; font-weight: 700;">Pesanan Berhasil Diproses!</h2>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Transaksi pemesanan telah dicatat oleh sistem.</p>
                
                <div style="background: #f8fafc; padding: 16px; border-radius: 10px; text-align: left; font-size: 13px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                    <p style="margin-bottom: 6px;"><strong>Nomor DO:</strong> <span style="color: #1e3d2f; font-weight: 600;">${noDO}</span></p>
                    <p style="margin-bottom: 6px;"><strong>Buku:</strong> ${namaBuku}</p>
                    <p><strong>Total Bayar:</strong> <span style="color: #0f172a; font-weight: 700;">${total}</span></p>
                </div>

                <button onclick="window.location.href='riwayat.html'" class="btn" style="width: 100%; padding: 12px; font-size: 15px;">Lihat Riwayat Pemesanan</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 6. Render Riwayat & Laporan
function renderRiwayatDanLaporan() {
    let riwayat = JSON.parse(localStorage.getItem('riwayatTransaksi')) || [
        {
            nomorDO: "20230012",
            nama: "Rina Wulandari",
            buku: "Pengantar Ilmu Komunikasi",
            jumlah: 1,
            status: "Dalam Perjalanan",
            ekspedisi: "JNE",
            tanggalKirim: "2026-06-06",
            total: "Rp 180.000"
        }
    ];

    const tbodyRiwayat = document.getElementById('tabelRiwayatPemesanan');
    if (tbodyRiwayat) {
        tbodyRiwayat.innerHTML = riwayat.map(r => `
            <tr>
                <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #1e3d2f;">${r.nomorDO}</code></td>
                <td><strong>${r.nama}</strong></td>
                <td>${r.buku} (${r.jumlah || 1} Pcs)</td>
                <td><span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${r.ekspedisi}</span></td>
                <td><strong>${r.total}</strong></td>
                <td><span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${r.status}</span></td>
            </tr>
        `).join('');
    }

    const tbodyLaporan = document.getElementById('tabelLaporanPemesanan');
    if (tbodyLaporan) {
        tbodyLaporan.innerHTML = riwayat.map((r, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${r.tanggalKirim}</td>
                <td><code style="font-weight: 600;">${r.nomorDO}</code></td>
                <td>${r.nama}</td>
                <td>${r.buku}</td>
                <td>${r.total}</td>
                <td><span style="color: #166534; font-weight: 600;">Berhasil</span></td>
            </tr>
        `).join('');
    }
}

// 7. Tracking DO (Langsung Ketemu)
function initTracking() {
    const user = checkSession();
    if (!user) return;
    document.getElementById('userNamaLabel').innerText = user.nama;
    document.getElementById('userRoleLabel').innerText = user.role;
}

function lacakPengiriman() {
    let noDO = document.getElementById('inputNoDO').value.trim();
    const hasilDiv = document.getElementById('hasilTracking');

    if (!noDO) {
        alert("Masukkan nomor DO terlebih dahulu!");
        return;
    }

    let riwayat = JSON.parse(localStorage.getItem('riwayatTransaksi')) || [];
    let found = riwayat.find(r => r.nomorDO === noDO);

    const dummyTracking = {
        "20230012": {
            nomorDO: "20230012", nama: "Rina Wulandari", status: "Dalam Perjalanan", ekspedisi: "JNE Express", tanggalKirim: "2026-06-06", paket: "0JKT01", total: "Rp 180.000",
            perjalanan: [
                { waktu: "2026-06-06 10:12", keterangan: "Penerimaan di Loket: TANGERANG SELATAN" },
                { waktu: "2026-06-06 14:07", keterangan: "Tiba di Hub Transit Utama" }
            ]
        },
        "20230013": {
            nomorDO: "20230013", nama: "Agus Pranoto", status: "Selesai diantar", ekspedisi: "Pos Indonesia", tanggalKirim: "2026-06-05", paket: "0UPBJJ", total: "Rp 220.000",
            perjalanan: [
                { waktu: "2026-06-05 09:00", keterangan: "Kurir membawa paket ke alamat tujuan" },
                { waktu: "2026-06-06 15:00", keterangan: "Paket telah diterima oleh penerima" }
            ]
        }
    };

    let d = found || dummyTracking[noDO];

    if (!d) {
        d = {
            nomorDO: noDO,
            nama: "Pengguna Aktif",
            status: "Sedang Dikemas / Diproses",
            ekspedisi: "JNE Express",
            tanggalKirim: new Date().toISOString().split('T')[0],
            paket: "PKT-AUTO",
            total: "Rp 150.000",
            perjalanan: [
                { waktu: new Date().toLocaleString(), keterangan: "Nomor DO terdaftar dalam sistem. Kurir segera menjemput paket." }
            ]
        };
    }

    document.getElementById('trackNama').innerText = d.nama;
    document.getElementById('trackStatus').innerText = `${d.status} (${d.ekspedisi})`;
    document.getElementById('trackEkspedisi').innerText = d.ekspedisi;
    document.getElementById('trackTanggal').innerText = d.tanggalKirim;
    document.getElementById('trackPaket').innerText = d.paket;
    document.getElementById('trackTotal').innerText = d.total;

    const perjalananList = d.perjalanan || [{ waktu: d.tanggalKirim, keterangan: "Status: " + d.status }];
    document.getElementById('trackPerjalanan').innerHTML = perjalananList.map(p => `
        <li style="margin-bottom: 8px; font-size: 13px; color: #475569;"><strong>[${p.waktu}]</strong> — ${p.keterangan}</li>
    `).join('');

    hasilDiv.style.display = 'block';
}