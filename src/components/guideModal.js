/**
 * نافذة دليل ميزات المنصة وسجل التحديثات المستمرة
 */
import { siteGuide } from '../data/siteFeatures.js';

export function createGuideModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'guide-modal';

  backdrop.innerHTML = `
    <div class="modal-window" style="max-width: 820px; max-height: 88vh;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #b45309, #78350f);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="modal-title" style="font-size: 1.15rem; margin-bottom: 2px;">دليل ميزات المنصة وسجل التحديثات</h3>
            <span style="font-size: 0.74rem; color: var(--gold-dark); font-weight: 700;">
              الإصدار الحالي: v${siteGuide.currentVersion} • آخر تحديث: ${siteGuide.lastUpdated}
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
      <div style="display: flex; gap: 8px; border-bottom: 1.5px solid #e2e8f0; margin-bottom: 16px; padding-bottom: 4px;">
        <button class="guide-tab-btn active" data-tab="features" style="
          background: none;
          border: none;
          font-family: var(--font-ui);
          font-size: 0.86rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--gold-dark);
          background: #fef3c7;
        ">ميزات واستخدامات المنصة (${siteGuide.features.length})</button>

        <button class="guide-tab-btn" data-tab="changelog" style="
          background: none;
          border: none;
          font-family: var(--font-ui);
          font-size: 0.86rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
        ">سجل التحديثات والإصدارات (${siteGuide.changelog.length})</button>

        <button class="guide-tab-btn" data-tab="sources" style="
          background: none;
          border: none;
          font-family: var(--font-ui);
          font-size: 0.86rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
        ">المصادر والمنهجية العلمية</button>
      </div>

      <!-- محتوى التبويبات -->
      <div class="modal-body" style="padding: 0;">
        <!-- تبويب الميزات -->
        <div id="tab-content-features" class="guide-tab-content">
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            ${siteGuide.features.map((f) => `
              <div style="
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 12px;
                padding: 14px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                transition: transform 0.2s;
              ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <h4 style="font-family: var(--font-title); font-size: 1rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                    <span>${f.title}</span>
                  </h4>
                  <span style="
                    font-size: 0.7rem;
                    background: #fef3c7;
                    color: #92400e;
                    border: 1px solid #fde68a;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-weight: 700;
                  ">${f.badge}</span>
                </div>

                <p style="font-size: 0.82rem; color: #475569; line-height: 1.6; margin-bottom: 8px;">
                  ${f.description}
                </p>

                <div style="background: #f8fafc; border-radius: 8px; padding: 10px; border: 1px solid #f1f5f9;">
                  <div style="font-size: 0.74rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">إمكانيات واستخدام الميزة:</div>
                  <ul style="padding-right: 18px; font-size: 0.78rem; color: #334155; line-height: 1.7;">
                    ${f.capabilities.map((c) => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب سجل التحديثات -->
        <div id="tab-content-changelog" class="guide-tab-content" style="display: none;">
          <div style="position: relative; padding-right: 18px;">
            <div style="position: absolute; right: 6px; top: 0; bottom: 0; width: 2px; background: #e2e8f0;"></div>

            ${siteGuide.changelog.map((c, idx) => `
              <div style="position: relative; margin-bottom: 20px;">
                <div style="
                  position: absolute;
                  right: -17px;
                  top: 2px;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: ${idx === 0 ? 'var(--gold-primary)' : '#94a3b8'};
                  border: 2px solid #fff;
                  box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.2);
                "></div>

                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-family: var(--font-title); font-size: 1rem; font-weight: 800; color: #0f172a;">
                        الإصدار v${c.version}
                      </span>
                      <span style="font-size: 0.74rem; font-weight: 700; color: var(--gold-dark);">${c.title}</span>
                    </div>
                    <span style="font-size: 0.72rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                      ${c.date}
                    </span>
                  </div>

                  <ul style="padding-right: 18px; font-size: 0.8rem; color: #334155; line-height: 1.7;">
                    ${c.changes.map((item) => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- تبويب المصادر والمنهجية -->
        <div id="tab-content-sources" class="guide-tab-content" style="display: none;">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: #fdfbf7; border: 1.5px solid var(--gold-primary); border-radius: 12px; padding: 16px;">
              <h4 style="font-family: var(--font-title); font-size: 1.05rem; color: #0f172a; font-weight: 800; margin-bottom: 8px;">
                الرؤية والمنهج العلمي للمنصة
              </h4>
              <p style="font-size: 0.84rem; line-height: 1.8; color: #334155; text-align: justify;">
                يقوم هذا المشروع على تجسيد التراث الجغرافي والنسبي الإسلامي في قالب رقمي حديث. فالنسبة في الحضارة الإسلامية ليست مجرد كنية عابرة، بل هي هوية مكانية وحضارية وعلمية توثق رحلة العلماء بين الحواضر وأثر البيئات الجغرافية في نشأة المدارس الفقهية والحديثية والفلكية.
              </p>
            </div>

            ${siteGuide.sources.map((s) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; border-right: 4px solid var(--gold-primary);">
                <div style="font-weight: 800; font-size: 1rem; color: #0f172a;">${s.name}</div>
                <div style="font-size: 0.78rem; color: var(--gold-dark); font-weight: 700; margin: 3px 0 6px 0;">المؤلف: ${s.author}</div>
                <div style="font-size: 0.8rem; line-height: 1.6; color: #475569;">${s.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
        <button id="btn-guide-close-bottom" style="
          background: var(--gold-primary);
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-family: var(--font-ui);
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
        ">فهمت، العودة للمنصة</button>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#guide-close-btn');
  const closeBottomBtn = backdrop.querySelector('#btn-guide-close-bottom');

  function close() {
    backdrop.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  closeBottomBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  // التحكم بالألسنة
  const tabBtns = backdrop.querySelectorAll('.guide-tab-btn');
  const tabContents = backdrop.querySelectorAll('.guide-tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => {
        b.classList.remove('active');
        b.style.background = 'none';
        b.style.color = '#475569';
      });

      btn.classList.add('active');
      btn.style.background = '#fef3c7';
      btn.style.color = 'var(--gold-dark)';

      tabContents.forEach((c) => {
        c.style.display = 'none';
      });

      const activeContent = backdrop.querySelector(`#tab-content-${tabKey}`);
      if (activeContent) activeContent.style.display = 'block';
    });
  });

  return {
    element: backdrop,
    show: () => backdrop.classList.add('open'),
    close
  };
}
