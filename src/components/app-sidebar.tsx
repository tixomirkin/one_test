"use client"

import {Calendar, FileUserIcon, Home, Inbox, NotepadText, Search, Settings, User} from "lucide-react"

import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {ModeToggle} from "@/components/theme-toggle";

// Menu items.
const items = [
    {
        title: "Мои формы",
        url: "/dashboard",
        icon: NotepadText,
    },
    {
        title: "Результаты форм",
        url: "/dashboard/results",
        icon: FileUserIcon,
    },
    {
        title: "Аккаунт",
        url: "/dashboard/account",
        icon: User,
    }
]

export function AppSidebar() {

    const pathname = usePathname()

    return (
        <Sidebar collapsible='icon'>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton isActive={item.url == pathname} asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter>
                <ModeToggle/>
            </SidebarFooter>
        </Sidebar>
    )
}