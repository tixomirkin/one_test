'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FormsWithResultsAccessType } from "@/db/forms/get-forms-with-results-access";
import { useRouter } from 'next/navigation';
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
    owner: 'Владелец',
    editor: 'Редактор',
    reader: 'Читатель',
};

export default function FormsResultsList({ forms }: { forms: FormsWithResultsAccessType }) {
    const router = useRouter();

    if (forms.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Нет форм с доступом для просмотра результатов
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="font-bold">Название</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Публичная</TableHead>
                    <TableHead>Вопросов</TableHead>
                    <TableHead>Попыток</TableHead>
                    <TableHead className="text-right">Дата создания</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {forms.map((form) => (
                    <TableRow
                        className="cursor-pointer"
                        key={form.id}
                        onClick={() => router.push(`/dashboard/results/${form.id}`)}
                    >
                        <TableCell className="font-medium">{form.id}</TableCell>
                        <TableCell className="font-bold">{form.title}</TableCell>
                        <TableCell>
                            {form.role && (
                                <Badge variant={form.role === 'owner' ? 'default' : 'secondary'}>
                                    {roleLabels[form.role]}
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell>{form.isPublic && <Check />}</TableCell>
                        <TableCell>{form.questionCount ?? 0}</TableCell>
                        <TableCell>{form.attemptsCount ?? 0}</TableCell>
                        <TableCell className="text-right">
                            {form.createdAt.toLocaleDateString('ru-RU')}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
