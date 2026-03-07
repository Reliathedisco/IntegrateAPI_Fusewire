export default function AccountPage() {
  const email = "dev@example.com"
  const plan = "Pro"
  const availableIntegrations = "All integrations (Pro plan)"

  return (
    <div className="container">
      <h1>Account</h1>
      <div className="accountCard">
        <p><strong>Email</strong></p>
        <p>{email}</p>
        <p><strong>Plan</strong></p>
        <p>{plan}</p>
        <p><strong>Available integrations</strong></p>
        <p>{availableIntegrations}</p>
        <button type="button" className="primary upgradeButton">
          Upgrade
        </button>
      </div>
    </div>
  )
}
