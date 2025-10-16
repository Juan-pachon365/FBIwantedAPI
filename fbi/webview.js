const API_BASE = "https://api.fbi.gov/@wanted";

const listEl = document.getElementById('list');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const refreshBtn = document.getElementById('refreshBtn');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');

let items = [];

// --- Cargar datos de la API ---
async function fetchData() {
  showLoading(true);
  errorEl.hidden = true;

  try {
    const res = await fetch(API_BASE + '?pageSize=100');
    const data = await res.json();
    items = data.items || [];
    render(items);
    populateFilter(items);
  } catch (e) {
    console.error(e);
    errorEl.hidden = false;
    errorEl.textContent = 'Error cargando datos del FBI';
  } finally {
    showLoading(false);
  }
}

// --- Renderizar lista de personas ---
function render(data) {
  listEl.innerHTML = '';
  if (!data.length) {
    listEl.innerHTML = '<p>No hay resultados.</p>';
    return;
  }

  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = (p.images && p.images[0] && p.images[0].thumb) || '';
    img.alt = p.title || 'Sin imagen';

    const h3 = document.createElement('h3');
    h3.textContent = p.title || 'Sin título';

    const btn = document.createElement('button');
    btn.textContent = 'Ver detalle';
    btn.onclick = () => openModal(p);

    card.append(img, h3, btn);
    listEl.append(card);
  });
}

// --- Crear filtro dinámico ---
function populateFilter(data) {
  const titles = [...new Set(data.map(i => i.title).filter(Boolean))];
  filterSelect.innerHTML = '<option value="">Filtrar por título</option>';
  titles.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    filterSelect.append(opt);
  });
}

// --- Modal con detalles ---
function openModal(p) {
  modalBody.innerHTML = `
    <h2>${p.title || 'Sin título'}</h2>
    <p><strong>Aliases:</strong> ${(p.aliases || []).join(', ') || '—'}</p>
    <p><strong>Descripción:</strong> ${p.description || 'Sin descripción'}</p>
    <a href="${p.url}" target="_blank">Ver en sitio oficial</a>
  `;
  modal.hidden = false;
}

// --- Cerrar modal ---
closeModalBtn.onclick = () => (modal.hidden = true);
modal.onclick = e => { if (e.target === modal) modal.hidden = true; };

// --- Búsqueda y filtrado ---
searchInput.oninput = () => applyFilters();
filterSelect.onchange = () => applyFilters();
refreshBtn.onclick = () => fetchData();

function applyFilters() {
  const q = searchInput.value.toLowerCase();
  const ft = filterSelect.value;
  let filtered = items;

  if (ft) filtered = filtered.filter(i => i.title === ft);
  if (q) filtered = filtered.filter(i =>
    (i.title + i.description).toLowerCase().includes(q)
  );

  render(filtered);
}

function showLoading(v) {
  loadingEl.style.display = v ? 'block' : 'none';
}

// --- Inicialización ---
fetchData();
