import {Button} from "@/components/ui/button";
import {SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    // Or a custom loading skeleton component
    return (
        <SidebarInset >
        <header className="flex h-16  shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {/*<BreadcrumbItem className="hidden md:block">*/}
                        {/*    <BreadcrumbLink href="#">*/}
                        {/*        Мои формы*/}
                        {/*    </BreadcrumbLink>*/}
                        {/*</BreadcrumbItem>*/}
                        {/*<BreadcrumbSeparator className="hidden md:block" />*/}
                        <BreadcrumbItem>
                            <Skeleton className="h-4 w-[250px]" />
                            {/*<BreadcrumbPage>Аккаунт</BreadcrumbPage>*/}
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>


        <div className="flex flex-col ">
            <h1>Редактирование профиля</h1>
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Button disabled>Выйти</Button>
        </div>
    </SidebarInset>
    )
}