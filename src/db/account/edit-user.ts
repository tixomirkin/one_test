'use server'

import {z} from "zod";
import {editAccountFormSchema} from "@/components/account/edit-from";
import {usersTable} from "@/db/schema/users";
import {getUser} from "@/lib/get-user";
import {revalidatePath} from "next/cache";
import {db} from "@/db";
import bcrypt from "bcrypt";

export async function editAccount(values: z.infer<typeof editAccountFormSchema>) {

    const user = await getUser()

    if (await bcrypt.compare(values.oldPassword, user.passwordHash)) {
        await db.update(usersTable).set({passwordHash: await bcrypt.hash(values.password, 10)})
    }

    if (values.username.length > 3 && values.username != user.username) {
        await db.update(usersTable).set({username: values.username})
    }

    // console.log(values.username, user.username)

    revalidatePath('/home/account')
}