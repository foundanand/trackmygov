"use client";

import React, { useState } from "react";
import type { CommunityNote } from "@prisma/client";
import { api } from "@/trpc/react";

interface CommunityNotesProps {
  issueId: string;
  notes: CommunityNote[];
  onNoteAdded?: () => void;
}

export const CommunityNotes: React.FC<CommunityNotesProps> = ({
  issueId,
  notes,
  onNoteAdded,
}) => {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createNote = api.communityNote.create.useMutation();
  const rateNote = api.communityNote.rate.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote.mutateAsync({
        content: newNote,
        issueId,
        createdBy: "temp-user-id", // TODO: Replace with actual user ID
      });
      setNewNote("");
      onNoteAdded?.();
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async (
    noteId: string,
    rating: "HELPFUL" | "PARTIALLY_HELPFUL" | "NOT_HELPFUL",
    isHelpful: boolean
  ) => {
    try {
      await rateNote.mutateAsync({
        id: noteId,
        rating,
        isHelpful,
      });
    } catch (error) {
      console.error("Failed to rate note:", error);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const aRating = a.rating === "HELPFUL" ? 3 : a.rating === "PARTIALLY_HELPFUL" ? 2 : 1;
    const bRating = b.rating === "HELPFUL" ? 3 : b.rating === "PARTIALLY_HELPFUL" ? 2 : 1;
    return bRating - aRating;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Community Notes</h2>

      {/* Add New Note Form */}
      <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note to provide context or additional information..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          minLength={10}
        />
        <button
          type="submit"
          disabled={isSubmitting || newNote.trim().length < 10}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? "Adding..." : "Add Note"}
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {sortedNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No community notes yet. Be the first to add one!
          </p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-2 ${
                note.rating === "HELPFUL"
                  ? "bg-green-50 border-green-200"
                  : note.rating === "PARTIALLY_HELPFUL"
                    ? "bg-yellow-50 border-yellow-200"
                    : note.rating === "NOT_HELPFUL"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-sm mb-3">{note.content}</p>

              {/* Rating Badge */}
              {note.rating && (
                <div className="mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      note.rating === "HELPFUL"
                        ? "bg-green-200 text-green-800"
                        : note.rating === "PARTIALLY_HELPFUL"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                    }`}
                  >
                    {note.rating === "HELPFUL"
                      ? "✓ Helpful"
                      : note.rating === "PARTIALLY_HELPFUL"
                        ? "◐ Partially Helpful"
                        : "✗ Not Helpful"}
                  </span>
                </div>
              )}

              {/* Rating Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() =>
                    handleRate(note.id, "HELPFUL", true)
                  }
                  className="text-xs px-3 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50 transition"
                >
                  👍 Helpful ({note.helpful})
                </button>
                <button
                  onClick={() =>
                    handleRate(note.id, "PARTIALLY_HELPFUL", true)
                  }
                  className="text-xs px-3 py-1 rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-50 transition"
                >
                  ◐ Partially ({note.helpful})
                </button>
                <button
                  onClick={() =>
                    handleRate(note.id, "NOT_HELPFUL", false)
                  }
                  className="text-xs px-3 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50 transition"
                >
                  👎 Not Helpful ({note.notHelpful})
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-2 text-xs text-gray-500">
                By {note.createdBy} • {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
