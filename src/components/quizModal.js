/**
 * مسابقة وتحدي الأنساب والبلدان التراثي
 */
import { quizQuestions } from '../data/quizQuestions.js';
import { places } from '../data/places.js';

export function createQuizModal({ onFlyToPlace }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'quiz-modal';

  backdrop.innerHTML = `
    <div class="modal-window" style="max-width: 600px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h3 class="modal-title">تحدي الأنساب والبلدان التراثي</h3>
        </div>
        <button class="drawer-close-btn" id="quiz-close-btn" title="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body" id="quiz-body-container"></div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#quiz-close-btn');
  const body = backdrop.querySelector('#quiz-body-container');

  let currentIndex = 0;
  let score = 0;
  let answered = false;

  function close() {
    backdrop.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  function renderQuestion() {
    if (currentIndex >= quizQuestions.length) {
      renderFinalScore();
      return;
    }

    const q = quizQuestions[currentIndex];
    answered = false;

    body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
        <span style="font-size: 0.76rem; color: #64748b; font-weight: 700;">
          السؤال ${currentIndex + 1} من ${quizQuestions.length}
        </span>
        <span style="font-size: 0.8rem; color: #b45309; font-weight: 800;">
          النقاط: ${score}
        </span>
      </div>

      <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 16px; line-height: 1.5;">
        ${q.question}
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;" id="quiz-options-list">
        ${q.options.map((opt, idx) => `
          <button class="quiz-option-btn" data-index="${idx}" style="
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            padding: 10px 14px;
            text-align: right;
            font-family: var(--font-ui);
            font-size: 0.88rem;
            color: #0f172a;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #f1f5f9; text-align: center; line-height: 22px; font-size: 0.74rem; margin-left: 8px; color: #475569;">
              ${idx === 0 ? 'أ' : idx === 1 ? 'ب' : idx === 2 ? 'ج' : 'د'}
            </span>
            ${opt}
          </button>
        `).join('')}
      </div>

      <!-- منطقة الشرح التراثي بعد الإجابة -->
      <div id="quiz-explanation-box" style="display: none; margin-top: 14px; background: #fdfbf7; border: 1.5px solid #b45309; border-radius: 10px; padding: 12px;">
        <div id="quiz-feedback-title" style="font-weight: 800; font-size: 0.9rem; margin-bottom: 4px;"></div>
        <div style="font-size: 0.82rem; line-height: 1.6; color: #334155;">${q.explanation}</div>
        
        <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;">
          ${q.placeId ? `
            <button id="btn-quiz-fly" style="
              display: flex;
              align-items: center;
              gap: 5px;
              background: #e0f2fe;
              border: 1px solid #7dd3fc;
              color: #0369a1;
              padding: 5px 12px;
              border-radius: 6px;
              font-size: 0.74rem;
              font-weight: 700;
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>
              <span>رؤية الحاضرة على الخريطة</span>
            </button>
          ` : ''}
          <button id="btn-quiz-next" style="
            background: var(--gold-primary);
            color: #fff;
            border: none;
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
          ">
            ${currentIndex === quizQuestions.length - 1 ? 'عرض النتيجة النهائية' : 'السؤال التالي ⬅️'}
          </button>
        </div>
      </div>
    `;

    const optionBtns = body.querySelectorAll('.quiz-option-btn');
    const expBox = body.querySelector('#quiz-explanation-box');
    const fbTitle = body.querySelector('#quiz-feedback-title');
    const btnNext = body.querySelector('#btn-quiz-next');
    const btnFly = body.querySelector('#btn-quiz-fly');

    optionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const selIdx = parseInt(btn.getAttribute('data-index'));
        const isCorrect = selIdx === q.correctIndex;

        if (isCorrect) {
          score++;
          btn.style.borderColor = '#16a34a';
          btn.style.background = '#dcfce7';
          btn.style.color = '#14532d';
          fbTitle.innerHTML = '🎉 إجابة صحيحة وموفقة!';
          fbTitle.style.color = '#16a34a';
        } else {
          btn.style.borderColor = '#dc2626';
          btn.style.background = '#fee2e2';
          btn.style.color = '#7f1d1d';
          fbTitle.innerHTML = '❌ إجابة غير دقيقة!';
          fbTitle.style.color = '#dc2626';

          // إبراز الإجابة الصحيحة
          optionBtns[q.correctIndex].style.borderColor = '#16a34a';
          optionBtns[q.correctIndex].style.background = '#dcfce7';
        }

        expBox.style.display = 'block';
      });
    });

    btnNext.addEventListener('click', () => {
      currentIndex++;
      renderQuestion();
    });

    if (btnFly && q.placeId) {
      btnFly.addEventListener('click', () => {
        const place = places.find((p) => p.id === q.placeId);
        if (place && onFlyToPlace) {
          onFlyToPlace(place);
          close();
        }
      });
    }
  }

  function renderFinalScore() {
    const pct = Math.round((score / quizQuestions.length) * 100);
    body.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 3rem; margin-bottom: 8px;">
          ${pct >= 80 ? '🏆' : pct >= 50 ? '📜' : '📖'}
        </div>

        <h3 style="font-family: var(--font-title); font-size: 1.4rem; color: #0f172a; margin-bottom: 6px;">
          ${pct >= 80 ? 'مبارك! باحث تراثي ضليع في الأنساب والبلدان' : pct >= 50 ? 'أحسنت! معرفة جيدة بأعلام وبلدان المسلمين' : 'محاولة طيبة، تابع استكشاف الخريطة لتعميق معرفتك'}
        </h3>

        <div style="font-size: 1.8rem; font-weight: 800; color: var(--gold-primary); font-family: var(--font-title); margin: 12px 0;">
          ${score} / ${quizQuestions.length} (${pct}%)
        </div>

        <p style="font-size: 0.85rem; color: #475569; max-width: 400px; margin: 0 auto 20px auto; line-height: 1.6;">
          لقد اطلعت على نصوص محققة من كتابي السمعاني وياقوت الحموي وتعرفت على الربط بين الأنساب والمواطن المعاصرة.
        </p>

        <div style="display: flex; gap: 8px; justify-content: center;">
          <button id="btn-quiz-restart" style="
            background: linear-gradient(135deg, #b45309, #d97706);
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            font-family: var(--font-ui);
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
          ">إعادة التحدي</button>
          <button id="btn-quiz-finish" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; border-radius: 8px; font-family: var(--font-ui); font-weight: 600; cursor: pointer;">إغلاق</button>
        </div>
      </div>
    `;

    body.querySelector('#btn-quiz-restart').addEventListener('click', () => {
      currentIndex = 0;
      score = 0;
      renderQuestion();
    });

    body.querySelector('#btn-quiz-finish').addEventListener('click', close);
  }

  return {
    element: backdrop,
    show: () => {
      currentIndex = 0;
      score = 0;
      renderQuestion();
      backdrop.classList.add('open');
    },
    close
  };
}
