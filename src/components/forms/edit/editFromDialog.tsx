'use client'

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {useState} from "react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldLabel} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {fullFormType} from "@/db/forms/get-full-form";
import editForm from "@/db/forms/edit-form";

export const editFormSchema = z.object({
    title: z.string().min(3),
    description: z.string(),
    isTest: z.boolean(),
    successMessage: z.string().optional(),
})

export default function EditFromDialog({oldForm} : {oldForm: fullFormType}) {

    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            title: oldForm.title,
            description: oldForm.description,
            isTest: oldForm.isTest,
            successMessage: oldForm.successMessage || '',
        },
    })

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function onSubmit(values: z.infer<typeof editFormSchema>) {
        setIsLoading(true)

        try {
            const result = await editForm(values, oldForm.id)
            setOpen(false)

        } catch (error) {
            toast.error((error as Error).message)
        }

        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className='' variant="outline">Настройки формы</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редактирование формы</DialogTitle>
                    <DialogDescription>
                        Здесь вы можете изменить название и описание вашей формы
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className='flex flex-col gap-4' id='edit-form' onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название формы</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание формы</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Крутая форма" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isTest"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="is-test-checkbox"
                                                name={field.name}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <FieldLabel
                                                htmlFor="is-test-checkbox"
                                                className="font-normal"
                                            >
                                                Формат теста
                                            </FieldLabel>
                                        </Field>
                                        {/*<Checkbox {...field} />*/}
                                        {/*<Input type='checkbox' placeholder="" {...field} />*/}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="successMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Сообщение после отправки</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Спасибо за заполнение формы!" 
                                            {...field} 
                                        />
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
                    <Button disabled={isLoading} form='edit-form' type="submit">
                        { isLoading && <Spinner /> }
                        Сохранить
                    </Button>
                </DialogFooter>

            </DialogContent>

        </Dialog>
    )
}