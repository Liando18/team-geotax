import Head from "next/head";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Team GeoTax Arutala</title>
        <meta
          name="description"
          content="Aplikasi pemetaan geografis terpadu"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <LoadingProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" theme="system" />
        <LoadingOverlay />
      </LoadingProvider>
    </>
  );
}
