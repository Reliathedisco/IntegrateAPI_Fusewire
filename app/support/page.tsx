import SupportChat from "@/components/SupportChat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — IntegrateAPI",
  description:
    "Ask the IntegrateAPI assistant questions about the CLI, templates, and pricing.",
};

export default function SupportPage() {
  return (
    <div className="container support-page">
      <header className="support-page-header">
        <h1>Support assistant</h1>
        <p className="pageLead">
          Grounded answers from IntegrateAPI docs and product context — not open-ended
          guessing.
        </p>
      </header>
      <SupportChat />
    </div>
  );
}
