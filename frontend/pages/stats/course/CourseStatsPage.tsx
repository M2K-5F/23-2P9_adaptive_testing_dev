import React, { useState, useEffect, FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useCourseStore } from '@/stores/useCourseStore';
import { CourseStatistics, GroupDetail, UserGroupDetail, UserTopicDetail } from '@/types/interfaces';
import { getCourseStats} from '@/services/api.service';

export const AdvancedCourseStatistics: FC = () => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
    const [statistics, setStatistics] = useState<CourseStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const createdCourses = useCourseStore(s => s.createdCourses);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (selectedCourseId) {
                setLoading(true);
                try {
                    const stats = await getCourseStats(parseInt(selectedCourseId));
                    setStatistics(stats);
                } catch (error) {
                    console.error('Error fetching statistics:', error);
                } finally {
                    setLoading(false);
                }
                setSelectedGroupId('');
                setExpandedStudents(new Set());
            } else {
                setStatistics(null);
            }
        };

        fetchStatistics();
    }, [selectedCourseId]);

    const selectedGroup = statistics?.group_details.find(g => g.id.toString() === selectedGroupId);

    const toggleStudentExpansion = (studentId: number) => {
        setExpandedStudents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    if (loading) {
        return <div className="flex justify-center p-8">Загрузка...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Селекторы */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Детальная аналитика курсов</h1>
                
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Курс</label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите курс" />
                            </SelectTrigger>
                            <SelectContent>
                                {createdCourses.map((course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Группа</label>
                        <Select 
                            value={selectedGroupId} 
                            onValueChange={setSelectedGroupId}
                            disabled={!selectedCourseId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedCourseId ? "Выберите группу" : "Сначала выберите курс"} />
                            </SelectTrigger>
                            <SelectContent>
                                {statistics?.group_details.map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Таблица групп курса */}
            {statistics && (
                <Card>
                    <CardHeader>
                        <CardTitle>Группы курса "{statistics.course_title}"</CardTitle>
                        <CardDescription>
                            Средний прогресс: {Math.round(statistics.meta.avg_progress * 100)}% • 
                            Студентов: {statistics.meta.total_students} • 
                            Завершивших групп: {statistics.meta.completed_user_groups}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table className="border border-collapse">
                            <TableHeader>
                                <TableRow className="border-b">
                                    <TableHead className="border-r font-medium">Группа</TableHead>
                                    <TableHead className="border-r">Размер</TableHead>
                                    <TableHead className="border-r">Прогресс</TableHead>
                                    <TableHead className="border-r">Эффективность</TableHead>
                                    <TableHead className="border-r">Статус</TableHead>
                                    <TableHead>Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statistics.group_details.map((group) => (
                                    <TableRow key={group.id} className="border-b hover:bg-muted/50">
                                        <TableCell className="border-r font-medium">{group.title}</TableCell>
                                        <TableCell className="border-r">
                                            <Badge variant="outline">
                                                {group.student_count}/{group.max_student_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border-r">
                                            <div className="flex items-center gap-2">
                                                <Progress value={group.avg_progress * 100} className="w-20" offsetValue={2} />
                                                <span>{Math.round(group.avg_progress * 100)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-r">
                                            <Badge variant={
                                                group.avg_progress > 0.7 ? "success" :
                                                group.avg_progress > 0.4 ? "warning" : "destructive"
                                            }>
                                                {group.avg_progress > 0.7 ? "Высокая" :
                                                 group.avg_progress > 0.4 ? "Средняя" : "Низкая"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border-r">
                                            <Badge variant={group.student_count > 0 ? "default" : "secondary"}>
                                                {group.student_count > 0 ? "Активна" : "Пустая"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setSelectedGroupId(group.id.toString())}
                                            >
                                                Анализировать
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Детальная аналитика группы */}
            {selectedGroup && (
                <Card>
                    <CardHeader>
                        <CardTitle>Аналитика группы "{selectedGroup.title}"</CardTitle>
                        <CardDescription>
                            Прогресс: {Math.round(selectedGroup.avg_progress * 100)}% • 
                            Студентов: {selectedGroup.student_count} •
                            Заполненность: {Math.round((selectedGroup.student_count / selectedGroup.max_student_count) * 100)}%
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Адаптивные параметры */}
                        <AdaptiveParameters group={selectedGroup} />
                        
                        {/* Таблица студентов с детализацией по темам */}
                        <Table className="border border-collapse">
                            <TableHeader>
                                <TableRow className="border-b">
                                    <TableHead className="border-r font-medium">Студент</TableHead>
                                    <TableHead className="border-r">Прогресс</TableHead>
                                    <TableHead className="border-r">Темы</TableHead>
                                    <TableHead className="border-r">Активность</TableHead>
                                    <TableHead className="border-r">Рейтинг</TableHead>
                                    <TableHead className="border-r">Контакты</TableHead>
                                    <TableHead>Детали</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedGroup.user_group_details.map((student) => (
                                    <React.Fragment key={student.user.id}>
                                        <TableRow className="border-b hover:bg-muted/50">
                                            <TableCell className="border-r font-medium">{student.user.name}</TableCell>
                                            <TableCell className="border-r">
                                                <div className="flex items-center gap-2">
                                                    <Progress value={student.progress * 100} className="w-20" offsetValue={2} />
                                                    <span>{Math.round(student.progress * 100)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r">
                                                <Badge variant="outline">
                                                    {student.completed_topics}/{student.total_topics}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="border-r">
                                                <Badge variant={
                                                    student.progress > 0.8 ? "success" :
                                                    student.progress > 0.5 ? "warning" : "destructive"
                                                }>
                                                    {student.progress > 0.8 ? "Высокая" :
                                                     student.progress > 0.5 ? "Средняя" : "Низкая"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="border-r">
                                                <Badge>
                                                    {student.progress > 0.9 ? "A" :
                                                     student.progress > 0.7 ? "B" :
                                                     student.progress > 0.5 ? "C" : "D"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="border-r">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => window.open(student.user.telegram_link, '_blank')}
                                                >
                                                    Telegram
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => toggleStudentExpansion(student.user.id)}
                                                >
                                                    {expandedStudents.has(student.user.id) ? 
                                                        <ChevronUpIcon className="h-4 w-4" /> : 
                                                        <ChevronDownIcon className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Детальная информация по темам студента */}
                                        {expandedStudents.has(student.user.id) && (
                                            <TableRow className="bg-muted/30">
                                                <TableCell colSpan={7} className="p-0">
                                                    <StudentTopicsDetails topics={student.user_topic_details} />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};


const StudentTopicsDetails: FC<{ topics: UserTopicDetail[] }> = ({ topics }) => {
    return (
        <div className="p-4 space-y-4">
            <h4 className="font-semibold">Детальная информация по темам:</h4>
            {topics.map((topic, index) => (
                <Card key={topic.topic_title} className={index > 0 ? "mt-4" : ""}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex justify-between items-center">
                            <span>{topic.topic_title}</span>
                            <div className="flex gap-2 items-center">
                                <Badge variant={topic.is_completed ? "success" : "secondary"}>
                                    {topic.is_completed ? "Завершена" : "В процессе"}
                                </Badge>
                                <Badge variant="outline">
                                    {Math.round(topic.progress * 100)}%
                                </Badge>
                                <Badge variant="outline">
                                    {topic.attempt_count} попыт.
                                </Badge>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Таблица вопросов темы */}
                        <Table className="border border-collapse">
                            <TableHeader>
                                <TableRow className="border-b">
                                    <TableHead className="border-r font-medium w-1/2">Вопрос</TableHead>
                                    <TableHead className="border-r">Балл</TableHead>
                                    <TableHead className="border-r">Вес</TableHead>
                                    <TableHead>Прогресс</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topic.question_scores?.map((question) => (
                                    <TableRow key={question.question_id} className="border-b">
                                        <TableCell className="border-r text-sm">{question.question_text}</TableCell>
                                        <TableCell className="border-r">
                                            <Badge variant={question.score >= 0.8 ? "success" : question.score >= 0.5 ? "warning" : "destructive"}>
                                                {Math.round(question.score * 100)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border-r">
                                            <Badge variant="outline">{question.weight}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Progress value={question.score * 100} className="w-16" offsetValue={2} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


const AdaptiveParameters: FC<{ group: GroupDetail }> = ({ group }) => {
    const adaptiveProfile = group.adaptive_profile;
    const weightProfile = group.weight_profile;

    if (!adaptiveProfile && !weightProfile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Адаптивные параметры группы</CardTitle>
                    <CardDescription>Параметры не настроены</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Адаптивные параметры группы</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="border border-collapse">
                    <TableHeader>
                        <TableRow className="border-b">
                            <TableHead className="border-r font-medium">Параметр</TableHead>
                            <TableHead className="border-r">Значение</TableHead>
                            <TableHead className="border-r">Описание</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Профиль адаптивности</TableCell>
                                <TableCell className="border-r">
                                    <Badge variant="outline">{adaptiveProfile.name}</Badge>
                                </TableCell>
                                <TableCell className="border-r text-sm">Стратегия подбора вопросов</TableCell>
                            </TableRow>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Влияние веса вопроса</TableCell>
                                <TableCell className="border-r">{adaptiveProfile.question_weight * 100}%</TableCell>
                                <TableCell className="border-r text-sm">Влияние сложности вопроса на подбор</TableCell>
                            </TableRow>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Влияние последнего ответа</TableCell>
                                <TableCell className="border-r">{adaptiveProfile.last_score * 100}%</TableCell>
                                <TableCell className="border-r text-sm">Учет предыдущих результатов</TableCell>
                            </TableRow>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Доля адаптивных вопросов</TableCell>
                                <TableCell className="border-r">{Math.round(adaptiveProfile.max_adaptive_questions_ratio * 100)}%</TableCell>
                                <TableCell className="border-r text-sm">Вопросы из предыдущих тем</TableCell>
                            </TableRow>
                        </>
                        <>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Базовый вес вопросов</TableCell>
                                <TableCell className="border-r">{group.avg_base_weight}</TableCell>
                                <TableCell className="border-r text-sm">Начальный вес новых вопросов</TableCell>
                            </TableRow>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Средний вес вопросов</TableCell>
                                <TableCell className="border-r">{group.avg_question_weight}</TableCell>
                                <TableCell className="border-r text-sm">Текущая сложность вопросов группы</TableCell>
                            </TableRow>
                            <TableRow className="border-b">
                                <TableCell className="border-r font-medium">Смещение оценки</TableCell>
                                <TableCell className="border-r">{weightProfile.score_bias}</TableCell>
                                <TableCell className="border-r text-sm">Корректировка точки равновесия</TableCell>
                            </TableRow>
                        </>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AdvancedCourseStatistics;