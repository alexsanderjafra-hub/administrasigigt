export interface SavedImageItem {
  id: string;
  title: string;
  category: "logo" | "signature" | "other";
  dataUrl: string;
  createdAt: number;
}

const STORAGE_KEY = "garda_quotation_image_repository";

export const imageRepositoryService = {
  getSavedImages: (): SavedImageItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error reading image repository from storage:", e);
      return [];
    }
  },

  saveImage: (
    dataUrl: string,
    category: "logo" | "signature" | "other",
    title?: string
  ): SavedImageItem | null => {
    if (!dataUrl || !dataUrl.startsWith("data:")) return null;
    try {
      const current = imageRepositoryService.getSavedImages();
      // Check if duplicate dataUrl already exists
      const existing = current.find((item) => item.dataUrl === dataUrl);
      if (existing) {
        // Update category if needed and bump timestamp
        const updated = current.map((item) =>
          item.id === existing.id
            ? { ...item, category, createdAt: Date.now() }
            : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { ...existing, category, createdAt: Date.now() };
      }

      const defaultTitle =
        title ||
        (category === "logo"
          ? `Logo Perusahaan (${new Date().toLocaleDateString("id-ID")})`
          : `Tanda Tangan (${new Date().toLocaleDateString("id-ID")})`);

      const newItem: SavedImageItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: defaultTitle,
        category,
        dataUrl,
        createdAt: Date.now(),
      };

      const updated = [newItem, ...current];
      // Limit to max 30 items to avoid localStorage overflow
      if (updated.length > 30) {
        updated.length = 30;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newItem;
    } catch (e) {
      console.error("Error saving to image repository:", e);
      return null;
    }
  },

  deleteImage: (id: string): void => {
    try {
      const current = imageRepositoryService.getSavedImages();
      const updated = current.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error deleting image from repository:", e);
    }
  },

  getLatestImage: (category: "logo" | "signature"): string | null => {
    const images = imageRepositoryService.getSavedImages();
    const match = images.find((item) => item.category === category);
    return match ? match.dataUrl : null;
  },

  seedFromQuotations: (quotations: any[]): void => {
    if (!quotations || !Array.isArray(quotations) || quotations.length === 0) return;
    const current = imageRepositoryService.getSavedImages();
    let hasChanges = false;
    const newItems = [...current];

    quotations.forEach((q) => {
      if (q.compLogoUrl && q.compLogoUrl.startsWith("data:")) {
        if (!newItems.some((item) => item.dataUrl === q.compLogoUrl)) {
          newItems.push({
            id: `img-seed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: q.compName ? `Logo ${q.compName}` : "Logo Perusahaan",
            category: "logo",
            dataUrl: q.compLogoUrl,
            createdAt: q.createdAt || Date.now(),
          });
          hasChanges = true;
        }
      }
      if (q.digitalSignatureUrl && q.digitalSignatureUrl.startsWith("data:")) {
        if (!newItems.some((item) => item.dataUrl === q.digitalSignatureUrl)) {
          newItems.push({
            id: `img-seed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: q.preparedBy ? `TTD ${q.preparedBy}` : "Tanda Tangan Digital",
            category: "signature",
            dataUrl: q.digitalSignatureUrl,
            createdAt: q.createdAt || Date.now(),
          });
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      } catch (e) {
        console.error("Error seeding image repository:", e);
      }
    }
  },
};
