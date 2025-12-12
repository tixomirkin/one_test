import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import getFormResults from "@/db/forms/get-form-results";
import FormResultsTable from "@/components/forms/results/form-results-table";
import { notFound } from "next/navigation";

export default async function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
    const { formId } = await params;
    const formIdNum = parseInt(formId);

    if (isNaN(formIdNum)) {
        notFound();
    }

    const results = await getFormResults(formIdNum);

    if (!results) {
        notFound();
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard/results">Результаты форм</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{results.formTitle}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="p-5">
                <FormResultsTable results={results} />
            </div>
        </SidebarInset>
    );
}
