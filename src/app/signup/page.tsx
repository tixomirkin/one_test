import { GalleryVerticalEnd } from "lucide-react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyTokenJose } from "@/lib/auth"
import { APP_CONFIG } from "@/lib/config"
import { SignupForm } from "@/components/signup-form"

export default async function SignupPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get(APP_CONFIG.cookie.name)?.value

    if (token) {
        try {
            await verifyTokenJose(token)
            redirect("/dashboard")
        } catch (err) {
            // Token invalid, continue to signup page
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    OneTest
                </a>
                <SignupForm />
            </div>
        </div>
    )
}
