'use server'

import { FormAnswer } from "@/components/forms/publc-form";
import { db } from "@/db";
import { answersTable, attemptsTable, questionTable, testsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canTakeForm, isFormPublic } from "@/lib/form-access";
import { getUser } from "@/lib/get-user";
import getFullForm from "@/db/forms/get-full-form";

export type TestResult = {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    questions: Array<{
        questionId: number;
        questionText: string;
        isCorrect: boolean;
        userAnswer: string | number | number[] | null;
        correctAnswer: string | number | number[] | null;
    }>;
};

export default async function sendAttempts(value: FormAnswer, formId: number): Promise<true | TestResult | false> {
    try {
        const forms = await db
            .select()
            .from(testsTable)
            .where(eq(testsTable.id, formId))
            .limit(1);

        if (forms.length === 0) {
            return false;
        }

        // Проверяем доступ: форма должна быть публичной ИЛИ пользователь должен иметь доступ
        const isPublic = await isFormPublic(formId);
        let hasAccess = false;
        
        try {
            hasAccess = await canTakeForm(formId);
        } catch (error) {
            // Если пользователь не авторизован, проверяем только публичность
            hasAccess = false;
        }

        if (!isPublic && !hasAccess) {
            return false;
        }

        // Получаем userId, если пользователь авторизован
        let userId: number | undefined;
        try {
            const user = await getUser();
            userId = user.id;
        } catch (error) {
            // Пользователь не авторизован - userId останется undefined
        }

        const form = forms[0];
        const isTest = form.isTest;

        // Получаем полную информацию о форме для проверки ответов (если это тест)
        let testResult: TestResult | null = null;
        if (isTest) {
            const fullForm = await getFullForm(formId);
            if (!fullForm) {
                return false;
            }

            testResult = {
                totalQuestions: fullForm.question.length,
                correctAnswers: 0,
                incorrectAnswers: 0,
                questions: [],
            };

            // Проверяем каждый ответ
            for (const question of fullForm.question) {
                const userAnswer = value.questions.find(q => q.id === question.id);
                let isCorrect = false;
                let userAnswerValue: string | number | number[] | null = null;
                let correctAnswerValue: string | number | number[] | null = null;

                if (question.questionType === 'single' || question.questionType === 'multiple') {
                    // Для вопросов с вариантами ответов
                    const correctOptionIds = (question.options || [])
                        .filter(opt => opt.isCorrect)
                        .map(opt => opt.id)
                        .sort((a, b) => a - b);

                    if (question.questionType === 'single') {
                        const userOptionId = typeof userAnswer?.answer === 'number' ? userAnswer.answer : null;
                        userAnswerValue = userOptionId;
                        correctAnswerValue = correctOptionIds[0] || null;
                        isCorrect = userOptionId !== null && correctOptionIds.includes(userOptionId);
                    } else {
                        // multiple
                        const userOptionIds = Array.isArray(userAnswer?.answer) 
                            ? (userAnswer.answer as number[]).sort((a, b) => a - b)
                            : [];
                        userAnswerValue = userOptionIds;
                        correctAnswerValue = correctOptionIds;
                        isCorrect = userOptionIds.length === correctOptionIds.length &&
                            userOptionIds.every((id, index) => id === correctOptionIds[index]);
                    }
                } else {
                    // Для текстовых вопросов
                    const userText = typeof userAnswer?.answer === 'string' ? userAnswer.answer.trim() : '';
                    const correctText = question.correctAnswer?.trim() || '';
                    userAnswerValue = userText;
                    correctAnswerValue = correctText;
                    isCorrect = userText.toLowerCase() === correctText.toLowerCase();
                }

                if (isCorrect) {
                    testResult.correctAnswers++;
                } else {
                    testResult.incorrectAnswers++;
                }

                testResult.questions.push({
                    questionId: question.id,
                    questionText: question.questionText,
                    isCorrect,
                    userAnswer: userAnswerValue,
                    correctAnswer: correctAnswerValue,
                });
            }
        }

        await db.transaction(async (trx) => {
            const [attempt] = await trx
                .insert(attemptsTable)
                .values({
                    testId: formId,
                    userId: userId,
                })
                .$returningId();

            const attemptId = attempt.id;

            for (const question of value.questions) {
                const questions = await trx
                    .select()
                    .from(questionTable)
                    .where(eq(questionTable.id, question.id))
                    .limit(1);

                if (questions.length === 0) {
                    continue;
                }

                const questionData = questions[0];
                const questionType = questionData.questionType;

                // Обработка разных типов вопросов
                if (questionType === 'single') {
                    // Один вариант - сохраняем optionId
                    const optionId = typeof question.answer === 'number' ? question.answer : null;
                    if (optionId) {
                        await trx.insert(answersTable).values({
                            attemptId: attemptId,
                            questionId: question.id,
                            optionId: optionId,
                        });
                    }
                } else if (questionType === 'multiple') {
                    // Несколько вариантов - создаем несколько записей
                    const optionIds = Array.isArray(question.answer) ? question.answer as number[] : [];
                    for (const optionId of optionIds) {
                        await trx.insert(answersTable).values({
                            attemptId: attemptId,
                            questionId: question.id,
                            optionId: optionId,
                        });
                    }
                } else {
                    // text, textarea, date - сохраняем в textAnswer
                    const textAnswer = typeof question.answer === 'string' ? question.answer : String(question.answer);
                    await trx.insert(answersTable).values({
                        attemptId: attemptId,
                        questionId: question.id,
                        textAnswer: textAnswer,
                    });
                }
            }
        });

        if (isTest && testResult) {
            return testResult;
        }

        return true;
    } catch (error) {
        console.error('Error sending attempts:', error);
        return false;
    }
}