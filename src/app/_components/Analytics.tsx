"use client";

import React, { useMemo } from "react";
import type { Issue } from "@prisma/client";
import { IssueCategory, IssueStatus } from "@prisma/client";

interface AnalyticsProps {
  issues: Issue[];
}

interface CategoryStats {
  category: IssueCategory;
  total: number;
  resolved: number;
  inProgress: number;
  reported: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ issues }) => {
  const stats = useMemo(() => {
    const categoryMap = new Map<IssueCategory, CategoryStats>();

    // Initialize all categories
    Object.values(IssueCategory).forEach((cat) => {
      categoryMap.set(cat, {
        category: cat,
        total: 0,
        resolved: 0,
        inProgress: 0,
        reported: 0,
      });
    });

    // Count issues
    issues.forEach((issue) => {
      const cat = categoryMap.get(issue.category);
      if (cat) {
        cat.total++;
        if (issue.status === IssueStatus.RESOLVED) {
          cat.resolved++;
        } else if (issue.status === IssueStatus.IN_PROGRESS) {
          cat.inProgress++;
        } else {
          cat.reported++;
        }
      }
    });

    // Convert to array and sort by total
    return Array.from(categoryMap.values())
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [issues]);

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === IssueStatus.RESOLVED).length;

  const getCategoryColor = (category: IssueCategory): string => {
    const colors: Record<IssueCategory, string> = {
      CORRUPTION: "bg-red-50 text-red-700",
      POTHOLE: "bg-cyan-50 text-cyan-700",
      WATER: "bg-blue-50 text-blue-700",
      ELECTRICITY: "bg-orange-50 text-orange-700",
      DOMESTIC_VIOLENCE: "bg-purple-50 text-purple-700",
      CRIME: "bg-yellow-50 text-yellow-700",
      SANITATION: "bg-indigo-50 text-indigo-700",
      EDUCATION: "bg-teal-50 text-teal-700",
      HEALTHCARE: "bg-pink-50 text-pink-700",
      ENVIRONMENT: "bg-green-50 text-green-700",
      OTHER: "bg-gray-50 text-gray-700",
    };
    return colors[category];
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-600">Total Issues</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{totalIssues}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-600">Resolved</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{resolvedIssues}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Reported</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Resolved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.length > 0 ? (
              stats.map((stat) => (
                <tr key={stat.category} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                        stat.category
                      )}`}
                    >
                      {stat.category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">
                    {stat.total}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                      {stat.reported}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                      {stat.resolved}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No issues reported yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
