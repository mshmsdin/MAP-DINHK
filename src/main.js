/**
 * نقطة الانطلاق الرئيسية لتطبيق معجم الأنساب والبلدان
 * يدعم الأنساب المكانية وغير المكانية، حاسبة المسالك، أطلس الأقاليم، وتحدي الأنساب
 */
import './styles/main.css';
import { createHeader } from './components/header.js';
import { createMapView } from './components/mapView.js';
import { createDrawer } from './components/drawer.js';
import { createTimeline } from './components/timeline.js';
import { createModals } from './components/modal.js';
import { createDistanceCalculator } from './components/distanceCalculator.js';
import { createRegionsExplorer } from './components/regionsExplorer.js';
import { createQuizModal } from './components/quizModal.js';
import { createGuideModal } from './components/guideModal.js';
import { places } from './data/places.js';
import { initAudioSpeech } from './utils/audioSpeech.js';
import { initCorpusModal, openCorpusEntry } from './components/corpusModal.js';

// وضع التضمين (?embed=1): تعرضه «بوابة السنة» (din.hk/sunna) داخل لوحة في صفحاتها، فتُخفى الترويسة وشريط
// القرون ويُعرض الموضع أو المادة وحدهما. ورابط المادة المباشر ?entry=<المعرّف> يفتح أي مادة من الكتب الخمسة
// (s_711 = «الترمذي» في أنساب السمعاني، y_2358 = «ترمذ» في معجم البلدان).
const urlParams = new URLSearchParams(window.location.search);
const IS_EMBED = urlParams.has('embed');
if (IS_EMBED) document.documentElement.classList.add('embed-mode');
import { initCorpusExplorer, openCorpusExplorer } from './components/corpusExplorer.js';
import { loadMasterCorpusIndex } from './utils/corpusSearch.js';
import { 
  updatePlaceSEO, 
  resetDefaultSEO, 
  setPlaceURL, 
  clearPlaceURL, 
  getInitialPlaceId 
} from './utils/seoRouting.js';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');

  // تهيئة أصوات النطق التراثي
  initAudioSpeech();

  let currentSelectedPlace = null;

  // 1. إنشاء النوافذ المنبثقة الأساسية (الإحصائيات والبطاقات)
  const modals = createModals();
  document.body.appendChild(modals.element);

  // 2. إنشاء نافذة دليل ميزات المنصة وسجل التحديثات
  const guideModal = createGuideModal();
  document.body.appendChild(guideModal.element);

  // 2. إنشاء حاسبة المسالك والفراسخ
  const distanceCalc = createDistanceCalculator({
    onDrawRoute: (placeA, placeB) => {
      mapView.drawHistoricalRoute(placeA, placeB);
    }
  });
  document.body.appendChild(distanceCalc.element);

  // 3. إنشاء مستكشف الأقاليم الإسلامية الكبرى
  const regionsExplorer = createRegionsExplorer({
    onSelectRegion: (region) => {
      mapView.filterByRegion(region);
    },
    onShowAll: () => {
      mapView.renderMarkers();
    }
  });
  document.body.appendChild(regionsExplorer.element);

  // 4. إنشاء مسابقة وتحدي الأنساب والبلدان
  const quizModal = createQuizModal({
    onFlyToPlace: (place) => {
      currentSelectedPlace = place;
      mapView.flyToPlace(place, 8);
      drawer.openPlace(place);
    }
  });
  document.body.appendChild(quizModal.element);

  // 5. إنشاء الدرج الجانبي
  const drawer = createDrawer({
    onClose: () => {
      mapView.clearRihlaRoute();
      clearPlaceURL();
    },
    onDrawRihla: (scholar) => {
      mapView.drawRihlaRoute(scholar);
    },
    onGenerateCard: (scholar, place) => {
      modals.showScholarCard(scholar, place);
    },
    onFlyToPlace: (place) => {
      handleSelectPlace(place);
    }
  });

  // 6. إنشاء شريط الزمن الهجري
  const timeline = createTimeline({
    onCenturyChange: (century) => {
      mapView.renderMarkers(century);
    }
  });

  // 7. دالة التمركز المشتركة حول أي حاضرة أو موضع تاريخي مع تحديث الـ SEO والرابط البرمجي
  const handleSelectPlace = (place, updateUrl = true) => {
    currentSelectedPlace = place;
    mapView.flyToPlace(place, 8);
    drawer.openPlace(place);
    if (updateUrl) {
      setPlaceURL(place.id, true);
    }
    updatePlaceSEO(place);
  };

  // تهيئة قارئ ومستكشف الموسوعة التراثية الشاملة لكتابي معجم البلدان والأنساب (100%)
  initCorpusModal({ onSelectPlace: handleSelectPlace });
  initCorpusExplorer({ onSelectPlace: handleSelectPlace });
  loadMasterCorpusIndex(); // تحميل مسبق في الخلفية

  // 7. إنشاء الخريطة التفاعلية
  const mapView = createMapView({
    onSelectPlace: handleSelectPlace,
    onSelectScholar: (scholar) => {
      if (scholar.placeId) {
        const place = places.find((p) => p.id === scholar.placeId);
        if (place) {
          handleSelectPlace(place);
        }
      }
    }
  });

  // 8. إنشاء الهيدر وشريط البحث مع الميزات الجديدة
  const header = createHeader({
    onSelectPlace: (place) => {
      handleSelectPlace(place);
    },
    onSelectScholar: (scholar) => {
      if (scholar.placeId) {
        const place = places.find((p) => p.id === scholar.placeId);
        if (place) {
          handleSelectPlace(place);
        }
      }
    },
    onSelectNonGeoNisba: (nonGeoItem) => {
      drawer.openNonGeoNisba(nonGeoItem);
    },
    onOpenCalc: () => {
      distanceCalc.show();
    },
    onOpenRegions: () => {
      regionsExplorer.show();
    },
    onOpenQuiz: () => {
      quizModal.show();
    },
    onOpenGuide: () => {
      guideModal.show();
    },
    onOpenStats: () => {
      modals.showStats();
    },
    onResetMap: () => {
      mapView.resetView();
      drawer.close();
      timeline.reset();
      clearPlaceURL();
    }
  });

  // تركيب المكونات في شجرة DOM
  if (!IS_EMBED) appRoot.appendChild(header.element);
  appRoot.appendChild(mapView.element);
  appRoot.appendChild(drawer.element);
  if (!IS_EMBED) appRoot.appendChild(timeline.element);

  // تهيئة خريطة Leaflet بعد التركيب
  mapView.init();

  // فحص والتعامل مع أزرار الرجوع والتقدم في المتصفح (History API & Deep Linking)
  window.addEventListener('popstate', () => {
    const pId = getInitialPlaceId();
    if (pId) {
      const p = places.find((x) => x.id.toLowerCase() === pId.toLowerCase());
      if (p) {
        handleSelectPlace(p, false);
      }
    } else {
      drawer.close();
      clearPlaceURL();
      mapView.resetView();
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '';
    if (hash === '#corpus') openCorpusExplorer();
    else if (hash === '#regions') regionsExplorer.show();
    else if (hash === '#calculator') distanceCalc.show();
    else if (hash === '#quiz') quizModal.show();
    else if (hash === '#guide' || hash === '#f1') guideModal.show();
    else if (hash === '#stats') modals.showStats();
    else {
      const pId = getInitialPlaceId();
      if (pId) {
        const p = places.find((x) => x.id.toLowerCase() === pId.toLowerCase());
        if (p) handleSelectPlace(p, false);
      }
    }
  });

  // رابط المادة المباشر (?entry=s_711): تُفتح المادة بنصها الكامل، ومنها زر «عرض على الخريطة».
  const initialEntryId = urlParams.get('entry');
  if (initialEntryId && /^[ysblm]_\d+$/.test(initialEntryId)) {
    loadMasterCorpusIndex().then((index) => {
      const item = (index || []).find((e) => e.id === initialEntryId);
      if (item) openCorpusEntry(item.id, item.b, item.l);
    });
  }

  // فحص الرابط البرمجي المباشر للموضع عند بداية التحميل (Deep Linking & SEO)
  const initialPlaceId = getInitialPlaceId();
  if (initialPlaceId) {
    const targetPlace = places.find((p) => p.id.toLowerCase() === initialPlaceId.toLowerCase());
    if (targetPlace) {
      setTimeout(() => {
        handleSelectPlace(targetPlace, false);
      }, 400);
    }
  } else {
    // فحص وسوم الأقسام الأخرى
    const hash = window.location.hash || '';
    if (hash === '#corpus') setTimeout(() => openCorpusExplorer(), 300);
    else if (hash === '#regions') setTimeout(() => regionsExplorer.show(), 300);
    else if (hash === '#calculator') setTimeout(() => distanceCalc.show(), 300);
    else if (hash === '#quiz') setTimeout(() => quizModal.show(), 300);
    else if (hash === '#guide' || hash === '#f1' || window.location.pathname.endsWith('/f1')) setTimeout(() => guideModal.show(), 300);
    else if (hash === '#stats') setTimeout(() => modals.showStats(), 300);
  }

  console.log("موسوعة أسماء البلدان والكنى القديمة تعمل بنجاح مع التوجيه البرمجي الكامل والـ SEO.");
});
