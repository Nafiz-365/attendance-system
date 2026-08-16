'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

import {
    Loader2,
    Upload,
    FileSpreadsheet,
    X,
    Download,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface GenericImportModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onImport: (data: T[]) => Promise<void>;
    dataFormatter: (row: Record<string, any>) => T | null; // Return null if invalid
    previewColumns: {
        key: keyof T;
        label: string;
        align?: 'left' | 'center' | 'right';
    }[];
    templateHeaders: string[];
    templateSampleRow: any[];
    templateFilename: string;
    importLabel?: string;
}

export function GenericImportModal<T extends Record<string, any>>({
    isOpen,
    onClose,
    title,
    onImport,
    dataFormatter,
    previewColumns,
    templateHeaders,
    templateSampleRow,
    templateFilename,
    importLabel = 'Import',
}: GenericImportModalProps<T>) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<T[]>([]);
    const [error, setError] = useState('');
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
            setError('Please upload a valid Excel or CSV file.');
            return;
        }

        setFile(droppedFile);
        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<
                    string,
                    unknown
                >[];

                const formattedData = jsonData
                    .map(dataFormatter)
                    .filter((item): item is T => item !== null);

                if (formattedData.length === 0) {
                    setError('No valid data found in the file.');
                } else {
                    setPreview(formattedData);
                }
            } catch (err: unknown) {
                console.error(err);
                setError('Failed to parse file. Please check the format.');
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
            onClose();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : `Failed to import`;
            setError(errorMessage);
        } finally {
            setImporting(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setPreview([]);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            templateHeaders,
            templateSampleRow,
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, templateFilename);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                resetState();
            }}
            title={title}
        >
            <div className="space-y-6">
                {!file && (
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50',
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
                            onChange={(e) =>
                                e.target.files && processFile(e.target.files[0])
                            }
                        />
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="bg-muted p-4 rounded-full">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm">
                                    Excel (.xlsx) or CSV files
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {file && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetState}
                        >
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
                            </div>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={resetState}
                            >
                                Replace File
                            </Button>
                        </div>

                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {previewColumns.map((col) => (
                                            <TableHead
                                                key={String(col.key)}
                                                className={cn(
                                                    col.align === 'right' &&
                                                        'text-right',
                                                )}
                                            >
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {preview.slice(0, 10).map((row, i) => (
                                        <TableRow key={i}>
                                            {previewColumns.map((col, j) => (
                                                <TableCell
                                                    key={String(col.key)}
                                                    className={cn(
                                                        'text-xs',
                                                        j === 0 && 'font-mono',
                                                        col.align === 'right' &&
                                                            'text-right',
                                                    )}
                                                >
                                                    {String(row[col.key] || '')}
                                                </TableCell>
                                            ))}
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
                    <Button
                        variant="link"
                        className="text-muted-foreground p-0 h-auto gap-1 text-xs"
                        onClick={downloadTemplate}
                    >
                        <Download className="w-3 h-3" /> Download Template
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={importing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={preview.length === 0 || importing}
                            className="gradient-university text-white"
                        >
                            {importing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {importLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
