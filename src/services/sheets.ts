import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

// In-memory token caching as specified in workspace-integration guidelines
let cachedGoogleAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  cachedGoogleAccessToken = token;
};

export const getGoogleAccessToken = (): string | null => {
  return cachedGoogleAccessToken;
};

// Initiate Google Sign-in specifically for requesting Spreadsheet Scopes
export const signInWithGoogleSheets = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/spreadsheets");
  provider.addScope("email");
  provider.addScope("profile");
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    
    if (!token) {
      throw new Error("Gagal mengambil access token Google.");
    }
    
    cachedGoogleAccessToken = token;
    return token;
  } catch (err) {
    console.error("Google login error:", err);
    throw err;
  }
};

interface SheetProperty {
  sheetId: number;
  title: string;
}

// Fetch all sheet names and IDs in the spreadsheet
export const getSpreadsheetStructure = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SheetProperty[]> => {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Fetch spreadsheet struct failure:", errText);
    if (res.status === 401) {
      setGoogleAccessToken(null);
      throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
    }
    throw new Error(`Spreadsheet tidak dapat diakses. Pastikan Anda terhubung ke akun yang tepat.`);
  }

  const data = await res.json();
  return (data.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId,
    title: s.properties?.title,
  }));
};

// Initialize necessary sheets with proper names and formatting
export const initSheetsTemplates = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SheetProperty[]> => {
  let structures = await getSpreadsheetStructure(accessToken, spreadsheetId);
  const requiredSheets = [
    "Absensi", 
    "Gaji & Payroll", 
    "Klaim & Kasbon", 
    "Laporan Lapangan",
    "Pemasukan",
    "Pengeluaran Bank",
    "Pengeluaran Personal",
    "Daftar Keseluruhan",
    "Hutang"
  ];
  
  const addSheetRequests: any[] = [];
  
  for (const name of requiredSheets) {
    const exists = structures.some((s) => s.title.toLowerCase() === name.toLowerCase());
    if (!exists) {
      addSheetRequests.push({
        addSheet: {
          properties: {
            title: name,
            gridProperties: {
              hideGridlines: false,
            },
          },
        },
      });
    }
  }

  if (addSheetRequests.length > 0) {
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests: addSheetRequests }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      if (updateRes.status === 401) {
        setGoogleAccessToken(null);
        throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
      }
      throw new Error(`Gagal menambahkan sub-sheet baru: ${errText}`);
    }

    // Refresh sheet metadata for IDs
    structures = await getSpreadsheetStructure(accessToken, spreadsheetId);
  }

  // Deleting default blank sheets such as "Sheet1", "Lembar1", etc. so the spreadsheet is not opened with a blank screen
  const defaultBlankTitles = ["sheet1", "sheet 1", "lembar1", "lembar 1", "default"];
  const deleteRequests: any[] = [];

  const hasAtLeastOneRequiredSheet = structures.some((s) =>
    requiredSheets.some((req) => req.toLowerCase() === s.title.toLowerCase())
  );

  if (hasAtLeastOneRequiredSheet && structures.length > 1) {
    for (const sheet of structures) {
      if (defaultBlankTitles.includes(sheet.title.toLowerCase())) {
        deleteRequests.push({
          deleteSheet: {
            sheetId: sheet.sheetId,
          },
        });
      }
    }
  }

  if (deleteRequests.length > 0) {
    try {
      const deleteRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests: deleteRequests }),
        }
      );
      if (!deleteRes.ok) {
        if (deleteRes.status === 401) {
          setGoogleAccessToken(null);
          throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
        }
      }
      // Refresh structures representation
      structures = await getSpreadsheetStructure(accessToken, spreadsheetId);
    } catch (e) {
      console.warn("Could not delete default blank sheets:", e);
    }
  }

  return structures;
};

// Set values in Google Sheets
export const updateSheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) => {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      setGoogleAccessToken(null);
      throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
    }
    throw new Error(`Gagal menulis data ke range ${range}: ${errText}`);
  }
};

// Clear sheets range
export const clearSheetRange = async (
  accessToken: string,
  spreadsheetId: string,
  range: string
) => {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      setGoogleAccessToken(null);
      throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
    }
    throw new Error(`Gagal mengosongkan range ${range}: ${errText}`);
  }
};

// Styling function to format the sheet headers as gorgeous slate-colored bars with bold white text
export const applyProfessionalStyling = async (
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  columnCount: number,
  sheetTitle?: string
) => {
  const requests: any[] = [
    // 1. Default Style for Data Cells (Row 1 to 1000)
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: columnCount,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              fontFamily: "Inter",
              fontSize: 9,
              foregroundColor: { red: 0.1, green: 0.13, blue: 0.17 },
            },
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment)",
      },
    },
    // 2. Header Style (Row 0)
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: columnCount,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // Deep Dark Slate Slate (#0f172a)
            textFormat: {
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
              bold: true,
              fontSize: 10,
              fontFamily: "Inter",
            },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    },
    // 3. Set Header Row Height to 40px
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: 0,
          endIndex: 1,
        },
        properties: {
          pixelSize: 40,
        },
        fields: "pixelSize",
      },
    },
    // 4. Freeze Row 1
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: "gridProperties.frozenRowCount",
      },
    },
    // 5. Zebra Striping (Alternating light background on even rows)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [
                {
                  userEnteredValue: "=ISEVEN(ROW())",
                },
              ],
            },
            format: {
              backgroundColor: { red: 0.97, green: 0.98, blue: 0.99 }, // Sleek Slate-Gray Alternator (#f8fafc)
            },
          },
        },
        index: 0,
      },
    },
    // 6. Highlight STATUS with specific backgrounds
    // APPROVED / IN / PROSES -> Soft Green
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_CONTAINS",
              values: [{ userEnteredValue: "Approved" }],
            },
            format: {
              backgroundColor: { red: 0.88, green: 0.97, blue: 0.92 },
              textFormat: { foregroundColor: { red: 0.05, green: 0.42, blue: 0.2 }, bold: true },
            },
          },
        },
        index: 1,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_EQ",
              values: [{ userEnteredValue: "IN" }],
            },
            format: {
              backgroundColor: { red: 0.88, green: 0.97, blue: 0.92 },
              textFormat: { foregroundColor: { red: 0.05, green: 0.42, blue: 0.2 }, bold: true },
            },
          },
        },
        index: 2,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_EQ",
              values: [{ userEnteredValue: "PROSES" }],
            },
            format: {
              backgroundColor: { red: 0.88, green: 0.97, blue: 0.92 },
              textFormat: { foregroundColor: { red: 0.05, green: 0.42, blue: 0.2 }, bold: true },
            },
          },
        },
        index: 3,
      },
    },
    // PENDING -> Soft Orange
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_CONTAINS",
              values: [{ userEnteredValue: "Pending" }],
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.95, blue: 0.84 },
              textFormat: { foregroundColor: { red: 0.65, green: 0.35, blue: 0.0 }, bold: true },
            },
          },
        },
        index: 4,
      },
    },
    // REJECTED / OUT -> Soft Red/Rose
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_CONTAINS",
              values: [{ userEnteredValue: "Rejected" }],
            },
            format: {
              backgroundColor: { red: 0.99, green: 0.88, blue: 0.88 },
              textFormat: { foregroundColor: { red: 0.72, green: 0.1, blue: 0.1 }, bold: true },
            },
          },
        },
        index: 5,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_EQ",
              values: [{ userEnteredValue: "OUT" }],
            },
            format: {
              backgroundColor: { red: 0.99, green: 0.88, blue: 0.88 },
              textFormat: { foregroundColor: { red: 0.72, green: 0.1, blue: 0.1 }, bold: true },
            },
          },
        },
        index: 6,
      },
    },
    // 7. Auto Resize Column Widths
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: columnCount,
        },
      },
    },
  ];

  // 8. Custom Currency / Alignment formatting based on sheet content
  const currencyColumns: number[] = [];
  if (sheetTitle === "Gaji & Payroll") {
    // Columns: Rate Harian (Index 3), Rate Lembur (Index 4), Kasbon (Index 7), Potongan (Index 8), Bersih (Index 9)
    currencyColumns.push(3, 4, 7, 8, 9);
  } else if (sheetTitle === "Klaim & Kasbon") {
    // Column: Jumlah Kebutuhan Dana (Index 4)
    currencyColumns.push(4);
  } else if (sheetTitle === "Pemasukan") {
    // Column: Jumlah (Rp) (Index 6)
    currencyColumns.push(6);
  } else if (sheetTitle === "Pengeluaran Bank") {
    // Column: Jumlah (Rp) (Index 6)
    currencyColumns.push(6);
  } else if (sheetTitle === "Pengeluaran Personal") {
    // Column: Jumlah (Rp) (Index 7)
    currencyColumns.push(7);
  } else if (sheetTitle === "Daftar Keseluruhan") {
    // Column: Nominal (Rp) (Index 6)
    currencyColumns.push(6);
  } else if (sheetTitle === "Hutang") {
    // Columns: Nominal Awal (Index 6), Total Terbayar (Index 7), Sisa Saldo (Index 8)
    currencyColumns.push(6, 7, 8);
  }

  currencyColumns.forEach((colIdx) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: colIdx,
          endColumnIndex: colIdx + 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: {
              type: "CURRENCY",
              pattern: '"Rp"#,##0',
            },
            horizontalAlignment: "RIGHT",
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    });
  });

  const stylingRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!stylingRes.ok) {
    const errText = await stylingRes.text();
    if (stylingRes.status === 401) {
      setGoogleAccessToken(null);
      throw new Error(`Sesi Google Anda telah berakhir (401). Silakan hubungkan ulang akun Google Anda di menu Google Sheets.`);
    }
    throw new Error(`Gagal menerapkan styling Google Sheet: ${errText}`);
  }
};

// Main Sync Master Flow
export const syncAllDataToGoogleSheets = async (
  accessToken: string,
  spreadsheetId: string,
  data: {
    accounts: any[];
    attendanceHistory: any[];
    leaveRequests: any[];
    cashAdvances: any[];
    reimbursements: any[];
    departmentSettings: any[];
    projects: any[];
    reports: any[];
    financialRecords?: any[];
    debtRecords?: any[];
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Initialise & Ensure sheets exist
    const structures = await initSheetsTemplates(accessToken, spreadsheetId);

    // 2. Clear old data from range A2: Z10000 across all sheets
    const absensiSheet = "Absensi";
    const gajiSheet = "Gaji & Payroll";
    const klaimSheet = "Klaim & Kasbon";
    const laporanSheet = "Laporan Lapangan";
    const pemasukanSheet = "Pemasukan";
    const pengeluaranBankSheet = "Pengeluaran Bank";
    const pengeluaranPersonalSheet = "Pengeluaran Personal";
    const daftarKeseluruhanSheet = "Daftar Keseluruhan";
    const hutangSheet = "Hutang";

    await Promise.all([
      clearSheetRange(accessToken, spreadsheetId, `'${absensiSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${gajiSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${klaimSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${laporanSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${pemasukanSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${pengeluaranBankSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${pengeluaranPersonalSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${daftarKeseluruhanSheet}'!A2:Z10000`),
      clearSheetRange(accessToken, spreadsheetId, `'${hutangSheet}'!A2:Z10000`),
    ]);

    // 3. Process + Map "Absensi" Data
    const absensiHeaders = [
      "Waktu Catat",
      "ID Karyawan",
      "Nama Karyawan",
      "Tipe Absensi (IN/OUT)",
      "Proyek Terkait",
      "Durasi Kerja (Menit)",
      "Durasi Lembur (Menit)",
      "Foto Selfie Verification",
      "Keterangan Terlambat",
      " Jarak ke Lokasi Proyek (Km)",
    ];

    // Sorted by timing (newsest timing first)
    const sortedAttendance = [...data.attendanceHistory].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    const absensiRows = sortedAttendance.map((h) => {
      const userObj = data.accounts.find((u) => u.id === h.userId || u.uid === h.userId);
      const projObj = data.projects.find((p) => p.id === h.projectId);
      const displayId = userObj?.employeeId || (h.userId && h.userId.length > 8 ? h.userId.substring(0, 8) : h.userId) || "-";
      return [
        h.timestamp ? new Date(h.timestamp).toLocaleString("id-ID") : "-",
        displayId,
        userObj?.name || "-",
        h.type || "IN",
        projObj?.name || h.projectId || "Generik/Kantor",
        h.type === "OUT" ? h.durationMinutes || "-" : "-",
        h.type === "OUT" ? h.overtimeMinutes || "0" : "-",
        h.selfieUrl ? (h.selfieUrl.startsWith("data:") ? "[Foto Selfie Terlampir]" : h.selfieUrl) : "Tanpa Foto",
        h.lateReason || h.keterangan || "-",
        h.projectDistance !== undefined && h.projectDistance !== null
          ? `${(h.projectDistance as number).toFixed(2)} Km`
          : "T/A",
      ];
    });

    if (absensiRows.length === 0) {
      absensiRows.push([
        new Date().toLocaleString("id-ID"),
        "CONTOH-001",
        "Budi Santoso (CONTOH TEMPLATE)",
        "IN",
        "Proyek Sipil A-1",
        "-",
        "-",
        "Tanpa Foto",
        "Check-In sukses, tepat waktu.",
        "0.02 Km",
      ]);
    }

    // Write Absensi headers & rows
    await updateSheetValues(accessToken, spreadsheetId, `'${absensiSheet}'!A1:J1`, [absensiHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${absensiSheet}'!A2`, absensiRows);

    // 4. Process + Map "Gaji & Payroll" Data
    const gajiHeaders = [
      "ID Karyawan",
      "Nama Karyawan",
      "Bagian / Jabatan",
      "Rate Harian (Rp/Hari)",
      "Rate Lembur (Rp/Jam)",
      "Total Hari Kerja",
      "Total Akumulasi Lembur (Jam)",
      "Total Pinjaman Kasbon (Rp)",
      "Potongan BPJS/Lainnya",
      "Total Bersih Diterima (Rp)",
    ];

    const gajiRows = data.accounts
      .filter((emp) => emp.role !== "admin") // Filter out purely super admins or system users
      .map((emp) => {
        const userAttendance = data.attendanceHistory.filter(
          (h) => (h.userId === emp.username || h.userId === emp.id) && h.type === "IN"
        );
        const userCashAdvances = data.cashAdvances.filter(
          (c) => c.userId === emp.username || c.userId === emp.id
        );
        const totalCashAdvanceObj = userCashAdvances.reduce((sum, c) => sum + c.amount, 0);

        const uniqueWorkDays = userAttendance.reduce((acc: any[], current) => {
          const dateStr = new Date(current.timestamp).toDateString();
          const clockOutEntry = data.attendanceHistory.find(
            (h) =>
              (h.userId === emp.username || h.userId === emp.id) &&
              h.type === "OUT" &&
              new Date(h.timestamp).toDateString() === dateStr
          );

          let overtimeHours = 0;
          if (clockOutEntry) {
            const clockOutTime = new Date(clockOutEntry.timestamp);
            const deadline = new Date(clockOutEntry.timestamp);
            deadline.setHours(17, 0, 0, 0);
            if (clockOutTime.getTime() > deadline.getTime()) {
              overtimeHours = Math.floor(
                (clockOutTime.getTime() - deadline.getTime()) / (1000 * 60 * 60)
              );
            }
          }

          if (!acc.find((d) => d.dateStr === dateStr)) {
            acc.push({ ...current, clockOutEntry, overtimeHours, dateStr });
          }
          return acc;
        }, []);

        const userLeaves = data.leaveRequests.filter(
          (l) => (l.userId === emp.id || l.userId === emp.username) && l.status === "Approved"
        );

        const approvedLeaveDays = userLeaves.reduce((acc: any[], leave) => {
          if (leave.type === "IZIN" && leave.date) {
            acc.push({
              dateStr: new Date(leave.date).toDateString(),
              timestamp: new Date(leave.date).getTime(),
              projectId: "LEAVE",
              overtimeHours: 0,
              type: "LEAVE_DAY",
            });
          } else if (leave.type === "CUTI" && leave.startDate && leave.endDate) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const currentDay = new Date(start);
            while (currentDay <= end) {
              acc.push({
                dateStr: currentDay.toDateString(),
                timestamp: currentDay.getTime(),
                projectId: "LEAVE",
                overtimeHours: 0,
                type: "LEAVE_DAY",
              });
              currentDay.setDate(currentDay.getDate() + 1);
            }
          }
          return acc;
        }, []);

        approvedLeaveDays.forEach((leaveDay) => {
          if (!uniqueWorkDays.find((d) => d.dateStr === leaveDay.dateStr)) {
            uniqueWorkDays.push(leaveDay);
          }
        });

        const deptSetting = data.departmentSettings.find((s) => s.id === emp.bagian);
        const overtimeRate = emp.overtimeRate || deptSetting?.overtimeRate || 15000;

        const calculatedTotalSalary = uniqueWorkDays.reduce((sum: number, day: any) => {
          const isLeave = day.type === "LEAVE_DAY";
          const dayRate = isLeave
            ? emp.dailyRate || 150000
            : emp.projectRates?.[day.projectId] ||
              emp.dailyRate ||
              deptSetting?.dailyRate ||
              150000;
          return sum + dayRate + (day.overtimeHours || 0) * overtimeRate;
        }, 0);

        const calculatedNetSalary = calculatedTotalSalary - totalCashAdvanceObj;
        const totalOvertimeHoursAccum = uniqueWorkDays.reduce((sum: number, day: any) => sum + (day.overtimeHours || 0), 0);

        const displayEmpId = emp.employeeId || (emp.id && emp.id.length > 8 ? emp.id.substring(0, 8) : emp.id) || "-";
        return [
          displayEmpId,
          emp.name || "-",
          emp.role || emp.bagian || "Karyawan Lapangan",
          emp.dailyRate || deptSetting?.dailyRate || 150000,
          overtimeRate,
          uniqueWorkDays.length,
          totalOvertimeHoursAccum,
          totalCashAdvanceObj,
          0, // BPJS / others deduction default
          calculatedNetSalary,
        ];
      });

    if (gajiRows.length === 0) {
      gajiRows.push([
        "CONTOH-001",
        "Budi Santoso (CONTOH TEMPLATE)",
        "Staff Lapangan",
        150000,
        20000,
        20,
        10,
        0,
        0,
        3200000,
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${gajiSheet}'!A1:J1`, [gajiHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${gajiSheet}'!A2`, gajiRows);

    // 5. Process + Map "Klaim & Kasbon" Data
    const klaimHeaders = [
      "ID Pengajuan",
      "Nama Karyawan",
      "Bagian / Posisi",
      "Tipe Transaksi",
      "Jumlah Kebutuhan Dana (Rp)",
      "Catatan Keperluan / Keterangan",
      "Status Verifikasi",
      "ID Penanggung Jawab Persetujuan",
    ];

    const listKlaimKasbon: any[][] = [];

    // Add Reimbursements
    data.reimbursements.forEach((r) => {
      const userObj = data.accounts.find((u) => u.id === r.userId || u.uid === r.userId);
      listKlaimKasbon.push([
        r.id || "-",
        userObj?.name || "-",
        userObj?.role || "Staff Lapangan",
        "REIMBURSEMENT",
        r.amount || 0,
        r.description || r.category || "-",
        r.status || "Pending",
        r.approvedBy || "-",
      ]);
    });

    // Add Cash Advances
    data.cashAdvances.forEach((c) => {
      const userObj = data.accounts.find((u) => u.id === c.userId || u.uid === c.userId);
      listKlaimKasbon.push([
        c.id || "-",
        userObj?.name || "-",
        userObj?.role || "Staff Lapangan",
        "CASH ADVANCE (KASBON)",
        c.amount || 0,
        c.reason || c.notes || "-",
        c.status || "Pending",
        c.approvedBy || "-",
      ]);
    });

    if (listKlaimKasbon.length === 0) {
      listKlaimKasbon.push([
        "REIM-CONTOH",
        "Budi Santoso (CONTOH TEMPLATE)",
        "Staff Lapangan",
        "REIMBURSEMENT",
        350000,
        "Pembelian semen tambahan untuk cor Sektor Barat",
        "Approved",
        "admin",
      ]);
      listKlaimKasbon.push([
        "KASBON-CONTOH",
        "Andi Wijaya (CONTOH TEMPLATE)",
        "Pekerja Sipil",
        "CASH ADVANCE (KASBON)",
        500000,
        "Kasbon darurat biaya pengobatan keluarga",
        "Pending",
        "-",
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${klaimSheet}'!A1:H1`, [klaimHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${klaimSheet}'!A2`, listKlaimKasbon);

    // 6. Process + Map "Laporan Lapangan" Data
    const laporanHeaders = [
      "ID Laporan",
      "Waktu Dikirim",
      "Nama Pengirim",
      "Judul / Sektor",
      "Status Pekerjaan",
      "Detail Deskripsi Laporan Kerja",
      "Foto Dokumentasi Lapangan",
    ];

    const sortedReports = [...data.reports].sort((a, b) => {
      const timeA = typeof a.timestamp === "number" ? a.timestamp : 0;
      const timeB = typeof b.timestamp === "number" ? b.timestamp : 0;
      return timeB - timeA;
    });

    const laporanRows = sortedReports.map((r) => {
      const userObj = data.accounts.find((u) => u.id === r.userId || u.uid === r.userId);
      return [
        r.id || "-",
        r.timestamp ? new Date(r.timestamp).toLocaleString("id-ID") : "-",
        userObj?.name || r.userName || "-",
        r.title || r.sector || "-",
        r.status || "PROSES",
        r.description || "-",
        r.photoUrl ? (r.photoUrl.startsWith("data:") ? "[Foto Lapangan Terlampir]" : r.photoUrl) : (r.uploadedPhoto ? (r.uploadedPhoto.startsWith("data:") ? "[Foto Lapangan Terlampir]" : r.uploadedPhoto) : "Tanpa Foto"),
      ];
    });

    if (laporanRows.length === 0) {
      laporanRows.push([
        "LAP-CONTOH",
        new Date().toLocaleString("id-ID"),
        "Budi Santoso (CONTOH TEMPLATE)",
        "Sektor Sipil Pekerjaan Pondasi",
        "PROSES",
        "Pemasangan besi tulangan sengkang kolom beton selesai digarap.",
        "Tanpa Foto",
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${laporanSheet}'!A1:G1`, [laporanHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${laporanSheet}'!A2`, laporanRows);

    // === 7. Process + Map "Pemasukan" Data ===
    const pemasukanHeaders = [
      "ID Masuk (Otomatis)",
      "Tanggal",
      "Nama Project",
      "Sumber Dana",
      "Kategori",
      "Ket Trans",
      "Jumlah (Rp)",
      "Ref Piutang",
      "Ref Hutang",
    ];

    const financialRecords = data.financialRecords || [];
    const sortedFinanceAsc = [...financialRecords].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    const pemasukanRows = sortedFinanceAsc
      .filter((f) => f.type === "IN")
      .map((f) => {
        const projObj = data.projects.find((p) => p.id === f.referenceId);
        return [
          f.customId || f.id || "-",
          f.date || "-",
          projObj?.name || f.referenceId || "Umum",
          f.sumberDana || "-",
          f.category || "-",
          f.description || "-",
          f.amount || 0,
          f.refPiutang || "-",
          f.refHutang || "-",
        ];
      });

    if (pemasukanRows.length === 0) {
      pemasukanRows.push([
        "INC-110626-001",
        "2026-06-11",
        "Proyek Sipil A-1",
        "KAS UTAMA",
        "Pemasukan Umum",
        "Contoh saldo awal kas.",
        10000000,
        "-",
        "-",
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${pemasukanSheet}'!A1:I1`, [pemasukanHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${pemasukanSheet}'!A2`, pemasukanRows);

    // === 8. Process + Map "Pengeluaran Bank" Data ===
    const pengeluaranBankHeaders = [
      "ID Trans (Otomatis)",
      "Tanggal",
      "Nama Project",
      "Kategori",
      "Desk Kebutuhan",
      "Rek Penerima",
      "Jumlah (Rp)",
      "Ref Hutang",
    ];

    const pengeluaranBankRows = sortedFinanceAsc
      .filter((f) => f.type === "OUT" && f.flowType === "OUT_BANK_DIRECT")
      .map((f) => {
        const projObj = data.projects.find((p) => p.id === f.referenceId);
        return [
          f.customId || f.id || "-",
          f.date || "-",
          projObj?.name || f.referenceId || "Umum",
          f.category || "-",
          f.description || "-",
          f.rekPenerima || "-",
          f.amount || 0,
          f.refHutang || "-",
        ];
      });

    if (pengeluaranBankRows.length === 0) {
      pengeluaranBankRows.push([
        "BNK-110626-001",
        "2026-06-11",
        "Proyek Sipil A-1",
        "Material",
        "Pembelian Semen 100 Sak",
        "Supplier Semen",
        7000000,
        "-",
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${pengeluaranBankSheet}'!A1:H1`, [pengeluaranBankHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${pengeluaranBankSheet}'!A2`, pengeluaranBankRows);

    // === 9. Process + Map "Pengeluaran Personal" Data ===
    const pengeluaranPersonalHeaders = [
      "ID Trans (Otomatis)",
      "Tanggal",
      "Nama Project",
      "PJ",
      "Kategori",
      "Detail Pembayaran",
      "Sumber Uang",
      "Jumlah (Rp)",
      "Ref ID Bank (Isi Jika Ada)",
    ];

    const pengeluaranPersonalRows = sortedFinanceAsc
      .filter((f) => f.type === "OUT" && f.flowType !== "OUT_BANK_DIRECT")
      .map((f) => {
        const projObj = data.projects.find((p) => p.id === f.referenceId);
        return [
          f.customId || f.id || "-",
          f.date || "-",
          projObj?.name || f.referenceId || "Umum",
          f.personalHolder || f.recordedBy || "-",
          f.category || "-",
          f.description || "-",
          f.sumberDana || "-",
          f.amount || 0,
          f.refIdBank || "-",
        ];
      });

    if (pengeluaranPersonalRows.length === 0) {
      pengeluaranPersonalRows.push([
        "PRS-110626-001",
        "2026-06-11",
        "Proyek Sipil A-1",
        "Budi Santoso",
        "Konsumsi",
        "Beli Snack & Makan Siang Tukang",
        "PRIBADI",
        150000,
        "-",
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${pengeluaranPersonalSheet}'!A1:I1`, [pengeluaranPersonalHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${pengeluaranPersonalSheet}'!A2`, pengeluaranPersonalRows);

    // === 10. Process + Map "Daftar Keseluruhan" (General Ledger) ===
    const daftarKeseluruhanHeaders = [
      "Nomor Jurnal",
      "Tanggal",
      "Tipe",
      "Nama Project",
      "Kategori",
      "Keterangan",
      "Nominal (Rp)",
    ];

    const daftarKeseluruhanRows = sortedFinanceAsc.map((f, index) => {
      const projObj = data.projects.find((p) => p.id === f.referenceId);
      const isPemasukan = f.type === "IN";
      const isTalangan = (f.category || "").toUpperCase().includes("TALANGAN") || 
                         f.flowType === "PERSONAL_TALANGAN_REIMBURSE" ||
                         f.flowType === "OUT_PERSONAL_TRANSFER";

      let tipeStr = "PENGELUARAN";
      if (isPemasukan) {
        tipeStr = "PEMASUKAN";
      } else if (isTalangan) {
        tipeStr = "TRANSFER TALANGAN";
      }

      // Calculate nominal value based on VBA rules:
      // Inflow = positive, standard outflow = negative, talangan = 0 (per VBA code limits)
      let nominal = isPemasukan ? (f.amount || 0) : -(f.amount || 0);
      if (isTalangan && f.type === "OUT") {
        nominal = 0;
      }

      // Format description with custom linking templates from VBA:
      let descStr = f.description || "-";
      if (f.type === "OUT" && f.flowType === "OUT_BANK_DIRECT") {
        descStr = `${f.description} (${f.customId || f.id})`;
      } else if (f.type === "OUT" && f.flowType !== "OUT_BANK_DIRECT") {
        const isHutangPribadi = (f.sumberDana || "").toUpperCase() === "PRIBADI" || 
                                (f.sumberDana || "").toUpperCase() === "REKENING PRIBADI";
        if (isHutangPribadi) {
          // Find associated debt customId or leave sample HTG ID
          const associatedDebt = (data.debtRecords || []).find(d => d.projectId === f.referenceId && Math.abs(d.amount - f.amount) < 1);
          const htgId = f.refHutang || associatedDebt?.customId || "HTG-OTOMATIS";
          descStr = `${f.description} [HUTANG PRIBADI ID: ${htgId}]`;
        } else if (f.refIdBank) {
          // Lookup the journal index of the referenced bank transaction
          const refIndex = sortedFinanceAsc.findIndex(r => r.customId === f.refIdBank || r.id === f.refIdBank);
          const jNo = refIndex !== -1 ? `${refIndex + 1}` : "";
          if (jNo !== "") {
            descStr = `${f.description} (Alokasi Dana Bank No. ${jNo}, ID: ${f.refIdBank})`;
          } else {
            descStr = `${f.description} (Alokasi Dana Bank ID: ${f.refIdBank})`;
          }
        }
      }

      return [
        index + 1,
        f.date || "-",
        tipeStr,
        projObj?.name || f.referenceId || "Umum",
        f.category || "-",
        descStr,
        nominal,
      ];
    });

    if (daftarKeseluruhanRows.length === 0) {
      daftarKeseluruhanRows.push([
        1,
        "2026-06-11",
        "PEMASUKAN",
        "Umum",
        "Saldo Awal",
        "Kas Utama Perusahaan",
        10000000,
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${daftarKeseluruhanSheet}'!A1:G1`, [daftarKeseluruhanHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${daftarKeseluruhanSheet}'!A2`, daftarKeseluruhanRows);

    // === 11. Process + Map "Hutang" Data ===
    const hutangHeaders = [
      "ID Catatan",
      "Tanggal",
      "Nama Proyek",
      "PJ / Kontak",
      "Deskripsi / Tipe",
      "Keterangan Rincian",
      "Nominal Awal (Rp)",
      "Total Terbayar (Rp)",
      "Sisa Saldo (Rp)",
    ];

    const debtRecords = data.debtRecords || [];
    const sortedDebts = [...debtRecords].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    const hutangRows = sortedDebts.map((r) => {
      const totalPaid = (r.payments || []).reduce((a, b) => a + b.amount, 0);
      const remaining = r.amount - totalPaid;
      const projObj = data.projects.find((p) => p.id === r.projectId);
      return [
        r.customId || r.id || "-",
        r.dueDate || "-",
        projObj?.name || r.projectId || "Umum",
        r.contactName || "-",
        r.type || "HUTANG",
        r.title + (r.description ? " - " + r.description : ""),
        r.amount || 0,
        totalPaid,
        remaining,
      ];
    });

    if (hutangRows.length === 0) {
      hutangRows.push([
        "HTG-110626-001",
        "2026-06-11",
        "Proyek Sipil A-1",
        "Supplier Semen Tiga Roda",
        "HUTANG",
        "Pembelian Semen 50 Sak",
        3500000,
        1500000,
        2000000,
      ]);
    }

    await updateSheetValues(accessToken, spreadsheetId, `'${hutangSheet}'!A1:I1`, [hutangHeaders]);
    await updateSheetValues(accessToken, spreadsheetId, `'${hutangSheet}'!A2`, hutangRows);

    // 12. Inject beautiful layout stylings asynchronously
    const absProps = structures.find((s) => s.title.toLowerCase() === absensiSheet.toLowerCase());
    const gajiProps = structures.find((s) => s.title.toLowerCase() === gajiSheet.toLowerCase());
    const klaimProps = structures.find((s) => s.title.toLowerCase() === klaimSheet.toLowerCase());
    const lapProps = structures.find((s) => s.title.toLowerCase() === laporanSheet.toLowerCase());
    const pemProps = structures.find((s) => s.title.toLowerCase() === pemasukanSheet.toLowerCase());
    const pbProps = structures.find((s) => s.title.toLowerCase() === pengeluaranBankSheet.toLowerCase());
    const ppProps = structures.find((s) => s.title.toLowerCase() === pengeluaranPersonalSheet.toLowerCase());
    const dkProps = structures.find((s) => s.title.toLowerCase() === daftarKeseluruhanSheet.toLowerCase());
    const hProps = structures.find((s) => s.title.toLowerCase() === hutangSheet.toLowerCase());

    if (absProps) await applyProfessionalStyling(accessToken, spreadsheetId, absProps.sheetId, absensiHeaders.length, absensiSheet);
    if (gajiProps) await applyProfessionalStyling(accessToken, spreadsheetId, gajiProps.sheetId, gajiHeaders.length, gajiSheet);
    if (klaimProps) await applyProfessionalStyling(accessToken, spreadsheetId, klaimProps.sheetId, klaimHeaders.length, klaimSheet);
    if (lapProps) await applyProfessionalStyling(accessToken, spreadsheetId, lapProps.sheetId, laporanHeaders.length, laporanSheet);
    if (pemProps) await applyProfessionalStyling(accessToken, spreadsheetId, pemProps.sheetId, pemasukanHeaders.length, pemasukanSheet);
    if (pbProps) await applyProfessionalStyling(accessToken, spreadsheetId, pbProps.sheetId, pengeluaranBankHeaders.length, pengeluaranBankSheet);
    if (ppProps) await applyProfessionalStyling(accessToken, spreadsheetId, ppProps.sheetId, pengeluaranPersonalHeaders.length, pengeluaranPersonalSheet);
    if (dkProps) await applyProfessionalStyling(accessToken, spreadsheetId, dkProps.sheetId, daftarKeseluruhanHeaders.length, daftarKeseluruhanSheet);
    if (hProps) await applyProfessionalStyling(accessToken, spreadsheetId, hProps.sheetId, hutangHeaders.length, hutangSheet);

    return {
      success: true,
      message: "Seluruh data operasional, rekap Pemasukan, Pengeluaran Bank, Pengeluaran Personal, Daftar Keseluruhan, dan Hutang berhasil disinkronisasi ke Google Sheet dengan sempurna!",
    };
  } catch (err: any) {
    console.error("Critical Google Sheets sync error:", err);
    return {
      success: false,
      message: err.message || "Gagal sinkronisasi data ke Google Sheets.",
    };
  }
};
