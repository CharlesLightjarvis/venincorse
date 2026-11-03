import React from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { useScroll } from "./use-scroll";
import { Link, usePage } from "@inertiajs/react";
import type { Auth } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { MenuToggleIcon } from "./menu-toggle-icon";
import Logo from "./logo";
import { dashboard, login, register } from "@/routes";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";

const simpleLinks = [
    { label: "Nos Formations", href: "/courses" },
    { label: "Blog", href: "/blog" },
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
];

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);
    const { auth, canRegister } = usePage<{
        auth: Auth;
        canRegister?: boolean;
    }>().props;

    React.useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b border-transparent",
                {
                    "border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50":
                        scrolled,
                },
            )}
        >
            <nav className="relative flex h-14 w-full items-center px-4 lg:px-6">
                {/* logo — gauche écran */}
                <div className="flex items-center justify-start">
                    <div className="rounded-md p-2 hover:bg-transparent">
                        <Link href="/">
                            <Logo className="h-7 w-auto sm:h-8 lg:h-12" />
                        </Link>
                    </div>
                </div>

                {/* liens — centre exact */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {simpleLinks.map((link) => (
                                <NavigationMenuItem key={link.label}>
                                    <NavigationMenuLink
                                        href={link.href}
                                        className="inline-flex h-10 items-center justify-center px-4 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground focus:outline-none"
                                    >
                                        {link.label}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* CTA — droite écran */}
                <div className="ml-auto hidden items-center justify-end gap-2 lg:flex">
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
                    className="ml-auto lg:hidden"
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

            <MobileMenu open={open} auth={auth} canRegister={canRegister} />
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
}: {
    open: boolean;
    auth: Auth;
    canRegister?: boolean;
}) {
    if (!open || typeof window === "undefined") return null;

    return createPortal(
        <div
            id="mobile-menu"
            className="fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-border/30 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50 lg:hidden"
        >
            <div
                data-slot={open ? "open" : "closed"}
                className="flex size-full flex-col justify-between overflow-y-auto p-4 ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-97"
            >
                <div className="flex flex-col gap-1">
                    {simpleLinks.map((link) => (
                        <a
                            key={link.label}
                            className={buttonVariants({
                                variant: "ghost",
                                className: "justify-start",
                            })}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
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
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                className="w-full"
                                asChild
                            >
                                <Link href={login()}>Connexion</Link>
                            </Button>
                            {canRegister !== false && (
                                <Button className="w-full" asChild>
                                    <Link href={register()}>S'inscrire</Link>
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
