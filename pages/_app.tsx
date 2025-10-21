import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LoadingProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" theme="system" />
      <LoadingOverlay />
    </LoadingProvider>
  );
}
