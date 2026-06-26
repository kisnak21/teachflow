"use client"

import * as XLSX from "xlsx"

export function downloadStudentTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["name", "studentNumber", "class"],
    ["Budi Santoso", "2024001", "XI RPL A"],
    ["Siti Aminah", "2024002", "XI RPL A"],
  ])

  worksheet["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

  XLSX.writeFile(workbook, "student-import-template.xlsx")
}

export function parseStudentExcel(file: File): Promise<{ name: string; studentNumber: string; className: string }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)

        const rows = json.map((row) => ({
          name: String(row.name ?? "").trim(),
          studentNumber: String(row.studentNumber ?? "").trim(),
          className: String(row.class ?? "").trim(),
        }))

        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsBinaryString(file)
  })
}