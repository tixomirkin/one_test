import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import getFormsWithResultsAccess from "@/db/forms/get-forms-with-results-access";
import FormsResultsList from "@/components/forms/results/forms-results-list";

export default async function ResultPage() {
    const forms = await getFormsWithResultsAccess();

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Результаты форм</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="p-5">
                <div className="flex justify-between mb-3">
                    <h1 className="text-xl font-bold">Результаты форм</h1>
                </div>

                <FormsResultsList forms={forms} />
            </div>
        </SidebarInset>
    );
}