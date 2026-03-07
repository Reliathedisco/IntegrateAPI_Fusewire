import { NavLink } from "react-router-dom"

export default function Navigation() {
  return (
    <nav className="nav">
      <NavLink to="/" className="logo">
        Templates
      </NavLink>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/integrations">Integrations</NavLink>
        <NavLink to="/stacks">Stacks</NavLink>
        <NavLink to="/docs">Docs</NavLink>
        <NavLink to="/account">Account</NavLink>
      </div>
    </nav>
  )
}
