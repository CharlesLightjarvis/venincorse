import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { BookOpen } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index as cohorts } from '@/routes/course-cohorts';
import { index, store } from '@/routes/course-manual-management';

type Manual = {
    id: number;
    level: string;
    part: number;
    type: string;
    original_name: string;
    size: number;
};

const levels = ['a1', 'a2', 'b1', 'b2'];
const kinds = [
    { value: 'kursbuch', label: 'Kursbuch' },
    { value: 'arbeitsbuch', label: 'Arbeitsbuch' },
];

export default function CourseManuals({ manuals }: { manuals: Manual[] }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Manuels des parcours" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Manuels des parcours
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Ajoute les PDF une seule fois par niveau. Tous les
                        groupes du niveau partagent ces fichiers.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={cohorts()}>Retour aux groupes</Link>
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">
                La première partie est disponible pour les élèves confirmés. La
                deuxième se rend visible dans les réglages de chaque groupe. PDF
                uniquement, 100 Mo maximum.
            </p>
            {levels.map((level) => (
                <section key={level} className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold">
                        Niveau {level.toUpperCase()}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[1, 2].flatMap((part) =>
                            kinds.map((kind) => (
                                <ManualUpload
                                    key={`${level}-${part}-${kind.value}`}
                                    level={level}
                                    part={part}
                                    kind={kind}
                                    manual={manuals.find(
                                        (manual) =>
                                            manual.level === level &&
                                            manual.part === part &&
                                            manual.type === kind.value,
                                    )}
                                />
                            )),
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}

function ManualUpload({
    level,
    part,
    kind,
    manual,
}: {
    level: string;
    part: number;
    kind: { value: string; label: string };
    manual?: Manual;
}) {
    const form = useForm({
        level,
        part,
        type: kind.value,
        file: null as File | null,
    });
    const inputId = `manual-${level}-${part}-${kind.value}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('file');
                const input = document.getElementById(
                    inputId,
                ) as HTMLInputElement | null;
                if (input) input.value = '';
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4"
        >
            <div className="flex items-center justify-between gap-2">
                <BookOpen aria-hidden="true" />
                <Badge variant={manual ? 'default' : 'secondary'}>
                    {manual ? 'Ajouté' : 'À ajouter'}
                </Badge>
            </div>
            <div>
                <h3 className="font-medium">
                    {kind.label} · {level.toUpperCase()}.{part}
                </h3>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                    {manual?.original_name ?? 'Aucun fichier'}
                </p>
            </div>
            <Label htmlFor={inputId} className="sr-only">
                PDF {kind.label} {level.toUpperCase()}.{part}
            </Label>
            <Input
                id={inputId}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                    form.setData('file', event.target.files?.[0] ?? null)
                }
            />
            {form.errors.file && (
                <p role="alert" className="text-sm text-destructive">
                    {form.errors.file}
                </p>
            )}
            {form.progress && (
                <progress
                    value={form.progress.percentage}
                    max="100"
                    className="w-full"
                />
            )}
            <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={!form.data.file || form.processing}
            >
                {form.processing && <Spinner data-icon="inline-start" />}
                {manual ? 'Remplacer' : 'Ajouter le PDF'}
            </Button>
        </form>
    );
}

CourseManuals.layout = {
    breadcrumbs: [
        { title: 'Groupes des parcours', href: cohorts() },
        { title: 'Manuels', href: index() },
    ],
};
