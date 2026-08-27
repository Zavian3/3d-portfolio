import { motion } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '../data/profile'

function TiltCard({ href, children }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(8px)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'rotateX(0) rotateY(0) translateZ(0)'
  }

  const Tag = href ? 'a' : 'article'
  return (
    <Tag
      ref={ref}
      className="card"
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </Tag>
  )
}

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

const ticker = [
  'Voice AI',
  'RAG',
  'Multi-agent',
  'MLOps',
  'LangGraph',
  'Retell',
  'n8n',
  'Claude Code',
  'FastAPI',
  'Kubernetes',
]

export default function Overlay() {
  const loop = [...ticker, ...ticker]

  return (
    <div className="overlay">
      <section className="section hero" id="top">
        <motion.p className="kicker" initial="hidden" animate="show" variants={fade}>
          {profile.title} · {profile.location}
        </motion.p>
        <motion.h1 initial="hidden" animate="show" variants={fade}>
          Muhammad
          <span>A. Rafay</span>
        </motion.h1>
        <motion.p className="hero-copy" initial="hidden" animate="show" variants={fade}>
          {profile.headline}
        </motion.p>
        <motion.div className="hero-row" initial="hidden" animate="show" variants={fade}>
          <a className="btn primary" href={`mailto:${profile.email}`}>
            Start a conversation
          </a>
          <a className="btn" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="btn" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </motion.div>
        <div className="stats">
          {profile.stats.map((s) => (
            <div className="stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="scroll-hint">Scroll the field</div>
      </section>

      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee">
          {loop.map((item, i) => (
            <span key={`${item}-${i}`}>◆ {item}</span>
          ))}
        </div>
      </div>

      <section className="section about" id="about">
        <p className="kicker">01 — Signal</p>
        <div className="panel about-grid">
          <div className="portrait">
            <img src="https://avatars.githubusercontent.com/u/101244437?v=4" alt="Muhammad A. Rafay" />
          </div>
          <div>
            <h2>Production systems, not prototypes.</h2>
            <p className="lede">{profile.summary}</p>
            <div className="manifesto">
              {profile.manifesto.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="edu">
              {profile.education.map((ed) => (
                <span className="chip" key={ed.school}>
                  {ed.program} · {ed.short}
                  {ed.years ? ` · ${ed.years}` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section experience" id="work">
        <p className="kicker">02 — Trajectory</p>
        <h2>Where the work happened.</h2>
        <div className="timeline">
          {profile.experience.map((job) => (
            <article className="job" key={`${job.company}-${job.period}`}>
              <div>
                <time>{job.period}</time>
                <span className="place">{job.place}</span>
              </div>
              <div>
                <h3>
                  {job.href ? (
                    <a href={job.href} target="_blank" rel="noreferrer">
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </h3>
                <p className="role">{job.role}</p>
                <ul>
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section projects" id="systems">
        <p className="kicker">03 — Systems</p>
        <h2>Things that shipped.</h2>
        <div className="project-grid">
          {profile.projects.map((p) => (
            <TiltCard key={p.id} href={p.href}>
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p className="metric">{p.metric}</p>
              <p>{p.description}</p>
              <div className="stack">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="section skills" id="stack">
        <p className="kicker">04 — Stack</p>
        <h2>Tools I actually use.</h2>
        <div className="skill-grid">
          {profile.skills.map((group) => (
            <div className="panel skill-card" key={group.group}>
              <h3>{group.group}</h3>
              <div className="stack">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="certs">
          {profile.certifications.map((c) => (
            <a className="chip" key={c.name} href={c.href} target="_blank" rel="noreferrer">
              {c.name} · {c.org} {c.year}
            </a>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <p className="kicker">05 — Handshake</p>
        <div className="contact-block">
          <h2>Let&apos;s build something that holds up in production.</h2>
          <p className="lede">
            {profile.availability}. If you are tackling hard problems in production ML, voice
            agents, RAG, or AI alignment — write.
          </p>
          <a className="email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="socials">
            <a className="btn" href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub / {profile.handle}
            </a>
            <a className="btn" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="btn" href={profile.links.stackoverflow} target="_blank" rel="noreferrer">
              Stack Overflow
            </a>
            <a className="btn" href={profile.links.netronflow} target="_blank" rel="noreferrer">
              NetronFlow
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Lahore · Built as an interactive neural field</span>
      </footer>
    </div>
  )
}
