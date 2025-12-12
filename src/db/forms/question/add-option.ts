'use server'

import {optionsTable} from "@/db/schema";
import {db} from "@/db";
import {desc, eq} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";
import {questionTable} from "@/db/schema/questions";

export default async function addOption(questionId: number, optionText: string) {
    const question = await db.select().from(questionTable).where(eq(questionTable.id, questionId)).limit(1);
    
    if (question.length === 0) {
        throw new Error('Вопрос не найден');
    }

    const hasAccess = await canEditForm(question[0].testId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    const lastOption = await db.select().from(optionsTable).where(eq(optionsTable.questionId, questionId)).orderBy(desc(optionsTable.position)).limit(1);
    const position = lastOption[0]?.position || 0;
    
    const newOption: typeof optionsTable.$inferInsert = {
        questionId: questionId,
        optionText: optionText,
        position: position + 1,
    }

    await db.insert(optionsTable).values(newOption);
    revalidatePath(`/dashboard/${question[0].testId}`);
}
