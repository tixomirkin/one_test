'use server'

import { FormAnswer } from "@/components/forms/publc-form";
import { db } from "@/db";
import { answersTable, attemptsTable, questionTable, testsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canTakeForm, isFormPublic } from "@/lib/form-access";
import { getUser } from "@/lib/get-user";

export default async function sendAttempts(value: FormAnswer, formId: number) {
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

        return true;
    } catch (error) {
        console.error('Error sending attempts:', error);
        return false;
    }
}