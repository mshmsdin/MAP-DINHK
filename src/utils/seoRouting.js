/**
 * وحدة التوجيه البرمجي وتحسين محركات البحث الديناميكية (Dynamic SEO & SPA Deep Linking)
 * تتيح توليد روابط برمجية فريدة لكل موضع من الـ 625 موضعاً مع تحديث كامل لبيانات الـ SEO والميتاتاج
 */
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';

const CANONICAL_BASE = 'https://din.hk/map';

const DEFAULT_TITLE = 'موسوعة أسماء البلدان والكنى والأنساب القديمة | خريطة توزع علماء الحديث والأعلام الجغرافية';
const DEFAULT_DESC = 'الموسوعة الجغرافية الكبرى لأسماء البلدان والمواضع والأنساب والكنى القديمة، مع خريطة تفاعلية لتوزع علماء الحديث وفقهاء ومؤرخي الإسلام ومسارات رحلاتهم وحساب المسالك والفراسخ (أكثر من 16,800 مادة موثقة)، بمراجعة أمهات المصادر المحققة.';

/**
 * تحديث وسوم محركات البحث وشبكات التواصل الاجتماعي بصورة حية لموضع محدد
 */
export function updatePlaceSEO(place) {
  if (!place) return;

  const placeScholars = scholars.filter((s) => s.placeId === place.id);
  const scholarNames = placeScholars.map((s) => s.name).slice(0, 4).join('، ');

  const title = `${place.vocalized || place.name} (${place.nisbaVocalized || place.nisba}) | موسوعة أسماء البلدان القديمة والأعلام`;
  const desc = `${place.name} (${place.nisba}): ${place.subTitle || place.importance || ''} - الموقع المعاصر: ${place.modernName} (${place.modernCountry})، إقليم ${place.regionName}. ${scholarNames ? `من كبار أعلامها: ${scholarNames}. ` : ''}بمراجعة نصوص معجم البلدان لياقوت والحافظ السمعاني.`;
  const placeUrl = `${CANONICAL_BASE}/?place=${encodeURIComponent(place.id)}`;

  // 1. تحديث عنوان الصفحة
  document.title = title;

  // 2. تحديث الميتا الوصفية والكلمات المفتاحية
  setMetaTag('name', 'description', desc);
  setMetaTag('name', 'keywords', `${place.name}, ${place.nisba}, ${place.modernName}, ${place.modernCountry}, ${place.regionName}, أعلام ${place.name}, تاريخ ${place.name}, معجم البلدان, أنساب السمعاني`);

  // 3. تحديث وسوم Open Graph (فيسبوك، واتساب، تيليجرام)
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', desc);
  setMetaTag('property', 'og:url', placeUrl);

  // 4. تحديث وسوم Twitter Card
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', desc);

  // 5. تحديث الرابط الأصيل (Canonical)
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', placeUrl);

  // 6. حقن أو تحديث البيانات المنظمة Schema.org JSON-LD
  updatePlaceJsonLd(place, placeScholars, placeUrl);
}

/**
 * إعادة وسوم محركات البحث إلى الوضع الافتراضي للمنصة
 */
export function resetDefaultSEO() {
  document.title = DEFAULT_TITLE;
  setMetaTag('name', 'description', DEFAULT_DESC);
  setMetaTag('property', 'og:title', DEFAULT_TITLE);
  setMetaTag('property', 'og:description', DEFAULT_DESC);
  setMetaTag('property', 'og:url', `${CANONICAL_BASE}/`);
  setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
  setMetaTag('name', 'twitter:description', DEFAULT_DESC);

  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) {
    canonicalEl.setAttribute('href', `${CANONICAL_BASE}/`);
  }

  const scriptLd = document.getElementById('schema-place-jsonld');
  if (scriptLd) {
    scriptLd.remove();
  }
}

/**
 * تحديث أو حقن Schema.org JSON-LD للموضع
 */
function updatePlaceJsonLd(place, placeScholars, placeUrl) {
  let scriptLd = document.getElementById('schema-place-jsonld');
  if (!scriptLd) {
    scriptLd = document.createElement('script');
    scriptLd.id = 'schema-place-jsonld';
    scriptLd.type = 'application/ld+json';
    document.head.appendChild(scriptLd);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    '@id': placeUrl,
    url: placeUrl,
    name: place.vocalized || place.name,
    description: place.summary || place.importance,
    inLanguage: 'ar',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: `${CANONICAL_BASE}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: place.regionName,
          item: `${CANONICAL_BASE}/#regions`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: place.name,
          item: placeUrl
        }
      ]
    },
    mainEntity: {
      '@type': 'Place',
      name: place.name,
      alternateName: [place.vocalized, place.nisba, place.nisbaVocalized, ...(place.otherSpellings || [])].filter(Boolean),
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.lat,
        longitude: place.lng
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: place.modernCountry,
        addressRegion: place.regionName
      },
      description: place.summary || place.importance,
      subjectOf: placeScholars.map((s) => ({
        '@type': 'Person',
        name: s.name,
        alternateName: s.fullName,
        jobTitle: s.honorific,
        birthDate: s.birthYearAH ? `${s.birthYearAH} AH` : undefined,
        deathDate: `${s.deathYearAH} AH (${s.deathYearCE} CE)`
      }))
    }
  };

  scriptLd.textContent = JSON.stringify(structuredData, null, 2);
}

/**
 * تعيين قيمة وسم ميتا
 */
function setMetaTag(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * تحديث مسار الرابط البرمجي في المتصفح دون إعادة تحميل الصفحة (History API)
 */
export function setPlaceURL(placeId, pushState = true) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('place', placeId);
    url.hash = ''; // تنظيف أي وسوم قديمة

    if (pushState) {
      window.history.pushState({ placeId }, '', url.toString());
    } else {
      window.history.replaceState({ placeId }, '', url.toString());
    }
  } catch (e) {
    console.warn('Could not update history URL:', e);
  }
}

/**
 * مسح رابط الموضع والعودة للرابط الأساسي
 */
export function clearPlaceURL() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('place');
    window.history.replaceState({}, '', url.toString());
    resetDefaultSEO();
  } catch (e) {
    console.warn('Could not clear history URL:', e);
  }
}

/**
 * استخراج معرف الموضع من رابط الصفحة عند التحميل (query param أو hash)
 */
export function getInitialPlaceId() {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const placeFromSearch = searchParams.get('place');
    if (placeFromSearch) return placeFromSearch.trim();

    // فحص المسار في الهاش إذا كان من نمط #/place/id أو #place/id
    const hash = window.location.hash || '';
    const hashMatch = hash.match(/#\/?place\/([a-zA-Z0-9_\-]+)/);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1].trim();
    }
  } catch (e) {
    console.warn('Error reading URL params:', e);
  }
  return null;
}

/**
 * نسخ الرابط البرمجي للموضع مع إشعار عائم جذاب
 */
export function copyPlaceShareUrl(place) {
  const placeUrl = `${window.location.origin}${window.location.pathname}?place=${encodeURIComponent(place.id)}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(placeUrl).then(() => {
      showToastNotification(`تم نسخ رابط موضع «${place.name}» البرمجي بنجاح! جاهز للمشاركة والأرشفة.`);
    }).catch(() => {
      fallbackCopy(placeUrl, place.name);
    });
  } else {
    fallbackCopy(placeUrl, place.name);
  }
}

function fallbackCopy(text, placeName) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToastNotification(`تم نسخ رابط موضع «${placeName}» البرمجي بنجاح!`);
  } catch (err) {
    prompt('انسخ الرابط البرمجي للموضع:', text);
  }
  document.body.removeChild(textArea);
}

/**
 * عرض إشعار عائم Toast بتصميم تراثي راقٍ
 */
export function showToastNotification(message) {
  let container = document.getElementById('seo-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'seo-toast-container';
    container.className = 'seo-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'seo-toast';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
