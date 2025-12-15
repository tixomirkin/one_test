'use client'

import {fullFormType, QuestionType} from "@/db/forms/get-full-form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronUp, Trash, Plus, X} from "lucide-react";
import {useDebounce} from "@/hooks/use-debounce";
import {useEffect, useState} from "react";
import updateQuestion from "@/db/forms/question/question-update";
import {toast} from "sonner";
import deleteQuestion from "@/db/forms/question/delete-question";
import moveQuestion from "@/db/forms/question/move-question";
import {Checkbox} from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import addOption from "@/db/forms/question/add-option";
import updateOption from "@/db/forms/question/update-option";
import deleteOption from "@/db/forms/question/delete-option";

const questionTypeLabels: Record<string, string> = {
    'text': 'Строка',
    'textarea': 'Большой текст',
    'single': 'Один вариант',
    'multiple': 'Несколько вариантов',
    'date': 'Выбор даты'
};

export default function QuestionSection({q, lastPosition, isTest} : {q: QuestionType, lastPosition: number, isTest: boolean}) {
    const [title, setTitle] = useState(q.questionText);
    const [required, setRequired] = useState(Boolean(q.required));
    const [correctAnswer, setCorrectAnswer] = useState(q.correctAnswer || '');
    const debouncedTitle = useDebounce(title, 600);
    const debouncedCorrectAnswer = useDebounce(correctAnswer, 600);

    useEffect(() => {
        if (debouncedTitle !== q.questionText && q.testId) {
            updateQuestion(q.testId, q.id, {questionText: debouncedTitle}).catch(e => toast.error(e.message));
        }
    }, [debouncedTitle]);

    useEffect(() => {
        if (required !== Boolean(q.required) && q.testId) {
            updateQuestion(q.testId, q.id, {required}).catch(e => toast.error(e.message));
        }
    }, [required]);

    useEffect(() => {
        if (isTest && debouncedCorrectAnswer !== (q.correctAnswer || '') && q.testId) {
            updateQuestion(q.testId, q.id, {correctAnswer: debouncedCorrectAnswer || null}).catch(e => toast.error(e.message));
        }
    }, [debouncedCorrectAnswer, isTest]);

    const handleTypeChange = (newType: string) => {
        updateQuestion(q.testId, q.id, {questionType: newType as any}).catch(e => toast.error(e.message));
    };

    const handleAddOption = async () => {
        try {
            await addOption(q.id, 'Новый вариант');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleOptionTextChange = async (optionId: number, newText: string) => {
        try {
            await updateOption(optionId, {optionText: newText});
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleOptionCorrectChange = async (optionId: number, isCorrect: boolean) => {
        try {
            await updateOption(optionId, {isCorrect});
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDeleteOption = async (optionId: number) => {
        try {
            await deleteOption(optionId);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const needsOptions = q.questionType === 'single' || q.questionType === 'multiple';
    const sortedOptions = [...(q.options || [])].sort((a, b) => a.position - b.position);

    return (
        <section className="p-5 w-full border rounded-lg space-y-4">
            <div className="space-y-2">
                <Label className='mb-2' htmlFor={`title-${q.id}`}>Текст вопроса</Label>
                <Input 
                    className='mb-2' 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    id={`title-${q.id}`}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`type-${q.id}`}>Тип вопроса:</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                {questionTypeLabels[q.questionType || 'text'] || 'Неизвестный тип'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Текстовые вопросы</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleTypeChange('text')}>
                                Строка
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTypeChange('textarea')}>
                                Большой текст
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Выбор из вариантов</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleTypeChange('single')}>
                                Один вариант
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTypeChange('multiple')}>
                                Несколько вариантов
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Выбор дат</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleTypeChange('date')}>
                                Выбор даты
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox 
                        id={`required-${q.id}`}
                        checked={required}
                        onCheckedChange={(checked) => setRequired(checked === true)}
                    />
                    <Label htmlFor={`required-${q.id}`} className="cursor-pointer">
                        Обязательный вопрос
                    </Label>
                </div>
            </div>

            {needsOptions && (
                <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <Label>Варианты ответов:</Label>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAddOption}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить вариант
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {sortedOptions.map((option) => (
                            <div key={option.id} className="flex items-center gap-2">
                                {isTest && (
                                    <Checkbox
                                        checked={Boolean(option.isCorrect)}
                                        onCheckedChange={(checked) => handleOptionCorrectChange(option.id, checked === true)}
                                    />
                                )}
                                <Input
                                    value={option.optionText}
                                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                                    placeholder="Текст варианта"
                                    className="flex-1"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteOption(option.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {sortedOptions.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Нет вариантов ответов. Добавьте хотя бы один вариант.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {isTest && !needsOptions && (
                <div className="space-y-2 border-t pt-4">
                    <Label htmlFor={`correct-answer-${q.id}`}>Правильный ответ:</Label>
                    <Input
                        id={`correct-answer-${q.id}`}
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Введите правильный ответ"
                    />
                </div>
            )}

            <div className="flex flex-row justify-end w-full gap-1 border-t pt-4">
                <Button variant='ghost' size='icon' onClick={() => deleteQuestion(q.testId, q.id).catch((e) => toast(e))}>
                    <Trash />
                </Button>
                <Button 
                    disabled={q.position == 0} 
                    onClick={() => moveQuestion(q.testId, q.id, true).catch((e) => toast(e))} 
                    variant='ghost' 
                    size='icon'
                >
                    <ChevronUp />
                </Button>
                <Button 
                    disabled={q.position == lastPosition} 
                    onClick={() => moveQuestion(q.testId, q.id).catch((e) => toast(e))} 
                    variant='ghost' 
                    size='icon'
                >
                    <ChevronDown />
                </Button>
            </div>
        </section>
    )
}