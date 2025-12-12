'use server'

import {z} from "zod";
import {usersTable} from "@/db/schema/users";
import {getUser} from "@/lib/get-user";
import {revalidatePath} from "next/cache";
import {db} from "@/db";
import bcrypt from "bcrypt";
import {editPasswordFormSchema} from "@/components/account/edit-password-dialog";

export async function editPassword(values: z.infer<typeof editPasswordFormSchema>) {

    const user = await getUser()

    if (await bcrypt.compare(values.oldPassword, user.passwordHash)) {
        await db.update(usersTable).set({passwordHash: await bcrypt.hash(values.newPassword, 10)})
    }

    return true

    revalidatePath('/dashboard/account')
}