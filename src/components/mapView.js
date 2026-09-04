/**
 * مدير الخريطة التفاعلية وعرض البلدان والعلماء ومسارات الرحلات
 * يدعم الوضع النهاري (الأساسي) والوضع الفضائي والداكن
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';
import { setupPronunciationButtons } from '../utils/audioSpeech.js';
import { palestinePlaces } from '../data/palestineGeography.js';

// تهيئة ملحق النصوص العربية لربط الحروف من اليمين إلى اليسار في خريطة المتجهات
if (maplibregl && typeof maplibregl.getRTLTextPluginStatus === 'function' && maplibregl.getRTLTextPluginStatus() === 'unavailable') {
  try {
    maplibregl.setRTLTextPlugin(
      'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
      null,
      true
    );
  } catch (e) {
    console.warn('MapLibre RTL plugin error:', e);
  }
}

export function createMapView({ onSelectPlace, onSelectScholar }) {
  const container = document.createElement('div');
  container.id = 'map-container';

  // أزرار التحكم العائمة بالخريطة
  const floatingControls = document.createElement('div');
  floatingControls.className = 'map-floating-controls';
  floatingControls.innerHTML = `
    <button id="btn-toggle-tiles" class="floating-btn" title="تبديل نمط الخريطة (تضاريس نهارية / قمر صناعي / داكن)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    </button>
    <button id="btn-zoom-in" class="floating-btn" title="تقريب">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    <button id="btn-zoom-out" class="floating-btn" title="تبعيد">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  `;
  container.appendChild(floatingControls);

  let map;
  let markersLayer;
  let rihlaLayer;
  let palestineLayer;
  let isPalestineLayerActive = true;
  let currentTileLayer;
  let currentTileMode = 'arabic'; // 'arabic' (Vector tiles: 100% Arabic, 0 Hebrew), 'satellite', 'natgeo', 'dark'

  // خريطة الأساس الأصلية باللغة العربية (المتجهات بدلاً من التايلز التي تحتوي عبرية)
  const satTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const natGeoTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}';
  const darkBaseUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  const arabicStyleUrl = (import.meta.env.BASE_URL || '/map/').replace(/\/$/, '') + '/arabic-map-style.json';

  function createArabicVectorLayer() {
    try {
      return L.maplibreGL({
        style: arabicStyleUrl,
        interactive: false,
        pane: 'tilePane'
      });
    } catch (e) {
      console.warn('Vector layer initialization fallback:', e);
      return L.tileLayer(natGeoTileUrl, { maxZoom: 16 });
    }
  }

  function getPopupTopPadding() {
    const header = document.querySelector('.main-header');
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    return Math.max(24, Math.ceil(headerBottom + 20));
  }

  function initMap() {
    // التمركز في قلب العالم الإسلامي التاريخي
    map = L.map(container, {
      center: [30.0, 42.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // الخريطة المتجهة المعربة كلياً هي الطبقة الأساسية
    currentTileLayer = createArabicVectorLayer().addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    rihlaLayer = L.layerGroup().addTo(map);
    palestineLayer = L.layerGroup().addTo(map);

    renderMarkers();
    renderPalestineLabels();
    updateMarkerLabels();

    map.on('zoomend', () => {
      updateMarkerLabels();
      renderPalestineLabels();
    });

    map.on('moveend', () => {
      renderPalestineLabels();
    });

    // أزرار التحكم
    floatingControls.querySelector('#btn-zoom-in').addEventListener('click', () => map.zoomIn());
    floatingControls.querySelector('#btn-zoom-out').addEventListener('click', () => map.zoomOut());

    floatingControls.querySelector('#btn-toggle-tiles').addEventListener('click', () => {
      map.removeLayer(currentTileLayer);
      if (currentTileMode === 'arabic') {
        currentTileMode = 'satellite';
        currentTileLayer = L.tileLayer(satTileUrl, { maxZoom: 18 }).addTo(map);
      } else if (currentTileMode === 'satellite') {
        currentTileMode = 'natgeo';
        currentTileLayer = L.tileLayer(natGeoTileUrl, { maxZoom: 16 }).addTo(map);
      } else if (currentTileMode === 'natgeo') {
        currentTileMode = 'dark';
        currentTileLayer = L.tileLayer(darkBaseUrl, { maxZoom: 16 }).addTo(map);
      } else {
        currentTileMode = 'arabic';
        currentTileLayer = createArabicVectorLayer().addTo(map);
      }
    });
  }

  function getPalestineItemPriority(item) {
    if (item.type === 'capital') return 100;
    if (item.type === 'city_major') return 80;
    if (item.type === 'city_historic') return 60;
    if (item.type === 'city') return 40;
    if (item.type === 'port_historic' || item.type === 'town') return 25;
    return 10;
  }

  function renderPalestineLabels() {
    if (!map || !palestineLayer || !isPalestineLayerActive) return;
    palestineLayer.clearLayers();

    const zoom = map.getZoom();

    // 1. تصفية الأماكن المسموح بظهورها عند هذا الزوم وترتيبها حسب الأولوية التراثية
    const eligiblePlaces = palestinePlaces
      .filter((item) => zoom >= item.minZoom)
      .sort((a, b) => getPalestineItemPriority(b) - getPalestineItemPriority(a));

    const placedBoxes = [];

    eligiblePlaces.forEach((item) => {
      const isCapital = item.type === 'capital';
      const isLandmark = ['water', 'mountain', 'valley', 'river'].includes(item.type);

      // تحويل الإحداثيات الجغرافية إلى إحداثيات الشاشة بالبكسل لكشف ومنع أي تصادم
      const pt = map.latLngToContainerPoint([item.lat, item.lng]);

      const boxWidth = isCapital ? 125 : (isLandmark ? 100 : 92);
      const boxHeight = isCapital ? 30 : 25;

      const candidateBox = {
        left: pt.x - boxWidth / 2,
        right: pt.x + boxWidth / 2,
        top: pt.y - boxHeight / 2,
        bottom: pt.y + boxHeight / 2
      };

      // فحص التصادم مع الشارات السابقة التي تم قبولها (هامش أمان 10 بكسل أفقياً، 6 بكسل رأسياً)
      const hasCollision = placedBoxes.some((b) => {
        return !(
          candidateBox.right + 10 < b.left ||
          candidateBox.left - 10 > b.right ||
          candidateBox.bottom + 6 < b.top ||
          candidateBox.top - 6 > b.bottom
        );
      });

      // منع التداخل: إذا حدث تصادم، نستبعد هذا البادج فوراً لحماية نقاء الخريطة
      if (hasCollision && !isCapital) return;

      placedBoxes.push(candidateBox);

      // البحث عن الحاضرة المقابلة في قاعدة بيانات الحواضر والعلماء
      const matchingPlace = places.find(p => 
        p.name === item.name ||
        (p.otherSpellings && p.otherSpellings.some(sp => sp === item.name || item.name.includes(sp)))
      );

      const placeScholars = matchingPlace ? scholars.filter(s => s.placeId === matchingPlace.id) : [];

      let iconHtml;
      let iconSize = [95, 26];
      let iconAnchor = [47, 13];

      if (isLandmark) {
        iconHtml = `
          <div class="palestine-landmark-badge" title="${item.desc}">
            <span>📍</span>
            <span>${item.name}</span>
          </div>
        `;
        iconSize = [100, 24];
        iconAnchor = [50, 12];
      } else {
        iconHtml = `
          <div class="palestine-city-badge ${isCapital ? 'capital' : ''}" title="${item.desc}">
            <div class="palestine-city-dot ${isCapital ? 'capital' : ''}"></div>
            <span class="palestine-city-name">${item.name}</span>
            ${placeScholars.length > 0 ? `<span class="palestine-scholar-chip" title="${placeScholars.length} من كبار الأعلام">${placeScholars.length}</span>` : ''}
          </div>
        `;
        iconSize = isCapital ? [125, 28] : [100, 24];
        iconAnchor = [isCapital ? 62 : 50, 12];
      }

      const icon = L.divIcon({
        className: 'palestine-map-label-wrapper',
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: iconAnchor
      });

      const marker = L.marker([item.lat, item.lng], {
        icon,
        zIndexOffset: isCapital ? 900 : (150 + getPalestineItemPriority(item) * 5)
      });

      const popupHtml = `
        <div class="popup-card" style="min-width: 250px;">
          <div class="popup-header" style="border-bottom: 2px solid #16a34a; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-family: var(--font-title); font-size: 1.15rem; font-weight: 900; color: #15803d;">${item.vocalized || item.name}</span>
              <span style="font-size: 0.72rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 2px 7px; border-radius: 6px; font-weight: 800;">فلسطين 🇵🇸</span>
            </div>
            <div style="font-size: 0.78rem; color: #b45309; font-weight: 700; margin-top: 4px;">
              ${item.subTitle || 'أرض الإسراء والمعراج والرباط'}
            </div>
          </div>
          <div style="font-size: 0.8rem; line-height: 1.6; color: #334155; margin: 10px 0;">
            ${item.desc}
          </div>
          ${matchingPlace ? `
            <button class="popup-action-btn" id="btn-open-pal-place-${matchingPlace.id}" style="background: #16a34a; color: #ffffff;">
              عرض التفاصيل ونصوص السمعاني وياقوت
            </button>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        minWidth: 250,
        closeButton: true,
        autoPan: true,
        offset: L.point(0, -6)
      });

      marker.on('popupopen', () => {
        if (matchingPlace) {
          const btn = document.getElementById(`btn-open-pal-place-${matchingPlace.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectPlace) onSelectPlace(matchingPlace);
              marker.closePopup();
            };
          }
        }
      });

      palestineLayer.addLayer(marker);
    });
  }

  function updateMarkerLabels() {
    if (!map) return;
    container.classList.toggle('show-marker-labels', map.getZoom() >= 7);
  }

  function renderMarkers(filteredCentury = null) {
    markersLayer.clearLayers();

    places.forEach((place) => {
      // حجب العلامات الدائرية لحواضر فلسطين أثناء تفعيل طبقة فلسطين العربية منعاً للازدحام والتداخل البصري
      if (isPalestineLayerActive && place.modernCountry === 'فلسطين') {
        return;
      }

      const placeScholars = scholars.filter((s) => s.placeId === place.id);
      
      if (filteredCentury !== null) {
        const centuryScholars = placeScholars.filter((s) => s.centuryAH === filteredCentury);
        if (centuryScholars.length === 0) return;
      }

      const scholarCount = placeScholars.length;

      // أيقونة العلامة النهارية الفاخرة
      const customIcon = L.divIcon({
        className: 'custom-city-marker',
        html: `
          <div class="marker-pulse"></div>
          <div class="marker-beacon">
            <span>${scholarCount}</span>
          </div>
          <div class="marker-label-box">
            <strong>${place.name}</strong>
            <span class="scholar-count">(${place.nisba})</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const scholarsPreview = placeScholars.slice(0, 4).map((s) => `
        <span class="popup-scholar-tag">${s.name}</span>
      `).join('');

      const popupHtml = `
        <div class="popup-card">
          <div class="popup-header">
            <div class="popup-title" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span>${place.vocalized || place.name}</span>
              <button class="mini-speak-btn" title="استمع للنطق التراثي" data-speak="${place.vocalized || place.name}، النسبة إليها: ${place.nisbaVocalized || place.nisba}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>
            </div>
            <div class="popup-nisba">النسبة إليها: <strong>${place.nisbaVocalized || place.nisba}</strong></div>
            <div class="popup-modern-geo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>الموقع المعاصر: <strong style="color: #b45309;">${place.modernName}</strong> (${place.modernCountry})</span>
            </div>
          </div>
          <div class="popup-scholars-preview">
            <div class="popup-scholars-title">أبرز علماء الحاضرة (${scholarCount}):</div>
            <div>${scholarsPreview}</div>
          </div>
          <button class="popup-action-btn" id="btn-open-place-${place.id}">
            عرض التفاصيل ونصوص السمعاني وياقوت
          </button>
        </div>
      `;

      // هامش أمان علوي كبير 220 بكسل حتى لا تتداخل النافذة إطلاقاً مع شريط الهيدر
      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        minWidth: 260,
        closeButton: true,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(40, getPopupTopPadding()),
        autoPanPaddingBottomRight: L.point(40, 100),
        offset: L.point(0, -10)
      });

      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement();
        if (popupEl) {
          setupPronunciationButtons(popupEl);
        }
        const btn = document.getElementById(`btn-open-place-${place.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectPlace(place);
            marker.closePopup();
          });
        }
      });

      // تحديث هامش البوب أب قبل فتحه حتى يبقى أسفل الهيدر في كل مقاس شاشة
      marker.on('preclick', () => {
        marker.getPopup().options.autoPanPaddingTopLeft = L.point(40, getPopupTopPadding());
      });

      markersLayer.addLayer(marker);
    });
  }

  function flyToPlace(place, zoomLevel = 8) {
    if (!map) return;
    // إضافة إزاحة مدروسة لجعل المدينة أسفل الهيدر مباشرة
    const latOffset = zoomLevel > 7 ? 0.6 : 1.5;
    map.flyTo([place.lat + latOffset, place.lng], zoomLevel, {
      duration: 1.6,
      easeLinearity: 0.25
    });
  }

  function drawRihlaRoute(scholar) {
    if (!map || !scholar.travelRoute || scholar.travelRoute.length < 2) return;
    
    rihlaLayer.clearLayers();

    const latlngs = [];
    const routePlaces = [];

    scholar.travelRoute.forEach((pId) => {
      const p = places.find((x) => x.id === pId);
      if (p) {
        latlngs.push([p.lat, p.lng]);
        routePlaces.push(p);
      }
    });

    if (latlngs.length < 2) return;

    const polyline = L.polyline(latlngs, {
      color: '#0284c7',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(rihlaLayer);

    routePlaces.forEach((p, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === routePlaces.length - 1;

      const stationIcon = L.divIcon({
        className: 'station-marker',
        html: `
          <div style="
            background: ${isStart ? '#15803d' : isEnd ? '#dc2626' : '#0284c7'};
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.72rem;
            font-weight: bold;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const stationMarker = L.marker([p.lat, p.lng], { icon: stationIcon });
      stationMarker.bindTooltip(`المحطة ${idx + 1}: ${p.name} (${p.modernCountry})`, {
        direction: 'top',
        className: 'station-tooltip'
      });
      rihlaLayer.addLayer(stationMarker);
    });

    map.fitBounds(polyline.getBounds(), { padding: [120, 120] });
  }

  function clearRihlaRoute() {
    if (rihlaLayer) rihlaLayer.clearLayers();
  }

  // رسم درب أو مسلك تاريخي بين حاضرتين
  function drawHistoricalRoute(placeA, placeB) {
    if (!map || !placeA || !placeB) return;
    rihlaLayer.clearLayers();

    const polyline = L.polyline([[placeA.lat, placeA.lng], [placeB.lat, placeB.lng]], {
      color: '#b45309',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(rihlaLayer);

    const markA = L.circleMarker([placeA.lat, placeA.lng], {
      radius: 9,
      fillColor: '#15803d',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).bindTooltip(`الانطلاق: ${placeA.name}`, { permanent: true, direction: 'top' });

    const markB = L.circleMarker([placeB.lat, placeB.lng], {
      radius: 9,
      fillColor: '#b45309',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).bindTooltip(`المقصد: ${placeB.name}`, { permanent: true, direction: 'top' });

    rihlaLayer.addLayer(markA);
    rihlaLayer.addLayer(markB);

    map.fitBounds(polyline.getBounds(), { padding: [160, 160] });
  }

  // تصفية الحواضر بحسب الإقليم التاريخي المحدد
  function filterByRegion(region) {
    if (!region) {
      renderMarkers();
      return;
    }

    markersLayer.clearLayers();
    const regionPlaces = places.filter((p) => p.regionId === region.id);

    regionPlaces.forEach((place) => {
      const placeScholars = scholars.filter((s) => s.placeId === place.id);
      const scholarCount = placeScholars.length;

      const customIcon = L.divIcon({
        className: 'custom-city-marker',
        html: `
          <div class="marker-pulse"></div>
          <div class="marker-beacon">
            <span>${scholarCount}</span>
          </div>
          <div class="marker-label-box">
            <strong>${place.name}</strong>
            <span class="scholar-count">(${place.nisba})</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const scholarsPreview = placeScholars.slice(0, 4).map((s) => `
        <span class="popup-scholar-tag">${s.name}</span>
      `).join('');

      const popupHtml = `
        <div class="popup-card">
          <div class="popup-header">
            <div class="popup-title">
              <span>${place.vocalized || place.name}</span>
            </div>
            <div class="popup-nisba">النسبة إليها: <strong>${place.nisbaVocalized || place.nisba}</strong></div>
            <div class="popup-modern-geo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>الموقع المعاصر: <strong>${place.modernName}</strong> (${place.modernCountry})</span>
            </div>
          </div>
          <div class="popup-scholars-preview">
            <div class="popup-scholars-title">أبرز علماء الحاضرة (${scholarCount}):</div>
            <div>${scholarsPreview}</div>
          </div>
          <button class="popup-action-btn" id="btn-open-place-${place.id}">
            عرض التفاصيل ونصوص السمعاني وياقوت
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        minWidth: 260,
        closeButton: true,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(40, getPopupTopPadding()),
        autoPanPaddingBottomRight: L.point(40, 100),
        offset: L.point(0, -10)
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-place-${place.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectPlace(place);
            marker.closePopup();
          });
        }
      });

      marker.on('preclick', () => {
        marker.getPopup().options.autoPanPaddingTopLeft = L.point(40, getPopupTopPadding());
      });

      markersLayer.addLayer(marker);
    });

    if (regionPlaces.length > 0) {
      const bounds = L.latLngBounds(regionPlaces.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [160, 160] });
    }
  }

  function resetView() {
    if (!map) return;
    clearRihlaRoute();
    map.flyTo([32.0, 48.0], 5, { duration: 1.4 });
    renderMarkers();
  }

  return {
    element: container,
    init: initMap,
    renderMarkers,
    flyToPlace,
    drawRihlaRoute,
    drawHistoricalRoute,
    filterByRegion,
    clearRihlaRoute,
    resetView
  };
}
