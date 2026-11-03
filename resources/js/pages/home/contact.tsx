import { motion } from "framer-motion";
import {
    ArrowRight,
    Globe,
    Mail,
    Clock,
    Phone,
} from "lucide-react";
import { SiFacebook as SiFacebookIcon, SiInstagram as SiInstagramIcon, SiWhatsapp as SiWhatsappIcon, SiX as SiXIcon } from "@icons-pack/react-simple-icons";
import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const contactChannels = [
    {
        icon: Mail,
        title: "Email",
        value: "contact@venincorse.com",
        detail: "Réponse la plus complète, idéale pour les entreprises",
    },
    {
        icon: Phone,
        title: "WhatsApp",
        value: "+225 00 00 00 00 00",
        detail: "Le plus rapide — en général sous quelques heures",
    },
    {
        icon: Globe,
        title: "Cours en visio",
        value: "100 % à distance",
        detail: "Où que tu sois, il faut juste une connexion",
    },
] as const;

const subjectOptions = [
    { value: "essai", label: "Réserver un cours d'essai" },
    { value: "standard", label: "Cours standard (A1 → B2)" },
    { value: "grammaire", label: "Atelier grammaire" },
    { value: "conversation", label: "Conversation orale" },
    { value: "examens", label: "Préparation aux examens" },
    { value: "affaires", label: "Allemand des affaires" },
    { value: "soutien", label: "Soutien scolaire (8–15 ans)" },
] as const;

const socialLinks = [
    { icon: SiWhatsappIcon, label: "WhatsApp" },
    { icon: SiXIcon, label: "Twitter / X" },
    { icon: SiFacebookIcon, label: "Facebook" },
    { icon: SiInstagramIcon, label: "Instagram" },
] as const;

const inputClasses =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function Contact() {
    return (
        <div className="relative py-20 md:py-28">
            <Head title="Contact" />

            {/* blobs décoratifs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* en-tête */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto mb-16 max-w-2xl text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Contact
                    </div>

                    <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Parlons de ton objectif
                    </h1>

                    <p className="text-lg text-foreground/60">
                        Une question sur un cours, un examen ou un planning ?
                        Écris-moi — la réponse arrive en quelques heures.
                    </p>
                </motion.div>

                <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    {/* canaux */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="flex flex-col gap-4"
                    >
                        {contactChannels.map((channel) => (
                            <div
                                key={channel.title}
                                className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/30 dark:border-border/50"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <channel.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {channel.title}
                                    </h3>

                                    <p className="mt-0.5 font-medium text-foreground">
                                        {channel.value}
                                    </p>

                                    <p className="mt-1 text-sm text-foreground/60">
                                        {channel.detail}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="rounded-2xl border border-border/40 bg-card p-5 dark:border-border/50">
                            <h3 className="text-sm font-semibold text-foreground">
                                Disponibilités
                            </h3>

                            <p className="mt-1 flex items-center gap-2 text-sm text-foreground/60">
                                <Clock
                                    className="h-4 w-4 text-foreground/40"
                                    aria-hidden="true"
                                />
                                Lundi – samedi · 9 h à 21 h (GMT)
                            </p>

                            <div className="mt-4 flex gap-2">
                                {socialLinks.map((social) => (
                                    <Button
                                        key={social.label}
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 rounded-full border-border/60 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                        aria-label={social.label}
                                    >
                                        <social.icon
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* formulaire (mock) */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="rounded-3xl border border-border/40 bg-card p-6 md:p-8 dark:border-border/50"
                    >
                        <h2 className="text-xl font-semibold text-foreground">
                            Envoyer un message
                        </h2>

                        <p className="mt-1 text-sm text-foreground/60">
                            Dis-moi qui tu es et ce que tu vises, je te
                            réponds avec un plan.
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Nom complet
                                </label>

                                <Input
                                    id="name"
                                    placeholder="Ton nom"
                                    autoComplete="name"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Email
                                </label>

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ton@email.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <label
                                htmlFor="subject"
                                className="text-sm font-medium text-foreground"
                            >
                                Ce qui t'intéresse
                            </label>

                            <Select>
                                <SelectTrigger id="subject" className="w-full">
                                    <SelectValue placeholder="Choisis une option" />
                                </SelectTrigger>

                                <SelectContent>
                                    {subjectOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <label
                                htmlFor="message"
                                className="text-sm font-medium text-foreground"
                            >
                                Ton message
                            </label>

                            <textarea
                                id="message"
                                rows={5}
                                placeholder="Ex : je vise le Goethe B2 en mars, je travaille dans la logistique…"
                                className={`${inputClasses} resize-none`}
                            />
                        </div>

                        <Button
                            size="lg"
                            className="group mt-6 w-full gap-2 rounded-full"
                        >
                            Envoyer le message
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Button>

                        <p className="mt-3 text-center text-xs text-foreground/50">
                            En général, je réponds en moins de 24 h.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
