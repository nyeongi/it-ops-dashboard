import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TimeRange, processChartData, DailyRecord } from '@/utils/metricsDataUtils';

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { visitors: number; isEvent: boolean } }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Mock average logic for demonstration
        const avgVisitors = Object.values(data).reduce((acc: number, val: unknown) => typeof val === 'number' ? val * 0.8 : acc, 0) as number;
        const percentChange = (((data.visitors - avgVisitors) / avgVisitors) * 100).toFixed(1);
        const isPositive = parseFloat(percentChange) > 0;

        return (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1 mb-2 font-medium">{label}</p>
                <div className="flex items-center gap-3">
                    <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">{data.visitors.toLocaleString()}</p>
                    <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100/50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                        {isPositive ? '+' : ''}{percentChange}%
                    </div>
                </div>
                {data.isEvent && (
                    <p className="text-xs text-violet-500 font-medium mt-2">✨ 프로모션 진행 일자</p>
                )}
            </div>
        );
    }
    return null;
};

interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: { isEvent: boolean };
}

const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    if (cx && cy && payload?.isEvent) {
        return (
            <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2" />
                <circle cx="6" cy="6" r="6" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="2 2" className="animate-[spin_4s_linear_infinite]" />
            </svg>
        );
    }
    return null;
};

interface VisitorTrendWidgetProps {
    viewMode: TimeRange;
    records: DailyRecord[];
    totalVisitors: number;
}

export default function VisitorTrendWidget({ viewMode, records, totalVisitors }: VisitorTrendWidgetProps) {

    const chartData = useMemo(() => processChartData(records, viewMode), [records, viewMode]);

    const getInsightText = () => {
        if (!chartData || chartData.length === 0) return '데이터가 없습니다.';
        const maxData = [...chartData].sort((a, b) => b.visitors - a.visitors)[0];

        switch (viewMode) {
            case 'daily': return `조회하신 기간 중 ${maxData.name}에 방문자가 가장 많았습니다.`;
            case 'weekly': return `선택된 주차 중 ${maxData.name}에 유입 피크를 기록했습니다.`;
            case 'monthly': return `최대 유입을 보인 달은 ${maxData.name}입니다.`;
        }
    };

    return (
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                        총 방문자 수
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalVisitors.toLocaleString()}</p>
                        <span className="text-sm font-bold text-emerald-500 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 inline-block px-2.5 py-1 rounded-lg">
                        💡 {getInsightText()}
                    </p>
                </div>
            </div>

            <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVisitorColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#71717a', fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={50} tickFormatter={(value: any) => value.toLocaleString()} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a1a1aa', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVisitorColor)"
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                            dot={<CustomDot />}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
