import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  AlignLeft,
  Heading,
  ListPlus,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useNotification } from "../../store/notification";
import { uploadAdminImageApi } from "../../api/endpoints/admin.api";
import SafeImage from "../../components/SafeImage";
import {
  useAdminBlogs,
  useAdminBlog,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "../../hooks/api/useBlogs";

const CATEGORIES = [
  "Tail Lifts",
  "Trailer Parts",
  "Accessories",
  "Tool Boxes",
  "Workshop News",
  "Guides & Advice",
  "Fleet Maintenance",
];

const DEFAULT_FORM = {
  title: "",
  slug: "",
  summary: "",
  excerpt: "",
  category: "Workshop News",
  tag: "Tail Lifts",
  tags: [],
  author: "Aurex Heavy Duty Tech Team",
  readTimeMinutes: 5,
  isPublished: true,
  imageUrl: "",
  body: [
    { p: "" },
  ],
};

export default function BlogEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const fileInputRef = useRef(null);

  // Queries & Mutations
  const { data: allBlogsData } = useAdminBlogs();
  const { data: blogDetailData, isLoading: blogLoading } = useAdminBlog(id, { enabled: isEdit });
  const createBlogMutation = useCreateBlogMutation();
  const updateBlogMutation = useUpdateBlogMutation();

  const allBlogs = useMemo(() => allBlogsData?.blogs || [], [allBlogsData]);

  // Form State
  const [form, setForm] = useState(DEFAULT_FORM);
  const [tagInput, setTagInput] = useState("");
  const [viewTab, setViewTab] = useState("editor"); // 'editor' | 'preview'
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(!isEdit);
  // Snapshot of the form as loaded; anything different counts as unsaved changes.
  const [baseline, setBaseline] = useState(() => JSON.stringify(DEFAULT_FORM));
  const isDirty = useMemo(() => JSON.stringify(form) !== baseline, [form, baseline]);

  // Warn before a reload / tab close / external navigation drops unsaved edits.
  // (The app uses <BrowserRouter>, so router-level blocking via useBlocker isn't available.)
  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const confirmLeave = (e) => {
    if (isDirty && !window.confirm("You have unsaved changes to this article. Leave without saving?")) {
      e.preventDefault();
    }
  };

  // Populate data when editing
  useEffect(() => {
    if (!isEdit || !blogDetailData) return;
    const blog = blogDetailData.blog || blogDetailData;
    if (!blog) return;

    const imgUrl =
      blog.coverImage ||
      blog.img ||
      (typeof blog.coverImageObj === "string" ? blog.coverImageObj : blog.coverImageObj?.url || "");

    const bodySections =
      Array.isArray(blog.body) && blog.body.length > 0
        ? JSON.parse(JSON.stringify(blog.body))
        : blog.content
          ? [{ p: blog.content }]
          : [{ p: "" }];

    const loadedForm = {
      id: blog._id || blog.id || blog.slug,
      title: blog.title || "",
      slug: blog.slug || "",
      summary: blog.summary || blog.excerpt || "",
      excerpt: blog.excerpt || blog.summary || "",
      category: blog.category || "Workshop News",
      tag: blog.tag || (blog.tags && blog.tags[0]) || "Tail Lifts",
      tags: Array.isArray(blog.tags) ? [...blog.tags] : blog.tag ? [blog.tag] : [],
      author: typeof blog.author === "string" ? blog.author : blog.author?.name || "Aurex Heavy Duty Tech Team",
      readTimeMinutes: blog.readTimeMinutes || 5,
      isPublished: blog.isPublished !== false,
      imageUrl: imgUrl,
      body: bodySections,
    };
    setForm(loadedForm);
    setBaseline(JSON.stringify(loadedForm));
    setInitialLoaded(true);
  }, [isEdit, blogDetailData]);

  // Real-time Slug Conflict Detection
  const isSlugConflict = useMemo(() => {
    const cleanSlug = form.slug?.trim().toLowerCase();
    if (!cleanSlug) return false;
    const currentId = form.id || id;
    return allBlogs.some(
      (b) =>
        b.slug?.toLowerCase() === cleanSlug &&
        b._id !== currentId &&
        b.id !== currentId &&
        b.slug !== currentId
    );
  }, [form.slug, form.id, id, allBlogs]);

  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Auto-generate slug when title changes (if not editing an existing custom slug)
  const handleTitleChange = (val) => {
    setForm((prev) => {
      const next = { ...prev, title: val };
      if (!isEdit && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  // Tag Management
  const addTag = (tagToAdd) => {
    const clean = (tagToAdd || "").trim();
    if (!clean) return;
    if (!form.tags.includes(clean)) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, clean],
        tag: prev.tag || clean,
      }));
    }
    setTagInput("");
  };

  const removeTag = (idx) => {
    setForm((prev) => {
      const nextTags = prev.tags.filter((_, i) => i !== idx);
      return {
        ...prev,
        tags: nextTags,
        tag: nextTags[0] || prev.category || "",
      };
    });
  };

  // Cloudinary Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErr("");
    try {
      const uploadedUrl = await uploadAdminImageApi(file);
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        notify.success({
          title: "Image Uploaded",
          message: "Cover photo successfully stored on Cloudinary.",
        });
      } else {
        throw new Error("No URL returned from upload server");
      }
    } catch (uploadErr) {
      console.error("[BlogEditor] Image upload error:", uploadErr);
      setErr("Failed to upload image. You can paste an image URL directly instead.");
      notify.error({
        title: "Upload Failed",
        message: uploadErr?.message || "Could not upload image to Cloudinary.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Section builders
  const addBodyParagraph = () => {
    setForm((prev) => ({
      ...prev,
      body: [...prev.body, { p: "" }],
    }));
  };

  const addBodyHeading = () => {
    setForm((prev) => ({
      ...prev,
      body: [...prev.body, { h: "", p: "" }],
    }));
  };

  const addBodyList = () => {
    setForm((prev) => ({
      ...prev,
      body: [...prev.body, { list: [""] }],
    }));
  };

  const updateBodySection = (index, field, value) => {
    setForm((prev) => {
      const nextBody = [...prev.body];
      nextBody[index] = { ...nextBody[index], [field]: value };
      return { ...prev, body: nextBody };
    });
  };

  const removeBodySection = (index) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body.filter((_, i) => i !== index),
    }));
  };

  const updateListItem = (sectionIndex, itemIndex, value) => {
    setForm((prev) => {
      const nextBody = [...prev.body];
      const nextList = [...(nextBody[sectionIndex].list || [])];
      nextList[itemIndex] = value;
      nextBody[sectionIndex] = { ...nextBody[sectionIndex], list: nextList };
      return { ...prev, body: nextBody };
    });
  };

  const addListItem = (sectionIndex) => {
    setForm((prev) => {
      const nextBody = [...prev.body];
      const nextList = [...(nextBody[sectionIndex].list || []), ""];
      nextBody[sectionIndex] = { ...nextBody[sectionIndex], list: nextList };
      return { ...prev, body: nextBody };
    });
  };

  const removeListItem = (sectionIndex, itemIndex) => {
    setForm((prev) => {
      const nextBody = [...prev.body];
      const nextList = (nextBody[sectionIndex].list || []).filter((_, i) => i !== itemIndex);
      nextBody[sectionIndex] = { ...nextBody[sectionIndex], list: nextList };
      return { ...prev, body: nextBody };
    });
  };

  // Save / Publish
  const handleSave = async (overridePublishState = null) => {
    if (!form.title.trim()) {
      setErr("Headline is required.");
      setViewTab("editor");
      return;
    }

    const finalSlug = form.slug.trim() || slugify(form.title);
    if (!finalSlug) {
      setErr("Storefront Slug (URL) is required.");
      setViewTab("editor");
      return;
    }

    if (isSlugConflict) {
      setErr(`The slug "${finalSlug}" is already in use by another article. Please specify a unique slug.`);
      setViewTab("editor");
      return;
    }

    // Filter empty body blocks
    const cleanedBody = form.body.filter((sec) => {
      if (sec.p && sec.p.trim()) return true;
      if (sec.h && sec.h.trim()) return true;
      if (Array.isArray(sec.list) && sec.list.some((item) => item.trim())) return true;
      return false;
    });

    const isPublishedFinal =
      overridePublishState !== null ? overridePublishState : Boolean(form.isPublished);

    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      summary: form.summary.trim() || form.excerpt.trim(),
      excerpt: form.excerpt.trim() || form.summary.trim(),
      category: form.category || "Workshop News",
      tag: form.tag || form.tags[0] || form.category || "Workshop News",
      tags: form.tags.length > 0 ? form.tags : [form.tag || form.category || "Workshop News"],
      author: { name: form.author.trim() || "Aurex Heavy Duty Tech Team" },
      readTimeMinutes: Number(form.readTimeMinutes) || 5,
      isPublished: isPublishedFinal,
      imageUrl: form.imageUrl.trim(),
      coverImage: form.imageUrl.trim() ? { url: form.imageUrl.trim() } : undefined,
      img: form.imageUrl.trim(),
      body: cleanedBody.length > 0 ? cleanedBody : [{ p: form.summary || form.excerpt || form.title }],
    };

    setSaving(true);
    setErr("");
    try {
      if (isEdit) {
        const idToUpdate = form.id || id;
        await updateBlogMutation.mutateAsync({ id: idToUpdate, ...payload });
        notify.success({
          title: "Article Updated",
          message: `"${payload.title}" has been saved.`,
        });
      } else {
        await createBlogMutation.mutateAsync(payload);
        notify.success({
          title: "Article Created",
          message: `"${payload.title}" is now published and saved in the database.`,
        });
      }
      navigate("/admin/blogs");
    } catch (saveErr) {
      console.error("[BlogEditor] Save error:", saveErr);
      setErr(saveErr?.message || "Failed to save article. Please verify inputs.");
      notify.error({
        title: "Save Failed",
        message: saveErr?.message || "Could not save article.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && blogLoading && !initialLoaded) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-steel">
        <Loader2 size={32} className="animate-spin text-gold" />
        <p className="mt-3 text-sm font-bold">Loading article data from database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist/40 p-4 md:p-6 lg:p-8">
      {/* Top Header / Sticky Bar */}
      <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3.5 backdrop-blur-md shadow-sm rounded-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blogs"
            onClick={confirmLeave}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-steel transition hover:border-gold hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to Articles
          </Link>

          <div className="hidden sm:block h-4 w-px bg-line" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                {isEdit ? "EDITING STORY" : "NEW ARTICLE"}
              </span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${form.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
              >
                {form.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="line-clamp-1 text-base font-extrabold text-ink md:text-lg">
              {form.title || (isEdit ? "Edit Article" : "Draft New Article")}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center rounded-lg border border-line bg-mist p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewTab("editor")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${viewTab === "editor" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
                }`}
            >
              <FileText size={13} /> Story Editor
            </button>
            <button
              type="button"
              onClick={() => setViewTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${viewTab === "preview" ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
                }`}
            >
              <Eye size={13} /> Live Preview
            </button>
          </div>

          {form.slug && (
            <Link
              to={`/news/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy transition hover:border-navy"
              title="Open storefront article"
            >
              Storefront <ExternalLink size={12} />
            </Link>
          )}

          {!form.isPublished && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-extrabold text-steel hover:border-line-dark hover:text-ink disabled:opacity-50"
            >
              Save as Draft
            </button>
          )}

          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-extrabold text-ink shadow-sm transition hover:bg-gold-light active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin text-ink" /> Saving...
              </>
            ) : (
              <>
                <Check size={15} /> {isEdit ? "Save Changes" : "Publish Article"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {err && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 text-red-600" />
          <span>{err}</span>
        </div>
      )}

      {/* VIEW 1: STORY EDITOR */}
      {viewTab === "editor" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* Main Left Editor Column */}
          <div className="space-y-6">
            {/* Core Info Card */}
            <div className="rounded-2xl border border-line bg-white p-5 md:p-7 shadow-sm">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-steel">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. New Aurex range: tail lifts land in VIC"
                className="h-14 w-full rounded-xl border border-line px-4 text-lg font-black text-ink outline-none transition focus:border-gold md:text-xl"
              />

              {/* Slug Input Group */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-steel">
                    Storefront Slug (URL) *
                  </label>
                  {isSlugConflict && (
                    <span className="font-mono text-[11px] font-bold text-red-500">
                      Slug conflict: already in use!
                    </span>
                  )}
                </div>
                <div
                  className={`flex h-11 w-full overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${isSlugConflict
                      ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                      : "border-line focus-within:border-gold focus-within:ring-gold/20"
                    }`}
                >
                  <span className="flex items-center border-r border-line bg-mist px-3.5 font-mono text-xs font-bold text-steel select-none shrink-0">
                    /news/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="tail-lifts-land-in-vic"
                    className="h-full w-full min-w-0 bg-transparent px-3.5 font-mono text-xs font-bold text-ink outline-none"
                  />
                </div>
                {isSlugConflict ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">
                    Warning: Another article is already using this slug. Slugs must be unique across the site.
                  </p>
                ) : (
                  <p className="mt-1.5 font-mono text-[11px] text-faint">
                    Live route: https://www.aurextruckparts.com.au/news/{form.slug || "article-slug"}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-steel">
                  Lead Excerpt / Summary
                </label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, excerpt: e.target.value, summary: e.target.value }))
                  }
                  placeholder="A concise, punchy 1-2 sentence overview shown on index cards and meta descriptions..."
                  className="w-full rounded-xl border border-line p-3.5 text-xs font-medium leading-relaxed text-ink outline-none transition focus:border-gold"
                />
              </div>
            </div>

            {/* Modular Article Content Builder Card */}
            <div className="rounded-2xl border border-line bg-white p-5 md:p-7 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-ink md:text-lg">
                    Article Content Sections ({form.body.length})
                  </h2>
                  <p className="text-xs text-steel">
                    Compose your editorial story with headings, paragraphs, and technical checklists.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={addBodyParagraph}
                    className="flex items-center gap-1 rounded-lg border border-line bg-mist/60 px-3 py-1.5 text-xs font-bold text-ink transition hover:border-gold hover:bg-white"
                  >
                    <AlignLeft size={13} /> + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={addBodyHeading}
                    className="flex items-center gap-1 rounded-lg border border-line bg-mist/60 px-3 py-1.5 text-xs font-bold text-ink transition hover:border-gold hover:bg-white"
                  >
                    <Heading size={13} /> + Section Heading
                  </button>
                  <button
                    type="button"
                    onClick={addBodyList}
                    className="flex items-center gap-1 rounded-lg border border-line bg-mist/60 px-3 py-1.5 text-xs font-bold text-ink transition hover:border-gold hover:bg-white"
                  >
                    <ListPlus size={13} /> + Checklist Box
                  </button>
                </div>
              </div>

              {/* Blocks list */}
              <div className="space-y-4">
                {form.body.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="relative rounded-xl border border-line bg-mist/20 p-4 transition hover:border-line-dark hover:bg-white"
                  >
                    <div className="mb-2.5 flex items-center justify-between border-b border-line/60 pb-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">
                        Section Block #{sIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBodySection(sIdx)}
                        className="rounded p-1 text-steel hover:bg-red-50 hover:text-red-500"
                        title="Delete block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Section heading if present */}
                    {section.h !== undefined && (
                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-bold text-steel">Section Heading</label>
                        <input
                          type="text"
                          value={section.h || ""}
                          onChange={(e) => updateBodySection(sIdx, "h", e.target.value)}
                          placeholder="e.g. Picking the right capacity for heavy pallet work"
                          className="h-10 w-full rounded-lg border border-line bg-white px-3 text-xs font-bold text-ink outline-none focus:border-gold"
                        />
                      </div>
                    )}

                    {/* Paragraph text */}
                    {section.p !== undefined && (
                      <div>
                        <label className="mb-1 block text-xs font-bold text-steel">Paragraph Text</label>
                        <textarea
                          rows={4}
                          value={section.p || ""}
                          onChange={(e) => updateBodySection(sIdx, "p", e.target.value)}
                          placeholder="Write the paragraph content here..."
                          className="w-full rounded-lg border border-line bg-white p-3 text-xs font-normal leading-relaxed text-ink outline-none focus:border-gold"
                        />
                      </div>
                    )}

                    {/* Checklist items */}
                    {Array.isArray(section.list) && (
                      <div className="mt-3 space-y-2">
                        <label className="block text-xs font-bold text-steel">Checklist Feature Points</label>
                        {section.list.map((item, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-2">
                            <span className="text-gold font-bold">✓</span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateListItem(sIdx, lIdx, e.target.value)}
                              placeholder="e.g. Free VIN and fitment check on every order"
                              className="h-9 flex-1 rounded-lg border border-line bg-white px-3 text-xs text-ink outline-none focus:border-gold"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem(sIdx, lIdx)}
                              className="text-steel hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addListItem(sIdx)}
                          className="mt-1 flex items-center gap-1 text-xs font-bold text-gold hover:underline"
                        >
                          <Plus size={13} /> Add Checklist Item
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Publishing & Visibility Settings */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
                Publishing & Status
              </h3>

              <div className="space-y-4">
                {/* Published toggle */}
                <div className="flex items-center justify-between rounded-xl border border-line bg-mist/30 p-3">
                  <div>
                    <span className="block text-xs font-extrabold text-ink">Storefront Visibility</span>
                    <span className="text-[11px] text-steel">
                      {form.isPublished ? "Visible to public visitors" : "Hidden in drafts"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="publishedSwitch"
                    checked={form.isPublished}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-5 w-5 rounded accent-gold cursor-pointer"
                  />
                </div>

                {/* Read time */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-steel">Estimated Read Time</label>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-steel" />
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={form.readTimeMinutes}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, readTimeMinutes: Number(e.target.value) || 4 }))
                      }
                      className="h-9 w-20 rounded-lg border border-line px-2 text-center text-xs font-bold text-ink outline-none focus:border-gold"
                    />
                    <span className="text-xs text-steel">minutes read</span>
                  </div>
                </div>

                {/* Author */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-steel">Author Signature</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-line px-3 text-xs font-medium text-ink outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image & Cloudinary Media Card */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
                Cover Photo (Cloudinary)
              </h3>

              {/* Big High-Res Preview */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-dashed border-line bg-mist/50">
                {form.imageUrl ? (
                  <>
                    <SafeImage
                      src={form.imageUrl}
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                      fallbackIconSize={36}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black transition"
                      title="Clear photo"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="grid h-full place-items-center p-4 text-center text-xs text-steel">
                    <div>
                      <ImageIcon size={36} className="mx-auto mb-2 text-faint" />
                      <span className="font-bold">No cover image uploaded</span>
                      <p className="mt-1 text-[11px] text-faint">WebP, PNG, or JPG recommended</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="mt-3.5 space-y-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-xs font-extrabold text-ink shadow-sm transition hover:border-gold hover:text-navy disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-gold" /> Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload New Cover Image
                    </>
                  )}
                </button>

                <div>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Or paste Cloudinary URL here..."
                    className="h-9 w-full rounded-lg border border-line bg-mist/30 px-3 text-xs font-medium text-ink outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Categorization Card */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
                Classification & Tags
              </h3>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-steel">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value, tag: prev.tag || e.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-xs font-bold text-ink outline-none focus:border-gold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-steel">Tags</label>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white p-2">
                    {form.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded bg-mist px-2 py-1 text-xs font-bold text-ink"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => removeTag(idx)}
                          className="text-steel hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Type tag & Enter..."
                      className="min-w-28 flex-1 border-none bg-transparent p-1 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE STOREFRONT PREVIEW */}
      {viewTab === "preview" && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-line bg-white p-6 md:p-10 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-steel">
              Storefront Preview: /news/{form.slug || "slug"}
            </span>
            <button
              type="button"
              onClick={() => setViewTab("editor")}
              className="text-xs font-bold text-navy hover:underline"
            >
              ← Return to Story Editor
            </button>
          </div>

          <article>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-primary">
              <span>{form.tag || form.category}</span>
              <span>•</span>
              <span className="text-steel">{form.readTimeMinutes} min read</span>
            </div>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink md:text-4xl">
              {form.title || "Untitled Article"}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-steel">
              {form.excerpt || "Article lead excerpt will render here."}
            </p>

            {form.imageUrl && (
              <div className="my-6 overflow-hidden rounded-xl border border-line bg-mist shadow-sm">
                <SafeImage
                  src={form.imageUrl}
                  alt={form.title}
                  className="aspect-[16/8] w-full object-cover"
                  fallbackIconSize={48}
                />
              </div>
            )}

            <div className="mt-6 space-y-6">
              {form.body.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  {sec.h && <h2 className="text-xl font-black text-ink">{sec.h}</h2>}
                  {sec.p && <p className="text-sm leading-relaxed text-steel">{sec.p}</p>}
                  {Array.isArray(sec.list) && sec.list.length > 0 && (
                    <ul className="mt-3 space-y-1.5 rounded-xl border border-gold/40 bg-gold/5 p-4 text-xs font-semibold text-ink">
                      {sec.list.map((li, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gold font-bold">✓</span>
                          <span>{li}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-line pt-6 text-xs text-faint">
              Written by {form.author} • Aurex Trucks Parts Australia
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
