import { memo, useEffect, useRef, useState } from "react";
import { URL } from "../config/api.constants";
import { useRedirect } from "../hooks/useRedirect";
import { data, useNavigate } from "react-router-dom";
import {WaitModal} from '../Components/WaitModal'
import {} from 'shadcn'
// import { getStats } from "../services/api.service";

interface PollStats {
  poll_id: number
  poll_title: string
  total_questions: number
  answered_users: number
  user_stats: Array<{
    student: string
    answered_questions: number
    correct_answers: number
    score: number
  }>
}

interface StatsData {
  teacher: string
  polls: PollStats[]
}


export default function TeacherStats() {
  const waitmodal = useRef(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const navigate = useNavigate()
  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    getStats()
    .then(data => {
      setStats(data)
    })
    
  }, [])

  if (!stats) {
    return <WaitModal ref={waitmodal} isOpen />
  }

  return (
    <main className="stats-container">
      
      <header className="stats-header">
        <h1>Статистика опросов</h1>
        <p>Преподаватель: {stats.teacher}</p>
      </header>

      <section className="polls-stats">
        {stats.polls.map((poll) => (
          <PollStatsCard key={poll.poll_id} poll={poll} />
        ))}
      </section>

      <Button
        isPretty
        type="button"
        text="Вернуться в меню"
        onclick={() => navigate("/forteacher")}
        className="stats-back-button"
      />
    </main>
  )
}

const PollStatsCard = memo(({ poll }: { poll: PollStats }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="poll-card">
      <div className="poll-summary" onClick={() => setExpanded(!expanded)}>
        <h3>{poll.poll_title}</h3>
        <div className="poll-meta">
          <span>Вопросов: {poll.total_questions}</span>
          <span>Ответило: {poll.answered_users}</span>
        </div>
        <div className={`expand-icon ${expanded ? "expanded" : ""}`}>▼</div>
      </div>

      {expanded && (
        <div className="poll-details">
          {poll.user_stats.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Ответов</th>
                  <th>Правильно</th>
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {poll.user_stats.map((student) => (
                  <tr key={student.student}>
                    <td>{student.student}</td>
                    <td>{student.answered_questions}</td>
                    <td>{student.correct_answers}</td>
                    <td>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{ width: `${student.score}%` }}
                        />
                        <span>{student.score}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-answers">Нет данных о ответах</p>
          )}
        </div>
      )}
    </article>
  )
})