"use client";

import React, { useState, useEffect, useMemo } from 'react';
import InstagramSection from '@/components/InstagramSection';
import AIStrategyCards from '@/components/AIStrategyCards';
import InstagramModal from '@/components/InstagramModal';
import InsightModal from '@/components/InsightModal';
import VisitorTrendWidget from '@/components/VisitorTrendWidget';
import { Clock, MousePointerClick, ArrowRight, Edit2, Calendar } from 'lucide-react';
import { TimeRange, getAggregatedMetrics, formatDuration, getAutoDateRange, detectViewMode, processChartData } from '@/utils/metricsDataUtils';
import { supabase } from '@/utils/supabaseClient';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedExitPath, setSelectedExitPath] = useState('');

  const [viewMode, setViewMode] = useState<TimeRange>('daily');
  const [startDate, setStartDate] = useState(() => getAutoDateRange('daily').startDate);
  const [endDate, setEndDate] = useState(() => getAutoDateRange('daily').endDate);

  const handleViewModeChange = (mode: TimeRange) => {
    setViewMode(mode);
    const range = getAutoDateRange(mode);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') setStartDate(value);
    else setEndDate(value);

    const newStart = type === 'start' ? value : startDate;
    const newEnd = type === 'end' ? value : endDate;

    if (newStart && newEnd) {
      setViewMode(detectViewMode(newStart, newEnd));
    }
  };

  const [metricsObj, setMetricsObj] = useState<{ paddedRecords: any[], totalVisitors: number, avgDurationSec: number, ctr: string }>({
    paddedRecords: [],
    totalVisitors: 0,
    avgDurationSec: 0,
    ctr: '0%',
  });
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  useEffect(() => {
    const fetchWebsiteMetrics = async () => {
      if (!startDate || !endDate) return;
      setIsMetricsLoading(true);
      try {
        const res = await fetch('/api/ga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate }),
        });
        const data = await res.json();
        if (res.ok) {
          setMetricsObj({
            paddedRecords: data.records || [],
            totalVisitors: data.totalVisitors || 0,
            avgDurationSec: data.avgDurationSec || 0,
            ctr: data.ctr || '0%',
          });
        } else {
          console.error('GA4 fetch error:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch from /api/ga', error);
      } finally {
        setIsMetricsLoading(false);
      }
    };
    fetchWebsiteMetrics();
  }, [startDate, endDate]);  // We need to pass a refresh trigger to InstagramSection when modal closes after save
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const handleModalClose = (wasSaved: boolean) => {
    setIsModalOpen(false);
    if (wasSaved) setLastUpdated(Date.now());
  };

  const handleExitClick = (path: string) => {
    setSelectedExitPath(path);
    setIsInsightModalOpen(true);
  };

  // Dynamic AI Strategy Computations
  const [instagramInsight, setInstagramInsight] = useState({ increaseRate: 0, recommendedDay: '금요일', contentType: 'IT 행사 요약' });
  const [peakTimeInsight, setPeakTimeInsight] = useState({ peakPeriod: '', type: '수요일 오후 2시' });

  useEffect(() => {
    // 1. Instagram Logic (Trend)
    const fetchInstagramTrend = async () => {
      const { data: parsedData, error } = await supabase
        .from('instagram_metrics')
        .select('*')
        .order('year_month', { ascending: true });

      if (!error && parsedData && parsedData.length >= 2) {
        // Compare last two months for a simple mock insight
        const last = parsedData[parsedData.length - 1];
        const prev = parsedData[parsedData.length - 2];
        const rate = prev.total_views > 0 ? Math.round(((last.total_views - prev.total_views) / prev.total_views) * 100) : 15;
        // Mock recommended day based on highest views correlation
        setInstagramInsight({
          increaseRate: rate > 0 ? rate : 15, // Fallback positive for demo
          recommendedDay: last.total_posts > 5 ? '목요일' : '수요일',
          contentType: 'IT 행사 요약'
        });
      }
    };
    fetchInstagramTrend();

    // 2. Visitor Logic (Peak time)
    const cData = processChartData(metricsObj.paddedRecords, viewMode);
    if (cData && cData.length > 0) {
      const maxData = [...cData].sort((a, b) => b.visitors - a.visitors)[0];
      setPeakTimeInsight({
        peakPeriod: maxData.name,
        type: '오후 2시 ~ 4시' // Mocking time as the chart data only provides dates
      });
    }

  }, [lastUpdated, metricsObj.paddedRecords, viewMode]);

  // 3. Drop-off Logic
  const dropOffInsight = {
    pageName: '/결제진행 (결제수단 선택)',
    dropRate: 45,
    suggestion: '결제 수단 다양화 및 결제 전 단계에서 최종 금액 명확히 안내'
  };

  const handleViewReport = (type: string) => {
    if (type === 'ui') {
      setSelectedExitPath(dropOffInsight.pageName);
      setIsInsightModalOpen(true);
    } else {
      alert("해당 리포트는 준비 중입니다.");
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Avoid hydration mismatch on server render
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-6 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">통합 데이터 대시보드 ⚡</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">통합 데이터 대시보드 및 AI 운영 전략</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-500/20"
            >
              <Edit2 size={16} />
              <span>데이터 입력하기</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">실시간 동기화 중</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-stretch">
          <section className="flex flex-col h-full">
            {/* Website Metrics (Left Section) */}
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 select-none">웹사이트 주요 지표</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <Calendar size={14} className="text-zinc-400 ml-1" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
                    />
                    <span className="text-zinc-400 text-xs">~</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                    <button
                      onClick={() => handleViewModeChange('daily')}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'daily' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'}`}
                    >
                      일별
                    </button>
                    <button
                      onClick={() => handleViewModeChange('weekly')}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'weekly' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'}`}
                    >
                      주별
                    </button>
                    <button
                      onClick={() => handleViewModeChange('monthly')}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'}`}
                    >
                      월별
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {/* Metric Widgets */}
                <VisitorTrendWidget
                  viewMode={viewMode}
                  records={metricsObj.paddedRecords}
                  totalVisitors={metricsObj.totalVisitors}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-between">
                    <div className="flex flex-col justify-center h-full">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">평균 체류 시간</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatDuration(metricsObj.avgDurationSec)}</p>
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Clock size={20} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-between">
                    <div className="flex flex-col justify-center h-full">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">행사 클릭률</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{metricsObj.ctr}</p>
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <MousePointerClick size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Pages List */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 px-1">이탈 지점 분석 (TOP 3)</h3>
                <ul className="space-y-2 mt-4">
                  <li
                    onClick={() => handleExitClick('/결제진행 (결제수단 선택)')}
                    className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800/80 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">/결제진행 (결제수단 선택)</span>
                      <span className="text-xs text-zinc-400 font-medium mt-0.5">No data</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </li>
                  <li
                    onClick={() => handleExitClick('/상품상세/베스트셀러-A')}
                    className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800/80 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">/상품상세/베스트셀러-A</span>
                      <span className="text-xs text-zinc-400 font-medium mt-0.5">No data</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </li>
                  <li
                    onClick={() => handleExitClick('/이벤트가입안내')}
                    className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800/80 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">/이벤트가입안내</span>
                      <span className="text-xs text-zinc-400 font-medium mt-0.5">No data</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Visual Divider Between Sections (Hidden on Mobile) */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-zinc-200/50 dark:bg-zinc-800/50 -translate-x-1/2"></div>

          <section className="flex flex-col h-full">
            {/* Instagram Charts Section */}
            <InstagramSection refreshTrigger={lastUpdated} startDate={startDate} endDate={endDate} />
          </section>
        </div>
        <section className="col-span-1 lg:col-span-12 mt-4">
          <AIStrategyCards
            instagramInsight={instagramInsight}
            peakTimeInsight={peakTimeInsight}
            dropOffInsight={dropOffInsight}
            onViewReport={handleViewReport}
          />
          <InstagramModal
            isOpen={isModalOpen}
            onClose={(wasSaved: boolean) => handleModalClose(wasSaved)}
          />
          <InsightModal
            isOpen={isInsightModalOpen}
            onClose={() => setIsInsightModalOpen(false)}
            pagePath={selectedExitPath}
          />
        </section>
      </div>
    </div >
  );
}
