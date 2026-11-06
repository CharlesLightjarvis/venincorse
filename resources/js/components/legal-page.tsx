import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { legalUpdatedAt } from '@/data/legal';
import { cn } from '@/lib/utils';
import { notice, privacy, sales, terms } from '@/routes/legal';

const pages = [
    { title: 'Mentions légales', href: notice() },
    { title: 'CGU', href: terms() },
    { title: 'CGV', href: sales() },
    { title: 'Confidentialité', href: privacy() },
];

export type LegalSection = { id: string; title: string; content: ReactNode };

/** Shared layout of the legal pages: title, quick links between pages, table of contents and sections. */
export function LegalPage({
    title,
    intro,
    sections,
    current,
}: {
    title: string;
    intro: ReactNode;
    sections: LegalSection[];
    current: string;
}) {
    return (
        <div className="relative py-16 md:py-24">
            <Head title={title} />
            <div className="relative mx-auto max-w-4xl px-6 md:px-8">
                <nav
                    aria-label="Pages légales"
                    className="mb-8 flex flex-wrap gap-2"
                >
                    {pages.map((page) => (
                        <Link
                            key={page.title}
                            href={page.href}
                            aria-current={
                                page.title === current ? 'page' : undefined
                            }
                            className={cn(
                                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                                page.title === current
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/60 bg-background text-foreground/70 hover:border-primary/40',
                            )}
                        >
                            {page.title}
                        </Link>
                    ))}
                </nav>
                <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                    {title}
                </h1>
                <p className="text-sm text-foreground/60">
                    Dernière mise à jour : {legalUpdatedAt}
                </p>
                <div className="mt-6 text-lg leading-relaxed text-foreground/70">
                    {intro}
                </div>

                <nav
                    aria-label="Sommaire"
                    className="mt-10 rounded-2xl border border-border/40 bg-muted/30 p-6 dark:bg-foreground/[0.02]"
                >
                    <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-foreground/60 uppercase">
                        Sommaire
                    </p>
                    <ol className="grid gap-2 text-sm sm:grid-cols-2">
                        {sections.map((section, index) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="text-foreground/70 hover:text-primary"
                                >
                                    {index + 1}. {section.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="mt-12 flex flex-col gap-10">
                    {sections.map((section, index) => (
                        <section
                            key={section.id}
                            id={section.id}
                            className="scroll-mt-24"
                        >
                            <h2 className="mb-4 text-xl font-semibold text-foreground md:text-2xl">
                                {index + 1}. {section.title}
                            </h2>
                            <div className="flex flex-col gap-3 leading-relaxed text-foreground/75 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
