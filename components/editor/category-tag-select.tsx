"use client";

import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function CategoryTagSelect({
  selectedCategory,
  onSelectCategory,
  selectedTags,
  onSelectTags,
}: {
  selectedCategory?: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAvailableTags(data.tags || []))
      .catch(() => {});
  }, []);

  const handleSelectTag = (tagName: string) => {
    const normalized = tagName.toLowerCase();
    if (!selectedTags.includes(normalized)) {
      onSelectTags([...selectedTags, normalized]);
    }
    setTagSearch("");
  };

  const handleRemoveTag = (tagName: string) => {
    onSelectTags(selectedTags.filter((t) => t !== tagName));
  };

  const filteredAvailableTags = availableTags.filter(
    (t) =>
      t.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(t.name.toLowerCase())
  );

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredAvailableTags.length > 0) {
        handleSelectTag(filteredAvailableTags[0].name);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={selectedCategory || ""}
          onChange={(e) => onSelectCategory(e.target.value || null)}
          className="w-full px-3 py-2 border rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
        >
          <option value="">Select a Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tag Select (Select only from existing PostgreSQL tags) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium" htmlFor="tag-search">Tags</label>
          <span className="text-xs text-muted-foreground">
            {selectedTags.length} selected
          </span>
        </div>
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="tag-search"
            type="text"
            placeholder="Search and select existing tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-sm bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filtered suggestions from PostgreSQL tags */}
        {tagSearch.trim() && (
          <div className="border rounded-lg p-2 mb-2 bg-muted/40 max-h-32 overflow-y-auto space-y-1 shadow-sm">
            {filteredAvailableTags.length > 0 ? (
              filteredAvailableTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTag(t.name)}
                  className="w-full text-left text-xs px-2.5 py-1.5 rounded-md hover:bg-background flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">#{t.name}</span>
                  <span className="text-[10px] text-primary font-semibold">+ Add</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground p-1">No matching existing tags found</p>
            )}
          </div>
        )}

        {/* Selected Tags Pills */}
        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive ml-0.5 transition-colors"
                title="Remove tag"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Available Tags Quick Picker */}
        {!tagSearch && availableTags.length > 0 && (
          <div className="mt-2 space-y-1">
            <span className="text-xs text-muted-foreground block">Available tags:</span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-0.5">
              {availableTags
                .filter((t) => !selectedTags.includes(t.name.toLowerCase()))
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTag(t.name)}
                    className="text-xs text-muted-foreground hover:text-primary bg-muted/50 hover:bg-muted px-2 py-0.5 rounded-full transition-colors"
                  >
                    +# {t.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
