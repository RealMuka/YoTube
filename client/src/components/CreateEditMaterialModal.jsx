import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, } from 'lucide-react';
import { CATEGORIES } from '../data/appConfig';
import { checkPotentialConflict } from '../utils/conflicts';
export const CreateEditMaterialModal = ({ isOpen, onClose, onSave, onDelete, initialItem, channels, existingItems, defaultDate, defaultChannelId, }) => {
    const isEditing = Boolean(initialItem);
    const [title, setTitle] = useState(initialItem?.title || '');
    const [description, setDescription] = useState(initialItem?.description || '');
    const [category, setCategory] = useState(initialItem?.category || 'social');
    const [status, setStatus] = useState(initialItem?.status || 'draft');
    const [publishDate, setPublishDate] = useState(initialItem?.publishDate || defaultDate || new Date().toLocaleDateString('en-CA'));
    const [publishTime, setPublishTime] = useState(initialItem?.publishTime || '10:00');
    const [channelId, setChannelId] = useState(initialItem?.channelId || defaultChannelId || channels[0]?.id || 'ch-tg');
    const [tagsInput, setTagsInput] = useState(initialItem?.tags?.join(', ') || '');
    const [coverImage, setCoverImage] = useState(initialItem?.coverImage || '');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    useEffect(() => {
        if (!isOpen)
            return;
        setTitle(initialItem?.title || '');
        setDescription(initialItem?.description || '');
        setCategory(initialItem?.category || 'social');
        setStatus(initialItem?.status || 'draft');
        setPublishDate(initialItem?.publishDate || defaultDate || new Date().toLocaleDateString('en-CA'));
        setPublishTime(initialItem?.publishTime || '10:00');
        setChannelId(initialItem?.channelId || defaultChannelId || channels[0]?.id || 'ch-tg');
        setTagsInput(initialItem?.tags?.join(', ') || '');
        setCoverImage(initialItem?.coverImage || '');
        setSubmitError('');
    }, [isOpen, initialItem?.id, defaultDate, defaultChannelId, channels]);
    const potentialConflict = checkPotentialConflict({
        channelId,
        publishDate,
        publishTime,
        status,
    }, existingItems, channels, initialItem?.id);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || submitting)
            return;
        setSubmitting(true);
        setSubmitError('');
        const tags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        try {
            await onSave({
                id: initialItem?.id,
                title: title.trim(),
                description: description.trim(),
                category,
                status,
                publishDate,
                publishTime,
                channelId,
                coverImage: coverImage.trim() || undefined,
                tags: tags.length ? tags : undefined,
            });
            onClose();
        }
        catch (cause) {
            setSubmitError(cause instanceof Error ? cause.message : 'Не удалось сохранить материал');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in", children: _jsxs("div", { className: "bg-[#242028] border border-[#f25a5a]/70 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95", style: {
                boxShadow: '0 0 35px rgba(242, 90, 90, 0.15)',
            }, children: [_jsxs("div", { className: "p-6 pb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-white tracking-tight", children: isEditing ? 'Редактировать материал' : 'Создать материал' }), _jsx("button", { onClick: onClose, type: "button", className: "p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "px-6 pb-6 overflow-y-auto space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: ["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0430 ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u00AB\u0410\u043D\u043E\u043D\u0441 \u043D\u043E\u0432\u043E\u0433\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u00BB", className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" }), _jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer", children: CATEGORIES.map((cat) => (_jsx("option", { value: cat.id, children: cat.label }, cat.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0438 \u044D\u0442\u0430\u043F \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer", children: [_jsxs("optgroup", { label: "\u042D\u0442\u0430\u043F 1: \u041F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430", children: [_jsx("option", { value: "draft", children: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A (\u0432 \u0440\u0430\u0431\u043E\u0442\u0435)" }), _jsx("option", { value: "in_review", children: "\u041D\u0430 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0438" }), _jsx("option", { value: "approved", children: "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D" })] }), _jsxs("optgroup", { label: "\u042D\u0442\u0430\u043F 2: \u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438", children: [_jsx("option", { value: "scheduled", children: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E" }), _jsx("option", { value: "ready", children: "\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438" })] }), _jsxs("optgroup", { label: "\u042D\u0442\u0430\u043F 3: \u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442", children: [_jsx("option", { value: "published", children: "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E" }), _jsx("option", { value: "archived", children: "\u0412 \u0430\u0440\u0445\u0438\u0432\u0435" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u041A\u0430\u043D\u0430\u043B \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438" }), _jsx("select", { value: channelId, onChange: (e) => setChannelId(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer", children: channels.map((ch) => (_jsx("option", { value: ch.id, children: ch.name }, ch.id))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u0414\u0430\u0442\u0430 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438" }), _jsx("div", { className: "relative", children: _jsx("input", { type: "date", value: publishDate, onChange: (e) => setPublishDate(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors" }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u0412\u0440\u0435\u043C\u044F \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438" }), _jsx("div", { className: "relative", children: _jsx("input", { type: "time", value: publishTime, onChange: (e) => setPublishTime(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors" }) })] })] }), potentialConflict.hasConflict && (_jsx("div", { className: "p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 animate-in fade-in", children: _jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-red-300", children: "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438!" }), _jsxs("p", { className: "mt-1 text-gray-300 text-[11px] leading-relaxed", children: ["\u0412 \u043A\u0430\u043D\u0430\u043B\u0435 ", _jsx("strong", { className: "text-white", children: channels.find(c => c.id === channelId)?.name }), " \u043D\u0430", ' ', _jsxs("strong", { className: "text-white", children: [publishDate, " \u0432 ", publishTime] }), " \u0443\u0436\u0435 \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u0440\u0443\u0433\u043E\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B:", potentialConflict.conflictingWith && (_jsxs("span", { className: "block italic text-red-200 mt-0.5", children: ["\u00AB", potentialConflict.conflictingWith.title, "\u00BB"] }))] }), _jsx("p", { className: "mt-1 text-[10px] text-red-400", children: "\u041B\u0443\u0447\u0448\u0435 \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u0432\u0440\u0435\u043C\u044F \u043D\u0430 30\u201360 \u043C\u0438\u043D\u0443\u0442 \u0438\u043B\u0438 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0434\u0440\u0443\u0433\u043E\u0439 \u043A\u0430\u043D\u0430\u043B." })] })] }) })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u041A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 / \u0422\u0435\u0437\u0438\u0441\u044B" }), _jsx("textarea", { rows: 2, value: description, onChange: (e) => setDescription(e.target.value), placeholder: "\u041E \u0447\u0451\u043C \u044D\u0442\u0430 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u044F \u0438 \u0447\u0442\u043E \u0432\u0430\u0436\u043D\u043E \u0434\u043E\u043D\u0435\u0441\u0442\u0438 \u0434\u043E \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u0438?", className: "w-full px-3.5 py-2 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-300 mb-1.5", children: "\u0422\u0435\u0433\u0438 (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)" }), _jsx("input", { type: "text", value: tagsInput, onChange: (e) => setTagsInput(e.target.value), placeholder: "\u043F\u0440\u043E\u0434\u0443\u043A\u0442, \u043D\u043E\u0432\u043E\u0441\u0442\u0438, \u0437\u0430\u043F\u0443\u0441\u043A", className: "w-full px-3 py-2 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors" })] }), submitError && _jsx("div", { role: "alert", className: "rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200", children: submitError }), _jsxs("div", { className: "pt-3 flex items-center justify-between gap-3 border-t border-[#312c3b]", children: [isEditing && onDelete ? (_jsxs("button", { type: "button", onClick: async () => {
                                        if (!initialItem || !confirm('Удалить этот материал?'))
                                            return;
                                        setSubmitting(true);
                                        setSubmitError('');
                                        try {
                                            await onDelete(initialItem.id);
                                            onClose();
                                        }
                                        catch (cause) {
                                            setSubmitError(cause instanceof Error ? cause.message : 'Не удалось удалить материал');
                                        }
                                        finally {
                                            setSubmitting(false);
                                        }
                                    }, className: "px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })) : _jsx("div", {}), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 rounded-xl bg-[#2a2533] hover:bg-[#342f3f] text-gray-200 text-sm font-medium border border-[#40394e] transition-colors", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-6 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] active:bg-[#e04a4a] text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-colors cursor-pointer", children: submitting ? 'Сохраняем…' : isEditing ? 'Сохранить' : 'Создать' })] })] })] })] }) }));
};
