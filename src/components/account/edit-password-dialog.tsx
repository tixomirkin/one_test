'use client'

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {editPassword} from "@/db/account/edit-password";
import {toast} from "sonner";
import {useState} from "react";
import {Spinner} from "@/components/ui/spinner";

export const editPasswordFormSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(9, {
        message: "Пароль должен быть более 8 символов"
    }),
    confirmPassword: z.string(),

}).superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Пароли не совпадают",
            path: ['confirmPassword']
        });
    }
});
export default function EditPasswordDialog() {

    const form = useForm<z.infer<typeof editPasswordFormSchema>>({
        resolver: zodResolver(editPasswordFormSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        },
    })

    async function onSubmit(values: z.infer<typeof editPasswordFormSchema>) {
        setIsLoading(true)

        try {
            const result = await editPassword(values)
            if (result) {
                setOpen(false)
            }
        } catch (error) {
            toast.error((error as Error).message)
        }

        setIsLoading(false);
    }

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>

                    <DialogTrigger asChild>
                        <Button className='w-full' variant="outline">Сменить пароль</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Смена пароля</DialogTitle>
                            <DialogDescription>
                                Вы можете задать новый пароль, введите ваш текущий пароль, а затем новый
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form className='flex flex-col gap-4' id='edit-password' onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Старый пароль</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Новый пароль</FormLabel>
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
                                    <FormLabel>Подтвердите пароль</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            </form>
                        </Form>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button  variant="outline">Отмена</Button>
                            </DialogClose>
                            <Button disabled={isLoading} form='edit-password' type="submit">
                                { isLoading && <Spinner /> }
                                Сохранить
                            </Button>
                        </DialogFooter>

                    </DialogContent>

        </Dialog>
    )
}