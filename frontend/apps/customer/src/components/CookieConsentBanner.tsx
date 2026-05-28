import { useState, useEffect } from 'react'
import { ShieldCheck, X, Cookie, ChevronDown, ChevronUp } from 'lucide-react'

const CONSENT_KEY = 'florify_cookie_consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      // Небольшая задержка, чтобы страница успела прогрузиться
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = (accepted: boolean) => {
    setLeaving(true)
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined')
      setVisible(false)
    }, 400)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out ${
        leaving ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Backdrop gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none -top-8" />

      <div className="relative bg-white border-t border-[var(--color-border)] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
        {/* Верхняя полоска бренд-цвета */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3D7A5E] via-[#5DAF8A] to-[#3D7A5E]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Иконка */}
            <div className="flex-shrink-0 hidden sm:flex h-12 w-12 rounded-xl bg-[var(--color-brand-light)] items-center justify-center">
              <Cookie size={22} className="text-[var(--color-brand)]" />
            </div>

            {/* Текст */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Cookie size={16} className="text-[var(--color-brand)] sm:hidden flex-shrink-0" />
                <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">
                  Согласие на обработку персональных данных
                </p>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Мы используем файлы cookie и обрабатываем ваши персональные данные в соответствии с&nbsp;
                <a
                  href="/privacy"
                  className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] underline underline-offset-2 transition-colors"
                >
                  Политикой конфиденциальности
                </a>
                &nbsp;и&nbsp;
                <a
                  href="/terms"
                  className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] underline underline-offset-2 transition-colors"
                >
                  Пользовательским соглашением
                </a>
                . Ваши данные необходимы для оформления заказов, доставки и улучшения сервиса.
              </p>

              {/* Раскрывающийся блок с подробностями */}
              {expanded && (
                <div className="mt-3 p-3 bg-[var(--color-bg-sunken)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-2 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={13} className="text-[var(--color-brand)] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">Необходимые данные:</span>
                      {' '}имя, контактный телефон, адрес доставки — для выполнения вашего заказа.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={13} className="text-[var(--color-brand)] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">Аналитика:</span>
                      {' '}анонимные данные о посещениях для улучшения работы сайта.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={13} className="text-[var(--color-brand)] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">Хранение:</span>
                      {' '}данные хранятся на защищённых серверах и не передаются третьим лицам без вашего согласия.
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] pt-1">
                    Оператор персональных данных: ООО «Флорифай», ОГРН 0000000000000. 
                    Вы вправе отозвать согласие в любой момент, направив запрос на privacy@florify.ru.
                  </p>
                </div>
              )}

              <button
                onClick={() => setExpanded(v => !v)}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-brand)] transition-colors"
              >
                {expanded ? (
                  <><ChevronUp size={12} /> Скрыть подробности</>
                ) : (
                  <><ChevronDown size={12} /> Подробнее о данных</>
                )}
              </button>
            </div>

            {/* Кнопки */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                id="cookie-decline-btn"
                onClick={() => dismiss(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)] hover:border-[var(--color-border-hover)] transition-all active:scale-95"
              >
                Отклонить
              </button>
              <button
                id="cookie-accept-btn"
                onClick={() => dismiss(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-xs font-bold hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)] transition-all active:scale-95 shadow-sm shadow-[var(--color-brand)]/20 whitespace-nowrap"
              >
                Принять и продолжить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
