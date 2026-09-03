/**
 * مستكشف الموسوعة التراثية الشاملة لكتابي «معجم البلدان» و«الأنساب» (16,800 مادة كاملة 100%)
 */
import { loadMasterCorpusIndex } from '../utils/corpusSearch.js';
import { openCorpusEntry } from './corpusModal.js';
import { normalizeArabic } from '../utils/arabic.js';

let explorerDialog = null;
let currentBook = 'y'; // 'y' (Yaqut), 's' (Samani)
let selectedLetter = 'all';
let searchQuery = '';
let allEntries = [];

const ARABIC_LETTERS = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

export function initCorpusExplorer() {
  if (document.getElementById('corpus-explorer-root')) return;

  explorerDialog = document.createElement('div');
  explorerDialog.id = 'corpus-explorer-root';
  explorerDialog.className = 'corpus-modal-backdrop';
  explorerDialog.style.display = 'none';

  explorerDialog.innerHTML = `
    <div class="corpus-explorer-dialog">
      <div class="explorer-header">
        <div class="explorer-title-area">
          <h2>📚 المستكشف الموسوعي الشامل (100% من الكتابين)</h2>
          <p class="explorer-subtitle">استيعاب كامل وغير منقوص لـ <strong>12,358 موضعاً</strong> في معجم البلدان لياقوت و<strong>4,442 نسبة</strong> في أنساب السمعاني</p>
        </div>
        <button id="btn-close-explorer" class="corpus-close-btn">&times;</button>
      </div>

      <!-- تبويبات اختيار الكتاب -->
      <div class="explorer-book-tabs">
        <button class="book-tab active" id="tab-book-yaqut" data-book="y">
          📍 معجم البلدان - ياقوت الحموي <span class="tab-badge">12,358 مادة</span>
        </button>
        <button class="book-tab" id="tab-book-samani" data-book="s">
          📜 كتاب الأنساب - أبو سعد السمعاني <span class="tab-badge">4,442 مادة</span>
        </button>
      </div>

      <!-- شريط الحروف الأبجدية -->
      <div class="explorer-letters-bar" id="explorer-letters-bar">
        <button class="letter-btn active" data-letter="all">الكل</button>
        ${ARABIC_LETTERS.map(l => `<button class="letter-btn" data-letter="${l}">${l}</button>`).join('')}
      </div>

      <!-- شريط التصفية والبحث الداخلي -->
      <div class="explorer-search-bar">
        <input type="text" id="explorer-filter-input" placeholder="ابحث في عناوين هذا الكتاب..." />
        <span id="explorer-results-count" class="results-count-badge">جاري التحميل...</span>
      </div>

      <!-- قائمة المواد -->
      <div class="explorer-grid-container" id="explorer-grid">
        <div class="corpus-loading-spinner">جاري استحضار الفهرس الموحد الكامل...</div>
      </div>
    </div>
  `;

  document.body.appendChild(explorerDialog);

  // ربط الأحداث
  explorerDialog.querySelector('#btn-close-explorer').addEventListener('click', closeCorpusExplorer);
  explorerDialog.addEventListener('click', (e) => {
    if (e.target === explorerDialog) closeCorpusExplorer();
  });

  // تبديل الكتاب
  explorerDialog.querySelector('#tab-book-yaqut').addEventListener('click', () => switchBook('y'));
  explorerDialog.querySelector('#tab-book-samani').addEventListener('click', () => switchBook('s'));

  // أزرار الحروف
  explorerDialog.querySelectorAll('.letter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      explorerDialog.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLetter = btn.getAttribute('data-letter');
      renderEntries();
    });
  });

  // البحث والتصفية
  explorerDialog.querySelector('#explorer-filter-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderEntries();
  });
}

export async function openCorpusExplorer() {
  initCorpusExplorer();
  explorerDialog.style.display = 'flex';

  if (allEntries.length === 0) {
    allEntries = await loadMasterCorpusIndex();
  }
  renderEntries();
}

export function closeCorpusExplorer() {
  if (explorerDialog) {
    explorerDialog.style.display = 'none';
  }
}

function switchBook(book) {
  currentBook = book;
  explorerDialog.querySelector('#tab-book-yaqut').classList.toggle('active', book === 'y');
  explorerDialog.querySelector('#tab-book-samani').classList.toggle('active', book === 's');
  renderEntries();
}

function stringToHex(str) {
  return Array.from(new TextEncoder().encode(str))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function renderEntries() {
  const grid = explorerDialog.querySelector('#explorer-grid');
  const countBadge = explorerDialog.querySelector('#explorer-results-count');

  let filtered = allEntries.filter(e => e.b === currentBook);

  if (selectedLetter !== 'all') {
    const letterHex = stringToHex(selectedLetter);
    filtered = filtered.filter(e => e.l === letterHex);
  }

  if (searchQuery.length > 0) {
    const normQ = normalizeArabic(searchQuery);
    filtered = filtered.filter(e => normalizeArabic(e.t).includes(normQ));
  }

  countBadge.textContent = `${filtered.length.toLocaleString('ar-EG')} مادة معروضة`;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="explorer-empty">لا توجد مواد تطابق هذا البحث أو الحرف.</div>';
    return;
  }

  // عرض أول 120 مادة لتجنب ثقل الرندر مع زر تحميل المزيد إذا رغب المستخدم
  const displaySlice = filtered.slice(0, 150);

  grid.innerHTML = displaySlice.map(entry => `
    <div class="explorer-card" data-id="${entry.id || entry.i}" data-book="${entry.b}" data-letter="${entry.l}">
      <div class="card-top">
        <span class="card-badge ${entry.b === 'y' ? 'badge-yaqut' : 'badge-samani'}">
          ${entry.b === 'y' ? 'موضع جغرافي' : 'نسب ورجال'}
        </span>
      </div>
      <h3 class="card-title">${entry.t}</h3>
      <button class="card-read-btn">اقرأ النص الكامل 100% &larr;</button>
    </div>
  `).join('');

  if (filtered.length > 150) {
    grid.innerHTML += `
      <div class="explorer-more-notice">
        يوجد ${filtered.length - 150} مادة إضافية. يمكنك تضييق البحث بكتابة اسم الموضع أو اختيار الحرف.
      </div>
    `;
  }

  // ربط أزرار القراءة
  grid.querySelectorAll('.explorer-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const book = card.getAttribute('data-book');
      const letter = card.getAttribute('data-letter');
      openCorpusEntry(id, book, letter);
    });
  });
}
