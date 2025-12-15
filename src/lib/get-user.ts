import { headers } from "next/headers";
import { db } from "@/db";
import { usersTable } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function getUser() {
    
    const hdrs = await headers();
    const idString = hdrs.get("x-user-id");
    
    if (!idString) {
        throw new Error("User ID not found in headers");
    }
    
    const id = Number.parseInt(idString, 10);
    
    if (isNaN(id)) {
        throw new Error("Invalid user ID");
    }

    const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);

    if (users.length === 0) {
        throw new Error("User not found");
    }

    return users[0];
}