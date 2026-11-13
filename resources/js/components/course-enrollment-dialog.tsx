import { router, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Refresh } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    attendanceStatusLabels,
    formatCoursePrice,
    paymentMethodLabels,
    summarizeAttendance,
    type CourseEnrollment,
    type CourseInstallment,
} from '@/lib/course-cohorts';
import { store as storeCancellation } from '@/routes/course-enrollment-cancellations';
import { update as updateEnrollment } from '@/routes/course-enrollment-management';
import { retry as retryInstallment } from '@/routes/course-installments';

/** One enrollment's file: payments, attendance, private notes and cancellation. */
export function CourseEnrollmentDetails({
    enrollment,
    onClose,
}: {
    enrollment: CourseEnrollment;
    onClose: () => void;
}) {
    const timezone = useUserTimezone();
    const [retryingId, setRetryingId] = useState<number | null>(null);
    const [retryError, setRetryError] = useState<string | null>(null);
    const management = enrollment.management;
    const retryable = (enrollment.installments ?? []).filter(
        (installment) =>
            installment.status === 'failed' || installment.can_retry,
    );
    const notes = useForm({ notes: enrollment.notes ?? '' });
    const cancel = useForm({
        refund_euros: management?.withdrawal_open
            ? (management.prorata_refund_cents / 100).toFixed(2)
            : '0.00',
        reason: '',
    });
    const euros = (cents: number) =>
        formatCoursePrice(cents, enrollment.currency);
    const formatSession = (value: string) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            dateStyle: 'long',
            timeStyle: 'short',
        }).format(new Date(value));
    const attendanceRecords = (enrollment.attendances ?? [])
        .filter(
            (record) => record.session && record.session.cancelled_at === null,
        )
        .sort(
            (left, right) =>
                new Date(right.session?.starts_at ?? 0).getTime() -
                new Date(left.session?.starts_at ?? 0).getTime(),
        );
    const attendance = summarizeAttendance(attendanceRecords);

    if (!management) {
        return null;
    }

    function retryInstallmentNow(installment: CourseInstallment) {
        setRetryError(null);
        router.post(
            retryInstallment.url(installment.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setRetryingId(installment.id),
                onFinish: () => setRetryingId(null),
                onError: (errors) =>
                    setRetryError(
                        errors.installment ??
                            'Le prélèvement n’a pas pu être relancé.',
                    ),
            },
        );
    }

    function saveNotes(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        notes.patch(updateEnrollment.url(enrollment.id), {
            preserveScroll: true,
            onSuccess: () => notes.setDefaults(),
        });
    }

    function submitCancellation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        cancel.transform((data) => ({
            refund_cents: Math.round(
                Number(data.refund_euros.replace(',', '.')) * 100,
            ),
            reason: data.reason,
        }));
        cancel.post(storeCancellation.url(enrollment.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold">
                    {enrollment.student?.name}
                </h2>
            </div>
            <Tabs defaultValue="management" className="min-w-0 gap-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="management">Gestion</TabsTrigger>
                    <TabsTrigger value="attendance">Assiduité</TabsTrigger>
                </TabsList>
                <TabsContent value="attendance">
                    <section className="flex flex-col gap-3 border-t border-border pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-medium">Assiduité</h3>
                            {attendance.total > 0 && (
                                <Badge
                                    variant={
                                        attendance.rate >= 80
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {attendance.rate} % de présence
                                </Badge>
                            )}
                        </div>
                        {attendance.total === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aucun appel enregistré pour cet élève. Les
                                présences apparaîtront ici après le premier
                                appel.
                            </p>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {attendance.present} présent
                                    {attendance.present > 1 ? 's' : ''} ·{' '}
                                    {attendance.absent} absent
                                    {attendance.absent > 1 ? 's' : ''} ·{' '}
                                    {attendance.excused} absence
                                    {attendance.excused > 1 ? 's' : ''}{' '}
                                    justifiée
                                    {attendance.excused > 1 ? 's' : ''} sur{' '}
                                    {attendance.total} séance
                                    {attendance.total > 1 ? 's' : ''} appelée
                                    {attendance.total > 1 ? 's' : ''}.
                                </p>
                                <ul className="flex flex-col gap-2">
                                    {attendanceRecords.map((record) => (
                                        <li
                                            key={record.session_id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                                        >
                                            <span>
                                                Séance{' '}
                                                {record.session?.position ??
                                                    '—'}{' '}
                                                ·{' '}
                                                {record.session
                                                    ? formatSession(
                                                          record.session
                                                              .starts_at,
                                                      )
                                                    : 'Date inconnue'}
                                            </span>
                                            <Badge
                                                variant={
                                                    record.status === 'present'
                                                        ? 'default'
                                                        : record.status ===
                                                            'excused'
                                                          ? 'secondary'
                                                          : 'outline'
                                                }
                                            >
                                                {
                                                    attendanceStatusLabels[
                                                        record.status
                                                    ]
                                                }
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>
                </TabsContent>
                <TabsContent value="management" className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Payé : {euros(management.paid_cents)}
                        {enrollment.refunded_cents > 0 &&
                            ` · remboursé : ${euros(enrollment.refunded_cents)}`}{' '}
                        · {management.hours_done} h suivies sur 60 ·{' '}
                        {management.withdrawal_open
                            ? 'délai de rétractation en cours'
                            : 'délai de rétractation terminé'}
                    </p>
                    <section className="flex flex-col gap-2 border-t border-border pt-4">
                        <h3 className="font-medium">Paiement</h3>
                        <p className="text-sm text-muted-foreground">
                            {paymentMethodLabels[enrollment.payment_method]}
                            {enrollment.payment_reference
                                ? ` · référence : ${enrollment.payment_reference}`
                                : ''}
                        </p>
                    </section>

                    {retryable.length > 0 && (
                        <section className="flex flex-col gap-2 border-t border-border pt-4">
                            <h3 className="font-medium">
                                Échéances à encaisser
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {retryable.map((installment) => (
                                    <li
                                        key={installment.id}
                                        className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                Échéance {installment.position}{' '}
                                                ·{' '}
                                                {euros(
                                                    installment.amount_cents,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {installment.status === 'failed'
                                                    ? (installment.failure_message ??
                                                      'Le prélèvement automatique a échoué.')
                                                    : `À prélever depuis le ${new Intl.DateTimeFormat(
                                                          'fr-FR',
                                                          {
                                                              timeZone:
                                                                  timezone,
                                                              dateStyle: 'long',
                                                          },
                                                      ).format(
                                                          new Date(
                                                              installment.due_at,
                                                          ),
                                                      )}`}
                                            </p>
                                        </div>
                                        {installment.can_retry && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={retryingId !== null}
                                                onClick={() =>
                                                    retryInstallmentNow(
                                                        installment,
                                                    )
                                                }
                                            >
                                                {retryingId ===
                                                installment.id ? (
                                                    <Spinner data-icon="inline-start" />
                                                ) : (
                                                    <Refresh data-icon="inline-start" />
                                                )}
                                                Réessayer maintenant
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {retryError && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {retryError}
                                </p>
                            )}
                        </section>
                    )}

                    <form onSubmit={saveNotes} className="flex flex-col gap-2">
                        <Label htmlFor={`notes-${enrollment.id}`}>
                            Notes privées
                        </Label>
                        <Textarea
                            id={`notes-${enrollment.id}`}
                            rows={4}
                            maxLength={5000}
                            value={notes.data.notes}
                            onChange={(event) =>
                                notes.setData('notes', event.target.value)
                            }
                            placeholder="Niveau, progrès, points à travailler… Visible uniquement par l’équipe."
                        />
                        {notes.errors.notes && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {notes.errors.notes}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="self-end"
                            disabled={notes.processing || !notes.isDirty}
                        >
                            Enregistrer les notes
                        </Button>
                    </form>

                    {management.can_cancel ? (
                        <form
                            onSubmit={submitCancellation}
                            className="flex flex-col gap-3 border-t border-border pt-4"
                        >
                            <h3 className="font-medium">
                                Annuler l’inscription
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Rétractation dans les 14 jours : rembourse la
                                part non suivie (au prorata). Groupe annulé par
                                l’école : remboursement intégral. Après le délai
                                : aucun remboursement n’est dû. Les échéances
                                restantes sont annulées.
                            </p>
                            {enrollment.payment_method !== 'stripe' && (
                                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                                    Cette inscription ne passe pas par Stripe :
                                    le montant remboursé est enregistré ici,
                                    puis versé par l’école.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        cancel.setData(
                                            'refund_euros',
                                            (
                                                management.refundable_cents /
                                                100
                                            ).toFixed(2),
                                        )
                                    }
                                >
                                    Intégral (
                                    {euros(management.refundable_cents)})
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        cancel.setData(
                                            'refund_euros',
                                            (
                                                management.prorata_refund_cents /
                                                100
                                            ).toFixed(2),
                                        )
                                    }
                                >
                                    Au prorata (
                                    {euros(management.prorata_refund_cents)})
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        cancel.setData('refund_euros', '0.00')
                                    }
                                >
                                    Sans remboursement
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`refund-${enrollment.id}`}>
                                    Montant remboursé (€)
                                </Label>
                                <Input
                                    id={`refund-${enrollment.id}`}
                                    inputMode="decimal"
                                    className="w-36"
                                    value={cancel.data.refund_euros}
                                    onChange={(event) =>
                                        cancel.setData(
                                            'refund_euros',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`reason-${enrollment.id}`}>
                                    Motif communiqué à l’élève
                                </Label>
                                <Textarea
                                    id={`reason-${enrollment.id}`}
                                    required
                                    minLength={5}
                                    maxLength={500}
                                    rows={3}
                                    value={cancel.data.reason}
                                    onChange={(event) =>
                                        cancel.setData(
                                            'reason',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Ex. : rétractation demandée par email le 12 novembre."
                                />
                            </div>
                            {(cancel.errors as Record<string, string>)
                                .refund_cents && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {
                                        (
                                            cancel.errors as Record<
                                                string,
                                                string
                                            >
                                        ).refund_cents
                                    }
                                </p>
                            )}
                            {cancel.errors.reason && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {cancel.errors.reason}
                                </p>
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    Garder l’inscription
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={cancel.processing}
                                >
                                    {cancel.processing && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Annuler l’inscription
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        enrollment.cancellation_reason && (
                            <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                                Annulée : {enrollment.cancellation_reason}
                            </p>
                        )
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function CourseEnrollmentDialog({
    enrollment,
}: {
    enrollment: CourseEnrollment;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-1">
                    Gérer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogTitle className="sr-only">
                    Gérer l’inscription
                </DialogTitle>
                <CourseEnrollmentDetails
                    enrollment={enrollment}
                    onClose={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
