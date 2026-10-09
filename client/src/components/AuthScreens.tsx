import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { SAMPLE_COVER_IMAGE } from '../data/appConfig';
import { api, type ApiUser } from '../api/client';

interface AuthScreensProps {
  onLoginSuccess: (user: ApiUser) => void;
  onBackToApp: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({
  onLoginSuccess,
  onBackToApp,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !agreeTerms) { setError('Для регистрации необходимо принять условия использования.'); return; }
    setSubmitting(true);
    try {
      const user = mode === 'register'
        ? await api.auth.register(name, email, password)
        : await api.auth.login(email, password);
      onLoginSuccess(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось выполнить вход');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#181619] text-white flex flex-col lg:flex-row select-none">
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between bg-[#1e1b1f] border-b lg:border-b-0 lg:border-r border-[#2c2732] relative overflow-hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e5484d] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-red-500/20">
              <div className="relative w-5 h-5 flex flex-col justify-between py-0.5">
                <span className="block h-0.5 w-full bg-white rounded-full"></span>
                <span className="block h-0.5 w-full bg-white/90 rounded-full"></span>
                <span className="block h-0.5 w-full bg-white/80 rounded-full"></span>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Контентно</span>
          </div>

          <div className="mt-12 inline-block px-3.5 py-1 rounded-full text-xs font-medium bg-[#2b253b] text-[#9d93d8] border border-[#3f3557]">
            Меньше хаоса. Больше контента.
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            От идеи до публикации <br />— вместе.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed">
            Планируйте материалы, обсуждайте идеи и управляйте всеми каналами в одном пространстве.
          </p>

          <div className="mt-8 max-w-md rounded-2xl bg-[#26222b] border border-[#383142] p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-gray-200">Контент-бардак</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#342e42] text-purple-200 font-medium">
                Октябрь 2026
              </span>
            </div>

            <div className="rounded-xl overflow-hidden h-36 w-full relative mb-4">
              <img
                src={SAMPLE_COVER_IMAGE}
                alt="Обложка"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-bold text-base text-white">
              Чайник планирует мир захватить
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 font-medium text-[11px]">
                Готово к публикации
              </span>
              <span className="text-gray-400 text-[11px]">Пн, 5 окт · 10:00</span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#362f40] flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-[#413952] text-purple-200 flex items-center justify-center text-[9px] font-bold ring-2 ring-[#26222b]">
                  Ч4
                </span>
                <span className="w-6 h-6 rounded-full bg-[#334657] text-blue-200 flex items-center justify-center text-[9px] font-bold ring-2 ring-[#26222b]">
                  ГФ
                </span>
                <span className="w-6 h-6 rounded-full bg-[#523947] text-pink-200 flex items-center justify-center text-[9px] font-bold ring-2 ring-[#26222b]">
                  ТБ
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Одна команда. Один план.</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Ваш контент в порядке — от первого черновика до последнего согласования.
        </div>
      </div>

      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-8">
          {api.auth.getToken() ? (
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Вернуться в приложение</span>
            </button>
          ) : <span />}

          <div className="text-xs text-gray-400">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-purple-300 hover:text-white font-medium ml-1 cursor-pointer"
                >
                  Зарегистрироваться →
                </button>
              </>
            ) : (
              <>
                Уже с нами?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-purple-300 hover:text-white font-medium ml-1 cursor-pointer"
                >
                  Войти →
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          {mode === 'login' ? (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                С возвращением!
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                Войдите, чтобы продолжить работу над контентом вашей команды.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">{error}</div>}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="chelovek1234@pochta.ru"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#242028] border border-[#383142] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] pr-10"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#242028] border border-[#383142] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 cursor-pointer hover:text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#383142] text-[#f25a5a] focus:ring-0"
                    />
                    <span>Запомнить меня</span>
                  </label>

                  <a href="#" onClick={(e) => e.preventDefault()} className="text-purple-300 hover:underline">
                    Забыли пароль?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-3 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] text-white font-semibold text-sm shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{submitting ? 'Входим…' : 'Войти'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center text-[11px] text-gray-400 pt-3">
                  Защищённый вход · ваши данные только у вас
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Начните с одной идеи
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                Создайте аккаунт и соберите команду в своём рабочем пространстве.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">{error}</div>}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Чел1234 Пупын"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#242028] border border-[#383142] text-xs sm:text-sm text-white focus:outline-none focus:border-[#f25a5a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Рабочий email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="chelovek1234@pochta.ru"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#242028] border border-[#383142] text-xs sm:text-sm text-white focus:outline-none focus:border-[#f25a5a] pr-10"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#242028] border border-[#383142] text-xs sm:text-sm text-white focus:outline-none focus:border-[#f25a5a] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Надёжный пароль · не менее 8 символов
                  </div>
                </div>

                <div className="text-xs pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#383142] text-[#f25a5a] focus:ring-0"
                    />
                    <span>Я принимаю условия использования и политику конфиденциальности</span>
                  </label>
                  <div className="mt-1 text-[11px] text-purple-300 pl-5">
                    Условия использования · Политика конфиденциальности
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-3 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] text-white font-semibold text-sm shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{submitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}</span>
                </button>

                <div className="text-center text-[11px] text-gray-400 pt-3">
                  После регистрации вы сможете создать пространство или принять приглашение команды.
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-6 border-t border-[#26222c]">
          <span>© 2026 Контентно</span>
          <span>Нужна помощь?</span>
        </div>
      </div>
    </div>
  );
};
