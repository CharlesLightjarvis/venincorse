import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { usePageRestore } from '@/hooks/use-page-restore';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    formatReservationDate,
    formatReservationPrice,
    reservationStatusLabels,
    postTrialRequest,
    TrialRequestError,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { store } from '@/routes/trial-checkout';
import { create, index } from '@/routes/trial-reservations';

export default function TrialReservationPage({
    reservation,
    paymentReady,
    submissionKey,
}: {
    reservation: TrialReservation;
    paymentReady: boolean;
    submissionKey: string;
}) {
    const timezone = useUserTimezone();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    usePageRestore(() => {
        setProcessing(false);
        router.reload({ only: ['reservation'], data: { refresh: 1 } });
    });
    async function checkout() {
        setProcessing(true);
        setError('');
        try {
            const response = await postTrialRequest<{ checkout_url: string }>(
                store.url(reservation.id),
                submissionKey,
                {},
            );
            window.location.assign(response.checkout_url);
        } catch (exception) {
            setError(
                exception instanceof TrialRequestError
                    ? exception.message
                    : 'Connexion interrompue. Réessaie depuis cette réservation, sans en créer une autre.',
            );
            setProcessing(false);
            router.reload({ only: ['reservation', 'submissionKey'] });
        }
    }
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
            <Head title="Mon cours d’essai" />
            <Link href={index()} className="text-sm text-primary">
                Retour à ma réservation d’essai
            </Link>
            <h1 className="text-3xl font-semibold">
                {reservation.status === 'confirmed'
                    ? 'Ton rendez-vous est confirmé.'
                    : 'Ton cours d’essai d’une heure.'}
            </h1>
            <p role="status" className="font-medium text-primary">
                {reservationStatusLabels[reservation.status]}
            </p>
            <dl className="grid gap-5 rounded-3xl border border-border p-6 sm:grid-cols-2">
                {[
                    [
                        'Rendez-vous',
                        formatReservationDate(reservation.starts_at, timezone),
                    ],
                    ['Fuseau horaire', timezone],
                    ['Durée', '60 minutes'],
                    [
                        'Montant',
                        formatReservationPrice(
                            reservation.amount_cents,
                            reservation.currency,
                        ),
                    ],
                    ['Objectif', reservation.goal],
                    ['Référence', reservation.id],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-sm text-muted-foreground">
                            {label}
                        </dt>
                        <dd className="mt-1 font-medium break-words">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
            {reservation.status === 'refunded' ? (
                <Alert>
                    <AlertDescription>
                        Ton paiement est arrivé après l’expiration du délai et
                        ce créneau avait été attribué à un autre élève. Tu as
                        été remboursé intégralement ; le remboursement apparaît
                        sous quelques jours selon ta banque.
                    </AlertDescription>
                </Alert>
            ) : reservation.status === 'expired' ? (
                <Alert>
                    <AlertDescription>
                        Cette tentative n’a pas été payée et le créneau a été
                        libéré. Aucun montant n’a été débité.{' '}
                        <Link
                            href={create()}
                            className="font-medium text-primary underline underline-offset-4"
                        >
                            Choisir un créneau
                        </Link>
                    </AlertDescription>
                </Alert>
            ) : reservation.status === 'payment_review' ? (
                <Alert>
                    <AlertDescription>
                        Ton paiement nécessite une vérification de notre part.
                        Ne règle pas une deuxième fois : nous revenons vers toi
                        rapidement par email.
                    </AlertDescription>
                </Alert>
            ) : reservation.status === 'confirmed' ? (
                <Alert>
                    <AlertDescription>
                        Le paiement a été vérifié côté serveur. Le professeur
                        préparera la séance et te communiquera les modalités de
                        connexion à la visio.
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Le retour depuis Stripe ne vaut pas confirmation. Le
                        statut change après réception et vérification du
                        paiement côté serveur. Tu peux actualiser sans payer une
                        deuxième fois.
                    </p>
                    {reservation.status === 'pending' && (
                        <p className="text-sm text-muted-foreground">
                            Délai de paiement :{' '}
                            {formatReservationDate(
                                reservation.expires_at,
                                timezone,
                            )}
                            . Un abandon du paiement ne confirme pas la
                            réservation.
                        </p>
                    )}
                    {!paymentReady && (
                        <Alert>
                            <AlertDescription>
                                Les clés Stripe de test ne sont pas encore
                                configurées. Aucun paiement ne peut être lancé
                                pour le moment.
                            </AlertDescription>
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="flex flex-wrap gap-3">
                        {reservation.can_checkout && (
                            <Button
                                onClick={checkout}
                                disabled={!paymentReady || processing}
                                className="rounded-full"
                            >
                                {processing
                                    ? 'Ouverture de Stripe…'
                                    : 'Payer avec Stripe (test)'}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() =>
                                router.reload({
                                    only: ['reservation'],
                                    data: { refresh: 1 },
                                })
                            }
                        >
                            Actualiser le statut
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
