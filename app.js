/* ============================================================
   ABSENSI ADMIN — app.js
   Handles: Data store, CRUD, Sort, Pagination, Modal, Toast
   Template: Backstrap (Bootstrap 4 + CoreUI)
   ============================================================ */

/* ── Seed Data ── */
const seedData = [
  { id:  1, nama: "Budi Santoso",     alamat: "Jl. Kebon Jeruk No. 12, Jakarta Barat",      jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-01", jamMasuk: "08:00", jamKeluar: "17:00" },
  { id:  2, nama: "Siti Rahayu",      alamat: "Jl. Cempaka Putih Tengah 21, Jakarta Pusat", jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-01", jamMasuk: "07:55", jamKeluar: "16:58" },
  { id:  3, nama: "Andhika Pratama",  alamat: "Jl. Raya Serpong No. 88, Tangerang",         jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-02", jamMasuk: "08:10", jamKeluar: "17:05" },
  { id:  4, nama: "Dewi Kusuma",      alamat: "Jl. Gatot Subroto Kav. 7, Jakarta Selatan",  jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-02", jamMasuk: "08:00", jamKeluar: "17:00" },
  { id:  5, nama: "Rizky Firmansyah", alamat: "Jl. Pluit Raya No. 5, Jakarta Utara",        jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-03", jamMasuk: "07:45", jamKeluar: "16:45" },
  { id:  6, nama: "Laila Fitriani",   alamat: "Jl. Condet Raya No. 30, Jakarta Timur",      jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-03", jamMasuk: "08:05", jamKeluar: "17:00" },
  { id:  7, nama: "Hendra Gunawan",   alamat: "Jl. Mangga Dua Raya No. 9, Jakarta Utara",   jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-04", jamMasuk: "08:00", jamKeluar: "17:00" },
  { id:  8, nama: "Yunita Sari",      alamat: "Jl. Tebet Dalam IV No. 14, Jakarta Selatan", jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-04", jamMasuk: "08:20", jamKeluar: "17:10" },
  { id:  9, nama: "Fajar Nugroho",    alamat: "Jl. Pasar Minggu Raya No. 22, Jakarta",      jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-05", jamMasuk: "07:50", jamKeluar: "16:50" },
  { id: 10, nama: "Mega Lestari",     alamat: "Jl. Kelapa Gading Bulevar No. 1, Jakarta",   jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-05", jamMasuk: "08:00", jamKeluar: "17:00" },
  { id: 11, nama: "Doni Setiawan",    alamat: "Jl. Pramuka Raya No. 45, Jakarta Timur",     jenisKelamin: "Laki-laki",  tanggalAbsen: "2026-06-06", jamMasuk: "08:15", jamKeluar: "17:15" },
  { id: 12, nama: "Ayu Permata",      alamat: "Jl. Simatupang No. 33, Jakarta Selatan",     jenisKelamin: "Perempuan",  tanggalAbsen: "2026-06-06", jamMasuk: "07:58", jamKeluar: "16:55" },
];

/* ── State ── */
const state = {
  data:    JSON.parse(localStorage.getItem("absensi_data") || "null") || seedData,
  sort:    { col: "id", dir: "asc" },
  page:    1,
  perPage: 5,
  search:  "",
  filter:  { tanggal: "", jk: "" },
  editId:  null,
  deleteId: null,
};

/* ── Persist ── */
function save() {
  localStorage.setItem("absensi_data", JSON.stringify(state.data));
}

/* ── Helpers ── */
function fmtDate(s) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
  return `${d} ${months[+m - 1]} ${y}`;
}

function durasi(masuk, keluar) {
  if (!masuk || !keluar) return "";
  const [h1, m1] = masuk.split(":").map(Number);
  const [h2, m2] = keluar.split(":").map(Number);
  const total = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (total <= 0) return "";
  return `(${Math.floor(total / 60)}j ${total % 60}m)`;
}

/* ── Toast (Bootstrap 4 alert style) ── */
function showToast(msg, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const alertClass = type === "success" ? "alert-success" : "alert-danger";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  const el = document.createElement("div");
  el.className = `alert ${alertClass} alert-dismissible fade show`;
  el.innerHTML = `<i class="fa ${icon}"></i> ${msg}
    <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>`;
  container.appendChild(el);
  setTimeout(() => { $(el).alert('close'); }, 3000);
}

/* ── Modal ── */
function openModal(id)  { $('#' + id).modal('show'); }
function closeModal(id) { $('#' + id).modal('hide'); }

/* ── Stats ── */
function renderStats() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const el = (id) => document.getElementById(id);
  if (!el("statTotal")) return;
  el("statTotal").textContent  = state.data.length;
  el("statHariIni").textContent = state.data.filter(d => d.tanggalAbsen === todayStr).length;
  el("statLK").textContent     = state.data.filter(d => d.jenisKelamin === "Laki-laki").length;
  el("statPR").textContent     = state.data.filter(d => d.jenisKelamin === "Perempuan").length;
}

/* ── Filter & Sort Pipeline ── */
function getFiltered() {
  let list = [...state.data];

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(d =>
      d.nama.toLowerCase().includes(q) || d.alamat.toLowerCase().includes(q)
    );
  }
  if (state.filter.tanggal) {
    list = list.filter(d => d.tanggalAbsen === state.filter.tanggal);
  }
  if (state.filter.jk) {
    list = list.filter(d => d.jenisKelamin === state.filter.jk);
  }

  const { col, dir } = state.sort;
  list.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ?  1 : -1;
    return 0;
  });

  return list;
}

/* ── Render Table ── */
function renderTable() {
  renderStats();

  const filtered   = getFiltered();
  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * state.perPage;
  const slice = filtered.slice(start, start + state.perPage);

  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <i class="fa fa-inbox"></i>
        <p>Tidak ada data yang ditemukan.</p>
      </div>
    </td></tr>`;
  } else {
    tbody.innerHTML = slice.map((d, i) => {
      const badgeCls = d.jenisKelamin === "Laki-laki" ? "badge-laki" : "badge-perempuan";
      return `<tr>
        <td class="text-center" style="font-size:12px">${start + i + 1}</td>
        <td style="font-size:13px"><strong>${d.nama}</strong></td>
        <td class="col-alamat" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${d.alamat}">${d.alamat}</td>
        <td style="font-size:15px"><span class="badge ${badgeCls}">${d.jenisKelamin}</span></td>
        <td class="text-center" style="font-size:12px">${fmtDate(d.tanggalAbsen)}</td>
        <td class="text-center" style="font-size:12px;color:#000">${d.jamMasuk}</td>
        <td class="text-center" style="font-size:12px;color:#000">${d.jamKeluar} <span class="text-durasi">${durasi(d.jamMasuk, d.jamKeluar)}</span></td>
        <td>
          <button class="btn btn-sm btn-info" style="font-size:11px;padding:2px 7px;" onclick="openEdit(${d.id})">
            <i class="fa fa-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger ml-1" style="font-size:11px;padding:2px 7px;" onclick="confirmDelete(${d.id})">
            <i class="fa fa-trash"></i> Hapus
          </button>
        </td>
      </tr>`;
    }).join("");
  }

  // Page info
  const infoEl = document.getElementById("pageInfo");
  if (infoEl) {
    const from = total === 0 ? 0 : start + 1;
    const to   = Math.min(start + state.perPage, total);
    infoEl.innerHTML = `Menampilkan <strong>${from}&ndash;${to}</strong> dari <strong>${total}</strong> data`;
  }

  renderPagination(totalPages);

  // Sort header classes
  document.querySelectorAll("th[data-col]").forEach(th => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.col === state.sort.col) {
      th.classList.add(state.sort.dir === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

/* ── Pagination (Bootstrap 4) ── */
function renderPagination(totalPages) {
  const wrap = document.getElementById("pagination");
  if (!wrap) return;

  let html = `<li class="page-item ${state.page === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="goPage(${state.page - 1});return false;">&laquo;</a>
  </li>`;

  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  range.forEach(r => {
    if (r === "...") {
      html += `<li class="page-item disabled"><a class="page-link" href="#">&hellip;</a></li>`;
    } else {
      html += `<li class="page-item ${r === state.page ? 'active' : ''}">
        <a class="page-link" href="#" onclick="goPage(${r});return false;">${r}</a>
      </li>`;
    }
  });

  html += `<li class="page-item ${state.page === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="goPage(${state.page + 1});return false;">&raquo;</a>
  </li>`;

  wrap.innerHTML = html;
}

function goPage(p) {
  const filtered   = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  if (p < 1 || p > totalPages) return;
  state.page = p;
  renderTable();
}

/* ── Sort ── */
function sortBy(col) {
  if (state.sort.col === col) {
    state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
  } else {
    state.sort.col = col;
    state.sort.dir = "asc";
  }
  state.page = 1;
  renderTable();
}

/* ── Delete ── */
function confirmDelete(id) {
  state.deleteId = id;
  const item = state.data.find(d => d.id === id);
  const nameEl = document.getElementById("deleteName");
  if (nameEl && item) nameEl.textContent = item.nama;
  openModal("modalDelete");
}

function doDelete() {
  state.data = state.data.filter(d => d.id !== state.deleteId);
  save();
  closeModal("modalDelete");
  renderTable();
  showToast("Data absensi berhasil dihapus.", "danger");
}

/* ── Edit ── */
function openEdit(id) {
  const item = state.data.find(d => d.id === id);
  if (!item) return;
  state.editId = id;

  document.getElementById("editNama").value      = item.nama;
  document.getElementById("editAlamat").value    = item.alamat;
  document.getElementById("editTanggal").value   = item.tanggalAbsen;
  document.getElementById("editJamMasuk").value  = item.jamMasuk;
  document.getElementById("editJamKeluar").value = item.jamKeluar;

  document.querySelectorAll('input[name="editJK"]').forEach(r => {
    r.checked = r.value === item.jenisKelamin;
  });

  openModal("modalEdit");
}

function doEdit() {
  const item = state.data.find(d => d.id === state.editId);
  if (!item) return;

  const nama      = document.getElementById("editNama").value.trim();
  const alamat    = document.getElementById("editAlamat").value.trim();
  const tanggal   = document.getElementById("editTanggal").value;
  const jamMasuk  = document.getElementById("editJamMasuk").value;
  const jamKeluar = document.getElementById("editJamKeluar").value;
  const jk        = document.querySelector('input[name="editJK"]:checked');

  if (!nama || !alamat || !tanggal || !jamMasuk || !jamKeluar || !jk) {
    showToast("Harap lengkapi semua field.", "danger");
    return;
  }

  item.nama = nama; item.alamat = alamat;
  item.tanggalAbsen = tanggal; item.jamMasuk = jamMasuk;
  item.jamKeluar = jamKeluar; item.jenisKelamin = jk.value;

  save();
  closeModal("modalEdit");
  renderTable();
  showToast("Data absensi berhasil diperbarui.");
}

/* ── Tambah (tambah.html) ── */
function handleTambahForm(e) {
  e.preventDefault();
  const nama      = document.getElementById("nama").value.trim();
  const alamat    = document.getElementById("alamat").value.trim();
  const tanggal   = document.getElementById("tanggal").value;
  const jamMasuk  = document.getElementById("jamMasuk").value;
  const jamKeluar = document.getElementById("jamKeluar").value;
  const jk        = document.querySelector('input[name="jenisKelamin"]:checked');

  if (!nama || !alamat || !tanggal || !jamMasuk || !jamKeluar || !jk) {
    showToast("Harap lengkapi semua field yang wajib diisi.", "danger");
    return;
  }

  const existing = JSON.parse(localStorage.getItem("absensi_data") || "null") || seedData;
  const newId    = Math.max(...existing.map(d => d.id), 0) + 1;
  existing.push({ id: newId, nama, alamat, jenisKelamin: jk.value, tanggalAbsen: tanggal, jamMasuk, jamKeluar });
  localStorage.setItem("absensi_data", JSON.stringify(existing));

  showToast("Data absensi berhasil disimpan!");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

/* ── Bind Controls ── */
function bindControls() {
  const $search   = document.getElementById("searchInput");
  const $date     = document.getElementById("filterTanggal");
  const $jk       = document.getElementById("filterJK");
  const $perPage  = document.getElementById("perPage");

  if ($search)  $search.addEventListener("input",  e => { state.search = e.target.value; state.page = 1; renderTable(); });
  if ($date)    $date.addEventListener("change",   e => { state.filter.tanggal = e.target.value; state.page = 1; renderTable(); });
  if ($jk)      $jk.addEventListener("change",     e => { state.filter.jk = e.target.value; state.page = 1; renderTable(); });
  if ($perPage) $perPage.addEventListener("change",e => { state.perPage = parseInt(e.target.value); state.page = 1; renderTable(); });

  document.querySelectorAll("th[data-col]").forEach(th => {
    th.addEventListener("click", () => sortBy(th.dataset.col));
  });
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  // Index page
  if (document.getElementById("tableBody")) {
    const stored = localStorage.getItem("absensi_data");
    if (stored) state.data = JSON.parse(stored);
    bindControls();
    renderTable();
  }

  // Tambah page
  const form = document.getElementById("formTambah");
  if (form) {
    form.addEventListener("submit", handleTambahForm);
    const tanggalEl = document.getElementById("tanggal");
    if (tanggalEl) tanggalEl.value = new Date().toISOString().slice(0, 10);
  }
});
