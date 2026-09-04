/**
 * نافذة القراءة الموسوعية والمستكشف الكامل لكتابي «معجم البلدان» و«الأنساب» (100%)
 */
import { fetchCorpusEntry, searchCorpus, loadMasterCorpusIndex } from '../utils/corpusSearch.js';
import { setupPronunciationButtons, speakArabic } from '../utils/audioSpeech.js';
import { normalizeArabic, extractArabicStem } from '../utils/arabic.js';
import { places } from '../data/places.js';
import { palestinePlaces } from '../data/palestineGeography.js';

let modalContainer = null;
let currentFontSize = 1.05; // rem
let selectPlaceHandler = null;

export function setCorpusPlaceHandler(handler) {
  selectPlaceHandler = handler;
}

let lookupMap = null;

function buildLookupMap() {
  if (lookupMap) return lookupMap;
  lookupMap = new Map();

  // 1. المطابقة مع الحواضر والبلدان التاريخية (561 موضعاً)
  for (const p of places) {
    const matchObj = { place: p, type: 'place' };
    if (p.name) lookupMap.set(normalizeArabic(p.name), matchObj);
    if (p.nisba) lookupMap.set(normalizeArabic(p.nisba), matchObj);
    if (p.otherSpellings) {
      for (const sp of p.otherSpellings) {
        lookupMap.set(normalizeArabic(sp), matchObj);
      }
    }
    const stemName = extractArabicStem(p.name);
    if (stemName && !lookupMap.has(stemName)) lookupMap.set(stemName, matchObj);
    if (p.nisba) {
      const stemNisba = extractArabicStem(p.nisba);
      if (stemNisba && !lookupMap.has(stemNisba)) lookupMap.set(stemNisba, matchObj);
    }
  }

  // 2. المطابقة مع معالم وحواضر فلسطين العربية
  for (const pal of palestinePlaces) {
    const matchObj = { place: pal, type: 'palestine' };
    if (pal.name) lookupMap.set(normalizeArabic(pal.name), matchObj);
  }

  return lookupMap;
}

export function findMatchingMapPlace(rawTitle) {
  if (!rawTitle) return null;
  const cleanTitle = rawTitle.trim()
    .replace(/^[\s\(\)\[\]"«»\d\-\.\/:]+/g, '')
    .replace(/[\s\(\)\[\]"«»\d\-\.\/:]+$/g, '');
  const normT = normalizeArabic(cleanTitle);
  const map = buildLookupMap();

  if (map.has(normT)) return map.get(normT);

  const stemT = extractArabicStem(cleanTitle);
  if (stemT && map.has(stemT)) return map.get(stemT);

  return null;
}

export function initCorpusModal(options = {}) {
  if (options.onSelectPlace) {
    selectPlaceHandler = options.onSelectPlace;
  }
  if (document.getElementById('corpus-modal-root')) return;

  modalContainer = document.createElement('div');
  modalContainer.id = 'corpus-modal-root';
  modalContainer.className = 'corpus-modal-backdrop';
  modalContainer.style.display = 'none';

  modalContainer.innerHTML = `
    <div class="corpus-modal-dialog">
      <div class="corpus-modal-header">
        <div class="corpus-badge-group">
          <span id="corpus-book-badge" class="corpus-badge"></span>
          <span id="corpus-id-badge" class="corpus-badge-sub"></span>
        </div>
        <div class="corpus-header-actions">
          <button id="btn-corpus-speak" class="corpus-tool-btn" title="استمع لنطق العنوان">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
          <button id="btn-corpus-font-inc" class="corpus-tool-btn" title="تكبير الخط">أ+</button>
          <button id="btn-corpus-font-dec" class="corpus-tool-btn" title="تصغير الخط">أ-</button>
          <button id="btn-corpus-copy" class="corpus-tool-btn" title="نسخ النص الكامل">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button id="btn-corpus-close" class="corpus-close-btn" title="إغلاق">&times;</button>
        </div>
      </div>

      <div class="corpus-modal-body">
        <div class="corpus-title-row" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <h2 id="corpus-entry-title" class="corpus-entry-title" style="margin: 0;"></h2>
          <button id="btn-corpus-view-map" class="corpus-map-btn" style="display: none;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span id="corpus-map-btn-text">📍 عرض على الخريطة التفاعلية</span>
          </button>
        </div>

        <div id="corpus-cross-ref-box" class="corpus-cross-ref-box" style="display: none;"></div>

        <div id="corpus-entry-text" class="corpus-entry-content"></div>
      </div>

      <div class="corpus-modal-footer">
        <span class="corpus-footer-note">📖 النص الكامل 100% مستخرج وموثق بدقة تامة من المخطوطات والنسخ المحققة المعتمدة.</span>
        <button id="btn-corpus-footer-close" class="corpus-action-btn">تم</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // ربط أزرار التحكم
  modalContainer.querySelector('#btn-corpus-close').addEventListener('click', closeCorpusModal);
  modalContainer.querySelector('#btn-corpus-footer-close').addEventListener('click', closeCorpusModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeCorpusModal();
  });

  modalContainer.querySelector('#btn-corpus-font-inc').addEventListener('click', () => {
    if (currentFontSize < 1.6) {
      currentFontSize += 0.1;
      modalContainer.querySelector('#corpus-entry-text').style.fontSize = `${currentFontSize}rem`;
    }
  });

  modalContainer.querySelector('#btn-corpus-font-dec').addEventListener('click', () => {
    if (currentFontSize > 0.85) {
      currentFontSize -= 0.1;
      modalContainer.querySelector('#corpus-entry-text').style.fontSize = `${currentFontSize}rem`;
    }
  });

  modalContainer.querySelector('#btn-corpus-copy').addEventListener('click', () => {
    const title = modalContainer.querySelector('#corpus-entry-title').textContent;
    const book = modalContainer.querySelector('#corpus-book-badge').textContent;
    const body = modalContainer.querySelector('#corpus-entry-text').textContent;
    const fullCitation = `【${title}】\nالمصدر: ${book}\n\n${body}\n\n(منقول من موقع الأنساب والبلدان)`;
    navigator.clipboard.writeText(fullCitation).then(() => {
      const copyBtn = modalContainer.querySelector('#btn-corpus-copy');
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ تم النسخ';
      setTimeout(() => copyBtn.innerHTML = orig, 1800);
    });
  });

  modalContainer.querySelector('#btn-corpus-speak').addEventListener('click', () => {
    const title = modalContainer.querySelector('#corpus-entry-title').textContent;
    if (title) speakArabic(title);
  });
}

/**
 * فتح وقراءة أي مادة كاملة بنسبة 100%
 */
export async function openCorpusEntry(id, book, letterHex) {
  initCorpusModal();

  const titleEl = modalContainer.querySelector('#corpus-entry-title');
  const bookBadge = modalContainer.querySelector('#corpus-book-badge');
  const idBadge = modalContainer.querySelector('#corpus-id-badge');
  const textEl = modalContainer.querySelector('#corpus-entry-text');
  const crossRefBox = modalContainer.querySelector('#corpus-cross-ref-box');

  // إظهار حالة التحميل
  titleEl.textContent = 'جاري استحضار النص الكامل...';
  textEl.innerHTML = '<div class="corpus-loading-spinner">جاري تحميل النص التراثي الأصيل بنسبة 100%...</div>';
  crossRefBox.style.display = 'none';
  crossRefBox.innerHTML = '';
  modalContainer.style.display = 'flex';

  const entry = await fetchCorpusEntry(id, book, letterHex);
  if (!entry) {
    titleEl.textContent = 'تعذر تحميل المادة';
    textEl.innerHTML = '<div class="corpus-error-msg">حدث خطأ أثناء قراءة ملف المادة. يرجى إعادة المحاولة.</div>';
    return;
  }

  // ملء البيانات
  titleEl.textContent = entry.title;
  bookBadge.textContent = entry.bookName;
  bookBadge.className = `corpus-badge ${book === 'y' ? 'badge-yaqut' : 'badge-samani'}`;
  idBadge.textContent = book === 'y' ? `مادة معجم البلدان رقم #${entry.id.replace('y_', '')}` : `نسب السمعاني رقم #${entry.num || entry.id.replace('s_', '')}`;

  // تنسيق النص الكامل وفقراته
  const paragraphs = entry.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  textEl.innerHTML = paragraphs.map(p => `<p class="corpus-p">${p.trim()}</p>`).join('');
  textEl.style.fontSize = `${currentFontSize}rem`;

  // فحص ما إذا كان الموضع متوفراً على الخريطة التفاعلية
  const viewMapBtn = modalContainer.querySelector('#btn-corpus-view-map');
  const viewMapBtnText = modalContainer.querySelector('#corpus-map-btn-text');
  const matching = findMatchingMapPlace(entry.title);

  if (matching) {
    viewMapBtn.style.display = 'inline-flex';
    viewMapBtnText.textContent = `📍 عرض «${matching.place.name}» على الخريطة`;
    viewMapBtn.onclick = () => {
      closeCorpusModal();
      if (selectPlaceHandler) {
        selectPlaceHandler(matching.place);
      }
    };
  } else {
    viewMapBtn.style.display = 'none';
  }

  // التحقق من وجود مادة مقابلة في الكتاب الآخر (Cross-referencing)
  checkCrossReference(entry, crossRefBox);
}

/**
 * الربط الذكي المتبادل بين معجم البلدان والأنساب
 */
async function checkCrossReference(entry, crossRefBox) {
  const isYaqut = entry.book === 'y';
  const targetBook = isYaqut ? 's' : 'y';

  // البحث في الكتاب الآخر عن الكلمة أو النسبة
  let searchTerms = [entry.title];
  if (isYaqut) {
    searchTerms.push('ال' + entry.title);
    searchTerms.push('ال' + entry.title + 'ي');
  } else {
    // السمعاني: إذا كانت "البخاري" نبحث عن "بخارى"
    const stripped = entry.title.replace(/^ال/, '').replace(/ي$/, '');
    searchTerms.push(stripped);
  }

  for (const term of searchTerms) {
    const matches = await searchCorpus(term, { book: targetBook, limit: 3 });
    if (matches.length > 0) {
      const match = matches[0];
      const otherBookLabel = isYaqut ? 'كتاب الأنساب للسمعاني' : 'معجم البلدان لياقوت';
      const promptLabel = isYaqut ? `📜 توجد نسبة مقابلة في ${otherBookLabel}: «${match.title}»` : `📍 يوجد موضع جغرافي مقابل في ${otherBookLabel}: «${match.title}»`;

      crossRefBox.innerHTML = `
        <div class="cross-ref-content">
          <span>${promptLabel}</span>
          <button class="cross-ref-btn" id="btn-open-cross-ref">
            افتح النص المقابل 100% &larr;
          </button>
        </div>
      `;
      crossRefBox.style.display = 'block';

      modalContainer.querySelector('#btn-open-cross-ref').addEventListener('click', () => {
        openCorpusEntry(match.id, match.book, match.letterHex);
      });
      break;
    }
  }
}

export function closeCorpusModal() {
  if (modalContainer) {
    modalContainer.style.display = 'none';
  }
}
