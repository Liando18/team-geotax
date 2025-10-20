type Props = {
  tileLayer: string;
  setTileLayer: (layer: string) => void;
};

export default function TileLayerButtons({ tileLayer, setTileLayer }: Props) {
  const layers = [
    { key: "satelliteLabeled", label: "🛰️ Satellite" },
    { key: "osm", label: "🗺️ OSM" },
    { key: "terrain", label: "⛰️ Terrain" },
    { key: "voyager", label: "🧭 Voyager" },
    { key: "positron", label: "◾ Positron" },
  ];

  const tileLayers: Record<string, any> = {
    osm: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "© OpenStreetMap", maxZoom: 19 },
    satelliteLabeled: { url: "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", attribution: "© GeoTax", maxZoom: 20 },
    terrain: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", attribution: "© GeoTax", maxZoom: 19 },
    voyager: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attribution: "© GeoTax", maxZoom: 18 },
    positron: { url: "https://{s}.basemaps.cartocdn.com/positron/{z}/{x}/{y}{r}.png", attribution: "© GeoTax", maxZoom: 19 },
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {layers.map((l) => (
        <button
          key={l.key}
          onClick={() => setTileLayer(l.key)}
          className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base transition duration-300 ${
            tileLayer === l.key
              ? "bg-yellow-500 text-slate-900 shadow-lg"
              : "bg-slate-700 hover:bg-slate-600"
          }`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
