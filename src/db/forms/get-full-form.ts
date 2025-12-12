'use server'

import {db} from "@/db";
import {eq, or} from "drizzle-orm";
import {testsTable} from "@/db/schema/tests";
import {questionTable} from "@/db/schema";

const fullFormQueryById = (testId: number) => db.query.testsTable.findFirst({
    where: eq(testsTable.id, testId),
    with: {
        question: {
            orderBy: questionTable.position,
            with: {
                options: {}
            },
        },
    }
});

const fullFormQueryBySlug = (slug: string) => db.query.testsTable.findFirst({
    where: eq(testsTable.slug, slug),
    with: {
        question: {
            orderBy: questionTable.position,
            with: {
                options: {}
            },
        },
    }
});

export type fullFormType = NonNullable<Awaited<ReturnType<typeof fullFormQueryById>>>
export type QuestionType = fullFormType["question"][number]

// Для обратной совместимости - работает с ID
export default async function getFullForm(formId: string | number) {
    if (typeof formId === 'number') {
        return await fullFormQueryById(formId);
    }
    
    const testId = parseInt(formId);
    if (!isNaN(testId)) {
        return await fullFormQueryById(testId);
    }
    
    return null;
}

// Получение формы по slug
export async function getFullFormBySlug(slug: string) {
    return await fullFormQueryBySlug(slug);
}