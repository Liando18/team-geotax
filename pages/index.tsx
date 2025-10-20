import dynamic from "next/dynamic";
import { useState } from "react";
import { Inter } from "next/font/google";
import client from "@/lib/mongodb";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import MapHeader from "@/components/MapHeader";
import MapSidebar from "@/components/MapSidebar";

type ConnectionStatus = { isConnected: boolean };
const inter = Inter({ subsets: ["latin"] });

const MapContainer = dynamic(() => import("@/components/MapContainer"), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps<
  ConnectionStatus
> = async () => {
  try {
    await client.connect();
    return { props: { isConnected: true } };
  } catch (e) {
    return { props: { isConnected: false } };
  }
};

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [lat, setLat] = useState(-0.8947);
  const [lng, setLng] = useState(100.3357);
  const [zoom, setZoom] = useState(11);
  const [tileLayer, setTileLayer] = useState("satelliteLabeled");
  const [geoJsonLayer, setGeoJsonLayer] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleReset = () => {
    setLat(-0.8947);
    setLng(100.3357);
    setZoom(11);
    setGeoJsonLayer(null);
    setSelectedFile(null);
  };

  const loadGeoJsonFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white flex flex-col">
      <MapHeader
        lat={lat}
        lng={lng}
        zoom={zoom}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tileLayer={tileLayer}
        setTileLayer={setTileLayer}
      />

      <div className="flex flex-1 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden">
        <MapContainer
          tileLayer={tileLayer}
          setLat={setLat}
          setLng={setLng}
          setZoom={setZoom}
          geoJsonLayer={geoJsonLayer}
          setGeoJsonLayer={setGeoJsonLayer}
          geoJsonFile={selectedFile}
        />

        <MapSidebar
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
          selectedFile={selectedFile}
          loadGeoJsonFile={loadGeoJsonFile}
          handleReset={handleReset}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {!isConnected && (
        <div className="absolute bottom-4 left-4 bg-red-600 px-4 py-2 rounded-lg text-white">
          MongoDB connection failed!
        </div>
      )}
    </div>
  );
}
