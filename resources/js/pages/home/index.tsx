import { Head } from "@inertiajs/react";
import { Hero } from "./partials/hero";
import { WhyUs } from "./partials/why-us";
import { Process } from "./partials/process";
import { Courses } from "./partials/courses";
import { Stats } from "./partials/stats";
import { Testimonials } from "./partials/testimonials";
import { Faq } from "./partials/faq";
import { Cta } from "./partials/cta";

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <Hero />
            <WhyUs />
            <Process />
            <Courses />
            <Stats />
            <Testimonials />
            <Faq />
            <Cta />
        </>
    );
}
