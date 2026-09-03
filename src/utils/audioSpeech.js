/**
 * وحدة النطق الصوتي التراثي للمدن والأنساب والأعلام
 * تدعم Web Speech API بمخارج الحروف الفصحى والتشكيل الدقيق
 * مع مؤشرات تفاعلية للصوت والنبض الصوتي
 */

let arabicVoices = [];
let isVoiceInitialized = false;

// تهيئة الأصوات العربية المتاحة في النظام أو المتصفح
export function initAudioSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  function loadVoices() {
    const allVoices = window.speechSynthesis.getVoices();
    arabicVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
    isVoiceInitialized = true;
  }

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  return true;
}

/**
 * نطق نص عربي مشكول بصوت واضح وتؤدة فصيحة
 * @param {string} text - النص المشكول المراد نطقه
 * @param {Object} options - خيارات السرعة ومؤشرات البدء والانتهاء
 */
export function speakArabic(text, { onStart, onEnd, onError, rate = 0.85, pitch = 1.0 } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("عذراً، النطق الصوتي غير مدعوم في هذا المتصفح.");
    if (onError) onError(new Error("speechSynthesis not supported"));
    return;
  }

  // إيقاف أي صوت قيد التشغيل حالياً لتفادي التداخل
  window.speechSynthesis.cancel();

  // تنظيف النص وضبط التشكيل للنطق الأمثل
  const cleanText = text
    .replace(/[«»"'\(\)\[\]]/g, ' ')
    .replace(/•/g, '،')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ar-SA';
  utterance.rate = rate; // سرعة هادئة رصينة تناسب القراءة التراثية
  utterance.pitch = pitch;

  // اختيار أفضل صوت عربي متاح (طبيعي أو محلي)
  if (arabicVoices.length > 0) {
    // تفضيل الأصوات الطبيعية أو القياسية
    const preferredVoice = arabicVoices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Maged') || 
      v.name.includes('Tariq') || 
      v.name.includes('Arabic') ||
      v.lang === 'ar-SA'
    ) || arabicVoices[0];
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    if (onEnd) onEnd();
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * دالة مساعدة لربط كافة أزرار النطق الصوتي في أي حاوية DOM تلقائياً
 * @param {HTMLElement} container 
 */
export function setupPronunciationButtons(container) {
  if (!container) return;

  const buttons = container.querySelectorAll('[data-speak]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToSpeak = btn.getAttribute('data-speak');
      if (!textToSpeak) return;

      // إضافة حالة النبض الصوتي للزر أثناء التحدث
      btn.classList.add('speaking-active');
      const originalHtml = btn.getAttribute('data-original-label') || btn.innerHTML;
      if (!btn.getAttribute('data-original-label')) {
        btn.setAttribute('data-original-label', originalHtml);
      }

      speakArabic(textToSpeak, {
        onStart: () => {
          btn.classList.add('speaking-active');
        },
        onEnd: () => {
          btn.classList.remove('speaking-active');
        },
        onError: () => {
          btn.classList.remove('speaking-active');
        }
      });
    });
  });
}
