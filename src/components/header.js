/**
 * مكون الهيدر وشريط البحث الذكي
 * يدعم الأنساب المكانية (البلدان)، والأنساب غير المكانية (الصنائع والحرف والوظائف والقبائل)
 */
import { normalizeArabic, extractArabicStem, tokensMatch } from '../utils/arabic.js';
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';
import { nonGeoNisbas } from '../data/nonGeoNisbas.js';
import { searchCorpus } from '../utils/corpusSearch.js';
import { openCorpusEntry } from './corpusModal.js';
import { openCorpusExplorer } from './corpusExplorer.js';

export function createHeader({
  onSelectPlace,
  onSelectScholar,
  onSelectNonGeoNisba,
  onOpenCalc,
  onOpenRegions,
  onOpenQuiz,
  onOpenGuide,
  onOpenStats,
  onResetMap
}) {
  const header = document.createElement('header');
  header.className = 'main-header';

  header.innerHTML = `
    <div class="brand-section" id="btn-brand-home" title="العودة للرؤية الشاملة">
      <div class="brand-logo-gem">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
      <div class="brand-titles">
        <h1>معجم الأنساب والبلدان</h1>
        <p>
          <span>للسمعاني وياقوت الحموي</span>
          <span class="badge-sources">أنساب مكانية ومهنية وقبيلية</span>
        </p>
      </div>
    </div>

    <div class="search-bar-wrapper">
      <div class="search-input-box">
        <div class="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input 
          type="text" 
          id="global-search-input" 
          class="search-input" 
          placeholder="ابحث بالنسبة (كالترمذي، المعدل، الكاتب)، أو البلد، أو العالم..."
          autocomplete="off"
        />
        <button id="search-clear-btn" class="search-clear-btn" title="مسح">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- وسوم الاقتراح السريع للأنساب والبيوتات العلمية -->
      <div style="display: flex; gap: 6px; margin-top: 6px; overflow-x: auto; padding-bottom: 2px;">
        <span class="quick-suggest-pill" data-query="الجزائر">الجَزَائِر</span>
        <span class="quick-suggest-pill" data-query="تلمسان">تِلِمْسَان</span>
        <span class="quick-suggest-pill" data-query="ليبيا">لِيبْيَا</span>
        <span class="quick-suggest-pill" data-query="المقري">المَقَّرِيّ</span>
        <span class="quick-suggest-pill" data-query="عدن">عَدَن</span>
        <span class="quick-suggest-pill" data-query="بامخرمة">بَامَخْرَمَة</span>
        <span class="quick-suggest-pill" data-query="عمان">عُمَان</span>
        <span class="quick-suggest-pill" data-query="البحرين">البَحْرَيْن</span>
        <span class="quick-suggest-pill" data-query="الخليل بن أحمد">الخَلِيل بن أَحْمَد</span>
        <span class="quick-suggest-pill" data-query="المصيصة">المَصِّيصَة</span>
        <span class="quick-suggest-pill" data-query="طرسوس">طَرَسُوس</span>
        <span class="quick-suggest-pill" data-query="القدس">بَيْت المَقْدِس</span>
        <span class="quick-suggest-pill" data-query="الترمذي">الترمذي</span>
        <span class="quick-suggest-pill" data-query="الأوزاعي">الأَوْزَاعِيّ</span>
        <span class="quick-suggest-pill" data-query="آل تيمية">آل تَيْمِيَّة</span>
        <span class="quick-suggest-pill" data-query="آل قدامة">آل قُدَامَة</span>
        <span class="quick-suggest-pill" data-query="آل منده">آل مَنْدَه</span>
        <span class="quick-suggest-pill" data-query="النووي">النَّوَوِيّ</span>
        <span class="quick-suggest-pill" data-query="ابن القيم">ابْن القَيِّم</span>
        <span class="quick-suggest-pill" data-query="الثوري">الثَّوْرِيّ</span>
        <span class="quick-suggest-pill" data-query="المعدل">المُعَدَّل</span>
        <span class="quick-suggest-pill" data-query="الكاتب">الكَاتِب</span>
        <span class="quick-suggest-pill" data-query="الوراق">الوَارَّاق</span>
        <span class="quick-suggest-pill" data-query="نيسابور">نيسابور</span>
        <span class="quick-suggest-pill" data-query="أصفهان">أَصْبَهَان</span>
      </div>

      <div id="search-dropdown" class="search-results-dropdown"></div>
    </div>

    <div class="header-actions">
      <button id="btn-open-corpus-explorer" class="btn-header-action" title="استعراض وتصفح كامل مواد معجم البلدان والأنساب بنسبة 100% (16,800 مادة)" style="background: #e0f2fe; border-color: #0284c7; color: #0369a1; font-weight: bold;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <span>الموسوعة الشاملة (16,800 مادة)</span>
      </button>

      <button id="btn-open-calc" class="btn-header-action" title="حساب المسافات التاريخية بالفراسخ والمراحل وأيام السير">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <span>المسالك والفراسخ</span>
      </button>

      <button id="btn-open-regions" class="btn-header-action" title="أطلس وتصفية الأقاليم الإسلامية الكبرى">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        </svg>
        <span>الأقاليم</span>
      </button>

      <button id="btn-open-quiz" class="btn-header-action" title="مسابقة وتحدي الأنساب والبلدان التراثي">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>تحدي الأنساب</span>
      </button>

      <button id="btn-open-nongeo" class="btn-header-action" title="تصفح أنساب الصنائع والمهن والقبائل">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
        <span>الصنائع والقبائل</span>
      </button>

      <button id="btn-open-guide" class="btn-header-action" title="دليل ميزات واستخدام المنصة وسجل التحديثات" style="background: #fef3c7; border-color: #d97706; color: #78350f;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>دليل الموقع والتحديثات</span>
      </button>

      <button id="btn-open-stats" class="btn-header-action" title="إحصائيات ومعلومات المشروع">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10"></path>
          <path d="M12 20V4"></path>
          <path d="M6 20v-6"></path>
        </svg>
        <span>الإحصائيات</span>
      </button>

      <button id="btn-reset-view" class="btn-header-action" title="إعادة ضبط زاوية الخريطة">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        <span>نظرة عامة</span>
      </button>
    </div>
  `;

  // ربط الأحداث
  const input = header.querySelector('#global-search-input');
  const clearBtn = header.querySelector('#search-clear-btn');
  const dropdown = header.querySelector('#search-dropdown');
  const brandHome = header.querySelector('#btn-brand-home');
  const btnStats = header.querySelector('#btn-open-stats');
  const btnReset = header.querySelector('#btn-reset-view');
  const btnNonGeo = header.querySelector('#btn-open-nongeo');
  const btnCalc = header.querySelector('#btn-open-calc');
  const btnRegions = header.querySelector('#btn-open-regions');
  const btnQuiz = header.querySelector('#btn-open-quiz');
  const btnGuide = header.querySelector('#btn-open-guide');
  const btnCorpus = header.querySelector('#btn-open-corpus-explorer');

  brandHome.addEventListener('click', onResetMap);
  btnReset.addEventListener('click', onResetMap);
  btnStats.addEventListener('click', onOpenStats);
  if (btnCorpus) btnCorpus.addEventListener('click', openCorpusExplorer);
  if (btnCalc) btnCalc.addEventListener('click', onOpenCalc);
  if (btnRegions) btnRegions.addEventListener('click', onOpenRegions);
  if (btnQuiz) btnQuiz.addEventListener('click', onOpenQuiz);
  if (btnGuide) btnGuide.addEventListener('click', onOpenGuide);

  // زر تصفح أنساب الصنائع
  btnNonGeo.addEventListener('click', () => {
    // فتح أول نسبة مهنية (المعدل) أو عرض قائمة الأنساب المهنية في البحث
    input.value = "المعدل";
    clearBtn.style.display = 'flex';
    performSearch("المعدل", dropdown, onSelectPlace, onSelectScholar, onSelectNonGeoNisba);
  });

  // النقر على وسوم الاقتراح السريع
  header.querySelectorAll('.quick-suggest-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const q = pill.getAttribute('data-query');
      input.value = q;
      clearBtn.style.display = 'flex';
      performSearch(q, dropdown, onSelectPlace, onSelectScholar, onSelectNonGeoNisba);
    });
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    dropdown.style.display = 'none';
    input.focus();
  });

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      clearBtn.style.display = 'flex';
      performSearch(query, dropdown, onSelectPlace, onSelectScholar, onSelectNonGeoNisba);
    } else {
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!header.querySelector('.search-bar-wrapper').contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  return {
    element: header,
    setSearchQuery: (text) => {
      input.value = text;
      clearBtn.style.display = 'flex';
      performSearch(text, dropdown, onSelectPlace, onSelectScholar, onSelectNonGeoNisba);
    }
  };
}

async function performSearch(query, dropdown, onSelectPlace, onSelectScholar, onSelectNonGeoNisba) {
  const normQ = normalizeArabic(query);
  const stemQ = extractArabicStem(query);

  const matchedPlaces = [];
  const matchedGeoNisbas = [];
  const matchedNonGeoNisbas = [];
  const matchedScholars = [];
  const seenScholarKeys = new Set();
  const getScholarKey = (s) => s.id.replace(/_ng$/, '');

  // 1. البحث في الأنساب غير المكانية (الصنائع والحرف والبيوتات والقبائل)
  nonGeoNisbas.forEach((item) => {
    const normName = normalizeArabic(item.name);
    const stemName = extractArabicStem(item.name);
    const normMeaning = normalizeArabic(item.meaning);
    const isMatch = normName.includes(normQ) || stemName.includes(stemQ) || normMeaning.includes(normQ) || tokensMatch(item.name, query);

    if (isMatch) {
      matchedNonGeoNisbas.push(item);
    }

    // البحث داخل أعلام هذه النسبة غير المكانية
    item.scholars.forEach((s) => {
      const sNorm = normalizeArabic(s.name);
      const sFull = normalizeArabic(s.fullName);
      const sWorks = s.famousWorks ? s.famousWorks.map(w => normalizeArabic(w)).join(" ") : "";
      if (isMatch || sNorm.includes(normQ) || sFull.includes(normQ) || tokensMatch(s.name, query) || tokensMatch(s.fullName, query) || (sWorks && tokensMatch(sWorks, query))) {
        const key = getScholarKey(s);
        if (!seenScholarKeys.has(key)) {
          seenScholarKeys.add(key);
          matchedScholars.push({
            ...s,
            isFromNonGeo: true,
            parentNisba: item
          });
        }
      }
    });
  });

  // 2. البحث في البلدان والأنساب المكانية
  places.forEach((p) => {
    const normName = normalizeArabic(p.name);
    const normNisba = normalizeArabic(p.nisba);
    const stemName = extractArabicStem(p.name);
    const stemNisba = extractArabicStem(p.nisba);
    const normModern = normalizeArabic(p.modernName + " " + p.modernCountry);
    const spellingsMatch = p.otherSpellings && p.otherSpellings.some(sp => {
      const nSp = normalizeArabic(sp);
      return nSp.includes(normQ) || tokensMatch(sp, query);
    });

    if (normNisba.includes(normQ) || stemNisba.includes(stemQ) || (stemQ && stemNisba.startsWith(stemQ)) || tokensMatch(p.nisba, query)) {
      matchedGeoNisbas.push({ place: p, type: 'nisba' });
    } else if (normName.includes(normQ) || stemName.includes(stemQ) || normModern.includes(normQ) || spellingsMatch || tokensMatch(p.name, query)) {
      matchedPlaces.push({ place: p, type: 'place' });
    }
  });

  // 3. البحث في أعلام وعلماء البلدان والمؤلفات والكتب
  scholars.forEach((s) => {
    const normName = normalizeArabic(s.name);
    const normFull = normalizeArabic(s.fullName);
    const normNisba = normalizeArabic(s.nisba);
    const normHonor = normalizeArabic(s.honorific || "");
    const stemName = extractArabicStem(s.name);
    const matchedWork = s.famousWorks && s.famousWorks.find(w => normalizeArabic(w).includes(normQ) || tokensMatch(w, query));

    const matchesName = normName.includes(normQ) || normFull.includes(normQ) || stemName.includes(stemQ) || normNisba.includes(normQ) || normHonor.includes(normQ) || tokensMatch(s.name, query) || tokensMatch(s.fullName, query);

    if (matchesName || matchedWork) {
      const key = getScholarKey(s);
      if (!seenScholarKeys.has(key)) {
        seenScholarKeys.add(key);
        matchedScholars.push({
          ...s,
          matchedWorkSnippet: matchedWork || null
        });
      }
    }
  });

  const corpusMatches = await searchCorpus(query, { limit: 8 });

  if (matchedGeoNisbas.length === 0 && matchedNonGeoNisbas.length === 0 && matchedPlaces.length === 0 && matchedScholars.length === 0 && (!corpusMatches || corpusMatches.length === 0)) {
    dropdown.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        لا توجد نتائج مطابقة لـ «<strong>${query}</strong>» في الأنساب أو البلدان أو العلماء أو الموسوعة الشاملة
      </div>
    `;
    dropdown.style.display = 'block';
    return;
  }

  let html = '';

  // أ. الأنساب غير المكانية (الصنائع، الحرف، الوظائف، القبائل - كالمعدل والكاتب)
  if (matchedNonGeoNisbas.length > 0) {
    html += `
      <div class="search-category-title" style="background: rgba(56, 189, 248, 0.12); color: var(--lapis-light);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>أنساب الصنائع والمهن والوظائف والقبائل (ليست إلى بلاد)</span>
      </div>
    `;
    matchedNonGeoNisbas.forEach((item) => {
      html += `
        <div class="search-result-item" data-type="nongeo-nisba" data-item-id="${item.id}" style="background: rgba(56, 189, 248, 0.04);">
          <div>
            <div class="result-main-text">
              <span style="color: var(--lapis-light); font-weight: 700;">${item.vocalized || item.name}</span>
              <span style="color: var(--gold-300); font-size: 0.78rem; margin-right: 6px;">[نسبة ${item.categoryType === 'craft' ? 'صناعية / وظيفة' : 'قبيلية'}]</span>
            </div>
            <div class="result-sub-text">
              ${item.meaning.slice(0, 85)}...
            </div>
          </div>
          <span class="result-tag" style="background: rgba(56, 189, 248, 0.2); color: #fff;">استعراض النسبة وأعلامها</span>
        </div>
      `;
    });
  }

  // ب. الأنساب المكانية (الترمذي نسبة إلى ترمذ)
  if (matchedGeoNisbas.length > 0) {
    html += `
      <div class="search-category-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
        <span>الأنساب المكانية (النسبة إلى البلد والحاضرة)</span>
      </div>
    `;
    matchedGeoNisbas.slice(0, 5).forEach(({ place }) => {
      html += `
        <div class="search-result-item" data-type="nisba" data-place-id="${place.id}">
          <div>
            <div class="result-main-text">${place.nisba} (نسبة إلى ${place.name})</div>
            <div class="result-sub-text">
              الموقع الحالي: ${place.modernName} • ${place.modernCountry}
            </div>
          </div>
          <span class="result-tag">عرض في الخريطة</span>
        </div>
      `;
    });
  }

  // ج. البلدان والحواضر
  if (matchedPlaces.length > 0) {
    html += `
      <div class="search-category-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>البلدان والمدن التاريخية (معجم البلدان لياقوت)</span>
      </div>
    `;
    matchedPlaces.slice(0, 5).forEach(({ place }) => {
      html += `
        <div class="search-result-item" data-type="place" data-place-id="${place.id}">
          <div>
            <div class="result-main-text">${place.name} (${place.nisba})</div>
            <div class="result-sub-text">
              الاسم المعاصر: ${place.modernName} • ${place.modernCountry}
            </div>
          </div>
          <span class="result-tag">عرض على الخريطة</span>
        </div>
      `;
    });
  }

  // د. العلماء والأعلام
  if (matchedScholars.length > 0) {
    html += `
      <div class="search-category-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>تراجم كبار الأعلام والعلماء الموثقين</span>
      </div>
    `;
    matchedScholars.slice(0, 8).forEach((scholar) => {
      html += `
        <div class="search-result-item" data-type="${scholar.isFromNonGeo ? 'nongeo-scholar' : 'scholar'}" data-scholar-id="${scholar.id}" data-parent-nisba="${scholar.parentNisba ? scholar.parentNisba.id : ''}">
          <div>
            <div class="result-main-text">${scholar.name}</div>
            <div class="result-sub-text">
              ${scholar.matchedWorkSnippet ? `<span style="color: var(--gold-600); font-weight: 600;">📖 مؤلَف: «${scholar.matchedWorkSnippet}»</span> • ` : ''}توفي ${scholar.deathYearAH}هـ (${scholar.deathYearCE}م) • ${scholar.honorific}
            </div>
          </div>
          <span class="result-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--lapis-light);">ترجمة موثقة</span>
        </div>
      `;
    });
  }

  // هـ. مواد الموسوعة الشاملة (100% من كتابي ياقوت والسمعاني)
  if (corpusMatches && corpusMatches.length > 0) {
    html += `
      <div class="search-category-title" style="background: #e0f2fe; color: #0284c7;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span>مواد الموسوعة التراثية الشاملة (100% من الكتابين - 16,800 مادة)</span>
      </div>
    `;
    corpusMatches.forEach((item) => {
      html += `
        <div class="search-result-item" data-type="corpus" data-corpus-id="${item.id}" data-corpus-book="${item.book}" data-corpus-letter="${item.letterHex}">
          <div>
            <div class="result-main-text" style="font-weight: 700; color: #0f172a;">${item.title}</div>
            <div class="result-sub-text">
              ${item.book === 'y' ? '📍 موضع في «معجم البلدان» لياقوت الحموي' : '📜 نسبة في «كتاب الأنساب» للسمعاني'}
            </div>
          </div>
          <span class="result-tag" style="background: ${item.book === 'y' ? '#dbeafe' : '#fef3c7'}; color: ${item.book === 'y' ? '#1e40af' : '#92400e'};">اقرأ النص الكامل 100%</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = html;
  dropdown.style.display = 'block';

  // ربط النقرات
  dropdown.querySelectorAll('.search-result-item').forEach((item) => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('data-type');
      if (type === 'nongeo-nisba') {
        const itemId = item.getAttribute('data-item-id');
        const nonGeo = nonGeoNisbas.find((x) => x.id === itemId);
        if (nonGeo && onSelectNonGeoNisba) onSelectNonGeoNisba(nonGeo);
      } else if (type === 'nongeo-scholar') {
        const parentId = item.getAttribute('data-parent-nisba');
        const nonGeo = nonGeoNisbas.find((x) => x.id === parentId);
        if (nonGeo && onSelectNonGeoNisba) onSelectNonGeoNisba(nonGeo);
      } else if (type === 'place' || type === 'nisba') {
        const pId = item.getAttribute('data-place-id');
        const place = places.find((p) => p.id === pId);
        if (place) onSelectPlace(place);
      } else if (type === 'scholar') {
        const sId = item.getAttribute('data-scholar-id');
        const scholar = scholars.find((s) => s.id === sId);
        if (scholar) onSelectScholar(scholar);
      } else if (type === 'corpus') {
        const cId = item.getAttribute('data-corpus-id');
        const cBook = item.getAttribute('data-corpus-book');
        const cLetter = item.getAttribute('data-corpus-letter');
        openCorpusEntry(cId, cBook, cLetter);
      }
      dropdown.style.display = 'none';
    });
  });
}
