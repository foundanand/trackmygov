"use client";

import React, { useState, useEffect } from "react";
import { IssueCategory } from "@prisma/client";
import { api } from "@/trpc/react";

interface IssueModalProps {
  isOpen: boolean;
  lat: number;
  lng: number;
  onClose: () => void;
  onSubmit?: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  lat,
  lng,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: IssueCategory.OTHER,
    area: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationInfo, setLocationInfo] = useState({
    state: "",
    city: "",
    pincode: "",
  });

  const createIssue = api.issue.create.useMutation();

  // Reverse geocode to get location details
  useEffect(() => {
    if (!isOpen || !lat || !lng) return;

    const reverseGeocode = async () => {
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({
          location: { lat, lng },
        });

        if (result.results && result.results.length > 0) {
          const address = result.results[0];
          
          // Extract location components
          let state = "";
          let city = "";
          let pincode = "";

          address?.address_components?.forEach((component) => {
            if (
              component.types.includes("administrative_area_level_1")
            ) {
              state = component.long_name;
            }
            if (
              component.types.includes("administrative_area_level_2") ||
              component.types.includes("locality")
            ) {
              city = component.long_name;
            }
            if (component.types.includes("postal_code")) {
              pincode = component.long_name;
            }
          });

          setLocationInfo({ state, city, pincode });
          setFormData((prev) => ({ ...prev, area: address?.formatted_address ?? "" }));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    void reverseGeocode();
  }, [isOpen, lat, lng]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Please fill in title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: lat,
        longitude: lng,
        state: locationInfo.state,
        city: locationInfo.city,
        area: formData.area,
        pincode: locationInfo.pincode,
        createdBy: "temp-user-id", // TODO: Replace with actual user ID
        imageUrls: [],
      });

      alert("Issue reported successfully!");
      setFormData({
        title: "",
        description: "",
        category: IssueCategory.OTHER,
        area: "",
      });
      onSubmit?.();
      onClose();
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert("Failed to report issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = Object.values(IssueCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-full md:max-w-lg rounded-t-2xl sm:rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl sm:rounded-t-lg">
          <h2 className="text-lg font-bold">Report an Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Location Info Display */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Location:</span>{" "}
              {locationInfo.city || "Loading..."}, {locationInfo.state || "..."}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Latitude: {lat.toFixed(4)}, Longitude: {lng.toFixed(4)}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of the issue"
              maxLength={100}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              minLength={10}
              required
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
            >
              {isSubmitting ? "Reporting..." : "Report Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
