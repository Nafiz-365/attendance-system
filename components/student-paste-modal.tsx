"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PasteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any[]) => Promise<void>;
}

export function PasteModal({ isOpen, onClose, onImport }: PasteModalProps) {
    const [text, setText] = useState("");
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [importing, setImporting] = useState(false);

    const handleTextChange = (value: string) => {
        setText(value);
        setError("");

        const lines = value.trim().split('\n');
        const students = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Skip header if present
            if (i === 0 && (line.toLowerCase().includes('id') || line.toLowerCase().includes('name'))) {
                continue;
            }

            const values = line.includes('\t')
                ? line.split('\t').map(v => v.trim())
                : line.split(',').map(v => v.trim());

            // Format: StudentId, Name, Email, Batch, Section, DepartmentId
            if (values.length >= 5) {
                students.push({
                    studentId: values[0],
                    name: values[1],
                    email: values[2],
                    batch: values[3],
                    section: values[4],
                    departmentId: values[5] ? parseInt(values[5]) : 1
                });
            }
        }
        setPreview(students);
    };

    const handleImport = async () => {
        if (preview.length === 0) {
            setError("No valid data found to import");
            return;
        }

        try {
            setImporting(true);
            await onImport(preview);
            setText("");
            setPreview([]);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to import students");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Students"
        >
            <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-md text-sm">
                    <p className="font-semibold mb-1">Format Required:</p>
                    <p className="text-muted-foreground">StudentId, Name, Email, Batch, Section, DepartmentId</p>
                    <p className="text-xs text-muted-foreground mt-1">Example: <code className="bg-muted px-1">S101, John Doe, john@email.com, 50, A, 1</code></p>
                </div>

                <div className="grid gap-2">
                    <Textarea
                        placeholder="Paste data here..."
                        className="min-h-[200px] font-mono text-sm"
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                    />
                </div>

                {preview.length > 0 && (
                    <div className="text-sm">
                        <p className="text-green-600 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {preview.length} valid records found
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground max-h-24 overflow-y-auto border rounded p-2">
                            {preview.slice(0, 5).map((s, i) => (
                                <div key={i}>{s.studentId} - {s.name} (Batch {s.batch} | Sec {s.section})</div>
                            ))}
                            {preview.length > 5 && <div>...and {preview.length - 5} more</div>}
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={onClose} disabled={importing}>Cancel</Button>
                <Button onClick={handleImport} disabled={preview.length === 0 || importing}>
                    {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Import {preview.length} Students
                </Button>
            </div>
        </Modal>
    );
}
