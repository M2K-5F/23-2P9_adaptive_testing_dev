import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { CreatedTopic, FollowedCourse } from "../../types/interfaces";
import { Loader } from '../../Components/ui/Loader';
import { TopicElement } from "./Components/TopicElement";
import { followCourse, getFollowedCourses, getTopics, unfollowCourse } from "../../services/api.service";
import { userStore } from "../../stores/userStore";
import { useCourseViewStore } from "./store/CourseViewStore";

export const  CourseViewPage = () => {
    const nav = useNavigate();
    const { nick } = userStore();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('fcourse_id')!;
    const {
        getData, 
        isFollowed, 
        isFollowError, 
        isLoading, 
        course, 
        topics,
        followHandler
    } = useCourseViewStore()

    useLayoutEffect(() => {
        if (!courseId) {
            nav('/');
            return;
        }
        getData(courseId)
    }, [courseId]);

    if (isLoading) {
        return <Loader />;
    }

    if (!courseId) {
        return null;
    }

    return (
        <div className="teacher-portal">

            <header className="portal-header">
                <h1>{course?.title || 'Курс'}</h1>
                
                <button 
                    className={`create-course-btn ${isFollowed ? 'unfollow-btn' : ''}`}
                    onClick={() => followHandler(courseId)}
                    style={isFollowed ? {backgroundColor: 'red'} : {}}
                >
                    {isFollowed ? 'Отписаться от курса' : 'Подписаться на курс'}
                </button>
            </header>

            <CourseDetailsContainer />
        </div>
    );
}

const CourseDetailsContainer = () => {
    const {topics, isFollowed} = useCourseViewStore()
    return(
        <section className="course-topics">
            <div className="topics-flex">
                {topics.length
                    ?   topics.sort((topic1, topic2) => topic1.number_in_course - topic2.number_in_course).map((topic, index) => {
                            return(
                                <>
                                    {index !== 0 && <DownArrowElemunt />}
                                    <article style={{width: '100%'}} className="course-card">
                                        <h3>{topic.title}</h3>
                                        <p>{topic.description}</p>
                                        <p>Вопросоов в теме: <b>{topic.count}</b></p>
                                        {isFollowed && <div className="course-status">
                                            Статус: {topic.is_active ?
                                                <b key={topic.id} className="active">Можно проходить!</b>
                                                :
                                                <b key={topic.id} className="archived">В архиве! Временно недоступно</b>
                                            }
                                        </div>}
                                    </article>
                                </>
                            )
                        })
                    : <p className="no-courses-message">Нет доступных тем</p>
                }
            </div>
        </section>
    )
}


const DownArrowElemunt = () => {
    return(
        <div style={{fontSize: '36px', textAlign: 'center'}} >⇩</div>
    )
}