import React from 'react';
import { Lightbulb, Layout, Sparkles } from 'lucide-react';

interface AIStrategyProps {
    instagramInsight?: {
        increaseRate: number;
        recommendedDay: string;
        contentType: string;
    };
    peakTimeInsight?: {
        peakPeriod: string;
        type: string;
    };
    dropOffInsight?: {
        pageName: string;
        dropRate: number;
        suggestion: string;
    };
    onViewReport?: (type: string) => void;
}

export default function AIStrategyCards({
    instagramInsight = { increaseRate: 0, recommendedDay: '알 수 없음', contentType: '콘텐츠' },
    peakTimeInsight = { peakPeriod: '조회 불가', type: '시간대' },
    dropOffInsight = { pageName: '알 수 없음', dropRate: 0, suggestion: '데이터를 분석 중입니다.' },
    onViewReport
}: AIStrategyProps) {

    const strategies = [
        {
            type: 'content',
            title: '데이터 기반 콘텐츠 전략',
            description: `최근 데이터에 따르면 이전 기간 대비 조회수가 ${instagramInsight.increaseRate}% 향상되었습니다. 가장 방문자 유입이 많은 시점(${peakTimeInsight.peakPeriod} ${peakTimeInsight.type})을 타겟팅하여 ${instagramInsight.recommendedDay}에 [${instagramInsight.contentType}]를 집중 발행해 보세요.`,
            icon: <Sparkles size={20} className="text-amber-500" />,
            bg: 'bg-amber-100 dark:bg-amber-500/10',
            border: 'border-amber-200 dark:border-amber-500/20'
        },
        {
            type: 'ui',
            title: '핵심 이탈 구간 UX 개선',
            description: `현재 [${dropOffInsight.pageName}] 페이지의 이탈률이 ${dropOffInsight.dropRate}%로 가장 높게 나타나고 있습니다. AI 분석 결과, ${dropOffInsight.suggestion} 조치가 필요합니다. 해당 페이지의 UI/UX를 우선적으로 개선하세요.`,
            icon: <Layout size={20} className="text-purple-500" />,
            bg: 'bg-purple-100 dark:bg-purple-500/10',
            border: 'border-purple-200 dark:border-purple-500/20'
        }
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI 운영 전략</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">자동 분석 통찰 및 추천 사항</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {strategies.map((strategy, idx) => (
                    <div key={idx} className={`rounded-xl p-5 border ${strategy.border} bg-white dark:bg-zinc-900 flex flex-col relative overflow-hidden group`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${strategy.bg}`}></div>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {strategy.icon}
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {strategy.type === 'content' ? '콘텐츠 전략' : 'UI 개선'}
                                </span>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                신규 통찰
                            </span>
                        </div>
                        <h3 className="text-md font-medium text-zinc-800 dark:text-zinc-200 mb-2">{strategy.title}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-grow">
                            {strategy.description}
                        </p>
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => onViewReport && onViewReport(strategy.type)}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-200"
                            >
                                상세 리포트 보기 →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
