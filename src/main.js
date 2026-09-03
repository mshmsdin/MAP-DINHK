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
import { initCorpusModal } from './components/corpusModal.js';
import { initCorpusExplorer } from './components/corpusExplorer.js';
import { loadMasterCorpusIndex } from './utils/corpusSearch.js';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');

  // تهيئة أصوات النطق التراثي
  initAudioSpeech();

  // تهيئة قارئ ومستكشف الموسوعة التراثية الشاملة لكتابي معجم البلدان والأنساب (100%)
  initCorpusModal();
  initCorpusExplorer();
  loadMasterCorpusIndex(); // تحميل مسبق في الخلفية

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
    },
    onDrawRihla: (scholar) => {
      mapView.drawRihlaRoute(scholar);
    },
    onGenerateCard: (scholar, place) => {
      modals.showScholarCard(scholar, place);
    },
    onFlyToPlace: (place) => {
      currentSelectedPlace = place;
      mapView.flyToPlace(place, 8);
    }
  });

  // 6. إنشاء شريط الزمن الهجري
  const timeline = createTimeline({
    onCenturyChange: (century) => {
      mapView.renderMarkers(century);
    }
  });

  // 7. إنشاء الخريطة التفاعلية
  const mapView = createMapView({
    onSelectPlace: (place) => {
      currentSelectedPlace = place;
      mapView.flyToPlace(place, 8);
      drawer.openPlace(place);
    },
    onSelectScholar: (scholar) => {
      if (scholar.placeId) {
        const place = places.find((p) => p.id === scholar.placeId);
        if (place) {
          currentSelectedPlace = place;
          mapView.flyToPlace(place, 8);
          drawer.openPlace(place);
        }
      }
    }
  });

  // 8. إنشاء الهيدر وشريط البحث مع الميزات الجديدة
  const header = createHeader({
    onSelectPlace: (place) => {
      currentSelectedPlace = place;
      mapView.flyToPlace(place, 8);
      drawer.openPlace(place);
    },
    onSelectScholar: (scholar) => {
      if (scholar.placeId) {
        const place = places.find((p) => p.id === scholar.placeId);
        if (place) {
          currentSelectedPlace = place;
          mapView.flyToPlace(place, 8);
          drawer.openPlace(place);
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
    }
  });

  // تركيب المكونات في شجرة DOM
  appRoot.appendChild(header.element);
  appRoot.appendChild(mapView.element);
  appRoot.appendChild(drawer.element);
  appRoot.appendChild(timeline.element);

  // تهيئة خريطة Leaflet بعد التركيب
  mapView.init();

  console.log("منصة معجم الأنساب والبلدان تعمل بنجاح مع حاسبة المسالك وأطلس الأقاليم والمسابقات.");
});
