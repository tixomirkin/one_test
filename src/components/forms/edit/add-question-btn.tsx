'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import addQuestion from "@/db/forms/question/add-question";
import {toast} from "sonner";

export default function AddQuestionBtn({formId} : {formId: number}) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className='w-fit' variant='default'><Plus /> Добавить вопрос</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Текстовые вопросы</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => addQuestion(formId, 'text').catch((err) => toast.error(err.message))}>
                        Строка
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion(formId, 'textarea').catch((err) => toast.error(err.message))}>
                        Большой текст
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Выбор из вариантов</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => addQuestion(formId, 'single').catch((err) => toast.error(err.message))}>
                        Один вариант
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion(formId, 'multiple').catch((err) => toast.error(err.message))}>
                        Несколько вариантов
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Выбор дат</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => addQuestion(formId, 'date').catch((err) => toast.error(err.message))}>
                        Выбор даты
                    </DropdownMenuItem>
                </DropdownMenuGroup>

            </DropdownMenuContent>
        </DropdownMenu>

    )
}