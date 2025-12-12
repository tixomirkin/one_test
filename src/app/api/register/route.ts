import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { usersTable } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { createToken, createTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password, username } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json(
                { error: "Заполни все поля" },
                { status: 400 }
            );
        }

        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: "Такой email уже зарегистрирован" },
                { status: 409 }
            );
        }

        const hash = await bcrypt.hash(password, 10);

        const [newUser] = await db
            .insert(usersTable)
            .values({
                username: username,
                email: email,
                passwordHash: hash,
            })
            .$returningId();

        const token = createToken({ id: newUser.id, email: email });
        const cookie = createTokenCookie(token);

        return new NextResponse(
            JSON.stringify({ success: true }),
            {
                status: 201,
                headers: { "Set-Cookie": cookie }
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}