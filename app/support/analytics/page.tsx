import type { Metadata } from "next";
import SupportAnalytics from "@/components/SupportAnalytics";

export const metadata: Metadata = {
  title: "Support Analytics — IntegrateAPI",
  description:
    "Analytics dashboard for IntegrateAPI support chatbot — query volume, escalation rates, and knowledge gaps.",
};

export default function AnalyticsPage() {
  return (
    <div className="container analytics-page">
      <header className="analytics-page-header">
        <h1>Support Analytics</h1>
        <p className="pageLead">
          Query volume, intent breakdown, escalation rates, and knowledge gaps.
        </p>
      </header>
      <SupportAnalytics />
    </div>
  );
}
