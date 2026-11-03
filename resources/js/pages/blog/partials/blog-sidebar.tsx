import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { sidebarSections, trendingArticles } from '../blog-data';
import { cn } from '@/lib/utils';

interface BlogSidebarProps {
    search: string;
    onSearch: (v: string) => void;
    activeCategory: string;
    onCategory: (cat: string) => void;
}

export function BlogSidebar({
    search,
    onSearch,
    activeCategory,
    onCategory,
}: BlogSidebarProps) {
    const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());

    const toggleGroup = (i: number) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-1">
            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-foreground/30" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Rechercher un article…"
                    className="w-full rounded-lg border border-border/40 bg-background/60 py-2 pr-3 pl-9 text-sm text-foreground backdrop-blur-sm outline-none placeholder:text-foreground/30 focus:border-border/70"
                />
            </div>

            {/* Nav sections */}
            {sidebarSections.map((section, i) => {
                if (section.type === 'item') {
                    return (
                        <button
                            key={i}
                            onClick={() =>
                                onCategory(
                                    activeCategory === section.value
                                        ? ''
                                        : section.value,
                                )
                            }
                            className={cn(
                                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                activeCategory === section.value
                                    ? 'bg-foreground/8 font-medium text-foreground'
                                    : 'text-foreground/55 hover:bg-foreground/5 hover:text-foreground/80',
                            )}
                        >
                            {section.label}
                        </button>
                    );
                }

                const isOpen = openGroups.has(i);

                return (
                    <div key={i}>
                        {/* Group header */}
                        <button
                            onClick={() => toggleGroup(i)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                        >
                            <span>{section.label}</span>
                            <ChevronDown
                                className={cn(
                                    'h-3.5 w-3.5 text-foreground/35 transition-transform duration-200',
                                    isOpen && 'rotate-180',
                                )}
                            />
                        </button>

                        {/* Group children */}
                        <div
                            className={cn(
                                'overflow-hidden transition-all duration-200',
                                isOpen
                                    ? 'max-h-96 opacity-100'
                                    : 'max-h-0 opacity-0',
                            )}
                        >
                            <div className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l border-border/25 pl-3">
                                {section.items.map((item, j) => (
                                    <button
                                        key={j}
                                        onClick={() =>
                                            onCategory(
                                                activeCategory === item.value
                                                    ? ''
                                                    : item.value,
                                            )
                                        }
                                        className={cn(
                                            'w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                                            activeCategory === item.value
                                                ? 'font-medium text-foreground'
                                                : 'text-foreground/50 hover:text-foreground/80',
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Divider */}
            <div className="my-4 border-t border-border/25" />

            {/* Trending */}
            <p className="mb-3 px-1 text-[10px] font-semibold tracking-[0.2em] text-foreground/30 uppercase">
                Tendances
            </p>
            <div className="flex flex-col">
                {trendingArticles.map((article, i) => (
                    <div
                        key={article.id}
                        className="flex gap-3 border-b border-border/20 py-3 last:border-none"
                    >
                        <span className="mt-0.5 text-lg leading-none font-semibold text-foreground/10">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-foreground/30 uppercase">
                                {article.categorie}
                            </p>
                            <p className="cursor-pointer text-xs leading-relaxed text-foreground/55 transition-colors hover:text-foreground/80">
                                {article.titre}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
