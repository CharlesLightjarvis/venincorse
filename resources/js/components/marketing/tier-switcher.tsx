import { cn } from '@/lib/utils';
import {
    tierLabels,
    type TierKey,
} from '@/data/offer';

const tierOrder: TierKey[] = ['group', 'duo', 'solo'];

type TierSwitcherProps = {
    value: TierKey;
    onChange: (tier: TierKey) => void;
    className?: string;
};

export function TierSwitcher({
    value,
    onChange,
    className,
}: TierSwitcherProps) {
    return (
        <div
            className={cn(
                'inline-flex flex-wrap items-center gap-1 rounded-full border border-border/40 bg-background/60 p-1 backdrop-blur-sm dark:border-border/50 dark:bg-background/40',
                className,
            )}
            role="group"
            aria-label="Choisir une formule"
        >
            {tierOrder.map((tier) => {
                const isActive = value === tier;

                return (
                    <button
                        key={tier}
                        type="button"
                        onClick={() => onChange(tier)}
                        aria-pressed={isActive}
                        className={cn(
                            'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground/60 hover:text-foreground',
                        )}
                    >
                        {tierLabels[tier]}
                    </button>
                );
            })}
        </div>
    );
}
