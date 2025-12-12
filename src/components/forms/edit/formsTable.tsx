'use client'

import {UsersFormsType} from "@/db/forms/get-user-form";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from 'next/navigation'
import {Check} from "lucide-react";


export default function FormsTable({forms} : {forms: UsersFormsType}) {
    const router = useRouter()

    return (
        <Table>
            {/*<TableCaption>A list of your recent invoices.</TableCaption>*/}
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="font-bold">Название</TableHead>
                    <TableHead>Публиынй</TableHead>
                    <TableHead>Вопросов</TableHead>
                    <TableHead>Ответов</TableHead>
                    <TableHead className="text-right">Дата создания</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {forms.map((form) => (

                    <TableRow className='cursor-pointer' key={form.id} onClick={() => router.push(`dashboard/${form.id}`)}>
                        <TableCell className="font-medium">{form.id}</TableCell>
                        <TableCell className="font-bold">{form.title}</TableCell>
                        <TableCell>{form.isPublic && <Check />}</TableCell>
                        <TableCell>{form.questionCount}</TableCell>
                        <TableCell>{form.attemptsCount}</TableCell>
                        <TableCell className="text-right">{form.createdAt.toDateString()}</TableCell>
                    </TableRow>

                ))}
            </TableBody>
            {/*<TableFooter>*/}
            {/*    <TableRow>*/}
            {/*        <TableCell colSpan={3}>Total</TableCell>*/}
            {/*        <TableCell className="text-right">$2,500.00</TableCell>*/}
            {/*    </TableRow>*/}
            {/*</TableFooter>*/}
        </Table>
    )
}