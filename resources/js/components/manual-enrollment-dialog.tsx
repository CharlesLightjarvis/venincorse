import { useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Plus } from 'reicon-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    formatCoursePrice,
    paymentMethodLabels,
    type CoursePaymentMethod,
} from '@/lib/course-cohorts';
import { store } from '@/routes/manual-course-enrollments';

export type ManualEnrollmentCohort = {
    id: number;
    label: string;
    format_label: string;
    rhythm_label: string;
    starts_at: string;
    price_cents: number;
    currency: string;
    seats_left: number;
};

const manualMethods: CoursePaymentMethod[] = [
    'offer',
    'bank_transfer',
    'transfer',
];

/** The team enrolls a student without Stripe: a free seat, a bank transfer or a move from another enrollment. */
export function ManualEnrollmentDialog({
    cohorts,
    defaultCohortId,
    triggerLabel = 'Ajouter un élève',
    triggerSize = 'default',
}: {
    cohorts: ManualEnrollmentCohort[];
    defaultCohortId?: number;
    triggerLabel?: string;
    triggerSize?: 'sm' | 'default';
}) {
    const timezone = useUserTimezone();
    const [open, setOpen] = useState(false);
    const fixedCohort = defaultCohortId !== undefined;
    const form = useForm({
        email: '',
        cohort_id: defaultCohortId ?? cohorts[0]?.id ?? 0,
        payment_method: 'offer' as CoursePaymentMethod,
        payment_reference: '',
        goal: '',
    });
    const selectedCohort = cohorts.find(
        (cohort) => cohort.id === form.data.cohort_id,
    );
    const needsReference = form.data.payment_method !== 'offer';
    const price =
        form.data.payment_method === 'offer'
            ? 0
            : (selectedCohort?.price_cents ?? 0);
    const date = (value: string) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            dateStyle: 'long',
        }).format(new Date(value));

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size={triggerSize} disabled={cohorts.length === 0}>
                    <Plus data-icon="inline-start" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] grid-cols-[minmax(0,1fr)] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter un élève au parcours</DialogTitle>
                    <DialogDescription>
                        Inscris directement un élève déjà présent dans
                        l’application. Sa place est confirmée immédiatement et il
                        reçoit un email. Aucun paiement Stripe n’est déclenché.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="manual-email">Email de l’élève</Label>
                        <Input
                            id="manual-email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="eleve@exemple.fr"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            aria-invalid={form.errors.email ? true : undefined}
                        />
                        <p className="text-xs text-muted-foreground">
                            Le compte doit déjà exister : l’élève peut se créer
                            un compte depuis la page d’inscription.
                        </p>
                        {form.errors.email && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="manual-cohort">Groupe</Label>
                        <Select
                            value={String(form.data.cohort_id)}
                            disabled={fixedCohort || cohorts.length === 0}
                            onValueChange={(value) =>
                                form.setData('cohort_id', Number(value))
                            }
                        >
                            <SelectTrigger id="manual-cohort" className="w-full min-w-0">
                                <SelectValue placeholder="Choisir un groupe" />
                            </SelectTrigger>
                            <SelectContent>
                                {cohorts.map((cohort) => (
                                    <SelectItem
                                        key={cohort.id}
                                        value={String(cohort.id)}
                                    >
                                        {cohort.label} · {cohort.format_label} ·{' '}
                                        {cohort.rhythm_label} — dès le{' '}
                                        {date(cohort.starts_at)} (
                                        {cohort.seats_left} place
                                        {cohort.seats_left > 1 ? 's' : ''}{' '}
                                        libre
                                        {cohort.seats_left > 1 ? 's' : ''})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.cohort_id && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.cohort_id}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="manual-method">
                            Mode d’inscription
                        </Label>
                        <Select
                            value={form.data.payment_method}
                            onValueChange={(value) =>
                                form.setData(
                                    'payment_method',
                                    value as CoursePaymentMethod,
                                )
                            }
                        >
                            <SelectTrigger id="manual-method">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {manualMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {paymentMethodLabels[method]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {form.data.payment_method === 'offer'
                                ? 'Place offerte : aucun montant n’est enregistré.'
                                : form.data.payment_method === 'bank_transfer'
                                  ? 'Le virement a été reçu : l’inscription est marquée comme payée.'
                                  : 'L’élève vient d’une autre inscription déjà réglée : aucun nouveau paiement n’est collecté.'}
                        </p>
                        {form.errors.payment_method && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.payment_method}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="manual-reference">
                            Référence
                            {needsReference ? '' : ' (facultative)'}
                        </Label>
                        <Input
                            id="manual-reference"
                            maxLength={255}
                            required={needsReference}
                            value={form.data.payment_reference}
                            onChange={(event) =>
                                form.setData(
                                    'payment_reference',
                                    event.target.value,
                                )
                            }
                            placeholder={
                                form.data.payment_method === 'bank_transfer'
                                    ? 'Ex. : virement du 12/11, réf. 4521'
                                    : 'Ex. : inscription au groupe A1 de septembre'
                            }
                            aria-invalid={
                                form.errors.payment_reference
                                    ? true
                                    : undefined
                            }
                        />
                        {form.errors.payment_reference && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.payment_reference}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="manual-goal">
                            Objectif de l’élève (facultatif)
                        </Label>
                        <Textarea
                            id="manual-goal"
                            rows={3}
                            maxLength={2000}
                            value={form.data.goal}
                            onChange={(event) =>
                                form.setData('goal', event.target.value)
                            }
                            placeholder="Ex. : préparer un entretien professionnel."
                            aria-invalid={
                                form.errors.goal ? true : undefined
                            }
                        />
                        {form.errors.goal && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.goal}
                            </p>
                        )}
                    </div>

                    {selectedCohort && (
                        <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                            Montant enregistré :{' '}
                            <strong>
                                {formatCoursePrice(
                                    price,
                                    selectedCohort.currency,
                                )}
                            </strong>
                            . La place sera retirée des{' '}
                            {selectedCohort.seats_left} encore libre
                            {selectedCohort.seats_left > 1 ? 's' : ''}.
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Annuler
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={form.processing || !selectedCohort}
                        >
                            {form.processing && (
                                <Spinner data-icon="inline-start" />
                            )}
                            Inscrire l’élève
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
