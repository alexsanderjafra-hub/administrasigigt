import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config();

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Share server-side Gemini client, always using User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Direct download endpoints for clean App.tsx and project
app.get("/api/download-app-tsx", (req, res) => {
  const filePath = path.join(process.cwd(), "src", "App.tsx");
  res.download(filePath, "App.tsx");
});

app.get("/api/download-clean-tar", (req, res) => {
  const tarPath = "/tmp/clean_source.tar.gz";
  try {
    execSync(`cd "${process.cwd()}" && tar -czf ${tarPath} src package.json tsconfig.json vite.config.ts index.html`);
    res.download(tarPath, "administrasigigt-clean.tar.gz");
  } catch (err) {
    res.status(500).send("Error creating archive: " + err.message);
  }
});

app.post("/api/gemini/generate-boq", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured. Please add it via Settings > Secrets." 
      });
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        projectName: {
          type: Type.STRING,
          description: "Nama produk sistem yang dirancang secara profesional, contoh: 'STP Biofilter 10 m3/hari' atau 'WWTP IPAL Rumah Sakit 25 m3/hari'."
        },
        clientName: {
          type: Type.STRING,
          description: "Nama instansi/perusahaan klien fiktif realistis di Indonesia, contoh: 'PT Sentosa Abadi' atau 'Klinik Prima Husada'."
        },
        projType: {
          type: Type.STRING,
          description: "Jenis sistem. Harus persis bernilai salah satu dari: 'Instalasi STP', 'Instalasi WWTP', 'Fabrikasi Tanki', 'Piping' atau 'service maintenance'."
        },
        capacity: {
          type: Type.STRING,
          description: "Kapasitas aliran fungsional desain, contoh: '10 m³/hari' atau '250 m³/hari'."
        },
        description: {
          type: Type.STRING,
          description: "Penjelasan fungsional ringkas dan sangat profesional tentang sistem ini, keunggulannya, dan fungsinya."
        },
        items: {
          type: Type.ARRAY,
          description: "Daftar komponen peralatan yang dibutuhkan secara lengkap dan fungsional agar sistem limbah atau pengolahan air dapat beroperasi.",
          items: {
            type: Type.OBJECT,
            properties: {
              sku: {
                type: Type.STRING,
                description: "Format rapi: POM-EBARA-50DWX, BLW-FUTSU-TST50, DOS-SEKO-AKS603, PNL-STP-ALTSYS, MED-STP-HONEYCOMB dll."
              },
              name: {
                type: Type.STRING,
                description: "Nama detail barang / alat lengkap tipe & spesifikasi daya."
              },
              brand: {
                type: Type.STRING,
                description: "Merek barang yang terkenal tangguh untuk WWTP/STP, contoh: Ebara, Futsu, Seko, Toyoko, Schneider."
              },
              unit: {
                type: Type.STRING,
                description: "Unit, Set, Pcs, atau Lot."
              },
              priceItem: {
                type: Type.INTEGER,
                description: "Harga pengadaan alat utama dalam Rupiah. Prioritaskan estimasi harga pasar wajar Indonesia yang kompetitif dengan kualitas prima."
              },
              priceService: {
                type: Type.INTEGER,
                description: "Biaya supervisi / jasa engineering teknis per unit dalam Rupiah (bisa 0 jika sudah tercakup atau tidak ada)."
              },
              priceInstallation: {
                type: Type.INTEGER,
                description: "Harga instalasi, perakitan, sipil penyambungan di lokasi lapang per unit dalam Rupiah."
              },
              quantity: {
                type: Type.INTEGER,
                description: "Jumlah unit barang yang rasional dan fungsional (misal pompa pendorong minimal 2 unit agar bisa alternate backup)."
              },
              specifications: {
                type: Type.STRING,
                description: "Spesifikasi teknik rekayasa lengkap dan mendalam (Engineering Specifications) dalam format 'Kunci : Nilai' bersambung baru (multi-line dengan '\\n'). Harus sangat detail dan realistis sesuai tipikal alat WWTP/STP profesional di Indonesia. Masukkan minimal 4 spesifikasi kunci seperti Type/Model, Daya/Power, Kapasitas Aliran/Tekanan, Dimensi/Koneksi, Material, Garansi, & Deskripsi Detail. Contoh:\nModel/Type : Ebara 50DWX 5.4S\nPower/Daya : 0.4 kW, 220V/380V, 1 Phase / 3 Phase, 50Hz\nKapasitas Pompa : Flow Rate 150 Liter/menit, Head Max 8 meter\nMaterial : Casing Stainless Steel AISI 304, Impeller Semi-Open\nKoneksi Discharge : 2 Inch (50 mm)\nFungsi & Performa : Pompa pendorong air limbah dari tangki ekualisasi menuju reaktor aerobik secara kontinu\nGaransi : 12 Bulan garansi mekanikal elektrikal pabrik resmi"
              }
            },
            required: ["sku", "name", "brand", "unit", "priceItem", "priceService", "priceInstallation", "quantity", "specifications"]
          }
        }
      },
      required: ["projectName", "clientName", "projType", "capacity", "description", "items"]
    };

    const systemInstruction = 
      "Anda adalah seorang Engineer Senior dan Project Architect IPAL khusus rekayasa lingkungan air limbah (STP/WWTP/WTP) " +
      "yang bekerja untuk PT. GARDA INOVASI GLOBALTECH di Indonesia. Tugas Anda adalah menerjemahkan kebutuhan fungsional " +
      "yang diajukan pengguna (misal: 'STP IPAL 10 m3/hari' atau 'WWTP IPAL Klinik Medis 5 m3') menjadi rancangan itemized BoQ / " +
      "Bill of Quantities yang lengkap, aman, dan berkelas tinggi.\n\n" +
      "PERSYARATAN UTAMA INTEGRITAS SPESIFIKASI TEKNIS:\n" +
      "- Setiap komponen/alat utama HARUS memiliki rincian 'specifications' yang lengkap, tebal, dan bernilai teknik tinggi.\n" +
      "- Jangan pernah menulis spesifikasi singkat seperti 'Pompa sirkulasi' atau 'Blower'. Tulis spesifikasi lengkap multiline menggunakan '\\n' dan berformat 'Kunci : Nilai'.\n" +
      "- Cantumkan detail akurat seperti: Model/Type, Kapasitas Air/Udara (m3/jam, Liter/menit, mmAq), Konsumsi Daya Listrik (Power dlm kW/HP/Watt, voltase, fasa), Material (Stainless Steel, Cast Iron, PVC), Dimensi Koneksi, Garansi resmi 12 bulan (Warranty), serta deskripsi fungsinya dalam sistem limbah.\n\n" +
      "REFERENSI PRODUK REAL PT. GARDA INOVASI GLOBALTECH (REKOMENDASIKAN INI SAAT MERANCANG):\n" +
      "1. Pompa Submersible Sewage: Tsurumi HS2.4S (0.37 kW, 220V, 1 Phase, 200 Lpm, P: Rp 6.000.000, S: Rp 500.000, I: Rp 1.200.000)\n" +
      "2. Pompa Submersible Heavy-Duty: Ebara Semi-Vortex (0.75 kW, 220V/380V, 240 L/min, P: Rp 18.700.000, S: Rp 1.500.000, I: Rp 2.500.000)\n" +
      "3. Root Blower Aerasi Utama: Longtech LT-80 (15 kW, 16.97 m3/menit, P: Rp 132.000.000, S: Rp 5.000.000, I: Rp 8.000.000) atau Futsu TST-50 (P: Rp 29.800.000)\n" +
      "4. Silent Aeration Blower: Yasunaga LW 300 (155W s.d 230W, 300 Lpm, P: Rp 17.500.000, S: Rp 1.200.000, I: Rp 1.800.000)\n" +
      "5. Tangki Bioreaktor Utama: Tangki Reaktor GIGT FRP (misal kapasitas 20 m3, D.2.30 x P.5.00 x T.2.50 meter, P: Rp 160.000.000, S: Rp 5.000.000, I: Rp 15.000.000)\n" +
      "6. Packaged STP System: MJ-STP15 (Kapasitas 15 m3/hari, P: 6500mm, D: 1750mm, P: Rp 67.500.000), Panel Tank FRP 10 m3 (P: Rp 60.000.000)\n" +
      "7. Tangki Filter Polishing: Nanotech 1665 Sand/Carbon active media (Kapasitas 2.5 - 4.5 m3/jam, multi-valve, P: Rp 9.350.000, S: Rp 650.000, I: Rp 1.200.000)\n" +
      "8. Solenoid Dosing Pump: Seko Diaphragm Chlorinator/PAC (4.7 L/jam, 3 Bar, P: Rp 13.200.000, S: Rp 1.000.000, I: Rp 1.800.000 atau Seko AKS603 P: Rp 9.400.000)\n" +
      "9. Jasa Pengurusan Pertek BMAL (KLHK/DLH): Paket Jasa Legalitas Pertek Pemenuhan BMAL (P: Rp 85.000.000, Ahli Kualitas Air & Lingkungan)\n" +
      "10. Bio-aktivator Limbah: Bakteri Cair Biopro (P: Rp 60.000 / Liter)\n\n" +
      "Sistem STP atau WWTP yang dirancang harus mencakup minimal:\n" +
      "1. Pompa Transfer Air Limbah / Feed Pump (biasanya fungsional alternate backup: minimal 2 unit)\n" +
      "2. Pompa Sludge / Dosing Pump untuk kaporit / koagulan\n" +
      "3. Aeration Blower dengan output udara yang disesuaikan kapasitas\n" +
      "4. Diffuser Aerasi (e.g. Fine Bubble Diffuser 8\" atau 10\" untuk mentransfer oksigen, quantity fungsional berkisar 4 s.d. 30 pcs selesai kapasitas)\n" +
      "5. Media Filter / Media Komunitas Bakteri (e.g. Media Sarang Tawon PVC Honeycomb)\n" +
      "6. Panel Control Listrik Otomatis starter & alternate (Schneider & Omron parts)\n" +
      "7. Opsional: Filter Tank (FRP Tank, Sand & Carbon Filter) jika diminta, atau flow meter air bersih/kotor.\n\n" +
      "INTEGRITAS HARGA:\n" +
      "- Semua estimasi harga (priceItem, priceService, priceInstallation) harus rasional dalam mata uang Rupiah Indonesia (IDR) berdasar harga agen / marketplace di Indonesia (Bekasi, Jakarta, Surabaya).\n" +
      "- Prioritaskan harmoni antara harga yang kompetitif dan kualitas yang andal (tidak menyemburkan angka asal-asalan yang terlalu murah atau tidak masuk akal untuk brand premium seperti Ebara & Futsu).\n" +
      "- Format output harus berupa JSON murni yang sesuai persis dengan responseSchema yang diberikan.";

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[BOQ] Trying model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
        if (response && response.text) {
          console.log(`[BOQ] Successfully completed using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[BOQ] Model ${modelName} failed or is currently busy:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("Semua model AI sedang sibuk. Silakan coba beberapa saat lagi.");
    }

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini BOQ Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate BOQ design via AI" });
  }
});

app.post("/api/gemini/parse-quotation", async (req, res) => {
  try {
    const { fileData, mimeType, rawText, userPrompt } = req.body;
    
    if (!fileData && !rawText) {
      return res.status(400).json({ error: "Silakan unggah dokumen/gambar atau lampirkan teks surat penawaran." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured. Silakan tambahkan kunci di Settings > Secrets." 
      });
    }

    const quoteResponseSchema = {
      type: Type.OBJECT,
      properties: {
        number: {
          type: Type.STRING,
          description: "Nomor surat penawaran (contoh: 025/QT-GIGT/VI/2026). Jika tidak ditemukan, buat format otomatis yang rapi."
        },
        date: {
          type: Type.STRING,
          description: "Tanggal surat penawaran (contoh: 22 Juni 2026). Gunakan format Indonesia yang rapi."
        },
        recipient: {
          type: Type.STRING,
          description: "Nama perusahaan, organisasi, instansi, atau klien penerima penawaran."
        },
        attention: {
          type: Type.STRING,
          description: "Ditujukan kepada siapa (UP / contact person atau nama departemen / bagian)."
        },
        jobDescription: {
          type: Type.STRING,
          description: "Deskripsi singkat pekerjaan / nama proyek utama yang dikerjakan / diserahterimakan."
        },
        items: {
          type: Type.ARRAY,
          description: "Daftar item rincian barang/jasa pekerjaan penawaran.",
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "Nama lengkap barang, tipe, merek, atau jasa pengerjaan."
              },
              vol: {
                type: Type.NUMBER,
                description: "Volume / kuantitas unit."
              },
              unit: {
                type: Type.STRING,
                description: "Satuan (Set, Pcs, Unit, Lot, m3, dll)."
              },
              unitPrice: {
                type: Type.NUMBER,
                description: "Harga satuan produk / jasa dalam Rupiah (tanpa simbol Rp)."
              }
            },
            required: ["description", "vol", "unit", "unitPrice"]
          }
        },
        notes: {
          type: Type.STRING,
          description: "Catatan penawaran tambahan (seperti termin pembayaran, garansi, atau syarat khusus) jika ada."
        }
      },
      required: ["number", "date", "recipient", "attention", "jobDescription", "items"]
    };

    const parts: any[] = [];

    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType
        }
      });
    }

    let instruction = "Anda adalah asisten data khusus yang bertugas mengekstrak rincian surat penawaran (Quotation/BoQ/SPH) dari file/gambar atau teks yang diberikan pengguna.\n" +
                      "Ekstrak data tersebut secara akurat ke dalam format skema JSON yang diberikan:\n" +
                      "- SANGAT PENTING: Dokumen SPH ini terdiri dari banyak halaman/halaman berturut-turut (biasanya hingga 4 lembar atau lebih). Anda WAJIB memeriksa seluruh halaman dari lembar pertama hingga lembar terakhir, dan mengekstrak SETIAP line-item pekerjaan yang tertulis secara lengkap dan menyeluruh tanpa ada satu baris pun yang terlewat!\n" +
                      "- Bersihkan rincian angka belanja agar hanya berupa tipe data NUMBER murni untuk harga satuan ('unitPrice') dan volume ('vol').\n" +
                      "- Jika penerima, nomor penawaran, tanggal, atau deskripsi proyek tidak tertulis jelas, berikan prediksi realistis atau kosongkan/buat nilai default yang berkelas.\n" +
                      "- Jika ada teks tambahan instruksi dari pengguna, ikuti instruksi tersebut.";
    
    if (userPrompt) {
      instruction += `\nKonteks bantuan tambahan dari instansi: ${userPrompt}`;
    }

    if (rawText) {
      parts.push({
        text: `Teks Terlampir untuk Dianalisis:\n${rawText}`
      });
    }

    parts.push({
      text: "Ekstrak penawaran di atas menjadi format data JSON yang rapi."
    });

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Parse] Trying model: ${modelName} for parsing quotation`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: instruction,
            responseMimeType: "application/json",
            responseSchema: quoteResponseSchema,
          }
        });
        if (response && response.text) {
          console.log(`[Parse] Successfully completed extraction with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Parse] Model ${modelName} failed or busy:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("Semua model AI sedang sibuk. Silakan coba beberapa saat lagi.");
    }

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Parse Quotation Error:", error);
    res.status(500).json({ error: error.message || "Gagal menganalisis dokumen penawaran via AI" });
  }
});

app.post("/api/gemini/parse-pdf-financial", async (req, res) => {
  try {
    const { fileData, mimeType, parseType } = req.body;
    
    if (!fileData) {
      return res.status(400).json({ error: "Silakan unggah dokumen PDF terlebih dahulu." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured. Silakan tambahkan kunci di Settings > Secrets." 
      });
    }

    const isDebt = parseType === "debt";

    const financialSchema = {
      type: Type.ARRAY,
      description: "Daftar transaksi keuangan yang berhasil diekstrak dari PDF log rekening bank.",
      items: {
        type: Type.OBJECT,
        properties: {
          customId: { type: Type.STRING, description: "ID Transaksi, contoh: BNK-010626-001 (untuk OUT) atau INC-010626-001 (untuk IN). Buat berurutan sesuai baris." },
          date: { type: Type.STRING, description: "Tanggal transaksi dalam format YYYY-MM-DD" },
          type: { type: Type.STRING, enum: ["IN", "OUT"] },
          flowType: { type: Type.STRING, enum: ["IN", "OUT_BANK_DIRECT", "OUT_PERSONAL_TRANSFER", "OUT_PERSONAL_SPEND", "PERSONAL_TALANGAN_REIMBURSE"] },
          amount: { type: Type.NUMBER, description: "Jumlah uang transaksi" },
          paymentMethod: { type: Type.STRING, enum: ["CASH", "TRANSFER"] },
          adminFee: { type: Type.NUMBER, description: "Biaya administrasi transfer jika ada" },
          category: { type: Type.STRING, description: "Kategori pengeluaran atau pemasukan (contoh: 'Bahan Material', 'Gaji / Upah', 'Operasional', 'Peralatan / Inventaris', 'Kasbon', 'Kas Masuk Klien')" },
          description: { type: Type.STRING, description: "Deskripsi detail dari transaksi" },
          sumberDana: { type: Type.STRING, description: "Sumber dana, biasanya 'REKENING PT'" },
          rekPenerima: { type: Type.STRING, description: "Nomor rekening atau nama penerima transfer jika ada" },
          personalHolder: { type: Type.STRING, description: "Nama personil pemegang dana jika bertipe transfer ke personil (contoh: Faisal, Jidan, Yasin)" },
          referenceId: { type: Type.STRING, description: "ID Proyek/Referensi terkait (misal: WESTMARK, STP, dll)" }
        },
        required: ["customId", "date", "type", "flowType", "amount", "paymentMethod", "category", "description"]
      }
    };

    const debtSchema = {
      type: Type.ARRAY,
      description: "Daftar hutang piutang yang berhasil diekstrak dari PDF log rekening.",
      items: {
        type: Type.OBJECT,
        properties: {
          customId: { type: Type.STRING, description: "Format: HTG-XXX untuk Hutang atau PTG-XXX untuk Piutang, berurutan dari 001" },
          projectId: { type: Type.STRING, description: "ID Proyek terkait jika ada (misal: WESTMARK)" },
          type: { type: Type.STRING, enum: ["HUTANG", "PIUTANG"] },
          title: { type: Type.STRING, description: "Judul transaksi hutang/piutang" },
          contactName: { type: Type.STRING, description: "Nama kontak supplier, klien, atau personil pemberi/penerima hutang" },
          amount: { type: Type.NUMBER, description: "Nilai nominal hutang/piutang" },
          dueDate: { type: Type.STRING, description: "Tanggal jatuh tempo dalam format YYYY-MM-DD" },
          status: { type: Type.STRING, enum: ["UNPAID", "PARTIAL", "PAID"] },
          description: { type: Type.STRING, description: "Keterangan tambahan" }
        },
        required: ["customId", "type", "title", "contactName", "amount", "dueDate", "status"]
      }
    };

    const parts: any[] = [
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType || "application/pdf"
        }
      },
      {
        text: `Ekstrak seluruh transaksi yang tercatat dalam dokumen PDF rekening bank atau log di atas secara lengkap dan berurutan dari halaman pertama hingga halaman terakhir tanpa melewatkan satupun transaksi. 
        Format tipe ekstraksi yang diinginkan adalah: ${isDebt ? "Daftar Hutang Piutang (Debt)" : "Daftar Keuangan/Transaksi (Financial)"}.
        
        Aturan Ekstraksi:
        1. Pastikan semua nominal uang dikonversi menjadi tipe data NUMBER murni (tanpa tanda titik, koma, Rp).
        2. Format tanggal harus YYYY-MM-DD.
        3. Pastikan untuk membuat ID transaksi yang unik secara urut (misalnya: BNK-010626-001, BNK-010626-002, INC-010626-001, dst untuk transaksi keuangan; atau HTG-001, HTG-002, PTG-001 untuk hutang/piutang).
        4. Tentukan flowType keuangan secara logis berdasar deskripsi transaksi:
           - OUT_BANK_DIRECT: Pengeluaran langsung ke pihak luar/vendor/supplier dari rekening PT.
           - OUT_PERSONAL_TRANSFER: Transfer saldo/kasbon ke personil internal (Faisal, Jidan, atau Yasin).
           - OUT_PERSONAL_SPEND: Pengeluaran riil belanja personil.
           - PERSONAL_TALANGAN_REIMBURSE: Pembayaran ganti dana talangan pribadi staff.`
      }
    ];

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro-preview"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Parse PDF] Trying model: ${modelName} for parsing ${parseType}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: "Anda adalah asisten cerdas akuntansi yang sangat teliti dalam mengekstrak data dari berkas dokumen PDF secara akurat menjadi format data JSON murni.",
            responseMimeType: "application/json",
            responseSchema: isDebt ? debtSchema : financialSchema,
          }
        });
        if (response && response.text) {
          console.log(`[Parse PDF] Successfully parsed PDF with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Parse PDF] Model ${modelName} failed or busy:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("Semua model AI sedang sibuk memproses PDF. Silakan coba beberapa saat lagi.");
    }

    const parsedData = JSON.parse(response.text || "[]");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Parse PDF Error:", error);
    res.status(500).json({ error: error.message || "Gagal mengekstrak dokumen PDF rekening" });
  }
});

// Vite middleware for development / SPA static server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
