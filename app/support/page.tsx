import SupportChat from "@/components/SupportChat";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — IntegrateAPI",
  description:
    "Ask the IntegrateAPI assistant questions about the CLI, templates, and pricing.",
};

export default function SupportPage() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <Eyebrow>Support</Eyebrow>
          <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
            Grounded answers, not guesses.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
            Answers come from IntegrateAPI docs and product context. If it isn&apos;t
            in context, the assistant will say so.
          </p>
        </header>
        <div className="mt-10">
          <SupportChat />
        </div>
      </Container>
    </section>
  );
}
