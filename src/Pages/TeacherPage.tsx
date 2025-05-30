import { Outlet, useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "../Components/Button";

export default function TeacherLout() {
    const nav = useNavigate()
    return (
        <section className="teacher-container">
            <form  >
                <Button type='button' onclick={() => nav('/createform')} text="Создать новую форму" isPretty /> 
                <Button type='button' onclick={() => nav('results')} isPretty text="Посмотреть результаты" /> 
            </form>
        </section>
    )
}