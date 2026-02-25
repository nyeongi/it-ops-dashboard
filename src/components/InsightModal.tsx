import React from 'react';
import { X, Lightbulb, TrendingUp } from 'lucide-react';

interface InsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    pagePath: string;
}

const getPageInsights = (path: string) => {
    switch (path) {
        case '/결제진행 (결제수단 선택)':
            return {
                hypotheses: [
                    "1. 선호하는 결제 수단(예: 특정 간편결제)의 부재로 인한 이탈",
                    "2. 결제 직전 예상치 못한 추가 비용(배송비/수수료) 노출",
                    "3. 결제 모듈 진입 시 발생하는 로딩 지연이나 오류",
                ],
                suggestion: "💡 결제 수단 다양화 및 결제 전 단계에서 최종 금액을 명확히 안내하세요."
            };
        case '/상품상세/베스트셀러-A':
            return {
                hypotheses: [
                    "1. 상품 가격이 기대치보다 높아 망설임 발생",
                    "2. 너무 긴 상세 이미지로 인해 '장바구니/구매' 요소 도달 전 피로도 증가",
                    "3. 필수 옵션 선택 UI가 직관적이지 않아 혼란 가중",
                ],
                suggestion: "💡 구매 버튼(CTA)을 하단에 고정(Sticky) 시키고, 리뷰/요약 영역을 위로 올리세요."
            };
        case '/이벤트가입안내':
            return {
                hypotheses: [
                    "1. 가입 양식에 요구되는 정보가 과도하게 많음",
                    "2. 이벤트 혜택이 즉각적으로 와닿지 않는 모호한 문구 사용",
                    "3. 소셜 로그인(카카오, 네이버) 옵션의 시인성 부족",
                ],
                suggestion: "💡 입력 필드를 최소화하고 소셜 로그인 버튼을 가장 눈에 띄게 배치하세요."
            };
        default:
            return {
                hypotheses: [
                    "1. 페이지의 핵심 가치 제안(Value Proposition)이 불명확함",
                    "2. 다음 행동을 유도하는 진입점(CTA)의 배치 부적절",
                    "3. 모바일 환경에서의 텍스트 가독성 문제",
                ],
                suggestion: "💡 화면의 시선 흐름(Heatmap)을 분석하여 핵심 버튼의 위치를 재조정하세요."
            };
    }
};

export default function InsightModal({ isOpen, onClose, pagePath }: InsightModalProps) {
    if (!isOpen) return null;

    const insights = getPageInsights(pagePath);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <Lightbulb size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">AI 이탈 원인 가설 분석</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">분석 대상 페이지</div>
                        <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono tracking-tight border border-zinc-200 dark:border-zinc-700">
                            {pagePath}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500" />
                            가장 유력한 이탈 가설 TOP 3
                        </div>
                        <ul className="space-y-3">
                            {insights.hypotheses.map((hypothesis, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300 bg-blue-50 dark:bg-blue-500/5 p-3 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
                                    <span className="leading-relaxed">{hypothesis}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1">개선 제언</div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                            {insights.suggestion}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
