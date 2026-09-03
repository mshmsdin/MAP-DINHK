/**
 * نافذة دليل الباحث والزائر: كيف تستفيد من المنصة وسجل التحديثات
 * رابط الصفحة المباشر: /f1
 */
import { siteGuide } from '../data/siteFeatures.js';

export function createGuideModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'guide-modal';

  backdrop.innerHTML = `
    <div class="modal-window guide-modal-window" style="max-width: 860px; max-height: 90vh;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, #b45309, #78350f);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);
            font-size: 1.25rem;
          ">
            💡
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 class="modal-title" style="font-size: 1.15rem; margin: 0;">دليل الباحث والزائر: كيف تستفيد من المنصة؟</h3>
              <span class="guide-url-badge" id="btn-copy-guide-url" title="انقر لنسخ الرابط المباشر /f1">
                🔗 /f1
              </span>
            </div>
            <span style="font-size: 0.76rem; color: #64748b; font-weight: 600;">
              طرق الاستفادة العلمية والعملية، شرح كافة الأدوات، وسجل الإصدارات المحدثة
            </span>
          </div>
        </div>
        <button class="drawer-close-btn" id="guide-close-btn" title="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- ألسنة التبويب الداخلية -->
      <div class="guide-tabs-bar">
        <button class="guide-tab-btn active" data-tab="benefits">
          <span>🎯</span> كيف تستفيد؟ (طرق الفائدة)
        </button>
        <button class="guide-tab-btn" data-tab="features">
          <span>🧭</span> دليل كافة الأدوات (${siteGuide.features.length})
        </button>
        <button class="guide-tab-btn" data-tab="tips">
          <span>💡</span> نصائح وحيل بحثية (${siteGuide.proTips.length})
        </button>
        <button class="guide-tab-btn" data-tab="changelog">
          <span>📜</span> سجل التحديثات
        </button>
        <button class="guide-tab-btn" data-tab="sources">
          <span>📚</span> أمهات المصادر
        </button>
      </div>

      <!-- محتوى التبويبات -->
      <div class="modal-body" style="padding: 4px 0 0 0;">
        
        <!-- تبويب 1: كيف تستفيد؟ (مسارات عملية لطرق الفائدة) -->
        <div id="tab-content-benefits" class="guide-tab-content">
          <div class="guide-intro-box">
            <h4 style="font-family: var(--font-title); color: #78350f; font-size: 1rem; margin-bottom: 4px;">
              مرحباً بك في «موسوعة أسماء البلدان والكنى والأنساب القديمة»
            </h4>
            <p style="font-size: 0.82rem; color: #475569; line-height: 1.7; margin: 0;">
              صُممت هذه المنصة لتكون مرجعاً رقمياً وجغرافياً متقدماً يخدم الباحثين، وطلبة العلم، والمحققين، وعموم المهتمين بالتراث والحضارة الإسلامية. اختر مسارك أدناه لتتعرف على كيفية تحقيق أقصى نفع عملي من أدوات الموقع:
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
            ${siteGuide.howToBenefit.map((b, idx) => `
              <div class="benefit-card">
                <div class="benefit-card-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="benefit-card-icon">${b.icon}</span>
                    <h4 class="benefit-card-title">${b.role}</h4>
                  </div>
                  <span class="benefit-step-num">مسار رقم ${idx + 1}</span>
                </div>
                <div class="benefit-card-summary">${b.summary}</div>
                <div class="benefit-steps-list">
                  <div style="font-size: 0.74rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;">خطوات الاستفادة العملية:</div>
                  <ol style="margin: 0; padding-right: 20px; font-size: 0.8rem; color: #334155; line-height: 1.8;">
                    ${b.steps.map(s => `<li>${s}</li>`).join('')}
                  </ol>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب 2: دليل كافة الأدوات والميزات -->
        <div id="tab-content-features" class="guide-tab-content" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            ${siteGuide.features.map((f) => `
              <div class="feature-guide-card">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <h4 style="font-family: var(--font-title); font-size: 0.98rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px; margin: 0;">
                    <span>${f.title}</span>
                  </h4>
                  <span class="badge-feature">${f.badge}</span>
                </div>

                <p style="font-size: 0.82rem; color: #475569; line-height: 1.6; margin-bottom: 8px;">
                  ${f.description}
                </p>

                <div style="background: #f8fafc; border-radius: 8px; padding: 8px 12px; border: 1px solid #f1f5f9;">
                  <ul style="padding-right: 18px; font-size: 0.78rem; color: #334155; line-height: 1.7; margin: 0;">
                    ${f.capabilities.map((c) => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب 3: نصائح وحيل بحثية ذكية (Pro Tips) -->
        <div id="tab-content-tips" class="guide-tab-content" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            ${siteGuide.proTips.map((t, i) => `
              <div class="protip-card">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 1.1rem;">💡</span>
                  <div style="font-weight: 800; font-size: 0.94rem; color: #92400e;">فائدة بحثية #${i + 1}: ${t.title}</div>
                </div>
                <div style="font-size: 0.82rem; color: #334155; line-height: 1.7; padding-right: 28px;">
                  ${t.tip}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب 4: سجل التحديثات والإصدارات -->
        <div id="tab-content-changelog" class="guide-tab-content" style="display: none;">
          <div style="position: relative; padding-right: 18px;">
            <div style="position: absolute; right: 6px; top: 0; bottom: 0; width: 2px; background: #e2e8f0;"></div>

            ${siteGuide.changelog.map((c, idx) => `
              <div style="position: relative; margin-bottom: 18px;">
                <div style="
                  position: absolute;
                  right: -17px;
                  top: 4px;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: ${idx === 0 ? 'var(--gold-primary)' : '#94a3b8'};
                  border: 2px solid #fff;
                  box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.2);
                "></div>

                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-family: var(--font-title); font-size: 0.95rem; font-weight: 800; color: #0f172a;">
                        الإصدار v${c.version}
                      </span>
                      <span style="font-size: 0.74rem; font-weight: 700; color: var(--gold-dark);">${c.title}</span>
                    </div>
                    <span style="font-size: 0.7rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                      ${c.date}
                    </span>
                  </div>

                  <ul style="padding-right: 18px; font-size: 0.78rem; color: #334155; line-height: 1.7; margin: 0;">
                    ${c.changes.map((item) => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب 5: أمهات المصادر والمراجع المحققة -->
        <div id="tab-content-sources" class="guide-tab-content" style="display: none;">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: #fdfbf7; border: 1.5px solid var(--gold-primary); border-radius: 12px; padding: 16px;">
              <h4 style="font-family: var(--font-title); font-size: 1.05rem; color: #0f172a; font-weight: 800; margin-bottom: 8px;">
                الرؤية والمنهج العلمي للمنصة
              </h4>
              <p style="font-size: 0.84rem; line-height: 1.8; color: #334155; text-align: justify; margin: 0;">
                تقوم هذه الموسوعة على بناء مرجع رقمي أصيل يربط أنساب وكنى علماء المسلمين بمواطنهم الجغرافية بدقة، معتمدةً على أمهات كتب البلدان والأنساب المحققة معيارياً، دون الاقتصار على مجرد النقل، بل من خلال المطابقة الجغرافية المعاصرة (GIS)، وحساب المسالك بالفراسخ والمراحل، وتتبع مسارات الرحلات، وتجريد التسميات من ألقاب التفخيم التزاماً بالمنهج الموسوعي الصارم.
              </p>
            </div>

            ${siteGuide.sources.map((s) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; border-right: 4px solid var(--gold-primary);">
                <div style="font-weight: 800; font-size: 1rem; color: #0f172a;">${s.name}</div>
                <div style="font-size: 0.78rem; color: var(--gold-dark); font-weight: 700; margin: 2px 0 4px 0;">المؤلف: ${s.author}</div>
                <div style="font-size: 0.74rem; color: #64748b; font-weight: 600; margin-bottom: 6px;">النسخة المحققة: ${s.edition}</div>
                <div style="font-size: 0.8rem; line-height: 1.6; color: #475569;">${s.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 0.74rem; color: #64748b;">
          رابط هذه الصفحة الدائم: <strong>https://map-dinhk.mshmsdin.com/f1</strong>
        </div>
        <button id="btn-guide-close-bottom" style="
          background: var(--gold-primary);
          color: #fff;
          border: none;
          padding: 7px 18px;
          border-radius: 8px;
          font-family: var(--font-ui);
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
        ">إغلاق والعودة للمنصة</button>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#guide-close-btn');
  const closeBottomBtn = backdrop.querySelector('#btn-guide-close-bottom');
  const btnCopyUrl = backdrop.querySelector('#btn-copy-guide-url');

  function open(updateHistory = true) {
    backdrop.classList.add('open');
    if (updateHistory && window.location.pathname !== '/f1') {
      try {
        window.history.pushState({ modal: 'guide' }, '', '/f1');
      } catch(e) {}
    }
  }

  function close(updateHistory = true) {
    backdrop.classList.remove('open');
    if (updateHistory && window.location.pathname === '/f1') {
      try {
        window.history.pushState(null, '', '/');
      } catch(e) {}
    }
  }

  closeBtn.addEventListener('click', () => close(true));
  closeBottomBtn.addEventListener('click', () => close(true));
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close(true);
  });

  // نسخ الرابط /f1
  btnCopyUrl.addEventListener('click', () => {
    const fullUrl = `${window.location.origin}/f1`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      btnCopyUrl.textContent = 'تم النسخ بنجاح! ✓';
      setTimeout(() => { btnCopyUrl.textContent = '🔗 /f1'; }, 2000);
    });
  });

  // التحكم بالألسنة
  const tabBtns = backdrop.querySelectorAll('.guide-tab-btn');
  const tabContents = backdrop.querySelectorAll('.guide-tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => {
        b.classList.remove('active');
      });

      btn.classList.add('active');

      tabContents.forEach((c) => {
        c.style.display = 'none';
      });

      const activeContent = backdrop.querySelector(`#tab-content-${tabKey}`);
      if (activeContent) activeContent.style.display = 'block';
    });
  });

  // استماع للزر الرجوع بالمتصفح (Popstate)
  window.addEventListener('popstate', () => {
    if (window.location.pathname === '/f1' || window.location.hash === '#f1') {
      open(false);
    } else {
      close(false);
    }
  });

  return {
    element: backdrop,
    show: open,
    close
  };
}
