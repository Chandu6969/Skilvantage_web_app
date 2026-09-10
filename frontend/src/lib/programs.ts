// Static SkilVantage program catalogue — shared by Programs, ProgramDetail, Roadmaps and Register.

export interface Program {
  slug: string;
  name: string;
  short: string;
  description: string;
  duration: string;
  level: string;
  prerequisites: string;
  accent: string;
  roadmap: string[];
  skills: string[];
  roles: string[];
  tools: string[];
  projects: string[];
  whoShouldJoin: string[];
}

export const PROGRAMS: Program[] = [
  {
    slug: "data-analyst",
    name: "Data Analyst",
    short: "Data Analyst",
    description:
      "Learn how to transform raw data into meaningful business insights and make data-driven decisions.",
    duration: "3 - 4 months",
    level: "Beginner to Advanced",
    prerequisites:
      "None. We start from absolute basics and take you through to advanced work — basic computer literacy is enough.",
    accent: "sky",
    roadmap: [
      "Excel",
      "SQL",
      "Statistics Fundamentals",
      "Python Basics",
      "Pandas & NumPy",
      "Data Cleaning",
      "Data Visualization",
      "Power BI / Tableau",
      "Business Analytics",
      "Dashboard Development",
      "Real-world Projects",
      "Resume & Interview Preparation",
    ],
    skills: [
      "Excel",
      "SQL",
      "Python",
      "Pandas",
      "NumPy",
      "Statistics",
      "Power BI",
      "Tableau",
      "Data Visualization",
      "Data Cleaning",
      "Business Intelligence",
      "Problem Solving",
      "Communication",
    ],
    roles: [
      "Data Analyst",
      "Business Analyst",
      "BI Analyst",
      "Reporting Analyst",
      "Junior Data Analyst",
    ],
    tools: ["Excel", "MySQL", "Python", "Jupyter", "Power BI", "Tableau", "Git"],
    projects: [
      "Sales Dashboard",
      "Customer Analytics",
      "Financial Analytics",
      "Marketing Analytics",
    ],
    whoShouldJoin: [
      "College students and final-year students",
      "Freshers starting a data career",
      "Non-IT professionals moving into analytics",
      "Anyone who works with reports and spreadsheets",
    ],
  },
  {
    slug: "data-scientist",
    name: "Data Scientist",
    short: "Data Scientist",
    description:
      "Build strong foundations in statistics, machine learning and predictive analytics to solve real-world problems.",
    duration: "5 - 6 months",
    level: "Beginner to Advanced",
    prerequisites:
      "None. Programming and maths are taught from scratch, then built up to advanced modelling.",
    accent: "indigo",
    roadmap: [
      "Python",
      "NumPy",
      "Pandas",
      "SQL",
      "Statistics",
      "Probability",
      "Data Cleaning",
      "Exploratory Data Analysis",
      "Feature Engineering",
      "Data Visualization",
      "Machine Learning",
      "Supervised Learning",
      "Unsupervised Learning",
      "Model Evaluation",
      "Feature Selection",
      "Ensemble Methods",
      "Advanced Machine Learning",
      "Projects",
      "Deployment Basics",
      "Interview Preparation",
    ],
    skills: [
      "Python",
      "SQL",
      "Statistics",
      "Probability",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Scikit-learn",
      "Machine Learning",
      "Feature Engineering",
      "Model Evaluation",
      "EDA",
      "Deployment",
      "Business Understanding",
    ],
    roles: [
      "Data Scientist",
      "Junior Data Scientist",
      "ML Analyst",
      "Predictive Analytics Specialist",
    ],
    tools: ["Python", "Jupyter", "Scikit-learn", "Matplotlib", "Seaborn", "SQL", "Streamlit"],
    projects: [
      "Customer Churn Prediction",
      "House Price Prediction",
      "Fraud Detection",
      "Recommendation System",
    ],
    whoShouldJoin: [
      "Graduates aiming for analytics and ML roles",
      "Analysts wanting to move into modelling",
      "Engineers adding data science to their profile",
      "Professionals switching into data careers",
    ],
  },
  {
    slug: "ai-ml",
    name: "AI / ML Engineer",
    short: "AI / ML",
    description:
      "Develop practical skills to build, train, evaluate and deploy intelligent machine learning systems.",
    duration: "6 months",
    level: "Beginner to Advanced",
    prerequisites:
      "None. Python and the maths for ML are covered from the ground up before advanced topics.",
    accent: "emerald",
    roadmap: [
      "Python Programming",
      "Mathematics for ML",
      "Statistics",
      "Data Processing",
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "CNN",
      "RNN",
      "Transformers",
      "NLP",
      "Computer Vision",
      "Model Optimization",
      "MLOps Fundamentals",
      "Model Deployment",
      "APIs",
      "Cloud Fundamentals",
      "Real-world AI Projects",
      "System Design Basics",
      "Interview Preparation",
    ],
    skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow / PyTorch",
      "NLP",
      "Computer Vision",
      "Neural Networks",
      "Transformers",
      "APIs",
      "Docker",
      "Cloud",
      "MLOps",
      "Model Deployment",
    ],
    roles: [
      "AI Engineer",
      "ML Engineer",
      "Machine Learning Developer",
      "AI Developer",
      "Junior AI Engineer",
    ],
    tools: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "MLflow", "AWS / GCP"],
    projects: [
      "NLP Application",
      "Computer Vision Application",
      "Prediction System",
      "Intelligent Classification System",
    ],
    whoShouldJoin: [
      "Software engineers moving into AI",
      "Data scientists deepening deep-learning skills",
      "Final-year engineering students",
      "Professionals targeting AI product teams",
    ],
  },
  {
    slug: "generative-ai",
    name: "Generative AI",
    short: "Generative AI",
    description:
      "Learn how modern Generative AI systems work and build practical AI applications using LLMs.",
    duration: "4 - 5 months",
    level: "Beginner to Advanced",
    prerequisites:
      "None. Python and AI fundamentals are taught from the start, then LLMs from first principles to advanced.",
    accent: "amber",
    roadmap: [
      "Python Fundamentals",
      "AI Fundamentals",
      "Machine Learning Basics",
      "Deep Learning Basics",
      "NLP Fundamentals",
      "Transformers",
      "LLM Fundamentals",
      "Prompt Engineering",
      "Embeddings",
      "Vector Databases",
      "RAG",
      "LangChain",
      "LLM APIs",
      "Fine-tuning Fundamentals",
      "AI Application Development",
      "Evaluation",
      "Guardrails",
      "Deployment",
      "Real-world GenAI Projects",
      "Interview Preparation",
    ],
    skills: [
      "Python",
      "LLMs",
      "Prompt Engineering",
      "Embeddings",
      "Vector Databases",
      "RAG",
      "LangChain",
      "LLM APIs",
      "AI Evaluation",
      "Fine-tuning",
      "AI Application Development",
      "Deployment",
    ],
    roles: [
      "Generative AI Engineer",
      "GenAI Developer",
      "LLM Application Developer",
      "AI Application Engineer",
    ],
    tools: ["Python", "LangChain", "OpenAI API", "Hugging Face", "Pinecone / FAISS", "FastAPI"],
    projects: ["RAG Chatbot", "Document Q&A", "AI Assistant", "Knowledge Base"],
    whoShouldJoin: [
      "Developers building AI-powered products",
      "Analysts and engineers exploring LLMs",
      "Students targeting GenAI roles",
      "Professionals modernising their skill set",
    ],
  },
  {
    slug: "agentic-ai",
    name: "Agentic AI",
    short: "Agentic AI",
    description:
      "Learn how to build intelligent AI agents that can reason, plan, use tools and complete multi-step tasks.",
    duration: "4 - 5 months",
    level: "Beginner to Advanced",
    prerequisites:
      "None. Python, APIs and LLM basics are covered in-program before advanced agent systems.",
    accent: "cyan",
    roadmap: [
      "Python",
      "AI Fundamentals",
      "LLM Fundamentals",
      "Prompt Engineering",
      "Function Calling",
      "Tool Usage",
      "Agent Architecture",
      "Memory",
      "Planning",
      "Reasoning",
      "RAG",
      "Multi-Agent Systems",
      "Agent Orchestration",
      "APIs & Tools",
      "Workflow Automation",
      "Agent Evaluation",
      "Security & Guardrails",
      "Deployment",
      "Real-world Agent Projects",
      "Advanced Agentic AI Systems",
    ],
    skills: [
      "Python",
      "LLMs",
      "Prompt Engineering",
      "Function Calling",
      "Tool Calling",
      "RAG",
      "Agents",
      "Agent Memory",
      "Planning",
      "Multi-Agent Systems",
      "APIs",
      "Automation",
      "Evaluation",
      "Guardrails",
      "Deployment",
    ],
    roles: [
      "Agentic AI Engineer",
      "AI Agent Developer",
      "GenAI Engineer",
      "AI Automation Engineer",
      "AI Solutions Developer",
    ],
    tools: ["Python", "LangGraph", "LangChain", "Vector DBs", "FastAPI", "Docker", "Observability"],
    projects: [
      "Research Agent",
      "Customer Support Agent",
      "Multi-Agent Workflow",
      "AI Automation System",
    ],
    whoShouldJoin: [
      "Engineers automating real workflows",
      "GenAI developers moving to agents",
      "Professionals building AI solutions",
      "Advanced learners in AI teams",
    ],
  },
];

export const programBySlug = (slug: string) => PROGRAMS.find((p) => p.slug === slug);

export const PROGRAM_LABEL: Record<string, string> = Object.fromEntries(
  PROGRAMS.map((p) => [p.slug, p.name]),
);

export const ROADMAP_STAGES = [
  { title: "Foundation", detail: "Tools, language basics and the mindset the role needs." },
  { title: "Core Skills", detail: "The everyday working skills employers test you on." },
  { title: "Advanced Skills", detail: "Depth that separates a candidate from a hire." },
  { title: "Projects", detail: "Real-time projects on live data, reviewed work." },
  { title: "Portfolio", detail: "GitHub, dashboards and case studies you can show." },
  { title: "Resume", detail: "A resume written around outcomes, not keywords." },
  { title: "Interview Preparation", detail: "Mock technical, HR and communication rounds." },
  { title: "Job Ready", detail: "You can learn, apply, communicate and perform." },
];

export const MOTIVATIONAL_QUOTES = [
  "Your future is created by what you learn today.",
  "Learn today. Build tomorrow.",
  "Skills create opportunities.",
  "Become job ready, not just certificate ready.",
  "Communication is the bridge between knowledge and success.",
  "Don't just learn technology. Learn how to apply it.",
  "Your career advantage starts with the right skills.",
];

export const FAQS = [
  {
    q: "What courses does SkilVantage offer?",
    a: "Five career programs: Data Analyst, Data Scientist, AI/ML Engineer, Generative AI and Agentic AI — each built around industry work, not just theory.",
  },
  {
    q: "Who can join?",
    a: "College students, final-year students, recent graduates, freshers and working professionals from both IT and non-IT backgrounds.",
  },
  {
    q: "Do I need programming experience?",
    a: "No. Every program runs from beginner to advanced — programming is taught from scratch, then built up to advanced, job-level work.",
  },
  {
    q: "Are programs available for students?",
    a: "Yes. The student track is paced around college schedules with weekend and evening batches.",
  },
  {
    q: "Are programs available for working professionals?",
    a: "Yes. The professional track focuses on career transition, with flexible batch timings and transition-focused projects.",
  },
  {
    q: "Can I switch careers into AI?",
    a: "Many of our professional learners come from non-AI roles. We map your current experience to a target role and build the missing skills.",
  },
  {
    q: "Do you provide projects?",
    a: "Yes. Every program includes real-time projects on live datasets and industry problem statements, reviewed by a mentor.",
  },
  {
    q: "Do you provide interview preparation?",
    a: "Yes — technical mock interviews, HR rounds, resume review and LinkedIn/GitHub portfolio guidance.",
  },
  {
    q: "Do you provide communication training?",
    a: "Yes. Spoken English, presentation skills, technical explanation and interview communication are part of every program.",
  },
  { q: "Can I learn online?", a: "Yes — live online batches with recordings and mentor support." },
  {
    q: "Can I learn offline?",
    a: "Offline and hybrid options are available for selected batches. Mention your preference during registration.",
  },
  {
    q: "How do I register?",
    a: "Use the Register page: choose your learner type, pick a program, and complete the form. It takes about three minutes.",
  },
  {
    q: "How will I be contacted after registration?",
    a: "Our career team reviews your details and contacts you by phone or email, usually within two working days.",
  },
];
