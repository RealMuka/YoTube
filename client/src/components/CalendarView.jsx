import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Clock, } from 'lucide-react';
import { CATEGORIES } from '../data/appConfig';
import { getConflictForItem, isItemInConflict } from '../utils/conflicts';
export const CalendarView = ({ items, channels, conflicts, onSelectItem, onCreateAtDate, onMoveItem, onOpenConflictResolver, selectedChannelId, }) => {
    const [viewMode, setViewMode] = useState('week');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [onlyConflicts, setOnlyConflicts] = useState(false);
    const getLocalDateString = (date) => {
        const pad = (value) => String(value).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };
    const today = getLocalDateString(new Date());
    const [currentWeekStart, setCurrentWeekStart] = useState(() => today);
    const getWeekDays = (startStr) => {
        const days = [];
        const baseDate = new Date(startStr + 'T00:00:00');
        const dayNamesRu = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
        for (let i = 0; i < 7; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dateNum = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dateNum}`;
            const dayOfWeek = dayNamesRu[d.getDay()];
            days.push({
                dateStr,
                dayLabel: `${dayOfWeek}, ${dateNum}.${month}`,
                isToday: dateStr === today,
                dayNumber: dateNum,
            });
        }
        return days;
    };
    const weekDays = getWeekDays(currentWeekStart);
    const monthDays = (() => {
        const selected = new Date(`${currentWeekStart}T00:00:00`);
        const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
        const firstWeekday = (first.getDay() + 6) % 7;
        const gridStart = new Date(first);
        gridStart.setDate(first.getDate() - firstWeekday);
        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + index);
            return {
                dateStr: getLocalDateString(date),
                dayNumber: date.getDate(),
                inCurrentMonth: date.getMonth() === selected.getMonth(),
            };
        });
    })();
    const handlePrevPeriod = () => {
        const date = new Date(`${currentWeekStart}T00:00:00`);
        if (viewMode === 'month') {
            date.setDate(1);
            date.setMonth(date.getMonth() - 1);
        }
        else {
            date.setDate(date.getDate() - 7);
        }
        setCurrentWeekStart(getLocalDateString(date));
    };
    const handleNextPeriod = () => {
        const date = new Date(`${currentWeekStart}T00:00:00`);
        if (viewMode === 'month') {
            date.setDate(1);
            date.setMonth(date.getMonth() + 1);
        }
        else {
            date.setDate(date.getDate() + 7);
        }
        setCurrentWeekStart(getLocalDateString(date));
    };
    const handlePrevWeek = () => {
        const d = new Date(currentWeekStart + 'T00:00:00');
        d.setDate(d.getDate() - 7);
        setCurrentWeekStart(getLocalDateString(d));
    };
    const handleNextWeek = () => {
        const d = new Date(currentWeekStart + 'T00:00:00');
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(getLocalDateString(d));
    };
    const handleResetToday = () => {
        setCurrentWeekStart(today);
    };
    const filteredItems = items.filter((item) => {
        if (selectedChannelId && item.channelId !== selectedChannelId)
            return false;
        if (selectedCategory !== 'all' && item.category !== selectedCategory)
            return false;
        if (onlyConflicts && !isItemInConflict(item.id, conflicts))
            return false;
        return true;
    });
    const getCategoryLabel = (catId) => {
        return CATEGORIES.find((c) => c.id === catId)?.label || catId;
    };
    const getCardStyle = (item) => {
        const inConflict = isItemInConflict(item.id, conflicts);
        if (inConflict) {
            return {
                bg: 'bg-[#2f1b22]',
                border: 'border-red-500/80',
                title: 'text-white',
                meta: 'text-red-300',
                conflictBadge: true,
            };
        }
        if (item.category === 'social' || item.category === 'analytics') {
            return {
                bg: 'bg-[#5b52a3]/90 hover:bg-[#685eb5]',
                border: 'border-[#7c71c4]/60',
                title: 'text-white',
                meta: 'text-purple-200',
                conflictBadge: false,
            };
        }
        return {
            bg: 'bg-[#eb4b5b]/90 hover:bg-[#f25a69]',
            border: 'border-[#ff6675]/60',
            title: 'text-white',
            meta: 'text-rose-100',
            conflictBadge: false,
        };
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col h-full overflow-hidden bg-[#161418]", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-[#292431] flex flex-wrap items-center justify-between gap-4 bg-[#1a171d]", children: [_jsxs("div", { className: "flex items-center gap-1.5 p-1 bg-[#231f28] rounded-xl border border-[#342e3d]", children: [_jsx("button", { onClick: () => setViewMode('month'), className: `px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'month'
                                    ? 'bg-[#eb4b5b] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'}`, children: "\u041C\u0435\u0441\u044F\u0446" }), _jsx("button", { onClick: () => setViewMode('week'), className: `px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'week'
                                    ? 'bg-[#eb4b5b] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'}`, children: "\u041D\u0435\u0434\u0435\u043B\u044F" }), _jsx("button", { onClick: handleResetToday, className: "px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors", children: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: viewMode === 'month' ? handlePrevPeriod : handlePrevWeek, className: "p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25212c] transition-colors", title: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0430\u044F \u043D\u0435\u0434\u0435\u043B\u044F", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsx("span", { className: "text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2", children: _jsx("span", { children: viewMode === 'month'
                                        ? new Date(`${currentWeekStart}T00:00:00`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
                                        : `${weekDays[0].dayLabel.split(', ')[1]} — ${weekDays[6].dayLabel.split(', ')[1]}` }) }), _jsx("button", { onClick: viewMode === 'month' ? handleNextPeriod : handleNextWeek, className: "p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25212c] transition-colors", title: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043D\u0435\u0434\u0435\u043B\u044F", children: _jsx(ChevronRight, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-2.5 py-1.5 rounded-lg bg-[#231f28] border border-[#342e3d] text-xs text-gray-300 focus:outline-none focus:border-[#f25a5a] cursor-pointer", children: [_jsx("option", { value: "all", children: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), CATEGORIES.map((cat) => (_jsx("option", { value: cat.id, children: cat.label }, cat.id)))] }), _jsxs("button", { onClick: () => setOnlyConflicts(!onlyConflicts), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${onlyConflicts
                                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                                    : 'bg-[#231f28] text-gray-400 border-[#342e3d] hover:text-white'}`, children: [_jsx(AlertTriangle, { className: "w-3.5 h-3.5 text-red-400" }), _jsx("span", { className: "hidden sm:inline", children: "\u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u044B" }), conflicts.length > 0 && (_jsx("span", { className: "w-2 h-2 rounded-full bg-red-500" }))] })] })] }), viewMode === 'week' ? (_jsx("div", { className: "flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6", children: _jsx("div", { className: "min-w-[960px] grid grid-cols-7 gap-3 h-full", children: weekDays.map((day) => {
                        const dayItems = filteredItems.filter((it) => it.publishDate === day.dateStr);
                        const dayConflicts = conflicts.filter((c) => c.date === day.dateStr);
                        return (_jsxs("div", { key: day.dateStr, onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, onDrop: (event) => {
                                event.preventDefault();
                                const draggedItemId = event.dataTransfer.getData('text/plain');
                                if (draggedItemId)
                                    onMoveItem(draggedItemId, day.dateStr);
                            }, className: `flex flex-col rounded-2xl bg-[#1d1a22] border transition-colors ${day.isToday
                                ? 'border-[#eb4b5b]/50 ring-1 ring-[#eb4b5b]/30'
                                : 'border-[#2c2736]'}`, children: [_jsxs("div", { className: "p-3 border-b border-[#282332] flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-gray-200 uppercase tracking-wider", children: day.dayLabel }), dayConflicts.length > 0 && (_jsxs("div", { className: "text-[10px] text-red-400 font-medium flex items-center gap-1 mt-0.5", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), _jsx("span", { children: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u0438!" })] }))] }), _jsx("button", { onClick: () => onCreateAtDate(day.dateStr), className: "p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2636] transition-colors", title: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0430 \u044D\u0442\u0443 \u0434\u0430\u0442\u0443", children: _jsx(Plus, { className: "w-3.5 h-3.5" }) })] }), _jsx("div", { className: "p-2 space-y-2.5 flex-1 overflow-y-auto", children: dayItems.length === 0 ? (_jsx("div", { className: "h-24 flex items-center justify-center text-[11px] text-gray-400 italic", children: "\u041D\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0435\u0439" })) : (dayItems.map((item) => {
                                        const style = getCardStyle(item);
                                        const inConflict = isItemInConflict(item.id, conflicts);
                                        const conflict = getConflictForItem(item.id, conflicts);
                                        return (_jsxs("div", { draggable: true, onDragStart: (event) => {
                                                event.dataTransfer.setData('text/plain', item.id);
                                                event.dataTransfer.effectAllowed = 'move';
                                            }, onClick: () => onSelectItem(item), title: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u0435 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u0435\u043D\u044C, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0434\u0430\u0442\u0443", className: `p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] relative ${style.bg} ${style.border} ${inConflict ? 'conflict-card-glow ring-2 ring-red-500' : 'shadow-sm'}`, children: [item.coverImage && (_jsxs("div", { className: "mb-2 rounded-lg overflow-hidden h-20 w-full relative", children: [_jsx("img", { src: item.coverImage, alt: item.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white", children: item.publishTime })] })), inConflict && (_jsxs("div", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        if (conflict)
                                                            onOpenConflictResolver(conflict);
                                                    }, className: "mb-2 p-1.5 rounded-lg bg-red-950/80 border border-red-500 text-[10px] text-red-200 flex items-center justify-between font-medium cursor-pointer hover:bg-red-900", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "w-3 h-3 text-red-400 animate-pulse" }), "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442: ", item.publishTime] }), _jsx("span", { className: "underline", children: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044C" })] })), _jsx("h4", { className: `text-xs font-bold leading-snug line-clamp-2 ${style.title}`, children: item.title }), _jsx("div", { className: `mt-1.5 text-[10px] font-medium flex items-center gap-1.5 ${style.meta}`, children: _jsxs("span", { children: ["\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F: ", getCategoryLabel(item.category)] }) }), _jsxs("div", { className: "mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3 opacity-80" }), item.publishTime] }), _jsx("span", { className: "truncate max-w-[90px]", children: channels.find((c) => c.id === item.channelId)?.name || 'Канал' })] })] }, item.id));
                                    })) }), _jsx("div", { className: "p-2 pt-0", children: _jsxs("button", { onClick: () => onCreateAtDate(day.dateStr), className: "w-full py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-[#25202d] transition-colors flex items-center justify-center gap-1 border border-dashed border-[#342e40]", children: [_jsx(Plus, { className: "w-3 h-3" }), _jsx("span", { children: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B" })] }) })] }, day.dateStr));
                    }) }) })) : (_jsx("div", { className: "flex-1 overflow-y-auto p-4 sm:p-6", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-400", children: [_jsx("div", { children: "\u041F\u041D" }), _jsx("div", { children: "\u0412\u0422" }), _jsx("div", { children: "\u0421\u0420" }), _jsx("div", { children: "\u0427\u0422" }), _jsx("div", { children: "\u041F\u0422" }), _jsx("div", { children: "\u0421\u0411" }), _jsx("div", { children: "\u0412\u0421" })] }), _jsx("div", { className: "grid grid-cols-7 gap-2 auto-rows-fr", children: monthDays.map((day) => {
                                const dayNum = day.dayNumber;
                                const dateStr = day.dateStr;
                                const dayItems = filteredItems.filter((it) => it.publishDate === dateStr);
                                const hasConflict = dayItems.some((it) => isItemInConflict(it.id, conflicts));
                                return (_jsxs("div", { key: dateStr, onClick: () => onCreateAtDate(dateStr), onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, onDrop: (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        const draggedItemId = event.dataTransfer.getData('text/plain');
                                        if (draggedItemId)
                                            onMoveItem(draggedItemId, dateStr);
                                    }, className: `min-h-[100px] p-2 rounded-xl bg-[#1d1a22] border transition-all cursor-pointer hover:border-[#f25a5a]/60 ${!day.inCurrentMonth ? 'opacity-40' : ''} ${hasConflict
                                        ? 'border-red-500/80 ring-1 ring-red-500/40 bg-red-950/20'
                                        : 'border-[#2c2736]'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "text-xs font-bold text-gray-300", children: dayNum }), hasConflict && (_jsx(AlertTriangle, { className: "w-3.5 h-3.5 text-red-400" }))] }), _jsxs("div", { className: "space-y-1", children: [dayItems.slice(0, 3).map((item) => {
                                                    const inConflict = isItemInConflict(item.id, conflicts);
                                                    return (_jsxs("div", { draggable: true, onDragStart: (event) => {
                                                            event.dataTransfer.setData('text/plain', item.id);
                                                            event.dataTransfer.effectAllowed = 'move';
                                                        }, onClick: (e) => {
                                                            e.stopPropagation();
                                                            onSelectItem(item);
                                                        }, title: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u0435 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u0435\u043D\u044C, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0434\u0430\u0442\u0443", className: `p-1 rounded text-[10px] truncate font-medium cursor-grab active:cursor-grabbing ${inConflict
                                                            ? 'bg-red-500 text-white font-bold'
                                                            : item.category === 'social'
                                                                ? 'bg-[#5b52a3] text-white'
                                                                : 'bg-[#eb4b5b] text-white'}`, children: [item.publishTime, " \u00B7 ", item.title] }, item.id));
                                                }), dayItems.length > 3 && (_jsxs("div", { className: "text-[10px] text-gray-400 text-center", children: ["+", dayItems.length - 3, " \u0435\u0449\u0435"] }))] })] }, dateStr));
                            }) })] }) }))] }));
};
