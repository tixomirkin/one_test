import { NextResponse } from "next/server";
import { extractTokenFromCookie, verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        const token = extractTokenFromCookie(cookieHeader);

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = verifyToken(token);
        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        );
    }
}