import {SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import getUserForm from "@/db/forms/get-user-form";
import FormsTable from "@/components/forms/edit/formsTable";
import {Button} from "@/components/ui/button";
import CreateFromDialog from "@/components/forms/edit/createFromDialog";


export default async function HomePage() {

    const forms = await getUserForm()

    return (
        <>
        <SidebarInset >
            <header className="flex h-16  shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-3">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Мои формы</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className='p-5'>
                <div className='flex justify-between mb-3'>
                    <h1 className='text-xl font-bold '>Мои формы</h1>
                    <CreateFromDialog/>
                </div>

                <FormsTable forms={forms}/>
            </div>

        </SidebarInset>

        </>
    )
}