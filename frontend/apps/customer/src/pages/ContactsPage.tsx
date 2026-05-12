import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export function ContactsPage() {
  return (
    <div className="container-custom py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold">Контакты</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Мы всегда на связи и рады помочь вам с выбором букета или ответить на любые вопросы.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold font-display">Наши данные</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-xl shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Телефон</p>
                  <a href="tel:+79001234567" className="text-xl font-medium hover:text-[var(--color-brand)] transition-colors">
                    +7 (900) 123-45-67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-xl shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Email</p>
                  <a href="mailto:hello@floweros.ru" className="text-xl font-medium hover:text-[var(--color-brand)] transition-colors">
                    hello@floweros.ru
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Режим работы</p>
                  <p className="text-xl font-medium">Ежедневно 9:00 – 21:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Адрес</p>
                  <p className="text-xl font-medium">г. Москва, ул. Цветочная 12</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="font-medium text-lg mb-4">Написать нам:</h3>
              <div className="flex gap-3">
                <a
                  href="https://t.me/florify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-xl hover:bg-[var(--color-brand)] hover:text-white transition-colors text-sm font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Telegram
                </a>
                <a
                  href="https://wa.me/79001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-xl hover:bg-[var(--color-brand)] hover:text-white transition-colors text-sm font-medium"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="h-[500px] bg-slate-100 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <MapPin className="w-12 h-12 opacity-40" />
              <p className="font-medium text-lg">г. Москва, ул. Цветочная 12</p>
              <a
                href="https://maps.google.com/?q=Москва+ул.+Цветочная+12"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-brand)] underline underline-offset-4 hover:text-emerald-700"
              >
                Открыть в Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
