import {
    SiFacebook,
    SiInstagram,
    SiWhatsapp,
    SiX,
} from '@icons-pack/react-simple-icons';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Globe, Mail, Phone } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { partners } from '@/routes';

const footerLinks = [
    {
        title: 'Parcours',
        links: [
            { label: 'A1 — Premiers pas', href: '/courses/a1' },
            { label: 'A2 — Autonomie', href: '/courses/a2' },
            { label: 'B1 — Confiance', href: '/courses/b1' },
            { label: 'B2 — Précision', href: '/courses/b2' },
        ],
    },
    {
        title: 'Offres',
        links: [
            { label: "Cours d'essai 1 h", href: '/trial' },
            { label: 'Prépa Goethe, ÖSD & TELC', href: '/exams' },
            { label: 'Packs de grammaire', href: '/workshops#grammar' },
            { label: 'Ateliers pratiques', href: '/workshops#practice' },
            { label: 'Tarifs', href: '/pricing' },
        ],
    },
    {
        title: 'Ressources',
        links: [
            { label: 'Test de niveau gratuit', href: '/level-test' },
            { label: 'Les manuels', href: '/manuels' },
            { label: 'Blog', href: '/blog' },
            { label: 'À propos', href: '/about' },
            { label: 'Devenir partenaire pédagogique', href: partners.url() },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Légal',
        links: [
            { label: 'Confidentialité', href: '#' },
            { label: 'CGU', href: '#' },
            { label: 'Mentions légales', href: '#' },
        ],
    },
];

const socialLinks = [
    { icon: SiWhatsapp, label: 'WhatsApp', href: '#' },
    { icon: SiX, label: 'Twitter', href: '#' },
    { icon: SiFacebook, label: 'Facebook', href: '#' },
    { icon: SiInstagram, label: 'Instagram', href: '#' },
];

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const shouldReduceMotion = useReducedMotion();

    return (
        <footer
            aria-labelledby="footer-heading"
            className="relative w-full overflow-hidden border-t border-border bg-card"
        >
            <h2 id="footer-heading" className="sr-only">
                Site footer
            </h2>

            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand & Newsletter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <motion.div
                            whileHover={
                                shouldReduceMotion ? undefined : { scale: 1.05 }
                            }
                            transition={{ duration: 0.2 }}
                            className="mb-4 inline-flex items-center gap-3"
                        >
                            <img
                                src="/images/venincorse.png"
                                alt="VéninCorsé"
                                loading="lazy"
                                decoding="async"
                                className="h-9 w-auto object-contain sm:h-10 lg:h-12"
                            />
                        </motion.div>

                        <p className="mb-4 max-w-md text-sm text-muted-foreground">
                            L'allemand pour les francophones de la diaspora :
                            parcours A1 → B2, prépa Goethe, ÖSD & TELC et
                            ateliers ciblés — 100 % en visio, en mini-groupe ou
                            en 1:1. Commence par une heure d'essai ou par le
                            test de niveau gratuit.
                        </p>

                        {/* Newsletter */}
                        <div className="mb-4">
                            <p className="mb-2 text-sm font-medium text-foreground">
                                Reçois chaque semaine un conseil d'allemand
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Ton adresse email"
                                />
                                <Button size="sm" aria-label="S'abonner">
                                    <Mail className="h-4 w-4" aria-hidden />
                                </Button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <motion.div
                                whileHover={
                                    shouldReduceMotion ? undefined : { x: 5 }
                                }
                                className="flex items-center gap-2"
                            >
                                <Globe className="h-4 w-4" aria-hidden />
                                <span>
                                    Cours 100 % en visio, où que tu sois
                                </span>
                            </motion.div>

                            <motion.div
                                whileHover={
                                    shouldReduceMotion ? undefined : { x: 5 }
                                }
                                className="flex items-center gap-2"
                            >
                                <Phone className="h-4 w-4" aria-hidden />
                                <span>+225 00 00 00 00 00</span>
                            </motion.div>

                            <motion.div
                                whileHover={
                                    shouldReduceMotion ? undefined : { x: 5 }
                                }
                                className="flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" aria-hidden />
                                <span>contact@venincorse.com</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer Links - 2 colonnes sur mobile seulement */}
                    <div className="grid grid-cols-2 gap-8 md:contents">
                        {footerLinks.map((section, sectionIndex) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: sectionIndex * 0.1,
                                }}
                            >
                                <h4 className="mb-4 text-sm font-semibold text-foreground/90">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIndex) => (
                                        <motion.li
                                            key={link.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: linkIndex * 0.05,
                                            }}
                                        >
                                            <motion.div
                                                whileHover={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : { x: 5 }
                                                }
                                            >
                                                <Link
                                                    href={link.href}
                                                    className="inline-block text-sm text-muted-foreground transition-colors hover:text-primary"
                                                >
                                                    {link.label}
                                                </Link>
                                            </motion.div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="my-10 h-px bg-border"
                />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-2"
                    >
                        {socialLinks.map((social, index) => (
                            <motion.div
                                key={social.label}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.6 + index * 0.05,
                                }}
                            >
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 rounded-full border-border/60 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                    aria-label={social.label}
                                >
                                    <motion.div
                                        transition={{
                                            duration: shouldReduceMotion
                                                ? 0.25
                                                : 0.3,
                                        }}
                                    >
                                        <social.icon
                                            className="h-4 w-4"
                                            aria-hidden
                                        />
                                    </motion.div>
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                        <span>© 2026 VéninCorsé. Tous droits réservés.</span>
                        <Badge variant="outline" className="text-xs">
                            v1.0.0
                        </Badge>
                    </motion.div>

                    {/* Scroll to Top */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                    >
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-full border-border/60"
                            onClick={scrollToTop}
                        >
                            <motion.div
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : { y: [0, -3, 0] }
                                }
                                transition={
                                    shouldReduceMotion
                                        ? undefined
                                        : { repeat: Infinity, duration: 1.5 }
                                }
                            >
                                <ArrowUp className="h-4 w-4" aria-hidden />
                            </motion.div>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </footer>
    );
}
