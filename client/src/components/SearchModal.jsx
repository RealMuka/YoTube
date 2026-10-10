import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatDateRu, isItemInConflict, STATUS_MAP } from '../utils/conflicts';
export const SearchModal = ({ isOpen, onClose, items, conflicts, onSelectItem, }) => {
    const [query, setQuery] = useState('');
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const results = items.filter((item) => {
        if (!query.trim())
            return true;
        const q = query.toLowerCase();
        return (item.title.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.author.name.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q)));
    });
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in", children: _jsxs("div", { className: "bg-[#211e26] border border-[#393245] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[75vh]", children: [_jsxs("div", { className: "p-4 border-b border-[#2e2838] flex items-center gap-3 bg-[#1c1922]", children: [_jsx(Search, { className: "w-5 h-5 text-gray-400 shrink-0" }), _jsx("input", { type: "text", autoFocus: true, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0430, \u0442\u0435\u0433 \u0438\u043B\u0438 \u043A\u0430\u043D\u0430\u043B", className: "w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none" }), _jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "p-3 overflow-y-auto space-y-2 flex-1", children: results.length === 0 ? (_jsxs("div", { className: "py-10 text-center text-xs text-gray-400", children: ["\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u00AB", query, "\u00BB \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"] })) : (results.map((item) => {
                        const inConflict = isItemInConflict(item.id, conflicts);
                        const statusMeta = STATUS_MAP[item.status];
                        return (_jsxs("div", { onClick: () => {
                                onSelectItem(item);
                                onClose();
                            }, className: `p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-3 ${inConflict
                                ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                                : 'bg-[#1c1922] border-[#2e2838] hover:border-[#483a5a] hover:bg-[#25202c]'}`, children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#2b2436] text-purple-200", children: item.category }), _jsx("span", { className: "text-[10px] font-medium", style: { color: statusMeta.color }, children: statusMeta.label }), inConflict && (_jsxs("span", { className: "text-[10px] font-bold text-red-400 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442"] }))] }), _jsx("h4", { className: "text-xs font-semibold text-white truncate", children: item.title }), _jsxs("div", { className: "flex items-center gap-3 text-[10px] text-gray-400 mt-1", children: [_jsxs("span", { children: [formatDateRu(item.publishDate), " \u00B7 ", item.publishTime] }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: item.author.name })] })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-500 shrink-0" })] }, item.id));
                    })) }), _jsxs("div", { className: "p-2.5 bg-[#19161e] border-t border-[#292433] text-[10px] text-gray-400 flex items-center justify-between px-4", children: [_jsx("span", { children: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F: \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u043A \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0443" }), _jsx("span", { children: "Esc \u0434\u043B\u044F \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F" })] })] }) }));
};
