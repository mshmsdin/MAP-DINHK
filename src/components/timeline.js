/**
 * شريط مسار القرون الهجرية العمودي على اليسار
 * تصميم راقٍ وخفيف يدعم الطي والتوسيع، متجاوب بالكامل مع الجوال والشاشات المختلفة
 */
import { formatCentury } from '../utils/arabic.js';

export function createTimeline({ onCenturyChange }) {
  const rail = document.createElement('div');
  rail.id = 'timeline-vertical-rail';
  rail.className = 'timeline-vertical-rail';

  rail.innerHTML = `
    <!-- زر طي/توسيع الشريط العمودي -->
    <button class="tv-toggle-btn" id="btn-toggle-timeline" title="طي/توسيع شريط القرون">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="tv-toggle-icon">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <!-- رأس الشريط -->
    <div class="tv-header">
      <div class="tv-title-group">
        <span class="tv-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </span>
        <span class="tv-title-text">مسار القرون</span>
      </div>
      <button class="tv-all-btn active" id="btn-timeline-all" title="إظهار كافة العصور">الكل</button>
    </div>

    <!-- وصف العصر المختار -->
    <div class="tv-active-era-badge" id="timeline-current-text">
      كافة العصور الإسلامية (1هـ - 8هـ)
    </div>

    <!-- قائمة القرون العمودية -->
    <div class="tv-nodes-list">
      <div class="tv-node-item" data-century="1" title="القرن 1هـ: عصر الصحابة والفتوحات">
        <span class="tv-node-badge">1هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">عصر الصحابة</span>
          <span class="tv-node-desc">الفتوحات الكبرى</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="2" title="القرن 2هـ: عصر المذاهب الفقهية">
        <span class="tv-node-badge">2هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">الأئمة والمذاهب</span>
          <span class="tv-node-desc">تدوين الفقه واللغة</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="3" title="القرن 3هـ: الكتب الستة">
        <span class="tv-node-badge">3هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">الكتب الستة</span>
          <span class="tv-node-desc">أئمة الحديث الكبار</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="4" title="القرن 4هـ: عصر الموسوعات">
        <span class="tv-node-badge">4هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">الموسوعات</span>
          <span class="tv-node-desc">العصر الذهبي للعلوم</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="5" title="القرن 5هـ: المدارس النظامية">
        <span class="tv-node-badge">5هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">النظاميات</span>
          <span class="tv-node-desc">أئمة الكلام والأصول</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="6" title="القرن السادس الهجري">
        <span class="tv-node-badge">6هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">القرن السادس</span>
          <span class="tv-node-desc">كتاب «الأنساب»</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="7" title="القرن السابع الهجري">
        <span class="tv-node-badge">7هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">القرن السابع</span>
          <span class="tv-node-desc">«معجم البلدان»</span>
        </div>
      </div>

      <div class="tv-node-item" data-century="8" title="القرن الثامن الهجري">
        <span class="tv-node-badge">8هـ</span>
        <div class="tv-node-details">
          <span class="tv-node-name">القرن الثامن</span>
          <span class="tv-node-desc">الشروح والموسوعات</span>
        </div>
      </div>
    </div>
  `;

  const label = rail.querySelector('#timeline-current-text');
  const btnAll = rail.querySelector('#btn-timeline-all');
  const toggleBtn = rail.querySelector('#btn-toggle-timeline');
  const toggleIcon = rail.querySelector('#tv-toggle-icon');
  const nodes = rail.querySelectorAll('.tv-node-item');

  let isCollapsed = false;
  let activeCentury = null;

  function updateCentury(century) {
    activeCentury = century;
    btnAll.classList.remove('active');
    label.textContent = formatCentury(century);
    nodes.forEach((n) => {
      n.classList.toggle('active', parseInt(n.getAttribute('data-century')) === century);
    });
    onCenturyChange(century);
  }

  function setAll() {
    activeCentury = null;
    btnAll.classList.add('active');
    label.textContent = "كافة العصور الإسلامية (1هـ - 8هـ)";
    nodes.forEach((n) => n.classList.remove('active'));
    onCenturyChange(null);
  }

  // أحداث النقر على القرون
  nodes.forEach((node) => {
    node.addEventListener('click', () => {
      const c = parseInt(node.getAttribute('data-century'));
      if (activeCentury === c) {
        setAll(); // النقر مرة ثانية يعيد عرض الكل
      } else {
        updateCentury(c);
      }
    });
  });

  btnAll.addEventListener('click', setAll);

  // طي وتوسيع الشريط العمودي
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    rail.classList.toggle('collapsed', isCollapsed);
    if (isCollapsed) {
      toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
    } else {
      toggleIcon.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
    }
  });

  return {
    element: rail,
    reset: setAll
  };
}
