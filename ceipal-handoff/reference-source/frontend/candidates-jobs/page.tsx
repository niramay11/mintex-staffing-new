import { Metadata } from 'next';
import { getAllJobs } from '@/lib/data-cache';
import JobsClient from './JobsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Job Listings - Mintex Staffing',
    description: 'Browse available job opportunities',
};

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([promise, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);

export default async function JobsPage() {
    let jobs: Record<string, unknown>[] = [];
    try {
        jobs = await withTimeout(getAllJobs(), 3000, []);
    } catch {
        // fallback: client will fetch via /api/jobs
    }
    return <JobsClient initialJobs={jobs} />;
}
