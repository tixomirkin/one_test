import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenJose } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(APP_CONFIG.cookie.name)?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    try {
        const decoded = await verifyTokenJose(token);
        const res = NextResponse.next();
        res.headers.set("x-user-id", decoded.id.toString());
        return res;
    } catch (err) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }
}

export const config = {
    matcher: ["/api/me", "/dashboard/:path*"]
};