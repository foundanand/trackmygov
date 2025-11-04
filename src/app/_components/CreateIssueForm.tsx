"use client";

import React, { useState } from "react";
import { IssueCategory } from "@prisma/client";
import { api } from "@/trpc/react";

interface CreateIssueFormProps {
  initialLat?: number;
  initialLng?: number;
  onSubmit?: () => void;
}

export const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  initialLat,
  initialLng,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: IssueCategory.OTHER,
    latitude: initialLat ?? 0,
    longitude: initialLng ?? 0,
    state: "",
    city: "",
    area: "",
    pincode: "",
    imageUrls: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const createIssue = api.issue.create.useMutation();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.state || !formData.city) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue.mutateAsync({
        ...formData,
        createdBy: "temp-user-id", // TODO: Replace with actual user ID
      });

      setFormData({
        title: "",
        description: "",
        category: IssueCategory.OTHER,
        latitude: initialLat ?? 0,
        longitude: initialLng ?? 0,
        state: "",
        city: "",
        area: "",
        pincode: "",
        imageUrls: [],
      });

      alert("Issue created successfully!");
      onSubmit?.();
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert("Failed to create issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.values(IssueCategory);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Location - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Latitude */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="0.0001"
              required
              placeholder="e.g., 28.7041"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="0.0001"
              required
              placeholder="e.g., 77.1025"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* State and City - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., Delhi"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., New Delhi"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Area and Pincode - 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Area */}
          <div>
            <label className="block text-sm font-medium mb-1">Area</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Connaught Place"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g., 110001"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isSubmitting ? "Creating..." : "Report Issue"}
          </button>
        </div>
      </form>
    </div>
  );
};
