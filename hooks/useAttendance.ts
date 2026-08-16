import { useState, useEffect } from 'react';
import useSWR from 'swr';
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
    const { addToast } = useToast();

    const fetcher = async (url: string) => {
        const queryDate = url.split('?date=')[1] || date;
        const data = await AttendanceService.getRecords(undefined, queryDate);
        return (data as unknown as ServiceAttendanceRecord[]).map((record) => ({
            studentId: record.student_id || record.studentId || 0,
            status: record.status || '',
            date: record.date,
        }));
    };

    const {
        data: attendanceRecords = [],
        error,
        isLoading,
        mutate,
    } = useSWR<AttendanceRecord[]>(`/api/attendance?date=${date}`, fetcher, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            addToast('Failed to load attendance records', 'error');
        }
    }, [error, addToast]);

    const markAttendance = async (studentId: number, status: string) => {
        try {
            const res = await AttendanceService.markAttendance({
                studentId,
                status,
                date,
            });
            const transformedRes: AttendanceRecord = {
                studentId: studentId,
                status: status,
                date: date,
            };
            mutate((prev = []) => {
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
                    };
                    return updated;
                }
                return [...prev, transformedRes];
            }, false);
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
        loading: isLoading,
        markAttendance,
        refresh: () => mutate(),
    };
}
