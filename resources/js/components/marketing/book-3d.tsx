import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type Book3DProps = {
    cover: string;
    title: string;
    accent?: string;
    /** Height divided by width. Keeps the cover undistorted. */
    ratio?: number;
    /** Small rotation around the Z axis, in degrees. */
    lean?: number;
    className?: string;
    priority?: boolean;
    decorative?: boolean;
};

export function Book3D({
    cover,
    title,
    accent = '#2F6B4F',
    ratio = 1.333,
    lean = 0,
    className,
    priority = false,
    decorative = false,
}: Book3DProps) {
    const style = {
        '--book-accent': accent,
        '--book-lean': `${lean}deg`,
        aspectRatio: String(1 / ratio),
    } as CSSProperties;

    return (
        <div className={cn('book-3d-stage', className)} style={style}>
            <span className="book-3d__shadow" aria-hidden="true" />

            <div className="book-3d">
                <span className="book-3d__spine" aria-hidden="true" />
                <span className="book-3d__pages" aria-hidden="true" />
                <span className="book-3d__bottom" aria-hidden="true" />

                <div className="book-3d__cover">
                    <img
                        src={cover}
                        alt={
                            decorative ? '' : `${title} — couverture officielle`
                        }
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                    />
                    <span className="book-3d__gloss" aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
