import { Button } from '@/Components/ui/button'
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
        <main className="error-page__container">
        <div className="error-page__content">
            <div className="error-page__icon">🔧</div>
            <h1 className="error-page__title">503</h1>
            <p className="error-page__text">Сервис недоступен или отсутствует подключение к интернету</p>
            <p className="error-page__subtext">
            Сервер временно не может обрабатывать запросы. Ведутся технические работы.
            Пожалуйста, попробуйте позже.
            </p>
            <div className="error-page__buttons">
            <Button type='button'
                className="error-page__button primary"
                onClick={() => window.location.reload()}
            >Попробовать снова</Button>
            </div>
        </div>
        </main>
    );
    }