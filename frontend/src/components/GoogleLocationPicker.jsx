import React, { useEffect, useRef, useState } from "react";

let loader;
function loadMaps(key) {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (!key) return Promise.reject(new Error("Google Maps key is not configured."));
  if (!loader) loader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true; script.onload = () => resolve(window.google); script.onerror = reject;
    document.head.appendChild(script);
  });
  return loader;
}
export default function GoogleLocationPicker({ lat, lng, onChange }) {
  const ref = useRef(null); const mapRef = useRef(null); const markerRef = useRef(null); const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    loadMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY).then((google) => {
      if (cancelled || !ref.current) return;
      const center = { lat: Number(lat ?? 28.6139), lng: Number(lng ?? 77.2090) };
      const map = new google.maps.Map(ref.current, { center, zoom: 15, streetViewControl: false, mapTypeControl: false });
      const marker = new google.maps.Marker({ position: center, map, draggable: true });
      marker.addListener("dragend", () => { const p = marker.getPosition(); onChange({ lat: +p.lat().toFixed(6), lng: +p.lng().toFixed(6) }); });
      map.addListener("click", (e) => { marker.setPosition(e.latLng); onChange({ lat: +e.latLng.lat().toFixed(6), lng: +e.latLng.lng().toFixed(6) }); });
      mapRef.current = map; markerRef.current = marker;
    }).catch(() => setError("Map is unavailable. Check the Google Maps configuration."));
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (mapRef.current && markerRef.current && lat != null && lng != null) { const p={lat:Number(lat),lng:Number(lng)}; markerRef.current.setPosition(p); mapRef.current.panTo(p); } }, [lat,lng]);
  if (error) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>;
  return <div ref={ref} className="h-80 w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-100" />;
}
