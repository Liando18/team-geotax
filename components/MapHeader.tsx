import TileLayerButtons from "@/components/TileLayerButtons";
import { Zap, X, Menu } from "lucide-react";

type Props = {
  lat: number;
  lng: number;
  zoom: number;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  tileLayer: string;
  setTileLayer: (layer: string) => void;
};

export default function MapHeader({ 
  lat, 
  lng, 
  zoom, 
  isMobile, 
  sidebarOpen, 
  setSidebarOpen,
  tileLayer,
  setTileLayer
}: Props) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-3 lg:p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3">
          <Zap className="text-yellow-400" size={28} />
          <span className="hidden sm:inline">GeoTax Arutala Map Viewer</span>
          <span className="sm:hidden">GeoTax</span>
        </h1>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <TileLayerButtons tileLayer={tileLayer} setTileLayer={setTileLayer} />

        <div className="border-l border-slate-600 h-8"></div>

        <div className="text-xs lg:text-sm flex gap-2 lg:gap-4 flex-wrap items-center">
          <div className="flex gap-1">
            <span className="text-slate-400">📍 Latitude:</span>
            <span className="font-mono">{lat}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-slate-400">📍 Longitude:</span>
            <span className="font-mono">{lng}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-slate-400">🔍 Zoom:</span>
            <span className="font-mono">{zoom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}