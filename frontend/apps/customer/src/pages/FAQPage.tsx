import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FAQPage() {
  return (
    <div className="container-custom py-12 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">Вопросы и ответы</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Мы собрали самые частые вопросы от наших клиентов. Если вы не нашли ответ, 
            обязательно свяжитесь с нами.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 border border-[var(--color-border)] shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold">Как быстро вы доставляете цветы?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                В пределах города доставка обычно занимает от 2 до 3 часов с момента оформления заказа. 
                Также у нас доступна экспресс-доставка за 60 минут за дополнительную плату. В праздничные 
                дни (8 марта, 14 февраля) сроки доставки могут быть увеличены.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold">Будет ли букет точно таким же, как на фото?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Мы стараемся собирать букеты максимально похожими на фото в каталоге. Однако нужно понимать, 
                что цветы — это живой материал, и иногда оттенок или форма могут незначительно отличаться. 
                Если какого-то цветка нет в наличии, флорист обязательно свяжется с вами для согласования замены, 
                сохранив общую цветовую гамму и настроение букета.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-semibold">Вы можете доставить букет анонимно?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Конечно! Мы можем не сообщать получателю от кого букет. При оформлении заказа 
                просто укажите в комментариях, что это сюрприз. Мы можем приложить бесплатную 
                открытку с вашим текстом или оставить её пустой.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-semibold">Как продлить жизнь цветам в вазе?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                К каждому букету мы прилагаем пакетик со специальной подкормкой (кризалом) и инструкцию 
                по уходу. Основные правила: подрезайте стебли на 1-2 см под углом перед постановкой в воду, 
                меняйте воду каждые 1-2 дня, мойте вазу и держите букет вдали от прямых солнечных лучей, 
                сквозняков и фруктов.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg font-semibold">Можно ли оплатить заказ курьеру?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Да, если вы сами получаете букет. Но если букет доставляется другому человеку (сюрприз), 
                то заказ необходимо оплатить онлайн на сайте перед отправкой.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
