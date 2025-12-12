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
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import { toast } from "sonner"
import { useRouter } from 'next/navigation'


const formSchema = z.object({
    username: z.string().min(2, {
        message: "Имя пользователя должно быть более 5 символов",
    }),
    email: z.email({
        message: "Невалидный email"
    }),
    password: z.string().min(9, {
        message: "Пароль должен быть более 8 символов"
    }),
    confirmPassword: z.string(),

}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Пароли не совпадают",
            path: ['confirmPassword']
        });
    }
});

export function SignupForm({
                               className,
                               ...props
                           }: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    })


    const router = useRouter()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                toast.success("Аккаунт создан успешно");
                router.push('/dashboard');
                return;
            }

            const body = await res.json();
            toast.error(body.error || "Ошибка регистрации");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
            toast.error(errorMessage);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Создание аккаунта</CardTitle>
                    <CardDescription>
                        Введите ваш email чтобы создать аккаунт
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Полное имя</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Вадим Андреевич" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Подтверждение пароля</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="" {...field} />
                                    </FormControl>
                                    <FormDescription>Пароль должен быть более 8 символов</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Field>
                            <Button type="submit">Создать аккаунт</Button>
                            <FieldDescription className="text-center">
                                Уже есть аккаунт? <Link href="/signin">Вход</Link>
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
