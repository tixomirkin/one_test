'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FormResults, FormResultAttempt } from "@/db/forms/get-form-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Форматирование даты без date-fns
function formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

export default function FormResultsTable({ results }: { results: FormResults }) {
    if (results.attempts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Результаты формы: {results.formTitle}</CardTitle>
                    <CardDescription>Пока нет попыток прохождения формы</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Результаты формы: {results.formTitle}</CardTitle>
                    <CardDescription>Всего попыток: {results.attempts.length}</CardDescription>
                </CardHeader>
            </Card>

            <div className="space-y-6">
                {results.attempts.map((attempt, attemptIndex) => (
                    <AttemptCard key={attempt.id} attempt={attempt} attemptNumber={attemptIndex + 1} />
                ))}
            </div>
        </div>
    );
}

function AttemptCard({ attempt, attemptNumber }: { attempt: FormResultAttempt; attemptNumber: number }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Попытка #{attemptNumber}</CardTitle>
                    <div className="flex gap-2 items-center">
                        {attempt.userName && (
                            <Badge variant="secondary">{attempt.userName}</Badge>
                        )}
                        {!attempt.userName && (
                            <Badge variant="outline">Анонимный пользователь</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                            {formatDate(attempt.createdAt)}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Вопрос</TableHead>
                            <TableHead>Ответ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attempt.answers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    Нет ответов
                                </TableCell>
                            </TableRow>
                        ) : (
                            attempt.answers.map((answer) => (
                                <TableRow key={answer.id}>
                                    <TableCell className="font-medium">
                                        {answer.questionText}
                                    </TableCell>
                                    <TableCell>
                                        {answer.optionText ? (
                                            <Badge variant="outline">{answer.optionText}</Badge>
                                        ) : answer.textAnswer ? (
                                            <span>{answer.textAnswer}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Нет ответа</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
