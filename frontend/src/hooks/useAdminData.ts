import { useState, useEffect, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { mockService } from '../services/mockData';

interface AdminData {
    students: any[];
    groups: any[];
    teachers: any[];
    loading: boolean;
    lastFetched: number;
}

// Simple in-memory cache
let cache: AdminData = {
    students: [],
    groups: [],
    teachers: [],
    loading: false,
    lastFetched: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAdminData = () => {
    const [data, setData] = useState<AdminData>(cache);
    const { dashboardData } = useAppData();

    const fetchAll = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && cache.lastFetched > 0 && (now - cache.lastFetched < CACHE_DURATION)) {
            setData({ ...cache, loading: false });
            return;
        }

        setData(prev => ({ ...prev, loading: true }));

        try {
            const [students, groups, teachers] = await Promise.all([
                mockService.getAdminStudents(),
                mockService.getAdminGroups(),
                mockService.getAdminTeachers()
            ]);

            // const students = await studentsRes.json();
            // const groups = await groupsRes.json();
            // const users = await teachersRes.json();
            // const teachers = users.filter((u: any) => u.role === 'teacher');

            // Mock service returns data directly
            // const students = await studentsRes.json();
            // const groups = await groupsRes.json();
            // const users = await teachersRes.json();
            // const teachers = users.filter((u: any) => u.role === 'teacher');

            cache = {
                students,
                groups,
                teachers,
                loading: false,
                lastFetched: now
            };
            setData(cache);
        } catch (error) {
            console.error('Failed to prefetch admin data', error);
            setData(prev => ({ ...prev, loading: false }));
        }
    }, []);

    // Prefetch on mount if admin
    useEffect(() => {
        if (dashboardData?.user?.role === 'admin' || dashboardData?.user?.role === 'super_admin') {
            fetchAll();
        }
    }, [dashboardData, fetchAll]);

    return {
        ...data,
        refresh: () => fetchAll(true)
    };
};
