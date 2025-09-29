import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/useUserStore';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServiceUnavailablePage() {
    const status = useUserStore(s => s.status)
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (status !== 'serverunavailable') {
            navigate('/', {replace: true})
        }
    }, [status])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-6xl font-bold text-slate-800 mb-2">503</h1>
                    
                    <h2 className="text-2xl font-semibold text-slate-700 mb-4">
                        Сервис недоступен
                    </h2>
                    
                    <p className="text-slate-600 mb-4">
                        Отсутствует подключение к интернету или сервер временно не может обрабатывать запросы.
                    </p>
                    
                    <p className="text-slate-500 text-sm mb-8">
                        Ведутся технические работы. Пожалуйста, попробуйте позже.
                    </p>
                    
                    <div className="mt-6 flex justify-center w-full">
                        <Button 
                            onClick={() => window.location.reload()}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Попробовать снова
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}