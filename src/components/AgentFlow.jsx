import { useEffect, useRef, useState } from 'react'

const NODES = [
  { id: 'voice', x: 90,  y: 175, label: 'Voice Agent',    sub: 'Retell · Vapi',      color: '#5ce1e6' },
  { id: 'human', x: 90,  y: 60,  label: 'Human Handoff',  sub: 'CRM · Calendar',     color: '#f5c16c' },
  { id: 'orch',  x: 400, y: 175, label: 'Orchestrator',   sub: 'LangGraph · CrewAI', color: '#c084fc' },
  { id: 'rag',   x: 710, y: 80,  label: 'RAG Engine',     sub: 'Pinecone · FAISS',   color: '#f5c16c' },
  { id: 'kb',    x: 710, y: 270, label: 'Knowledge Base', sub: 'OpenAI Embeddings',  color: '#5ce1e6' },
]

const nodePos = Object.fromEntries(NODES.map(n => [n.id, { x: n.x, y: n.y }]))

const PULSES = [
  { id: 'v-o-1', from: 'voice', to: 'orch',  color: '#5ce1e6', dur: '1.8s', begin: '0s'   },
  { id: 'v-o-2', from: 'voice', to: 'orch',  color: '#5ce1e6', dur: '1.8s', begin: '0.9s' },
  { id: 'h-o-1', from: 'human', to: 'orch',  color: '#f5c16c', dur: '2.8s', begin: '1.4s' },
  { id: 'o-r-1', from: 'orch',  to: 'rag',   color: '#c084fc', dur: '1.6s', begin: '0.4s' },
  { id: 'o-r-2', from: 'orch',  to: 'rag',   color: '#c084fc', dur: '1.6s', begin: '1.2s' },
  { id: 'o-k-1', from: 'orch',  to: 'kb',    color: '#c084fc', dur: '2.0s', begin: '0.8s' },
  { id: 'r-o-1', from: 'rag',   to: 'orch',  color: '#f5c16c', dur: '1.4s', begin: '0.6s' },
  { id: 'k-o-1', from: 'kb',    to: 'orch',  color: '#5ce1e6', dur: '2.2s', begin: '1.1s' },
  { id: 'o-h-1', from: 'orch',  to: 'human', color: '#f5c16c', dur: '3.5s', begin: '2.0s' },
]

const UNIQUE_EDGES = [
  { from: 'voice', to: 'orch'  },
  { from: 'human', to: 'orch'  },
  { from: 'orch',  to: 'rag'   },
  { from: 'orch',  to: 'kb'    },
  { from: 'rag',   to: 'orch'  },
  { from: 'kb',    to: 'orch'  },
  { from: 'orch',  to: 'human' },
]

const EVENTS = [
  { text: 'Incoming call · intent classified in 340ms',   type: 'voice' },
  { text: 'RAG query dispatched · 4 chunks retrieved',    type: 'rag'   },
  { text: 'Appointment confirmed via calendar API',        type: 'kb'    },
  { text: 'Human escalation triggered · CRM updated',     type: 'human' },
  { text: 'Knowledge base upsert · 52 new embeddings',    type: 'kb'    },
  { text: 'Confidence 97.3% · answer delivered in 1.1s',  type: 'rag'   },
  { text: 'WebSocket stream active · 38ms round-trip',    type: 'voice' },
  { text: 'n8n workflow fired · invoice queued',          type: 'kb'    },
  { text: 'Multi-step reasoning complete · 3 tool calls', type: 'rag'   },
  { text: 'Restaurant booking confirmed · SMS sent',      type: 'voice' },
  { text: 'Agent handoff · human acknowledged in 8s',     type: 'human' },
  { text: 'LangGraph node completed · state propagated',  type: 'rag'   },
]

const EVENT_COLORS = { voice: '#5ce1e6', rag: '#f5c16c', kb: '#5ce1e6', human: '#c084fc' }

function pathD(from, to) {
  const f = nodePos[from]
  const t = nodePos[to]
  return `M ${f.x} ${f.y} L ${t.x} ${t.y}`
}

export default function AgentFlow() {
  const [log, setLog] = useState(EVENTS.slice(0, 5))
  const tick = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      tick.current = (tick.current + 1) % EVENTS.length
      setLog(prev => [EVENTS[tick.current], ...prev.slice(0, 4)])
    }, 1600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="agentflow">
      <div className="agentflow-diagram">
        <svg viewBox="0 0 800 340" preserveAspectRatio="xMidYMid meet" aria-label="Live AI agent orchestration diagram">
          <defs>
            <filter id="af-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="af-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edge lines — faint connectors */}
          {UNIQUE_EDGES.map(({ from, to }) => (
            <path
              key={`${from}-${to}`}
              d={pathD(from, to)}
              stroke="rgba(244,241,234,0.08)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 6"
            />
          ))}

          {/* Traveling pulse dots */}
          {PULSES.map(p => (
            <circle key={p.id} r="3.5" fill={p.color} filter="url(#af-glow)" opacity="0.85">
              <animateMotion
                path={pathD(p.from, p.to)}
                dur={p.dur}
                begin={p.begin}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </circle>
          ))}

          {/* Nodes */}
          {NODES.map(node => (
            <g key={node.id}>
              {/* Outer glow ring */}
              <circle
                cx={node.x} cy={node.y} r="34"
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                opacity="0.18"
              />
              {/* Node body */}
              <circle
                cx={node.x} cy={node.y} r="26"
                fill="rgba(5,5,10,0.88)"
                stroke={node.color}
                strokeWidth="1.2"
                opacity="0.82"
              />
              {/* Inner fill */}
              <circle
                cx={node.x} cy={node.y} r="18"
                fill={node.color}
                opacity="0.08"
              />
              {/* Pulsing core */}
              <circle cx={node.x} cy={node.y} r="5" fill={node.color} filter="url(#af-glow)">
                <animate attributeName="r"       values="4;6.5;4"    dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.55;1"   dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* Label */}
              <text
                x={node.x} y={node.y + 46}
                textAnchor="middle"
                fill={node.color}
                fontSize="11"
                fontFamily="IBM Plex Mono, monospace"
                letterSpacing="0.04em"
                opacity="0.92"
              >
                {node.label}
              </text>
              <text
                x={node.x} y={node.y + 60}
                textAnchor="middle"
                fill="rgba(244,241,234,0.38)"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
              >
                {node.sub}
              </text>
            </g>
          ))}

          {/* Orchestrator special ring */}
          <circle cx={400} cy={175} r="42" fill="none" stroke="#c084fc" strokeWidth="0.6" opacity="0.28">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 400 175"
              to="360 400 175"
              dur="12s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={400} cy={175} r="52" fill="none" stroke="#c084fc" strokeWidth="0.4" opacity="0.14" strokeDasharray="8 12">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 400 175"
              to="0 400 175"
              dur="18s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      <div className="agentflow-log">
        <div className="log-header">
          <span className="log-live-dot" />
          <span>Live activity</span>
        </div>
        <div className="log-entries">
          {log.map((ev, i) => (
            <div
              key={`${ev.text}-${i}`}
              className={`log-entry ${i === 0 ? 'log-new' : ''}`}
            >
              <span className="log-dot" style={{ background: EVENT_COLORS[ev.type] }} />
              <span className="log-text">{ev.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
