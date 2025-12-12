import { headers } from "next/headers";



export async function useUserId() {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    return userId
}