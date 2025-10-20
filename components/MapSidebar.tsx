import {
  MapPin,
  Layers,
  X,
  Upload,
  Search,
  Trash,
  LucideTimerReset,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  sidebarOpen: boolean;
  isMobile: boolean;
  selectedFile: string | null;
  loadGeoJsonFile: (fileName: string) => void;
  handleReset: () => void;
  setSidebarOpen: (open: boolean) => void;
};

type GeoLayer = {
  _id: string;
  name: string;
  filename: string;
  properties: string[];
  createdAt: string;
};

const LAYER_DATA: GeoLayer[] = [];

export default function MapSidebar({
  sidebarOpen,
  isMobile,
  selectedFile,
  loadGeoJsonFile,
  handleReset,
  setSidebarOpen,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLayerId, setDeleteLayerId] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [layers, setLayers] = useState<GeoLayer[]>([]);

  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim()) return layers;
    return layers.filter((layer) =>
      layer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, layers]);

  useEffect(() => {
    fetchLayers();
  }, []);

  const fetchLayers = async () => {
    try {
      const response = await fetch("/api/collects/geo");
      const data = await response.json();
      setLayers(data.geo || []);
    } catch (error) {
      console.error("Error fetching layers:", error);
    }
  };

  const validateGeoJSON = async (file: File) => {
    setUploadError("");
    setUploadWarning("");
    setGeojsonData(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.type !== "FeatureCollection") {
        setUploadError("Format tidak valid: harus FeatureCollection");
        setUploadFile(null);
        return;
      }

      if (!Array.isArray(data.features) || data.features.length === 0) {
        setUploadError("File GeoJSON tidak memiliki features");
        setUploadFile(null);
        return;
      }

      const firstFeature = data.features[0];
      if (!firstFeature.properties) {
        setUploadError("Features tidak memiliki properties");
        setUploadFile(null);
        return;
      }

      const crsName = data.crs?.properties?.name || "";
      if (
        !crsName.includes("CRS84") &&
        !crsName.includes("4326") &&
        !crsName.includes("WGS")
      ) {
        setUploadWarning(
          "⚠️ Peringatan: CRS file bukan EPSG:4326 (WGS 84). Pastikan koordinat sudah benar."
        );
      }

      setGeojsonData(data);
      setUploadFile(file);
    } catch (error) {
      setUploadError("File tidak valid atau bukan GeoJSON");
      setUploadFile(null);
    }
  };

  const getPropertyKeys = () => {
    if (!geojsonData || !geojsonData.features[0]) return [];
    return Object.keys(geojsonData.features[0].properties || {});
  };

  const handleDeleteClick = (layerId: string) => {
    setDeleteLayerId(layerId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteLayerId) return;

    try {
      const response = await fetch("/api/collects/geo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteLayerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Delete error:", error);
        toast.error("Gagal menghapus layer");
        return;
      }

      toast.success("Layer berhasil dihapus!");
      setShowDeleteModal(false);
      setDeleteLayerId(null);
      fetchLayers();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Error: " + error.message);
    }
  };

  const handleUpload = async () => {
    if (!uploadName.trim() || !uploadFile) {
      setUploadError("Nama layer dan file harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const filename = `${uploadName.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}.geojson`;

      const response = await fetch("/api/collects/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadName,
          filename,
          properties: getPropertyKeys(),
          geojsonContent: geojsonData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setUploadError(error.error || "Upload gagal");
        toast.error("Upload gagal: " + (error.error || "Unknown error"));
        setIsLoading(false);
        return;
      }

      setShowUploadModal(false);
      setUploadName("");
      setUploadFile(null);
      setGeojsonData(null);
      setUploadError("");
      setUploadWarning("");
      toast.success("GeoJSON berhasil diupload!");
      setIsLoading(false);

      fetchLayers();
    } catch (error: any) {
      setUploadError("Error: " + error.message);
      toast.error("Error: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed lg:relative right-0 top-0 h-full lg:h-auto w-80 lg:w-72 bg-slate-800 rounded-lg border-2 border-slate-600 shadow-2xl flex flex-col transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-2 hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        )}

        <div className="p-4 overflow-y-auto flex flex-col flex-1">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-400 mt-8 lg:mt-0">
            <Layers size={22} />
            Layer Data
          </h2>

          <div className="mb-4 pb-4 border-y border-slate-600">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition duration-300 flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload GeoJSON
            </button>
          </div>

          <div className="mb-4 relative">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari layer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredLayers.length > 0 ? (
              [...filteredLayers] // salin array agar tidak mutasi data asli
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // urutkan descending
                .map((layer) => (
                  <div
                    key={layer._id}
                    className={`w-full text-sm p-3 rounded-lg transition font-medium flex items-center justify-between gap-3 ${
                      selectedFile === layer.filename
                        ? "bg-green-600"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}>
                    <button
                      onClick={() => {
                        loadGeoJsonFile(layer.filename);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition flex-1 min-w-0">
                      <MapPin size={18} className="flex-shrink-0" />
                      <span className="break-words">{layer.name}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(layer._id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex-shrink-0">
                      <Trash size={16} />
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-slate-400 text-sm text-center py-4">
                Tidak ada layer yang cocok
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-600">
            <button
              onClick={() => {
                handleReset();
                setSearchQuery("");
                if (isMobile) setSidebarOpen(false);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 font-medium transition duration-300 flex items-center justify-center gap-2">
              <LucideTimerReset size={18} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg z-[10000] animate-fade-in ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
          {toast.message}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[9999]">
          <div className="bg-slate-800 rounded-lg border-2 border-slate-600 p-6 w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              Upload GeoJSON
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nama Layer
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama layer..."
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  File GeoJSON
                </label>
                <input
                  type="file"
                  accept=".geojson,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) validateGeoJSON(file);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-700"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-900 bg-opacity-30 border border-red-600 text-red-300 text-sm">
                  {uploadError}
                </div>
              )}

              {uploadWarning && (
                <div className="p-3 rounded-lg bg-yellow-900 bg-opacity-30 border border-yellow-600 text-yellow-300 text-sm">
                  {uploadWarning}
                </div>
              )}

              {geojsonData && getPropertyKeys().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Properties dalam Features:
                  </label>
                  <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                    <div className="flex flex-wrap gap-2">
                      {getPropertyKeys().map((key) => (
                        <span
                          key={key}
                          className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadName("");
                  setUploadFile(null);
                  setGeojsonData(null);
                  setUploadError("");
                  setUploadWarning("");
                }}
                className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition">
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!geojsonData || !uploadName.trim() || isLoading}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[9999]">
          <div className="bg-slate-800 rounded-lg border-2 border-slate-600 p-6 w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hapus Layer</h3>
            <p className="text-slate-300 mb-6">
              Apakah Anda yakin ingin menghapus layer ini?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition">
                Tidak
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
