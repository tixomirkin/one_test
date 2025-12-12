'use server'

import { db } from "@/db";
import { testsTable } from "@/db/schema/tests";
import { eq } from "drizzle-orm";

/**
 * Генерирует случайную строку для slug
 */
function generateRandomString(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Генерирует уникальный slug для формы
 */
export async function generateUniqueSlug(): Promise<string> {
    let slug: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        slug = generateRandomString(12);
        
        const existing = await db
            .select()
            .from(testsTable)
            .where(eq(testsTable.slug, slug))
            .limit(1);
        
        if (existing.length === 0) {
            isUnique = true;
            return slug;
        }
        
        attempts++;
    }
    
    // Если не удалось найти уникальный slug за 10 попыток, используем более длинную строку
    return generateRandomString(16);
}
