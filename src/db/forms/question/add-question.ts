'use server'

import {questionTable, questionTypeEnum} from "@/db/schema";
import {db} from "@/db";
import {desc, eq} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";

export default async function addQuestion(formId: number, questionType: 'single'| 'multiple'| 'text' | "textarea" | "date") {
    const hasAccess = await canEditForm(formId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    const lastQ = await db.select().from(questionTable).where(eq(questionTable.testId, formId)).orderBy(desc(questionTable.position)).limit(1)
    const position = lastQ[0]?.position || 0
    const newQuestion : typeof questionTable.$inferInsert = {
        testId: formId,
        questionText: "",
        position: position + 1,
        questionType: questionType,
    }

    await db.insert(questionTable).values(newQuestion)
    revalidatePath(`/dashboard/${formId}`)
}