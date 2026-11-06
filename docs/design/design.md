# Design System — VéninCorsé

Comment construire une page ou une section dans ce projet. Toutes les règles
ci-dessous sont dérivées des pages existantes (home, `/courses`, fiche cours,
`/about`, `/contact`) — les respecter pour rester cohérent.

> Typographie : voir [typography.md](./typography.md) (Fredoka titres · Geist
> corps · Geist Mono).

## 1. Fondations intouchables

- **Aucune couleur en dur** : uniquement les tokens sémantiques shadcn
  (`bg-primary/10`, `text-foreground/60`, `bg-card`, `border-border/40`…)
  et les `chart-*` pour les accents catégoriels.
- **Mode sombre** : toute classe claire a son équivalent `dark:` (souvent
  `dark:bg-foreground/[0.02]` sur les fonds grisés, `dark:border-border/50`).
- **API copy en français, code en anglais** : identifiants de composants,
  props, routes, noms de fichiers en anglais ; textes visibles en français.
- Icônes **Reicon** (`reicon-react`, poids `Outline` par défaut) — voir
  [§ Icônes](#icônes). Marques sociales : `@icons-pack/react-simple-icons`.

## 2. Palette de marque

| Token                 | Valeur                      | Usage                                    |
| --------------------- | --------------------------- | ---------------------------------------- |
| `--primary`           | `oklch(0.5848 0.1357 157.63)` | vert du logo — CTA principaux, icônes actives |
| `--secondary`         | neutre doux (= muted)       | chips/badges, bouton « Connexion »       |
| accents catégoriels   | `chart-1…chart-5`           | catégories & niveaux (voir mapping)      |

**Mapping catégories / niveaux** (source de vérité :
`resources/js/data/courses.ts` — `categoryMeta`, `levelClasses`) :

| Catégorie       | Token    |
| --------------- | -------- |
| Cours standard  | primary  |
| Grammaire       | chart-4  |
| Conversation    | chart-2  |
| Examens         | chart-1  |
| Affaires        | chart-3  |
| Soutien         | chart-5  |

Niveaux CECRL : `A1 → chart-2`, `A2 → chart-4`, `B1 → chart-1`,
`B2 → chart-3`. Badge = `bg-chart-X/10 text-chart-X rounded-full`.

## 3. Squelette d'une page

1. Fichier dans **`resources/js/pages/home/<page>.tsx`** (préfixe `home/` =
   `HomeLayout` header/footer automatique via `resources/js/app.tsx`).
   Export par défaut de la page (`export default function About() {}`).
2. Route : `Route::inertia('chemin', 'home/page')->name('nom');` dans
   `routes/web.php`.
3. `<Head title="…" />` pour le titre.
4. Squelette :

```tsx
<div className="relative py-20 md:py-28">
    {/* blobs décoratifs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
    </div>

    <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        {/* contenu */}
    </div>
</div>
```

## 4. En-tête de section / page

```tsx
<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
    Badge
</div>
<h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">…</h1>
<p className="text-lg text-foreground/60">…</p>
```

Centré pour les pages à liste (catalogue, contact), aligné à gauche pour les
pages « profil » (about, fiche cours).

## 5. Cartes & chips

**Carte standard** :

```tsx
<div className="rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/30 dark:border-border/50">
```

- Icône : `flex h-10|h-11 w-10|w-11 items-center justify-center rounded-xl(+2xl) bg-primary/10 text-primary`
- Grilles responsives : `gap-5` dans les grilles 2/3/4 colonnes
  (`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).

**Chips/badges** :

- Catégorie : `inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold {text-token}`
- Niveau : `rounded-full px-2.5|3 py-1|1.5 text-[11px|xs] font-semibold {bg-chart-X/10 text-chart-X}`
- État : disponibilité session (`primary/10` dispo, `chart-4/10` dernières places, `destructive/10` complet).

## 6. Boutons

- Toujours `rounded-full` (design de marque).
- Taille hero/CTA : `size="lg"` + parfois `uppercase tracking-[0.2em]` ; cartes : `size="sm"` pleine largeur.
- Secondaire = **neutre** (jamais une 2ᵉ couleur) — cf. image 2 (style Nuxt UI).
- Icône suite flèche : `group` + `<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />`.

## 7. Animations (framer-motion)

- Au-dessus de la ligne de flottaison : `initial={{ opacity: 0, y: 24 }} animate` + `duration: 0.7`.
- Sections plus bas : `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`.
- Grilles : conteneur `containerVariants` (stagger ~0.06–0.09) + `cardVariants`.
- Respecter `useReducedMotion()` quand le mouvement est permanent (footer).
- Carrousel marquee (avis élèves) : `x: ["0%", "-50%"]` en boucle linéaire.

## 8. Patterns réutilisables

- **Bandeau CTA final** : `rounded-3xl border border-border/40 bg-muted/30 p-8 md:p-10|12` + h2 + texte + 2 boutons (primary + outline) — `dark:bg-foreground/[0.02]`.
- **Carte fiche sticky** (catalogue → détail) : `lg:sticky lg:top-24 rounded-3xl border bg-card` avec tuile dégradée en haut.
- **Bannière d'annonce** : `rounded-2xl border border-primary/15 bg-primary/[0.05]` + chip icône + bouton à droite (`dark:bg-primary/[0.07]`).
- **État vide** : composant shadcn **`Empty`** (`@/components/ui/empty`) — contenu centré : icône Reicon dans `EmptyMedia variant="icon"`, `EmptyTitle`, `EmptyDescription` courte, et si utile une action dans `EmptyContent`. Ajouter `className="border"` dans l’espace connecté. Jamais un simple paragraphe en pointillés.

```tsx
<Empty className="border">
    <EmptyHeader>
        <EmptyMedia variant="icon">
            <CalendarDays />
        </EmptyMedia>
        <EmptyTitle>Aucune réservation pour le moment</EmptyTitle>
        <EmptyDescription>Les réservations apparaîtront ici.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
        <Button asChild variant="outline">…</Button>
    </EmptyContent>
</Empty>
```
- **Fil d'Ariane** : `nav aria-label="Fil d'Ariane"` + `ChevronRight h-4 w-4 text-foreground/50`.
- **Carrousel défilant** (avis) : conteneur `min-h-[260px] w-[320px] shrink-0`.
- **Filtres pills** (catalogue) : actif `border-primary bg-primary text-primary-foreground`, inactif `border-border/60 bg-background text-foreground/70 hover:border-primary/40`.

## Icônes

Toutes les icônes de l’app viennent de **[Reicon](https://reicon.dev/icons)**
(`reicon-react`, MIT, grille 24 × 24, poids `Outline` par défaut).

- Import nommé : `import { CalendarDays, Sliders } from 'reicon-react';`
  Le nom PascalCase vient du catalogue (`calendar-days` → `CalendarDays`) :
  <https://reicon.dev/llms-icons.txt>.
- Taille et couleur via Tailwind : `className="size-4 text-muted-foreground"`
  (les classes `size-*` priment sur la taille par défaut de 24 px). Dans un
  `Button`, utiliser `data-icon="inline-start"` sans classe de taille.
- Type d’un composant icône passé en prop : `IconComponent`
  (`import { type IconComponent } from 'reicon-react'`).
- `weight="Filled"` seulement pour un état actif ou une mise en avant.
- Exception : les icônes internes des composants shadcn
  (`resources/js/components/ui/*` : croix de fermeture, chevrons, coches)
  restent en `lucide-react`, la bibliothèque déclarée dans `components.json`.
  Ne pas les modifier à la main.
- Vérifier qu’une icône existe avant de l’utiliser : le fichier
  `node_modules/reicon-react/icons/<Nom>.js` doit exister (attention à la
  casse : `Logout`, pas `LogOut`).

## 9. Données & mocks

- Mock-first : les données type catalogue vivent dans **`resources/js/data/*.ts`**
  avec des interfaces explicites (`CourseMock`, `ArticleMock`) — la forme
  future des tables BDD. Exception : le blog garde ses données à côté de la
  page (`resources/js/pages/blog/blog-data.ts`, type `Article`).
- Helpers centralisés : `groupOf()`, `levelLabel()`, `categoryMeta`,
  `levelClasses`, `formatMeta`, `objectivesByCategory`, `modulesByCategory`.

## 10. Accessibilité

- `aria-label` sur tout bouton icône, `aria-hidden` sur icônes déco,
  `aria-expanded` sur accordéons.
- Contraste texte : jamais sous `text-foreground/60` pour du texte de lecture.
- Images : `alt` explicite + `loading="lazy" decoding="async"`.

## 11. Pages existantes (références)

| Page            | Fichier                    | Highlights de design            |
| --------------- | -------------------------- | ------------------------------- |
| Landing         | `home/index.tsx` + partials| hero canvas-waves, marquee      |
| Catalogue       | `home/courses.tsx`         | filtres catégorie × niveau      |
| Fiche cours     | `home/course.tsx`          | carte sticky prix, sessions     |
| À propos        | `home/about.tsx`           | photo + carte étoiles flottante |
| Contact         | `home/contact.tsx`         | canaux + formulaire (mock)      |
| Blog            | `blog/index.tsx` + partials| sidebar sticky (recherche + catégories), article à la une image plein cadre |

Layouts/partiels globaux : `resources/js/layouts/home/partials/`
(header, footer, logo `venincorse.png` responsive `h-7 sm:h-8 lg:h-9`).
