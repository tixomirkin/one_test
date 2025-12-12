import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import {db} from "@/db";
import {usersTable} from "@/db/schema/users";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (users.length < 1) {
        return NextResponse.json({ error: "Пользователь не найден" }, { status: 400 });
    }
    const user = users[0];

    if (!await bcrypt.compare(password, user.passwordHash)) {
        return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    const cookie = serialize("token", token, {
        httpOnly: false,
        secure: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Set-Cookie": cookie }
    });
}