/**
 * مدير الخريطة التفاعلية وعرض البلدان والعلماء ومسارات الرحلات
 * يدعم الوضع النهاري (الأساسي) والوضع الفضائي والداكن
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { places } from '../data/places.js';
import { scholars } from '../data/scholars.js';
import { setupPronunciationButtons } from '../utils/audioSpeech.js';

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
  let currentTileLayer;
  let currentTileMode = 'arabic'; // 'arabic' (default - أسماء عربية أصيلة), 'satellite', 'topo', 'dark'

  // خريطة الأساس الأصلية باللغة العربية (OpenStreetMap) تدعم أسماء الدول والمدن والبحار والمعالم بالعربية
  const arabicOsmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const dayTopoUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
  const darkBaseUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

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

    // الخريطة الأصلية بالأسماء العربية هي الطبقة الأساسية
    currentTileLayer = L.tileLayer(arabicOsmUrl, {
      maxZoom: 19,
      attribution: 'OpenStreetMap العربية'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    rihlaLayer = L.layerGroup().addTo(map);

    renderMarkers();

    // أزرار التحكم
    floatingControls.querySelector('#btn-zoom-in').addEventListener('click', () => map.zoomIn());
    floatingControls.querySelector('#btn-zoom-out').addEventListener('click', () => map.zoomOut());
    
    floatingControls.querySelector('#btn-toggle-tiles').addEventListener('click', () => {
      map.removeLayer(currentTileLayer);
      if (currentTileMode === 'arabic') {
        currentTileMode = 'satellite';
        currentTileLayer = L.tileLayer(satTileUrl, { maxZoom: 18 }).addTo(map);
      } else if (currentTileMode === 'satellite') {
        currentTileMode = 'topo';
        currentTileLayer = L.tileLayer(dayTopoUrl, { maxZoom: 17 }).addTo(map);
      } else if (currentTileMode === 'topo') {
        currentTileMode = 'dark';
        currentTileLayer = L.tileLayer(darkBaseUrl, { maxZoom: 16 }).addTo(map);
      } else {
        currentTileMode = 'arabic';
        currentTileLayer = L.tileLayer(arabicOsmUrl, { maxZoom: 19 }).addTo(map);
      }
    });
  }

  function renderMarkers(filteredCentury = null) {
    markersLayer.clearLayers();

    places.forEach((place) => {
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
        autoPanPaddingTopLeft: L.point(40, 220),
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

      // عند النقر على العلامة: تحريك الخريطة مع إزاحة جغرافية شمالية مدروسة
      // لتستقر العلامة والنافذة المنبثقة بالكامل في الثلث الأوسط أسفل شريط الهيدر ببراح تام
      marker.on('click', () => {
        const latOffset = map.getZoom() > 7 ? 0.9 : 2.0;
        map.panTo([place.lat + latOffset, place.lng], { animate: true, duration: 0.6 });
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
        autoPanPaddingTopLeft: L.point(40, 220),
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

      marker.on('click', () => {
        map.panTo([place.lat + 1.8, place.lng], { animate: true });
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
