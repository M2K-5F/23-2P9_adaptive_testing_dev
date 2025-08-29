import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <div className="space-y-2">
            <div className="text-9xl font-bold text-slate-900">404</div>
            <div className="text-2xl font-medium text-slate-700">Страница не найдена</div>
            <p className="text-slate-500 mt-4">
              Извините, мы не смогли найти страницу, которую вы ищете.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Назад
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <i className="fas fa-home mr-2"></i>
              На главную
            </button>
          </div>
        </div>
      </div>
      
      {/* Декоративные элементы в стиле shadcn/ui */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-10 pt-10 opacity-10">
        <div className="w-32 h-32 rounded-full bg-slate-400"></div>
        <div className="w-32 h-32 rounded-full bg-slate-400"></div>
      </div>
    </div>
  )
}

export default NotFoundPage;