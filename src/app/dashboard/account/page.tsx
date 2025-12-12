import {getUser} from "@/lib/get-user";
import {Button} from "@/components/ui/button";
import {SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import EditUserDialog from "@/components/account/edit-user-dialog";
import EditPasswordDialog from "@/components/account/edit-password-dialog";

export default async function AccountPage() {

    const user = await getUser()

    return (<>

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
                                <BreadcrumbPage>Аккаунт</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>


            <main className="flex flex-col p-5  gap-5">
                <div>
                    <div className='font-bold mb-1'>Имя пользователя:</div>
                    <div className='text-xl'>{user.username}</div>
                </div>

                <div className="flex flex-col gap-4 mb-3">
                    <EditUserDialog user={user}/>
                    <EditPasswordDialog/>
                    <Button variant='destructive'>Выйти</Button>
                </div>

            </main>
        </SidebarInset>



    </>);
}