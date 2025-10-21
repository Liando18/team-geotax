import { useEffect, useRef, useState } from "react";
import L from "leaflet";

type Props = {
  tileLayer: string;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  setZoom: (zoom: number) => void;
  geoJsonLayer: L.GeoJSON | null;
  setGeoJsonLayer: (layer: L.GeoJSON | null) => void;
  geoJsonFile: string | null;
};

export default function MapContainer({
  tileLayer,
  setLat,
  setLng,
  setZoom,
  geoJsonLayer,
  setGeoJsonLayer,
  geoJsonFile,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const tileLayers: Record<string, any> = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© 2025 GeoTax Arutala",
      maxZoom: 19,
    },
    satelliteLabeled: {
      url: "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      attribution: "© 2025 GeoTax Arutala",
      maxZoom: 20,
    },
    terrain: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: "© 2025 GeoTax Arutala",
      maxZoom: 19,
    },
    voyager: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: "© 2025 GeoTax Arutala",
      maxZoom: 18,
    },
    positron: {
      url: "https://{s}.basemaps.cartocdn.com/positron/{z}/{x}/{y}{r}.png",
      attribution: "© 2025 GeoTax Arutala",
      maxZoom: 19,
    },
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const newMap = L.map(mapRef.current).setView([-0.8947, 100.3357], 11);

    L.tileLayer(tileLayers[tileLayer].url, {
      attribution: tileLayers[tileLayer].attribution,
      maxZoom: tileLayers[tileLayer].maxZoom,
    }).addTo(newMap);

    newMap.on("dragend", () => {
      const center = newMap.getCenter();
      setLat(parseFloat(center.lat.toFixed(4)));
      setLng(parseFloat(center.lng.toFixed(4)));
    });

    newMap.on("zoomend", () => {
      setZoom(newMap.getZoom());
    });

    mapInstanceRef.current = newMap;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [setLat, setLng, setZoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileLayers[tileLayer].url, {
      attribution: tileLayers[tileLayer].attribution,
      maxZoom: tileLayers[tileLayer].maxZoom,
    }).addTo(map);
  }, [tileLayer]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (!geoJsonFile) {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      setGeoJsonLayer(null);
      map.setView([-0.8947, 100.3357], 11);
      return;
    }

    const loadGeoJson = async () => {
      try {
        const response = await fetch(geoJsonFile);
        if (!response.ok) throw new Error(`Failed to fetch ${geoJsonFile}`);

        const geojson = await response.json();

        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        const newLayer = L.geoJSON(geojson, {
          style: {
            color: "#FF6B6B",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popupContent = Object.entries(feature.properties)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join("<br>");
              layer.bindPopup(popupContent);
            }
          },
        }).addTo(map);

        geoJsonLayerRef.current = newLayer;
        setGeoJsonLayer(newLayer);

        const bounds = newLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        } else {
          map.setView([-1.13, 100.17], 11);
        }
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    loadGeoJson();
  }, [geoJsonFile, setGeoJsonLayer]);

  return (
    <div
      ref={mapRef}
      className="flex-1 rounded-lg shadow-2xl border-2 border-slate-600"
      style={{ minHeight: "0" }}
    />
  );
}
