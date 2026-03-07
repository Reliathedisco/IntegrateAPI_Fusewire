import { useState } from "react"
import { getIntegrations } from "@/lib/data"
import IntegrationCard from "../IntegrationCard"

export default function IntegrationsPage() {
  const [query, setQuery] = useState("")
  const all = getIntegrations()
  const filtered = all.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase()) ||
      i.shortDescription.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="container">
      <h1>Integrations</h1>
      <input
        type="search"
        placeholder="Search integrations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="searchInput"
      />
      <div className="grid gridFull">
        {filtered.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            showInstallCommand
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="emptyState">No integrations match your search.</p>
      )}
    </div>
  )
}
