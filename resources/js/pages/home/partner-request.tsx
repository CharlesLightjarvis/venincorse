import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check } from 'reicon-react';
import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectClassName } from '@/components/trial-slot-picker';
import {
    emptyPartnerProfile,
    isPartnerStepComplete,
    submitPartnerRequest,
    type PartnerProfile,
    type PartnerRequest,
} from '@/data/partner-requests';
import { partners } from '@/routes';
import { teacher } from '@/routes/booking';

const steps = ['Votre profil', 'Vos élèves', 'Votre projet', 'Récapitulatif'];
const needs = [
    'Parcours A1–B2',
    'Ressources pédagogiques',
    'Ateliers',
    'Préparation aux examens',
    'Organisation et suivi des élèves',
];
const fieldClassName = 'flex flex-col gap-2';

export default function PartnerRequestPage() {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<PartnerProfile>({
        ...emptyPartnerProfile,
    });
    const [submitted, setSubmitted] = useState<PartnerRequest | null>(null);
    const [error, setError] = useState('');
    const heading = useRef<HTMLHeadingElement>(null);

    function update<K extends keyof PartnerProfile>(
        key: K,
        value: PartnerProfile[K],
    ) {
        setProfile((current) => ({ ...current, [key]: value }));
        setError('');
    }

    function toggle(key: 'levels' | 'needs', value: string) {
        update(
            key,
            profile[key].includes(value)
                ? profile[key].filter((item) => item !== value)
                : [...profile[key], value],
        );
    }

    function moveTo(next: number) {
        setStep(next);
        setError('');
        heading.current?.focus();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isPartnerStepComplete(profile, step)) {
            setError(
                step === 2
                    ? 'Choisissez au moins un besoin et décrivez votre projet en 20 caractères minimum.'
                    : 'Complétez les champs demandés avant de continuer.',
            );
            return;
        }
        if (step < 3) {
            moveTo(step + 1);
            return;
        }
        try {
            setSubmitted(submitPartnerRequest(profile));
        } catch {
            setError(
                'La demande n’a pas pu être enregistrée. Vérifiez vos réponses et réessayez.',
            );
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-20">
            <Head title="Demande de partenariat pédagogique" />
            <Link
                href={partners()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
                <ArrowLeft className="size-4" aria-hidden="true" /> Le
                partenariat pédagogique
            </Link>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight md:text-5xl">
                Faisons connaissance.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                Parlez-nous de votre enseignement et de vos élèves. Pas de
                compte à créer, pas d’engagement : simplement un premier échange
                à préparer.
            </p>
            <p className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Démonstration publique : utilisez des coordonnées fictives. Les
                demandes restent dans ce navigateur, sans envoi d’e-mail.
            </p>
            {submitted ? (
                <section
                    role="status"
                    className="mt-10 rounded-3xl border border-primary/20 bg-primary/5 p-7 md:p-10"
                >
                    <Check className="size-9 text-primary" aria-hidden="true" />
                    <h2 className="mt-5 text-2xl font-semibold">
                        Votre demande de démonstration est enregistrée.
                    </h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                        Merci {submitted.name}. Aucun e-mail n’a été envoyé.
                        Votre demande est maintenant visible dans l’onglet
                        Partenariats de la vue professeur, uniquement dans ce
                        navigateur. Aucun compte ni accès à la plateforme n’a
                        été créé.
                    </p>
                    <p className="mt-4 text-sm break-all text-muted-foreground">
                        Référence : {submitted.id}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Button
                            asChild
                            className="h-auto max-w-full rounded-full py-3 text-center whitespace-normal"
                        >
                            <Link href={teacher()}>
                                Voir la demande côté professeur (démo)
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href={partners()}>Retour au partenariat</Link>
                        </Button>
                    </div>
                </section>
            ) : (
                <div className="mt-10 grid gap-8 md:grid-cols-[200px_1fr]">
                    <ol
                        aria-label="Étapes de la demande"
                        className="grid grid-cols-2 gap-4 md:flex md:flex-col md:gap-6"
                    >
                        {steps.map((label, index) => (
                            <li
                                key={label}
                                aria-current={
                                    step === index ? 'step' : undefined
                                }
                                className={`flex items-center gap-3 text-sm ${step === index ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                            >
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${index <= step ? 'border-primary/30 bg-primary/10' : 'border-border'}`}
                                >
                                    {index < step ? (
                                        <Check
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                {label}
                            </li>
                        ))}
                    </ol>
                    <form
                        onSubmit={submit}
                        className="min-w-0 rounded-3xl border border-border/60 bg-background p-6 md:p-8"
                    >
                        <h2
                            ref={heading}
                            tabIndex={-1}
                            className="mb-6 text-2xl font-semibold outline-none"
                        >
                            {steps[step]}
                        </h2>
                        <div className="flex flex-col gap-5">
                            {step === 0 && (
                                <>
                                    <div className={fieldClassName}>
                                        <Label htmlFor="partner-name">
                                            Nom et prénom
                                        </Label>
                                        <Input
                                            id="partner-name"
                                            autoComplete="name"
                                            required
                                            maxLength={120}
                                            value={profile.name}
                                            onChange={(event) =>
                                                update(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className={fieldClassName}>
                                        <Label htmlFor="partner-email">
                                            Adresse e-mail professionnelle
                                        </Label>
                                        <Input
                                            id="partner-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            maxLength={254}
                                            value={profile.email}
                                            onChange={(event) =>
                                                update(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className={fieldClassName}>
                                        <Label htmlFor="partner-country">
                                            Pays d’exercice
                                        </Label>
                                        <Input
                                            id="partner-country"
                                            autoComplete="country-name"
                                            required
                                            maxLength={100}
                                            value={profile.country}
                                            onChange={(event) =>
                                                update(
                                                    'country',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Choice
                                        label="Vous exercez en tant que…"
                                        id="partner-role"
                                        value={profile.role}
                                        options={[
                                            'Enseignant indépendant',
                                            'Enseignant en établissement',
                                            'Responsable d’une structure pédagogique',
                                            'Autre profil pédagogique',
                                        ]}
                                        onChange={(value) =>
                                            update('role', value)
                                        }
                                    />
                                    <Choice
                                        label="Votre expérience dans l’enseignement de l’allemand"
                                        id="partner-experience"
                                        value={profile.experience}
                                        options={[
                                            'Moins d’un an',
                                            '1 à 3 ans',
                                            '4 à 7 ans',
                                            'Plus de 7 ans',
                                        ]}
                                        onChange={(value) =>
                                            update('experience', value)
                                        }
                                    />
                                </>
                            )}
                            {step === 1 && (
                                <>
                                    <Choice
                                        label="Combien d’élèves accompagnez-vous actuellement ?"
                                        id="partner-students"
                                        value={profile.students}
                                        options={[
                                            'Je démarre mon activité',
                                            '1 à 5 élèves',
                                            '6 à 15 élèves',
                                            '16 à 30 élèves',
                                            'Plus de 30 élèves',
                                        ]}
                                        onChange={(value) =>
                                            update('students', value)
                                        }
                                    />
                                    <fieldset>
                                        <legend className="mb-3 text-sm font-medium">
                                            Quels niveaux enseignez-vous ?
                                            (plusieurs choix)
                                        </legend>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                'A1',
                                                'A2',
                                                'B1',
                                                'B2',
                                                'C1–C2',
                                                'À définir',
                                            ].map((level) => (
                                                <label
                                                    key={level}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.levels.includes(
                                                            level,
                                                        )}
                                                        onChange={() =>
                                                            toggle(
                                                                'levels',
                                                                level,
                                                            )
                                                        }
                                                        className="size-4 accent-primary"
                                                    />
                                                    {level}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <Choice
                                        label="Votre format d’enseignement"
                                        id="partner-format"
                                        value={profile.format}
                                        options={[
                                            'Cours individuels',
                                            'Cours en groupe',
                                            'Individuel et groupe',
                                        ]}
                                        onChange={(value) =>
                                            update('format', value)
                                        }
                                    />
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <fieldset>
                                        <legend className="mb-3 text-sm font-medium">
                                            Que souhaitez-vous utiliser ?
                                            (plusieurs choix)
                                        </legend>
                                        <div className="flex flex-col gap-3">
                                            {needs.map((need) => (
                                                <label
                                                    key={need}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.needs.includes(
                                                            need,
                                                        )}
                                                        onChange={() =>
                                                            toggle(
                                                                'needs',
                                                                need,
                                                            )
                                                        }
                                                        className="size-4 accent-primary"
                                                    />
                                                    {need}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <div className={fieldClassName}>
                                        <Label htmlFor="partner-project">
                                            Comment imaginez-vous utiliser la
                                            plateforme avec vos élèves ?
                                        </Label>
                                        <textarea
                                            id="partner-project"
                                            required
                                            minLength={20}
                                            maxLength={2000}
                                            rows={5}
                                            value={profile.project}
                                            onChange={(event) =>
                                                update(
                                                    'project',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            20 caractères minimum. Ne
                                            communiquez aucune donnée
                                            personnelle de vos élèves.
                                        </p>
                                    </div>
                                    <Choice
                                        label="Quand aimeriez-vous démarrer ?"
                                        id="partner-timeline"
                                        value={profile.timeline}
                                        options={[
                                            'Dès que possible',
                                            'Dans 1 à 3 mois',
                                            'Dans 3 à 6 mois',
                                            'Je me renseigne pour le moment',
                                        ]}
                                        onChange={(value) =>
                                            update('timeline', value)
                                        }
                                    />
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Relisez vos réponses avant de simuler
                                        l’envoi. Vous pourrez revenir aux étapes
                                        précédentes pour les modifier.
                                    </p>
                                    <dl className="divide-y divide-border">
                                        {[
                                            ['Nom', profile.name],
                                            ['E-mail', profile.email],
                                            ['Pays', profile.country],
                                            ['Activité', profile.role],
                                            ['Expérience', profile.experience],
                                            ['Élèves', profile.students],
                                            [
                                                'Niveaux',
                                                profile.levels.join(', '),
                                            ],
                                            ['Format', profile.format],
                                            [
                                                'Besoins',
                                                profile.needs.join(', '),
                                            ],
                                            ['Votre projet', profile.project],
                                            ['Démarrage', profile.timeline],
                                        ].map(([label, value]) => (
                                            <div key={label} className="py-3">
                                                <dt className="text-xs text-muted-foreground">
                                                    {label}
                                                </dt>
                                                <dd className="mt-1 text-sm break-words whitespace-pre-wrap">
                                                    {value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                    <label className="flex items-start gap-3 text-sm leading-relaxed">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={profile.consent}
                                            onChange={(event) =>
                                                update(
                                                    'consent',
                                                    event.target.checked,
                                                )
                                            }
                                            className="mt-1 size-4 shrink-0 accent-primary"
                                        />
                                        Je comprends que cette demande est une
                                        simulation locale, visible dans la vue
                                        professeur de démonstration de ce
                                        navigateur.
                                    </label>
                                </>
                            )}
                        </div>
                        {error && (
                            <p
                                role="alert"
                                className="mt-5 text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                            {step > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => moveTo(step - 1)}
                                >
                                    Précédent
                                </Button>
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    Étape 1 sur 4
                                </span>
                            )}
                            <Button type="submit" className="rounded-full">
                                {step === 3
                                    ? 'Simuler l’envoi de la demande'
                                    : 'Continuer'}
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function Choice({
    label,
    id,
    value,
    options,
    onChange,
}: {
    label: string;
    id: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div className={fieldClassName}>
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                required
                className={`${selectClassName} w-full`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">Sélectionnez une réponse</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
