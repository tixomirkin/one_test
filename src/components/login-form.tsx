"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const formSchema = z.object({
    email: z.email({
        message: "Невалидный email"
    }),
    password: z.string().min(9, {
        message: "Пароль должен быть более 8 символов"
    }),
})

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const router = useRouter()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                toast.success("Вход выполнен успешно");
                router.push('/dashboard');
                return;
            }

            const body = await res.json();
            toast.error(body.error || "Ошибка входа");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
            toast.error(errorMessage);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">С возвращением!</CardTitle>
                    <CardDescription>
                        Войдите в ваш аккаунт через email и пароль
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type='email' placeholder="example@mail.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Пароль</FormLabel>
                                        <FormControl>
                                            <Input type='password' placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Field>
                                <Button  type="submit">Войти</Button>
                                <FieldDescription className="text-center">
                                    Нет аккаунта? <Link href="/signup">Регистрация</Link>
                                </FieldDescription>
                            </Field>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                Made by <a href="https://github.com/tixomirkin">@tixomirkin</a>
            </FieldDescription>
        </div>
    )
}
