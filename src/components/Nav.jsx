import { profile } from '../data/profile'

export default function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <span className="brand-mark" />
        {profile.shortName}
      </a>
      <nav className="nav-links">
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#systems">Systems</a>
        <a href="#stack">Stack</a>
      </nav>
      <a className="nav-cta" href="#contact">
        Available
      </a>
    </header>
  )
}
