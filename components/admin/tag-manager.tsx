"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Tag, Plus, Edit2, Trash2, FileText, Check, AlertTriangle } from "lucide-react";
import { slugifyText } from "@/lib/utils";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}

interface TagManagerProps {
  tags: TagItem[];
  onRefresh: () => void;
}

export function TagManager({ tags, onRefresh }: TagManagerProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    const cleanVal = val.startsWith("#") ? val.slice(1) : val;
    setName(cleanVal);
    if (!slugManuallyEdited) {
      setSlug(slugifyText(cleanVal));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().toLowerCase(),
          slug: slug.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tag");
      }

      toast.success(`Tag "#${data.tag.name}" created!`);
      setName("");
      setSlug("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditSlug(tag.slug);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    if (!editName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim().toLowerCase(),
          slug: editSlug.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update tag");
      }

      toast.success("Tag updated successfully");
      setEditingTag(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update tag");
    } finally {
      setIsUpdating(false);
    }
  };

  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);

  const handleRequestDelete = (tag: TagItem) => {
    setTagToDelete(tag);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    const { id, name } = tagToDelete;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete tag");
      }

      toast.success(data.message || `Tag "#${name}" deleted`);
      setTagToDelete(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Tag Card */}
      <Card className="p-6 bg-card border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Add New Tag</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tag Name *</label>
            <Input
              placeholder="e.g. machine-learning"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">URL Slug (Auto-generated)</label>
            <Input
              placeholder="e.g. machine-learning"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              disabled={isCreating}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isCreating} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              {isCreating ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tag List */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/40 flex items-center justify-between">
          <h3 className="font-semibold text-sm">All Tags ({tags.length})</h3>
        </div>

        {tags.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No tags available. Add your first tag above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="px-6 py-3.5">Tag Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">Associated Blogs</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tags.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                      <span className="text-primary font-bold">#</span>
                      {t.name}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                        {t.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="gap-1 font-medium">
                        <FileText className="h-3 w-3" />
                        {t.postCount} {t.postCount === 1 ? "post" : "posts"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(t)}
                        className="h-8 px-2.5"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === t.id}
                        onClick={() => handleRequestDelete(t)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-8 px-2.5"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {deletingId === t.id ? "Deleting..." : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Tag Modal */}
      <Modal
        isOpen={!!editingTag}
        onClose={() => setEditingTag(null)}
        title={`Edit Tag: #${editingTag?.name}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tag Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isUpdating}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              disabled={isUpdating}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTag(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="gap-2">
              <Check className="h-4 w-4" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Tag Confirmation Modal */}
      <Modal
        isOpen={!!tagToDelete}
        onClose={() => !deletingId && setTagToDelete(null)}
        title="Delete Tag"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Are you sure you want to delete tag <strong className="text-foreground">#{tagToDelete?.name}</strong>?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Associated blog posts will NOT be deleted.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTagToDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting..." : "Delete Tag"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
