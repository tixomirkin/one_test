'use server'

import {z} from "zod";
import {testsTable} from "@/db/schema/tests";
import {db} from "@/db";
import {revalidatePath} from "next/cache";
import {editFormSchema} from "@/components/forms/edit/editFromDialog";
import {eq} from "drizzle-orm";
import {canEditForm} from "@/lib/form-access";

export default async function editForm(values: z.infer<typeof editFormSchema>, formId: number) {
    // Проверяем доступ на редактирование
    const hasAccess = await canEditForm(formId);
    
    if (!hasAccess) {
        return false;
    }

    await db.update(testsTable).set({
        title: values.title,
        description: values.description,
        isTest: values.isTest,
        successMessage: values.successMessage || null,
    }).where(eq(testsTable.id, formId))

    revalidatePath(`/dashboard/${formId}`)
    return true;
}