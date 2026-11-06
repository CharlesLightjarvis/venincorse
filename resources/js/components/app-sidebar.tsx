import { Link, usePage } from '@inertiajs/react';
import { CalendarCheck, CalendarDays, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { Auth } from '@/types';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { index as manageTrials } from '@/routes/trial-management';
import { index as myTrial } from '@/routes/trial-reservations';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const mainNavItems: NavItem[] = [];
    if (auth.can?.viewOwnTrials) {
        mainNavItems.push({
            title: 'Mon espace',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }
    if (auth.can?.viewAllTrials) {
        mainNavItems.push({
            title: 'Gestion des essais',
            href: manageTrials(),
            icon: CalendarDays,
        });
    }
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                {auth.can?.viewOwnTrials && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(myTrial())}
                                tooltip={{ children: 'Ma réservation d’essai' }}
                            >
                                <Link href={myTrial()} prefetch>
                                    <CalendarCheck />
                                    <span>Ma réservation d’essai</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
