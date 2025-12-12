'use server'

import { getUser } from "@/lib/get-user";

export default async function AccountInfo() {
    const user = await getUser();

    return (
        <div>AccountPage {user.id}</div>
    );
}