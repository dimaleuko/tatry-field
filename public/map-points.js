(() => {
  const home = Object.freeze({
    label: 'НАШ ДОМ',
    name: 'Apartamenty Polana Pająkówka',
    address: 'Pająkówka 11f, 34-511 Kościelisko, Poland',
    lat: 49.29932,
    lon: 19.92026
  });

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  function markerIcon() {
    return L.divIcon({
      className: 'home-marker-wrap',
      html: `<div class="home-map-marker"><span class="home-map-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M3 10.7 12 3l9 7.7v9.8h-6.2v-6.2H9.2v6.2H3z"/></svg></span><span class="home-map-copy"><b>${esc(home.label)}</b><small>PAJĄKÓWKA 11F</small></span></div>`,
      iconSize: [172, 42],
      iconAnchor: [18, 38],
      popupAnchor: [0, -35]
    });
  }

  function popupHtml() {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${home.lat},${home.lon}`;
    return `<div class="home-map-popup"><small>BASE CAMP / ТУТ МЫ ЖИВЁМ</small><strong>${esc(home.name)}</strong><span>${esc(home.address)}</span><a href="${mapUrl}" target="_blank" rel="noopener">ОТКРЫТЬ В GOOGLE MAPS ↗</a></div>`;
  }

  function addHomeMarker(target, { interactive = true } = {}) {
    if (!window.L || !target) return null;
    const marker = L.marker([home.lat, home.lon], {
      icon: markerIcon(),
      interactive,
      keyboard: interactive,
      title: home.name,
      alt: `${home.label}: ${home.name}`,
      zIndexOffset: 900
    });
    if (interactive) marker.bindPopup(popupHtml(), { maxWidth: 280, className: 'home-leaflet-popup' });
    marker.addTo(target);
    return marker;
  }

  window.TatryMapPoints = Object.freeze({ home, addHomeMarker });
})();
