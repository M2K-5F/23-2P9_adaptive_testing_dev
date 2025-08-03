import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userStore } from "../../stores/userStore";
import { logoutUser } from "../../services/api.service";
import { Button } from "@/Components/ui/button";

export default function ForbiddenPage() {
    const navigate = useNavigate();
    const status = userStore().status
    

    return (
        <main className="error-page__container">
        <div className="error-page__content">
            <div className="error-page__icon">🔒</div>
            <h1 className="error-page__title">
                403
            </h1>
            <p className="error-page__text">
                Доступ запрещён
            </p>
            <p className="error-page__subtext">
                У вас нет прав для просмотра этой страницы.
            </p>
            <div className="error-page__buttons">
            <Button
                type='button'
                className="error-page__button"
                onClick={() => {
                    logoutUser().then(() => 
                        navigate('/users/autorize')
                    )
                }}
            >Вернуться на главную</Button>
            </div>
        </div>
        </main>
    )
}