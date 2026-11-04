import type { ReactNode } from 'react';

export default function BlankLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-svh bg-background text-foreground">
            {children}
        </div>
    );
}
