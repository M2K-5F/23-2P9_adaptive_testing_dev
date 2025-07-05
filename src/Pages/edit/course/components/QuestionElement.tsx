import { CreatedQuestion } from "../../../../types/interfaces"
import { Dispatch, SetStateAction, useState } from "react"
import { archQuestion } from "../../../../services/api.service"


export const QuestionElement = ({ 
    question, loadingSetter
}: {
    question: CreatedQuestion,
    loadingSetter: Dispatch<SetStateAction<boolean>>
}) => {
    const [expanded, setExpanded] = useState<boolean>(false)

    const handleArchive = () => {
        archQuestion(question.id)
        .then(() => loadingSetter(true))
    }


    return (
        <article className={`question-card ${expanded ? 'expanded' : ''} ${question.is_active ? '' : 'archived'}`}>

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
                        {question.is_active ? '🗄️' : '📦'}
                    </button>
                    
                </div>

            </div>

            <div className="question-meta">

                <span>
                    Тип: {question.question_type === 'single' ? 'Один ответ' : 'Множественный выбор'}
                </span>

                <span className={`status ${!question.is_active ? 'archived' : 'active'}`}>
                    {question.is_active ? 'Активный' : 'В архиве'}
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
        </article>
    )
}