
export const extractCleanAddress = (raw: string | undefined | null): string => {
  if (!raw) return "";
  let text = String(raw).trim();

  // If it is a Google Maps URL or web link
  if (
    text.includes("http://") ||
    text.includes("https://") ||
    text.includes("google.com/maps") ||
    text.includes("goo.gl") ||
    text.includes("maps.app")
  ) {
    try {
      // 1. Check for /place/NAME/
      const placeMatch = text.match(/\/place\/([^/@?]+)/);
      if (placeMatch && placeMatch[1]) {
        let extracted = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ").trim();
        extracted = extracted.replace(/@[^,]+,[^,]+.*/, "").trim();
        if (extracted.length > 2) return extracted;
      }

      // 2. Check for ?q=NAME or query=NAME
      const qMatch = text.match(/[?&](?:q|query)=([^&]+)/);
      if (qMatch && qMatch[1]) {
        let extracted = decodeURIComponent(qMatch[1]).replace(/\+/g, " ").trim();
        if (extracted.length > 2) return extracted;
      }

      // 3. Fallback for search or other url components
      const searchMatch = text.match(/\/search\/([^/@?]+)/);
      if (searchMatch && searchMatch[1]) {
        let extracted = decodeURIComponent(searchMatch[1]).replace(/\+/g, " ").trim();
        if (extracted.length > 2) return extracted;
      }
    } catch (e) {
      console.error("Clean address parse error:", e);
    }
  }

  return text;
};

export const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (error) => reject(error);
  });
};
