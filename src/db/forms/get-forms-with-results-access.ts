'use server'

import { getUser } from "@/lib/get-user";
import { db } from "@/db";
import { testsTable, accessTable, questionTable, attemptsTable } from "@/db/schema";
import { count, eq, or, and } from "drizzle-orm";

export type FormsWithResultsAccessType = {
    id: number;
    ownerId: number | null;
    title: string;
    description: string;
    isTest: boolean;
    isPublic: boolean;
    createdAt: Date;
    questionCount: number;
    attemptsCount: number;
    role: 'owner' | 'editor' | 'reader' | null;
}[];

/**
 * Получить список форм, к которым у пользователя есть доступ для просмотра результатов
 */
export default async function getFormsWithResultsAccess(): Promise<FormsWithResultsAccessType> {
    const user = await getUser();

    const questionsCount = db.$with("qCount").as(
        db.select({ testId: questionTable.testId, count: count().as("qCount") })
            .from(questionTable)
            .groupBy(questionTable.testId)
    );
    
    const attemptsCount = db.$with("aCount").as(
        db.select({ testId: attemptsTable.testId, count: count().as("aCount") })
            .from(attemptsTable)
            .groupBy(attemptsTable.testId)
    );

    // Получаем формы, где пользователь владелец
    const ownedForms = await db
        .with(questionsCount, attemptsCount)
        .select({
            id: testsTable.id,
            ownerId: testsTable.ownerId,
            title: testsTable.title,
            description: testsTable.description,
            isTest: testsTable.isTest,
            isPublic: testsTable.isPublic,
            createdAt: testsTable.createdAt,
            questionCount: questionsCount.count,
            attemptsCount: attemptsCount.count,
        })
        .from(testsTable)
        .leftJoin(questionsCount, eq(questionsCount.testId, testsTable.id))
        .leftJoin(attemptsCount, eq(attemptsCount.testId, testsTable.id))
        .where(eq(testsTable.ownerId, user.id));

    // Получаем формы с доступом (editor, reader) - owner уже в ownedForms
    const accessForms = await db
        .with(questionsCount, attemptsCount)
        .select({
            id: testsTable.id,
            ownerId: testsTable.ownerId,
            title: testsTable.title,
            description: testsTable.description,
            isTest: testsTable.isTest,
            isPublic: testsTable.isPublic,
            createdAt: testsTable.createdAt,
            questionCount: questionsCount.count,
            attemptsCount: attemptsCount.count,
            role: accessTable.role,
        })
        .from(accessTable)
        .innerJoin(testsTable, eq(testsTable.id, accessTable.testId))
        .leftJoin(questionsCount, eq(questionsCount.testId, testsTable.id))
        .leftJoin(attemptsCount, eq(attemptsCount.testId, testsTable.id))
        .where(and(
            eq(accessTable.userId, user.id),
            or(
                eq(accessTable.role, 'editor'),
                eq(accessTable.role, 'reader')
            )
        ));

    // Объединяем результаты, убирая дубликаты (если форма есть и в ownedForms, и в accessForms)
    const formsMap = new Map<number, FormsWithResultsAccessType[0]>();

    // Добавляем формы владельца
    for (const form of ownedForms) {
        formsMap.set(form.id, { ...form, role: 'owner' });
    }

    // Добавляем формы с доступом (не перезаписываем, если уже есть как owner)
    for (const form of accessForms) {
        if (!formsMap.has(form.id)) {
            formsMap.set(form.id, {
                ...form,
                role: form.role as 'owner' | 'editor' | 'reader' | null,
            });
        }
    }

    return Array.from(formsMap.values());
}
