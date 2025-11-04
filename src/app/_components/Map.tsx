"use client";

import React, { useCallback, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { Issue } from "@prisma/client";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "600px",
};

// Center on India
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

// Restrict map bounds to India
const indiaBounds = {
  north: 35.5,
  south: 6.5,
  east: 97.5,
  west: 68.0,
};

interface MapProps {
  issues: Issue[];
  onMarkerClick?: (issue: Issue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  tempPin?: { lat: number; lng: number } | null;
}

export const Map: React.FC<MapProps> = ({
  issues,
  onMarkerClick,
  onMapClick,
  tempPin,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: ["places"], // Add places library for geocoding
  });

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      onMapClick?.(event.latLng.lat(), event.latLng.lng());
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      CORRUPTION: "#FF6B6B",
      POTHOLE: "#4ECDC4",
      WATER: "#45B7D1",
      ELECTRICITY: "#FFA502",
      DOMESTIC_VIOLENCE: "#C44569",
      CRIME: "#F7B731",
      SANITATION: "#5F27CD",
      EDUCATION: "#00D2D3",
      HEALTHCARE: "#FF9FF3",
      ENVIRONMENT: "#54A0FF",
      OTHER: "#95A5A6",
    };
    return colors[category] || "#95A5A6";
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-96">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        gestureHandling: "greedy",
        restriction: {
          latLngBounds: indiaBounds,
          strictBounds: false,
        },
        maxZoom: 16,
        minZoom: 3,
      }}
    >
      {/* Temporary pin when user clicks on map */}
      {tempPin && (
        <Marker
          position={{
            lat: tempPin.lat,
            lng: tempPin.lng,
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#FF0000",
            fillOpacity: 0.8,
            strokeColor: "#FFF",
            strokeWeight: 2,
          }}
        />
      )}
      {issues.map((issue) => (
        <Marker
          key={issue.id}
          position={{
            lat: issue.latitude,
            lng: issue.longitude,
          }}
          onClick={() => {
            setSelectedIssue(issue);
            onMarkerClick?.(issue);
          }}
          icon={{
            path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
            fillColor: getCategoryColor(issue.category),
            fillOpacity: 0.9,
            scale: 1.5,
            strokeColor: "#fff",
            strokeWeight: 2,
          }}
        />
      ))}

      {selectedIssue && (
        <InfoWindow
          position={{
            lat: selectedIssue.latitude,
            lng: selectedIssue.longitude,
          }}
          onCloseClick={() => setSelectedIssue(null)}
        >
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs">
            <h3 className="font-bold text-sm mb-1">{selectedIssue.title}</h3>
            <p className="text-xs text-gray-600 mb-2">
              {selectedIssue.description.substring(0, 100)}...
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {selectedIssue.category}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {selectedIssue.status}
              </span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};
