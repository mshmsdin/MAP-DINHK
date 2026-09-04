/**
 * النوافذ المنبثقة: الإحصائيات وبطاقات المعرفة للمشاركة
 */
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';
import { regions } from '../data/regions.js';
import { nonGeoNisbas } from '../data/nonGeoNisbas.js';

export function createModals() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'app-modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal-window" id="modal-window">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-title">العنوان</h3>
        <button class="drawer-close-btn" id="modal-close-btn" title="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="modal-body-content"></div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#modal-close-btn');
  const modalTitle = backdrop.querySelector('#modal-title');
  const modalBody = backdrop.querySelector('#modal-body-content');

  function close() {
    backdrop.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  // فتح نافذة الإحصائيات الشاملة
  function showStats() {
    modalTitle.textContent = "إحصائيات المنصة ومصادر التوثيق التراثي";

    modalBody.innerHTML = `
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px;">
        <div class="stat-box">
          <div class="stat-number">36,775</div>
          <div class="stat-title">مادة تراثية كاملة (100%)</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${places.length}</div>
          <div class="stat-title">حاضرة وموضع على الخريطة</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${scholars.length + nonGeoNisbas.reduce((acc, x) => acc + x.scholars.length, 0)}</div>
          <div class="stat-title">عالم وإمام محقق</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">5</div>
          <div class="stat-title">أمهات كتب تراثية كاملة</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 55vh; overflow-y: auto; padding-left: 4px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
          <h4 style="color: #60a5fa; font-size: 0.92rem; margin-bottom: 6px;">📍 1. «معجم البلدان» - الإمام ياقوت الحموي (ت 626هـ) [12,358 مادة]:</h4>
          <p style="font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            تاج المعاجم الجغرافية في الحضارة الإسلامية، يجمع بين الجغرافيا والتاريخ والتراجم والأدب، مقدماً سجلاً حياً لأحوال الحواضر الإسلامية.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
          <h4 style="color: #2dd4bf; font-size: 0.92rem; margin-bottom: 6px;">🗺️ 2. «مراصد الاطلاع على أسماء الأمكنة والبقاع» - صفي الدين البغدادي (ت 739هـ) [11,642 مادة]:</h4>
          <p style="font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            تهذيب وضبط فائق الدقة لمعجم البلدان لياقوت الحموي، حرره وصحح ضبط حروفه بحروف المعجم وحذف الحشو والأشعار الطويلة ليجعله عمدة في تحقيق المواضع.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
          <h4 style="color: #4ade80; font-size: 0.92rem; margin-bottom: 6px;">🏺 3. «معجم ما استُعجِم من أسماء البلاد والمواضع» - أبو عبيد البكري الأندلسي (ت 487هـ) [3,750 مادة]:</h4>
          <p style="font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            أقدم المعاجم الجغرافية المفردة، خزانة شعرية وجغرافية فريدة ضبطت مواضع جزيرة العرب وأشعار الجاهلية وصدر الإسلام وأماكن السيرة والحديث النبوي.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
          <h4 style="color: #fbbf24; font-size: 0.92rem; margin-bottom: 6px;">📜 4. «كتاب الأنساب» - الإمام أبو سعد السمعاني (ت 562هـ) [4,442 مادة]:</h4>
          <p style="font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            أعظم موسوعة تراثية في ضبط الأنساب والألقاب والكنى والنسبة إلى البلدان والقبائل والصنائع بالسماع المباشر وضبط الحروف بالكلمات والحركات.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px;">
          <h4 style="color: #c084fc; font-size: 0.92rem; margin-bottom: 6px;">✨ 5. «اللباب في تهذيب الأنساب» - عز الدين ابن الأثير الجزري (ت 630هـ) [4,583 مادة]:</h4>
          <p style="font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">
            تهذيب واستدراك بارع على كتاب الأنساب للسمعاني، استدرك فيه ابن الأثير أوهاماً وأضاف مئات الأنساب والأعلام التي فاتت السمعاني.
          </p>
        </div>
      </div>

      <div style="margin-top: 18px; text-align: center;">
        <button id="btn-close-stats-action" style="
          background: var(--gold-primary);
          color: #000;
          border: none;
          font-family: var(--font-ui);
          font-weight: 700;
          padding: 8px 24px;
          border-radius: 8px;
          cursor: pointer;
        ">إغلاق</button>
      </div>
    `;

    modalBody.querySelector('#btn-close-stats-action').addEventListener('click', close);
    backdrop.classList.add('open');
  }

  // فتح بطاقة المعرفة التفاعلية
  function showScholarCard(scholar, place) {
    modalTitle.textContent = `بطاقة المعرفة: ${scholar.name}`;

    modalBody.innerHTML = `
      <div class="infographic-preview-card" id="exportable-card">
        <div style="font-size: 0.76rem; color: var(--gold-primary); letter-spacing: 1px; font-weight: 600;">
          معجم الأنساب والبلدان • السمعاني وياقوت الحموي
        </div>

        <h2 style="font-family: var(--font-title); font-size: 1.7rem; color: #fff; margin: 12px 0 4px 0;">
          ${scholar.name}
        </h2>

        <div style="color: var(--gold-300); font-size: 0.88rem; font-weight: 600;">
          ${scholar.honorific}
        </div>

        <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--gold-primary); padding: 4px 14px; border-radius: 999px; margin: 14px 0; color: var(--gold-100); font-size: 0.84rem;">
          النسبة: ${scholar.nisba} • الموطن التاريخي: ${place.name}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; text-align: right; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px;">
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">الموقع المعاصر:</div>
            <div style="font-size: 0.85rem; color: #fff; font-weight: 600;">${place.modernName}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">الدولة الحالية:</div>
            <div style="font-size: 0.85rem; color: #fff; font-weight: 600;">${place.modernCountry}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">تاريخ الوفاة:</div>
            <div style="font-size: 0.85rem; color: var(--gold-primary); font-weight: 600;">${scholar.deathYearAH}هـ (${scholar.deathYearCE}م)</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">الإقليم التاريخي:</div>
            <div style="font-size: 0.85rem; color: #fff; font-weight: 600;">${place.regionName}</div>
          </div>
        </div>

        <div style="font-family: var(--font-amiri); font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-top: 10px; font-style: italic;">
          ${scholar.quote}
        </div>

        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.72rem; color: var(--text-muted);">
          إحداثيات الموطن: ${place.lat.toFixed(2)}° N, ${place.lng.toFixed(2)}° E • مستخلص من كتابي الأنساب ومعجم البلدان
        </div>
      </div>

      <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
        <button id="btn-copy-card-text" style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--gold-dark), var(--gold-primary));
          color: #000;
          border: none;
          font-family: var(--font-ui);
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          <span id="copy-btn-text">نسخ بيانات البطاقة</span>
        </button>
        <button id="btn-close-card" style="
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid var(--border-subtle);
          font-family: var(--font-ui);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        ">إغلاق</button>
      </div>
    `;

    const copyBtn = modalBody.querySelector('#btn-copy-card-text');
    const copyBtnText = modalBody.querySelector('#copy-btn-text');
    const closeCardBtn = modalBody.querySelector('#btn-close-card');

    closeCardBtn.addEventListener('click', close);

    copyBtn.addEventListener('click', () => {
      const summaryText = `
العالم: ${scholar.name}
النسبة: ${scholar.nisba} إلى بلد (${place.name})
الموقع المعاصر: ${place.modernName} - ${place.modernCountry}
تاريخ الوفاة: ${scholar.deathYearAH}هـ (${scholar.deathYearCE}م)
الإقليم التاريخي: ${place.regionName}
أشهر مؤلفاته: ${scholar.famousWorks.join('، ')}
توثيق المصادر:
${scholar.quote}
[معجم الأنساب والبلدان الجغرافي]
      `.trim();

      navigator.clipboard.writeText(summaryText).then(() => {
        copyBtnText.textContent = "تم النسخ بنجاح!";
        setTimeout(() => {
          copyBtnText.textContent = "نسخ بيانات البطاقة";
        }, 2000);
      });
    });

    backdrop.classList.add('open');
  }

  return {
    element: backdrop,
    showStats,
    showScholarCard,
    close
  };
}
