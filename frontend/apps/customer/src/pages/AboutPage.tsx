import { Heart, Star, Leaf, Award } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="container-custom py-12 md:py-24">
      <div className="max-w-4xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold">О нашей компании</h1>
          <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Florify — это не просто сервис доставки цветов. Это команда профессиональных флористов, 
            которые любят свое дело и стремятся дарить эмоции каждый день.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=1000" 
              alt="Наша студия" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold">Наша история</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Мы начали свой путь в 2020 году как небольшая семейная студия. 
              С первого дня нашей главной целью было создание букетов, которые 
              говорят больше, чем слова.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Сегодня Florify — это современный сервис, объединяющий технологии 
              и искусство флористики. Мы тщательно отбираем поставщиков, следим 
              за свежестью каждого цветка и постоянно совершенствуем сервис доставки.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <h2 className="text-3xl font-display font-bold text-center">Наши ценности</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Свежесть</h3>
              <p className="text-slate-600">Ежедневные поставки цветов от лучших плантаций Эквадора и Голландии.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Любовь к делу</h3>
              <p className="text-slate-600">Каждый букет собирается вручную флористами с многолетним опытом.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Качество</h3>
              <p className="text-slate-600">Мы гарантируем стойкость цветов и безупречный вид композиций.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Сервис</h3>
              <p className="text-slate-600">Пунктуальные вежливые курьеры и поддержка на каждом этапе заказа.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
