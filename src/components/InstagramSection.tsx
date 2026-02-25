"use client";

import React, { useState, useEffect } from 'react';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { InstagramData } from './InstagramModal';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';


const initialMockData: InstagramData[] = [
    { month: '2025-06', followers: 85, views: 1500, posts: 11, followerViewRate: 30, nonFollowerViewRate: 70 },
    { month: '2025-07', followers: 156, views: 2300, posts: 4, followerViewRate: 35, nonFollowerViewRate: 65 },
    { month: '2025-10', followers: 146, views: 657, posts: 5, followerViewRate: 40, nonFollowerViewRate: 60 },
    { month: '2025-11', followers: 145, views: 100, posts: 0, followerViewRate: 45, nonFollowerViewRate: 55 },
    { month: '2025-12', followers: 145, views: 122, posts: 0, followerViewRate: 50, nonFollowerViewRate: 50 },
    { month: '2026-01', followers: 148, views: 993, posts: 5, followerViewRate: 55, nonFollowerViewRate: 45 },
];

const COLORS = ['#3b82f6', '#f43f5e'];

// 2025년 6월부터 지난달까지의 리스트 생성
const generateMonthList = () => {
    const list = [];
    const startDate = new Date(2025, 5, 1); // 2025-06
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // 지난달

    let current = startDate;
    while (current <= endDate) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        list.push(`${year}-${month}`);
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return list.reverse(); // 최신순 정렬
};

const formatMonthDisplay = (yyyyMM: string) => {
    if (!yyyyMM) return '';
    const [year, month] = yyyyMM.split('-');
    return `${year}년 ${parseInt(month, 10)}월`;
};

export default function InstagramSection({ refreshTrigger }: { refreshTrigger?: number }) {
    const [data, setData] = useState<InstagramData[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('instagramData');
        if (saved) {
            setData(JSON.parse(saved));
        }
    }, [refreshTrigger]);

    // 2025년 8월부터 2026년 1월까지 6개월 범위 (항상 순서대로 노출)
    const getSixMonthsRange = () => {
        const range = [];
        let date = new Date(2025, 7, 1); // 2025-08
        const end = new Date(2026, 0, 1); // 2026-01
        while (date <= end) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            range.push(`${y}-${m}`);
            date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }
        return range;
    };

    const targetMonths = getSixMonthsRange();

    const chartData = targetMonths.map(monthStr => {
        const found = data.find(d => d.month === monthStr);
        const [y, m] = monthStr.split('-');
        return {
            month: monthStr,
            displayMonth: `${y.slice(2)}/${m}`,
            followers: found ? found.followers : 0,
            views: found ? found.views : 0,
            posts: found ? found.posts : 0,
            followerViewRate: found ? found.followerViewRate : 0,
            nonFollowerViewRate: found ? found.nonFollowerViewRate : 0,
        };
    });

    const latestData = chartData.length > 0 ? chartData[chartData.length - 1] : { followerViewRate: 0, nonFollowerViewRate: 0, displayMonth: '-', views: 0 };
    const totalViews = latestData.views;

    const donutData = [
        { name: '팔로워', value: latestData.followerViewRate },
        { name: '비팔로워', value: latestData.nonFollowerViewRate },
    ];

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-6 w-full">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all flex-grow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">성과 트렌드</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">월별 팔로워, 조회수, 포스트 복합 차트</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.1} />
                                <XAxis dataKey="displayMonth" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={60} tickFormatter={(value) => value.toLocaleString()} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 15]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={45} tickFormatter={(value) => value.toLocaleString()} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #ffffff)', color: 'var(--tooltip-color, #18181b)' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                                    labelStyle={{ color: '#71717a', marginBottom: '8px', fontSize: '12px' }}
                                    formatter={(value: any) => {
                                        if (typeof value === 'number') return value.toLocaleString();
                                        return value;
                                    }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar yAxisId="right" dataKey="posts" name="포스트 건수" fill="#eab308" barSize={20} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="left" type="monotone" dataKey="followers" name="팔로워 수" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="left" type="monotone" dataKey="views" name="조회수" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-violet-100 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                            <PieChartIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">유입 분석</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {totalViews > 0 ? `최근 데이터(${latestData.displayMonth}) 팔로워 vs 비팔로워 비중` : '데이터가 없습니다.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex-grow w-full flex items-center justify-center relative min-h-[192px]">
                        {totalViews > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 500 }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">총 조회수</span>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalViews.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-zinc-400">유입 비중 데이터가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
