import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, ClipboardList, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request } from '@/routes/partners';

export default function Partners() {
    return (
        <>
            <Head title="Partenaires pédagogiques" />
            <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:px-12">
                <div>
                    <p className="mb-5 text-sm font-semibold text-primary">
                        Enseignants indépendants & structures pédagogiques
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                        Vos élèves.
                        <br />
                        Votre pédagogie.
                        <br />
                        Un cadre commun.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        Vous enseignez l’allemand et souhaitez utiliser
                        VéninCorsé avec vos propres élèves ? Présentez-nous
                        votre activité pour envisager un partenariat pédagogique
                        adapté à votre façon d’enseigner.
                    </p>
                    <Button asChild size="lg" className="mt-8 rounded-full">
                        <Link href={request()}>
                            Devenir partenaire pédagogique{' '}
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Sans compte · Environ 5 minutes · Sans engagement
                    </p>
                </div>
                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-7 md:p-10">
                    <p className="text-sm text-muted-foreground">
                        Le principe du partenariat
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">
                        Vous restez le professeur de vos élèves.
                    </h2>
                    <p className="mt-5 leading-relaxed text-muted-foreground">
                        Il ne s’agit pas de postuler à un emploi. Vous proposez
                        d’utiliser la plateforme dans votre activité, avec vos
                        apprenants, votre approche et vos objectifs.
                    </p>
                    <div className="mt-8 flex flex-col gap-6 border-t border-primary/15 pt-7">
                        {[
                            {
                                icon: Users,
                                title: 'Votre public',
                                description:
                                    'Cours individuels, petits groupes ou structure : décrivez votre organisation.',
                            },
                            {
                                icon: BookOpen,
                                title: 'Votre projet',
                                description:
                                    'Parcours, ressources, ateliers ou préparation aux examens : précisez vos besoins.',
                            },
                            {
                                icon: ClipboardList,
                                title: 'Un échange avant de commencer',
                                description:
                                    'Les modalités et les accès sont à définir ensemble, après étude de votre demande.',
                            },
                        ].map(({ icon: ItemIcon, title, description }) => {
                            return (
                                <div key={title} className="flex gap-4">
                                    <ItemIcon
                                        className="mt-1 size-5 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <h3 className="font-semibold">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            <section className="border-y border-border/50 bg-muted/20">
                <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 lg:px-12">
                    <h2 className="text-3xl font-semibold">
                        Faisons connaissance avant de travailler ensemble.
                    </h2>
                    <ol className="mt-10 grid gap-8 md:grid-cols-3">
                        {[
                            [
                                'Présentez votre activité',
                                'Votre expérience, vos élèves et ce que vous souhaitez mettre en place.',
                            ],
                            [
                                'Nous étudions votre projet',
                                'L’objectif : comprendre vos besoins et vérifier ce que la plateforme peut vous apporter.',
                            ],
                            [
                                'Définissons les modalités',
                                'Un échange permet de préciser le fonctionnement, les conditions et la suite du partenariat.',
                            ],
                        ].map(([title, text], index) => (
                            <li
                                key={title}
                                className="border-t border-border pt-5"
                            >
                                <span className="text-sm font-semibold text-primary">
                                    Étape {index + 1}
                                </span>
                                <h3 className="mt-3 text-xl font-semibold">
                                    {title}
                                </h3>
                                <p className="mt-2 leading-relaxed text-muted-foreground">
                                    {text}
                                </p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-10 text-sm text-muted-foreground">
                        Version de démonstration : les demandes sont simulées et
                        conservées dans ce navigateur. Aucun e-mail n’est envoyé
                        et aucun accès enseignant n’est créé.
                    </p>
                </div>
            </section>
        </>
    );
}
