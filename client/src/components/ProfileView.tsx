import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Check,
  Layers,
} from 'lucide-react';
import { Workspace } from '../types';
import type { ApiUser } from '../api/client';

interface ProfileViewProps {
  workspaces: Workspace[];
  user: ApiUser | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ workspaces, user }) => {
  const userNameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(userNameParts[0] || '');
  const [lastName, setLastName] = useState(userNameParts.slice(1).join(' '));
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [language, setLanguage] = useState('Русский');
  const [twoFactor, setTwoFactor] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  React.useEffect(() => {
    const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' '));
    setEmail(user?.email || '');
  }, [user?.id, user?.name, user?.email]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  if (!user) {
    return <div className="flex-1 p-8 text-sm text-gray-400 bg-[#161418]">Загрузка профиля…</div>;
  }

  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'П';
  const roleLabel = user.role === 'admin' ? 'Администратор' : user.role === 'editor' ? 'Редактор' : 'Пользователь';

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#161418]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Мой профиль</h1>
            <p className="text-xs text-gray-400 mt-1">
              Личные данные, контакты и безопасность вашего аккаунта.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {showSavedToast && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
                <Check className="w-4 h-4" />
                Изменения сохранены!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors cursor-pointer"
            >
              Сохранить изменения
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#211e25] border border-[#2f2939] flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-[#dbeafe] border-4 border-[#2b2538] flex items-center justify-center text-3xl font-bold text-sky-800 shadow-inner">
                  {initials}
                </div>
              </div>

              <h2 className="text-base font-bold text-white">{firstName} {lastName}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{email}</p>

              <div className="mt-3">
                <span className="px-3 py-1 rounded-md text-[11px] font-medium bg-[#2e263d] text-purple-200 border border-[#48375f]">
                  {roleLabel}
                </span>
              </div>

              <button
                onClick={() => alert('Загрузка нового фото профиля (поддерживаются форматы JPG, PNG до 5 МБ)')}
                className="mt-5 w-full py-2 px-4 rounded-xl bg-[#282330] hover:bg-[#322b3d] text-xs font-medium text-gray-200 border border-[#3b3247] transition-colors"
              >
                Изменить фото
              </button>
              <span className="text-[10px] text-gray-500 mt-2">JPG или PNG · до 5 МБ</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#211e25] border border-[#2f2939]">
              <h3 className="text-sm font-bold text-white mb-3">Ваши пространства</h3>
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="p-3 rounded-xl bg-[#1b1820] border border-[#2b2535] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{ws.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {ws.role} · {ws.membersCount === 1 ? 'только вы' : `${ws.membersCount} участников`}
                      </div>
                    </div>
                    <Layers className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[#211e25] border border-[#2f2939]">
              <h3 className="text-sm font-bold text-white">Личные данные</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-5">
                Эти данные видны участникам ваших пространств.
              </p>

              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Должность
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Язык интерфейса
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a] cursor-pointer"
                  >
                    <option value="Русский">Русский</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 rounded-2xl bg-[#211e25] border border-[#2f2939] space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Безопасность и пароль</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Последнее изменение пароля: 18 сентября 2026.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white focus:outline-none focus:border-[#f25a5a] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Введите новый пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] pr-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Подтвердите новый пароль
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Повторите новый пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1922] border border-[#342e3f] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Используйте не менее 8 символов, буквы и цифры.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#2d2738]">
                <span className="text-[11px] text-gray-400">
                  Текущая сессия: Chrome · macOS · Москва
                </span>
                <button
                  type="button"
                  onClick={() => alert('Пароль успешно обновлен!')}
                  className="px-4 py-2 rounded-xl bg-[#2b2536] hover:bg-[#362f44] text-xs font-medium text-gray-200 border border-[#3b324a] transition-colors"
                >
                  Изменить пароль
                </button>
              </div>

              <div className="pt-4 border-t border-[#2d2738] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Двухфакторная аутентификация</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Дополнительная защита при входе в аккаунт.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    twoFactor ? 'bg-[#f25a5a]' : 'bg-[#373142]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      twoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
