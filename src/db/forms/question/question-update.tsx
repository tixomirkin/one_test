'use server'

import {questionTable} from "@/db/schema";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";

type QuestionUpdateProps = Partial<
    Omit<typeof questionTable.$inferInsert, "id" | "testId" | "createdAt">
>
export default async function updateQuestion(formId: number, qId: number, newQuestion: QuestionUpdateProps) {
    const hasAccess = await canEditForm(formId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    await db.update(questionTable).set(newQuestion).where(eq(questionTable.id, qId))
    revalidatePath(`/dashboard/${formId}`)
}