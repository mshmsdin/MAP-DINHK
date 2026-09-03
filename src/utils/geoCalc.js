/**
 * حساب المسافات الجغرافية والمسالك التراثية (الفراسخ والمراحل وأيام السير)
 * معايير القياس التراثية عند الجغرافيين والفقهاء (ياقوت، ابن حوقل، السمعاني):
 * - الميل الشرعي: ~ 1.92 كم
 * - الفرسخ: 3 أميال شرعية ≈ 5.76 كم
 * - البريد: 4 فراسخ ≈ 23 كم
 * - المرحلة (مسيرة يوم معتدل للقوافل): 7 إلى 8 فراسخ ≈ 42 كم
 */

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // المسافة بالكيلومتر
}

export function convertToHistoricalDistances(km) {
  const farsakh = km / 5.76; // الفرسخ
  const marhalah = km / 42;  // المرحلة (مسيرة يوم قافلة)
  const barid = km / 23;     // البريد

  // تقدير أيام السير:
  // - قوافل الجمال المحملة: 35-40 كم/يوم
  // - سير المشاة في طلب الحديث: 30-35 كم/يوم
  // - البريد السريع بالخيل: 70-90 كم/يوم
  const caravanDays = Math.max(1, Math.round(km / 38));
  const walkingDays = Math.max(1, Math.round(km / 30));
  const expressHorseDays = Math.max(1, Math.round(km / 80));

  return {
    km: Math.round(km),
    farsakh: Math.round(farsakh),
    marhalah: Number(marhalah.toFixed(1)),
    barid: Number(barid.toFixed(1)),
    caravanDays,
    walkingDays,
    expressHorseDays
  };
}
