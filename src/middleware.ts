import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenJose } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(APP_CONFIG.cookie.name)?.value;
    const pathname = req.nextUrl.pathname;

    // Если пользователь идет на страницы входа/регистрации
    if (pathname === "/signin" || pathname === "/signup") {
        // Если есть токен, проверяем его валидность
        if (token) {
            try {
                await verifyTokenJose(token);
                // Токен валиден, редиректим на dashboard
                return NextResponse.redirect(new URL("/dashboard", req.url));
            } catch (err) {
                // Токен невалиден, разрешаем доступ к странице входа/регистрации
                return NextResponse.next();
            }
            
        }
        // Нет токена, разрешаем доступ к странице входа/регистрации
        return NextResponse.next();
    }

    // Для страниц форм - устанавливаем заголовок, если пользователь авторизован, но не требуем авторизацию
    if (pathname.startsWith("/form/")) {
        const res = NextResponse.next();
        if (token) {
            try {
                const decoded = await verifyTokenJose(token);
                res.headers.set("x-user-id", decoded.id.toString());
            } catch (err) {
                // Токен невалиден, но разрешаем доступ (форма может быть публичной)
            }
        }
        return res;
    }

    // Для защищенных маршрутов (dashboard, api/me)
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
    matcher: ["/api/me", "/dashboard/:path*", "/signin", "/signup", "/form/:path*"]
};