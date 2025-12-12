'use server'

import {questionTable, questionTypeEnum} from "@/db/schema";
import {db} from "@/db";
import {and, desc, eq, gt, sql} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";

export default async function deleteQuestion(formId: number, qId: number) {
    const hasAccess = await canEditForm(formId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    const q = await db.select().from(questionTable).where(eq(questionTable.id, qId))
    await db.delete(questionTable).where(eq(questionTable.id, qId))
    await db.update(questionTable)
        .set({
            position: sql`${questionTable.position} - 1`
        })
        .where(
            and(
                eq(questionTable.testId, formId),
                gt(questionTable.position, q[0].position)
            )
        );

    revalidatePath(`/dashboard/${formId}`)
}