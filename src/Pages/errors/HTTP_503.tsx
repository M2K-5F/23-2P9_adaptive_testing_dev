import {Button} from '../../Components/Button'
import { useNavigate } from "react-router-dom";
import { userStore } from '../../stores/userStore';
import { useEffect } from 'react';

export default function ServiceUnavailablePage() {
    const navigate = useNavigate();
    const status = userStore().status
    
    useEffect(() => { 
        if (status !== 'serverunavailable') {
            navigate(['student', "teacher"].includes(status) ? `/for${status}` : '/users/autorize')
        }
    })

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
                isPretty
                className="error-page__button primary"
                text="Попробовать снова"
                onclick={() => window.location.reload()}
            />
            </div>
        </div>
        </main>
    );
    }