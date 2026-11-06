import type { IconComponent } from 'reicon-react';

export function TrialInfoCard({
    icon: Icon,
    label,
    value,
    caption,
}: {
    icon: IconComponent;
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-lg border border-border p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
            <p className="mt-3 text-2xl font-semibold first-letter:uppercase">
                {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
        </div>
    );
}
