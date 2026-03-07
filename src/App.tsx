import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import HomePage from "./components/pages/HomePage"
import IntegrationsPage from "./components/pages/IntegrationsPage"
import IntegrationDetailPage from "./components/pages/IntegrationDetailPage"
import StacksPage from "./components/pages/StacksPage"
import DocsPage from "./components/pages/DocsPage"
import AccountPage from "./components/pages/AccountPage"

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/integrations/:slug" element={<IntegrationDetailPage />} />
            <Route path="/stacks" element={<StacksPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
