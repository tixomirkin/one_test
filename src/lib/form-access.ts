'use server'

import { getUser } from "@/lib/get-user";
import { db } from "@/db";
import { accessTable, testsTable } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

export type FormRole = 'owner' | 'editor' | 'reader' | 'participant';

export interface FormAccess {
    role: FormRole | null;
    isOwner: boolean;
}

/**
 * Получить роль пользователя для формы
 */
export async function getUserFormRole(formId: number): Promise<FormAccess> {
    try {
        const user = await getUser();
        
        // Проверяем, является ли пользователь владельцем
        const form = await db
            .select()
            .from(testsTable)
            .where(and(
                eq(testsTable.id, formId),
                eq(testsTable.ownerId, user.id)
            ))
            .limit(1);
        
        if (form.length > 0) {
            return { role: 'owner', isOwner: true };
        }
        
        // Проверяем доступ в таблице access
        const access = await db
            .select()
            .from(accessTable)
            .where(and(
                eq(accessTable.testId, formId),
                eq(accessTable.userId, user.id)
            ))
            .limit(1);
        
        if (access.length > 0 && access[0].role) {
            return { role: access[0].role as FormRole, isOwner: false };
        }
        
        return { role: null, isOwner: false };
    } catch (error) {
        // Если пользователь не авторизован
        return { role: null, isOwner: false };
    }
}

/**
 * Проверить, может ли пользователь редактировать форму
 */
export async function canEditForm(formId: number): Promise<boolean> {
    const access = await getUserFormRole(formId);
    return access.role === 'owner' || access.role === 'editor';
}

/**
 * Проверить, может ли пользователь просматривать результаты формы
 */
export async function canViewResults(formId: number): Promise<boolean> {
    const access = await getUserFormRole(formId);
    return access.role === 'owner' || access.role === 'editor' || access.role === 'reader';
}

/**
 * Проверить, может ли пользователь проходить форму
 */
export async function canTakeForm(formId: number): Promise<boolean> {
    const access = await getUserFormRole(formId);
    return access.role === 'owner' || access.role === 'editor' || access.role === 'reader' || access.role === 'participant';
}

/**
 * Проверить, может ли пользователь управлять доступом (добавлять редакторов)
 */
export async function canManageAccess(formId: number): Promise<boolean> {
    const access = await getUserFormRole(formId);
    return access.isOwner;
}

/**
 * Проверить, является ли форма публичной
 */
export async function isFormPublic(formId: number): Promise<boolean> {
    const form = await db
        .select({ isPublic: testsTable.isPublic })
        .from(testsTable)
        .where(eq(testsTable.id, formId))
        .limit(1);
    
    return form.length > 0 && form[0].isPublic === true;
}

/**
 * Получить форму по slug и вернуть её ID
 */
async function getFormIdBySlug(slug: string): Promise<number | null> {
    const form = await db
        .select({ id: testsTable.id })
        .from(testsTable)
        .where(eq(testsTable.slug, slug))
        .limit(1);
    
    return form.length > 0 ? form[0].id : null;
}

/**
 * Получить роль пользователя для формы по slug
 */
export async function getUserFormRoleBySlug(slug: string): Promise<FormAccess> {
    const formId = await getFormIdBySlug(slug);
    if (!formId) {
        return { role: null, isOwner: false };
    }
    return await getUserFormRole(formId);
}

/**
 * Проверить, может ли пользователь проходить форму по slug
 */
export async function canTakeFormBySlug(slug: string): Promise<boolean> {
    const access = await getUserFormRoleBySlug(slug);
    return access.role === 'owner' || access.role === 'editor' || access.role === 'reader' || access.role === 'participant';
}

/**
 * Проверить, является ли форма публичной по slug
 */
export async function isFormPublicBySlug(slug: string): Promise<boolean> {
    const form = await db
        .select({ isPublic: testsTable.isPublic })
        .from(testsTable)
        .where(eq(testsTable.slug, slug))
        .limit(1);
    
    return form.length > 0 && form[0].isPublic === true;
}
