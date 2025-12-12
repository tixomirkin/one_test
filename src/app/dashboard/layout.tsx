import HomePage from "@/app/dashboard/page";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";

export default async function HomeLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return <SidebarProvider>
        <AppSidebar />
        {/*<main className='w-full'>*/}
            {/*<SidebarTrigger />*/}
            {children}
        {/*</main>*/}
    </SidebarProvider>
}