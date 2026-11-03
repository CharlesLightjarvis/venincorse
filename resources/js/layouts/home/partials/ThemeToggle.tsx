import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'themechange';
const SERVER_MODE: ThemeMode = 'auto';

function isThemeMode(value: string | null): value is ThemeMode {
    return value === 'light' || value === 'dark' || value === 'auto';
}

function getSnapshot(): ThemeMode {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        return isThemeMode(stored) ? stored : SERVER_MODE;
    } catch {
        return SERVER_MODE;
    }
}

function getServerSnapshot(): ThemeMode {
    return SERVER_MODE;
}

function subscribe(onStoreChange: () => void): () => void {
    window.addEventListener('storage', onStoreChange);
    window.addEventListener(CHANGE_EVENT, onStoreChange);

    return () => {
        window.removeEventListener('storage', onStoreChange);
        window.removeEventListener(CHANGE_EVENT, onStoreChange);
    };
}

function storeThemeMode(mode: ThemeMode) {
    try {
        window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
        // Storage can be unavailable (private mode); the in-memory store still updates.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function applyThemeMode(mode: ThemeMode) {
    const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
    ).matches;
    const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);

    if (mode === 'auto') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', mode);
    }

    document.documentElement.style.colorScheme = resolved;
}

const options = [
    { value: 'light' as ThemeMode, icon: Sun, label: 'Mode clair' },
    { value: 'dark' as ThemeMode, icon: Moon, label: 'Mode sombre' },
    {
        value: 'auto' as ThemeMode,
        icon: Monitor,
        label: 'Automatique (système)',
    },
];

export default function ThemeToggle() {
    const mode = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    useEffect(() => {
        applyThemeMode(mode);
    }, [mode]);

    useEffect(() => {
        if (mode !== 'auto') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => applyThemeMode('auto');
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, [mode]);

    function handleSet(next: ThemeMode) {
        storeThemeMode(next);
    }

    return (
        <div className="flex items-center rounded-full border border-border/50 bg-muted/50 p-0.5">
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleSet(value)}
                    aria-label={label}
                    title={label}
                    aria-pressed={mode === value}
                    className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
                        mode === value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-foreground/35 hover:text-foreground/70',
                    )}
                >
                    <Icon className="h-3.5 w-3.5" />
                </button>
            ))}
        </div>
    );
}
