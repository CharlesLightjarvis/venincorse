import { useEffect, useEffectEvent } from 'react';

/**
 * Runs when the browser restores this page from its back/forward cache,
 * for example after leaving for Stripe and pressing the Back button.
 */
export function usePageRestore(onRestore: () => void): void {
    const handleRestore = useEffectEvent(onRestore);

    useEffect(() => {
        function onPageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                handleRestore();
            }
        }

        window.addEventListener('pageshow', onPageShow);

        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);
}
