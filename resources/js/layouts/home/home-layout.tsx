import { Footer } from './partials/footer';
import { Header } from './partials/header';

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="home-dot-grid flex min-h-svh flex-col text-foreground">
            <Header />

            <main className="flex-1">{children}</main>

            <Footer />
        </div>
    );
}
