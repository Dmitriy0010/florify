import { Truck, Clock, CreditCard, ShieldCheck } from 'lucide-react'

export function DeliveryPage() {
  return (
    <div className="container-custom py-12 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">Доставка и оплата</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Мы заботимся о том, чтобы ваши близкие вовремя получили свежие цветы.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-border)]">
            <Truck className="w-10 h-10 text-[var(--color-brand)] mb-6" />
            <h3 className="text-xl font-bold mb-3">Способы доставки</h3>
            <ul className="space-y-3 text-slate-600">
              <li>• Курьером по городу (2-3 часа)</li>
              <li>• Экспресс-доставка (от 60 минут)</li>
              <li>• Самовывоз из наших магазинов</li>
              <li>• Доставка-сюрприз (без звонка получателю)</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-border)]">
            <Clock className="w-10 h-10 text-[var(--color-brand)] mb-6" />
            <h3 className="text-xl font-bold mb-3">График работы</h3>
            <ul className="space-y-3 text-slate-600">
              <li>• Прием заказов: круглосуточно</li>
              <li>• Доставка: с 9:00 до 22:00</li>
              <li>• Ночная доставка по договоренности</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-border)]">
            <CreditCard className="w-10 h-10 text-[var(--color-brand)] mb-6" />
            <h3 className="text-xl font-bold mb-3">Способы оплаты</h3>
            <ul className="space-y-3 text-slate-600">
              <li>• Банковской картой онлайн</li>
              <li>• Наличными курьеру</li>
              <li>• СБП / SberPay</li>
              <li>• Оплата долями</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-border)]">
            <ShieldCheck className="w-10 h-10 text-[var(--color-brand)] mb-6" />
            <h3 className="text-xl font-bold mb-3">Гарантии</h3>
            <ul className="space-y-3 text-slate-600">
              <li>• 100% свежие цветы</li>
              <li>• Фото букета перед отправкой</li>
              <li>• Безопасная онлайн-оплата</li>
              <li>• Возврат средств, если букет не понравился</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
