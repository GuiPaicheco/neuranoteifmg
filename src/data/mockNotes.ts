export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  priority: Priority;
}

export interface Attachment {
  id: string;
  name: string;
  type: "pdf" | "image" | "audio" | "doc";
  size: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  summary: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  connections: string[];
  tasks: Task[];
  attachments: Attachment[];
  history: HistoryEntry[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = ["Aulas", "Trabalhos", "Provas", "Projetos", "Pesquisa", "Ideias"] as const;

export const initialNotes: Note[] = [
  {
    id: "n1",
    title: "Neural Networks — Foundations",
    content:
      "A neural network is a layered system of weighted connections inspired by biological neurons. Key building blocks: input layer, hidden layers, activations (ReLU, GELU), and a loss function optimized via backpropagation.\n\nTraining alternates forward passes (predictions) with backward passes (gradient updates). Choice of optimizer (SGD, Adam) and learning-rate schedule dramatically affect convergence.",
    keywords: ["deep-learning", "backprop", "ReLU", "optimization"],
    category: "Study",
    connections: ["n2", "n4", "n6"],
    tasks: [
      { id: "t1", description: "Re-derive backprop on a 2-layer MLP", completed: true, priority: "high" },
      { id: "t2", description: "Implement Adam from scratch", completed: false, priority: "medium" },
      { id: "t3", description: "Read Goodfellow Ch. 6", completed: false, priority: "low" },
    ],
    attachments: [
      { id: "a1", name: "lecture-03.pdf", type: "pdf", size: "2.4 MB" },
      { id: "a2", name: "backprop-diagram.png", type: "image", size: "612 KB" },
    ],
    history: [
      { id: "h1", timestamp: "2026-04-29 14:02", action: "edited", summary: "Added section on optimizers" },
      { id: "h2", timestamp: "2026-04-28 09:11", action: "linked", summary: "Connected to 'Transformers Deep Dive'" },
      { id: "h3", timestamp: "2026-04-27 18:45", action: "created", summary: "Note created" },
    ],
    location: "Library — Floor 3",
    createdAt: "2026-04-27",
    updatedAt: "2026-04-29",
  },
  {
    id: "n2",
    title: "Transformers Deep Dive",
    content:
      "Self-attention computes pairwise relevance between tokens. Multi-head attention lets the model attend to different subspaces in parallel. Positional encodings inject order information.\n\nThe original 'Attention is All You Need' paper replaced recurrence with attention, enabling massive parallelization.",
    keywords: ["attention", "transformers", "NLP"],
    category: "Research",
    connections: ["n1", "n6"],
    tasks: [
      { id: "t4", description: "Sketch attention math on whiteboard", completed: true, priority: "medium" },
      { id: "t5", description: "Compare RoPE vs sinusoidal embeddings", completed: false, priority: "high" },
    ],
    attachments: [{ id: "a3", name: "attention-paper.pdf", type: "pdf", size: "1.1 MB" }],
    history: [
      { id: "h4", timestamp: "2026-04-29 10:20", action: "edited", summary: "Added RoPE reference" },
      { id: "h5", timestamp: "2026-04-26 12:00", action: "created", summary: "Note created" },
    ],
    location: "Home Office",
    createdAt: "2026-04-26",
    updatedAt: "2026-04-29",
  },
  {
    id: "n3",
    title: "Q2 Product Roadmap",
    content:
      "Theme: ship the connected-graph view to all users. Three milestones — alpha (internal), beta (waitlist), GA. Coordinate with design on iconography and with infra on graph-layout perf.",
    keywords: ["roadmap", "planning", "product"],
    category: "Work",
    connections: ["n5"],
    tasks: [
      { id: "t6", description: "Finalize alpha scope with design", completed: false, priority: "high" },
      { id: "t7", description: "Send waitlist email draft", completed: false, priority: "medium" },
      { id: "t8", description: "Prep KPIs dashboard", completed: true, priority: "low" },
    ],
    attachments: [{ id: "a4", name: "roadmap-v3.doc", type: "doc", size: "88 KB" }],
    history: [
      { id: "h6", timestamp: "2026-04-30 08:30", action: "edited", summary: "Updated milestones" },
      { id: "h7", timestamp: "2026-04-20 15:10", action: "created", summary: "Note created" },
    ],
    location: "HQ — Meeting Room B",
    createdAt: "2026-04-20",
    updatedAt: "2026-04-30",
  },
  {
    id: "n4",
    title: "Morning Routine Experiments",
    content:
      "Trying a 5-week experiment: 20-min walk, journaling, then deep work block. Tracking energy and focus daily on a 1–5 scale.",
    keywords: ["habits", "routine", "wellness"],
    category: "Personal",
    connections: ["n1"],
    tasks: [
      { id: "t9", description: "Log week-2 ratings", completed: true, priority: "low" },
      { id: "t10", description: "Try cold shower variant", completed: false, priority: "low" },
    ],
    attachments: [],
    history: [
      { id: "h8", timestamp: "2026-04-29 07:05", action: "edited", summary: "Added week-2 notes" },
      { id: "h9", timestamp: "2026-04-15 06:50", action: "created", summary: "Note created" },
    ],
    location: "Apartment",
    createdAt: "2026-04-15",
    updatedAt: "2026-04-29",
  },
  {
    id: "n5",
    title: "User Research Synthesis",
    content:
      "12 interviews surfaced three themes: (1) people lose context between notes, (2) tasks get buried, (3) search alone isn't enough — they want spatial relationships.",
    keywords: ["research", "interviews", "themes"],
    category: "Work",
    connections: ["n3", "n6"],
    tasks: [
      { id: "t11", description: "Cluster quotes in Miro", completed: true, priority: "medium" },
      { id: "t12", description: "Share readout with team", completed: false, priority: "high" },
    ],
    attachments: [
      { id: "a5", name: "interview-clips.audio", type: "audio", size: "14 MB" },
      { id: "a6", name: "affinity-map.png", type: "image", size: "1.8 MB" },
    ],
    history: [
      { id: "h10", timestamp: "2026-04-28 16:40", action: "edited", summary: "Added theme 3" },
      { id: "h11", timestamp: "2026-04-22 10:00", action: "created", summary: "Note created" },
    ],
    location: "Coffee Shop — Mission St",
    createdAt: "2026-04-22",
    updatedAt: "2026-04-28",
  },
  {
    id: "n6",
    title: "Knowledge Graphs vs Vector DBs",
    content:
      "Graphs encode explicit relationships; vector DBs encode latent semantic similarity. Best systems combine both: graph for structure, vectors for fuzzy retrieval.",
    keywords: ["graphs", "embeddings", "retrieval"],
    category: "Ideas",
    connections: ["n1", "n2", "n5"],
    tasks: [
      { id: "t13", description: "Prototype hybrid retrieval", completed: false, priority: "high" },
    ],
    attachments: [],
    history: [
      { id: "h12", timestamp: "2026-04-30 11:11", action: "created", summary: "Note created" },
    ],
    location: "Park bench",
    createdAt: "2026-04-30",
    updatedAt: "2026-04-30",
  },
];
