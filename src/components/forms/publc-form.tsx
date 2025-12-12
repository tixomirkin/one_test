'use client'

import {z} from "zod";
import {fullFormType} from "@/db/forms/get-full-form";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useState} from "react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Spinner} from "@/components/ui/spinner";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import sendAttempts from "@/db/attempts/send-attempts";

// Создаем динамическую схему валидации на основе вопросов формы
function createFormAnswerSchema(questions: fullFormType['question']) {
    return z.object({
        questions: z.array(
            z.object({
                id: z.number(),
                answer: z.union([
                    z.string(),
                    z.number(),
                    z.array(z.number()),
                ])
            })
        ).superRefine((answers, ctx) => {
            // Проверяем обязательные вопросы
            questions.forEach((q, index) => {
                if (q.required) {
                    const answer = answers.find(a => a.id === q.id);
                    let isValid = false;

                    if (q.questionType === 'single') {
                        isValid = typeof answer?.answer === 'number' && answer.answer > 0;
                    } else if (q.questionType === 'multiple') {
                        isValid = Array.isArray(answer?.answer) && (answer.answer as number[]).length > 0;
                    } else {
                        isValid = typeof answer?.answer === 'string' && answer.answer.trim().length > 0;
                    }

                    if (!isValid) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: [index, 'answer'],
                            message: "Это поле обязательно для заполнения"
                        });
                    }
                }
            });
        })
    })
}

export type FormAnswer = {
    questions: Array<{
        id: number;
        answer: string | number | number[];
    }>
}

export function PublicForm({fullForm}: {fullForm: fullFormType}) {
    const FormAnswerSchema = createFormAnswerSchema(fullForm.question);

    const form = useForm<FormAnswer>({
        resolver: zodResolver(FormAnswerSchema),
        defaultValues: {
            questions: fullForm.question.map(q => ({
                id: q.id,
                answer: q.questionType === 'multiple' ? [] : (q.questionType === 'single' ? 0 : '')
            }))
        }
    })

    const control = form.control

    const { fields } = useFieldArray({
        control,
        name: "questions"
    })

    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(values: FormAnswer) {
        setIsLoading(true);

        try {
            const result = await sendAttempts(values, fullForm.id);
            if (result) {
                toast.success("Ответы успешно отправлены");
                form.reset();
                return;
            }
            toast.error("Не удалось отправить ответы");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const renderQuestionField = (q: fullFormType['question'][number], index: number) => {
        const sortedOptions = [...(q.options || [])].sort((a, b) => a.position - b.position);
        const isRequired = Boolean(q.required);

        switch (q.questionType) {
            case 'text':
                return (
                    <FormField
                        key={q.id}
                        control={form.control}
                        name={`questions.${index}.answer`}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    {q.questionText}
                                    {isRequired && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={field.value as string || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                );

            case 'textarea':
                return (
                    <FormField
                        key={q.id}
                        control={form.control}
                        name={`questions.${index}.answer`}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    {q.questionText}
                                    {isRequired && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Textarea 
                                        {...field} 
                                        value={field.value as string || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                );

            case 'date':
                return (
                    <FormField
                        key={q.id}
                        control={form.control}
                        name={`questions.${index}.answer`}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    {q.questionText}
                                    {isRequired && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date"
                                        {...field} 
                                        value={field.value as string || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                );

            case 'single':
                return (
                    <FormField
                        key={q.id}
                        control={form.control}
                        name={`questions.${index}.answer`}
                        rules={{ required: isRequired ? "Выберите один из вариантов" : false }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    {q.questionText}
                                    {isRequired && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        {sortedOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id={`option-${option.id}`}
                                                    name={`question-${q.id}`}
                                                    value={option.id}
                                                    checked={field.value === option.id}
                                                    onChange={() => field.onChange(option.id)}
                                                    className="h-4 w-4"
                                                />
                                                <label 
                                                    htmlFor={`option-${option.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {option.optionText}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                );

            case 'multiple':
                return (
                    <FormField
                        key={q.id}
                        control={form.control}
                        name={`questions.${index}.answer`}
                        rules={{ required: isRequired ? "Выберите хотя бы один вариант" : false }}
                        render={({field}) => {
                            const selectedIds = (field.value as number[]) || [];
                            
                            return (
                                <FormItem>
                                    <FormLabel>
                                        {q.questionText}
                                        {isRequired && <span className="text-destructive ml-1">*</span>}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {sortedOptions.map((option) => (
                                                <div key={option.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`option-${option.id}`}
                                                        checked={selectedIds.includes(option.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...selectedIds, option.id]);
                                                            } else {
                                                                field.onChange(selectedIds.filter(id => id !== option.id));
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`option-${option.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {option.optionText}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            );
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {fields.map((f, index) => {
                    const q = fullForm.question[index];
                    return renderQuestionField(q, index);
                })}

                <Button disabled={isLoading} type="submit">
                    { isLoading && <Spinner /> }
                    Отправить
                </Button>
            </form>
        </Form>
    )
}