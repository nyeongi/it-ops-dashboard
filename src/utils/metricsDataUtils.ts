export type TimeRange = 'daily' | 'weekly' | 'monthly';

export interface DailyRecord {
    date: string; // YYYY-MM-DD
    visitors: number;
    avgDurationSec: number;
    clicks: number;
    impressions: number;
    isEvent: boolean;
}

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const getAutoDateRange = (mode: TimeRange, refDate: Date = new Date()) => {
    const end = new Date(refDate);
    const start = new Date(refDate);

    if (mode === 'daily') {
        start.setDate(end.getDate() - 6);
    } else if (mode === 'weekly') {
        start.setDate(end.getDate() - 48); // roughly 7 weeks ago
    } else if (mode === 'monthly') {
        start.setMonth(end.getMonth() - 6);
        start.setDate(1); // 1st day of 6 months ago
        // end is effectively end of current month, but we'll just use today's date for simplicity
        // in a real app end might be `new Date(end.getFullYear(), end.getMonth() + 1, 0)`
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
    }

    return { startDate: formatDate(start), endDate: formatDate(end) };
};

export const detectViewMode = (startStr: string, endStr: string): TimeRange => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) return 'daily';
    if (diffDays <= 90) return 'weekly';
    return 'monthly';
};

// Generate realistic mock data for 2025~2026
const generateData = (): DailyRecord[] => {
    const data: DailyRecord[] = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-12-31');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const isEvent = Math.random() > 0.95; // 5% chance of an event
        data.push({
            date: d.toISOString().split('T')[0],
            visitors: Math.floor(Math.random() * 5000) + (isEvent ? 8000 : 1000),
            avgDurationSec: Math.floor(Math.random() * 180) + 120, // 2 to 5 mins
            clicks: Math.floor(Math.random() * 300) + 50,
            impressions: Math.floor(Math.random() * 4000) + 1000,
            isEvent,
        });
    }
    return data;
};

export const mockMetricsData = generateData();

export const getAggregatedMetrics = (startStr: string, endStr: string) => {
    // Pad with 0s if dates are missing in real world, but our mock covers all.
    // However, to support 'no data' scenarios we pad dates.
    const padded: DailyRecord[] = [];
    const current = new Date(startStr);
    const end = new Date(endStr);

    while (current <= end) {
        const dStr = current.toISOString().split('T')[0];
        const found = mockMetricsData.find(x => x.date === dStr);
        if (found) {
            padded.push(found);
        } else {
            padded.push({
                date: dStr,
                visitors: 0,
                avgDurationSec: 0,
                clicks: 0,
                impressions: 0,
                isEvent: false
            });
        }
        current.setDate(current.getDate() + 1);
    }

    let totalVisitors = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalDuration = 0;

    padded.forEach(r => {
        totalVisitors += r.visitors;
        totalClicks += r.clicks;
        totalImpressions += r.impressions;
        totalDuration += r.avgDurationSec;
    });

    const avgDuration = padded.length > 0 ? Math.floor(totalDuration / padded.length) : 0;
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

    return {
        paddedRecords: padded,
        totalVisitors,
        avgDurationSec: avgDuration,
        ctr: `${ctr}%`
    };
};

export const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

export const processChartData = (records: DailyRecord[], mode: TimeRange) => {
    const grouped: Record<string, { visitors: number, isEvent: boolean }> = {};
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    records.forEach(r => {
        const dateObj = new Date(r.date);
        let key = '';

        if (mode === 'daily') {
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            const day = dayNames[dateObj.getDay()];
            key = `${m}/${d} (${day})`;
        } else if (mode === 'weekly') {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const week = Math.ceil(dateObj.getDate() / 7);
            key = `${year}-${month} W${week}`;
        } else if (mode === 'monthly') {
            const year = String(dateObj.getFullYear()).slice(-2);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            key = `${year}/${month}`;
        }

        if (!grouped[key]) {
            grouped[key] = { visitors: 0, isEvent: false };
        }
        grouped[key].visitors += r.visitors;
        if (r.isEvent) grouped[key].isEvent = true;
    });

    return Object.entries(grouped).map(([name, data]) => ({
        name,
        visitors: data.visitors,
        isEvent: data.isEvent
    }));
};
