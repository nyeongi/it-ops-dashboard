"use client";

import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';

const mockData = [
    { name: 'Mon', pageViews: 4000, bounceRate: 45 },
    { name: 'Tue', pageViews: 4500, bounceRate: 42 },
    { name: 'Wed', pageViews: 3800, bounceRate: 48 },
    { name: 'Thu', pageViews: 5200, bounceRate: 39 },
    { name: 'Fri', pageViews: 6100, bounceRate: 35 },
    { name: 'Sat', pageViews: 7500, bounceRate: 32 },
    { name: 'Sun', pageViews: 8200, bounceRate: 30 },
];

export default function WebMetricsChart() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <Activity size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">웹사이트 주요 지표</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">페이지 뷰 vs. 이탈률 (%)</p>
                </div>
            </div>

            <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={mockData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={50} tickFormatter={(value) => value.toLocaleString()} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={40} tickFormatter={(value) => value.toLocaleString()} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#18181b', fontWeight: 500 }}
                            formatter={(value: any) => {
                                if (typeof value === 'number') return value.toLocaleString();
                                return value;
                            }}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="pageViews"
                            name="페이지 뷰"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorViews)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="bounceRate"
                            name="이탈률 (%)"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
