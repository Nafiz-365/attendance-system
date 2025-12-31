"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileSpreadsheet, X, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface StudentImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any[]) => Promise<void>;
}

export function StudentImportModal({ isOpen, onClose, onImport }: StudentImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [importing, setImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const processFile = async (droppedFile: File) => {
        if (!droppedFile.name.match(/\.(xlsx|xls|csv)$/)) {
            setError("Please upload a valid Excel or CSV file.");
            return;
        }

        setFile(droppedFile);
        setError("");

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Validate and format data
                const formattedData = jsonData.map((row: any) => ({
                    studentId: row['Student ID'] || row['studentId'] || row['ID'] || row['Roll No'] || row['Roll'] || '',
                    name: row['Name'] || row['name'] || '',
                    email: row['Email'] || row['email'] || '',
                    batch: String(row['Batch'] || row['batch'] || ''),
                    section: row['Section'] || row['section'] || '',
                    // Support Department Code (preferred) or ID
                    departmentCode: row['Department Code'] || row['Department'] || row['departmentCode'] || '',
                    departmentId: row['Department ID'] || row['departmentId'] || ''
                })).filter(s => s.studentId && s.name); // Basic validation

                if (formattedData.length === 0) {
                    setError("No valid student data found in the file.");
                } else {
                    setPreview(formattedData);
                    // Helpful alert if rows were dropped
                    if (jsonData.length > formattedData.length) {
                        const skipped = jsonData.length - formattedData.length;
                        // Using error state for visibility, or we could add a warning state
                        // For now let's just use the count in the success UI
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError("Failed to parse file. Please check the format.");
            }
        };
        reader.readAsBinaryString(droppedFile);
    };

    const handleImport = async () => {
        if (preview.length === 0) return;

        try {
            setImporting(true);
            await onImport(preview);
            resetState();
            // Don't close immediately if we want to show success message? 
            // The parent handler usually closes or toasts.
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to import students");
        } finally {
            setImporting(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setPreview([]);
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadTemplate = () => {
        // Updated headers to be more user friendly
        const headers = ["Student ID", "Name", "Email", "Batch", "Section", "Department Code"];
        const ws = XLSX.utils.aoa_to_sheet([headers, ["S101", "John Doe", "john@example.com", "50", "A", "CSE"]]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "student_import_template.xlsx");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { onClose(); resetState(); }}
            title="Import Students"
        >
            <div className="space-y-6">
                {!file && (
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => e.target.files && processFile(e.target.files[0])}
                        />
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="bg-muted p-4 rounded-full">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                                <p className="text-sm">Excel (.xlsx) or CSV files</p>
                            </div>
                        </div>
                    </div>
                )}

                {file && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetState}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {preview.length > 0 && !error && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                {preview.length} valid records found
                                {/* Show skip count if necessary, but requires new state */}
                            </div>
                            <Button variant="link" size="sm" className="h-auto p-0" onClick={resetState}>
                                Replace File
                            </Button>
                        </div>

                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead className="text-right">Dept</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {preview.slice(0, 10).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-xs">{row.studentId}</TableCell>
                                            <TableCell className="text-xs">{row.name}</TableCell>
                                            <TableCell className="text-xs">{row.batch}</TableCell>
                                            <TableCell className="text-xs text-right">{row.departmentId}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {preview.length > 10 && (
                            <p className="text-xs text-center text-muted-foreground mt-1">
                                ...and {preview.length - 10} more rows
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2">
                    <Button variant="link" className="text-muted-foreground p-0 h-auto gap-1 text-xs" onClick={downloadTemplate}>
                        <Download className="w-3 h-3" /> Download Template
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={importing}>Cancel</Button>
                        <Button onClick={handleImport} disabled={preview.length === 0 || importing} className="gradient-university text-white">
                            {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Import Students
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
