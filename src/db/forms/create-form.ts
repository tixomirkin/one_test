'use server'

import {z} from "zod";
import {createFormSchema} from "@/components/forms/edit/createFromDialog";
import {testsTable} from "@/db/schema/tests";
import {db} from "@/db";
import {getUser} from "@/lib/get-user";
import {revalidatePath} from "next/cache";
import {generateUniqueSlug} from "@/lib/generate-slug";

export default async function createForm(values: z.infer<typeof createFormSchema>) {
    const user = await getUser()
    const slug = await generateUniqueSlug()

    const newForm = await db.insert(testsTable).values({
        ownerId: user.id,
        title: values.title,
        description: values.description,
        isTest: values.isTest,
        slug: slug,
    }).$returningId()

    revalidatePath('/dashboard')
    return newForm[0].id
}