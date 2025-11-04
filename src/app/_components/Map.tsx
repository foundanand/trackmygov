"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Autocomplete,
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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map?.panTo(pos);
          map?.setZoom(13);
          onMapClick?.(pos.lat, pos.lng);
        },
        () => {
          alert("Error: Unable to retrieve your location.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        map?.panTo({ lat, lng });
        map?.setZoom(13);
        onMapClick?.(lat, lng);
      }
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
    return colors[category] ?? "#95A5A6";
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-96">Loading map...</div>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Search Box */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "in" },
            fields: ["geometry", "name"],
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-3 rounded-lg shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </Autocomplete>
      </div>

      {/* Locate Me Button */}
      <button
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition"
        title="Locate Me"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      </button>

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
          animation={google.maps.Animation.DROP}
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
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getCategoryColor(issue.category),
            fillOpacity: 0.95,
            scale: 10,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
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
    </div>
  );
};
