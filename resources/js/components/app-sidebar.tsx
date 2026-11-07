import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarCheck,
    CalendarDays,
    Grid,
    Sliders,
    Users,
} from 'reicon-react';
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
import { index as manageCohorts } from '@/routes/course-cohorts';
import { index as myCourses } from '@/routes/course-enrollments';
import { edit as editAvailability } from '@/routes/trial-availability';
import { index as manageTrials } from '@/routes/trial-management';
import { index as myTrial } from '@/routes/trial-reservations';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const mainNavItems: NavItem[] = [
        {
            title: 'Mon espace',
            href: dashboard(),
            icon: Grid,
        },
    ];
    if (auth.can?.viewAllTrials) {
        mainNavItems.push({
            title: 'Gestion des essais',
            href: manageTrials(),
            icon: CalendarDays,
        });
    }
    if (auth.can?.manageCourses) {
        mainNavItems.push({
            title: 'Groupes des parcours',
            href: manageCohorts(),
            icon: Users,
        });
    }
    if (auth.can?.manageAvailability) {
        mainNavItems.push({
            title: 'Disponibilités',
            href: editAvailability(),
            icon: Sliders,
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
                {auth.can?.viewOwnCourses && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(myCourses())}
                                tooltip={{ children: 'Mes parcours' }}
                            >
                                <Link href={myCourses()} prefetch>
                                    <BookOpen />
                                    <span>Mes parcours</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
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
