/**
 * شريط الزمن الهجري التفاعلي للقرون
 */
import { formatCentury } from '../utils/arabic.js';

export function createTimeline({ onCenturyChange }) {
  const dock = document.createElement('div');
  dock.className = 'timeline-dock';

  dock.innerHTML = `
    <div class="timeline-header">
      <div class="timeline-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>مسار القرون الهجرية والتوزيع الحضاري:</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="timeline-current-label" id="timeline-current-text">كافة العصور الإسلامية (1هـ - 8هـ)</span>
        <button class="timeline-all-btn active" id="btn-timeline-all">عرض الكل</button>
      </div>
    </div>

    <div class="timeline-track-wrapper">
      <input 
        type="range" 
        id="timeline-range-input" 
        class="timeline-slider-input" 
        min="1" 
        max="8" 
        step="1" 
        value="3" 
      />
    </div>

    <div class="timeline-markers-labels">
      <span class="timeline-marker-item" data-century="1">1هـ (الصحابة)</span>
      <span class="timeline-marker-item" data-century="2">2هـ (المذاهب)</span>
      <span class="timeline-marker-item" data-century="3">3هـ (الكتب الستة)</span>
      <span class="timeline-marker-item" data-century="4">4هـ (الموسوعات)</span>
      <span class="timeline-marker-item" data-century="5">5هـ (النظاميات)</span>
      <span class="timeline-marker-item" data-century="6">6هـ (السمعاني)</span>
      <span class="timeline-marker-item" data-century="7">7هـ (ياقوت)</span>
      <span class="timeline-marker-item" data-century="8">8هـ (ابن حجر)</span>
    </div>
  `;

  const slider = dock.querySelector('#timeline-range-input');
  const label = dock.querySelector('#timeline-current-text');
  const btnAll = dock.querySelector('#btn-timeline-all');
  const markers = dock.querySelectorAll('.timeline-marker-item');

  let isAll = true;

  function updateCentury(century) {
    isAll = false;
    btnAll.classList.remove('active');
    label.textContent = formatCentury(century);
    markers.forEach((m) => {
      m.classList.toggle('active', parseInt(m.getAttribute('data-century')) === century);
    });
    onCenturyChange(century);
  }

  function setAll() {
    isAll = true;
    btnAll.classList.add('active');
    label.textContent = "كافة العصور الإسلامية (1هـ - 8هـ)";
    markers.forEach((m) => m.classList.remove('active'));
    onCenturyChange(null);
  }

  slider.addEventListener('input', (e) => {
    updateCentury(parseInt(e.target.value));
  });

  btnAll.addEventListener('click', () => {
    setAll();
  });

  markers.forEach((m) => {
    m.addEventListener('click', () => {
      const c = parseInt(m.getAttribute('data-century'));
      slider.value = c;
      updateCentury(c);
    });
  });

  return {
    element: dock,
    reset: setAll
  };
}
