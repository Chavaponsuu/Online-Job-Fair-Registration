"use client";

import React, { useEffect, useRef } from "react";

type Location = { label: string; address: string };

type Props = {
  locations: Location[];
  height?: string;
  apiKey?: string;
};

export default function GoogleMap({ locations, height = "400px", apiKey }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn("Google Maps API key is not set. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local");
      return;
    }

    const initialize = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      if (!google || !google.maps) {
        console.error("Google Maps JS not available");
        return;
      }

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 13.7563, lng: 100.5018 }, // default to Bangkok
        zoom: 12,
      });

      const geocoder = new google.maps.Geocoder();

      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      locations.forEach((locItem) => {
        const addr = locItem.address;
        if (!addr) return;
        geocoder.geocode({ address: addr }, (results: any, status: string) => {
          if (status === "OK" && results[0]) {
            const loc = results[0].geometry.location;
            const marker = new google.maps.Marker({ position: loc, map, title: locItem.label });
            bounds.extend(loc);
            marker.addListener("click", () => {
              infoWindow.setContent(`<div style="font-weight:600; color:black">${locItem.label}</div><div style="font-size:90% ; color:black">${addr}</div>`);
              infoWindow.open(map, marker);
            });
          } else {
            // silent fail for bad addresses
            // console.warn(`Geocode was not successful for the following reason: ${status}`);
          }
          // after last geocode, fit bounds (best-effort)
          try {
            map.fitBounds(bounds);
          } catch (e) {
            /* ignore */
          }
        });
      });
    };

    if ((window as any).google && (window as any).google.maps) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initialize();
    document.head.appendChild(script);

    return () => {
      // cleanup: try to remove injected script (safe even if not present)
      try {
        if (script && script.parentNode) script.parentNode.removeChild(script);
      } catch (e) {
        /* ignore */
      }
    };
  }, [locations, apiKey]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
