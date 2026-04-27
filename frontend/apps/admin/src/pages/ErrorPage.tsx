import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  let errorMessage = "Что-то пошло не так"
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorMessage = "Упс! Страница не найдена."
    } else {
      errorMessage = error.statusText
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-canvas)] p-8 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-heading font-black text-[var(--color-text-primary)] mb-4">
        {isRouteErrorResponse(error) && error.status === 404 ? "404" : "Ошибка"}
      </h1>
      
      <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md">
        {errorMessage}
      </p>

      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-[var(--color-border)] rounded-2xl text-sm font-bold hover:bg-[var(--color-bg-sunken)] transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Вернуться назад
        </button>
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-brand)] text-white rounded-2xl text-sm font-bold hover:bg-[var(--color-brand-hover)] transition-all shadow-lg shadow-[var(--color-brand)]/20"
        >
          <Home className="h-4 w-4" />
          На главную
        </button>
      </div>

      <div className="mt-12 p-4 bg-white/50 border border-[var(--color-border)] rounded-2xl max-w-lg">
        <p className="text-xs font-mono text-[var(--color-text-tertiary)] break-all uppercase tracking-tighter">
          {error instanceof Error ? error.stack?.split('\n')[0] : JSON.stringify(error)}
        </p>
      </div>
    </div>
  )
}
