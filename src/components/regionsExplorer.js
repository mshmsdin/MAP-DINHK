/**
 * مكون مستكشف الأقاليم الإسلامية الكبرى وتصفية الخريطة جغرافياً
 */
import { regions } from '../data/regions.js';
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';

export function createRegionsExplorer({ onSelectRegion, onShowAll }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'regions-modal';

  backdrop.innerHTML = `
    <div class="modal-window" style="max-width: 720px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <h3 class="modal-title">أطلس الأقاليم الجغرافية الإسلامية الكبرى</h3>
        </div>
        <button class="drawer-close-btn" id="regions-close-btn" title="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
          تقسيم ديار الإسلام إلى أقاليم جغرافية كبرى كما صنفها ياقوت الحموي في معجم البلدان والمقدسي البشاري في أحسن التقاسيم. انقر على أي إقليم لتركيز الخريطة عليه وحصر بلدانه وعلمائه.
        </p>

        <div style="margin-bottom: 12px; text-align: left;">
          <button id="btn-regions-show-all" style="
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #0f172a;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 5px 14px;
            border-radius: 6px;
            cursor: pointer;
          ">إظهار كافة الأقاليم على الخريطة</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-height: 55vh; overflow-y: auto; padding-left: 4px;">
          ${regions.map((r) => {
            const rPlaces = places.filter((p) => p.regionId === r.id);
            const rPlaceIds = rPlaces.map((p) => p.id);
            const rScholars = scholars.filter((s) => rPlaceIds.includes(s.placeId));

            return `
              <div class="region-card" data-region-id="${r.id}" style="
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 12px;
                padding: 14px;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s;
                border-right: 4px solid ${r.color || 'var(--gold-primary)'};
              ">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <h4 style="font-family: var(--font-title); font-size: 0.95rem; color: #0f172a; font-weight: 800;">
                    ${r.name}
                  </h4>
                  <span style="font-size: 0.7rem; background: #f1f5f9; padding: 2px 7px; border-radius: 4px; color: #475569; font-weight: 600;">
                    ${rPlaces.length} حواضر
                  </span>
                </div>

                <div style="font-size: 0.78rem; line-height: 1.5; color: #475569; margin: 8px 0;">
                  ${r.description}
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 6px;">
                  <span style="font-size: 0.7rem; color: var(--gold-dark); font-weight: 700;">
                    الدول الحالية: ${r.modernCountries.slice(0, 2).join('، ')}...
                  </span>
                  <span style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">
                    ${rScholars.length} علماء
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#regions-close-btn');
  const btnShowAll = backdrop.querySelector('#btn-regions-show-all');

  function close() {
    backdrop.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  btnShowAll.addEventListener('click', () => {
    onShowAll();
    close();
  });

  backdrop.querySelectorAll('.region-card').forEach((card) => {
    card.addEventListener('click', () => {
      const rId = card.getAttribute('data-region-id');
      const region = regions.find((r) => r.id === rId);
      if (region && onSelectRegion) {
        onSelectRegion(region);
        close();
      }
    });
  });

  return {
    element: backdrop,
    show: () => backdrop.classList.add('open'),
    close
  };
}
