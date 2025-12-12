'use server'

import {questionTable, questionTypeEnum} from "@/db/schema";
import {db} from "@/db";
import {and, desc, eq, gt, sql} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";

export default async function moveQuestion(formId: number, qId: number, up: boolean = false) {
    const hasAccess = await canEditForm(formId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    const q = (await db.select().from(questionTable).where(eq(questionTable.id, qId)))[0]
    const neighboroPos = q.position + (up ? -1 : 1);
    const neighbor = (await db.select().from(questionTable).where(and(eq(questionTable.position, neighboroPos), eq(questionTable.testId, formId))))[0];
    if (!neighbor) return;
    await db.transaction(async (tx) => {
        // текущему ставим позицию соседа
        await tx.update(questionTable)
            .set({ position: neighboroPos })
            .where(eq(questionTable.id, qId));

        // соседу ставим старую позицию
        await tx.update(questionTable)
            .set({ position: q.position })
            .where(eq(questionTable.id, neighbor.id));
    });

    revalidatePath(`/dashboard/${formId}`)
}