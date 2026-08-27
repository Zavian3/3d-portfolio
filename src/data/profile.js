export const profile = {
  name: 'Muhammad A. Rafay',
  shortName: 'Rafay',
  handle: 'Zavian3',
  title: 'Senior AI/ML Engineer',
  location: 'Lahore, Pakistan',
  availability: 'Open to remote · hybrid · senior AI/ML roles',
  email: 'mabdulrafayzav@gmail.com',
  headline: 'I ship production AI systems that answer calls, retrieve knowledge, and keep running at 3 AM.',
  summary:
    'I build end-to-end ML systems that ship to production — not notebooks, not demos. Over 4+ years I have architected voice agents, RAG pipelines, and multi-agent workflows that serve real users across continents. Reliability, observability, and the unglamorous engineering that keeps models honest matter more to me than clever slides.',
  manifesto: [
    'Systems over prototypes. Most of what I build runs unattended, scrapes data that fights back, or talks to models that occasionally hallucinate.',
    'I author Claude Code skills, MCP servers, and agentic workflows so expertise compounds instead of living in one-off scripts.',
    'When I am not shipping, I am reading Iqbal and Ghalib, photographing Lahore, or tracing Pakistani cultural heritage.',
  ],
  links: {
    github: 'https://github.com/Zavian3',
    linkedin: 'https://www.linkedin.com/in/mabdulrafayzav',
    stackoverflow: 'https://stackoverflow.com/users/20888659/muhammad-abdulrafay',
    netronflow: 'https://netronflow.com',
    email: 'mailto:mabdulrafayzav@gmail.com',
  },
  stats: [
    { value: '4+', label: 'Years shipping ML' },
    { value: '1K+', label: 'Daily predictions' },
    { value: '200+', label: 'Voice calls / day' },
    { value: '97%', label: 'RAG relevance' },
  ],
  education: [
    {
      school: 'Lahore University of Management Sciences',
      short: 'LUMS',
      program: 'MS Artificial Intelligence',
    },
    {
      school: 'National University of Computer and Emerging Sciences',
      short: 'FAST-NUCES',
      program: 'BS Data Science',
      years: '2020 — 2024',
    },
  ],
  experience: [
    {
      role: 'Artificial Intelligence Engineer',
      company: 'Novion Systems',
      period: 'Jan 2026 — Present',
      place: 'Adelaide, SA · Remote',
      points: [
        'Backend services and automation systems in Python and Django for operational efficiency.',
        'Workflow pipelines with n8n and Make.com, REST APIs, and React dashboards for automation control rooms.',
      ],
    },
    {
      role: 'Building',
      company: 'NetronFlow',
      period: '2025 — Present',
      place: 'Lahore · netronflow.com',
      href: 'https://netronflow.com',
      points: [
        'AI implementation partner for voice agents, AI receptionists, restaurant order-takers, and operations automation.',
        'Human-escalation paths, staff training, and systems that sit on top of existing CRMs instead of ripping them out.',
      ],
    },
    {
      role: 'Senior AI/ML Engineer',
      company: 'Metaviz',
      period: 'May 2025 — Oct 2025',
      place: 'Lahore, Pakistan',
      points: [
        'Led AI/ML execution and mentored engineers across NLP, computer vision, and automation.',
        'Architected production systems with LangChain, LangGraph, OpenAI, and Pinecone; owned delivery quality.',
      ],
    },
    {
      role: 'Associate AI Engineer',
      company: 'Greyfibre',
      period: 'Jun 2024 — Sep 2025',
      place: 'Seattle, WA · Remote',
      points: [
        'Moved from full-stack Django internals into AI-driven inbox automation for an email growth platform.',
        'Migrated legacy work into n8n workflows, integrated external APIs, and demoed automations to stakeholders.',
      ],
    },
    {
      role: 'Associate AI & ML Engineer',
      company: 'AmentoTech',
      period: 'Mar 2024 — May 2025',
      place: 'Lahore, Pakistan',
      points: [
        'Custom AI chatbots, model training with LangChain and TensorFlow, and production interaction systems.',
      ],
    },
    {
      role: 'Data Scientist',
      company: 'MetaViz Pro',
      period: 'Dec 2021 — Mar 2024',
      place: 'Lahore, Pakistan',
      points: [
        'Scraping, analysis, and visualization pipelines that turned messy operational data into decisions.',
      ],
    },
  ],
  projects: [
    {
      id: 'voice',
      title: 'Voice Intelligence System',
      tag: 'Voice AI',
      metric: '200+ daily calls · 75% fewer interventions',
      description:
        'Retell-powered conversational agents for customer service and scheduling. Async Python, WebSockets, and distributed queues keep latency under two seconds while human escalation stays a first-class path.',
      stack: ['Retell AI', 'OpenAI', 'WebSockets', 'Python'],
      href: 'https://netronflow.com',
    },
    {
      id: 'rag',
      title: 'Enterprise RAG',
      tag: 'Retrieval',
      metric: '97% relevance · 1,000+ docs / day',
      description:
        'Multi-modal document intelligence over PDF, CSV, and XLSX with hybrid dense + sparse retrieval. Built for teams that need answers, not another chatbot demo.',
      stack: ['LangChain', 'Pinecone', 'FAISS', 'OpenAI'],
    },
    {
      id: 'netron',
      title: 'NetronFlow',
      tag: 'Product',
      metric: 'Voice · reception · ops automation',
      description:
        'Practical AI systems for clinics, hospitality, restaurants, and service businesses: agents that answer, qualify, book, and hand off — with training included.',
      stack: ['Vapi', 'n8n', 'LangChain', 'Supabase'],
      href: 'https://netronflow.com',
    },
    {
      id: 'hr360',
      title: 'HR-360 Analyzer',
      tag: 'FYP',
      metric: '~80% HR task automation',
      description:
        'FAST-NUCES capstone: computer vision and NLP for hiring, performance tracking, and teaming — an affordable HRMS for startups that cannot staff a full HR function.',
      stack: ['Django REST', 'CV', 'NLP', 'Dashboards'],
      href: 'https://github.com/Zavian3/FYP_BE',
    },
    {
      id: 'rynova',
      title: 'Rynova AI Dashboard',
      tag: 'Agents',
      metric: 'Client ops for appointment agents',
      description:
        'Streamlit control plane for AI appointment businesses: onboarding, CRM/calendar wiring, reminder logic, and portfolio analytics on Supabase.',
      stack: ['Python', 'Streamlit', 'Supabase', 'Twilio'],
      href: 'https://github.com/Zavian3/rynova-ai',
    },
    {
      id: 'fight',
      title: 'MMA Fight Predictor',
      tag: 'Sports ML',
      metric: '10K+ fight records',
      description:
        'Ensemble models over historical fight data, with RAG for scouting notes. A playground for feature work, evaluation, and making predictions you can actually explain.',
      stack: ['LangChain', 'Pinecone', 'Ensembles', 'Python'],
      href: 'https://github.com/Zavian3/FightBot',
    },
  ],
  skills: [
    {
      group: 'AI / ML',
      items: ['PyTorch', 'TensorFlow', 'LangChain', 'LangGraph', 'CrewAI', 'Hugging Face', 'scikit-learn'],
    },
    {
      group: 'LLMs & Agents',
      items: ['Claude', 'OpenAI', 'Gemini', 'MCP servers', 'SKILL.md', 'RAG', 'Fine-tuning'],
    },
    {
      group: 'Voice & Realtime',
      items: ['Retell AI', 'Vapi', 'WebSockets', 'Async Python', 'Twilio'],
    },
    {
      group: 'Backend',
      items: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Redis'],
    },
    {
      group: 'MLOps',
      items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'MLflow', 'n8n', 'Make'],
    },
    {
      group: 'Data & Search',
      items: ['Pinecone', 'FAISS', 'Pandas', 'Hybrid retrieval', 'Feature pipelines'],
    },
  ],
  certifications: [
    { name: 'Multi AI Agent Systems with CrewAI', org: 'CrewAI', year: '2024', href: 'https://learn.deeplearning.ai/accomplishments/6ac64b78-8ebf-49c5-980f-bd8eed1fb58a' },
    { name: 'AI Agents in LangGraph', org: 'DeepLearning.AI', year: '2024', href: 'https://learn.deeplearning.ai/accomplishments/03a64705-aa19-4abc-8c61-564193424cf3' },
    { name: 'LangChain: Chat with your Data', org: 'DeepLearning.AI', year: '2024', href: 'https://learn.deeplearning.ai/accomplishments/7f00d93b-0190-4eee-8e6f-de28b3f803f4' },
    { name: 'AWS Cloud Foundations', org: 'Amazon Web Services', year: '2025', href: 'https://www.credly.com/badges/bddba51e-6975-4759-bb81-29d311373404/public_url' },
  ],
}
