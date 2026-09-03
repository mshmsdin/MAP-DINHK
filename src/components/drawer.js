/**
 * مكون الدرج الجانبي لتفاصيل البلدان والأنساب المكانية وتراجم الأنساب المهنية والحرفية والقبيلية
 */
import { scholars } from '../data/scholars.js';
import { places } from '../data/places.js';
import { setupPronunciationButtons } from '../utils/audioSpeech.js';

export function createDrawer({ onClose, onDrawRihla, onGenerateCard, onFlyToPlace }) {
  const drawer = document.createElement('aside');
  drawer.className = 'side-drawer';
  drawer.id = 'side-drawer';

  drawer.innerHTML = `
    <div class="drawer-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
          <path d="M6 6h10"></path>
          <path d="M6 10h10"></path>
        </svg>
        <span style="font-weight: 700; color: #fff; font-size: 0.95rem;" id="drawer-header-title">بيانات النسبة والمصادر</span>
      </div>
      <button class="drawer-close-btn" id="drawer-close-btn" title="إغلاق اللوحة">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="drawer-body" id="drawer-content-body"></div>
  `;

  const closeBtn = drawer.querySelector('#drawer-close-btn');
  const body = drawer.querySelector('#drawer-content-body');
  const headerTitle = drawer.querySelector('#drawer-header-title');

  closeBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
    if (onClose) onClose();
  });

  // فتح بطاقة البلد والنسبة المكانية
  function openPlace(place) {
    headerTitle.textContent = "بيانات البلد والنسبة والمصادر";
    const placeScholars = scholars.filter((s) => s.placeId === place.id);

    let scholarsHtml = '';
    if (placeScholars.length > 0) {
      scholarsHtml = placeScholars.map((s) => `
        <div class="scholar-card" data-scholar-id="${s.id}">
          <div class="scholar-card-top">
            <div>
              <div class="scholar-name" style="display: flex; align-items: center; gap: 6px;">
                <span>${s.name}</span>
                <button class="mini-speak-btn" title="استمع لنطق اسم العَلَم" data-speak="${s.name}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
              </div>
              <div class="scholar-honorific">${s.honorific}</div>
            </div>
            <div class="scholar-dates">${s.birthYearAH ? s.birthYearAH + 'هـ - ' : ''}${s.deathYearAH}هـ (${s.deathYearCE}م)</div>
          </div>
          
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            ${s.bio}
          </div>

          <div style="margin-top: 8px;">
            <div style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 600;">أشهر التصانيف:</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
              ${s.famousWorks.join(' • ')}
            </div>
          </div>

          <div class="scholar-fields-row">
            ${s.fields.map((f) => `<span class="field-pill">${f}</span>`).join('')}
          </div>

          <div class="scholar-actions-row">
            ${s.travelRoute && s.travelRoute.length > 1 ? `
              <button class="btn-rihla-route" data-action="rihla" data-scholar-id="${s.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span>مسار رحلة طلب العلم</span>
              </button>
            ` : ''}
            <button class="btn-share-card" data-action="card" data-scholar-id="${s.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              <span>بطاقة المعرفة</span>
            </button>
          </div>
        </div>
      `).join('');
    } else {
      scholarsHtml = `<div style="color: var(--text-muted); font-size: 0.85rem;">لم يتم ربط علماء حالياً بهذا البلد.</div>`;
    }

    body.innerHTML = `
      <!-- بطاقة البلد والنسبة والمطابقة الجغرافية الحديثة -->
      <div class="place-hero-card">
        <span class="place-hero-badge">${place.regionName}</span>
        
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin: 8px 0 4px;">
          <h2 class="place-title-ar" style="margin: 0;">${place.vocalized || place.name}</h2>
          <button class="btn-audio-pronounce" title="استمع للنطق التراثي المضبوط" data-speak="${place.vocalized || place.name}، النسبة إليها: ${place.nisbaVocalized || place.nisba}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            <span>استمع للنطق التراثي</span>
          </button>
        </div>

        <div class="modern-name-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>الموقع الجغرافي المعاصر: <strong>${place.modernName}</strong> (${place.modernCountry})</span>
        </div>

        <div>
          <span class="place-nisba-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            النسبة إليها: <strong>${place.nisbaVocalized || place.nisba}</strong>
          </span>
        </div>

        <div class="place-geo-details">
          <div class="geo-detail-item">
            <span class="geo-detail-label">الاسم المعاصر</span>
            <span class="geo-detail-val"><strong>${place.modernName}</strong></span>
          </div>
          <div class="geo-detail-item">
            <span class="geo-detail-label">الدولة الحالية</span>
            <span class="geo-detail-val"><strong>${place.modernCountry}</strong></span>
          </div>
          <div class="geo-detail-item">
            <span class="geo-detail-label">الإحداثيات الجغرافية</span>
            <span class="geo-detail-val" style="direction: ltr; text-align: right;">${place.lat.toFixed(4)}° N, ${place.lng.toFixed(4)}° E</span>
          </div>
          <div class="geo-detail-item">
            <span class="geo-detail-label">مكانتها التاريخية</span>
            <span class="geo-detail-val" style="font-size: 0.76rem;">${place.importance}</span>
          </div>
        </div>
      </div>

      <!-- نبذة جغرافية وتاريخية -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
        <div style="font-size: 0.76rem; color: var(--gold-primary); font-weight: 700; margin-bottom: 4px;">عن الحاضرة:</div>
        <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">${place.summary}</div>
      </div>

      <!-- نص كتاب الأنساب للسمعاني -->
      ${place.samaniQuote ? `
        <div class="manuscript-quote-card samani">
          <div class="quote-source-header">
            <span class="source-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              ${place.samaniQuote.source}
            </span>
            <span class="source-citation">ج ${place.samaniQuote.volume}، ص ${place.samaniQuote.page}</span>
          </div>
          <div class="quote-body-text">
            «${place.samaniQuote.text}»
          </div>
        </div>
      ` : ''}

      <!-- نص كتاب معجم البلدان لياقوت الحموي -->
      ${place.yaqutQuote ? `
        <div class="manuscript-quote-card yaqut">
          <div class="quote-source-header">
            <span class="source-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${place.yaqutQuote.source}
            </span>
            <span class="source-citation">ج ${place.yaqutQuote.volume}، ص ${place.yaqutQuote.page}</span>
          </div>
          <div class="quote-body-text">
            «${place.yaqutQuote.text}»
          </div>
        </div>
      ` : ''}

      <!-- قائمة علماء المدينة وأعلامها -->
      <div class="scholars-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>أعلام الحاضرة ونسبتها (${placeScholars.length})</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${scholarsHtml}
      </div>
    `;

    // ربط الأزرار
    body.querySelectorAll('[data-action="rihla"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-scholar-id');
        const scholar = scholars.find((s) => s.id === sId);
        if (scholar && onDrawRihla) onDrawRihla(scholar);
      });
    });

    body.querySelectorAll('[data-action="card"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-scholar-id');
        const scholar = scholars.find((s) => s.id === sId);
        if (scholar && onGenerateCard) onGenerateCard(scholar, place);
      });
    });

    setupPronunciationButtons(body);
    drawer.classList.add('open');
  }

  // فتح الأنساب غير المكانية (الحرف، الصنائع، الوظائف، القبائل)
  function openNonGeoNisba(nonGeoItem) {
    headerTitle.textContent = "نسبة غير مكانية (حرفة / وظيفة / قبيلة)";

    const scholarsHtml = nonGeoItem.scholars.map((s) => `
      <div class="scholar-card" style="border-right: 3px solid var(--gold-primary);">
        <div class="scholar-card-top">
          <div>
            <div class="scholar-name" style="display: flex; align-items: center; gap: 6px;">
              <span>${s.name}</span>
              <button class="mini-speak-btn" title="استمع لنطق اسم العَلَم" data-speak="${s.name}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>
            </div>
            <div class="scholar-honorific">${s.honorific}</div>
          </div>
          <div class="scholar-dates">
            ${s.birthYearAH ? s.birthYearAH + 'هـ (' + s.birthYearCE + 'م) - ' : ''}${s.deathYearAH}هـ (${s.deathYearCE}م)
          </div>
        </div>

        <div style="margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; font-size: 0.74rem; background: rgba(56, 189, 248, 0.12); color: var(--lapis-light); padding: 2px 8px; border-radius: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>موطن النشاط: <strong>${s.placeName}</strong></span>
        </div>

        <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
          ${s.bio}
        </div>

        <div style="margin-top: 8px;">
          <div style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 600;">أشهر مؤلفاته وآثاره:</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            ${s.famousWorks.join(' • ')}
          </div>
        </div>

        <div style="margin-top: 6px; font-size: 0.68rem; color: var(--text-muted); font-style: italic;">
          المصدر التراثي: ${s.sourceReference}
        </div>

        <div class="scholar-actions-row">
          ${s.placeId ? `
            <button class="btn-rihla-route" data-action="fly-to-city" data-place-id="${s.placeId}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>
              <span>انتقل لموطن العالم (${s.placeName})</span>
            </button>
          ` : ''}
          <button class="btn-share-card" data-action="nongeo-card" data-scholar-id="${s.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            <span>بطاقة المعرفة</span>
          </button>
        </div>
      </div>
    `).join('');

    body.innerHTML = `
      <!-- بطاقة النسبة غير المكانية -->
      <div class="place-hero-card" style="border-color: rgba(56, 189, 248, 0.4);">
        <span class="place-hero-badge" style="background: rgba(56, 189, 248, 0.2); color: var(--lapis-light); border-color: var(--lapis-light);">
          نسبة غير مكانية (${nonGeoItem.categoryType === 'craft' ? 'مهنة / وظيفة' : 'قبيلة / نسب'})
        </span>
        
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin: 8px 0 4px;">
          <h2 class="place-title-ar" style="margin: 0;">${nonGeoItem.vocalized || nonGeoItem.name}</h2>
          <button class="btn-audio-pronounce" title="استمع للنطق الصوتي المضبوط" data-speak="${nonGeoItem.vocalized || nonGeoItem.name}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            <span>استمع للنطق الصوتي</span>
          </button>
        </div>

        <div style="margin-top: 6px;">
          <span style="font-size: 0.8rem; color: var(--gold-300); font-weight: 600;">
            التصنيف التراثي: ${nonGeoItem.category}
          </span>
        </div>

        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.84rem; line-height: 1.6; color: #e2e8f0;">
          <strong>معنى النسبة واشتقاقها:</strong><br/>
          ${nonGeoItem.meaning}
        </div>
      </div>

      <!-- نص الإمام السمعاني في كتاب الأنساب -->
      ${nonGeoItem.samaniQuote ? `
        <div class="manuscript-quote-card samani">
          <div class="quote-source-header">
            <span class="source-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              ${nonGeoItem.samaniQuote.source}
            </span>
            <span class="source-citation">ج ${nonGeoItem.samaniQuote.volume}، ص ${nonGeoItem.samaniQuote.page}</span>
          </div>
          <div class="quote-body-text">
            «${nonGeoItem.samaniQuote.text}»
          </div>
        </div>
      ` : ''}

      <!-- قائمة أشهر الأعلام المنسوبين إليها -->
      <div class="scholars-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>كبار الأعلام المنتسبين إليها وتواريخهم (${nonGeoItem.scholars.length})</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${scholarsHtml}
      </div>
    `;

    // ربط الانتقال لموطن العالم على الخريطة
    body.querySelectorAll('[data-action="fly-to-city"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.getAttribute('data-place-id');
        const p = places.find((x) => x.id === pId);
        if (p && onFlyToPlace) onFlyToPlace(p);
      });
    });

    // ربط بطاقة المعرفة
    body.querySelectorAll('[data-action="nongeo-card"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute('data-scholar-id');
        const scholar = nonGeoItem.scholars.find((s) => s.id === sId);
        if (scholar && onGenerateCard) {
          const dummyPlace = {
            name: scholar.placeName,
            modernName: scholar.placeName,
            modernCountry: "حاضرة تاريخية",
            regionName: nonGeoItem.category,
            lat: 33.31,
            lng: 44.36
          };
          onGenerateCard({
            ...scholar,
            nisba: nonGeoItem.name,
            quote: scholar.bio + " [المصدر: " + scholar.sourceReference + "]"
          }, dummyPlace);
        }
      });
    });

    setupPronunciationButtons(body);
    drawer.classList.add('open');
  }

  function openScholar(scholar) {
    if (scholar.placeId) {
      const p = places.find((x) => x.id === scholar.placeId);
      if (p) {
        openPlace(p);
      }
    }
  }

  return {
    element: drawer,
    openPlace,
    openNonGeoNisba,
    openScholar,
    close: () => drawer.classList.remove('open')
  };
}
