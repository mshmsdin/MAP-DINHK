/**
 * أدوات معالجة اللغة العربية والبحث الصوتي والدلالي للأنساب والبلدان
 */

// إزالة التشكيل وعلامات الضبط
export function removeTashkeel(text) {
  if (!text) return "";
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

// تطبيع الحروف العربية المتقاربة للبحث المرن
export function normalizeArabic(text) {
  if (!text) return "";
  let s = removeTashkeel(text).trim().toLowerCase();
  
  // توحيد الألفات
  s = s.replace(/[إأآاٱ]/g, "ا");
  // توحيد الياء والألف المقصورة
  s = s.replace(/[ىي]/g, "ي");
  // توحيد التاء المربوطة والهاء في كافة المواضع
  s = s.replace(/ة/g, "ه");
  // توحيد الهمزات المتطرفة والمتوسطة
  s = s.replace(/[ؤئء]/g, "ء");
  // إزالة الكشيدة (التطويل)
  s = s.replace(/\u0640/g, "");
  
  return s;
}

// إزالة أل التعريف وأدوات النسب الشائعة للمقارنة الجذرية
export function extractArabicStem(text) {
  let s = normalizeArabic(text);
  
  // إزالة "الـ" من بداية الكلمة إذا لم تكن كلمة "آل" المستقلة
  if (s.startsWith("ال ") || s.startsWith("الـ ")) {
    // كلمة آل المستقلة للبيوتات والعائلات
  } else if (s.startsWith("ال") && s.length > 3) {
    s = s.substring(2);
  }
  
  // إزالة ياء النسب المشددة من نهاية الكلمة إذا كانت نسبة
  // ترمذي -> ترمذ، بخاري -> بخار، نيسابوري -> نيسابور
  if (s.endsWith("ي") && s.length > 3) {
    s = s.slice(0, -1);
  } else if (s.endsWith("يه") && s.length > 4) {
    s = s.slice(0, -2);
  }
  
  return s.trim();
}

// تجزئة النص إلى كلمات مطبعة خالية من أل التعريف للبحث المركب
export function getSearchTokens(text) {
  if (!text) return [];
  const normalized = normalizeArabic(text);
  return normalized
    .split(/[\s,،.\-–—()\[\]{}«»"'/\\:]+/)
    .filter(t => t.length > 0)
    .map(t => {
      if (t.startsWith("ال") && t.length > 3) return t.substring(2);
      return t;
    });
}

// فحص مطابقة الاستعلام لأي نص بدلالة الكلمات (Token Matching) بذكاء ودون مطابقات زائفة
export function tokensMatch(targetText, query) {
  if (!targetText || !query) return false;
  const normTarget = normalizeArabic(targetText);
  const normQuery = normalizeArabic(query);
  if (normTarget.includes(normQuery)) return true;

  const qTokens = getSearchTokens(query).filter(t => t.length >= 2);
  if (qTokens.length === 0) return false;
  const tTokens = getSearchTokens(targetText);

  // الكلمات الشائعة التي لا يُكتفى بها وحدها إذا كان في الاستعلام كلمات نوعية
  const commonWords = new Set(["من", "في", "على", "عن", "الى", "الي", "ال", "ابن", "بن", "ابي", "ابو"]);
  const informativeQTokens = qTokens.filter(t => !commonWords.has(t));
  const tokensToCheck = informativeQTokens.length > 0 ? informativeQTokens : qTokens;

  return tokensToCheck.every(qt => {
    return tTokens.some(tt => {
      if (tt === qt) return true;
      if (qt.length >= 3 && tt.startsWith(qt)) return true;
      if (qt.length >= 4 && tt.includes(qt)) return true;
      return false;
    });
  });
}

// تحويل رقم القرن الهجري إلى نص عربي فخم
export function formatCentury(centuryNum) {
  const centuries = {
    1: "القرن الأول الهجري (عصر الصحابة وكبار التابعين)",
    2: "القرن الثاني الهجري (عصر أئمة المذاهب والتدوين الأول)",
    3: "القرن الثالث الهجري (العصر الذهبي لتدوين السنة والكتب الستة)",
    4: "القرن الرابع الهجري (عصر ازدهار الحواضر والموسوعات)",
    5: "القرن الخامس الهجري (عصر المدارس النظامية وأصول الفقه)",
    6: "القرن السادس الهجري (عصر السمعاني والأنساب الكبرى)",
    7: "القرن السابع الهجري (عصر ياقوت الحموي ومعجم البلدان)",
    8: "القرن الثامن الهجري (عصر شيوخ الإسلام وفتح الباري)"
  };
  return centuries[centuryNum] || `القرن ${centuryNum} الهجري`;
}

// مطابقة بحث ذكية تعيد درجة التطابق
export function matchSearch(target, query) {
  if (!target || !query) return 0;
  
  const normTarget = normalizeArabic(target);
  const normQuery = normalizeArabic(query);
  
  if (normTarget === normQuery) return 100; // تطابق تام
  if (normTarget.startsWith(normQuery)) return 90; // يبدأ به
  if (normTarget.includes(normQuery)) return 75; // يحتوي عليه
  
  // تجربة مقارنة الجذوع الخالية من أل التعريف والنسب
  const stemTarget = extractArabicStem(target);
  const stemQuery = extractArabicStem(query);
  
  if (stemTarget === stemQuery) return 85;
  if (stemTarget.includes(stemQuery)) return 60;
  
  return 0;
}
