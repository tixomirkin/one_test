'use server'

import { db } from "@/db";
import { accessTable, usersTable, testsTable } from "@/db/schema";
import { eq, and, or, like } from "drizzle-orm";
import { canManageAccess } from "@/lib/form-access";
import { revalidatePath } from "next/cache";
import { FormRole } from "@/lib/form-access";

/**
 * Добавить доступ пользователю к форме
 */
export async function addFormAccess(formId: number, userId: number, role: 'editor' | 'reader' | 'participant') {
    // Проверяем права на управление доступом
    const hasAccess = await canManageAccess(formId);
    if (!hasAccess) {
        throw new Error('Нет прав для управления доступом');
    }

    // Проверяем, не является ли пользователь владельцем
    const form = await db.query.testsTable.findFirst({
        where: eq(testsTable.id, formId),
    });
    
    if (form?.ownerId === userId) {
        throw new Error('Владелец формы уже имеет полный доступ');
    }

    // Проверяем, нет ли уже доступа
    const existingAccess = await db
        .select()
        .from(accessTable)
        .where(and(
            eq(accessTable.testId, formId),
            eq(accessTable.userId, userId)
        ))
        .limit(1);

    if (existingAccess.length > 0) {
        // Обновляем существующий доступ
        await db
            .update(accessTable)
            .set({ role })
            .where(and(
                eq(accessTable.testId, formId),
                eq(accessTable.userId, userId)
            ));
    } else {
        // Создаем новый доступ
        await db.insert(accessTable).values({
            testId: formId,
            userId: userId,
            role: role,
        });
    }

    revalidatePath(`/dashboard/${formId}`);
    return true;
}

/**
 * Удалить доступ пользователя к форме
 */
export async function removeFormAccess(formId: number, userId: number) {
    // Проверяем права на управление доступом
    const hasAccess = await canManageAccess(formId);
    if (!hasAccess) {
        throw new Error('Нет прав для управления доступом');
    }

    await db
        .delete(accessTable)
        .where(and(
            eq(accessTable.testId, formId),
            eq(accessTable.userId, userId)
        ));

    revalidatePath(`/dashboard/${formId}`);
    return true;
}

/**
 * Изменить роль пользователя в форме
 */
export async function updateFormAccess(formId: number, userId: number, role: 'editor' | 'reader' | 'participant') {
    // Проверяем права на управление доступом
    const hasAccess = await canManageAccess(formId);
    if (!hasAccess) {
        throw new Error('Нет прав для управления доступом');
    }

    await db
        .update(accessTable)
        .set({ role })
        .where(and(
            eq(accessTable.testId, formId),
            eq(accessTable.userId, userId)
        ));

    revalidatePath(`/dashboard/${formId}`);
    return true;
}

/**
 * Поиск пользователей по email или username
 */
export async function searchUsers(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
        return [];
    }

    const users = await db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            email: usersTable.email,
        })
        .from(usersTable)
        .where(or(
            like(usersTable.email, `%${query}%`),
            like(usersTable.username, `%${query}%`)
        ))
        .limit(limit);

    return users;
}

/**
 * Получить список пользователей с доступом к форме
 */
export async function getFormAccessUsers(formId: number) {
    const accessList = await db
        .select({
            id: accessTable.id,
            userId: accessTable.userId,
            role: accessTable.role,
            createdAt: accessTable.createdAt,
            user: {
                id: usersTable.id,
                username: usersTable.username,
                email: usersTable.email,
            }
        })
        .from(accessTable)
        .innerJoin(usersTable, eq(usersTable.id, accessTable.userId))
        .where(eq(accessTable.testId, formId));

    return accessList.map(item => ({
        id: item.id,
        userId: item.userId,
        role: item.role as FormRole | null,
        createdAt: item.createdAt,
        user: item.user,
    }));
}

/**
 * Обновить публичность формы
 */
export async function updateFormPublicity(formId: number, isPublic: boolean) {
    // Проверяем права на управление доступом
    const hasAccess = await canManageAccess(formId);
    if (!hasAccess) {
        throw new Error('Нет прав для управления доступом');
    }

    await db
        .update(testsTable)
        .set({ isPublic })
        .where(eq(testsTable.id, formId));

    revalidatePath(`/dashboard/${formId}`);
    return true;
}

/**
 * Получить текущую публичность формы
 */
export async function getFormPublicity(formId: number): Promise<boolean> {
    const form = await db
        .select({ isPublic: testsTable.isPublic })
        .from(testsTable)
        .where(eq(testsTable.id, formId))
        .limit(1);

    return form.length > 0 ? form[0].isPublic : false;
}
