/**
 * حاسبة المسافات والمسالك التراثية (الفراسخ والمراحل وأيام السير)
 */
import { places } from '../data/places.js';
import { calculateHaversineDistance, convertToHistoricalDistances } from '../utils/geoCalc.js';

export function createDistanceCalculator({ onDrawRoute }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'distance-calc-modal';

  backdrop.innerHTML = `
    <div class="modal-window" style="max-width: 580px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <h3 class="modal-title">حاسبة المسالك والفراسخ وأيام السير التراثية</h3>
        </div>
        <button class="drawer-close-btn" id="calc-close-btn" title="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
          احسب المسافات بين أي حاضرتين تاريخيتين بالمقاييس المعتمدة لدى الجغرافيين المسلمين في كتب المسالك والممالك ومعجم البلدان (الفراسخ والمراحل وأيام سير القوافل في طلب الحديث).
        </p>

        <!-- اختيارات المدن -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div>
            <label style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">
              نقطة الانطلاق (من):
            </label>
            <select id="calc-from-city" class="search-input" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px; background: #fff; color: #0f172a; font-weight: 600;">
              ${places.map((p, i) => `<option value="${p.id}" ${i === 0 ? 'selected' : ''}>${p.name} (${p.nisba})</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">
              المقصد والغاية (إلى):
            </label>
            <select id="calc-to-city" class="search-input" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px; background: #fff; color: #0f172a; font-weight: 600;">
              ${places.map((p, i) => `<option value="${p.id}" ${i === 5 ? 'selected' : ''}>${p.name} (${p.nisba})</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- أزرار مسارات شهيرة سريعة -->
        <div style="margin-bottom: 14px;">
          <span style="font-size: 0.72rem; color: var(--gold-dark); font-weight: 700;">مسالك تاريخية شهيرة:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
            <button class="quick-suggest-pill" data-from="tirmidh" data-to="balkh">ترمذ ↔ بلخ (عبر جيحون)</button>
            <button class="quick-suggest-pill" data-from="nishapur" data-to="merv">نيسابور ↔ مرو الشاهجان</button>
            <button class="quick-suggest-pill" data-from="baghdad" data-to="kufa">بغداد ↔ الكوفة</button>
            <button class="quick-suggest-pill" data-from="bukhara" data-to="samarkand">بخارى ↔ سمرقند</button>
            <button class="quick-suggest-pill" data-from="damascus" data-to="baghdad">دمشق ↔ بغداد</button>
          </div>
        </div>

        <!-- منطقة عرض النتائج -->
        <div id="calc-results-card" style="background: #fdfbf7; border: 1.5px solid #b45309; border-radius: 12px; padding: 16px; margin-bottom: 14px;"></div>

        <!-- أزرار الإجراء -->
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="btn-draw-calc-route" style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #b45309, #d97706);
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-family: var(--font-ui);
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>رسم درب السير على الخريطة</span>
          </button>
          <button id="btn-close-calc" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 8px 14px; border-radius: 8px; font-family: var(--font-ui); cursor: pointer; font-weight: 600;">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#calc-close-btn');
  const btnClose = backdrop.querySelector('#btn-close-calc');
  const selectFrom = backdrop.querySelector('#calc-from-city');
  const selectTo = backdrop.querySelector('#calc-to-city');
  const resultsCard = backdrop.querySelector('#calc-results-card');
  const btnDraw = backdrop.querySelector('#btn-draw-calc-route');

  function close() {
    backdrop.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  function calculate() {
    const fromId = selectFrom.value;
    const toId = selectTo.value;

    const fromPlace = places.find((p) => p.id === fromId);
    const toPlace = places.find((p) => p.id === toId);

    if (!fromPlace || !toPlace || fromId === toId) {
      resultsCard.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          يرجى اختيار حاضرتين مختلفتين لحساب المسافة والمسلك.
        </div>
      `;
      btnDraw.style.display = 'none';
      return;
    }

    btnDraw.style.display = 'inline-flex';

    const distKm = calculateHaversineDistance(fromPlace.lat, fromPlace.lng, toPlace.lat, toPlace.lng);
    const hist = convertToHistoricalDistances(distKm);

    resultsCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
        <span style="font-weight: 800; color: #0f172a; font-size: 1rem;">
          درب: ${fromPlace.name} ⬅️ إلى ➡️ ${toPlace.name}
        </span>
        <span style="font-size: 0.76rem; color: #b45309; font-weight: 700;">
          المسافة المباشرة: ${hist.km.toLocaleString('ar-EG')} كم
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; text-align: center;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: #b45309; font-family: var(--font-title);">${hist.farsakh.toLocaleString('ar-EG')}</div>
          <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">فرسخاً تراثياً</div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: #0284c7; font-family: var(--font-title);">${hist.marhalah.toLocaleString('ar-EG')}</div>
          <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">مرحلة (يوم سير قافلة)</div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 1.3rem; font-weight: 800; color: #059669; font-family: var(--font-title);">${hist.barid.toLocaleString('ar-EG')}</div>
          <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">سكة بريد سلطاني</div>
        </div>
      </div>

      <div style="font-size: 0.78rem; line-height: 1.6; color: #334155; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">تقدير زمن السير والرحلة قديماً:</div>
        <div>🐪 <strong>قوافل التجارة والحج المعتدلة:</strong> يستغرق السير نحو <strong>${hist.caravanDays} يوماً</strong>.</div>
        <div>🚶 <strong>مشاة طلبة الحديث والزهاد:</strong> يستغرق السير نحو <strong>${hist.walkingDays} يوماً</strong>.</div>
        <div>🐎 <strong>البريد السريع والمراسلات السلطانية:</strong> يستغرق السير نحو <strong>${hist.expressHorseDays} أيام</strong>.</div>
      </div>
    `;
  }

  selectFrom.addEventListener('change', calculate);
  selectTo.addEventListener('change', calculate);

  // ربط الأزرار السريعة
  backdrop.querySelectorAll('.quick-suggest-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectFrom.value = btn.getAttribute('data-from');
      selectTo.value = btn.getAttribute('data-to');
      calculate();
    });
  });

  btnDraw.addEventListener('click', () => {
    const fromId = selectFrom.value;
    const toId = selectTo.value;
    const fromPlace = places.find((p) => p.id === fromId);
    const toPlace = places.find((p) => p.id === toId);
    if (fromPlace && toPlace && onDrawRoute) {
      onDrawRoute(fromPlace, toPlace);
      close();
    }
  });

  calculate();

  return {
    element: backdrop,
    show: (initialFromId, initialToId) => {
      if (initialFromId) selectFrom.value = initialFromId;
      if (initialToId) selectTo.value = initialToId;
      calculate();
      backdrop.classList.add('open');
    },
    close
  };
}
