// Japonya 2026 • Kōyō & Washi Editorial Engine v5

let itineraryData = [];
let shoppingData = [];
let halalData = {};
let taxFreeData = {};
let budgetData = {};
let checklistData = [];
let proTipsData = [];
let cityHubsData = [];
let accommodationsData = [];
let bookedTicketsData = [];

let currentDayIndex = 0;
let allDrawersExpanded = false;
let currentTimelineFilter = 'all'; // 'all' | 'todo' | 'booked'
let currentTipCategory = 'Tümü';
let currentShopCategory = 'Tümü';
let currentBudgetFilter = 'Tümü';
let currentHalalSubtab = 'markets'; // 'markets' | 'basket' | 'phrases' | 'radar'
let currentShopSubtab = 'catalog';  // 'catalog' | 'taxfree'
let currentGuideSubtab = 'tips';    // 'tips' | 'checklist' | 'tools'
let currentCrisisMode = 'rain';     // 'rain' | 'tired' | 'hungry' | 'late' | 'train'
let openShoppingCards = {};
let openAccordions = {};
let noteAutoSaveTimer = null;

let appState = {
  completedStops: {},
  dayModes: {},
  selectedMeals: {},
  checklist: {},
  marketBasket: {},
  shopInspections: {},
  shopPurchased: {},
  icBalances: { hasan: 3000, es: 3000, cashJPY: 35000 },
  notes: {},
  expenses: [],
  darkMode: false,
  mapProvider: 'google', // 'google' | 'apple'
  cloudSyncUrl: ''
};

const STORAGE_KEY_MASTER = 'japonya_2026_master_state_v3';

// Crisp Inline SVG Icons (Replaces generic emoji clutter)
const SVG_PATHS = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  train: '<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  umbrella: '<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  taxi: '<path d="M10 2h4"/><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  spark: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
};

function ico(name, cls) {
  const path = SVG_PATHS[name] || SVG_PATHS.pin;
  return `<svg class="ui-ico ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function initApp() {
  try {
    if (typeof EMBEDDED_ITINERARY !== 'undefined') {
      itineraryData = EMBEDDED_ITINERARY;
      shoppingData = EMBEDDED_SHOPPING;
      halalData = EMBEDDED_HALAL;
      taxFreeData = EMBEDDED_TAXFREE;
      budgetData = EMBEDDED_BUDGET;
      checklistData = EMBEDDED_CHECKLIST;
      proTipsData = EMBEDDED_PRO_TIPS || [];
      cityHubsData = EMBEDDED_HUBS || [];
      accommodationsData = EMBEDDED_ACCOMMODATIONS || [];
      bookedTicketsData = EMBEDDED_BOOKED_TICKETS || [];
    }

    loadMasterState();
    checkUrlSyncHash();
    applyTheme();
    updateMapProviderButton();
    updateStorageBadge();

    renderCitySegments();
    renderDateNav();
    renderDay(currentDayIndex);
    renderHalal();
    renderShopping();
    renderBudget();
    renderGuide();
    setupEventListeners();
  } catch (err) {
    console.error("Başlatma hatası:", err);
  }
}

let storageAvailable = true;

function getSafeStorage() {
  try {
    if (typeof localStorage === 'undefined') { storageAvailable = false; return null; }
    localStorage.setItem('__jp_test__', '1');
    localStorage.removeItem('__jp_test__');
    storageAvailable = true;
    return localStorage;
  } catch (e) {
    storageAvailable = false;
    return null;
  }
}

function loadMasterState() {
  const store = getSafeStorage();
  if (!store) return;
  try {
    const raw = store.getItem(STORAGE_KEY_MASTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = Object.assign(appState, parsed);
      if (!appState.shopInspections) appState.shopInspections = {};
      if (!appState.shopPurchased) appState.shopPurchased = {};
      if (!appState.icBalances) appState.icBalances = { hasan: 3000, es: 3000, cashJPY: 35000 };
      if (!appState.mapProvider) appState.mapProvider = 'google';
    }
  } catch (e) {}
}

function saveMasterState() {
  const store = getSafeStorage();
  if (store) {
    try { store.setItem(STORAGE_KEY_MASTER, JSON.stringify(appState)); } catch (e) {}
  }
  updateStorageBadge();
  if (appState.cloudSyncUrl && appState.cloudSyncUrl.startsWith('http')) {
    pushToCloudSync();
  }
}

function updateStorageBadge() {
  const el = document.getElementById('storage-mode-label');
  if (!el) return;
  if (!storageAvailable) {
    el.textContent = 'Geçici Oturum (Iframe) • Kodu Dışa Aktar';
    return;
  }
  el.textContent = (appState.cloudSyncUrl && appState.cloudSyncUrl.startsWith('http'))
    ? 'Ortak Bulut + Cihazda Kayıtlı'
    : 'Cihazda Kayıtlı • 21 Kas – 12 Ara';
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const pill = document.createElement('div');
  pill.className = 'toast-pill';
  pill.textContent = msg;
  container.appendChild(pill);
  setTimeout(() => {
    pill.style.opacity = '0';
    pill.style.transition = 'opacity 0.25s';
    setTimeout(() => pill.remove(), 260);
  }, 2500);
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Unified Google Maps / Apple Maps Builder
function buildPlaceUrl(query) {
  const q = encodeURIComponent(query || 'Tokyo');
  return appState.mapProvider === 'apple'
    ? `https://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function buildDirUrl(origin, dest) {
  const o = encodeURIComponent(origin || 'Tokyo Station');
  const d = encodeURIComponent(dest || 'Tokyo');
  return appState.mapProvider === 'apple'
    ? `https://maps.apple.com/?saddr=${o}&daddr=${d}&dirflg=r`
    : `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=transit`;
}

function buildFullDayMapUrl(day) {
  if (!day || !day.stops || !day.stops.length) return buildPlaceUrl(day?.city || 'Tokyo');
  const origin = day.accommodation ? day.accommodation.split('(')[0].trim() : day.stops[0].mapsQuery;
  const stops = day.stops.map(s => s.mapsQuery).filter(Boolean);
  const dest = stops[stops.length - 1] || origin;
  if (appState.mapProvider === 'apple') {
    return `https://maps.apple.com/?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(dest)}&dirflg=r`;
  }
  const waypoints = stops.slice(0, -1).slice(0, 7).map(w => encodeURIComponent(w)).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}${waypoints ? '&waypoints=' + waypoints : ''}&travelmode=transit`;
}

function getJapanLiveStatus() {
  const now = new Date();
  const jstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000;
  const jstDate = new Date(jstMs);
  const hh = String(jstDate.getHours()).padStart(2, '0');
  const mm = String(jstDate.getMinutes()).padStart(2, '0');
  const tripStart = Date.UTC(2026, 10, 21, 13, 55, 0); // 21 Nov 22:55 JST
  const tripEnd = Date.UTC(2026, 11, 12, 1, 35, 0);   // 12 Dec 10:35 JST
  let phaseLabel = 'Seyahat Aktif';
  if (now.getTime() < tripStart) {
    const daysLeft = Math.ceil((tripStart - now.getTime()) / 86400000);
    phaseLabel = `İnişe ${daysLeft} Gün`;
  } else if (now.getTime() > tripEnd) {
    phaseLabel = 'Arşiv Modu';
  }
  return { timeStr: `${hh}:${mm} JST`, phaseLabel };
}

function computeDayIntensity(day) {
  let walkMins = 0;
  let transitCount = 0;
  (day.stops || []).forEach(s => {
    if (s.transitToNext) {
      transitCount++;
      const tStr = String(s.transitToNext.time || '');
      const m = tStr.match(/(\d+)/);
      if (m && String(s.transitToNext.method || '').toLowerCase().includes('yür')) {
        walkMins += parseInt(m[1], 10);
      }
    }
  });
  const count = (day.stops || []).length;
  if (count >= 6 || walkMins >= 45) return { label: 'Yoğun Yürüyüş', note: `${count} durak • rahat spor ayakkabı` };
  if (count >= 4 || transitCount >= 3) return { label: 'Orta Tempo', note: `${count} durak • dengeli akış` };
  return { label: 'Hafif Tempo', note: `${count} durak • dinlenme odaklı` };
}

function toggleMapProvider() {
  appState.mapProvider = appState.mapProvider === 'apple' ? 'google' : 'apple';
  saveMasterState();
  updateMapProviderButton();
  renderDay(currentDayIndex);
  renderHalal();
  showToast(appState.mapProvider === 'apple' ? 'Harita modu: Apple Maps (iPhone)' : 'Harita modu: Google Maps');
}

function updateMapProviderButton() {
  const btn = document.getElementById('map-provider-btn');
  if (!btn) return;
  const isApple = appState.mapProvider === 'apple';
  btn.innerHTML = `${ico('pin')} <span class="hide-xs">${isApple ? 'Apple' : 'Google'}</span>`;
}

function checkUrlSyncHash() {
  if (typeof window === 'undefined' || !window.location.hash) return;
  if (window.location.hash.startsWith('#sync=')) {
    try {
      const encoded = window.location.hash.replace('#sync=', '');
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      appState = Object.assign(appState, decoded);
      saveMasterState();
      history.replaceState(null, '', window.location.pathname);
      setTimeout(() => showToast('Eşinizin paylaştığı güncel veriler aktarıldı'), 300);
    } catch (e) {}
  }
}

function toggleDarkMode() {
  appState.darkMode = !appState.darkMode;
  applyTheme();
  saveMasterState();
  showToast(appState.darkMode ? 'Gece Modu aktif' : 'Gündüz Modu aktif');
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('dark-mode', !!appState.darkMode);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = appState.darkMode ? ico('sun') : ico('moon');
}

// City Segments & Date Nav
function renderCitySegments() {
  const segContainer = document.getElementById('city-segments');
  if (!segContainer || !cityHubsData.length) return;
  segContainer.innerHTML = cityHubsData.map((hub, idx) => `
    <button class="city-seg-btn ${idx === 0 ? 'active' : ''}" id="hub-btn-${idx}" onclick="jumpToCityHub(${idx})">
      <span>${hub.city}</span>
      <span class="city-kanji-tag">${hub.kanji}</span>
    </button>
  `).join('');
}

function jumpToCityHub(hubIndex) {
  document.querySelectorAll('.city-seg-btn').forEach((btn, i) => btn.classList.toggle('active', i === hubIndex));
  const targetDays = [0, 6, 12, 19];
  switchTab('itinerary');
  selectDay(targetDays[hubIndex] || 0);
}

function renderDateNav() {
  const navContainer = document.getElementById('date-nav');
  if (!navContainer) return;
  navContainer.innerHTML = '';
  const bookedDays = new Set([6, 13, 16, 19]);

  itineraryData.forEach((day, index) => {
    const chip = document.createElement('div');
    chip.className = `date-chip ${index === currentDayIndex ? 'active' : ''}`;
    chip.id = `date-chip-${index}`;
    const hasBooked = bookedDays.has(index);
    const shortDay = day.dayName.split(' ')[0].substring(0, 3);
    chip.innerHTML = `
      ${hasBooked ? '<span class="booked-dot" title="Alınmış Tren Bileti Günü"></span>' : ''}
      <span class="day-Label">G${index} • ${shortDay}</span>
      <span class="day-num">${day.date.substring(5).replace('-', '/')}</span>
      <span class="day-city">${day.city.split('->').pop().split('/')[0].trim()}</span>
    `;
    chip.addEventListener('click', () => {
      switchTab('itinerary');
      selectDay(index);
    });
    navContainer.appendChild(chip);
  });
}

function selectDay(index) {
  currentDayIndex = index;
  document.querySelectorAll('.date-chip').forEach((el, i) => el.classList.toggle('active', i === index));
  const hubIdx = index < 6 ? 0 : (index < 12 ? 1 : (index < 19 ? 2 : 3));
  document.querySelectorAll('.city-seg-btn').forEach((btn, i) => btn.classList.toggle('active', i === hubIdx));
  renderDay(index);
  const activeChip = document.getElementById(`date-chip-${index}`);
  if (activeChip && activeChip.scrollIntoView) {
    activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function toggleAccordion(accId) {
  openAccordions[accId] = !openAccordions[accId];
  const el = document.getElementById(accId);
  if (el) el.classList.toggle('open', !!openAccordions[accId]);
}

function getCurrentAccommodation(dayIdx) {
  if (!accommodationsData.length) return null;
  if (dayIdx === 0) return accommodationsData[0];
  if (dayIdx <= 5) return accommodationsData[1];
  if (dayIdx <= 11) return accommodationsData[2];
  if (dayIdx <= 18) return accommodationsData[3];
  return accommodationsData[4] || accommodationsData[3];
}

function openTaxiCardForDay(dayIdx) {
  const acc = getCurrentAccommodation(dayIdx !== undefined ? dayIdx : currentDayIndex);
  if (!acc) return;
  openStaffModal(
    `運転手さん、次の住所までお願いします：\n${acc.addressJp}`,
    `Untenshu-san, tsugi no jūsho made onegaishimasu (${acc.addressEn})`,
    `Taksici Kartı: ${acc.name} — ${acc.addressEn}`
  );
}

function setTimelineFilter(f) {
  currentTimelineFilter = f;
  renderDay(currentDayIndex);
}

function buildBookedAnchorBanner(index) {
  const alerts = {
    0: { badge: 'Heiwajima Ön Kayıt', text: '20 Kas 14:00’e kadar Welcome Course kaydı şart. Servisler T3 1F: 00:40 / 01:40 / 02:40.', hasIcs: true },
    6: { badge: 'Nozomi 379 (Bilet Alındı)', text: 'Shinagawa 11:46 → Shin-Osaka 14:06 • En geç 11:25’te Shinagawa kapısında olun.', hasIcs: true },
    13: { badge: 'Sagano 7 (Bilet Alındı)', text: 'Torokko Saga 12:02 → Kameoka 12:25 • 11:45’te peronda olun; Bamboo Grove 10:00 başlar.', hasIcs: true },
    16: { badge: 'Aoniyoshi (14:55) + Todai-ji', text: '¥730 ek bilet alındı; turnikede +¥760 IC basılacak. Nara’ya inince ÖNCE Todai-ji’ye (17:00 kapanış!) yürüyün.', hasIcs: true },
    19: { badge: 'Nozomi 250 Saat Teyidi', text: 'Biletiniz 11:30–13:38; 2026 JR tarifesi 11:36–13:43. SmartEX’ten peronu kontrol edip 11:15’te hazır olun.', hasIcs: true },
    21: { badge: 'Haneda T3 Çıkış Sırası', text: '1) Tax-Free Kiosk → 2) Bagaj → 3) 4F Honolu (Güvenlik ÖNCESİ!) → 4) Güvenlik → 10:05 Kapı.', hasIcs: false }
  };
  const info = alerts[index];
  if (!info) return '';
  return `
    <div class="anchor-alert">
      <div style="min-width:0; flex:1;">
        <span class="anchor-tag">${ico('train')} ${info.badge}</span>
        <div class="anchor-text">${info.text}</div>
      </div>
      ${info.hasIcs ? `<button class="action-chip map-route" onclick="downloadTripICS()" style="flex-shrink:0;">${ico('calendar')} <span>.ics</span></button>` : ''}
    </div>
  `;
}

function buildTomorrowBriefingHtml(index) {
  const tomorrow = itineraryData[index + 1];
  if (!tomorrow) return '';
  const hourNow = new Date().getHours();
  const isEvening = hourNow >= 20;
  const accToday = itineraryData[index].accommodation.split('(')[0].trim();
  const accTom = tomorrow.accommodation.split('(')[0].trim();
  const hotelMove = accToday !== accTom && !tomorrow.id.includes('day-21');
  const checks = [];
  if (hotelMove) checks.push('Yarın konaklama değişiyor: Valizleri akşamdan toplayıp oda/çekmece kontrolü yapın.');
  if (tomorrow.id === 'day-1') checks.push('Oi Bit Pazarı için en az ¥15.000–¥20.000 küçük nakit banknot ve sabah helal konbini kumanyası hazırlayın.');
  if (tomorrow.id === 'day-16') checks.push('Todai-ji girişi (¥800×2) ve geyik krakeri yalnızca nakit geçer.');
  if (tomorrow.id === 'day-17') checks.push('Tofuku-ji ve çay evinde ayakkabı çıkacağından kalın termal çorap giyin.');
  if (tomorrow.id === 'day-20' || tomorrow.id === 'day-21') checks.push('Tax-Free ürünleri Haneda Kiosk taraması için kolay ulaşılır bölmeye ayırın.');
  if (!checks.length) checks.push('Powerbank, pasaport (Tax-Free için), IC kart bakiyesi ve yürüyüş ayakkabısı hazır olsun.');

  const isOpen = isEvening || !!openAccordions['acc-briefing-' + index];
  return `
    <div class="accordion-card ${isOpen ? 'open' : ''}" id="acc-briefing-${index}" style="margin-top:14px;">
      <button class="accordion-trigger" onclick="toggleAccordion('acc-briefing-${index}')">
        <div style="min-width:0;">
          <span class="section-eyebrow" style="color:var(--shinkansen);">Yarının Hazırlık Brifingi • ${tomorrow.date}</span>
          <strong style="font-size:0.9rem;">${tomorrow.wakeUp} — ${tomorrow.title}</strong>
        </div>
        <span class="accordion-chevron">${ico('chevron')}</span>
      </button>
      <div class="accordion-body">
        <ul style="padding-left:18px; font-size:0.83rem; color:var(--text-secondary); line-height:1.55; margin-bottom:10px;">
          ${checks.map(c => `<li style="margin-bottom:4px;">${c}</li>`).join('')}
        </ul>
        <button class="action-chip map-route" onclick="selectDay(${index + 1})" style="width:100%; justify-content:center;">
          <span>Yarının Programına Geç</span> ${ico('arrowRight')}
        </button>
      </div>
    </div>
  `;
}

// Quick Log Daily Meals / Pass to Budget Ledger
function logDayAmountToBudget(title, category, amountJPY) {
  if (!amountJPY || amountJPY <= 0) {
    showToast('Bu kalem için 0 JPY dışında tutar bulunamadı');
    return;
  }
  appState.expenses.unshift({
    id: Date.now(),
    title,
    category,
    amountJPY: Number(amountJPY),
    date: itineraryData[currentDayIndex]?.date || new Date().toLocaleDateString('tr-TR')
  });
  saveMasterState();
  renderBudget();
  showToast(`¥${Number(amountJPY).toLocaleString()} bütçe defterine işlendi`);
}

function parseFirstYenNumber(str) {
  const cleaned = String(str || '').replace(/\./g, '').replace(/,/g, '');
  const m = cleaned.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// TAB 1: MASTER EDITORIAL DAY RENDER (2-Col on Desktop, Airy Stack on iPhone)
function renderDay(index) {
  const day = itineraryData[index];
  const container = document.getElementById('day-container');
  if (!container || !day) return;

  const dModes = appState.dayModes[day.id] || { lighten: false, rain: false };
  const mealChoice = appState.selectedMeals[day.id] || { lunchIdx: 0, dinnerIdx: 0 };

  const lunchOptions = day.lunchOptions || [];
  const dinnerOptions = day.dinnerOptions || [];
  const activeLunch = lunchOptions[mealChoice.lunchIdx] || lunchOptions[0];
  const activeDinner = dinnerOptions[mealChoice.dinnerIdx] || dinnerOptions[0];

  let completedCount = 0;
  let nextStop = null;
  let nextStopIdx = -1;

  day.stops.forEach((s, idx) => {
    const sid = s.stopId || `${day.id}-s${idx}`;
    if (appState.completedStops[sid]) {
      completedCount++;
    } else if (!nextStop && !(dModes.lighten && s.isOptionalDrop)) {
      nextStop = s;
      nextStopIdx = idx;
    }
  });

  // Circular SVG Progress Ring calculations (r=22 -> C=138.23)
  const totalStops = Math.max(1, day.stops.length);
  const progressRatio = completedCount / totalStops;
  const ringCircumference = 138.23;
  const ringOffset = (ringCircumference * (1 - progressRatio)).toFixed(1);

  // Short Flow Chips
  const shortFlowHtml = day.stops.map((s, idx) => {
    const sid = s.stopId || `${day.id}-s${idx}`;
    const isDone = !!appState.completedStops[sid];
    const isBooked = s.category === 'booked_train';
    const isDropped = dModes.lighten && s.isOptionalDrop;
    const shortLabel = s.name.split('(')[0].replace('Öğle Yemeği:', '').replace('Akşam Yemeği:', '').trim();
    return `
      <button class="flow-step-chip ${isDone ? 'done' : ''} ${isBooked ? 'booked' : ''} ${isDropped ? 'dropped' : ''}" onclick="scrollToStop('${sid}')">
        <span>${isDone ? ico('check') : (isBooked ? ico('train') : `${idx + 1}.`)}</span>
        <span>${shortLabel.length > 22 ? shortLabel.substring(0, 20) + '…' : shortLabel}</span>
      </button>
    `;
  }).join('');

  // Next Stop Spotlight
  let spotlightHtml = '';
  if (nextStop) {
    const routeUrl = buildDirUrl(nextStop.originQuery || day.accommodation, nextStop.mapsQuery);
    const nextSid = nextStop.stopId || `${day.id}-s${nextStopIdx}`;
    spotlightHtml = `
      <div class="next-stop-spotlight">
        <div style="min-width:0; flex:1;">
          <div class="spotlight-tag">
            <span class="pulse-dot"></span>
            <span class="tabular">Sıradaki Durak • ${nextStop.time}</span>
          </div>
          <div style="font-size:0.98rem; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${nextStop.name}
          </div>
          <div style="font-size:0.76rem; color:var(--text-secondary); margin-top:2px;">
            ${nextStop.duration} • ${nextStop.reservationStatus || 'Hazır'}
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <a href="${routeUrl}" target="_blank" rel="noopener noreferrer" class="action-chip map-route">
            ${ico('route')} <span>Rota</span>
          </a>
          <button class="action-chip map-place" onclick="toggleStopDone('${nextSid}')">
            ${ico('check')} <span>Bitti</span>
          </button>
        </div>
      </div>
    `;
  }

  let modeAlertsHtml = '';
  if (dModes.rain) {
    modeAlertsHtml += `<div class="mode-alert-banner"><strong>Yağmur &amp; Yorgunluk Modu Aktif:</strong> ${day.rainAlternative}</div>`;
  }
  if (dModes.lighten) {
    const dropIdx = day.dropStopIndex;
    const dropName = (dropIdx >= 0 && day.stops[dropIdx]) ? day.stops[dropIdx].name : '';
    modeAlertsHtml += `
      <div class="mode-alert-banner" style="background:var(--sky-soft); border-color:rgba(3,105,161,0.3);">
        <strong>Günü Hafifletme Modu Aktif:</strong> ${day.lightenPlan}
        ${dropName ? `<br><span style="font-size:0.78rem; color:var(--sky);">Çıkarılan esnek durak: <strong>${dropName}</strong></span>` : ''}
      </div>
    `;
  }

  // Filtered Timeline Stops
  const filteredStops = day.stops.map((stop, sIdx) => ({ stop, sIdx })).filter(({ stop, sIdx }) => {
    const sid = stop.stopId || `${day.id}-s${sIdx}`;
    if (currentTimelineFilter === 'todo') return !appState.completedStops[sid];
    if (currentTimelineFilter === 'booked') return stop.category === 'booked_train';
    return true;
  });

  const timelineHtml = filteredStops.length === 0
    ? `<div class="editorial-card" style="text-align:center; color:var(--text-muted); font-size:0.86rem;">Bu filtrede gösterilecek durak kalmadı.</div>`
    : filteredStops.map(({ stop, sIdx }) => {
        const sid = stop.stopId || `${day.id}-s${sIdx}`;
        const isDone = !!appState.completedStops[sid];
        const isBooked = stop.category === 'booked_train';
        const isDropped = dModes.lighten && stop.isOptionalDrop;
        const isOpen = allDrawersExpanded || isBooked;

        const placeUrl = buildPlaceUrl(stop.mapsQuery);
        const dirUrl = buildDirUrl(stop.originQuery || day.accommodation, stop.mapsQuery);

        let transitConnectorHtml = '';
        if (stop.transitToNext && stop.transitToNext.method) {
          const t = stop.transitToNext;
          transitConnectorHtml = `
            <div class="transit-connector">
              <div>${ico('train')} <strong>${t.method}:</strong> ${t.from} → ${t.to} <span class="tabular" style="opacity:0.8;">(${t.time})</span></div>
              <span class="tabular" style="font-weight:800; color:var(--text-main); white-space:nowrap;">${t.fare}</span>
            </div>
          `;
        }

        return `
          <div class="tl-node ${isBooked ? 'booked' : ''} ${isDone ? 'done' : ''} ${isDropped ? 'dropped-stop' : ''}" id="node-${sid}">
            <div class="tl-marker"></div>
            <div class="stop-card-v3 ${isOpen ? 'open' : ''}" id="card-${sid}">
              <div class="stop-top-bar">
                <span class="stop-time-pill">${isBooked ? ico('train') : ico('clock')} <span>${stop.time}</span></span>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                  ${stop.isOptionalDrop ? '<span class="stop-cat-tag" style="background:var(--gold-soft); color:var(--gold);">ESNEK</span>' : ''}
                  <span class="stop-cat-tag">${stop.badgeText || 'DURAK'}</span>
                  <span class="tabular" style="font-size:0.74rem; font-weight:700; color:var(--text-muted);">${stop.duration}</span>
                </div>
              </div>

              <div class="stop-main-row">
                <h3 class="stop-heading" onclick="toggleStopDrawer('${sid}')">${stop.name}</h3>
                <button class="done-check-btn ${isDone ? 'checked' : ''}" onclick="toggleStopDone('${sid}')" title="Tamamlandı Olarak İşaretle" aria-label="Durak Tamamlandı">
                  ${ico('check')}
                </button>
              </div>

              <div class="stop-quick-actions">
                <a href="${placeUrl}" target="_blank" rel="noopener noreferrer" class="action-chip map-place">${ico('pin')} <span>Konum</span></a>
                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer" class="action-chip map-route">${ico('route')} <span>Yol Tarifi</span></a>
                <button class="action-chip expand-trigger" onclick="toggleStopDrawer('${sid}')" id="trig-${sid}">
                  ${isOpen ? 'Özet ▴' : 'Detaylar ▾'}
                </button>
              </div>

              <div class="stop-drawer">
                ${stop.whyForUs ? `<div class="why-us-box"><strong>Neden Bize Uygun:</strong> ${stop.whyForUs}</div>` : ''}
                <p style="line-height:1.58; color:var(--text-main); margin-bottom:8px;">${stop.details}</p>
                <div class="stop-meta-pills">
                  <div class="meta-pill-box">
                    <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:block;">AÇILIŞ &amp; SON GİRİŞ</span>
                    <strong style="color:var(--text-main);">${stop.hoursInfo || 'Gün boyu açık'}</strong>
                  </div>
                  <div class="meta-pill-box">
                    <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:block;">BİLET &amp; REZERVASYON</span>
                    <strong style="color:var(--text-main);">${stop.reservationStatus || 'Girişte ödeme / Ücretsiz'}</strong>
                  </div>
                </div>
              </div>
            </div>
            ${transitConnectorHtml}
          </div>
        `;
      }).join('');

  const dynamicFoodTotalJPY = (activeLunch ? activeLunch.cost2pJPY : 0) + (activeDinner ? activeDinner.cost2pJPY : 0);
  const passJPY = parseFirstYenNumber(day.passDecision.totalCost);
  const homeReturnUrl = buildDirUrl('', day.accommodation.split('(')[0].trim());

  const dayChecklistHtml = (day.checklist || []).map((item, cIdx) => {
    const cid = `${day.id}-chk-${cIdx}`;
    const isChecked = !!appState.checklist[cid];
    return `
      <label class="touch-check-row" for="${cid}">
        <input type="checkbox" id="${cid}" ${isChecked ? 'checked' : ''} onchange="toggleDayCheck('${cid}')" style="accent-color:var(--vermilion);">
        <span style="flex:1; ${isChecked ? 'text-decoration:line-through; opacity:0.58;' : 'font-weight:600;'}">${item}</span>
      </label>
    `;
  }).join('');

  const currentNote = appState.notes[day.id] || '';
  const passAccId = 'acc-pass-' + index;
  const prevDay = itineraryData[index - 1];
  const nextDay = itineraryData[index + 1];
  const jstLive = getJapanLiveStatus();
  const intensity = computeDayIntensity(day);
  const fullDayMapUrl = buildFullDayMapUrl(day);

  container.innerHTML = `
    <div class="itinerary-layout">
      <!-- SOL KOLON (Masaüstünde Sabit Komuta Merkezi, Mobilde Üst Özet) -->
      <aside class="day-aside-col">
        ${buildBookedAnchorBanner(index)}
        ${spotlightHtml}

        <div class="day-hero">
          <div class="day-hero-kanji">${day.kanji || '日本'}</div>
          <div class="day-meta-chips">
            <span class="hero-badge">${day.date} • ${day.dayName}</span>
            <span class="hero-chip-muted">${day.weatherTemp || '15°C'} • ${day.regionTag || day.city}</span>
            <span class="jst-live-strip tabular">${jstLive.timeStr} • ${jstLive.phaseLabel}</span>
          </div>

          <div class="day-hero-header">
            <div style="min-width:0;">
              <h2 class="day-hero-title">${day.title}</h2>
              <div class="day-hero-vibe">${day.autumnVibe || 'Özel Rota'} • <strong>${intensity.label}</strong></div>
            </div>
            <div class="progress-ring-wrap" title="Günlük Tamamlanma">
              <svg width="54" height="54" viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="22" stroke="rgba(255,255,255,0.16)" stroke-width="4" fill="none"/>
                <circle cx="27" cy="27" r="22" stroke="#34d399" stroke-width="4" fill="none" stroke-linecap="round"
                  stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset}"
                  transform="rotate(-90 27 27)"/>
              </svg>
              <span class="progress-ring-text">${completedCount}/${day.stops.length}</span>
            </div>
          </div>

          <div class="day-key-grid">
            <div>
              <span class="day-key-label">Evden Çıkış</span>
              <span class="day-key-val">${day.wakeUp}</span>
            </div>
            <div>
              <span class="day-key-label">Konaklama</span>
              <span class="day-key-val">${day.accommodation.split('(')[0].trim()}</span>
            </div>
          </div>

          <div class="day-mode-bar">
            <button class="mode-toggle-btn ${dModes.lighten ? 'active' : ''}" onclick="toggleDayMode('${day.id}', 'lighten')">
              ${ico('feather')} <span>Hafiflet</span>
            </button>
            <button class="mode-toggle-btn ${dModes.rain ? 'active' : ''}" onclick="toggleDayMode('${day.id}', 'rain')">
              ${ico('umbrella')} <span>Yağmur</span>
            </button>
            <a href="${homeReturnUrl}" target="_blank" rel="noopener noreferrer" class="mode-toggle-btn">
              ${ico('home')} <span>Eve Dön</span>
            </a>
            <button class="mode-toggle-btn" onclick="openTaxiCardForDay(${index})">
              ${ico('taxi')} <span>Taksi</span>
            </button>
          </div>
        </div>

        <!-- ULAŞIM KARTI KARARI -->
        <div class="accordion-card ${openAccordions[passAccId] ? 'open' : ''}" id="${passAccId}" style="border-left:4px solid var(--sky);">
          <button class="accordion-trigger" onclick="toggleAccordion('${passAccId}')">
            <div style="min-width:0; flex:1;">
              <span class="section-eyebrow" style="color:var(--sky);">Ulaşım Kartı Kararı</span>
              <strong style="font-size:0.93rem;">${day.passDecision.name}</strong>
              <span class="tabular" style="font-size:0.78rem; color:var(--matcha); font-weight:700; display:block;">2 Kişi Toplam: ${day.passDecision.totalCost}</span>
            </div>
            <span class="accordion-chevron">${ico('chevron')}</span>
          </button>
          <div class="accordion-body">
            <p style="font-size:0.81rem; color:var(--matcha); font-weight:700; margin-bottom:8px;">${day.passDecision.savings}</p>
            <div class="pass-metrics-row">
              <div><span style="font-size:0.68rem; color:var(--text-muted); display:block;">KİŞİ BAŞI</span><strong class="tabular">${day.passDecision.costPerPerson}</strong></div>
              <div><span style="font-size:0.68rem; color:var(--text-muted); display:block;">TOPLAM</span><strong class="tabular">${day.passDecision.totalCost}</strong></div>
              <div><span style="font-size:0.68rem; color:var(--text-muted); display:block;">KAPSAM</span><strong>${day.passDecision.coverage}</strong></div>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary);"><strong>Nasıl Kullanılır:</strong> ${day.passDecision.instructions}</div>
          </div>
        </div>

        <!-- GÜNLÜK ÇANTA & 1-DOKUNUŞ BÜTÇE İŞLEME -->
        <div class="editorial-card">
          <h3 style="font-size:0.96rem; font-weight:800; margin-bottom:6px;">Bugün Yanımıza Alacaklarımız</h3>
          ${dayChecklistHtml}
          <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; font-size:0.83rem;">
            <div>
              <span style="color:var(--text-muted); display:block; font-size:0.7rem; font-weight:700;">SEÇİLİ RESTORAN (2 KİŞİ)</span>
              <strong class="tabular" style="color:var(--matcha); font-size:0.96rem;">¥${dynamicFoodTotalJPY.toLocaleString()} (~$${Math.round(dynamicFoodTotalJPY / 150)})</strong>
            </div>
            <div style="text-align:right;">
              <span style="color:var(--text-muted); display:block; font-size:0.7rem; font-weight:700;">GÜN TAHMİNİ (TÜM KALEMLER)</span>
              <strong class="tabular" style="color:var(--vermilion); font-size:0.96rem;">${day.dailyBudgetEstimated.total}</strong>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">
            <button class="action-chip map-place" style="flex:1; justify-content:center;" onclick="logDayAmountToBudget('${escapeAttr(day.date + ' Öğle + Akşam Yemek')}', 'Yeme - İçme & Günlük Market', ${dynamicFoodTotalJPY})">
              ${ico('plus')} <span>Yemeği Bütçeye İşle</span>
            </button>
            ${passJPY > 0 ? `
              <button class="action-chip map-route" style="flex:1; justify-content:center;" onclick="logDayAmountToBudget('${escapeAttr(day.date + ' ' + day.passDecision.name)}', 'Kalan Ulaşım, IC Kart & Giriş Ücretleri', ${passJPY})">
                ${ico('plus')} <span>Ulaşımı İşle</span>
              </button>
            ` : ''}
          </div>
        </div>
      </aside>

      <!-- SAĞ KOLON (Zaman Çizelgesi + Yemek Seçici + Notlar) -->
      <div class="day-main-col">
        ${modeAlertsHtml}

        <div class="short-flow-box">
          <div class="short-flow-header">
            <span style="font-size:0.8rem; font-weight:800; color:var(--text-main);">Hızlı Akış (Dokun → Durağa İn)</span>
            <span class="tabular" style="font-size:0.74rem; color:var(--text-muted);">${day.stops.length} Durak</span>
          </div>
          <div class="flow-track">${shortFlowHtml}</div>
        </div>

        <div style="margin-bottom:16px;">
          <div class="timeline-toolbar">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <h3 class="timeline-heading">Kapıdan Kapıya Zaman Çizelgesi</h3>
              <a href="${fullDayMapUrl}" target="_blank" rel="noopener noreferrer" class="action-chip map-route" style="min-height:34px; padding:4px 10px;">
                ${ico('route')} <span>Tüm Günü Haritada Gör</span>
              </a>
            </div>
            <div class="pill-filter-row" style="margin-bottom:0;">
              <button class="filter-pill-btn ${currentTimelineFilter === 'all' ? 'active' : ''}" onclick="setTimelineFilter('all')">Tümü</button>
              <button class="filter-pill-btn ${currentTimelineFilter === 'todo' ? 'active' : ''}" onclick="setTimelineFilter('todo')">Kalanlar</button>
              <button class="filter-pill-btn ${currentTimelineFilter === 'booked' ? 'active' : ''}" onclick="setTimelineFilter('booked')">Alınmış Bilet</button>
            </div>
          </div>
          <div class="timeline-wrapper">${timelineHtml}</div>
        </div>

        <!-- HELAL YEMEK & RESTORAN DEĞİŞTİRİCİ -->
        <div class="meal-switcher-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:8px;">
            <div>
              <span class="section-eyebrow">Helal Yemek &amp; Rota Hesaplayıcı</span>
              <h3 style="font-size:1.05rem; font-weight:800;">Öğle ve Akşam Seçenekleri</h3>
            </div>
            <button class="hdr-btn" onclick="openStaffModal('私はイスラム教徒です。豚肉とアルコール（みりん・料理酒）を食べることができません。', 'Watashi wa Isuramu-kyōto desu. Butaniku to arukōru o taberu koto ga dekimasen.', 'Ben Müslümanım. Domuz eti, domuz yağı ve alkol (mirin) tüketemiyorum.')">
              ${ico('card')} <span>Helal Kart</span>
            </button>
          </div>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">
            Yedek seçeneğe dokunduğunuzda önceki ve sonraki durak ulaşımı otomatik güncellenir; bütçe çubuğu ¥2.000 hedef / ¥3.000 tavan kuralını gösterir.
          </p>
          ${renderMealOptionBlock(day.id, 'lunch', 'ÖĞLE YEMEĞİ', lunchOptions, mealChoice.lunchIdx)}
          <div style="margin-top:16px;">
            ${renderMealOptionBlock(day.id, 'dinner', 'AKŞAM YEMEĞİ', dinnerOptions, mealChoice.dinnerIdx)}
          </div>
        </div>

        <!-- KİŞİSEL NOT -->
        <div class="editorial-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="font-size:0.95rem; font-weight:800;">${day.date} Kişisel Notumuz</h3>
            <span id="note-status-${day.id}" style="font-size:0.74rem; color:var(--matcha); font-weight:700;">Otomatik kayıt aktif</span>
          </div>
          <textarea id="note-input-${day.id}" class="radar-textarea" style="min-height:84px; margin-bottom:0;" oninput="autoSaveDayNote('${day.id}', this.value)" placeholder="Saat/kamera referansı, restoran yorumu veya hatıralar...">${currentNote}</textarea>
        </div>

        ${buildTomorrowBriefingHtml(index)}

        <!-- ÖNCEKİ / SONRAKİ GÜN GEÇİŞİ -->
        <div class="day-footer-nav">
          ${prevDay ? `
            <button class="day-nav-card" onclick="selectDay(${index - 1})">
              <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:flex; align-items:center; gap:4px;">${ico('arrowLeft')} ÖNCEKİ GÜN</span>
              <strong style="font-size:0.86rem; display:block; margin-top:2px;">${prevDay.date.substring(5)} • ${prevDay.city.split('->').pop()}</strong>
            </button>
          ` : '<div></div>'}
          ${nextDay ? `
            <button class="day-nav-card next" onclick="selectDay(${index + 1})">
              <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:flex; align-items:center; justify-content:flex-end; gap:4px;">SONRAKİ GÜN ${ico('arrowRight')}</span>
              <strong style="font-size:0.86rem; display:block; margin-top:2px;">${nextDay.date.substring(5)} • ${nextDay.city.split('->').pop()}</strong>
            </button>
          ` : '<div></div>'}
        </div>
      </div>
    </div>
  `;
}

function renderMealOptionBlock(dayId, mealType, titleLabel, options, activeIdx) {
  if (!options || !options.length) return '';
  const opt = options[activeIdx] || options[0];
  const mapUrl = buildPlaceUrl(opt.mapsQuery || opt.name);
  const perPerson = Number(opt.costPerPersonJPY) || 0;
  const meterPct = Math.min(100, Math.round((perPerson / 3000) * 100));
  const meterColor = perPerson <= 2000 ? 'var(--matcha)' : (perPerson <= 3000 ? 'var(--gold)' : 'var(--vermilion)');

  const tabsHtml = options.length > 1 ? `
    <div class="meal-tabs">
      ${options.map((o, idx) => `
        <button class="meal-tab-btn ${idx === activeIdx ? 'active' : ''}" onclick="switchMealOption('${dayId}', '${mealType}', ${idx})">
          ${idx === 0 ? '1. Ana Seçenek' : '2. Yedek (Rota Günceller)'}
        </button>
      `).join('')}
    </div>
  ` : '';

  return `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
        <span style="font-size:0.75rem; font-weight:900; letter-spacing:0.04em; color:var(--text-secondary);">${titleLabel}</span>
        <span class="tabular" style="font-size:0.78rem; font-weight:800; color:var(--vermilion);">
          Kişi ~¥${perPerson.toLocaleString()} • 2 Kişi: ¥${opt.cost2pJPY.toLocaleString()}
        </span>
      </div>
      ${tabsHtml}
      <div class="rest-box">
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:7px;">
          <span class="halal-verify-badge">${ico('shield')} ${opt.halalBasis}</span>
          <span class="price-verify-badge">${opt.priceStatus}</span>
        </div>
        <h4 style="font-size:0.99rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">
          ${opt.name} <span style="font-weight:500; font-size:0.8rem; color:var(--text-muted);">(${opt.cuisine})</span>
        </h4>
        <div class="meal-meter-wrap">
          <div class="meal-meter-bar">
            <div class="meal-meter-fill" style="width:${meterPct}%; background:${meterColor};"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.68rem; color:var(--text-muted); margin-top:2px;" class="tabular">
            <span>¥0</span>
            <span>Hedef ¥2.000</span>
            <span>Kesin Tavan ¥3.000</span>
          </div>
        </div>
        <p style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:6px;">
          <strong>Önerilen Sipariş:</strong> ${opt.recommendedOrder}
        </p>
        ${opt.dayNote ? `<p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:6px;"><em>Not: ${opt.dayNote}</em></p>` : ''}
        <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:8px;"><strong>Açılış:</strong> ${opt.hours}</div>

        <div class="recalc-transit-box">
          <div style="font-weight:800; color:var(--sky); margin-bottom:3px;">Bu Restorana Göre Ulaşım</div>
          <div>• <strong>Önceki Duraktan:</strong> ${opt.transitFromPrev.summary} (${opt.transitFromPrev.walkMin} dk, ¥${opt.transitFromPrev.farePerPerson})</div>
          <div style="margin-top:2px;">• <strong>Sonraki Durağa:</strong> ${opt.transitToNext.summary} (${opt.transitToNext.walkMin} dk, ¥${opt.transitToNext.farePerPerson})</div>
        </div>

        <div style="margin-top:9px; display:flex; gap:8px;">
          <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="action-chip map-place">${ico('pin')} <span>Restoran Konumu</span></a>
        </div>
      </div>
    </div>
  `;
}

function switchMealOption(dayId, mealType, optionIndex) {
  if (!appState.selectedMeals[dayId]) appState.selectedMeals[dayId] = { lunchIdx: 0, dinnerIdx: 0 };
  if (mealType === 'lunch') appState.selectedMeals[dayId].lunchIdx = optionIndex;
  else appState.selectedMeals[dayId].dinnerIdx = optionIndex;
  saveMasterState();
  renderDay(currentDayIndex);
  showToast('Restoran ve bağlantılı ulaşım güncellendi');
}

function toggleStopDrawer(sid) {
  const card = document.getElementById(`card-${sid}`);
  const trig = document.getElementById(`trig-${sid}`);
  if (!card) return;
  const isOpen = card.classList.toggle('open');
  if (trig) trig.textContent = isOpen ? 'Özet ▴' : 'Detaylar ▾';
}

function toggleAllDrawers() {
  allDrawersExpanded = !allDrawersExpanded;
  const btn = document.getElementById('expand-all-btn');
  if (btn) btn.innerHTML = `${ico('chevron')} <span>${allDrawersExpanded ? 'Daralt' : 'Detaylar'}</span>`;
  renderDay(currentDayIndex);
}

function scrollToStop(sid) {
  const node = document.getElementById(`node-${sid}`);
  const card = document.getElementById(`card-${sid}`);
  if (card && !card.classList.contains('open')) toggleStopDrawer(sid);
  if (node && node.scrollIntoView) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleStopDone(sid) {
  appState.completedStops[sid] = !appState.completedStops[sid];
  saveMasterState();
  renderDay(currentDayIndex);
}

function toggleDayMode(dayId, modeKey) {
  if (!appState.dayModes[dayId]) appState.dayModes[dayId] = { lighten: false, rain: false };
  appState.dayModes[dayId][modeKey] = !appState.dayModes[dayId][modeKey];
  saveMasterState();
  renderDay(currentDayIndex);
}

function toggleDayCheck(cid) {
  appState.checklist[cid] = !appState.checklist[cid];
  saveMasterState();
  renderDay(currentDayIndex);
}

function autoSaveDayNote(dayId, value) {
  appState.notes[dayId] = value;
  const statusEl = document.getElementById(`note-status-${dayId}`);
  if (statusEl) statusEl.textContent = 'Kaydediliyor...';
  clearTimeout(noteAutoSaveTimer);
  noteAutoSaveTimer = setTimeout(() => {
    saveMasterState();
    const st = document.getElementById(`note-status-${dayId}`);
    if (st) st.textContent = 'Kaydedildi';
  }, 450);
}

// ==========================================================================
// TAB 2: HALAL DINING, MARKETS, PHRASE BUILDER & HIGHLIGHTED ETIKET RADARI
// ==========================================================================

function renderHalal() {
  const container = document.getElementById('halal-container');
  if (!container) return;

  const subtabs = [
    { id: 'markets', label: 'Konaklama Marketleri' },
    { id: 'basket', label: 'Doğrulanmış Sepet' },
    { id: 'phrases', label: 'Kart & Pazarlık' },
    { id: 'radar', label: 'Canlı Etiket Radarı' }
  ];

  let bodyHtml = '';

  if (currentHalalSubtab === 'markets') {
    bodyHtml = `<div class="grid-2col">${(halalData.accommodationMarkets || []).map(hub => `
      <div class="editorial-card" style="margin-bottom:0;">
        <span class="section-eyebrow">Gerçek Şube Rehberi</span>
        <h3 style="font-size:1.05rem; font-weight:800; margin-bottom:2px;">${hub.hub}</h3>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">Ev Adresi: ${hub.address}</p>
        <div style="display:flex; flex-direction:column; gap:9px;">
          ${hub.branches.map(b => `
            <div style="background:var(--card-tint); border:1px solid var(--border); border-radius:var(--radius-md); padding:11px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                <strong style="font-size:0.92rem; color:var(--text-main);">${b.name}</strong>
                <span class="halal-verify-badge">${b.walk}</span>
              </div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--sky); margin:3px 0;">${b.type}</div>
              <p style="font-size:0.81rem; color:var(--text-secondary); margin-bottom:8px;">${b.highlight}</p>
              <a href="${buildPlaceUrl(b.mapsQuery)}" target="_blank" rel="noopener noreferrer" class="action-chip map-place">
                ${ico('pin')} <span>Haritada Aç</span>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}</div>`;
  } else if (currentHalalSubtab === 'basket') {
    const doneBasket = (halalData.marketBasketItems || []).filter(i => appState.marketBasket[i.id]).length;
    const totalBasket = (halalData.marketBasketItems || []).length;
    bodyHtml = `
      <div class="editorial-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px;">
          <div>
            <h3 style="font-size:1.06rem; font-weight:800;">Doğrulanmış Market &amp; Konbini Sepeti</h3>
            <p style="font-size:0.79rem; color:var(--text-muted);">Japonca ad, alınacak varyant ve içerik dayanağı</p>
          </div>
          <span class="halal-verify-badge tabular">${doneBasket}/${totalBasket} Alındı</span>
        </div>
        ${(halalData.marketBasketItems || []).map(item => {
          const isChecked = !!appState.marketBasket[item.id];
          const isCert = item.status.includes('Sertifikalı');
          return `
            <div style="padding:12px 0; border-bottom:1px solid var(--border-subtle); display:flex; gap:12px; align-items:flex-start;">
              <input type="checkbox" id="mb-${item.id}" ${isChecked ? 'checked' : ''} onchange="toggleMarketItem('${item.id}')" style="width:20px; height:20px; accent-color:var(--matcha); margin-top:4px; flex-shrink:0; cursor:pointer;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                  <label for="mb-${item.id}" style="font-weight:800; font-size:0.93rem; cursor:pointer; ${isChecked ? 'text-decoration:line-through; opacity:0.55;' : ''}">${item.name}</label>
                  <span class="tabular" style="font-weight:900; color:var(--vermilion); font-size:0.86rem; white-space:nowrap;">${item.price}</span>
                </div>
                <div class="jp-pill">${item.jpName}</div>
                <div style="margin:3px 0;">
                  <span class="${isCert ? 'halal-verify-badge' : 'price-verify-badge'}">${item.status}</span>
                  <span style="font-size:0.74rem; color:var(--text-muted); margin-left:6px;">${item.store}</span>
                </div>
                <p style="font-size:0.81rem; color:var(--text-secondary); margin-top:4px;"><strong>Varyant:</strong> ${item.variant}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (currentHalalSubtab === 'phrases') {
    bodyHtml = `
      <div class="grid-2col">
        <div class="editorial-card" style="margin-bottom:0;">
          <h3 style="font-size:1.02rem; font-weight:800; margin-bottom:8px;">Bit Pazarı &amp; Mağaza Pazarlık Kartları</h3>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
            <button class="action-chip map-route" style="justify-content:space-between;" onclick="openStaffModal('まとめて2点（以上）買いますので、少しお安くなりますか？', 'Matomete niten ijō kaimasu node, sukoshi o-yasuku narimasu ka?', 'Birden fazla ürün alıyorum; biraz indirim yapabilir misiniz? (Oi Bit Pazarı)')">
              <span>Bit Pazarı: "Birlikte alıyorum, indirim olur mu?"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip map-route" style="justify-content:space-between;" onclick="openStaffModal('ビンテージの原本ですか？日差は何秒くらいですか？オーバーホール済みですか？', 'Bintēji no genpon desu ka? Nissa wa nan-byō kurai desu ka? Ōbāhōru-zumi desu ka?', 'Orijinal vintage mi? Günlük saat sapması kaç sn? Bakımı yapıldı mı? (Nakano)')">
              <span>Saatçi: "Günlük sapma &amp; revizyon geçmişi"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip map-route" style="justify-content:space-between;" onclick="openStaffModal('英語メニュー対応の海外版またはCFI-2000モデルのみ探しています。CFI-2200（日本語専用）は不要です。', 'Eigo menyū taiō no CFI-2000 moderu o sagashite imasu.', 'İngilizce menülü / CFI-2000 çok dilli model arıyorum (CFI-2200 Japonca kilitli hariç).')">
              <span>Teknoloji: "İngilizce menü / PS5 CFI-2000"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip" style="justify-content:space-between;" onclick="openStaffModal('大きなスーツケースが入るコインロッカーはどこですか？', 'Ōkina sūtsukēsu ga hairu koin rokkā wa doko desu ka?', 'Büyük valizin sığacağı emanet dolabı (Coin Locker) nerede?')">
              <span>İstasyon: "Büyük valiz dolabı nerede?"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip" style="justify-content:space-between;" onclick="openStaffModal('免税手続きをお願いします。パスポートを持っています。', 'Menzei tetsuzuki o onegaishimasu. Pasupōto o motte imasu.', 'Tax-Free işlemi rica ediyorum. Pasaportum yanımda.')">
              <span>Kasa: "Tax-Free işlemi lütfen"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip" style="justify-content:space-between;" onclick="openStaffModal('お手洗い（トイレ）はどこですか？', 'O-tearai (toire) wa doko desu ka?', 'Tuvalet nerede?')">
              <span>Genel: "Tuvalet nerede?"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
            <button class="action-chip" style="justify-content:space-between;" onclick="openStaffModal('Suicaまたはクレジットカードは使えますか？', 'Suica matawa kurejitto kādo wa tsukaemasu ka?', 'Suica veya kredi kartı geçiyor mu?')">
              <span>Ödeme: "Suica veya kart geçiyor mu?"</span>
              <span style="font-weight:800;">Göster</span>
            </button>
          </div>

          <h4 style="font-size:0.93rem; font-weight:800; margin-bottom:6px;">Özel Restoran / Kasiyer Cümle Kurucu</h4>
          <div style="background:var(--card-tint); border:1px solid var(--border); border-radius:var(--radius-md); padding:10px;">
            <label class="touch-check-row" for="pc-pork"><input type="checkbox" id="pc-pork" checked onchange="updatePhraseComposer()"><span>Domuz eti ve domuz yağı (Lard) olmasın</span></label>
            <label class="touch-check-row" for="pc-alc"><input type="checkbox" id="pc-alc" checked onchange="updatePhraseComposer()"><span>Alkol, Mirin ve Yemek Şarabı (Ryōrishu) olmasın</span></label>
            <label class="touch-check-row" for="pc-dashi"><input type="checkbox" id="pc-dashi" onchange="updatePhraseComposer()"><span>Et suyu (Chicken/Beef/Pork extract) olmasın</span></label>
            <label class="touch-check-row" for="pc-fish" style="border-bottom:none;"><input type="checkbox" id="pc-fish" onchange="updatePhraseComposer()"><span>Sadece tuzla ızgara balık/sebze gösterin</span></label>
            <button class="hdr-btn hdr-primary" onclick="showComposedPhrase()" style="width:100%; justify-content:center; margin-top:8px;">
              Seçilenlerden Tam Ekran Kart Oluştur
            </button>
          </div>
        </div>

        <div class="editorial-card" style="margin-bottom:0;">
          <h3 style="font-size:1.02rem; font-weight:800; margin-bottom:10px;">Hazır Helal Gösterim Kartları</h3>
          ${(halalData.phraseCard || []).map(p => `
            <div style="background:var(--card-tint); border:1px solid var(--border); border-radius:var(--radius-lg); padding:13px; margin-bottom:10px;">
              <div style="font-size:1.04rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${p.jp}</div>
              <div style="font-size:0.8rem; font-style:italic; color:var(--text-secondary); margin-bottom:4px;">${p.romaji}</div>
              <div style="font-size:0.85rem; font-weight:700; color:var(--matcha); margin-bottom:10px;">${p.tr}</div>
              <button class="hdr-btn hdr-primary" onclick="openStaffModal('${escapeAttr(p.jp)}', '${escapeAttr(p.romaji)}', '${escapeAttr(p.tr)}')" style="width:100%; justify-content:center;">
                Tam Ekran Göster &amp; Sesli Oku
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    bodyHtml = `
      <div class="grid-2col">
        <div class="editorial-card" style="margin-bottom:0;">
          <span class="section-eyebrow">Çevrimdışı İçerik Taraması</span>
          <h3 style="font-size:1.06rem; font-weight:800; margin-bottom:4px;">Canlı Etiket &amp; İçindekiler Radarı</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">
            iPhone kamerasındaki Canlı Metin (Live Text) ile ürün arkasındaki <em>原材料名</em> metnini yapıştırın; riskli Kanji/Katakana kelimeleri anında vurgulanır.
          </p>
          <textarea id="radar-input" class="radar-textarea" oninput="runLabelRadar(this.value)" placeholder="Örn: 小麦粉、砂糖、ショートニング、豚肉エキス、みりん、乳化剤..."></textarea>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <button class="action-chip map-place" onclick="testRadarSample('小麦粉、植物油脂、砂糖、食塩、緑茶')">Güvenli Örnek</button>
            <button class="action-chip" onclick="testRadarSample('醤油（大豆・小麦）、みりん、ポークエキス、ゼラチン')">Riskli Örnek</button>
            <button class="action-chip" onclick="testRadarSample('')">Temizle</button>
          </div>
          <div id="radar-output"></div>
        </div>

        <div class="editorial-card" style="margin-bottom:0;">
          <h3 style="font-size:1.02rem; font-weight:800; margin-bottom:8px;">Etiket Sözlüğü (Dokun → Radarda Dene)</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            ${(halalData.kanjiWarningList || []).map(w => `
              <button type="button" onclick="appendToRadar('${escapeAttr(w.kanji.split('/')[0].trim())}')" style="text-align:left; background:var(--vermilion-soft); border:1px solid rgba(197,48,39,0.24); border-radius:var(--radius-md); padding:10px; cursor:pointer; color:var(--text-main);">
                <span style="font-size:1.08rem; font-weight:900; color:var(--vermilion); display:block;">${w.kanji}</span>
                <span style="font-size:0.77rem; font-weight:700; display:block;">${w.romaji}</span>
                <span style="font-size:0.73rem; color:var(--text-secondary); display:block; margin-top:2px;">${w.meaning}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="section-header-block">
      <span class="section-eyebrow" style="color:var(--matcha);">Helal Beslenme &amp; Market Sistemi</span>
      <h2 class="section-title">Yemek, Market &amp; Etiket Radarı</h2>
      <p class="section-subtitle">${halalData.principles ? halalData.principles.budgetRule : ''}</p>
    </div>

    <div class="subtab-seg">
      ${subtabs.map(st => `
        <button class="subtab-seg-btn ${currentHalalSubtab === st.id ? 'active' : ''}" onclick="switchHalalSubtab('${st.id}')">${st.label}</button>
      `).join('')}
    </div>

    ${bodyHtml}
  `;
}

function switchHalalSubtab(subId) { currentHalalSubtab = subId; renderHalal(); }
function toggleMarketItem(id) { appState.marketBasket[id] = !appState.marketBasket[id]; saveMasterState(); renderHalal(); }
function testRadarSample(txt) {
  const el = document.getElementById('radar-input');
  if (el) { el.value = txt; runLabelRadar(txt); }
}
function appendToRadar(token) {
  const el = document.getElementById('radar-input');
  if (!el) return;
  el.value = (el.value ? el.value + '、' : '') + token;
  runLabelRadar(el.value);
}

function runLabelRadar(rawText) {
  const out = document.getElementById('radar-output');
  if (!out) return;
  const txt = (rawText || '').trim();
  if (!txt) { out.innerHTML = ''; return; }

  const rules = [
    { keys: ['豚肉', '豚', 'ポーク', 'ラード', '豚骨'], level: 'danger', title: 'DOMUZ / LARD TESPİT EDİLDİ', desc: 'Doğrudan domuz eti, yağı veya kemik suyu içerir.' },
    { keys: ['みりん', '料理酒', '清酒', 'アルコール', '酒精', '洋酒', 'ワイン', '酒'], level: 'danger', title: 'ALKOL / MİRİN TESPİT EDİLDİ', desc: 'Pişirme şarabı (mirin/ryorishu) veya alkol koruyucu içerir.' },
    { keys: ['ゼラチン'], level: 'danger', title: 'JELATİN (ゼラチン)', desc: 'Japonya’da jelatin çoğunlukla domuz/helal dışı sığırdandır.' },
    { keys: ['チキンエキス', '鶏エキス', '鶏肉', 'ビーフエキス', '牛肉', '牛脂', '動物性油脂', 'コンソメ', 'だし'], level: 'warn', title: 'ŞÜPHELİ HAYVANSAL ÖZÜT / BİYON', desc: 'Et özütü/yağı veya belirsiz dashi var; balık bazlı teyidi yoksa bırakın.' },
    { keys: ['乳化剤', 'ショートニング'], level: 'warn', title: 'EMÜLGATÖR / SHORTENING', desc: 'Bitkisel veya hayvansal olabilir; kesin garanti yoksa sade alternatif seçin.' }
  ];

  const hits = [];
  const allMatchedTokens = [];
  rules.forEach(r => {
    const matched = r.keys.filter(k => txt.includes(k));
    if (matched.length) {
      hits.push({ ...r, matched });
      matched.forEach(m => allMatchedTokens.push(m));
    }
  });

  // Highlight matched Kanji inline inside scanned snippet
  let highlighted = escapeHtml(txt);
  [...new Set(allMatchedTokens)].sort((a, b) => b.length - a.length).forEach(tok => {
    highlighted = highlighted.split(tok).join(`<span class="radar-highlight">${tok}</span>`);
  });

  if (hits.some(h => h.level === 'danger')) {
    out.innerHTML = `
      <div class="radar-result danger">
        <strong style="color:var(--vermilion); font-size:0.94rem;">KESİNLİKLE ALMAYIN (Kritik Eşleşme)</strong>
        <div style="margin:6px 0; padding:7px 9px; background:var(--card-bg); border-radius:6px; font-size:0.84rem;">${highlighted}</div>
        ${hits.map(h => `<div style="margin-top:5px;"><strong>• ${h.title}</strong> (${h.matched.join(', ')}) — ${h.desc}</div>`).join('')}
      </div>
    `;
  } else if (hits.length) {
    out.innerHTML = `
      <div class="radar-result warn">
        <strong style="color:var(--gold); font-size:0.94rem;">DİKKAT / ŞÜPHELİ İÇERİK</strong>
        <div style="margin:6px 0; padding:7px 9px; background:var(--card-bg); border-radius:6px; font-size:0.84rem;">${highlighted}</div>
        ${hits.map(h => `<div style="margin-top:5px;"><strong>• ${h.title}</strong> (${h.matched.join(', ')}) — ${h.desc}</div>`).join('')}
      </div>
    `;
  } else {
    out.innerHTML = `
      <div class="radar-result safe">
        <strong style="color:var(--matcha); font-size:0.94rem;">YÜKSEK RİSKLİ KELİME BULUNMADI</strong>
        <div style="margin-top:4px;">Domuz, lard, mirin, alkol ve şüpheli et özütü bulunmadı. Yine de balık/bitki bazlı içerikleri son kez kontrol edin.</div>
      </div>
    `;
  }
}

function updatePhraseComposer() {}

function showComposedPhrase() {
  const pork = document.getElementById('pc-pork')?.checked;
  const alc = document.getElementById('pc-alc')?.checked;
  const dashi = document.getElementById('pc-dashi')?.checked;
  const fish = document.getElementById('pc-fish')?.checked;

  const jpParts = ['私はイスラム教徒です。'];
  const trParts = ['Ben Müslümanım.'];
  if (pork) { jpParts.push('豚肉・ラード'); trParts.push('Domuz eti/yağı'); }
  if (alc) { jpParts.push('アルコール（みりん・料理酒）'); trParts.push('Alkol/Mirin'); }
  if (dashi) { jpParts.push('肉エキス・ゼラチン'); trParts.push('Et özütü/Jelatin'); }
  if (pork || alc || dashi) {
    jpParts.push('は一切食べられません。');
    trParts.push('kesinlikle tüketemiyorum.');
  }
  if (fish) {
    jpParts.push('塩焼きの魚か野菜だけの料理はありますか？');
    trParts.push('Sadece tuzla ızgara balık veya sebze yemeğiniz var mı?');
  }
  openStaffModal(jpParts.join(' '), 'Kişiselleştirilmiş Müşteri İsteği', trParts.join(' '));
}

// ==========================================================================
// TAB 3: SHOPPING CATALOG (INTERACTIVE CHECKLISTS) & KASA HAKEMİ
// ==========================================================================

function renderShopping() {
  const container = document.getElementById('shopping-list-container');
  if (!container) return;

  const subBarHtml = `
    <div class="section-header-block">
      <span class="section-eyebrow">Uzman Model &amp; Vergi İadesi Rehberi</span>
      <h2 class="section-title">Alışveriş &amp; Kasa Hakemi</h2>
      <p class="section-subtitle">Fujifilm, saat, PS5 CFI-2000, vintage ve valiz kontrol noktaları ile Kasım 2026 tax-free hesabı.</p>
    </div>
    <div class="subtab-seg">
      <button class="subtab-seg-btn ${currentShopSubtab === 'catalog' ? 'active' : ''}" onclick="switchShopSubtab('catalog')">Model &amp; Mağaza Kataloğu</button>
      <button class="subtab-seg-btn ${currentShopSubtab === 'taxfree' ? 'active' : ''}" onclick="switchShopSubtab('taxfree')">Tax-Free &amp; Kasa Hakemi</button>
    </div>
  `;

  if (currentShopSubtab === 'taxfree') {
    const tfRules = (taxFreeData.rules || []).map((rule, idx) => `
      <div style="display:flex; gap:10px; align-items:flex-start; font-size:0.84rem;">
        <span class="tabular" style="background:var(--indigo); color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.76rem; flex-shrink:0;">
          ${idx + 1}
        </span>
        <span style="color:var(--text-main); line-height:1.5;">${rule}</span>
      </div>
    `).join('');

    container.innerHTML = `
      ${subBarHtml}
      <div class="grid-2col">
        <div class="editorial-card" style="border-left:4px solid var(--sky); margin-bottom:0;">
          <span class="section-eyebrow" style="color:var(--sky);">Akıllı Kasa Hakemi</span>
          <h3 style="font-size:1.06rem; font-weight:800; margin-bottom:6px;">Kasada Alınır mı? (Kasım 2026)</h3>
          <p style="font-size:0.79rem; color:var(--text-muted); margin-bottom:10px;">
            Etiket fiyatını girin: kasada ödenecek peşin tutarı, Haneda iadesini ve kategori limitini görün.
          </p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <select id="kasa-cat" class="search-input" style="padding:8px 12px;" onchange="recalcKasaHakemi()">
              <option value="fujifilm">Fujifilm X-T30 III Kit (Limit $1,200 / ¥180k)</option>
              <option value="watch">Saat Alışverişi (KESİN Tavan $1,500 / ¥225k)</option>
              <option value="ps5">PS5 / Oyun (Limit $550 / ¥82.5k)</option>
              <option value="luggage">Valiz / Vintage (Valiz ~¥38k / Toplam $1,250)</option>
            </select>
            <input type="number" id="kasa-price" class="search-input tabular" style="padding:8px 12px;" placeholder="Etiket Fiyatı (Vergi Dahil ¥)" value="177920" oninput="recalcKasaHakemi()">
            <label class="touch-check-row" for="kasa-coupon" style="padding:4px 0;">
              <input type="checkbox" id="kasa-coupon" checked onchange="recalcKasaHakemi()" style="accent-color:var(--sky);">
              <span style="font-size:0.83rem; font-weight:600;">Yodobashi / Bic %5 Visa/Mastercard Kuponu var</span>
            </label>
            <label class="touch-check-row" for="kasa-tf" style="border-bottom:none; padding:4px 0;">
              <input type="checkbox" id="kasa-tf" checked onchange="recalcKasaHakemi()" style="accent-color:var(--matcha);">
              <span style="font-size:0.83rem; font-weight:600;">Tax-Free mağazası (¥5.500 üzeri pasaport kaydı)</span>
            </label>
          </div>
          <div id="kasa-result" style="margin-top:10px;"></div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          <div class="editorial-card" style="border-left:4px solid var(--vermilion); margin-bottom:0;">
            <h3 style="font-size:0.98rem; font-weight:800; color:var(--vermilion); margin-bottom:6px;">Kritik Kural: İade Kasada Düşülmez</h3>
            <p style="font-size:0.83rem; color:var(--text-secondary);">
              1 Kasım 2026 itibarıyla mağazada %10 vergi dahil tam tutar ödenir. İade, 12 Aralık'ta Haneda T3 bagaj check-in öncesinde pasaport taraması yapıldığında yatar.
            </p>
          </div>
          <div class="editorial-card" style="margin-bottom:0;">
            <h3 style="font-size:1rem; font-weight:800; margin-bottom:10px;">Adım Adım Mağaza &amp; Haneda T3 Süreci</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">${tfRules}</div>
          </div>
        </div>
      </div>
    `;
    recalcKasaHakemi();
    return;
  }

  const categories = ['Tümü', ...new Set(shoppingData.map(s => s.category))];
  const filtered = currentShopCategory === 'Tümü' ? shoppingData : shoppingData.filter(s => s.category === currentShopCategory);

  let boughtCount = 0;
  let totalPaidTaxFreeJPY = 0;
  shoppingData.forEach(item => {
    const rec = appState.shopPurchased[item.id];
    if (rec && rec.bought) {
      boughtCount++;
      totalPaidTaxFreeJPY += Number(rec.paidJPY) || 0;
    }
  });
  const estRefundJPY = Math.round(totalPaidTaxFreeJPY - (totalPaidTaxFreeJPY / 1.1));

  container.innerHTML = `
    ${subBarHtml}
    <div class="taxfree-pool-banner">
      <div>
        <span style="font-size:0.68rem; font-weight:800; opacity:0.8; letter-spacing:0.05em; display:block;">12 ARALIK HANEDA T3 KİOSK TAKİBİ</span>
        <strong class="tabular" style="font-size:1rem;">${boughtCount}/${shoppingData.length} Ürün Alındı • Kayıtlı Harcama: ¥${totalPaidTaxFreeJPY.toLocaleString()}</strong>
      </div>
      <div style="text-align:right;">
        <span style="font-size:0.68rem; opacity:0.8; display:block;">TAHMİNİ GÜMRÜK İADESİ</span>
        <strong class="tabular" style="font-size:1.05rem; color:#34d399;">+¥${estRefundJPY.toLocaleString()} (~$${Math.round(estRefundJPY / 150)})</strong>
      </div>
    </div>

    <div class="pill-filter-row">
      ${categories.map(cat => `<button class="filter-pill-btn ${cat === currentShopCategory ? 'active' : ''}" onclick="filterShopping('${cat}')">${cat}</button>`).join('')}
    </div>

    <div class="grid-2col">
      ${filtered.map(item => {
        const prodText = Array.isArray(item.suitableProduct) ? item.suitableProduct.join('<br>• ') : item.suitableProduct;
        const isOpen = !!openShoppingCards[item.id];
        const inspList = item.inspections || [];
        const checkedInsp = inspList.filter((_, i) => appState.shopInspections[`${item.id}-insp-${i}`]).length;
        const purchaseRec = appState.shopPurchased[item.id] || { bought: false, paidJPY: '' };
        return `
          <div class="editorial-card" style="margin-bottom:0; ${purchaseRec.bought ? 'border-color:var(--matcha);' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
              <span class="stop-cat-tag" style="background:var(--sky-soft); color:var(--sky);">${item.category}</span>
              <span class="tabular" style="font-size:0.8rem; font-weight:800; color:var(--vermilion);">${item.budgetLimit}</span>
            </div>
            <h3 style="font-family:var(--font-serif); font-size:1.15rem; font-weight:800; margin-bottom:6px;">${item.title}</h3>
            <div class="tabular" style="font-size:0.82rem; color:var(--matcha); font-weight:700; margin-bottom:4px;">${item.currentPrice}</div>
            <div style="font-size:0.79rem; color:var(--text-secondary); margin-bottom:10px;"><strong>Önerilen Gün:</strong> ${item.suggestedDay}</div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; align-items:center;">
              <button class="action-chip ${purchaseRec.bought ? 'map-place' : ''}" onclick="toggleShopPurchased('${item.id}')">
                ${ico('check')} <span>${purchaseRec.bought ? 'Alındı' : 'Aldık İşaretle'}</span>
              </button>
              ${purchaseRec.bought ? `
                <input type="number" class="search-input tabular" style="min-height:38px; padding:4px 10px; width:135px; font-size:16px;" placeholder="Ödenen ¥" value="${purchaseRec.paidJPY || ''}" onchange="updateShopPaid('${item.id}', this.value)">
              ` : ''}
            </div>

            <div style="display:flex; gap:8px;">
              <button class="action-chip map-route" style="flex:1; justify-content:center;" onclick="toggleShoppingDrawer('${item.id}')">
                <span>${isOpen ? 'Özet ▴' : '10 Maddelik Kontrol & Sorular ▾'}</span>
              </button>
              <button class="action-chip" onclick="jumpToKasa('${item.id}')" title="Kasa Hakeminde Hesapla">
                ${ico('card')} <span>Hesapla</span>
              </button>
            </div>

            ${isOpen ? `
              <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-subtle); font-size:0.82rem; line-height:1.55; display:flex; flex-direction:column; gap:9px;">
                <div style="background:var(--card-tint); border:1px solid var(--border-subtle); padding:10px 12px; border-radius:var(--radius-md);">
                  <strong>1. Bize Uygun Ürün / Model:</strong><br>
                  ${Array.isArray(item.suitableProduct) ? '• ' + prodText : prodText}
                </div>
                <div><strong>2. Şehir &amp; Mağaza Şubeleri:</strong><br>${item.citiesAndShops.map(s => `• ${s}`).join('<br>')}</div>
                <div><strong>5. Makul Alım Aralığı:</strong> ${item.reasonablePriceRange}</div>
                <div><strong>6. Fiyat Kıyaslama Noktaları:</strong> ${item.comparisons}</div>
                <div style="background:var(--card-tint); border:1px solid var(--border); padding:10px 12px; border-radius:var(--radius-md);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong>7. Tezgahta Fiziki Kontrol Listesi</strong>
                    <span class="halal-verify-badge tabular">${checkedInsp}/${inspList.length}</span>
                  </div>
                  ${inspList.map((insp, i) => {
                    const key = `${item.id}-insp-${i}`;
                    const c = !!appState.shopInspections[key];
                    return `
                      <label class="touch-check-row" for="${key}" style="min-height:38px; padding:4px 0; font-size:0.8rem;">
                        <input type="checkbox" id="${key}" ${c ? 'checked' : ''} onchange="toggleShopInspection('${key}')" style="accent-color:var(--matcha);">
                        <span style="${c ? 'text-decoration:line-through; opacity:0.6;' : ''}">${insp}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
                <div style="background:var(--vermilion-soft); border-left:3px solid var(--vermilion); padding:8px 10px; border-radius:0 8px 8px 0;">
                  <strong>8. Garanti, Dil &amp; Bölge:</strong><br>${item.warrantyAndRegion}
                </div>
                <div>
                  <strong>9. Satıcıya Sorulacak Sorular (Dokun → Göster):</strong>
                  <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                    ${item.questionsToAsk.map(q => {
                      const parts = q.split('(');
                      const romajiPart = parts[0].trim();
                      const trPart = parts[1] ? parts[1].replace(')', '').trim() : q;
                      return `
                        <button class="action-chip" style="justify-content:space-between; text-align:left;" onclick="openStaffModal('${escapeAttr(romajiPart)}', '${escapeAttr(romajiPart)}', '${escapeAttr(trPart)}')">
                          <span>${q}</span>
                          <span style="color:var(--vermilion); font-weight:800;">Göster</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
                <div style="color:var(--text-muted); font-size:0.79rem;">
                  <strong>10. Ne Zaman Ertelemeli:</strong> ${item.whenToPostpone}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleShopInspection(key) {
  appState.shopInspections[key] = !appState.shopInspections[key];
  saveMasterState();
  renderShopping();
}
function toggleShopPurchased(id) {
  const cur = appState.shopPurchased[id] || { bought: false, paidJPY: 0 };
  appState.shopPurchased[id] = { bought: !cur.bought, paidJPY: cur.paidJPY || 0 };
  saveMasterState();
  renderShopping();
  showToast(appState.shopPurchased[id].bought ? 'Ürün alındı olarak işaretlendi' : 'Alındı işareti kaldırıldı');
}
function updateShopPaid(id, val) {
  const cur = appState.shopPurchased[id] || { bought: true, paidJPY: 0 };
  appState.shopPurchased[id] = { bought: true, paidJPY: Number(val) || 0 };
  saveMasterState();
  renderShopping();
}
function switchShopSubtab(sub) { currentShopSubtab = sub; renderShopping(); }
function toggleShoppingDrawer(id) { openShoppingCards[id] = !openShoppingCards[id]; renderShopping(); }
function jumpToKasa(itemId) {
  currentShopSubtab = 'taxfree';
  renderShopping();
  const sel = document.getElementById('kasa-cat');
  const priceEl = document.getElementById('kasa-price');
  const defaults = { fujifilm: 177920, watch: 150000, ps5: 79980, 'vintage-clothing': 18000, luggage: 32900 };
  if (sel) sel.value = (itemId === 'vintage-clothing' || itemId === 'luggage') ? 'luggage' : itemId;
  if (priceEl && defaults[itemId]) priceEl.value = defaults[itemId];
  recalcKasaHakemi();
}

function recalcKasaHakemi() {
  const cat = document.getElementById('kasa-cat')?.value || 'fujifilm';
  const rawPrice = parseFloat(document.getElementById('kasa-price')?.value) || 0;
  const hasCoupon = !!document.getElementById('kasa-coupon')?.checked;
  const isTaxFree = !!document.getElementById('kasa-tf')?.checked;
  const out = document.getElementById('kasa-result');
  if (!out) return;

  const caps = { fujifilm: 180000, watch: 225000, ps5: 82500, luggage: 187500 };
  const capWarn = {
    fujifilm: 'Ekranda İngilizce menü + Uluslararası garanti kartını kasada bizzat kontrol edin.',
    watch: 'Nakano Jackroad & Kame-Kichi arasında fiyat kıyaslayın; zaman tutma testi isteyin.',
    ps5: 'KUTU KODUNUN CFI-2000 OLDUĞUNU TEYİT EDİN! CFI-2200 yalnızca Japonca/Japon PSN kilitlidir.',
    luggage: 'Boş ağırlık 4.5 kg altı ve Hinomoto frenli tekerlek olmalı (Lojel ~38k / Muji ~33k).'
  };

  const afterCoupon = hasCoupon ? Math.round(rawPrice * 0.95) : rawPrice;
  const eligibleTF = isTaxFree && afterCoupon >= 5500;
  const netCost = eligibleTF ? Math.round(afterCoupon / 1.1) : afterCoupon;
  const refundLater = afterCoupon - netCost;
  const capJPY = caps[cat] || 225000;
  const overCap = afterCoupon > capJPY;

  out.innerHTML = `
    <div class="kasa-grid">
      <div class="kasa-metric">
        <span style="color:var(--text-muted); display:block;">KASADA ÖDENECEK</span>
        <strong class="tabular" style="font-size:1.06rem; color:var(--vermilion);">¥${afterCoupon.toLocaleString()} ($${Math.round(afterCoupon / 150)})</strong>
      </div>
      <div class="kasa-metric">
        <span style="color:var(--text-muted); display:block;">HANEDA İADESİ (DÖNÜŞ)</span>
        <strong class="tabular" style="font-size:1.06rem; color:var(--matcha);">${eligibleTF ? '+¥' + refundLater.toLocaleString() : '¥0 (Yok)'}</strong>
      </div>
    </div>
    <div style="margin-top:8px; padding:10px 12px; border-radius:var(--radius-md); background:${overCap ? 'var(--vermilion-soft)' : 'var(--matcha-soft)'}; font-size:0.82rem;">
      <div class="tabular"><strong>Gerçek Net Maliyet (İade Sonrası):</strong> ¥${netCost.toLocaleString()} (~$${Math.round(netCost / 150)})</div>
      <div style="margin-top:4px; color:${overCap ? 'var(--vermilion)' : 'var(--matcha)'}; font-weight:800;">
        ${overCap ? `Kategori limiti (¥${capJPY.toLocaleString()}) AŞILIYOR — indirim/ikinci el bakın.` : `Kategori bütçesi (¥${capJPY.toLocaleString()}) içinde uygun.`}
      </div>
      <div style="margin-top:4px; color:var(--text-secondary);">${capWarn[cat]}</div>
    </div>
  `;
}

function filterShopping(cat) { currentShopCategory = cat; renderShopping(); }

// ==========================================================================
// TAB 4: BUDGET & SVG DONUT CHART & QUICK PRESETS
// ==========================================================================

function buildBudgetDonutSvg(categories) {
  const palette = ['#1a6648', '#c53027', '#6329d1', '#0369a1', '#a97813', '#0f766e', '#64748b'];
  const total = categories.reduce((s, c) => s + (c.budgetUSD || 0), 0) || 9000;
  const r = 46;
  const C = 2 * Math.PI * r;
  let offset = 0;

  const arcs = categories.map((c, idx) => {
    const pct = (c.budgetUSD || 0) / total;
    const len = pct * C;
    const color = palette[idx % palette.length];
    const svg = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="-${offset.toFixed(2)}" transform="rotate(-90 60 60)"/>`;
    offset += len;
    return svg;
  }).join('');

  const legend = categories.map((c, idx) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${palette[idx % palette.length]};"></span>
      <div style="min-width:0;">
        <div style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.category.split('&')[0].split('(')[0].trim()}</div>
        <div class="tabular" style="color:var(--text-muted); font-size:0.71rem;">$${c.budgetUSD.toLocaleString()}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="budget-donut-wrap">
      <div style="position:relative; width:120px; height:120px; flex-shrink:0;">
        <svg width="120" height="120" viewBox="0 0 120 120">${arcs}</svg>
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
          <span style="font-size:0.62rem; font-weight:800; color:var(--text-muted);">TOPLAM</span>
          <strong class="tabular" style="font-size:0.95rem;">$9,000</strong>
        </div>
      </div>
      <div class="budget-legend">${legend}</div>
    </div>
  `;
}

function renderBudget() {
  const container = document.getElementById('budget-container');
  if (!container || !budgetData.categories) return;

  const spentByCat = {};
  let totalSpentJPY = 0;
  (appState.expenses || []).forEach(exp => {
    const amt = Number(exp.amountJPY) || 0;
    spentByCat[exp.category] = (spentByCat[exp.category] || 0) + amt;
    totalSpentJPY += amt;
  });

  const remainingJPY = budgetData.totalBudgetJPY - totalSpentJPY;

  const categoriesHtml = budgetData.categories.map(c => {
    const spent = spentByCat[c.category] || 0;
    const pct = Math.min(100, Math.round((spent / c.budgetJPY) * 100));
    return `
      <div style="padding:11px 0; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px; gap:8px;">
          <div style="min-width:0;">
            <strong style="font-size:0.92rem; color:var(--text-main);">${c.category}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${c.target}</div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <strong class="tabular" style="font-size:0.93rem; color:var(--vermilion);">$${c.budgetUSD.toLocaleString()}</strong>
            <span class="tabular" style="font-size:0.74rem; color:var(--text-muted); display:block;">¥${c.budgetJPY.toLocaleString()}</span>
          </div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:6px;">${c.strictLimit}</div>
        <div style="height:6px; background:var(--bg-subtle); border-radius:999px; overflow:hidden;">
          <div style="width:${pct}%; height:100%; background:${pct > 90 ? 'var(--vermilion)' : 'var(--matcha)'};"></div>
        </div>
        <div class="tabular" style="display:flex; justify-content:space-between; font-size:0.73rem; color:var(--text-muted); margin-top:4px;">
          <span>Harcanan: ¥${spent.toLocaleString()} ($${Math.round(spent / 150)})</span>
          <span>Kalan: ¥${Math.max(0, c.budgetJPY - spent).toLocaleString()}</span>
        </div>
      </div>
    `;
  }).join('');

  const filteredExpenses = currentBudgetFilter === 'Tümü'
    ? (appState.expenses || [])
    : (appState.expenses || []).filter(e => e.category === currentBudgetFilter);

  const expensesListHtml = filteredExpenses.length === 0
    ? `<p style="font-size:0.82rem; color:var(--text-muted); text-align:center; padding:12px 0;">Bu kategoride henüz harcama kaydı yok.</p>`
    : filteredExpenses.map(e => {
        const realIdx = (appState.expenses || []).findIndex(x => x.id === e.id);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-subtle); font-size:0.84rem; gap:8px;">
            <div style="min-width:0;">
              <strong>${e.title}</strong>
              <span style="font-size:0.73rem; color:var(--text-muted); display:block;">${e.category} • ${e.date}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
              <strong class="tabular" style="color:var(--vermilion);">¥${Number(e.amountJPY).toLocaleString()} ($${Math.round(e.amountJPY / 150)})</strong>
              <button class="delete-exp-btn" onclick="deleteExpense(${realIdx >= 0 ? realIdx : 0})" aria-label="Harcamayı Sil">✕</button>
            </div>
          </div>
        `;
      }).join('');

  container.innerHTML = `
    <div class="section-header-block">
      <span class="section-eyebrow">İki Kişilik Finansal Kontrol</span>
      <h2 class="section-title">Bütçe, Kur &amp; Harcama Defteri</h2>
    </div>

    <div class="grid-2col">
      <div>
        <div class="day-hero" style="margin-bottom:14px;">
          <div class="day-hero-kanji">予算</div>
          <span class="hero-badge">2 KİŞİ TOPLAM HARCAMA LİMİTİ</span>
          <div class="tabular" style="font-size:2rem; font-weight:900; margin:8px 0 4px 0;">
            $${budgetData.totalBudgetUSD.toLocaleString()} USD <span style="font-size:1rem; font-weight:600; opacity:0.8;">(¥${budgetData.totalBudgetJPY.toLocaleString()})</span>
          </div>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-bottom:12px;">
            ${budgetData.planningRate} • Ödenmiş uçaklar, konaklamalar ve alınmış 4 tren bileti hariçtir.
          </div>
          <div class="day-key-grid" style="margin-bottom:0;">
            <div>
              <span class="day-key-label">Kayıtlı Harcama</span>
              <span class="day-key-val tabular">¥${totalSpentJPY.toLocaleString()} (~$${Math.round(totalSpentJPY / 150)})</span>
            </div>
            <div>
              <span class="day-key-label">Kalan Bütçe</span>
              <span class="day-key-val tabular" style="color:#34d399;">¥${remainingJPY.toLocaleString()} (~$${Math.round(remainingJPY / 150)})</span>
            </div>
          </div>
        </div>

        <div class="editorial-card">
          <h3 style="font-size:0.96rem; font-weight:800; margin-bottom:10px;">Suica / ICOCA &amp; Ortak Nakit Kasası</h3>
          <div class="wallet-mini-grid">
            <div class="wallet-box">
              <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:block;">HASAN IC KART</span>
              <strong class="tabular" style="font-size:1.05rem; color:var(--sky);">¥${(appState.icBalances?.hasan || 0).toLocaleString()}</strong>
              <div class="stepper-row">
                <button class="stepper-btn" onclick="adjustWalletBalance('hasan', -500)">-500</button>
                <button class="stepper-btn" onclick="adjustWalletBalance('hasan', 1000)">+1K</button>
              </div>
            </div>
            <div class="wallet-box">
              <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:block;">EŞİ IC KART</span>
              <strong class="tabular" style="font-size:1.05rem; color:var(--sky);">¥${(appState.icBalances?.es || 0).toLocaleString()}</strong>
              <div class="stepper-row">
                <button class="stepper-btn" onclick="adjustWalletBalance('es', -500)">-500</button>
                <button class="stepper-btn" onclick="adjustWalletBalance('es', 1000)">+1K</button>
              </div>
            </div>
            <div class="wallet-box">
              <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); display:block;">ORTAK NAKİT</span>
              <strong class="tabular" style="font-size:1.05rem; color:var(--matcha);">¥${(appState.icBalances?.cashJPY || 0).toLocaleString()}</strong>
              <div class="stepper-row">
                <button class="stepper-btn" onclick="adjustWalletBalance('cashJPY', -1000)">-1K</button>
                <button class="stepper-btn" onclick="adjustWalletBalance('cashJPY', 5000)">+5K</button>
              </div>
            </div>
          </div>
        </div>

        <div class="editorial-card">
          <h3 style="font-size:0.96rem; font-weight:800; margin-bottom:10px;">Kategori Dağılımı ($9,000)</h3>
          ${buildBudgetDonutSvg(budgetData.categories)}
        </div>

        <div class="editorial-card">
          <h3 style="font-size:0.96rem; font-weight:800; margin-bottom:8px;">Hızlı Kur Çevirici (1$ = 150¥)</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:0.7rem; font-weight:800; color:var(--text-muted);">JAPON YENİ (¥)</label>
              <input type="number" id="calc-jpy" class="search-input tabular" style="padding:9px 12px; margin-top:3px;" placeholder="Örn: 177920" oninput="convertFromJPY(this.value)">
            </div>
            <div>
              <label style="font-size:0.7rem; font-weight:800; color:var(--text-muted);">USD ($)</label>
              <input type="number" id="calc-usd" class="search-input tabular" style="padding:9px 12px; margin-top:3px;" placeholder="Örn: 1186" oninput="convertFromUSD(this.value)">
            </div>
          </div>
          <div id="calc-taxfree-hint" style="font-size:0.78rem; color:var(--matcha); font-weight:700; margin-top:8px;">
            Tutar girdiğinizde %10 vergi iadesi sonrası net maliyet burada görünür.
          </div>
        </div>
      </div>

      <div>
        <div class="editorial-card">
          <h3 style="font-size:1rem; font-weight:800; margin-bottom:8px;">Harcama Kaydet</h3>
          <div class="pill-filter-row" style="margin-bottom:10px;">
            <button class="filter-pill-btn" onclick="quickAddPreset('Öğle / Akşam Yemeği', 'Yeme - İçme & Günlük Market', 2200)">+¥2.200 Yemek</button>
            <button class="filter-pill-btn" onclick="quickAddPreset('Suica / ICOCA Yükleme', 'Kalan Ulaşım, IC Kart & Giriş Ücretleri', 2000)">+¥2.000 IC</button>
            <button class="filter-pill-btn" onclick="quickAddPreset('7-Eleven / Market Sepeti', 'Yeme - İçme & Günlük Market', 800)">+¥800 Market</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
            <input type="text" id="exp-title" class="search-input" style="padding:9px 12px;" placeholder="Açıklama (Örn: Yodobashi Fujifilm Kit)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <select id="exp-cat" class="search-input" style="padding:9px 10px;">
                ${budgetData.categories.map(c => `<option value="${c.category}">${c.category}</option>`).join('')}
              </select>
              <input type="number" id="exp-jpy" class="search-input tabular" style="padding:9px 12px;" placeholder="Tutar (JPY ¥)">
            </div>
            <button class="hdr-btn hdr-primary" onclick="addExpense()" style="justify-content:center; border-radius:var(--radius-md); min-height:44px;">
              Harcamayı Bütçeye İşle
            </button>
          </div>

          <div class="pill-filter-row" style="margin-bottom:6px;">
            <button class="filter-pill-btn ${currentBudgetFilter === 'Tümü' ? 'active' : ''}" onclick="filterBudgetExpenses('Tümü')">Tümü</button>
            ${budgetData.categories.map(c => `<button class="filter-pill-btn ${currentBudgetFilter === c.category ? 'active' : ''}" onclick="filterBudgetExpenses('${escapeAttr(c.category)}')">${c.category.split('&')[0].split('(')[0].trim()}</button>`).join('')}
          </div>
          ${expensesListHtml}
        </div>

        <div class="editorial-card">
          <h3 style="font-size:1rem; font-weight:800; margin-bottom:6px;">Kategori Hedefleri &amp; Sınırlar</h3>
          ${categoriesHtml}
        </div>
      </div>
    </div>
  `;
}

function adjustWalletBalance(key, delta) {
  if (!appState.icBalances) appState.icBalances = { hasan: 3000, es: 3000, cashJPY: 35000 };
  appState.icBalances[key] = Math.max(0, (Number(appState.icBalances[key]) || 0) + delta);
  saveMasterState();
  renderBudget();
}
function filterBudgetExpenses(cat) { currentBudgetFilter = cat; renderBudget(); }
function quickAddPreset(title, category, amountJPY) {
  appState.expenses.unshift({ id: Date.now(), title, category, amountJPY, date: new Date().toLocaleDateString('tr-TR') });
  saveMasterState();
  renderBudget();
  showToast(`+${title} (¥${amountJPY.toLocaleString()}) eklendi`);
}

function convertFromJPY(val) {
  const jpy = parseFloat(val);
  const usdEl = document.getElementById('calc-usd');
  const hintEl = document.getElementById('calc-taxfree-hint');
  if (isNaN(jpy)) { if (usdEl) usdEl.value = ''; return; }
  const usd = (jpy / 150).toFixed(2);
  if (usdEl) usdEl.value = usd;
  const netJpy = Math.round(jpy / 1.1);
  const refundJpy = jpy - netJpy;
  if (hintEl) {
    hintEl.innerHTML = `<span class="tabular">¥${jpy.toLocaleString()} = $${usd} USD • Tax-Free iade (~¥${refundJpy.toLocaleString()}) sonrası net: <strong>¥${netJpy.toLocaleString()} ($${(netJpy / 150).toFixed(0)})</strong></span>`;
  }
}

function convertFromUSD(val) {
  const usd = parseFloat(val);
  const jpyEl = document.getElementById('calc-jpy');
  const hintEl = document.getElementById('calc-taxfree-hint');
  if (isNaN(usd)) { if (jpyEl) jpyEl.value = ''; return; }
  const jpy = Math.round(usd * 150);
  if (jpyEl) jpyEl.value = jpy;
  if (hintEl) hintEl.innerHTML = `<span class="tabular">$${usd} USD = <strong>¥${jpy.toLocaleString()} JPY</strong> (Kur: 1$ = 150¥)</span>`;
}

function addExpense() {
  const titleEl = document.getElementById('exp-title');
  const catEl = document.getElementById('exp-cat');
  const jpyEl = document.getElementById('exp-jpy');
  if (!titleEl || !jpyEl || !jpyEl.value) {
    showToast('Lütfen tutar (JPY) girin');
    return;
  }
  appState.expenses.unshift({
    id: Date.now(),
    title: titleEl.value || 'Harcama',
    category: catEl ? catEl.value : 'Yeme - İçme & Günlük Market',
    amountJPY: Number(jpyEl.value),
    date: new Date().toLocaleDateString('tr-TR')
  });
  saveMasterState();
  renderBudget();
  showToast('Harcama bütçeye işlendi');
}

function deleteExpense(idx) {
  appState.expenses.splice(idx, 1);
  saveMasterState();
  renderBudget();
  showToast('Harcama kaydı silindi');
}

// ==========================================================================
// TAB 5: REHBER (TIPS + CHECKLIST + .ICS & MAP TOOLS)
// ==========================================================================

function renderGuide() {
  const container = document.getElementById('guide-container');
  if (!container) return;

  const headerHtml = `
    <div class="section-header-block">
      <span class="section-eyebrow">Saha Bilgi Bankası &amp; Araçlar</span>
      <h2 class="section-title">Rehber, Kontrol &amp; Takvim</h2>
    </div>
    <div class="subtab-seg">
      <button class="subtab-seg-btn ${currentGuideSubtab === 'tips' ? 'active' : ''}" onclick="switchGuideSubtab('tips')">Saha Sırları</button>
      <button class="subtab-seg-btn ${currentGuideSubtab === 'checklist' ? 'active' : ''}" onclick="switchGuideSubtab('checklist')">Kontrol Listesi</button>
      <button class="subtab-seg-btn ${currentGuideSubtab === 'tools' ? 'active' : ''}" onclick="switchGuideSubtab('tools')">Takvim &amp; Harita Araçları</button>
    </div>
  `;

  if (currentGuideSubtab === 'tips') {
    const categories = ['Tümü', ...new Set(proTipsData.map(t => t.category))];
    const filtered = currentTipCategory === 'Tümü' ? proTipsData : proTipsData.filter(t => t.category === currentTipCategory);
    container.innerHTML = `
      ${headerHtml}
      <div class="pill-filter-row">
        ${categories.map(cat => `<button class="filter-pill-btn ${cat === currentTipCategory ? 'active' : ''}" onclick="filterProTips('${cat}')">${cat}</button>`).join('')}
      </div>
      <div class="grid-2col">
        ${filtered.map(tip => `
          <div class="editorial-card" style="margin-bottom:0;">
            <div style="margin-bottom:6px;"><span class="stop-cat-tag" style="background:var(--vermilion-soft); color:var(--vermilion);">${tip.category}</span></div>
            <h3 style="font-size:1.02rem; font-weight:800; margin-bottom:5px;">${tip.title}</h3>
            <p style="font-size:0.84rem; color:var(--text-secondary); line-height:1.55;">${tip.desc}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (currentGuideSubtab === 'checklist') {
    const doneCount = checklistData.filter(i => appState.checklist[i.id]).length;
    const pct = checklistData.length ? Math.round((doneCount / checklistData.length) * 100) : 0;
    container.innerHTML = `
      ${headerHtml}
      <div class="editorial-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px;">
          <div>
            <span class="section-eyebrow" style="color:var(--matcha);">Eksiksiz Hazırlık</span>
            <h3 style="font-size:1.12rem; font-weight:800;">Seyahat Öncesi Kontroller</h3>
          </div>
          <span class="halal-verify-badge tabular">%${pct} (${doneCount}/${checklistData.length})</span>
        </div>
        <div style="height:7px; background:var(--bg-subtle); border-radius:999px; overflow:hidden; margin-bottom:12px;">
          <div style="width:${pct}%; height:100%; background:var(--matcha); transition:width 0.3s;"></div>
        </div>
        ${checklistData.map(item => {
          const isChecked = !!appState.checklist[item.id];
          return `
            <label class="touch-check-row" for="chk-${item.id}">
              <input type="checkbox" id="chk-${item.id}" ${isChecked ? 'checked' : ''} onchange="toggleMainCheck('${item.id}')" style="accent-color:var(--matcha);">
              <span style="flex:1;">
                <span style="font-weight:700; display:block; ${isChecked ? 'text-decoration:line-through; opacity:0.55;' : ''}">${item.text}</span>
                <span style="font-size:0.74rem; color:var(--text-muted);">${item.category}</span>
              </span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else {
    container.innerHTML = `
      ${headerHtml}
      <div class="grid-2col">
        <div class="editorial-card" style="border-left:4px solid var(--shinkansen); margin-bottom:0;">
          <span class="section-eyebrow" style="color:var(--shinkansen);">Takvim Entegrasyonu</span>
          <h3 style="font-size:1.04rem; font-weight:800; margin-bottom:4px;">Kritik Saatleri Apple Takvim’e (.ics) Aktar</h3>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">
            4 alınmış treni (Nozomi 379, Sagano 7, Aoniyoshi, Nozomi 250), 20 Kas 14:00 Heiwajima Onsen son kayıt saatini ve 25 Kas 18:00 Rikugien ışıklandırmasını alarmlarıyla tek dosyada ekler.
          </p>
          <button class="hdr-btn hdr-primary" onclick="downloadTripICS()" style="width:100%; justify-content:center; border-radius:var(--radius-md); min-height:44px;">
            ${ico('calendar')} <span>Japonya_2026_Kritik_Saatler.ics İndir</span>
          </button>
        </div>

        <div class="editorial-card" style="margin-bottom:0;">
          <h3 style="font-size:1.02rem; font-weight:800; margin-bottom:6px;">iPhone Harita Motoru &amp; Taksi Kartı</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">
            Tüm durak bağlantıları şu an <strong>${appState.mapProvider === 'apple' ? 'Apple Maps (iOS)' : 'Google Maps'}</strong> olarak açılır.
          </p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="action-chip map-route" onclick="toggleMapProvider()" style="flex:1; justify-content:center;">${ico('pin')} <span>Google / Apple Değiştir</span></button>
            <button class="action-chip map-place" onclick="openTaxiCardForDay(${currentDayIndex})" style="flex:1; justify-content:center;">${ico('taxi')} <span>Bugünkü Taksi Kartı</span></button>
            <button class="action-chip" onclick="if(typeof window!=='undefined'&&window.print)window.print();" style="flex:1; justify-content:center;">PDF / Yazdır</button>
            <button class="action-chip" onclick="toggleDarkMode()" style="flex:1; justify-content:center;">Tema</button>
            <button class="action-chip" onclick="openSyncModal()" style="flex:1; justify-content:center;">Eşitleme</button>
          </div>
        </div>
      </div>
    `;
  }
}

function switchGuideSubtab(sub) { currentGuideSubtab = sub; renderGuide(); }
function filterProTips(cat) { currentTipCategory = cat; renderGuide(); }
function toggleMainCheck(id) { appState.checklist[id] = !appState.checklist[id]; saveMasterState(); renderGuide(); }

function downloadTripICS() {
  const events = [
    { uid: 'heiwajima-deadline@jp2026', start: '20261120T130000', end: '20261120T140000', summary: 'SON SAAT: Heiwajima Onsen Welcome Course Rezervasyonu', desc: 'QR812 ile 21 Kas gece giriş için online kayıt son saati 14:00 (JST).' },
    { uid: 'rikugien-light@jp2026', start: '20261125T180000', end: '20261125T194500', summary: 'Rikugien Gece Işıklandırması (İlk Gece)', desc: '18:00-20:30 açılış, Komagome İstasyonu.' },
    { uid: 'nozomi379@jp2026', start: '20261127T114600', end: '20261127T140600', summary: 'Nozomi 379: Shinagawa -> Shin-Osaka (ALINMIŞ BİLET)', desc: 'En geç 11:25 te peronda olun.' },
    { uid: 'sagano7@jp2026', start: '20261204T120200', end: '20261204T122500', summary: 'Sagano 7: Torokko Saga -> Torokko Kameoka (ALINMIŞ BİLET)', desc: '11:45 te peronda hazır olun.' },
    { uid: 'aoniyoshi@jp2026', start: '20261207T145500', end: '20261207T152800', summary: 'Aoniyoshi: Kyoto -> Kintetsu-Nara (+Todai-ji 17:00)', desc: '¥730 ek bilet alındı; +¥760 IC kart basılacak. 15:28 sonrası önce Todai-ji ye yürüyün.' },
    { uid: 'nozomi250@jp2026', start: '20261210T113000', end: '20261210T134300', summary: 'Nozomi 250: Kyoto -> Shinagawa (11:30/11:36 Teyit Et)', desc: 'Bilet 11:30 görünse de 2026 JR tarifesi 11:36; 11:15 te peronda olun.' },
    { uid: 'haneda-exit@jp2026', start: '20261212T073500', end: '20261212T103500', summary: 'Haneda T3 Dönüş: Tax-Free Kiosk + Bagaj + 10:35 Uçuş', desc: 'Bagajdan ÖNCE Tax-Free Kiosk! Kahvaltı (Honolu 4F) güvenlik ÖNCESİ!' }
  ];
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Japonya Rehberi 2026//TR', 'CALSCALE:GREGORIAN', 'X-WR-TIMEZONE:Asia/Tokyo'];
  events.forEach(ev => {
    lines.push('BEGIN:VEVENT', 'UID:' + ev.uid, 'DTSTAMP:20261101T000000Z', 'DTSTART;TZID=Asia/Tokyo:' + ev.start, 'DTEND;TZID=Asia/Tokyo:' + ev.end, 'SUMMARY:' + ev.summary, 'DESCRIPTION:' + ev.desc, 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + ev.summary, 'END:VALARM', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');

  if (typeof Blob !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Japonya_2026_Kritik_Saatler.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Takvim (.ics) dosyası indirildi');
  }
  return lines.join('\r\n');
}

// ==========================================================================
// MODALS (CRISIS, WALLET, STAFF CARD, INLINE SYNC)
// ==========================================================================

function openCrisisModal() {
  const modal = document.getElementById('crisis-modal');
  if (!modal) return;
  renderCrisisModal();
  modal.classList.add('open');
}
function closeCrisisModal() { const m = document.getElementById('crisis-modal'); if (m) m.classList.remove('open'); }
function setCrisisMode(mode) { currentCrisisMode = mode; renderCrisisModal(); }

function renderCrisisModal() {
  const body = document.getElementById('crisis-modal-body');
  if (!body) return;

  const day = itineraryData[currentDayIndex] || itineraryData[0];
  const acc = getCurrentAccommodation(currentDayIndex);
  const hourNow = new Date().getHours();
  const isDinnerTime = hourNow >= 15;
  const nearMarketHub = halalData.accommodationMarkets ? (halalData.accommodationMarkets[currentDayIndex < 6 ? 0 : (currentDayIndex < 12 ? 1 : (currentDayIndex < 19 ? 2 : 3))]) : null;
  const firstMarket = nearMarketHub && nearMarketHub.branches ? nearMarketHub.branches[0] : null;
  const optionalStops = (day?.stops || []).filter(s => s.isOptionalDrop);
  const bookedStops = (day?.stops || []).filter(s => s.category === 'booked_train');

  let detailHtml = '';
  if (currentCrisisMode === 'rain') {
    detailHtml = `
      <div class="editorial-card" style="border-left:4px solid var(--sky); margin-bottom:0;">
        <h4 style="font-weight:800; margin-bottom:6px;">${day.date} Yağmur B Planı</h4>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:10px;">${day.rainAlternative}</p>
        <button class="hdr-btn hdr-primary" onclick="toggleDayMode('${day.id}', 'rain'); closeCrisisModal(); switchTab('itinerary');" style="width:100%; justify-content:center;">
          Bugünün Sayfasında Yağmur Modunu Aç
        </button>
      </div>
    `;
  } else if (currentCrisisMode === 'tired') {
    detailHtml = `
      <div class="editorial-card" style="border-left:4px solid var(--gold); margin-bottom:0;">
        <h4 style="font-weight:800; margin-bottom:6px;">Enerji Koruma &amp; Hafifletme</h4>
        <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:8px;">${day.lightenPlan}</p>
        ${firstMarket ? `<div style="font-size:0.82rem; background:var(--card-tint); border:1px solid var(--border); padding:8px 10px; border-radius:8px; margin-bottom:10px;">En yakın konbini/market: <strong>${firstMarket.name}</strong> (${firstMarket.walk})</div>` : ''}
        <div style="display:flex; gap:8px;">
          <button class="action-chip map-place" style="flex:1; justify-content:center;" onclick="toggleDayMode('${day.id}', 'lighten'); closeCrisisModal(); switchTab('itinerary');">Esnek Durağı Çıkar</button>
          <button class="action-chip map-route" style="flex:1; justify-content:center;" onclick="closeCrisisModal(); openTaxiCardForDay(${currentDayIndex});">Taksi Kartı</button>
        </div>
      </div>
    `;
  } else if (currentCrisisMode === 'hungry') {
    const list = isDinnerTime ? (day.dinnerOptions || day.lunchOptions || []) : (day.lunchOptions || []);
    detailHtml = `
      <div class="editorial-card" style="border-left:4px solid var(--matcha); margin-bottom:0;">
        <h4 style="font-weight:800; margin-bottom:8px;">Bugünün Helal Yemek Seçenekleri</h4>
        ${list.map((m, i) => `
          <div style="background:var(--card-tint); border:1px solid var(--border); padding:10px 12px; border-radius:8px; margin-bottom:8px;">
            <strong style="font-size:0.88rem;">${i === 0 ? '1. Ana:' : '2. Yedek:'} ${m.name}</strong>
            <div style="font-size:0.77rem; color:var(--text-muted); margin:2px 0;">${m.hours} • ~¥${m.costPerPersonJPY}/kişi</div>
            <a href="${buildPlaceUrl(m.mapsQuery || m.name)}" target="_blank" rel="noopener noreferrer" class="action-chip map-place" style="margin-top:4px;">${ico('pin')} <span>Konuma Git</span></a>
          </div>
        `).join('')}
        <button class="hdr-btn hdr-primary" style="width:100%; justify-content:center;" onclick="closeCrisisModal(); openStaffModal('私はイスラム教徒です。豚肉とアルコール（みりん・料理酒）を食べることができません。', 'Watashi wa Isuramu-kyōto desu.', 'Ben Müslümanım. Domuz eti ve alkol tüketemiyorum.')">
          Restoranda Gösterilecek Helal Kart
        </button>
      </div>
    `;
  } else if (currentCrisisMode === 'late') {
    detailHtml = `
      <div class="editorial-card" style="border-left:4px solid var(--vermilion); margin-bottom:0;">
        <h4 style="font-weight:800; margin-bottom:6px;">Geç Kaldık — Hangisini Atlayalım?</h4>
        <p style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:8px;">
          ${bookedStops.length ? `Bugün <strong>${bookedStops[0].name} (${bookedStops[0].time})</strong> sabit tren/giriş durağı var!` : 'Bugün sabit tren saati yok; bahçe/tapınak kapanışlarına (16:30–17:00) dikkat edin.'}
        </p>
        <div style="background:var(--vermilion-soft); padding:9px 11px; border-radius:8px; font-size:0.82rem;">
          <strong>İlk Çıkarılacak Durak(lar):</strong><br>
          ${optionalStops.length ? optionalStops.map(o => `• ${o.name} (${o.time})`).join('<br>') : day.lightenPlan}
        </div>
      </div>
    `;
  } else {
    detailHtml = `
      <div class="editorial-card" style="border-left:4px solid var(--shinkansen); margin-bottom:0;">
        <h4 style="font-weight:800; margin-bottom:6px;">Tren Kaçırma &amp; Gece Dönüş Kuralları</h4>
        <ul style="padding-left:18px; font-size:0.82rem; color:var(--text-secondary); line-height:1.55; margin-bottom:10px;">
          <li><strong>Nozomi Shinkansen:</strong> Aynı gün içindeki bir sonraki Nozomi treninin <strong>1–3 numaralı Jiyūseki (自由席 - Serbest Koltuk)</strong> vagonlarına aynı biletle binebilirsiniz.</li>
          <li><strong>Aoniyoshi / Sagano 7:</strong> Ek koltuk ücreti yanar; IC kartınızla normal Kintetsu Express (¥760) veya JR Sagano hattını kullanabilirsiniz.</li>
          <li><strong>Heiwajima Servisi (21 Kas):</strong> 00:40 kaçarsa <strong>01:40</strong> veya <strong>02:40</strong> servisleri T3 1F Group Bus Stop’tan kalkar.</li>
          <li><strong>Son Metro / 23:30+ Dönüş:</strong> Tek tuşla taksi kartını açıp şoföre uzatın.</li>
        </ul>
        <button class="hdr-btn hdr-primary" style="width:100%; justify-content:center;" onclick="closeCrisisModal(); openTaxiCardForDay(${currentDayIndex});">
          Tam Ekran Taksi Adres Kartını Aç (${acc ? acc.city : ''})
        </button>
      </div>
    `;
  }

  body.innerHTML = `
    <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">
      Aktif Gün: <strong>${day.date} • ${day.title}</strong>
    </div>
    <div class="crisis-grid">
      <button class="crisis-option-btn ${currentCrisisMode === 'rain' ? 'active' : ''}" onclick="setCrisisMode('rain')">
        <span>Yağmur Başladı</span><span class="crisis-option-sub">Kapalı B planı</span>
      </button>
      <button class="crisis-option-btn ${currentCrisisMode === 'tired' ? 'active' : ''}" onclick="setCrisisMode('tired')">
        <span>Yorulduk</span><span class="crisis-option-sub">Hafiflet + Yakın Market</span>
      </button>
      <button class="crisis-option-btn ${currentCrisisMode === 'hungry' ? 'active' : ''}" onclick="setCrisisMode('hungry')">
        <span>Acıktık</span><span class="crisis-option-sub">Helal Ana / Yedek</span>
      </button>
      <button class="crisis-option-btn ${currentCrisisMode === 'late' ? 'active' : ''}" onclick="setCrisisMode('late')">
        <span>Geç Kaldık</span><span class="crisis-option-sub">Hangi durak atlanır?</span>
      </button>
      <button class="crisis-option-btn ${currentCrisisMode === 'train' ? 'active' : ''}" onclick="setCrisisMode('train')" style="grid-column:span 2;">
        <span>Treni Kaçırdım / Gece Taksi Kartı Lazım</span><span class="crisis-option-sub">Jiyūseki kuralı &amp; tam ekran Japonca adres kartı</span>
      </button>
    </div>
    ${detailHtml}
  `;
}

function openWalletModal() {
  const modal = document.getElementById('wallet-modal');
  const body = document.getElementById('wallet-modal-body');
  if (!modal || !body) return;

  const ticketsHtml = bookedTicketsData.map(t => `
    <div class="boarding-pass">
      <div class="bp-top">
        <div>
          <div style="font-size:0.71rem; opacity:0.85; font-weight:700;">${t.date} • ${t.operator}</div>
          <div style="font-size:0.98rem; font-weight:900; letter-spacing:0.02em;">${t.trainName}</div>
        </div>
        <span style="background:rgba(255,255,255,0.2); padding:3px 9px; border-radius:999px; font-size:0.7rem; font-weight:800;">${t.statusBadge}</span>
      </div>
      <div class="bp-body">
        <div class="bp-route-row">
          <div>
            <div class="bp-time">${t.depTime}</div>
            <div class="bp-station">${t.depStation}</div>
          </div>
          <div style="text-align:center; flex:1; padding:0 10px;">
            <div class="tabular" style="font-size:0.74rem; font-weight:700; color:var(--shinkansen);">${t.duration}</div>
            <div style="height:2px; background:var(--border-strong); margin:4px 0;"></div>
            <div style="font-size:0.66rem; color:var(--text-muted); font-weight:700;">REZERVE KOLTUK</div>
          </div>
          <div style="text-align:right;">
            <div class="bp-time">${t.arrTime}</div>
            <div class="bp-station">${t.arrStation}</div>
          </div>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); background:var(--card-tint); padding:8px 10px; border-radius:var(--radius-md); margin-bottom:8px;">
          ${t.actionNote}
        </div>
        <button class="action-chip map-route" onclick="closeWalletModal(); switchTab('itinerary'); selectDay(${t.dayIndex});" style="width:100%; justify-content:center;">
          <span>İlgili Günün Rotasına Git</span> ${ico('arrowRight')}
        </button>
      </div>
    </div>
  `).join('');

  const accHtml = accommodationsData.map(a => `
    <div class="editorial-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span class="hero-badge" style="background:var(--indigo);">${a.dates}</span>
        <span style="font-size:0.76rem; font-weight:800; color:var(--vermilion);">${a.city}</span>
      </div>
      <h4 style="font-size:1rem; font-weight:800; margin-bottom:4px;">${a.name}</h4>
      <div style="font-size:0.84rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">${a.addressEn}</div>
      <div style="font-size:0.82rem; color:var(--text-secondary); background:var(--card-tint); padding:6px 9px; border-radius:6px; margin-bottom:6px;">
        Taksi / Görevli: <strong>${a.addressJp}</strong>
      </div>
      <div style="font-size:0.78rem; color:var(--sky); font-weight:700; margin-bottom:4px;">${a.station}</div>
      <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:8px;">${a.notes}</p>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <a href="${buildPlaceUrl(a.mapsQuery)}" target="_blank" rel="noopener noreferrer" class="action-chip map-place" style="flex:1; justify-content:center;">${ico('pin')} <span>Harita</span></a>
        <button class="action-chip" style="flex:1; justify-content:center;" onclick="copyTextQuick('${escapeAttr(a.addressEn + ' (' + a.addressJp + ')')}', 'Adres panoya kopyalandı')">${ico('copy')} <span>Kopyala</span></button>
        <button class="action-chip map-route" style="flex:1; justify-content:center;" onclick="closeWalletModal(); openStaffModal('運転手さん、次の住所までお願いします：\\n${escapeAttr(a.addressJp)}', '${escapeAttr(a.addressEn)}', 'Taksici Kartı: ${escapeAttr(a.name)}');">${ico('taxi')} <span>Taksi</span></button>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px;">
      <h3 style="font-size:0.96rem; font-weight:800; color:var(--shinkansen);">Alınmış Tren Biletlerimiz (4 Sefer)</h3>
      <button class="action-chip map-route" onclick="downloadTripICS()">${ico('calendar')} <span>.ics Ekle</span></button>
    </div>
    ${ticketsHtml}
    <h3 style="font-size:0.96rem; font-weight:800; color:var(--text-main); margin:16px 0 8px 0;">Konaklama Adreslerimiz &amp; Heiwajima Onsen</h3>
    ${accHtml}
  `;

  modal.classList.add('open');
}

function closeWalletModal() { const m = document.getElementById('wallet-modal'); if (m) m.classList.remove('open'); }

function copyTextQuick(text, toastMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(toastMsg)).catch(() => showToast('Kopyalama izni verilemedi'));
  }
}

let currentStaffJapanese = '';
function openStaffModal(jpText, romajiText, trText) {
  currentStaffJapanese = jpText;
  const jpEl = document.getElementById('staff-card-jp');
  const rmEl = document.getElementById('staff-card-romaji');
  const trEl = document.getElementById('staff-card-tr');
  if (jpEl) jpEl.innerHTML = String(jpText || '').replace(/\n/g, '<br>');
  if (rmEl) rmEl.textContent = romajiText || '';
  if (trEl) trEl.textContent = trText || '';
  const modal = document.getElementById('staff-card-modal');
  if (modal) modal.classList.add('open');
}

function closeStaffModal() {
  const modal = document.getElementById('staff-card-modal');
  if (modal) modal.classList.remove('open');
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function speakStaffCard() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    showToast('Sesli okuma desteklenmiyor; ekranı görevliye gösterebilirsiniz.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(currentStaffJapanese);
  utter.lang = 'ja-JP';
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}

function openSyncModal() {
  const modal = document.getElementById('sync-modal');
  const body = document.getElementById('sync-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="editorial-card" style="border-left:4px solid var(--matcha);">
      <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:4px;">Kayıt Durumu: Cihaz İçi + Ortak Eşitleme</h4>
      <p style="font-size:0.82rem; color:var(--text-secondary);">
        Tüm işaretler, restoran seçimleri, harcamalar ve notlar <strong>otomatik olarak bu cihazda</strong> saklanır. Eşinizle senkronize etmek için aşağıdaki araçları kullanabilirsiniz:
      </p>
    </div>

    <div class="editorial-card">
      <h4 style="font-size:0.92rem; font-weight:800; margin-bottom:8px;">1. Tek Dokunuşla WhatsApp / AirDrop Bağlantısı</h4>
      <button class="hdr-btn hdr-primary" onclick="shareSyncLink()" style="width:100%; justify-content:center; border-radius:var(--radius-md); min-height:44px;">
        Eşitleme Bağlantısını Kopyala / Paylaş
      </button>
    </div>

    <div class="editorial-card">
      <h4 style="font-size:0.92rem; font-weight:800; margin-bottom:6px;">2. Satır İçi Yedek Kodu Dışa / İçe Aktar</h4>
      <textarea id="sync-code-area" class="radar-textarea" placeholder="Dışa aktar dediğinizde kod buraya çıkar; eşinizden gelen kodu buraya yapıştırıp Yükle'ye basın."></textarea>
      <div style="display:flex; gap:8px;">
        <button class="action-chip map-place" onclick="exportStateInline()" style="flex:1; justify-content:center;">Kodu Üret &amp; Kopyala</button>
        <button class="action-chip map-route" onclick="importStateInline()" style="flex:1; justify-content:center;">Kodu Yükle</button>
      </div>
    </div>

    <div class="editorial-card" style="margin-bottom:0;">
      <h4 style="font-size:0.92rem; font-weight:800; margin-bottom:4px;">3. Canlı Bulut Senkronizasyon URL’si (İsteğe Bağlı)</h4>
      <input type="url" id="cloud-sync-input" class="search-input" style="padding:8px 12px; margin-bottom:8px;" placeholder="https://proje-adi.firebaseio.com/japonya.json" value="${appState.cloudSyncUrl || ''}">
      <div style="display:flex; gap:8px;">
        <button class="action-chip" onclick="saveCloudSyncUrl()" style="flex:1; justify-content:center;">Kaydet</button>
        <button class="action-chip" onclick="pullFromCloudSync()" style="flex:1; justify-content:center;">Buluttan Çek</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function closeSyncModal() { const m = document.getElementById('sync-modal'); if (m) m.classList.remove('open'); }

function shareSyncLink() {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(appState))));
  const baseUrl = window.location.href.split('#')[0];
  const fullLink = `${baseUrl}#sync=${payload}`;
  if (navigator.share) {
    navigator.share({ title: 'Japonya 2026 Güncel Rehber', text: 'Güncel gezi notlarımız:', url: fullLink }).catch(() => {});
  } else {
    copyTextQuick(fullLink, 'Eşitleme bağlantısı panoya kopyalandı');
    const area = document.getElementById('sync-code-area');
    if (area) area.value = fullLink;
  }
}

function exportStateInline() {
  const jsonStr = JSON.stringify(appState);
  const area = document.getElementById('sync-code-area');
  if (area) area.value = jsonStr;
  copyTextQuick(jsonStr, 'Veri kodu üretildi ve kopyalandı');
}

function importStateInline() {
  const area = document.getElementById('sync-code-area');
  const raw = area ? area.value.trim() : '';
  if (!raw) { showToast('Önce eşinizden gelen veri kodunu yapıştırın'); return; }
  try {
    const parsed = raw.includes('#sync=')
      ? JSON.parse(decodeURIComponent(escape(atob(raw.split('#sync=')[1]))))
      : JSON.parse(raw);
    appState = Object.assign(appState, parsed);
    saveMasterState();
    applyTheme();
    updateMapProviderButton();
    renderDay(currentDayIndex);
    renderHalal();
    renderShopping();
    renderBudget();
    renderGuide();
    closeSyncModal();
    showToast('Veriler başarıyla eşitlendi');
  } catch (e) {
    showToast('Geçersiz veri kodu formatı');
  }
}

function saveCloudSyncUrl() {
  const el = document.getElementById('cloud-sync-input');
  if (el) {
    appState.cloudSyncUrl = el.value.trim();
    saveMasterState();
    showToast(appState.cloudSyncUrl ? 'Canlı bulut senkronizasyonu kaydedildi' : 'Cihaz içi kayıt aktif');
  }
}

async function pushToCloudSync() {
  if (!appState.cloudSyncUrl) return;
  try {
    await fetch(appState.cloudSyncUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appState) });
  } catch (e) {}
}

async function pullFromCloudSync() {
  if (!appState.cloudSyncUrl) { showToast('Önce geçerli bir bulut JSON URL girin'); return; }
  try {
    const res = await fetch(appState.cloudSyncUrl);
    const data = await res.json();
    if (data && typeof data === 'object') {
      const urlKeep = appState.cloudSyncUrl;
      appState = Object.assign(appState, data, { cloudSyncUrl: urlKeep });
      saveMasterState();
      renderDay(currentDayIndex);
      renderHalal();
      renderShopping();
      renderBudget();
      renderGuide();
      showToast('Buluttaki güncel veriler yüklendi');
    }
  } catch (e) {
    showToast('Buluta ulaşılamadı; yerel veri kodunu kullanabilirsiniz');
  }
}

// ==========================================================================
// NAVIGATION & UNIVERSAL SEARCH (Stops + Halal Meals + Shopping + Tips)
// ==========================================================================

function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value.toLowerCase()));
  }
}

function switchTab(tabId) {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('tab-itinerary', 'tab-halal', 'tab-shopping', 'tab-budget', 'tab-guide');
    document.body.classList.add('tab-' + tabId);
  }
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId));
  document.querySelectorAll('.tab-view').forEach(view => view.classList.toggle('active', view.id === `view-${tabId}`));
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSearch(term) {
  const q = (term || '').trim().toLowerCase();
  if (!q) { renderDay(currentDayIndex); return; }

  const stopResults = [];
  const mealResults = [];
  itineraryData.forEach((day, dIdx) => {
    day.stops.forEach(stop => {
      if (`${stop.name} ${stop.details} ${day.title} ${day.city}`.toLowerCase().includes(q)) {
        stopResults.push({ day, stop, dIdx });
      }
    });
    [...(day.lunchOptions || []), ...(day.dinnerOptions || [])].forEach(m => {
      if (`${m.name} ${m.cuisine} ${m.recommendedOrder}`.toLowerCase().includes(q)) {
        mealResults.push({ day, meal: m, dIdx });
      }
    });
  });

  const shopResults = (shoppingData || []).filter(s => `${s.title} ${s.category} ${(s.citiesAndShops || []).join(' ')}`.toLowerCase().includes(q));
  const tipResults = (proTipsData || []).filter(t => `${t.title} ${t.desc} ${t.category}`.toLowerCase().includes(q));

  const container = document.getElementById('day-container');
  if (!container) return;

  const totalHits = stopResults.length + mealResults.length + shopResults.length + tipResults.length;
  if (totalHits === 0) {
    container.innerHTML = `<div class="editorial-card" style="text-align:center; color:var(--text-muted);">"${escapeHtml(q)}" ile eşleşen durak, restoran veya ürün bulunamadı.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-size:0.84rem; font-weight:700; color:var(--text-muted); margin-bottom:12px;">
      "${escapeHtml(q)}" için ${totalHits} sonuç (Durak: ${stopResults.length}, Restoran: ${mealResults.length}, Alışveriş: ${shopResults.length}, İpucu: ${tipResults.length})
    </div>
    <div class="grid-2col">
      ${stopResults.map(r => `
        <div class="editorial-card" style="margin-bottom:0; cursor:pointer;" onclick="document.getElementById('global-search').value=''; selectDay(${r.dIdx});">
          <span class="hero-badge" style="background:var(--indigo); display:inline-block; margin-bottom:6px;">Rota • ${r.day.date} (${r.day.city})</span>
          <h3 style="font-size:0.97rem; font-weight:800;">${r.stop.time} — ${r.stop.name}</h3>
          <p style="font-size:0.81rem; color:var(--text-secondary); margin:4px 0;">${r.stop.details}</p>
          <div style="font-size:0.78rem; font-weight:800; color:var(--vermilion);">Günü Aç →</div>
        </div>
      `).join('')}
      ${mealResults.map(r => `
        <div class="editorial-card" style="margin-bottom:0; cursor:pointer; border-left:4px solid var(--matcha);" onclick="document.getElementById('global-search').value=''; selectDay(${r.dIdx});">
          <span class="halal-verify-badge" style="margin-bottom:6px;">Helal Restoran • ${r.day.date}</span>
          <h3 style="font-size:0.97rem; font-weight:800;">${r.meal.name} (${r.meal.cuisine})</h3>
          <p style="font-size:0.81rem; color:var(--text-secondary); margin:4px 0;">${r.meal.recommendedOrder} • ~¥${r.meal.costPerPersonJPY}/kişi</p>
          <div style="font-size:0.78rem; font-weight:800; color:var(--matcha);">Günün Yemek Planına Git →</div>
        </div>
      `).join('')}
      ${shopResults.map(s => `
        <div class="editorial-card" style="margin-bottom:0; cursor:pointer; border-left:4px solid var(--sky);" onclick="document.getElementById('global-search').value=''; switchTab('shopping');">
          <span class="stop-cat-tag" style="background:var(--sky-soft); color:var(--sky); margin-bottom:6px; display:inline-block;">Alışveriş • ${s.category}</span>
          <h3 style="font-size:0.97rem; font-weight:800;">${s.title}</h3>
          <p style="font-size:0.81rem; color:var(--text-secondary); margin:4px 0;">${s.currentPrice}</p>
          <div style="font-size:0.78rem; font-weight:800; color:var(--sky);">Alışveriş Rehberine Git →</div>
        </div>
      `).join('')}
      ${tipResults.map(t => `
        <div class="editorial-card" style="margin-bottom:0; cursor:pointer;" onclick="document.getElementById('global-search').value=''; switchTab('guide'); switchGuideSubtab('tips');">
          <span class="stop-cat-tag" style="margin-bottom:6px; display:inline-block;">Saha Sırrı • ${t.category}</span>
          <h3 style="font-size:0.97rem; font-weight:800;">${t.title}</h3>
          <p style="font-size:0.81rem; color:var(--text-secondary); margin:4px 0;">${t.desc}</p>
        </div>
      `).join('')}
    </div>
  `;
}

if (typeof window !== 'undefined') {
  if (!window.VAULT_LOCKED_MODE) {
    window.addEventListener('DOMContentLoaded', initApp);
  }
  if (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    window.location &&
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
  ) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
