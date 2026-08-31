import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  X,
  RotateCw,
  MapPin,
  Clock,
  ShieldCheck,
  Edit3,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  AlertCircle,
  Building,
} from "lucide-react";

export interface GeotagData {
  projectName?: string;
  jobTitle?: string;
  subtitle?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: number;
}

interface GeotagCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoBase64: string) => void;
  initialData?: GeotagData;
}

const COLOR_THEMES = [
  { id: "navy", name: "Navy Blue", bg: "bg-blue-900/90", border: "border-blue-700", hex: "#1e3a8a", accentHex: "#facc15" },
  { id: "slate", name: "Dark Slate", bg: "bg-slate-900/90", border: "border-slate-700", hex: "#0f172a", accentHex: "#38bdf8" },
  { id: "emerald", name: "Emerald", bg: "bg-emerald-950/90", border: "border-emerald-700", hex: "#064e3b", accentHex: "#34d399" },
  { id: "royal", name: "Royal Gold", bg: "bg-amber-950/90", border: "border-amber-700", hex: "#451a03", accentHex: "#fbbf24" },
];

export const GeotagCameraModal: React.FC<GeotagCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  initialData,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Template Customization States (seperti di referensi screenshot)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]);

  // Form Fields for Stamp
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || initialData?.projectName || "Pekerjaan Lapangan");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "Catatan Kerja");
  const [address, setAddress] = useState(initialData?.address || "Sedang mendeteksi lokasi GPS...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  );

  // Real-time Date / Time
  const [currentTime, setCurrentTime] = useState(new Date());
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update initial data if changed
  useEffect(() => {
    if (initialData?.jobTitle || initialData?.projectName) {
      setJobTitle(initialData.jobTitle || initialData.projectName || "Pekerjaan Lapangan");
    }
    if (initialData?.address && initialData.address.trim() !== "") {
      setAddress(initialData.address);
    }
    if (initialData?.latitude && initialData?.longitude) {
      setCoords({ lat: initialData.latitude, lng: initialData.longitude });
    }
  }, [initialData]);

  // Geolocation lookup
  useEffect(() => {
    if (!isOpen) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });

          // Try reverse geocoding via OpenStreetMap Nominatim
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { "Accept-Language": "id" } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                const addr = data.address;
                const road = addr.road || addr.suburb || addr.neighbourhood || addr.village || "";
                const city = addr.city || addr.town || addr.county || addr.city_district || "";
                const state = addr.state || "";
                const postcode = addr.postcode || "";

                const formatted = [road, city, state, postcode].filter(Boolean).join(", ");
                setAddress(formatted || data.display_name);
                return;
              }
            }
          } catch (e) {
            console.warn("Reverse geocode fallback", e);
          }

          // Fallback if reverse geocode fails or project address exists
          if (initialData?.address) {
            setAddress(`${initialData.address} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          } else {
            setAddress(`Lokasi Proyek Lapangan (Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})`);
          }
        },
        (err) => {
          console.warn("Geolocation permission error:", err);
          if (initialData?.address) {
            setAddress(initialData.address);
          } else {
            setAddress("Lokasi Proyek Lapangan (GPS tidak aktif)");
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isOpen, initialData]);

  // Start Camera Stream
  const startCamera = async (facing: "environment" | "user") => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera init failed, trying simpler constraints:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
      } catch (err2: any) {
        console.error("Camera access totally blocked:", err2);
        setCameraError(
          "Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diberikan di browser atau gunakan opsi Unggah Galeri."
        );
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      startCamera(cameraFacing);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, cameraFacing]);

  // Switch between front and rear cameras
  const toggleFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Format Date in Indonesian (e.g., Senin, 31 Agustus 2026)
  const formatDayDate = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // STAMP RENDERER onto Canvas
  const applyGeotagStamp = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    customTime?: Date
  ) => {
    const stampTime = customTime || currentTime;
    const timeStr = formatClock(stampTime);
    const dateStr = formatDayDate(stampTime);

    // Scale factors relative to 1080p
    const scale = Math.max(width / 1080, 0.6);

    // Box dimensions
    const boxWidth = Math.min(width * 0.85, 480 * scale);
    const padding = 20 * scale;
    const boxX = 24 * scale;
    const boxY = height - 260 * scale - 24 * scale;
    const boxHeight = 260 * scale;
    const cornerRadius = 16 * scale;

    // 1. Draw Tag Box Background with Rounded Corners
    ctx.save();
    ctx.fillStyle = selectedTheme.hex + "EE"; // with 93% opacity
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2 * scale;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // 2. Upper Header Section (Job Title & Subtitle + Verification Badge)
    let curY = boxY + padding + 16 * scale;

    if (showLogo || showTitle) {
      // Shield Icon / Logo Badge
      if (showLogo) {
        const iconSize = 28 * scale;
        const iconX = boxX + padding;
        const iconY = curY - 14 * scale;

        // Draw badge background
        ctx.fillStyle = selectedTheme.accentHex;
        ctx.beginPath();
        ctx.roundRect(iconX, iconY, iconSize, iconSize, 6 * scale);
        ctx.fill();

        // Draw checkmark / shield symbol
        ctx.fillStyle = "#0f172a";
        ctx.font = `bold ${16 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", iconX + iconSize / 2, iconY + iconSize / 2);
      }

      // Title & Subtitle text
      const textX = showLogo ? boxX + padding + 36 * scale : boxX + padding;
      ctx.textAlign = "left";

      if (showTitle) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${16 * scale}px sans-serif`;
        // Truncate if too long
        let displayTitle = jobTitle;
        if (displayTitle.length > 30) displayTitle = displayTitle.slice(0, 28) + "...";
        ctx.fillText(displayTitle, textX, curY);
        curY += 18 * scale;
      }

      if (showSubtitle) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = `500 ${12 * scale}px sans-serif`;
        let displaySub = subtitle;
        if (displaySub.length > 35) displaySub = displaySub.slice(0, 33) + "...";
        ctx.fillText(displaySub, textX, curY);
        curY += 16 * scale;
      }
    }

    // 3. Decorative Divider Line (`>>>>>>>>>>>>>>>>>>`)
    curY += 6 * scale;
    ctx.fillStyle = selectedTheme.accentHex;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.fillText(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", boxX + padding, curY);
    curY += 16 * scale;

    // 4. Time & Date Display
    if (showTime) {
      // Big bold Time in accent color (e.g. 18:31)
      ctx.fillStyle = selectedTheme.accentHex;
      ctx.font = `900 ${36 * scale}px sans-serif`;
      ctx.fillText(timeStr, boxX + padding, curY + 18 * scale);

      // Date alongside
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${13 * scale}px sans-serif`;
      ctx.fillText(dateStr, boxX + padding + 110 * scale, curY + 14 * scale);
      curY += 38 * scale;
    }

    // 5. Address & Location
    if (showAddress) {
      // Red locator pin square
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.roundRect(boxX + padding, curY - 2 * scale, 6 * scale, 14 * scale, 2 * scale);
      ctx.fill();

      ctx.fillStyle = "#f1f5f9";
      ctx.font = `500 ${11 * scale}px sans-serif`;

      // Multi-line address wrapping
      const maxTextWidth = boxWidth - padding * 2 - 16 * scale;
      const words = address.split(" ");
      let line = "";
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line, boxX + padding + 14 * scale, curY + 8 * scale);
          line = words[n] + " ";
          curY += 15 * scale;
          lineCount++;
          if (lineCount >= 3) break; // max 3 lines
        } else {
          line = testLine;
        }
      }
      if (lineCount < 3) {
        ctx.fillText(line, boxX + padding + 14 * scale, curY + 8 * scale);
      }
    }

    ctx.restore();
  };

  // Capture Photo from Video Stream
  const handleShutter = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw camera frame (mirror if user-facing)
    ctx.save();
    if (cameraFacing === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // Burn Geotag Stamp onto the image
    applyGeotagStamp(ctx, width, height);

    // Get Base64 image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPreview(dataUrl);
  };

  // Handle image selected from gallery
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw selected image
        ctx.drawImage(img, 0, 0);

        // Apply geotag stamp
        applyGeotagStamp(ctx, img.width, img.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm using the captured photo
  const handleUsePhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden safe-top safe-bottom font-sans">
      {/* Hidden Canvas for High-Resolution Stamping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for Gallery Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallerySelect}
      />

      {/* TOP BAR / CAMERA CONTROLS */}
      <div className="relative z-30 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
        <button
          onClick={onClose}
          className="p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 active:scale-95 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span className="tracking-wide">GPS Timestamp Camera</span>
        </div>

        <div className="flex items-center gap-2">
          {!capturedPreview && (
            <button
              onClick={toggleFacing}
              className="p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 active:scale-95 transition-all"
              title="Ganti Kamera"
            >
              <RotateCw size={20} />
            </button>
          )}
        </div>
      </div>

      {/* VIEWFINDER & LIVE STAMP OVERLAY */}
      <div className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
        {capturedPreview ? (
          // REVIEW MODE
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPreview}
              alt="Hasil Jepretan"
              className="w-full h-full object-contain"
            />
          </div>
        ) : cameraError ? (
          // ERROR / FALLBACK MODE
          <div className="p-8 max-w-md mx-auto text-center space-y-5 text-white">
            <div className="w-16 h-16 mx-auto bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Akses Kamera Terkendala</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cameraError}</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-primary hover:bg-blue-600 active:scale-98 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} />
              <span>Pilih Foto dari Galeri</span>
            </button>
          </div>
        ) : (
          // LIVE CAMERA MODE
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover ${
                cameraFacing === "user" ? "scale-x-[-1]" : ""
              }`}
            />

            {/* LIVE ON-SCREEN GEOTAG STAMP (Mirrors Output) */}
            <div
              className={`absolute bottom-6 left-4 right-4 max-w-sm sm:max-w-md ${selectedTheme.bg} ${selectedTheme.border} border backdrop-blur-md p-4 rounded-2xl shadow-2xl text-white pointer-events-none transition-all`}
            >
              {/* Header: Logo & Title */}
              {(showLogo || showTitle) && (
                <div className="flex items-start gap-3 mb-2">
                  {showLogo && (
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                      ✓
                    </div>
                  )}
                  <div className="min-w-0">
                    {showTitle && (
                      <h4 className="text-sm font-black tracking-tight leading-tight truncate text-white">
                        {jobTitle || "Pekerjaan Lapangan"}
                      </h4>
                    )}
                    {showSubtitle && (
                      <p className="text-[10px] font-bold text-slate-300 tracking-wide truncate">
                        {subtitle || "Catatan Kerja"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Chevron Divider */}
              <div className="text-[9px] font-mono font-black text-amber-400 opacity-80 tracking-tighter mb-2 truncate">
                &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;
              </div>

              {/* Time and Date */}
              {showTime && (
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                    {formatClock(currentTime)}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {formatDayDate(currentTime)}
                  </span>
                </div>
              )}

              {/* Location and Address */}
              {showAddress && (
                <div className="flex items-start gap-2 text-[11px] font-medium text-slate-100 leading-snug">
                  <div className="w-1.5 h-3.5 bg-rose-500 rounded-xs mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{address}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="relative z-30 px-6 py-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-4">
        {capturedPreview ? (
          // Review Mode Buttons
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
            <button
              onClick={() => setCapturedPreview(null)}
              className="py-4 bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={16} />
              <span>Foto Ulang</span>
            </button>
            <button
              onClick={handleUsePhoto}
              className="py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Check size={18} />
              <span>Gunakan Foto</span>
            </button>
          </div>
        ) : (
          // Shutter & Controls
          <div className="flex items-center justify-around max-w-md mx-auto w-full">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 text-white/80 hover:text-white active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/20">
                <ImageIcon size={22} />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase">Galeri</span>
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleShutter}
              disabled={isInitializing || !!cameraError}
              className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl active:scale-90 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full border-4 border-black/80 bg-white group-hover:bg-slate-100 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-900" />
              </div>
            </button>

            {/* Template / Edit Stamp Button */}
            <button
              onClick={() => setShowTemplateEditor(true)}
              className="flex flex-col items-center gap-1.5 text-white/80 hover:text-white active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/20">
                <Sliders size={22} />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase">Templat</span>
            </button>
          </div>
        )}
      </div>

      {/* TEMPLATE / STAMP CUSTOMIZER DRAWER (Mirip Screenshot Gambar 4) */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto space-y-6 text-slate-900 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders size={20} className="text-primary" />
                <h3 className="font-extrabold text-base text-slate-900">Sesuaikan Stempel Geotag</h3>
              </div>
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toggles and Fields */}
            <div className="space-y-4">
              {/* Logo / Badge */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-slate-800">Logo & Badge Verifikasi</span>
                </div>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Judul Pekerjaan */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Judul Pekerjaan / Proyek</label>
                  <input
                    type="checkbox"
                    checked={showTitle}
                    onChange={(e) => setShowTitle(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>
                {showTitle && (
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="misal: Pekerjaan Panel Control"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                )}
              </div>

              {/* Subjudul */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Subjudul / Catatan Kerja</label>
                  <input
                    type="checkbox"
                    checked={showSubtitle}
                    onChange={(e) => setShowSubtitle(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>
                {showSubtitle && (
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="misal: Catatan Kerja / Progress Tahap 1"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                )}
              </div>

              {/* Alamat & GPS Location */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <MapPin size={14} className="text-rose-500" />
                    <span>Alamat & Lokasi Tag</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showAddress}
                    onChange={(e) => setShowAddress(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>
                {showAddress && (
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat lengkap lokasi proyek..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary resize-none"
                  />
                )}
              </div>

              {/* Tanggal & Jam */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock size={16} className="text-amber-500" />
                  <span>Stempel Waktu & Tanggal Realtime</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTime}
                  onChange={(e) => setShowTime(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Pilihan Tema Warna */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                  Pilih Tema Warna Stempel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                        selectedTheme.id === theme.id
                          ? "border-primary bg-primary/5 text-primary shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: theme.hex }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {selectedTheme.id === theme.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Selesai Button */}
            <button
              onClick={() => setShowTemplateEditor(false)}
              className="w-full py-4 bg-primary hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 transition-all"
            >
              Selesai & Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default GeotagCameraModal;
