// src/pages/UploadArtwork.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { createArtwork, uploadImage, getCategoryStats } from "../services/artworkService";
import { useAuth } from "../context/AuthContext";

const categories = [
  "Abstract",
  "Digital",
  "3D",
  "Generative",
  "Illustration",
  "Photography",
  "Animation",
  "Street",
];

export default function UploadArtwork() {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    setStatsLoading(true);
    setStatsError(false);
    getCategoryStats()
      .then(res => {
        if (res?.success) {
          setCategoryStats(res.stats || {});
        } else {
          setStatsError(true);
        }
      })
      .catch(err => {
        console.error("Failed to load category stats:", err);
        setStatsError(true);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  // Get auth state from context - if not logged in, show message
  useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    price: "",
    royalty: "10",
    licenseType: "personal",
    isExclusive: false,
    editionTotal: "1",
    editionNumber: "1",
    file: null,
    imageUrl: "",
    status: "published",
  });

  /* ---------------------------------- styles ---------------------------------- */

  const inputWhite =
    "w-full bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

  const textareaWhite =
    "w-full bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

  /* ---------------------------------- helpers ---------------------------------- */

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Image must be less than 10MB");
    }

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      return toast.error("Only JPG, PNG, GIF, WEBP allowed");
    }

    setFormData((p) => ({ ...p, file }));
    setPreview(URL.createObjectURL(file));
  };

  /* ------------------------- upload image (cookie-based) ------------------------- */
  // Uses the shared api client with cookies and CSRF token
  const uploadImageToBackend = async (file) => {
    // Auth is handled by the api client via cookies
    // No need for manual token handling

    try {
      // Use the artworkService uploadImage function
      // which uses the api client withCredentials and CSRF
      const path = await uploadImage(file);
      return path;
    } catch (error) {
      throw new Error(error?.message || "Image upload failed");
    }
  };

  /* -------------------------------- submit -------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error("Please enter a title");
    if (!formData.category) return toast.error("Please select a category");
    if (!formData.price) return toast.error("Please set a price");

    try {
      setUploading(true);

      let finalImageUrl = "";

      if (formData.file) {
        finalImageUrl = await uploadImageToBackend(formData.file);
      } else {
        const manual = String(formData.imageUrl || "").trim();
        if (manual.startsWith("/uploads/") || manual.startsWith("http")) {
          finalImageUrl = manual;
        }
      }

      if (!finalImageUrl) {
        return toast.error("Please upload an image or provide a valid image URL");
      }

      const editionTotal = Math.max(1, parseInt(formData.editionTotal) || 1);
      const editionNumber = Math.min(editionTotal, Math.max(1, parseInt(formData.editionNumber) || 1));

      const payload = {
        title: formData.title.trim(),
        description: (formData.description || "").trim(),
        price: Number(formData.price),
        currency: "ZAR",
        imageUrl: finalImageUrl,
        category: formData.category || "Other",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        royalty: Number(formData.royalty || 10),
        licenseType: formData.licenseType || "personal",
        isExclusive: Boolean(formData.isExclusive),
        editionTotal,
        editionNumber,
        status: "pending",
      };

      const res = await createArtwork(payload);
      if (!res?.success) throw new Error(res?.message || "Artwork save failed");

      toast.success("Artwork submitted for valuation! Admin will review and publish it.");

      setFormData({
        title: "",
        description: "",
        category: "",
        tags: [],
        price: "",
        royalty: "10",
        licenseType: "personal",
        isExclusive: false,
        file: null,
        imageUrl: "",
        status: "pending",
      });

      setPreview(null);
      setStep(1);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <div className="flex-1 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div className="glass-effect rounded-2xl p-6 md:p-8">
              <h2 className="text-3xl font-bold mb-6">Upload Artwork</h2>

              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500"
                onClick={() => {
                  const input = document.getElementById("file-upload");
                  if (input) input.click();
                }}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Click to choose an image</p>
                    <p className="text-xs text-gray-500 mt-2">Max 10MB</p>
                  </>
                )}
              </div>

              <button type="button" onClick={() => setStep(2)} className="btn-primary mt-6">
                Next
              </button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div className="glass-effect rounded-2xl p-6 md:p-8">
              <input
                className={inputWhite}
                placeholder="Artwork title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />

              <textarea
                className={`${textareaWhite} mt-4`}
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />

              <div className="mt-4">
                <label className="block mb-2 font-medium">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className={inputWhite}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c} {categoryStats[c] ? `(${categoryStats[c]} available)` : ''}
                    </option>
                  ))}
                </select>

                {formData.category && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {statsLoading ? (
                      <span className="text-gray-400 px-1">Loading category info…</span>
                    ) : statsError ? (
                      <span className="text-yellow-400/70 px-1">Could not load category stats</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-purple-600/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12h6m-6-4h6M7 8h.01M7 12h.01M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                        {categoryStats[formData.category]
                          ? `${categoryStats[formData.category]} artwork${categoryStats[formData.category] !== 1 ? 's' : ''} currently in ${formData.category}`
                          : `No artworks yet in ${formData.category} — be the first!`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={() => setStep(3)} className="btn-primary mt-6">
                Next
              </button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div className="glass-effect rounded-2xl p-6 md:p-8">
              <input
                type="number"
                className={inputWhite}
                placeholder="Price (ZAR)"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
              />

              <button type="submit" className="btn-primary mt-6" disabled={uploading}>
                {uploading ? "Uploading..." : "Submit for Valuation"}
              </button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
