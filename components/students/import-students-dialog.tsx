"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Loader2, CheckCircle2 } from "lucide-react"
import {
  downloadStudentTemplate,
  parseStudentExcel,
} from "@/lib/excel-template"
import {
  previewStudentImport,
  confirmStudentImport,
  ImportPreviewRow,
} from "@/lib/actions/import.actions"
import { useRouter } from "next/navigation"

export function ImportStudentsDialog() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<ImportPreviewRow[] | null>(null)
  const [error, setError] = useState("")
  const [successCount, setSuccessCount] = useState<number | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    setError("")
    setSuccessCount(null)

    try {
      const rows = await parseStudentExcel(file)
      if (rows.length === 0) {
        setError("No rows found in the file")
        setParsing(false)
        return
      }
      const result = await previewStudentImport(rows)
      setPreview(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
    } finally {
      setParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleConfirm() {
    if (!preview) return
    setImporting(true)
    setError("")

    try {
      const result = await confirmStudentImport(preview)
      setSuccessCount(result.imported)
      setPreview(null)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  function handleReset() {
    setPreview(null)
    setError("")
    setSuccessCount(null)
  }

  const validCount = preview?.filter((r) => r.status === "valid").length ?? 0
  const errorCount = preview?.filter((r) => r.status === "error").length ?? 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) handleReset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students from Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {!preview && successCount === null && (
            <>
              <div className="border rounded-md p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Download the template, fill in your students, then upload
                  it back. Columns required:{" "}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    name
                  </span>
                  ,{" "}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    studentNumber
                  </span>
                  ,{" "}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    class
                  </span>
                  . Class names must match an existing class exactly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadStudentTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-upload"
                />
                <Button
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={parsing}
                >
                  {parsing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Excel File
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {preview && (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {validCount} valid
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">{errorCount} errors</Badge>
                )}
              </div>

              <div className="border rounded-md max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Student No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.name || "—"}</TableCell>
                        <TableCell>{row.studentNumber || "—"}</TableCell>
                        <TableCell>{row.className || "—"}</TableCell>
                        <TableCell>
                          {row.status === "valid" ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">{row.error}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={importing || validCount === 0}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${validCount} Student${validCount !== 1 ? "s" : ""}`
                  )}
                </Button>
              </div>
            </>
          )}

          {successCount !== null && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm font-medium">
                  {successCount} student{successCount !== 1 ? "s" : ""}{" "}
                  imported successfully
                </p>
              </div>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}