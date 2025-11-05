"use client";

import { useState, useEffect } from "react";
import { Map } from "@/app/_components/Map";
import { IssueModal } from "@/app/_components/IssueModal";
import { Analytics } from "@/app/_components/Analytics";
import { api } from "@/trpc/react";

const UPVOTED_ISSUES_KEY = "trackmygov_upvoted_issues";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [upvotedIssues, setUpvotedIssues] = useState<Set<string>>(new Set());
  
  const { data: issues = [], refetch: refetchIssues } = api.issue.listByLocation.useQuery({
    take: 100,
  });
  
  const upvoteMutation = api.issue.upvote.useMutation();

  // Load upvoted issues from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UPVOTED_ISSUES_KEY);
      if (saved) {
        setUpvotedIssues(new Set(JSON.parse(saved) as string[]));
      }
    } catch (error) {
      console.error('Failed to load upvoted issues:', error);
    }
  }, []);

  // Save upvoted issues to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(UPVOTED_ISSUES_KEY, JSON.stringify(Array.from(upvotedIssues)));
    } catch (error) {
      console.error('Failed to save upvoted issues:', error);
    }
  }, [upvotedIssues]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowModal(true);
  };

  const handleUpvote = async (issueId: string) => {
    try {
      // Generate a unique browser-based user ID
      let browserId = localStorage.getItem('trackmygov_browser_id');
      if (!browserId) {
        browserId = `browser_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('trackmygov_browser_id', browserId);
      }

      await upvoteMutation.mutateAsync({
        issueId,
        userId: browserId,
      });

      // Toggle upvote status in local state
      setUpvotedIssues(prev => {
        const newSet = new Set(prev);
        if (newSet.has(issueId)) {
          newSet.delete(issueId);
        } else {
          newSet.add(issueId);
        }
        return newSet;
      });

      // Refetch issues to get updated counts
      void refetchIssues();
    } catch (error) {
      console.error('Failed to upvote:', error);
      alert('Failed to upvote. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Track My Gov</h1>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
              BETA
            </span>
          </div>
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
                onUpvote={handleUpvote}
                upvotedIssues={upvotedIssues}
                onLocateMe={() => {
                  // Just pan and zoom, don't open modal
                }}
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

      {/* Analytics Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Analytics issues={issues} />
      </section>
    </div>
  );
}
