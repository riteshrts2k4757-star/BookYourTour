import L from 'leaflet';

// 1. Fix Leaflet's default marker icon asset paths for modern bundlers (Vite/Rollup)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 2. Fix: "Error: Map container is already initialized."
// This happens in React 18 StrictMode double-mounting or when React reconciles DOM nodes during re-render
if (typeof window !== 'undefined' && L && L.Map && L.Map.prototype) {
  const originalInitContainer = (L.Map.prototype as any)._initContainer;
  (L.Map.prototype as any)._initContainer = function (id: any) {
    const container = typeof id === 'string' ? document.getElementById(id) : id;
    if (container) {
      if (container._leaflet_id) {
        // Reset container Leaflet ID so initialize() does not throw
        container._leaflet_id = null;
        // Remove stale leftover DOM panes from previous unmount
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    }
    originalInitContainer.call(this, id);
  };
}

export default L;

