'use server'

import {SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import getFullForm from "@/db/forms/get-full-form";
import FormsSection from "@/components/forms/edit/form-section";

export default async function EditFormPage({params}: { params: Promise<{ formId: string }> }) {

    const {formId} = await params;
    const form = await getFullForm(formId)
    if (!form) {
        return null
    }

    return (
        <SidebarInset >
            <header className="flex h-16  shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href='/home'>Мои формы</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Форма {formId}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <FormsSection form={form} />

            {/*<main className="flex flex-col p-5  gap-5">*/}
            {/*    <div>*/}
            {/*        <div className='font-bold mb-1'>Имя пользователя:</div>*/}
            {/*        <div className='text-xl'>{user.username}</div>*/}
            {/*    </div>*/}

            {/*    <div className="flex flex-col gap-4 mb-3">*/}
            {/*        <EditUserDialog user={user}/>*/}
            {/*        <EditPasswordDialog/>*/}
            {/*        <Button variant='destructive'>Выйти</Button>*/}
            {/*    </div>*/}

            {/*</main>*/}
        </SidebarInset>
    )
}