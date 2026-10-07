import React, { useState } from 'react';
import { 
  Check, 
  AlertTriangle
} from 'lucide-react';
import { Workspace } from '../types';

interface SettingsViewProps {
  workspace: Workspace;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ workspace }) => {
  const [autoDetectConflicts, setAutoDetectConflicts] = useState(true);
  const [conflictBufferMinutes, setConflictBufferMinutes] = useState('0');
  const [notifyOnConflict, setNotifyOnConflict] = useState(true);
  const [preventDirectPublish, setPreventDirectPublish] = useState(false);
  const [timezone, setTimezone] = useState('Europe/Moscow (UTC+3)');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#161418]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Настройки пространства</h1>
            <p className="text-xs text-gray-400 mt-1">
              Управление параметрами студии, расписанием и алгоритмом обнаружения конфликтов.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Check className="w-4 h-4" />
                Сохранено
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors cursor-pointer"
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#211e25] border border-[#2f2939] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#2d2738]">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Автоматическое выявление конфликтов расписания
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Система непрерывно сверяет время публикации между всеми материалами в каналах.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">
                  Автоматический мониторинг коллизий
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Выявлять материалы со статусами «Запланировано» и «Готово к публикации», назначенные на один слот.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoDetectConflicts(!autoDetectConflicts)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  autoDetectConflicts ? 'bg-[#f25a5a]' : 'bg-[#373142]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    autoDetectConflicts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Пороговое окно проверки конфликта:
              </label>
              <select
                value={conflictBufferMinutes}
                onChange={(e) => setConflictBufferMinutes(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a] cursor-pointer"
              >
                <option value="0">Точное совпадение слота (одинаковый час и минута)</option>
                <option value="15">В пределах 15 минут</option>
                <option value="30">В пределах 30 минут</option>
                <option value="60">В пределах 1 часа</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2d2738]">
              <div>
                <div className="text-xs font-medium text-white">
                  Оповещение ответственного редактора
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Показывать плашку-баннер вверху экраны и подсвечивать конфликтные карточки на календаре.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyOnConflict(!notifyOnConflict)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifyOnConflict ? 'bg-[#f25a5a]' : 'bg-[#373142]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyOnConflict ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2d2738]">
              <div>
                <div className="text-xs font-medium text-white">
                  Блокировка автовыхода при нерешенном конфликте
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Запретить публикацию, пока редактор вручную не разведёт материалы по времени.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreventDirectPublish(!preventDirectPublish)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  preventDirectPublish ? 'bg-[#f25a5a]' : 'bg-[#373142]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-colors ${
                    preventDirectPublish ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#211e25] border border-[#2f2939] space-y-4">
          <h3 className="text-sm font-bold text-white">Общие параметры пространства</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Название пространства
              </label>
              <input
                type="text"
                defaultValue={workspace.name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Часовой пояс публикаций
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
