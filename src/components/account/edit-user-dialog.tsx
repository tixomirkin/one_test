'use client'

import {usersTable} from "@/db/schema/users";
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
import {editUser} from "@/db/account/edit-user";
import {useState} from "react";
import {toast} from "sonner";
import {Spinner} from "@/components/ui/spinner";

export const editUserFormSchema = z.object({
    username: z.string().min(6, {
        message: "Имя пользователя должно быть более 5 символов",
    }),

})

export default function EditUserDialog({user} : {user: typeof usersTable.$inferSelect}) {

    const form = useForm<z.infer<typeof editUserFormSchema>>({
        resolver: zodResolver(editUserFormSchema),
        defaultValues: {
            username: user.username,
        },
    })

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function onSubmit(values: z.infer<typeof editUserFormSchema>) {
        setIsLoading(true)

        try {
            const result = await editUser(values)
            if (result) {
                setOpen(false)
            }
        } catch (error) {
            toast.error((error as Error).message)
        }

        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='w-full' variant="outline">Редактировать профиль</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Редактирование профиля</DialogTitle>
                        <DialogDescription>
                            Измените информацию и настройки вашего профиля
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                    <form id='edit-user' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Имя пользователя</FormLabel>
                                <FormControl>
                                    <Input placeholder="username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </form>
                    </Form>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button disabled={isLoading} form='edit-user' type="submit">
                            { isLoading && <Spinner /> }
                            Сохранить
                        </Button>
                    </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}