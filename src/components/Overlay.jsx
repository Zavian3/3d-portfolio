import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import AgentFlow from './AgentFlow'

/* ── Animation presets ───────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] } },
}
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { show: { transition: { staggerChildren: 0.1 } } }
const staggerFast = { show: { transition: { staggerChildren: 0.07 } } }

function SectionReveal({ children, className, id, delay = 0 }) {
  return (
    <motion.section
      className={`section ${className}`}
      id={id}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.section>
  )
}

/* ── Animated stat counter ───────────────────────── */
function AnimatedStat({ value, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    const suffix = value.replace(/[0-9.]/g, '')
    if (isNaN(num)) { setDisplay(value); return }
    const frames = 60
    let i = 0
    const step = num / frames
    const timer = setInterval(() => {
      i++
      const cur = Math.min(step * i, num)
      setDisplay((Number.isInteger(num) ? Math.round(cur) : cur.toFixed(1)) + suffix)
      if (i >= frames) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <div className="stat" ref={ref}>
      <b>{display}</b>
      <span>{label}</span>
    </div>
  )
}

/* ── 3-D tilt card ───────────────────────────────── */
function TiltCard({ href, children, 'data-speech': speech }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(10px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'
  }
  const Tag = href ? 'a' : 'article'
  return (
    <Tag
      ref={ref}
      className="card"
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      data-speech={speech}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </Tag>
  )
}

/* ── Ticker tape ─────────────────────────────────── */
const ticker = ['Voice AI','RAG','Multi-agent','MLOps','LangGraph','Retell','n8n','Claude Code','FastAPI','Kubernetes','LangChain','Pinecone','CrewAI','Vapi','Supabase']

/* ── Main overlay ────────────────────────────────── */
export default function Overlay() {
  const loop = [...ticker, ...ticker]

  return (
    <div className="overlay">

      {/* ── HERO ──────────────────────────────────── */}
      <section className="section hero" id="top">
        <motion.p className="kicker" initial="hidden" animate="show" variants={fadeUp}>
          {profile.title} · {profile.location}
        </motion.p>
        <motion.h1
          initial="hidden" animate="show" variants={fadeUp}
          data-speech="That's the man himself! Muhammad A. Rafay — Senior AI/ML Engineer, builder, and shipping machines that don't sleep 🤖✨"
        >
          Muhammad
          <span>A. Rafay</span>
        </motion.h1>
        <motion.p className="hero-copy" initial="hidden" animate="show" variants={fadeUp}>
          {profile.headline}
        </motion.p>
        <motion.div className="hero-row" initial="hidden" animate="show" variants={fadeUp}>
          <a className="btn primary" href={`mailto:${profile.email}`}
            data-speech="Oooh someone's making MOVES! 🔥 Drop that email — Rafay actually replies, I promise!">
            Start a conversation
          </a>
          <a className="btn" href={profile.links.github} target="_blank" rel="noreferrer"
            data-speech="Let's check the receipts! All the code is right here — the proof is in the commits 🔍">
            GitHub
          </a>
          <a className="btn" href={profile.links.linkedin} target="_blank" rel="noreferrer"
            data-speech="Professional mode: ACTIVATED. Suit.exe loading... 💼 Connect and let's network!">
            LinkedIn
          </a>
          <a className="btn" href={profile.links.netronflow} target="_blank" rel="noreferrer"
            data-speech="OUR baby startup!! Voice agents answering real calls RIGHT NOW as you read this! 🤖📞">
            NetronFlow ↗
          </a>
        </motion.div>
        <motion.div
          className="stats"
          initial="hidden"
          animate="show"
          variants={staggerFast}
        >
          {profile.stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <AnimatedStat value={s.value} label={s.label} />
            </motion.div>
          ))}
        </motion.div>
        <div className="scroll-hint">Scroll the field</div>
      </section>

      {/* ── TICKER ────────────────────────────────── */}
      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee">
          {loop.map((item, i) => (
            <span key={`${item}-${i}`}>◆ {item}</span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ─────────────────────────────────── */}
      <SectionReveal className="about" id="about">
        <motion.p className="kicker" variants={fadeLeft}>01 — Signal</motion.p>
        <div className="panel about-grid">
          <motion.div className="portrait" variants={fadeUp}>
            <img src="https://avatars.githubusercontent.com/u/101244437?v=4" alt="Muhammad A. Rafay" />
            <div className="portrait-status">
              <span className="status-dot" />
              Available · Remote
            </div>
          </motion.div>
          <motion.div variants={stagger}>
            <motion.h2 variants={fadeUp}>Production systems, not prototypes.</motion.h2>
            <motion.p className="lede" variants={fadeUp}>{profile.summary}</motion.p>
            <motion.div className="manifesto" variants={stagger}>
              {profile.manifesto.map((line) => (
                <motion.p key={line} variants={fadeLeft}>{line}</motion.p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── EDUCATION ─────────────────────────────── */}
      <SectionReveal className="education" id="academia">
        <motion.p className="kicker" variants={fadeLeft}>02 — Academia</motion.p>
        <motion.h2 variants={fadeUp}>Where the thinking got formal.</motion.h2>
        <div className="edu-grid">
          {profile.education.map((ed) => (
            <motion.div
              key={ed.school}
              className={`edu-card ${ed.current ? 'edu-current' : ''}`}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.28 } }}
              data-speech={ed.current
                ? "Masters in AI from LUMS?! That's like getting into Harvard but in Pakistan — pure ELITE tier! This guy means serious business 🔥🇵🇰"
                : "FAST-NUCES — THE CS school of Pakistan! Four years of hardcore grind that built the foundation for everything you see here 🎓💪"}
            >
              {ed.current && <span className="edu-badge">Current</span>}
              <div className="edu-years">{ed.years}</div>
              <div className="edu-program">{ed.program}</div>
              <div className="edu-school">{ed.school}</div>
              <div className="edu-short">{ed.short} · {ed.location}</div>
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      {/* ── EXPERIENCE ────────────────────────────── */}
      <SectionReveal className="experience" id="work">
        <motion.p className="kicker" variants={fadeLeft}>03 — Trajectory</motion.p>
        <motion.h2 variants={fadeUp}>Where the work happened.</motion.h2>
        <motion.div className="panel timeline-panel" variants={fadeUp}>
          <div className="timeline">
            {profile.experience.map((job) => {
              const speeches = {
                'NetronFlow': "This is the CURRENT MISSION! Building AI that actually picks up the phone — no scripts, no hold music, just smart agents doing real work 🚀🤖",
                'Metaviz':    "Led an ENTIRE AI engineering team! Not just writing code — managing people, setting direction, owning delivery. Senior life hits different ⚡",
                'Greyfibre':  "Turning a whole inbox into automation gold — from full-stack Django to AI-powered email intelligence. The pivot that leveled everything up 📧✨",
                'AmentoTech': "Baby steps that became giant leaps! Every expert was once a beginner — this is where the LangChain and TensorFlow story started 🌱",
                'MetaViz Pro': "Data science origin story! Scraping, wrangling, visualizing — turning messy data into decisions. The foundation of everything 📊",
              }
              return (
                <motion.article
                  className="job"
                  key={`${job.company}-${job.period}`}
                  variants={fadeUp}
                  whileHover={{ x: 4, transition: { duration: 0.22 } }}
                  data-speech={speeches[job.company] || `${job.company} — each role a new level unlocked! 🎮`}
                >
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
                </motion.article>
              )
            })}
          </div>
        </motion.div>
      </SectionReveal>

      {/* ── LIVE SYSTEM ───────────────────────────── */}
      <SectionReveal className="live-system" id="system">
        <motion.p className="kicker" variants={fadeLeft}>04 — Live System</motion.p>
        <motion.h2 variants={fadeUp}>Agents working right now.</motion.h2>
        <motion.p className="lede" variants={fadeUp} style={{ maxWidth: 560 }}>
          A real-time view of the multi-agent architecture behind NetronFlow — voice intake, orchestration, retrieval, and human handoff running continuously in production.
        </motion.p>
        <motion.div className="panel agentflow-panel" variants={fadeUp}>
          <AgentFlow />
        </motion.div>
      </SectionReveal>

      {/* ── PROJECTS ──────────────────────────────── */}
      <SectionReveal className="projects" id="systems">
        <motion.p className="kicker" variants={fadeLeft}>05 — Systems</motion.p>
        <motion.h2 variants={fadeUp}>Things that shipped.</motion.h2>
        <motion.div className="project-grid" variants={stagger}>
          {profile.projects.map((proj) => {
            const speeches = {
              voice:  "200+ calls a day and ZERO coffee breaks! That's AI handling real customer conversations 24/7 — no sick days, no attitude 📞🤖",
              rag:    "97% relevance score?! That's basically superhuman accuracy! 1000+ documents processed daily — this is the brain behind the operation 📚⚡",
              netron: "The product we built from SCRATCH! From napkin idea to actual paying customers with real AI agents. This one hits different 🚀",
              hr360:  "The FINAL YEAR PROJECT that started it all! Computer vision + NLP for HR — the capstone that proved everything was possible 🎓🏆",
              rynova: "A whole control plane for AI appointment businesses! Fully automated scheduling, reminders, CRM sync — the future of booking 📅✨",
              fight:  "Even UFC fighters can't hide from our ML models! 10K+ fight records analyzed — we predict the punches before they land 🥊🧠",
            }
            return (
              <motion.div key={proj.id} variants={fadeUp}>
                <TiltCard href={proj.href} data-speech={speeches[proj.id]}>
                  <span className="tag">{proj.tag}</span>
                  <h3>{proj.title}</h3>
                  <p className="metric">{proj.metric}</p>
                  <p>{proj.description}</p>
                  <div className="stack">
                    {proj.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>
      </SectionReveal>

      {/* ── SKILLS ────────────────────────────────── */}
      <SectionReveal className="skills" id="stack">
        <motion.p className="kicker" variants={fadeLeft}>06 — Stack</motion.p>
        <motion.h2 variants={fadeUp}>Tools I actually use.</motion.h2>
        <motion.div className="skill-grid" variants={stagger}>
          {profile.skills.map((group) => (
            <motion.div className="panel skill-card" key={group.group} variants={fadeUp}>
              <h3>{group.group}</h3>
              <div className="stack">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="certs" variants={stagger}>
          {profile.certifications.map((c) => (
            <motion.a
              className="chip"
              key={c.name}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              {c.name} · {c.org} {c.year}
            </motion.a>
          ))}
        </motion.div>
      </SectionReveal>

      {/* ── CONTACT ───────────────────────────────── */}
      <SectionReveal className="contact" id="contact">
        <motion.p className="kicker" variants={fadeLeft}>07 — Handshake</motion.p>
        <div className="contact-block">
          <motion.h2
            variants={fadeUp}
            data-speech="THIS IS MY FAVORITE PART! 🎉 Seriously, reach out! Rafay is genuinely one of the nicest humans to work with — I would know, I live on his website 🤖"
          >
            Let&apos;s build something that holds up in production.
          </motion.h2>
          <motion.p className="lede" variants={fadeUp}>
            {profile.availability}. If you are tackling hard problems in production ML, voice
            agents, RAG, or AI alignment — write.
          </motion.p>
          <motion.a className="email" href={`mailto:${profile.email}`} variants={fadeUp}>
            {profile.email}
          </motion.a>
          <motion.div className="socials" variants={stagger}>
            <motion.a className="btn" href={profile.links.github} target="_blank" rel="noreferrer" variants={fadeUp}>
              GitHub / {profile.handle}
            </motion.a>
            <motion.a className="btn" href={profile.links.linkedin} target="_blank" rel="noreferrer" variants={fadeUp}>
              LinkedIn
            </motion.a>
            <motion.a className="btn" href={profile.links.stackoverflow} target="_blank" rel="noreferrer" variants={fadeUp}>
              Stack Overflow
            </motion.a>
            <motion.a className="btn" href={profile.links.netronflow} target="_blank" rel="noreferrer" variants={fadeUp}>
              NetronFlow
            </motion.a>
          </motion.div>
        </div>
      </SectionReveal>

      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Lahore · Built as an interactive neural field</span>
      </footer>
    </div>
  )
}
