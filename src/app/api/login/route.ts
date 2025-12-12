import { NextResponse } from 'next/server';
import { db } from "@/db";
import { usersTable } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { createToken, createTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email и пароль обязательны" },
                { status: 400 }
            );
        }

        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (users.length === 0) {
            return NextResponse.json(
                { error: "Пользователь не найден" },
                { status: 404 }
            );
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Неверный пароль" },
                { status: 401 }
            );
        }

        const token = createToken({ id: user.id, email: user.email });
        const cookie = createTokenCookie(token);

        return new NextResponse(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Set-Cookie": cookie }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}