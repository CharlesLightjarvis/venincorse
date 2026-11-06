import { Link } from '@inertiajs/react';
import { ArrowLeft, Flask } from 'reicon-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Logo from '@/layouts/home/partials/logo';
import { home } from '@/routes';
import { trial } from '@/routes/demo';
import { teacher } from '@/routes/booking';

export function BookingShell({
    children,
    teacherView = false,
}: {
    children: ReactNode;
    teacherView?: boolean;
}) {
    return (
        <div className="min-h-svh bg-muted/20">
            <header className="border-b border-border/50 bg-background">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
                    <Link href={home()} aria-label="Accueil">
                        <Logo className="h-8 w-auto" />
                    </Link>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                    >
                        <Link href={teacherView ? trial() : home()}>
                            <ArrowLeft />
                            {teacherView ? 'Vue visiteur' : 'Retour au site'}
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
                <Alert>
                    <Flask />
                    <AlertDescription>
                        <p>
                            Mode démo : données fictives, aucun débit ni email
                            envoyé. Utilise des coordonnées fictives.
                        </p>
                        <Link
                            className="font-medium text-primary underline underline-offset-4"
                            href={teacherView ? trial() : teacher()}
                        >
                            {teacherView
                                ? 'Tester une réservation'
                                : 'Ouvrir la gestion professeur (démo)'}
                        </Link>
                    </AlertDescription>
                </Alert>
                {children}
            </main>
        </div>
    );
}
