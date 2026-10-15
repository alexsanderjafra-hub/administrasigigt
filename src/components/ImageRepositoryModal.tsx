import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, Check, Image as ImageIcon, Sparkles, Filter } from "lucide-react";
import { imageRepositoryService, SavedImageItem } from "../services/imageRepositoryService";

interface ImageRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCategory?: "logo" | "signature" | "all";
  onSelectImage: (dataUrl: string, category: "logo" | "signature" | "other") => void;
}

export const ImageRepositoryModal: React.FC<ImageRepositoryModalProps> = ({
  isOpen,
  onClose,
  targetCategory = "all",
  onSelectImage,
}) => {
  const [images, setImages] = useState<SavedImageItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "logo" | "signature">(
    targetCategory === "all" ? "all" : targetCategory
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refreshList = () => {
    setImages(imageRepositoryService.getSavedImages());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setActiveTab(targetCategory === "all" ? "all" : targetCategory);
      setSelectedId(null);
    }
  }, [isOpen, targetCategory]);

  if (!isOpen) return null;

  const filteredImages = images.filter((img) => {
    if (activeTab === "all") return true;
    return img.category === activeTab;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const cat = activeTab === "all" ? (targetCategory === "all" ? "logo" : targetCategory) : activeTab;
        const newItem = imageRepositoryService.saveImage(
          dataUrl,
          cat as "logo" | "signature",
          file.name.replace(/\.[^/.]+$/, "")
        );
        refreshList();
        if (newItem) {
          setSelectedId(newItem.id);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Hapus gambar ini dari penampung riwayat?")) {
      imageRepositoryService.deleteImage(id);
      refreshList();
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleConfirmSelect = (item: SavedImageItem) => {
    onSelectImage(item.dataUrl, item.category);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-left font-sans relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                Penampung & Riwayat Gambar
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {images.length} Tersimpan
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih logo atau tanda tangan yang pernah Anda upload sebelumnya tanpa perlu mencari file di laptop lagi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar: Filter Tabs & Upload Button */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({images.length})
            </button>
            <button
              onClick={() => setActiveTab("logo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "logo"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏢 Logo ({images.filter((i) => i.category === "logo").length})
            </button>
            <button
              onClick={() => setActiveTab("signature")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "signature"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ✍️ Tanda Tangan ({images.filter((i) => i.category === "signature").length})
            </button>
          </div>

          <div>
            <input
              type="file"
              id="repo-upload-input"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => document.getElementById("repo-upload-input")?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Upload size={14} />
              <span>Upload Baru ke Penampung</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {filteredImages.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-2xl">
                📂
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800">
                  Belum Ada Gambar di Penampung {activeTab !== "all" ? `(${activeTab === "logo" ? "Logo" : "Tanda Tangan"})` : ""}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Saat Anda upload logo atau tanda tangan di pembuatan SPH, gambarnya akan otomatis tersimpan di sini untuk digunakan berulang kali.
                </p>
              </div>
              <button
                onClick={() => document.getElementById("repo-upload-input")?.click()}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Upload File Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredImages.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleConfirmSelect(item)}
                    className={`group relative bg-white border-2 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer transition-all hover:shadow-lg ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {/* Badge category */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.category === "logo"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        }`}
                      >
                        {item.category === "logo" ? "🏢 Logo" : "✍️ TTD / Stempel"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rose-100 text-rose-600 rounded-lg"
                        title="Hapus dari penampung"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Image Preview Box */}
                    <div className="w-full h-28 bg-slate-100/70 rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-slate-100">
                      <img
                        src={item.dataUrl}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain mx-auto"
                      />
                    </div>

                    {/* Details & Select Button */}
                    <div className="w-full text-center space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={item.title}>
                        {item.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmSelect(item);
                        }}
                        className="w-full py-1.5 px-2 bg-slate-900 group-hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Gunakan Ini</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Klik langsung pada kartu gambar untuk langsung memasangnya pada dokumen.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
