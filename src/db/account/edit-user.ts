'use server'

import {z} from "zod";
import {usersTable} from "@/db/schema/users";
import {getUser} from "@/lib/get-user";
import {revalidatePath} from "next/cache";
import {db} from "@/db";
import {editUserFormSchema} from "@/components/account/edit-user-dialog";

export async function editUser(values: z.infer<typeof editUserFormSchema>) {
    const user = await getUser()

    if (values.username.length > 3 && values.username != user.username) {
        await db.update(usersTable).set({username: values.username})
    }


    revalidatePath('/dashboard/account')
    return true
}