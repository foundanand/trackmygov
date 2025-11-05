"use client";

import React, { useCallback, useState, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Autocomplete,
} from "@react-google-maps/api";
import type { Issue } from "@prisma/client";
import type { IssueCategory } from "@prisma/client";

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
  onUpvote?: (issueId: string) => void;
  tempPin?: { lat: number; lng: number } | null;
  upvotedIssues?: Set<string>;
  onLocateMe?: (lat: number, lng: number) => void;
}

export const Map: React.FC<MapProps> = ({
  issues,
  onMarkerClick,
  onMapClick,
  onUpvote,
  tempPin,
  upvotedIssues = new Set(),
  onLocateMe,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: ["places"], // Add places library for geocoding
  });

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categoryColors: Record<string, string> = useMemo(
    () => ({
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
    }),
    []
  );

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
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map?.panTo(pos);
        map?.setZoom(14);
        // Only notify, don't open modal
        onLocateMe?.(pos.lat, pos.lng);
        setIsLocating(false);
      },
      () => {
        setError("Unable to retrieve your location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
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

  const getCategoryColor = useCallback(
    (category: string): string => categoryColors[category as IssueCategory] ?? "#95A5A6",
    [categoryColors]
  );

  // Auto-dismiss error after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-96">Loading map...</div>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Search Box - Responsive */}
      <div className="absolute top-4 left-4 z-50 pointer-events-auto sm:max-w-md" style={{ width: 'calc(100% - 8rem)' }}>
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
            placeholder="Search location..."
            aria-label="Search for a location"
            className="w-full px-4 py-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium text-gray-900 placeholder-gray-500"
          />
        </Autocomplete>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 pointer-events-auto">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Map Controls - Right side */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white p-3 rounded-lg shadow-md hover:bg-gray-100 transition border border-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          title="Find my current location"
          aria-label="Find my current location"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600"
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
          )}
        </button>
      </div>

      {/* Category Legend */}
      <div className="absolute bottom-4 left-4 z-50 bg-white rounded-lg shadow-md pointer-events-auto max-w-xs">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full px-4 py-3 font-medium text-sm flex items-center gap-2 hover:bg-gray-50 rounded-lg transition"
          aria-label="Toggle category legend"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Legend {showLegend ? "▲" : "▼"}
        </button>

        {showLegend && (
          <div className="p-4 border-t space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-label={category.replace(/_/g, " ").toLowerCase()}
                />
                <span className="text-xs text-gray-700 capitalize">
                  {category.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div className="bg-white p-3 rounded-lg shadow-lg w-64">
            <h3 className="font-bold text-sm mb-1">{selectedIssue.title}</h3>
            <p className="text-xs text-gray-600 mb-3">
              {selectedIssue.description.substring(0, 100)}...
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {selectedIssue.category}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {selectedIssue.status}
              </span>
            </div>
            {/* Upvote Button */}
            <button
              onClick={() => {
                onUpvote?.(selectedIssue.id);
                setSelectedIssue(null);
              }}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                upvotedIssues.has(selectedIssue.id)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>👍</span>
              <span>{upvotedIssues.has(selectedIssue.id) ? "Upvoted" : "Upvote"} ({selectedIssue.upvotes})</span>
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
    </div>
  );
};
