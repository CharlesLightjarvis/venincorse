# Typography — VéninCorsé

Système typographique du projet (Tailwind CSS v4 + `@theme`). Les polices sont
**auto-hébergées** via Bunny Fonts au moment du build.

## Résumé

| Usage          | Police         | Token Tailwind                    | Poids chargés         |
| -------------- | -------------- | --------------------------------- | --------------------- |
| Titres (h1–h6) | **Fredoka**    | `--font-display` → `font-display` | 400 / 500 / 600 / 700 |
| Texte courant  | **Geist**      | `--font-sans` (par défaut)        | 400 / 500 / 600 / 700 |
| Labels / code  | **Geist Mono** | `--font-mono` → `font-mono`       | 400 / 500 / 600       |

## Titres — Fredoka

Police arrondie qui reprend l'esprit du wordmark `public/images/venincorse.png`.

- Définie dans `@theme` sous `--font-display` (fallback : Geist).
- Appliquée automatiquement à tous les titres par la règle `@layer base` :

```css
h1,
h2,
h3,
h4,
h5,
h6 {
    @apply font-display;
}
```

Aucune classe nécessaire dans les composants : `<h2>` = Fredoka. Les classes
`font-semibold`, `text-3xl`, etc. continuent de fonctionner normalement.

## Texte courant — Geist

- Définie sous `--font-sans`, appliquée au `body` avec les **jeux stylistiques
  `ss01` et `cv11`** (variantes alternatives des lettres, rendu Geist canonique) :

```css
body {
    @apply bg-background font-sans text-foreground antialiased;
    font-feature-settings:
        'ss01' 1,
        'cv11' 1;
}
```

Toute l'interface hérite de Geist — pas besoin de `<body class="font-sans">`.

## Labels / Mono — Geist Mono

- Définie sous `--font-mono`.
- Chiffres **tabulaires** forcés sur les éléments mono pour l'alignement des
  colonnes (prix, tableaux, horaires) :

```css
pre,
code,
kbd,
samp {
    font-variant-numeric: tabular-nums;
}
```

Usage ponctuel dans les composants : `className="font-mono"` (ex. prix
`45 000 FCFA`, badges numérotés, timestamps).

## Chargement — Bunny Fonts

Les fichiers `.woff/.woff2` sont téléchargés et servis en local par le plugin
`laravel-vite-plugin/fonts` — voir `vite.config.ts` :

```ts
import { bunny } from 'laravel-vite-plugin/fonts';

fonts: [
    bunny('Fredoka', { weights: [400, 500, 600, 700] }),
    bunny('Geist', { weights: [400, 500, 600, 700] }),
    bunny('Geist Mono', { weights: [400, 500, 600] }),
],
```

- Aucun appel réseau vers fonts.bunny.net en production (auto-hébergé, RGPD).
- Un changement de famille se fait **ici** puis dans `@theme`
  (`resources/css/app.css`) — pas dans la Blade.
- Le serveur de dev (`npm run dev`) télécharge les polices au démarrage ;
  après modification de `vite.config.ts`, il redémarre tout seul.

## Fallbacks

```css
--font-sans:
    'Geist', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
--font-display: 'Fredoka', 'Geist', ui-sans-serif, system-ui, sans-serif;
--font-mono:
    'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

Si une police manque, la pile suivante prend le relais sans blocage du rendu.

---

## Couleurs de marque (rappel)

Définies dans `resources/css/app.css` (`:root` + `.dark`), dérivées du logo :

| Token         | Valeur                        | Usage                                 |
| ------------- | ----------------------------- | ------------------------------------- |
| `--primary`   | `oklch(0.5848 0.1357 157.63)` | vert du logo (`#09935B`), boutons/CTA |
| `--secondary` | neutre doux (= `muted`)       | boutons secondaires style Nuxt UI     |

Règle : **seul le primary porte la couleur** ; le secondary reste neutre.
