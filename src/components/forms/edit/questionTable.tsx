'use client'

import {fullFormType} from "@/db/forms/get-full-form";

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


export default function FormsTable({form} : {form: fullFormType}) {
    const router = useRouter()

    return (
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">Позиция</TableHead>
                    <TableHead className="font-bold">Тескст вопроса</TableHead>
                    <TableHead>Тип вопроса</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {form.question.map((q) => (

                    <TableRow className='cursor-pointer' key={q.id} onClick={() => router.push(`home/${q.id}`)}>
                        <TableCell className="font-medium">{q.position}</TableCell>
                        <TableCell className="font-bold">{q.questionText}</TableCell>
                        <TableCell>{q.questionType}</TableCell>
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