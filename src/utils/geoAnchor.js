/**
 * محرك التحديد المكاني والربط الجغرافي الذكي لمواد الموسوعة (16,800 مادة)
 * يتيح عرض أي موضع أو قرية أو جبل أو بئر أو نسبة على الخريطة التفاعلية:
 * 1. المطابقة المباشرة (Direct Match) مع الحواضر الـ 625 المنزلة.
 * 2. الربط بالحاضرة أو الكورة الأم (Parent Metropolis Anchor).
 * 3. الربط بالإقليم الجغرافي التاريخي (Regional Anchor).
 */
import { places } from '../data/places.js';
import { palestinePlaces } from '../data/palestineGeography.js';
import { normalizeArabic, extractArabicStem } from './arabic.js';

let directMap = null;
let placeList = null;

// الأقاليم الجغرافية التراثية ومراكزها
const REGIONS_REGISTRY = [
  {
    id: "hijaz",
    name: "الحِجَاز",
    center: [24.4672, 39.6111],
    zoom: 7,
    keywords: ["الحجاز", "مكة", "المدينة", "يثرب", "ينبع", "بدر", "تهامة", "وادي القرى", "خيبر", "الطائف"]
  },
  {
    id: "najd",
    name: "نَجْد واليَمَامَة",
    center: [24.6877, 46.7219],
    zoom: 7,
    keywords: ["نجد", "اليمامة", "حجر اليمامة", "الوشم", "سدير", "القصيم", "العارض", "حائل", "جبل شمر", "الدهناء", "الصمان"]
  },
  {
    id: "yemen",
    name: "اليَمَن وحَضْرَمَوْت",
    center: [15.3547, 44.2067],
    zoom: 7,
    keywords: ["اليمن", "صنعاء", "زبيد", "عدن", "حضرموت", "تعز", "صعدة", "مأرب", "ظفار", "الشحر", "نجران", "حمير", "كندة"]
  },
  {
    id: "iraq",
    name: "سَوَاد العِرَاق",
    center: [33.3152, 44.3661],
    zoom: 7,
    keywords: ["العراق", "السواد", "بغداد", "الكوفة", "البصرة", "واسط", "سامراء", "المدائن", "الحيرة", "الأنبار", "دجيل", "نهر عيسى", "النهروان"]
  },
  {
    id: "jazira",
    name: "الجَزِيرَة الفُرَاتِيَّة",
    center: [36.5000, 40.5000],
    zoom: 7,
    keywords: ["الجزيرة", "الموصل", "ديار ربيعة", "ديار مضر", "ديار بكر", "الرقة", "حران", "رأس العين", "نصيبين", "سنجار", "الخابور"]
  },
  {
    id: "sham",
    name: "بِلَاد الشَّام",
    center: [33.5138, 36.2765],
    zoom: 7,
    keywords: ["الشام", "دمشق", "حلب", "حمص", "حماة", "الغوطة", "حوران", "اليرموك", "البلقاء", "الأردن", "جند دمشق", "جند قنسرين"]
  },
  {
    id: "palestine",
    name: "فِلَسْطِين",
    center: [31.7683, 35.2137],
    zoom: 8,
    keywords: ["فلسطين", "القدس", "بيت المقدس", "الرملة", "غزة", "عسقلان", "يافا", "نابلس", "الخليل", "أريحا", "طبرية", "بيسان", "عكا"]
  },
  {
    id: "egypt",
    name: "مِصْر وحَوْض النِّيل",
    center: [30.0444, 31.2357],
    zoom: 7,
    keywords: ["مصر", "الفسطاط", "القاهرة", "الإسكندرية", "الصعيد", "الفيوم", "دمياط", "رشيد", "قوص", "أسوان", "الدلتا"]
  },
  {
    id: "maghreb",
    name: "المَغْرِب وإِفْرِيقِيَّة",
    center: [35.6781, 10.0963],
    zoom: 6,
    keywords: ["إفريقية", "المغرب", "القيروان", "تونس", "فاس", "مراكش", "تلمسان", "سبتة", "طنجة", "بجاية", "المهدية", "سوس", "سجلماسة"]
  },
  {
    id: "andalus",
    name: "الأَنْدَلُس",
    center: [37.8882, -4.7794],
    zoom: 7,
    keywords: ["الأندلس", "قرطبة", "إشبيلية", "غرناطة", "طليطلة", "بلنسية", "سرقسطة", "مالقة", "الجزيرة الخضراء", "جيان", "المرية", "بطليوس"]
  },
  {
    id: "khorasan",
    name: "خُرَاسَان",
    center: [36.2133, 58.7958],
    zoom: 7,
    keywords: ["خراسان", "نيسابور", "مرو", "هراة", "بلخ", "طوس", "سرخس", "بيهق", "مرو الروذ", "بادغيس", "بوشنج", "الطبسين"]
  },
  {
    id: "transoxiana",
    name: "بِلَاد مَا وَرَاء النَّهْر والصُّغْد",
    center: [39.6542, 66.9597],
    zoom: 7,
    keywords: ["ما وراء النهر", "الصغد", "سمرقند", "بخارى", "فرغانة", "الشاش", "أشروسنة", "ترمذ", "خوارزم", "كش", "نسف"]
  },
  {
    id: "jibal_fars",
    name: "إِقْلِيم الجِبَال وفَارِس",
    center: [32.6546, 51.6680],
    zoom: 7,
    keywords: ["الجبال", "أصبهان", "الري", "همدان", "قزوين", "قم", "فارس", "شيراز", "إصطخر", "سيراف", "كرمان", "الأهواز", "خوزستان"]
  },
  {
    id: "rum_anatolia",
    name: "بِلَاد الرُّوم (الأَنَاضُول)",
    center: [39.0000, 35.0000],
    zoom: 6,
    keywords: ["الروم", "الأناضول", "قونية", "سيواس", "قاليقلا", "طرسوس", "المصيصة", "ملطية", "خلاط", "أرضروم", "أنطاكية"]
  },
  {
    id: "sind_hind",
    name: "بِلَاد السِّنْد والهِنْد",
    center: [25.0000, 68.0000],
    zoom: 6,
    keywords: ["السند", "الهند", "المنصورة", "الديبل", "الملتان", "لاهور", "مهران", "كشمير", "كابل"]
  },
  {
    id: "sudan_sahel",
    name: "بلاد السُّوْدَان والصَّحْرَاء والغَرْب الإِفْرِيقِيّ",
    center: [15.0000, -2.0000],
    zoom: 5,
    keywords: ["السودان", "غانة", "تكرور", "مالي", "تمبكتو", "جني", "كوكو", "غاو", "كانم", "كانو", "أودغشت", "ولاتة", "تدمكة", "الهوسا", "صنهاجة", "سنغاي"]
  },
  {
    id: "horn_swahili",
    name: "بِلَادُ الزَّنْجِ وَالقَرْنِ الإِفْرِيقِيّ وَالنُّوْبَة",
    center: [6.0000, 42.0000],
    zoom: 5,
    keywords: ["الزنج", "الحبشة", "النوبة", "دنقلة", "سوبا", "سواكن", "مقديشو", "زيلع", "هرر", "كلوة", "زنجبار", "ممباسا", "صوفالة", "باضع", "علوة", "سنار", "براوة"]
  }
];

function initLookup() {
  if (directMap) return;
  directMap = new Map();
  placeList = [];

  for (const p of places) {
    const matchObj = { place: p, type: 'direct' };
    if (p.name) directMap.set(normalizeArabic(p.name), matchObj);
    if (p.nisba) directMap.set(normalizeArabic(p.nisba), matchObj);
    if (p.otherSpellings) {
      for (const sp of p.otherSpellings) {
        directMap.set(normalizeArabic(sp), matchObj);
      }
    }
    const stemName = extractArabicStem(p.name);
    if (stemName && !directMap.has(stemName)) directMap.set(stemName, matchObj);
    if (p.nisba) {
      const stemNisba = extractArabicStem(p.nisba);
      if (stemNisba && !directMap.has(stemNisba)) directMap.set(stemNisba, matchObj);
    }

    // إضافة إلى قائمة الفحص النصي
    if (p.name && p.name.length >= 3) {
      placeList.push({
        place: p,
        normName: normalizeArabic(p.name),
        stemName: extractArabicStem(p.name)
      });
    }
  }

  for (const pal of palestinePlaces) {
    const matchObj = { place: pal, type: 'palestine' };
    if (pal.name) directMap.set(normalizeArabic(pal.name), matchObj);
  }
}

/**
 * دالة الاستكشاف والتحديد المكاني الشاملة
 * @param {string} rawTitle عنوان المادة (البلد أو النسبة)
 * @param {string} [rawText] نص المادة في المعجم أو الأنساب
 * @returns {object|null}
 */
export function resolveGeoLocation(rawTitle, rawText = '') {
  if (!rawTitle) return null;
  initLookup();

  const cleanTitle = rawTitle.trim()
    .replace(/^[\s\(\)\[\]"«»\d\-\.\/:]+/g, '')
    .replace(/[\s\(\)\[\]"«»\d\-\.\/:]+$/g, '');
  const normTitle = normalizeArabic(cleanTitle);

  // 1. المطابقة المباشرة مع موضع من الـ 600 أو فلسطين
  if (directMap.has(normTitle)) {
    const match = directMap.get(normTitle);
    return {
      type: match.type,
      place: match.place,
      isDirect: true,
      label: `📍 عرض «${match.place.name}» على الخريطة`,
      description: `حاضرة أو موضع محقق بالإحداثيات المباشرة`
    };
  }

  const stemT = extractArabicStem(cleanTitle);
  if (stemT && directMap.has(stemT)) {
    const match = directMap.get(stemT);
    return {
      type: match.type,
      place: match.place,
      isDirect: true,
      label: `📍 عرض «${match.place.name}» على الخريطة`,
      description: `مطابقة لجذر النسبة مع الحاضرة المحققة`
    };
  }

  // 2. فحص العنوان المركب إذا كان يتضمن اسم حاضرة أم (مثل: "غوطة دمشق"، "وادي مكة"، "قنطرة قرطبة")
  for (const pl of placeList) {
    if (normTitle.includes(pl.normName) && pl.normName.length >= 4) {
      return {
        type: 'parent_city',
        place: pl.place,
        isDirect: false,
        parentName: pl.place.name,
        label: `📍 عرض على الخريطة (أعمال ${pl.place.name})`,
        description: `موضع أو معلم يقع ضمن حوزة وكورة ${pl.place.name}`
      };
    }
  }

  // 3. تحليل النص الأصلي لياقوت أو السمعاني لاستخراج الحاضرة الأم (Parent Metropolis)
  if (rawText && rawText.length > 5) {
    const sampleText = normalizeArabic(rawText.slice(0, 450));

    // أ) البحث عن صيغ التبعية للحواضر الكبرى (قرية بـ ، من أعمال ، كورة ، قرب ، بين)
    for (const pl of placeList) {
      const pn = pl.normName;
      if (
        sampleText.includes(`ب${pn}`) ||
        sampleText.includes(`من ${pn}`) ||
        sampleText.includes(`قرب ${pn}`) ||
        sampleText.includes(`اعمال ${pn}`) ||
        sampleText.includes(`نواحي ${pn}`) ||
        sampleText.includes(`كورة ${pn}`) ||
        sampleText.includes(`مدينة ${pn}`) ||
        sampleText.includes(`طريق ${pn}`) ||
        sampleText.includes(`بين ${pn}`)
      ) {
        return {
          type: 'parent_city',
          place: pl.place,
          isDirect: false,
          parentName: pl.place.name,
          label: `📍 عرض على الخريطة (نواحي ${pl.place.name})`,
          description: `موضع يتبع تاريخياً لكورة وأعمال ${pl.place.name} وفقاً للنص التراثي`
        };
      }
    }

    // ب) البحث عن الأقاليم التراثية الكبرى (Regional Anchor)
    for (const reg of REGIONS_REGISTRY) {
      for (const kw of reg.keywords) {
        const normKw = normalizeArabic(kw);
        if (sampleText.includes(normKw)) {
          return {
            type: 'regional_anchor',
            regionId: reg.id,
            regionName: reg.name,
            center: reg.center,
            zoom: reg.zoom,
            isDirect: false,
            place: {
              id: `anchor_${reg.id}`,
              name: cleanTitle,
              vocalized: cleanTitle,
              lat: reg.center[0],
              lng: reg.center[1],
              modernName: `نطاق ${reg.name} التاريخي`,
              modernCountry: reg.name,
              nisba: cleanTitle,
              importance: `موضع تاريخي يقع في إقليم ${reg.name}`
            },
            label: `📍 عرض على الخريطة (إقليم ${reg.name})`,
            description: `موضع أو معلم تاريخي في نطاق ${reg.name} العريض`
          };
        }
      }
    }
  }

  // 4. إذا لم يُذكر نص أو تعذر الفحص، محاولة تخمين الإقليم من العنوان
  for (const reg of REGIONS_REGISTRY) {
    for (const kw of reg.keywords) {
      const normKw = normalizeArabic(kw);
      if (normTitle.includes(normKw)) {
        return {
          type: 'regional_anchor',
          regionId: reg.id,
          regionName: reg.name,
          center: reg.center,
          zoom: reg.zoom,
          isDirect: false,
          place: {
            id: `anchor_${reg.id}`,
            name: cleanTitle,
            vocalized: cleanTitle,
            lat: reg.center[0],
            lng: reg.center[1],
            modernName: `نطاق ${reg.name} التاريخي`,
            modernCountry: reg.name,
            nisba: cleanTitle,
            importance: `موضع تراثي يقع في إقليم ${reg.name}`
          },
          label: `📍 عرض على الخريطة (إقليم ${reg.name})`,
          description: `موضع تاريخي في نطاق ${reg.name}`
        };
      }
    }
  }

  return null;
}
