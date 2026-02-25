import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Cache responses for 1 hour (Vercel Serverless Function optimization)
export const revalidate = 3600;

const propertyId = process.env.GA_PROPERTY_ID;

// Parse the private key correctly, replacing escaped newlines with actual newlines
const privateKey = process.env.GA_PRIVATE_KEY
    ? process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: privateKey,
        project_id: process.env.GA_PROJECT_ID,
    },
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startDate, endDate } = body;

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'startDate and endDate are required' },
                { status: 400 }
            );
        }

        if (!propertyId || !privateKey) {
            console.error('GA4 credentials missing in environment variables');
            return NextResponse.json(
                { error: 'Analytics configuration is missing.' },
                { status: 500 }
            );
        }

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: startDate,
                    endDate: endDate,
                },
            ],
            dimensions: [
                { name: 'date' }
            ],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
                { name: 'eventCount' },
                { name: 'averageSessionDuration' }
            ],
            orderBys: [
                {
                    dimension: {
                        dimensionName: 'date'
                    }
                }
            ]
        });

        const rows = response.rows || [];

        let totalVisitors = 0;
        let totalSessionDuration = 0;
        let totalEventCount = 0;

        const records = rows.map(row => {
            const dateStr = row.dimensionValues?.[0]?.value || '';
            // Format YYYYMMDD to YYYY-MM-DD
            const formattedDate = dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

            const visitors = Number(row.metricValues?.[0]?.value || 0);
            const views = Number(row.metricValues?.[1]?.value || 0);
            const events = Number(row.metricValues?.[2]?.value || 0);
            const avgDuration = Number(row.metricValues?.[3]?.value || 0);

            totalVisitors += visitors;
            totalSessionDuration += avgDuration;
            totalEventCount += events;

            return {
                date: formattedDate,
                visitors: visitors,
                pageViews: views,
                avgDurationSec: avgDuration
            };
        });

        // Simple average across days with traffic
        const avgDurationSec = rows.length > 0 ? Math.round(totalSessionDuration / rows.length) : 0;

        // Mock CTR based on events / visitors if needed, or return raw events
        const ctr = totalVisitors > 0 ? Math.min(100, Math.round((totalEventCount / totalVisitors) * 10)) : 0;

        return NextResponse.json({
            records,
            totalVisitors,
            avgDurationSec,
            ctr: `${ctr}%`,
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching GA4 data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
