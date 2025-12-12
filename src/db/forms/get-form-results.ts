'use server'

import { db } from "@/db";
import { attemptsTable, answersTable, questionTable, testsTable, optionsTable, usersTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { canViewResults } from "@/lib/form-access";
import { getUser } from "@/lib/get-user";

export type FormResultAttempt = {
    id: number;
    userId: number | null;
    userName: string | null;
    createdAt: Date;
    answers: {
        id: number;
        questionId: number;
        questionText: string;
        questionType: string;
        optionId: number | null;
        optionText: string | null;
        textAnswer: string | null;
    }[];
};

export type FormResults = {
    formId: number;
    formTitle: string;
    attempts: FormResultAttempt[];
};

/**
 * Получить результаты формы
 */
export default async function getFormResults(formId: number): Promise<FormResults | null> {
    try {
        // Проверяем доступ
        const hasAccess = await canViewResults(formId);
        if (!hasAccess) {
            // Проверяем, является ли форма публичной (для просмотра результатов нужен доступ)
            const form = await db
                .select({ isPublic: testsTable.isPublic })
                .from(testsTable)
                .where(eq(testsTable.id, formId))
                .limit(1);
            
            if (form.length === 0 || !form[0].isPublic) {
                return null;
            }
        }

        // Получаем форму
        const form = await db
            .select({
                id: testsTable.id,
                title: testsTable.title,
            })
            .from(testsTable)
            .where(eq(testsTable.id, formId))
            .limit(1);

        if (form.length === 0) {
            return null;
        }

        // Получаем все попытки с ответами
        const attempts = await db
            .select({
                attemptId: attemptsTable.id,
                attemptUserId: attemptsTable.userId,
                attemptCreatedAt: attemptsTable.createdAt,
                answerId: answersTable.id,
                questionId: questionTable.id,
                questionText: questionTable.questionText,
                questionType: questionTable.questionType,
                optionId: optionsTable.id,
                optionText: optionsTable.optionText,
                textAnswer: answersTable.textAnswer,
            })
            .from(attemptsTable)
            .leftJoin(answersTable, eq(answersTable.attemptId, attemptsTable.id))
            .leftJoin(questionTable, eq(questionTable.id, answersTable.questionId))
            .leftJoin(optionsTable, eq(optionsTable.id, answersTable.optionId))
            .where(eq(attemptsTable.testId, formId))
            .orderBy(attemptsTable.createdAt);

        // Группируем ответы по попыткам
        const attemptsMap = new Map<number, FormResultAttempt>();

        for (const row of attempts) {
            if (!row.attemptId) continue;

            if (!attemptsMap.has(row.attemptId)) {
                attemptsMap.set(row.attemptId, {
                    id: row.attemptId,
                    userId: row.attemptUserId ?? null,
                    userName: null,
                    createdAt: row.attemptCreatedAt ?? new Date(),
                    answers: [],
                });
            }

            const attempt = attemptsMap.get(row.attemptId)!;

            if (row.answerId && row.questionId) {
                attempt.answers.push({
                    id: row.answerId,
                    questionId: row.questionId,
                    questionText: row.questionText ?? '',
                    questionType: row.questionType ?? '',
                    optionId: row.optionId ?? null,
                    optionText: row.optionText ?? null,
                    textAnswer: row.textAnswer ?? null,
                });
            }
        }

        // Получаем имена пользователей для попыток с userId
        const userIds = Array.from(new Set(
            Array.from(attemptsMap.values())
                .map(a => a.userId)
                .filter((id): id is number => id !== null)
        ));

        if (userIds.length > 0) {
            const users = await db
                .select({
                    id: usersTable.id,
                    username: usersTable.username,
                })
                .from(usersTable)
                .where(inArray(usersTable.id, userIds));

            const usersMap = new Map(users.map(u => [u.id, u.username]));

            for (const attempt of attemptsMap.values()) {
                if (attempt.userId) {
                    attempt.userName = usersMap.get(attempt.userId) ?? null;
                }
            }
        }

        return {
            formId: form[0].id,
            formTitle: form[0].title,
            attempts: Array.from(attemptsMap.values()),
        };
    } catch (error) {
        console.error('Error getting form results:', error);
        return null;
    }
}
