'use server'

import {getFullFormBySlug} from "@/db/forms/get-full-form";
import {PublicForm} from "@/components/forms/publc-form";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {FieldDescription} from "@/components/ui/field";
import { notFound } from 'next/navigation';
import {canTakeFormBySlug, isFormPublicBySlug} from "@/lib/form-access";

export default async function FormPage({params}: { params: Promise<{ slug: string }> }) {

    const {slug} = await params;

    const form = await getFullFormBySlug(slug);
    if (!form) {
        notFound();
    }

    // Проверяем доступ: форма должна быть публичной ИЛИ пользователь должен иметь доступ (participant, reader, editor, owner)
    const isPublic = await isFormPublicBySlug(slug);
    const hasAccess = await canTakeFormBySlug(slug);
    
    if (!isPublic && !hasAccess) {
        notFound();
    }

    return (
        <>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{form.title}</CardTitle>
                    <CardDescription>
                        {form.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PublicForm fullForm={form} />
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                Made by <a href="https://github.com/tixomirkin">@tixomirkin</a>
            </FieldDescription>


        </>
    )
}
