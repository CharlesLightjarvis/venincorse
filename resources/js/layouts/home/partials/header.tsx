import React from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { useScroll } from './use-scroll';
import { Link, usePage } from '@inertiajs/react';
import type { Auth } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import { MenuToggleIcon } from './menu-toggle-icon';
import Logo from './logo';
import { about, partners, dashboard, login, register } from '@/routes';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';

const simpleLinks = [
    { label: 'Parcours', href: '/courses' },
    { label: 'Examens', href: '/exams' },
    { label: 'Ateliers', href: '/workshops' },
    { label: 'Manuels', href: '/manuels' },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'À propos', href: about.url() },
    { label: 'Enseignants', href: partners.url() },
];

const mobileLinks = [
    ...simpleLinks,
    { label: "Cours d'essai", href: '/trial' },
    { label: 'Test de niveau', href: '/level-test' },
    { label: 'Contact', href: '/contact' },
];

function isActivePath(currentUrl: string, href: string): boolean {
    return href === '/' ? currentUrl === '/' : currentUrl.startsWith(href);
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);
    const page = usePage<{
        auth: Auth;
        canRegister?: boolean;
    }>();
    const { auth, canRegister } = page.props;
    const currentUrl = page.url.split('?')[0];

    React.useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-transparent',
                {
                    'border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50':
                        scrolled,
                },
            )}
        >
            <nav className="relative flex h-14 w-full items-center gap-3 px-4 lg:px-6">
                {/* logo — gauche écran */}
                <div className="flex items-center justify-start">
                    <div className="rounded-md p-2 hover:bg-transparent">
                        <Link href="/">
                            <Logo className="h-7 w-auto sm:h-8 2xl:h-12" />
                        </Link>
                    </div>
                </div>

                {/* liens — centre exact */}
                <div className="mx-auto hidden xl:block">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {simpleLinks.map((link) => (
                                <NavigationMenuItem key={link.label}>
                                    <NavigationMenuLink
                                        href={link.href}
                                        aria-current={
                                            isActivePath(currentUrl, link.href)
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(
                                            'inline-flex h-10 items-center justify-center gap-1.5 px-2 text-sm font-medium transition-colors focus:outline-none 2xl:px-3',
                                            isActivePath(currentUrl, link.href)
                                                ? 'text-foreground'
                                                : 'text-foreground/60 hover:text-foreground',
                                        )}
                                    >
                                        {link.label}
                                        {isActivePath(currentUrl, link.href) ? (
                                            <span
                                                className="h-1 w-1 rounded-full bg-primary"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* CTA — droite écran */}
                <div className="ml-auto hidden shrink-0 items-center justify-end gap-2 xl:flex">
                    {auth.user ? (
                        <Button
                            variant="secondary"
                            className="shrink-0 rounded-full"
                            asChild
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                className="shrink-0 rounded-full"
                                asChild
                            >
                                <Link href={login()}>Connexion</Link>
                            </Button>
                            {canRegister !== false && (
                                <Button
                                    className="shrink-0 rounded-full"
                                    asChild
                                >
                                    <Link href={register()}>S'inscrire</Link>
                                </Button>
                            )}
                        </>
                    )}
                    <ThemeToggle />
                </div>

                {/* burger mobile */}
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setOpen(!open)}
                    className="ml-auto xl:hidden"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label="Toggle menu"
                >
                    <MenuToggleIcon
                        open={open}
                        className="size-5"
                        duration={300}
                    />
                </Button>
            </nav>

            <MobileMenu
                open={open}
                auth={auth}
                canRegister={canRegister}
                currentUrl={currentUrl}
                onClose={() => setOpen(false)}
            />
        </header>
    );
}

/* ------------------------------------------------------------------ */
/* Menu mobile                                                        */
/* ------------------------------------------------------------------ */

function MobileMenu({
    open,
    auth,
    canRegister,
    currentUrl,
    onClose,
}: {
    open: boolean;
    auth: Auth;
    canRegister?: boolean;
    currentUrl: string;
    onClose: () => void;
}) {
    if (!open || typeof window === 'undefined') return null;

    return createPortal(
        <div
            id="mobile-menu"
            className="fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-border/30 bg-background xl:hidden"
        >
            <div
                data-slot={open ? 'open' : 'closed'}
                className="flex size-full flex-col justify-between overflow-y-auto p-4 ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-97"
            >
                <div className="flex flex-col gap-1">
                    {mobileLinks.map((link) => {
                        const active = isActivePath(currentUrl, link.href);

                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={onClose}
                                aria-current={active ? 'page' : undefined}
                                className={buttonVariants({
                                    variant: 'ghost',
                                    className: cn(
                                        'justify-start',
                                        active && 'bg-primary/10 text-primary',
                                    ),
                                })}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 border-t border-border/30 pt-4">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-foreground/40">
                            Apparence
                        </span>
                        <ThemeToggle />
                    </div>
                    {auth.user ? (
                        <Button variant="secondary" className="w-full" asChild>
                            <Link href={dashboard()} onClick={onClose}>
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                className="w-full"
                                asChild
                            >
                                <Link href={login()} onClick={onClose}>
                                    Connexion
                                </Link>
                            </Button>
                            {canRegister !== false && (
                                <Button className="w-full" asChild>
                                    <Link href={register()} onClick={onClose}>
                                        S'inscrire
                                    </Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
