import { NextResponse } from "next/server";
import { integrations } from "@/lib/data";

export async function GET() {
  const list = integrations
    .filter((i) => !i.comingSoon)
    .map((i) => ({
      id: i.id,
      name: i.name,
      displayName: i.name,
      slug: i.slug,
      category: i.category,
      tier: i.tier,
      description: i.shortDescription,
      features: i.features,
      timeSaved: estimateTimeSaved(i.tier),
    }));

  return NextResponse.json(list);
}

function estimateTimeSaved(tier: string): string {
  return tier === "pro" ? "5+ hours" : "3+ hours";
}
