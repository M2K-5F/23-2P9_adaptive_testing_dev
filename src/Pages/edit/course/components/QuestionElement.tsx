import { CreatedQuestion } from "../../../../types/interfaces"
import { useState } from "react"
import { archQuestion } from "../../../../services/api.service"


export const QuestionElement = ({ 
    question,
}: {
    question: CreatedQuestion,
}) => {
    const [expanded, setExpanded] = useState<boolean>(false)
    const [isActive, setIsArchiving] = useState<boolean>(question.is_active)

    const handleArchive = () => {
        archQuestion(question.id)
        .then(() => setIsArchiving(!isActive))
    }

    return (
        <div className={`question-card ${expanded ? 'expanded' : ''} ${isActive ? '' : 'archived'}`}>
            <div className="question-header">
                <h4 onClick={() => setExpanded(!expanded)} style={{cursor: 'pointer'}}>
                    {question.text}
                </h4>
                <div className="question-actions">
                    <button 
                    className="question-action-btn"
                    onClick={handleArchive}
                    title={question.is_active ? 'Архивировать' : 'Разархивировать'}
                    >
                        {isActive ? '🗄️' : '📦'}
                    </button>
                </div>
            </div>

            <div className="question-meta">
                <span>
                    Тип: {question.question_type === 'single' ? 'Один ответ' : 'Множественный выбор'}
                </span>

                <span className={`status ${!isActive ? 'archived' : 'active'}`}>
                    {isActive ? 'Активный' : 'В архиве'}
                </span>
            </div>

            {expanded && (
                <div className="answer-options">
                    <h5>Варианты ответов:</h5>
                    {question.answer_options.length > 0 ? (
                        <ul>
                            {question.answer_options.map(option => (
                                <li 
                                key={option.id} 
                                className={option.is_correct ? 'correct-answer' : ''}
                                >
                                    {option.text}
                                    {option.is_correct && ' ✔'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Нет вариантов ответа</p>
                    )}
                </div>
            )}
        </div>
    )
}