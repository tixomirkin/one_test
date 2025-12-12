'use server'

import {getUser} from "@/lib/get-user";
import {db} from "@/db";
import {testsTable} from "@/db/schema/tests";
import {accessTable} from "@/db/schema/access";
import {count, eq, and, or} from "drizzle-orm";
import {questionTable} from "@/db/schema/questions";
import {attemptsTable} from "@/db/schema/attempts";

export type UsersFormsType = {id: number
    ownerId: number | null
    title: string
    description: string
    isTest: boolean
    isPublic: boolean
    slug: string
    createdAt: Date
    questionCount: number
    attemptsCount: number
}[]

export default async function getUserForm() : Promise<UsersFormsType> {
    const user = await getUser()

    const questionsCount = db.$with("qCount").as(
        db.select({testId: questionTable.testId, count: count().as("qCount")}).from(questionTable).groupBy(questionTable.testId))
    const attemptsCount = db.$with("aCount").as(
        db.select({testId: attemptsTable.testId, count: count().as("aCount")}).from(attemptsTable).groupBy(attemptsTable.testId))

    // Получаем формы, где пользователь владелец
    const ownedForms = await db.with(questionsCount, attemptsCount)
        .select({
            id: testsTable.id,
            ownerId: testsTable.ownerId,
            title: testsTable.title,
            description: testsTable.description,
            isTest: testsTable.isTest,
            isPublic: testsTable.isPublic,
            slug: testsTable.slug,
            createdAt: testsTable.createdAt,
            questionCount: questionsCount.count,
            attemptsCount: attemptsCount.count
        })
        .from(testsTable)
        .leftJoin(questionsCount, eq(questionsCount.testId, testsTable.id))
        .leftJoin(attemptsCount, eq(attemptsCount.testId, testsTable.id))
        .where(eq(testsTable.ownerId, user.id))

    // Получаем формы с доступом (owner, editor, reader, participant)
    const accessForms = await db.with(questionsCount, attemptsCount)
        .select({
            id: testsTable.id,
            ownerId: testsTable.ownerId,
            title: testsTable.title,
            description: testsTable.description,
            isTest: testsTable.isTest,
            isPublic: testsTable.isPublic,
            slug: testsTable.slug,
            createdAt: testsTable.createdAt,
            questionCount: questionsCount.count,
            attemptsCount: attemptsCount.count
        })
        .from(accessTable)
        .innerJoin(testsTable, eq(testsTable.id, accessTable.testId))
        .leftJoin(questionsCount, eq(questionsCount.testId, testsTable.id))
        .leftJoin(attemptsCount, eq(attemptsCount.testId, testsTable.id))
        .where(eq(accessTable.userId, user.id))

    // Объединяем результаты, убирая дубликаты (если форма есть и в ownedForms, и в accessForms)
    const formsMap = new Map<number, UsersFormsType[0]>();

    // Добавляем формы владельца
    for (const form of ownedForms) {
        formsMap.set(form.id, form);
    }

    // Добавляем формы с доступом (не перезаписываем, если уже есть как owner)
    for (const form of accessForms) {
        if (!formsMap.has(form.id)) {
            formsMap.set(form.id, form);
        }
    }

    return Array.from(formsMap.values());

}