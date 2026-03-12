"use client";

import React, { useState, useEffect } from 'react';
import { Instagram, CheckCircle2, Circle, X, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export type InstagramData = {
    month: string; // Format: YYYY-MM
    followers: number;
    views: number;
    posts: number;
    followerViewRate: number;
    nonFollowerViewRate: number;
};

// 2025년 6월부터 지난달까지의 리스트 생성
const generateMonthList = () => {
    const list = [];
    const startDate = new Date(2025, 5, 1); // 2025-06
    const curDate = new Date();
    // 지난달 (오늘이 3월 12일이면 2월 1일)
    const endDate = new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1);

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

interface InstagramModalProps {
    isOpen: boolean;
    onClose: (wasSaved: boolean) => void;
}

export default function InstagramModal({ isOpen, onClose }: InstagramModalProps) {
    const [data, setData] = useState<InstagramData[]>([]);
    const monthList = generateMonthList();
    const [selectedMonth, setSelectedMonth] = useState<string>(monthList[0] || '');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        followers: '',
        views: '',
        posts: '',
        followerViewRate: '',
        nonFollowerViewRate: '',
    });

    useEffect(() => {
        if (isOpen) {
            const fetchSupabaseData = async () => {
                const { data: metrics, error } = await supabase
                    .from('instagram_metrics')
                    .select('*')
                    .order('year_month', { ascending: true });

                if (error) {
                    console.error('Error fetching from Supabase:', error);
                    return;
                }

                if (metrics) {
                    const mappedData: InstagramData[] = metrics.map((m: any) => ({
                        month: m.year_month,
                        followers: Number(m.followers) || 0,
                        views: Number(m.total_views) || 0,
                        posts: Number(m.total_posts) || 0,
                        followerViewRate: Number(m.follower_view_rate) || 0,
                        nonFollowerViewRate: Number(m.non_follower_view_rate) || 0,
                    }));
                    setData(mappedData);
                }
            };

            fetchSupabaseData();
            setSelectedMonth(monthList[0] || ''); // 가장 최신 달이 기본 선택되도록
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedMonth) {
            const existing = data.find(d => d.month === selectedMonth);
            if (existing) {
                setFormData({
                    followers: existing.followers.toString(),
                    views: existing.views.toString(),
                    posts: existing.posts.toString(),
                    followerViewRate: existing.followerViewRate.toString(),
                    nonFollowerViewRate: existing.nonFollowerViewRate.toString(),
                });
            } else {
                setFormData({ followers: '', views: '', posts: '', followerViewRate: '', nonFollowerViewRate: '' });
            }
        }
    }, [selectedMonth, data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMonth) return alert('월을 선택해주세요.');

        setIsLoading(true);

        const newItem = {
            year_month: selectedMonth,
            followers: Number(formData.followers) || 0,
            total_views: Number(formData.views) || 0,
            total_posts: Number(formData.posts) || 0,
            follower_view_rate: Number(formData.followerViewRate) || 0,
            non_follower_view_rate: Number(formData.nonFollowerViewRate) || 0,
        };

        const { error } = await supabase
            .from('instagram_metrics')
            .upsert(newItem, { onConflict: 'year_month' });

        setIsLoading(false);

        if (error) {
            console.error('Supabase Upsert Error:', error);
            alert('데이터 저장 중 오류가 발생했습니다.');
            return;
        }

        // Update local state to reflect UI changes immediately
        const mappedItem: InstagramData = {
            month: newItem.year_month,
            followers: newItem.followers,
            views: newItem.total_views,
            posts: newItem.total_posts,
            followerViewRate: newItem.follower_view_rate,
            nonFollowerViewRate: newItem.non_follower_view_rate,
        };

        const existingIndex = data.findIndex(d => d.month === mappedItem.month);
        let newData;
        if (existingIndex >= 0) {
            newData = [...data];
            newData[existingIndex] = mappedItem;
        } else {
            newData = [...data, mappedItem];
        }

        setData(newData);
        alert(`${formatMonthDisplay(selectedMonth)} 데이터가 안전하게 저장되었습니다.`);

        // Close modal and signal that a save occurred to refresh charts
        onClose(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400">
                            <Instagram size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">데이터 입력하기</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Instagram 월간 요약</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    {/* Left Column: Month List */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-y-auto max-h-48 md:max-h-none flex-shrink-0 md:flex-shrink">
                        <ul className="p-4 space-y-2">
                            {monthList.map(month => {
                                const isCompleted = data.some(d => d.month === month);
                                const isSelected = selectedMonth === month;

                                return (
                                    <li key={month}>
                                        <button
                                            onClick={() => setSelectedMonth(month)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-sm' : 'bg-white dark:bg-zinc-800/80 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 border'} `}
                                        >
                                            <span className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {formatMonthDisplay(month)}
                                            </span>
                                            {isCompleted ? (
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                            ) : (
                                                <Circle size={18} className="text-zinc-300 dark:text-zinc-600" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Right Column: Input Form */}
                    <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto bg-white dark:bg-zinc-900">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatMonthDisplay(selectedMonth)} 지표</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">해당 월의 인스타그램 성과 데이터를 입력해주세요.</p>
                            </div>
                            {data.some(d => d.month === selectedMonth) && (
                                <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={12} /> 입력됨
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">팔로워 수</label>
                                    <input
                                        type="number" name="followers" value={formData.followers} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">조회수</label>
                                    <input
                                        type="number" name="views" value={formData.views} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 transition-colors"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">월별 포스트 건수</label>
                                    <input
                                        type="number" name="posts" value={formData.posts} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">유입 비중 (%) <span className="text-xs font-normal text-zinc-500 ml-1">(선택)</span></p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">팔로워 조회 %</label>
                                        <input
                                            type="number" name="followerViewRate" value={formData.followerViewRate} onChange={handleChange} step="0.1"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">비팔로워 조회 %</label>
                                        <input
                                            type="number" name="nonFollowerViewRate" value={formData.nonFollowerViewRate} onChange={handleChange} step="0.1"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => onClose(false)}
                                    className="px-5 py-2.5 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    닫기
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {data.some(d => d.month === selectedMonth) ? '수정 및 저장' : '새 데이터 저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
