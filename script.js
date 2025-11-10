const CONFIG = {
    jsonUrl: 'products.json',
    gridId: 'productGrid',
    countId: 'product-count',
    searchId: 'search-input',
    refreshId: 'refresh-btn',
    paginationId: 'pagination',
    categoryId: 'category-select'
};

const amazonTag = 'affiliationOeb-20';
const PRODUCTS_PER_PAGE = 10;

let ALL_PRODUCTS = [];
let filteredProducts = [];
let currentPage = 1;

const grid = document.getElementById(CONFIG.gridId);
const countSpan = document.getElementById(CONFIG.countId);
const searchInput = document.getElementById(CONFIG.searchId);
const refreshBtn = document.getElementById(CONFIG.refreshId);
const pagination = document.getElementById(CONFIG.paginationId);
const categorySelect = document.getElementById(CONFIG.categoryId);

function generateAffiliateLink(productName) {
    return `https://www.amazon.ca/s?k=${encodeURIComponent(productName)}&tag=${amazonTag}`;
}

function renderProducts(list) {
    if (!grid) return;
    grid.innerHTML = '';
    filteredProducts = list;

    if (!list || list.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding:3rem; color:#777;">Aucun produit trouvé</div>';
        if (countSpan) countSpan.textContent = '0';
        pagination.innerHTML = '';
        return;
    }

    if (countSpan) countSpan.textContent = list.length;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageItems = list.slice(start, end);

    pageItems.forEach(p => {
        const name = p.name || 'Produit';
        const img = p.image?.trim() || 'https://via.placeholder.com/300x300?text=No+Image';
        const price = p.price || '';
        const description = p.description || '';
        const link = p.link?.trim() ? (p.link.includes('tag=') ? p.link : p.link + '?tag=' + amazonTag) : generateAffiliateLink(name);

        const card = document.createElement('div');
        card.className = 'card';

        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.alt = name;

        const nameEl = document.createElement('h4');
        nameEl.innerText = name;

        const priceEl = document.createElement('p');
        priceEl.className = 'price';
        priceEl.innerText = price;

        const MAX = 60;
        const short = description.substring(0, MAX) + (description.length > MAX ? '…' : '');
        const descDiv = document.createElement('div');
        descDiv.className = 'desc truncated';
        descDiv.innerHTML = short;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-desc';
        toggleBtn.textContent = 'Lire plus';
        toggleBtn.onclick = () => {
            const full = descDiv.classList.contains('truncated');
            descDiv.innerHTML = full ? description : short;
            descDiv.classList.toggle('truncated');
            toggleBtn.textContent = full ? 'Lire moins' : 'Lire plus';
        };

        card.appendChild(imgEl);
        card.appendChild(nameEl);
        card.appendChild(priceEl);
        card.appendChild(descDiv);
        card.appendChild(toggleBtn);

        const btn = document.createElement('a');
        btn.href = link;
        btn.innerText = 'Voir sur Amazon';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer sponsored';
        btn.className = 'amazon-button';
        card.appendChild(btn);

        grid.appendChild(card);
    });

    renderPagination(list.length);
}

function renderPagination(totalItems) {
    if (!pagination) return;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    let html = '';

    if (currentPage > 1) html += `<a href="#" class="prev-btn">Précédent</a>`;
    if (currentPage < totalPages) html += `<a href="#" class="next-btn">Suivant</a>`;
    html += `<span class="page-number">Page ${currentPage}</span>`;

    pagination.innerHTML = html;

    pagination.querySelector('.prev-btn') && (pagination.querySelector('.prev-btn').onclick = e => {
        e.preventDefault(); currentPage--; renderProducts(filteredProducts);
    });
    pagination.querySelector('.next-btn') && (pagination.querySelector('.next-btn').onclick = e => {
        e.preventDefault(); currentPage++; renderProducts(filteredProducts);
    });
}

async function loadProducts() {
    if (refreshBtn) refreshBtn.disabled = true;
    try {
        const res = await fetch(CONFIG.jsonUrl, { cache: 'no-store' });
        const data = await res.json();
        ALL_PRODUCTS = data;
        filteredProducts = ALL_PRODUCTS;
        currentPage = 1;

        // Remplir le select de catégories
        const categories = ['all', ...new Set(ALL_PRODUCTS.map(p => p.category))];
        categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

        renderProducts(ALL_PRODUCTS);
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div style="text-align:center; padding:3rem; color:red;">Erreur de chargement des produits</div>';
        pagination.innerHTML = '';
    } finally {
        if (refreshBtn) refreshBtn.disabled = false;
    }
}

if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; applyFilters(); });
if (categorySelect) categorySelect.addEventListener('change', () => { currentPage = 1; applyFilters(); });

function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    filteredProducts = ALL_PRODUCTS.filter(p => {
        const matchCategory = category === 'all' || p.category === category;
        const matchSearch = p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
        return matchCategory && matchSearch;
    });
    renderProducts(filteredProducts);
}

// ---------- COOKIE WIDGET ----------
const cookieW  = document.getElementById('cookie-widget');
const cookieOK = document.getElementById('cookie-ok');
const cookieX  = document.getElementById('cookie-close');
function hideCookie() { cookieW.classList.add('hidden'); localStorage.setItem('cookieOk','1'); }
cookieOK.onclick = hideCookie; cookieX.onclick = hideCookie;
if(localStorage.getItem('cookieOk')==='1') cookieW.classList.add('hidden');

// ---------- START ----------
if(document.readyState==='loading') { document.addEventListener('DOMContentLoaded', loadProducts); } else { loadProducts(); }
