import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/lib/config';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(APP_CONFIG.cookie.name);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}