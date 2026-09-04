/**
 * محرك البحث والربط الموسوعي لكتابي «معجم البلدان» و«الأنساب» (16,800 مادة بنسبة 100%)
 */
import { normalizeArabic } from './arabic.js';

let masterIndex = null;
let isIndexLoading = false;
const letterCache = new Map();

/**
 * تحميل الفهرس الموحد العام للموسوعة (886 كيلوبايت)
 */
const BASE_PATH = ((typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/').replace(/\/$/, '');

export async function loadMasterCorpusIndex() {
  if (masterIndex) return masterIndex;
  if (isIndexLoading) {
    while (isIndexLoading) {
      await new Promise(r => setTimeout(r, 50));
    }
    return masterIndex;
  }

  isIndexLoading = true;
  try {
    const res = await fetch(`${BASE_PATH}/corpus/master_index.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    masterIndex = await res.json();
    return masterIndex;
  } catch (err) {
    console.error('فشل تحميل الفهرس الموسوعي للكتابين:', err);
    return [];
  } finally {
    isIndexLoading = false;
  }
}

/**
 * البحث اللحظي في كافة مواد الكتابين الـ 16,800
 */
export async function searchCorpus(query, options = {}) {
  const { limit = 20, book = null } = options;
  if (!query || query.trim().length < 2) return [];

  const index = await loadMasterCorpusIndex();
  const normQ = normalizeArabic(query.trim());

  const results = [];
  for (const item of index) {
    if (book && item.b !== book) continue;
    
    const normTitle = normalizeArabic(item.t);
    let score = 0;

    if (normTitle === normQ) {
      score = 100; // تطابق تام
    } else if (normTitle.startsWith(normQ)) {
      score = 80;  // يبدأ بالكلمة
    } else if (normTitle.includes(normQ)) {
      score = 50;  // يتضمن الكلمة
    }

    if (score > 0) {
      results.push({
        id: item.id || item.i,
        title: item.t,
        book: item.b, // 'y' for Yaqut, 's' for Samani
        letterHex: item.l,
        score
      });
    }

    if (results.length >= limit * 3) break;
  }

  // ترتيب النتائج بحسب دقة التطابق
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export const BOOK_META = {
  y: {
    folder: 'yaqut',
    name: 'معجم البلدان - ياقوت الحموي (ت 626هـ)',
    shortName: 'معجم البلدان',
    icon: '📍',
    author: 'ياقوت الحموي',
    death: '626هـ',
    category: 'بلدان ومواضع'
  },
  s: {
    folder: 'samani',
    name: 'كتاب الأنساب - أبو سعد السمعاني (ت 562هـ)',
    shortName: 'الأنساب للسمعاني',
    icon: '📜',
    author: 'أبو سعد السمعاني',
    death: '562هـ',
    category: 'أنساب ورجال'
  },
  b: {
    folder: 'bakri',
    name: 'معجم ما استُعجِم - أبو عبيد البكري (ت 487هـ)',
    shortName: 'معجم ما استعجم',
    icon: '🏺',
    author: 'أبو عبيد البكري الأندلسي',
    death: '487هـ',
    category: 'جزيرة العرب ومواضع الأشعار'
  },
  l: {
    folder: 'lubab',
    name: 'اللباب في تهذيب الأنساب - ابن الأثير (ت 630هـ)',
    shortName: 'اللباب لابن الأثير',
    icon: '✨',
    author: 'عز الدين ابن الأثير الجزري',
    death: '630هـ',
    category: 'تهذيب واستدراك الأنساب'
  },
  m: {
    folder: 'marasid',
    name: 'مراصد الاطلاع - صفي الدين البغدادي (ت 739هـ)',
    shortName: 'مراصد الاطلاع',
    icon: '🗺️',
    author: 'صفي الدين عبد المؤمن البغدادي',
    death: '739هـ',
    category: 'تهذيب وضبط معجم البلدان'
  }
};

/**
 * جلب النص الكامل 100% لأي مادة من مواد أمهات الكتب الخمس
 */
export async function fetchCorpusEntry(id, book, letterHex) {
  const cacheKey = `${book}_${letterHex}`;
  let letterData = letterCache.get(cacheKey);

  const meta = BOOK_META[book] || BOOK_META.y;

  if (!letterData) {
    try {
      const folder = meta.folder;
      const filename = `${folder}_${letterHex}.json`;
      const res = await fetch(`${BASE_PATH}/corpus/${folder}/${filename}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      letterData = await res.json();
      letterCache.set(cacheKey, letterData);
    } catch (err) {
      console.error(`فشل جلب ملف الحرف للمادة ${id}:`, err);
      return null;
    }
  }

  const entry = letterData.find(e => e.id === id);
  if (!entry) return null;

  return {
    id: entry.id,
    title: entry.t,
    text: entry.txt,
    book: book,
    bookName: meta.name,
    shortName: meta.shortName,
    icon: meta.icon,
    author: meta.author,
    death: meta.death,
    num: entry.num || null
  };
}

/**
 * إحصائيات عامة للموسوعة الخماسية الشاملة
 */
export async function getCorpusStats() {
  const index = await loadMasterCorpusIndex();
  const yaqutCount = index.filter(i => i.b === 'y').length;
  const samaniCount = index.filter(i => i.b === 's').length;
  const bakriCount = index.filter(i => i.b === 'b').length;
  const lubabCount = index.filter(i => i.b === 'l').length;
  const marasidCount = index.filter(i => i.b === 'm').length;

  return {
    total: index.length,
    yaqutCount,
    samaniCount,
    bakriCount,
    lubabCount,
    marasidCount
  };
}
