import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Clock, Calendar as CalendarIcon, Shuffle, Send, } from 'lucide-react';
import { formatDateRu } from '../utils/conflicts';
export const ConflictResolverModal = ({ conflict, channels, onClose, onResolve, }) => {
    const [selectedItemId, setSelectedItemId] = useState('');
    useEffect(() => {
        if (conflict)
            setSelectedItemId(conflict.items[1]?.id || conflict.items[0]?.id || '');
    }, [conflict]);
    const items = conflict?.items || [];
    const targetItem = items.find((it) => it.id === selectedItemId) || items[0];
    if (!conflict)
        return null;
    const handleShiftTime = (minutesToAdd) => {
        const [h, m] = targetItem.publishTime.split(':').map(Number);
        const totalMinutes = h * 60 + m + minutesToAdd;
        const newH = Math.floor((totalMinutes / 60) % 24);
        const newM = totalMinutes % 60;
        const formattedTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
        const updated = items.map((it) => it.id === targetItem.id
            ? { ...it, publishTime: formattedTime, updatedAt: new Date().toISOString() }
            : it);
        onResolve(updated);
        onClose();
    };
    const handleShiftDay = (daysToAdd) => {
        const d = new Date(targetItem.publishDate + 'T00:00:00');
        d.setDate(d.getDate() + daysToAdd);
        const pad = (value) => String(value).padStart(2, '0');
        const newDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const updated = items.map((it) => it.id === targetItem.id
            ? { ...it, publishDate: newDateStr, updatedAt: new Date().toISOString() }
            : it);
        onResolve(updated);
        onClose();
    };
    const handleChangeChannel = (channelId) => {
        const updated = items.map((it) => it.id === targetItem.id
            ? { ...it, channelId, updatedAt: new Date().toISOString() }
            : it);
        onResolve(updated);
        onClose();
    };
    const handleMoveToDraft = () => {
        const updated = items.map((it) => it.id === targetItem.id
            ? { ...it, status: 'draft', updatedAt: new Date().toISOString() }
            : it);
        onResolve(updated);
        onClose();
    };
    const otherChannels = channels.filter((ch) => ch.id !== conflict.channelId);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in", children: _jsxs("div", { className: "bg-[#211e26] border border-[#3b3546] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "p-5 border-b border-[#302a3a] flex items-center justify-between bg-[#1b1820]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-red-500/20 text-red-400", children: _jsx(AlertTriangle, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-semibold text-white", children: "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0430 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F" }), _jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "\u041F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438 \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 \u0432 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u0445 30 \u043C\u0438\u043D\u0443\u0442" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 overflow-y-auto space-y-6", children: [_jsxs("div", { className: "p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-red-400" }), _jsxs("span", { children: ["\u0421\u043B\u043E\u0442: ", _jsxs("strong", { className: "text-white", children: [formatDateRu(conflict.date), ", ", conflict.time] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 font-medium text-red-200", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: conflict.channelName })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-gray-400 block mb-2", children: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0443\u044E\u0449\u0438\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B (\u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435, \u043A\u0430\u043A\u043E\u0439 \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438):" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: items.map((item, index) => {
                                        const isSelected = item.id === targetItem.id;
                                        return (_jsxs("div", { onClick: () => setSelectedItemId(item.id), className: `p-3.5 rounded-xl border text-xs cursor-pointer transition-all relative ${isSelected
                                                ? 'bg-[#2d2535] border-[#f25a5a] shadow-lg shadow-red-500/10 ring-1 ring-[#f25a5a]'
                                                : 'bg-[#1b1820] border-[#312a3d] hover:border-gray-500 text-gray-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsxs("span", { className: "text-[10px] font-semibold text-gray-400 uppercase tracking-wider", children: ["\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B #", index + 1] }), isSelected && (_jsx("span", { className: "text-[10px] bg-[#f25a5a] text-white px-2 py-0.5 rounded font-medium", children: "\u0418\u0437\u043C\u0435\u043D\u044F\u0435\u043C\u044B\u0439" }))] }), _jsx("div", { className: "font-semibold text-white text-sm line-clamp-2 mb-1", children: item.title }), _jsx("div", { className: "text-gray-400 text-[11px] mb-2 line-clamp-2", children: item.description || 'Без описания' }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] text-gray-400 pt-2 border-t border-[#372f44]", children: [_jsxs("span", { children: ["\u0410\u0432\u0442\u043E\u0440: ", item.author.name] }), _jsx("span", { children: "\u00B7" }), _jsx("span", { className: "text-amber-300", children: item.publishTime })] })] }, item.id));
                                    }) })] }), _jsxs("div", { className: "space-y-3 pt-2", children: [_jsx("h4", { className: "text-xs font-semibold text-gray-300 uppercase tracking-wider", children: "\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0443\u0441\u0442\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043A\u043E\u043B\u043B\u0438\u0437\u0438\u0438:" }), _jsxs("div", { className: "p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("span", { className: "text-xs font-medium text-gray-200 flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-4 h-4 text-rose-400" }), "\u0421\u0434\u0432\u0438\u043D\u0443\u0442\u044C \u0432\u0440\u0435\u043C\u044F \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0430:"] }) }), _jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [_jsxs("button", { onClick: () => handleShiftTime(30), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: ["+30 \u043C\u0438\u043D\u0443\u0442 (", conflict.time, " \u2794 ... )"] }), _jsx("button", { onClick: () => handleShiftTime(60), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: "+1 \u0447\u0430\u0441 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F)" }), _jsx("button", { onClick: () => handleShiftTime(120), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: "+2 \u0447\u0430\u0441\u0430" })] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2", children: [_jsxs("span", { className: "text-xs font-medium text-gray-200 flex items-center gap-1.5", children: [_jsx(CalendarIcon, { className: "w-4 h-4 text-purple-400" }), "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u0435\u043D\u044C:"] }), _jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [_jsx("button", { onClick: () => handleShiftDay(1), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u0435\u043D\u044C (+1 \u0434\u0435\u043D\u044C)" }), _jsx("button", { onClick: () => handleShiftDay(2), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: "\u0427\u0435\u0440\u0435\u0437 2 \u0434\u043D\u044F" })] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2", children: [_jsxs("span", { className: "text-xs font-medium text-gray-200 flex items-center gap-1.5", children: [_jsx(Shuffle, { className: "w-4 h-4 text-blue-400" }), "\u0421\u043C\u0435\u043D\u0438\u0442\u044C \u043A\u0430\u043D\u0430\u043B \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u044F:"] }), _jsx("div", { className: "flex flex-wrap gap-2 pt-1", children: otherChannels.map((ch) => (_jsxs("button", { onClick: () => handleChangeChannel(ch.id), className: "px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors", children: ["\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0432 \u00AB", ch.name, "\u00BB"] }, ch.id))) })] }), _jsx("div", { className: "pt-1 flex items-center justify-between text-xs", children: _jsx("button", { onClick: handleMoveToDraft, className: "text-gray-400 hover:text-white underline", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0430 \u044D\u0442\u0430\u043F \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0438 (\u0432 \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A)" }) })] })] }), _jsx("div", { className: "p-4 border-t border-[#302a3a] bg-[#1a1720] flex items-center justify-end gap-3", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-[#362f42] transition-colors", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" }) })] }) }));
};
