import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-sunken)] border-t mt-auto">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">F</span>
              </div>
              <span className="font-display font-semibold text-xl">florify</span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
              Ваш персональный цветочный помощник. Свежайшие букеты с быстрой доставкой и заботой в каждом лепестке.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-[var(--color-text-primary)]">
              Покупателям
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/catalog" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Весь каталог
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=bouquets" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Готовые букеты
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=roses" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Розы поштучно
                </Link>
              </li>
              <li>
                <Link to="/loyalty" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Программа лояльности
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Info Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-[var(--color-text-primary)]">
              Информация
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/delivery" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Контакты магазина
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  О нашей компании
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
                  Вопросы и ответы
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Service Links */}
          <div className="space-y-6">
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-[var(--color-text-primary)]">
              Связаться с нами
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                <Phone className="h-5 w-5 text-[var(--color-brand)] shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+79001234567" className="hover:text-[var(--color-brand)] font-medium">
                    +7 (900) 123-45-67
                  </a>
                  <span className="text-xs">Ежедневно с 9:00 до 21:00</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <Mail className="h-5 w-5 text-[var(--color-brand)] shrink-0" />
                <a href="mailto:hello@floweros.ru" className="hover:text-[var(--color-brand)]">
                  hello@floweros.ru
                </a>
              </li>
              <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                <MapPin className="h-5 w-5 text-[var(--color-brand)] shrink-0" />
                <span>Москва, ул. Цветочная 12</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--color-text-secondary)] text-center md:text-left">
            © {new Date().getFullYear()} florify. Разработано для автоматизации цветочного бизнеса.
          </p>
          <div className="flex gap-6 text-xs text-[var(--color-text-secondary)]">
            <Link to="/privacy" className="hover:text-[var(--color-brand)]">Политика конфиденциальности</Link>
            <Link to="/terms" className="hover:text-[var(--color-brand)]">Публичная оферта</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
