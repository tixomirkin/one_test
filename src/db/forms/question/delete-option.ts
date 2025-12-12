'use server'

import {optionsTable} from "@/db/schema";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {revalidatePath} from "next/cache";
import {canEditForm} from "@/lib/form-access";
import {questionTable} from "@/db/schema/questions";

export default async function deleteOption(optionId: number) {
    const option = await db.select().from(optionsTable).where(eq(optionsTable.id, optionId)).limit(1);
    
    if (option.length === 0) {
        throw new Error('Опция не найдена');
    }

    const question = await db.select().from(questionTable).where(eq(questionTable.id, option[0].questionId)).limit(1);
    
    if (question.length === 0) {
        throw new Error('Вопрос не найден');
    }

    const hasAccess = await canEditForm(question[0].testId);
    if (!hasAccess) {
        throw new Error('Нет доступа для редактирования формы');
    }

    await db.delete(optionsTable).where(eq(optionsTable.id, optionId));
    revalidatePath(`/dashboard/${question[0].testId}`);
}
