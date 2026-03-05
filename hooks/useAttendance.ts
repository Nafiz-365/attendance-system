import { useState, useEffect } from 'react';
import { AttendanceService } from '@/services';
import { useToast } from '@/components/ui/toast';

interface AttendanceRecord {
    studentId: number;
    status: string;
    date: string;
}

interface ServiceAttendanceRecord {
    student_id?: number;
    studentId?: number;
    status: string;
    date: string;
}

export function useAttendance(
    initialDate = new Date().toISOString().split('T')[0],
) {
    const [date, setDate] = useState(initialDate);
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const fetchAttendance = async (queryDate: string) => {
        try {
            setLoading(true);
            const data = await AttendanceService.getRecords(
                undefined,
                queryDate,
            );
            const transformedData: AttendanceRecord[] = (
                data as unknown as ServiceAttendanceRecord[]
            ).map((record: ServiceAttendanceRecord) => ({
                studentId: record.student_id || record.studentId || 0,
                status: record.status || '',
                date: record.date,
            }));
            setAttendanceRecords(transformedData);
        } catch (error) {
            console.error(error);
            addToast('Failed to load attendance records', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Refresh when date changes
    useEffect(() => {
        fetchAttendance(date);
    }, [date]);

    const markAttendance = async (studentId: number, status: string) => {
        try {
            const res = await AttendanceService.markAttendance({
                studentId,
                status,
                date,
            });
            // Update local state to reflect change immediately (optimistic UI or re-fetch)
            // Ideally we re-fetch or append, for now append/update local
            const transformedRes: AttendanceRecord = {
                studentId: studentId,
                status: status,
                date: date,
            };
            setAttendanceRecords((prev) => {
                const existing = prev.findIndex(
                    (r) =>
                        r.studentId === studentId &&
                        new Date(r.date).toISOString().split('T')[0] === date,
                );
                if (existing !== -1) {
                    const updated = [...prev];
                    updated[existing] = {
                        ...updated[existing],
                        status,
                        date: new Date().toISOString(),
                    }; // Simple mock update
                    return updated;
                }
                return [...prev, transformedRes];
            });
            return res;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to mark attendance';
            addToast(message, 'error');
            throw error;
        }
    };

    return {
        date,
        setDate,
        attendanceRecords,
        loading,
        markAttendance,
        refresh: () => fetchAttendance(date),
    };
}
