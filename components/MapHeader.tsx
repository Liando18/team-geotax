import TileLayerButtons from "@/components/TileLayerButtons";
import { Zap, X, Menu, LogOut, MapIcon } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

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
  setTileLayer,
}: Props) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logout berhasil");
    setTimeout(() => {
      router.push("/auth/login");
    }, 500);
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-3 lg:p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3">
          <MapIcon className="text-green-400" size={28} />
          <span className="hidden sm:inline">GeoTax Arutala Map Viewer</span>
          <span className="sm:hidden">GeoTax</span>
        </h1>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-600 rounded-lg transition">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition flex items-center gap-2">
            <LogOut size={20} />
            <span className="hidden lg:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
        <div className="w-full lg:w-auto">
          <TileLayerButtons tileLayer={tileLayer} setTileLayer={setTileLayer} />
        </div>

        <div className="hidden lg:block border-l border-slate-600 h-8"></div>

        <div className="text-xs lg:text-sm flex gap-2 lg:gap-4 flex-wrap">
          <div className="flex gap-1">
            <span className="text-slate-400">📍 Lat:</span>
            <span className="font-mono text-xs lg:text-sm">{lat}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-slate-400">📍 Lng:</span>
            <span className="font-mono text-xs lg:text-sm">{lng}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-slate-400">🔍 Z:</span>
            <span className="font-mono text-xs lg:text-sm">{zoom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
