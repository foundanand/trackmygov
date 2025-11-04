"use client";

import { useState } from "react";
import { Map } from "@/app/_components/Map";
import { IssueModal } from "@/app/_components/IssueModal";
import { api } from "@/trpc/react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { data: issues = [], refetch: refetchIssues } = api.issue.listByLocation.useQuery({
    take: 100,
  });

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Track My Gov</h1>
          <p className="text-gray-600 mt-1">
            Report and track civic issues in your area with community verification
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
              <Map
                issues={issues}
                tempPin={selectedLocation}
                onMapClick={handleMapClick}
                onMarkerClick={(issue) => {
                  // Could navigate to issue detail page
                  console.log("Clicked issue:", issue);
                }}
              />
            </div>
          </div>

          {/* Sidebar - Issue Stats and Filter */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4">Issues Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Issues</span>
                  <span className="font-semibold">{issues.length}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-sm text-blue-800 mb-2">How to Report</h3>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click anywhere on the map</li>
                      <li>A red pin will appear</li>
                      <li>Fill in the issue details</li>
                      <li>Submit your report</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Modal */}
        {selectedLocation && (
          <IssueModal
            isOpen={showModal}
            lat={selectedLocation.lat}
            lng={selectedLocation.lng}
            onClose={() => {
              setShowModal(false);
              setSelectedLocation(null);
            }}
            onSubmit={() => {
              void refetchIssues();
            }}
          />
        )}
      </main>
    </div>
  );
}
