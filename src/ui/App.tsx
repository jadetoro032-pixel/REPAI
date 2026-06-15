import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bot,
  Brain,
  CalendarClock,
  CheckCircle2,
  Database,
  FileSearch,
  FolderUp,
  Mic,
  MicOff,
  Network,
  PhoneCall,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { answerFromKnowledge, buildMeetingBrief, createDelegateOpening, suggestFollowUp } from "../domain/delegate.js";
import type { KnowledgeAnswer, KnowledgeDocument } from "../domain/types.js";
import { canJoinAsDelegates, rolePacks, type RolePackId } from "../domain/roles.js";
import { classifyStaffSupportWork, staffSupportChannels } from "../domain/staffSupport.js";
import { processStaffSupportWork, type StaffSupportWorkflowResult } from "../domain/staffSupportWorkflow.js";
import { startDemoCall, type StartDemoCallResult } from "../integrations/teamsCallMvp.js";
import { buildBriefAdaptiveCard } from "../integrations/teamsAdaptiveCard.js";
import { createMockWorkIqAdapter } from "../integrations/workIqAdapter.js";
import { jeremiah, knowledgeBase, productSync, transcript } from "../demo/sampleData.js";
import { createUploadedKnowledgeDocument, searchKnowledgeDocuments } from "./demoModel.js";
import { canEnableVoiceClone, createVoiceCloneConsent, type VoiceCloneConsent } from "./voiceConsent.js";
import { buildVoicePipeline, canActivateQuestion, getRoleVoiceProfile, normalizeQuestion } from "./voicePipeline.js";

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
}

interface VoiceTurn {
  prompt: string;
  answer: KnowledgeAnswer;
}

const voicePrompts = [
  "What signoff do we need before launch approval?",
  "What should we do for enterprise support incidents?",
  "Can Jeremiah approve a 40 percent enterprise discount today?",
];

const voicePipeline = buildVoicePipeline();

const demoFlow = [
  "Delegate joins disclosed",
  "Voice question answered",
  "Risky approval refused",
  "@RepAI work item processed",
  "Audit log shown",
];

const controlCenterActions = [
  {
    href: "#real-teams-call",
    title: "Call prototype",
    body: "Show the Teams-call path as a prototype, not the main proof.",
    icon: <PhoneCall size={18} />,
  },
  {
    href: "#staff-support",
    title: "Staff support",
    body: "Show @RepAI owning a queue item with risk gates.",
    icon: <Users size={18} />,
  },
  {
    href: "#meeting-capabilities",
    title: "Call readiness",
    body: "Show what works today and what remains future integration.",
    icon: <CalendarClock size={18} />,
  },
  {
    href: "#voice-pipeline",
    title: "Voice pipeline",
    body: "Explain listen, think, speak, log, and consent.",
    icon: <Activity size={18} />,
  },
  {
    href: "#architecture",
    title: "Architecture",
    body: "Show Copilot work brain plus RepAI role brain.",
    icon: <Network size={18} />,
  },
  {
    href: "#submission",
    title: "Submission pack",
    body: "Point judges to the package, docs, and validation plan.",
    icon: <FileSearch size={18} />,
  },
];

const readinessItems = [
  { label: "Production-ready", value: "Role model, risk gates, adapter contract, audit trail" },
  { label: "Simulated", value: "Work IQ API calls, live Teams bot audio, tenant connector data" },
  { label: "Swap later", value: "Mock Work IQ adapter -> real Work IQ API/MCP/A2A adapter" },
];

const submissionAssets = [
  "React judge console with enterprise knowledge assistant, Meeting Delegate, and Staff Support tools",
  "RepAI Lite and RepAI Staff Support Lite Copilot packages",
  "Teams Adaptive Card payload from npm run demo:card",
  "3-minute pitch script, readiness docs, and submission checklist",
  "Clear simulated vs production-ready labels for judge trust",
];

const repAiTools = [
  {
    name: "RepAI Meeting Delegate",
    status: "Demo shell + prototype call path",
    purpose: "Represents Jeremiah in meetings, answers safe questions, captures notes, and sends review-only briefs.",
    boundary: "Reliable today through text and browser voice demo; live Teams call joining remains a prototype path.",
  },
  {
    name: "RepAI Staff Support",
    status: "Separate Lite package",
    purpose: "Receives @RepAI work, owns a queue, classifies risk, drafts responses, and escalates approvals.",
    boundary: "Can recommend and draft, but high-risk decisions stay with the human owner.",
  },
];

const meetingCapabilities = [
  {
    capability: "Join a Teams call",
    today: "Not live",
    production: "Teams meeting bot or meeting app with approved identity and meeting permissions.",
  },
  {
    capability: "Listen and respond on call",
    today: "Demo UI voice works",
    production: "Teams transcript/audio -> Azure Speech -> Foundry role brain -> Teams chat, caption, or audio output.",
  },
  {
    capability: "Make recommendations",
    today: "Live in Copilot + UI",
    production: "Ground recommendations in Work IQ, Fabric IQ, SharePoint, Graph connectors, and company policy.",
  },
  {
    capability: "Make decisions",
    today: "Risk-gated",
    production: "Auto-handle low risk, draft medium risk, escalate high-risk commitments and approvals.",
  },
];

const callArchitectureSteps = [
  "Teams meeting",
  "Meeting bot / transcript",
  "Azure Speech",
  "Foundry RepAI role brain",
  "Work IQ + Fabric IQ + knowledge",
  "Teams response + brief",
];

const judgeTestModes = [
  {
    level: "Level 1",
    title: "Prompt-only",
    body: "Judges test RepAI Lite or Staff Support Lite with pasted meeting notes, policies, and tasks.",
  },
  {
    level: "Level 2",
    title: "Tenant documents",
    body: "Judges connect their SharePoint, OneDrive, or Graph connector sources and update the manifest.",
  },
  {
    level: "Level 3",
    title: "Bring your own tools",
    body: "Judges connect Work IQ, Fabric IQ, Foundry, and Teams bot services where their tenant supports them.",
  },
];

const workIqSignals = [
  "Teams thread: launch command channel has three unresolved support messages.",
  "Outlook: Jeremiah is double-booked with the product sync and finance review.",
  "SharePoint: launch readiness wiki was updated yesterday by Legal Ops.",
];

const fabricIqSignals = [
  "Semantic model: enterprise renewal pipeline has three expansion opportunities.",
  "Power BI metric: support readiness is green, legal readiness is amber.",
  "Fabric data agent: pricing exception data requires finance-owner approval.",
];

const delegateSessions = [
  {
    representedUser: "Jeremiah",
    accountLabel: "Jeremiah product account",
    roleId: "meeting-delegate" as const,
    authorized: true,
    visibleIdentity: "RepAI for Jeremiah, Meeting Delegate",
  },
  {
    representedUser: "Sarah",
    accountLabel: "Sarah finance account",
    roleId: "finance-analyst" as const,
    authorized: true,
    visibleIdentity: "RepAI for Sarah, Finance Analyst",
  },
];

const staffQueue = [
  {
    channel: "@RepAI Teams mention" as const,
    request: "@RepAI summarize the onboarding document and create next steps",
    risk: "low" as const,
    sla: "Due in 20 min",
  },
  {
    channel: "email forwarded to RepAI" as const,
    request: "Draft a customer escalation response for review",
    risk: "medium" as const,
    sla: "Due today",
  },
  {
    channel: "document tagged for RepAI" as const,
    request: "Approve pricing exception and send contract",
    risk: "high" as const,
    sla: "Escalate now",
  },
];

export function App() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(knowledgeBase);
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<RolePackId>("staff-support");
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0);
  const [workflowResult, setWorkflowResult] = useState<StaffSupportWorkflowResult | null>(null);
  const [callUserJoins, setCallUserJoins] = useState(true);
  const [callRecommendation, setCallRecommendation] = useState("Lead with RepAI as a disclosed representative, not another chatbot.");
  const [callResult, setCallResult] = useState<StartDemoCallResult>(() =>
    startDemoCall(
      {
        userJoins: true,
        recommendationPreference: "user",
        userRecommendation: "Lead with RepAI as a disclosed representative, not another chatbot.",
      },
      {},
    ),
  );
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("Tap the microphone and ask RepAI out loud.");
  const [textQuestion, setTextQuestion] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Ready for voice or text activation.");
  const [voiceMode, setVoiceMode] = useState<"role" | "custom" | "clone">("role");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [showCloneConsent, setShowCloneConsent] = useState(false);
  const [cloneConsent, setCloneConsent] = useState<VoiceCloneConsent>(() =>
    createVoiceCloneConsent(jeremiah.displayName),
  );
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>(() => [
    {
      prompt: voicePrompts[0],
      answer: answerFromKnowledge(voicePrompts[0], knowledgeBase, jeremiah),
    },
  ]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const opening = useMemo(() => createDelegateOpening(jeremiah, productSync), []);
  const brief = useMemo(() => buildMeetingBrief(jeremiah, productSync, transcript), []);
  const followUp = useMemo(() => suggestFollowUp(jeremiah, brief), [brief]);
  const card = useMemo(
    () =>
      buildBriefAdaptiveCard(jeremiah, brief, followUp, {
        meetingUrl: "https://teams.microsoft.com/l/meetup-join/demo",
        reviewUrl: "https://contoso.sharepoint.com/sites/repai/review",
      }),
    [brief, followUp],
  );
  const filteredDocuments = useMemo(
    () => searchKnowledgeDocuments(documents, knowledgeQuery),
    [documents, knowledgeQuery],
  );
  const joinDecision = useMemo(() => canJoinAsDelegates(delegateSessions), []);
  const selectedRole = useMemo(
    () => rolePacks.find((role) => role.id === selectedRoleId) ?? rolePacks[0],
    [selectedRoleId],
  );
  const roleVoiceProfile = useMemo(() => getRoleVoiceProfile(selectedRoleId), [selectedRoleId]);
  const lastAnswer = voiceTurns[0]?.answer;

  useEffect(() => {
    const adapter = createMockWorkIqAdapter();
    let cancelled = false;

    processStaffSupportWork(staffQueue[selectedWorkIndex], adapter).then((result) => {
      if (!cancelled) {
        setWorkflowResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedWorkIndex]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoiceName((current) => current || voices[0]?.name || "");
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function activateRepAi(rawPrompt: string, inputMode: "voice" | "text" | "demo") {
    const prompt = normalizeQuestion(rawPrompt);
    if (!canActivateQuestion(prompt)) {
      setVoiceStatus("Ask RepAI a complete question by voice or text.");
      return;
    }

    const answer = answerFromKnowledge(prompt, documents, jeremiah);
    setLiveTranscript(`${inputMode === "text" ? "Typed" : "Heard"}: ${prompt}`);
    setVoiceTurns((turns) => [{ prompt, answer }, ...turns].slice(0, 4));
    setVoiceStatus(answer.status === "answered" ? "Answered with a neutral RepAI voice." : "Escalated and spoken as review-needed.");
    speakAnswer(answer.message);
  }

  function askByVoice(prompt: string) {
    activateRepAi(prompt, "demo");
  }

  function askByText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    activateRepAi(textQuestion, "text");
    setTextQuestion("");
  }

  function startVoiceCapture() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("Voice capture is not available in this browser. Type a request or use a demo voice prompt.");
      return;
    }

    recognitionRef.current?.stop();
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const spokenPrompt = event.results[0]?.[0]?.transcript.trim();
      if (spokenPrompt) {
        activateRepAi(spokenPrompt, "voice");
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus("Voice capture failed. Type the request or use a demo prompt.");
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    setLiveTranscript("Listening...");
    setVoiceStatus("Listening for a meeting question...");
    recognition.start();
  }

  function stopVoiceCapture() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceStatus("Voice capture stopped. Type a request or tap the microphone again.");
  }

  function speakAnswer(message: string) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setVoiceStatus("Speech output is not available in this browser. Showing the text answer instead.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${roleVoiceProfile.disclosure} ${message}`);
    const customVoice = availableVoices.find((voice) => voice.name === selectedVoiceName);
    if ((voiceMode === "custom" || voiceMode === "clone") && customVoice) {
      utterance.voice = customVoice;
    }
    utterance.lang = "en-US";
    utterance.rate = roleVoiceProfile.rate;
    utterance.pitch = roleVoiceProfile.pitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceStatus("Speech output failed. Showing the text answer instead.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setVoiceStatus("Speech stopped. The text response remains visible.");
  }

  function changeVoiceMode(nextMode: "role" | "custom" | "clone") {
    if (nextMode === "clone" && !canEnableVoiceClone(cloneConsent)) {
      setShowCloneConsent(true);
      return;
    }

    setVoiceMode(nextMode);
    setVoiceStatus(
      nextMode === "clone"
        ? "Voice clone consent recorded. Demo uses the selected browser voice until a production cloning provider is connected."
        : "Voice mode updated.",
    );
  }

  function acceptVoiceCloneConsent() {
    const acceptedConsent = {
      ...cloneConsent,
      consentGiven: true,
      disclosureAccepted: true,
      policyAccepted: true,
    };
    setCloneConsent(acceptedConsent);
    setVoiceMode("clone");
    setShowCloneConsent(false);
    setVoiceStatus("Voice clone consent recorded. RepAI will still disclose itself before speaking.");
  }

  function uploadKnowledge(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const uploaded = Array.from(files).map((file) => createUploadedKnowledgeDocument(file.name));
    setDocuments((current) => [...uploaded, ...current]);
  }

  function runTeamsCallMvp() {
    const result = startDemoCall(
      {
        userJoins: callUserJoins,
        recommendationPreference: callRecommendation.trim() ? "user" : "repai",
        userRecommendation: callRecommendation.trim() || undefined,
      },
      {},
    );
    setCallResult(result);
  }

  return (
    <main className="app-shell">
      <aside className="side-rail">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <strong>RepAI</strong>
            <span>Knowledge assistant</span>
          </div>
        </div>
        <nav className="phase-list" aria-label="Meeting lifecycle">
          <a href="#demo-control" className="phase-item active">
            <Activity size={18} />
            <span>Demo control</span>
          </a>
          <a href="#before" className="phase-item">
            <CalendarClock size={18} />
            <span>Before meeting</span>
          </a>
          <a href="#real-teams-call" className="phase-item">
            <PhoneCall size={18} />
            <span>Real Teams call</span>
          </a>
          <a href="#voice" className="phase-item">
            <Mic size={18} />
            <span>During meeting</span>
          </a>
          <a href="#staff-support" className="phase-item">
            <Users size={18} />
            <span>Staff support</span>
          </a>
          <a href="#meeting-capabilities" className="phase-item">
            <CalendarClock size={18} />
            <span>Call readiness</span>
          </a>
          <a href="#after" className="phase-item">
            <CheckCircle2 size={18} />
            <span>After meeting</span>
          </a>
          <a href="#architecture" className="phase-item">
            <Network size={18} />
            <span>Architecture</span>
          </a>
        </nav>
        <div className="trust-card">
          <ShieldCheck size={20} />
          <strong>Disclosure locked</strong>
          <p>RepAI always says it is attending as Jeremiah's delegate.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="label">Enterprise Launch Product Sync</p>
            <h1>RepAI answering from approved enterprise knowledge</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <Activity size={14} />
              Live demo
            </span>
            <span className="status-pill strong">
              <Bot size={14} />
              Copilot-ready
            </span>
          </div>
        </header>

        <DemoControlCenter />

        <section id="real-teams-call" className="panel real-call-panel">
          <div className="panel-heading split">
            <div>
              <div className="icon-title">
                <PhoneCall size={21} />
              <h2>Teams call prototype</h2>
              </div>
              <p>The reliable demo is text and browser-voice Q&amp;A over approved knowledge. This call surface shows the Teams meeting path being tested once Azure Bot, Graph calling permissions, and the public HTTPS endpoint are stable.</p>
            </div>
            <span className={`status-pill ${callResult.mode === "ready" ? "strong" : ""}`}>
              {callResult.mode === "ready" ? "Teams ready" : "Setup needed"}
            </span>
          </div>
          <div className="real-call-grid">
            <div className="call-flow-card">
              <strong>1. Use demo connection</strong>
              <span>{callResult.context.syntheticSources.join(" / ")}</span>
            </div>
            <div className="call-flow-card">
              <strong>2. Prepare meeting</strong>
              <span>{callResult.context.meetingTitle}</span>
            </div>
            <div className="call-flow-card">
              <strong>3. Start call</strong>
              <span>{callUserJoins ? "User joins the Teams call with RepAI" : "RepAI attends the Teams call alone and sends Jeremiah the brief"}</span>
            </div>
          </div>
          <div className="call-controls">
            <label>
              Attendance
              <select value={callUserJoins ? "join" : "alone"} onChange={(event) => setCallUserJoins(event.target.value === "join")}>
                <option value="join">User joins the call</option>
                <option value="alone">RepAI attends alone</option>
              </select>
            </label>
            <label>
              Recommendation
              <input value={callRecommendation} onChange={(event) => setCallRecommendation(event.target.value)} />
            </label>
            <button type="button" onClick={runTeamsCallMvp}>
              <PhoneCall size={15} />
              Start demo call
            </button>
          </div>
          <div className="call-output-grid">
            <div className="call-output">
              <strong>RepAI call script</strong>
              {callResult.callScript.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <div className="call-output">
              <strong>After-call brief</strong>
              <p>{callResult.brief}</p>
              <b>{callResult.nextAction}</b>
            </div>
            <div className="call-output setup-list">
              <strong>Needed before real Teams call</strong>
              {callResult.setup.missing
                .filter((requirement) => requirement.requiredFor === "teams-call")
                .map((requirement) => (
                  <span key={requirement.key}>{requirement.label}</span>
                ))}
            </div>
          </div>
        </section>

        <section className="grid judge-grid">
          <article className="panel judge-panel">
            <div className="panel-heading">
              <Activity size={20} />
              <h2>3-minute demo flow</h2>
            </div>
            <ol className="demo-flow-list">
              {demoFlow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="panel judge-panel compare-panel">
            <div className="panel-heading">
              <BadgeCheck size={20} />
              <h2>RepAI vs Copilot</h2>
            </div>
            <div className="comparison-row">
              <strong>Copilot</strong>
              <span>helps a person do work</span>
            </div>
            <div className="comparison-row standout">
              <strong>RepAI Staff Support</strong>
              <span>can be assigned work, own a queue, and escalate safely</span>
            </div>
          </article>

          <article className="panel judge-panel">
            <div className="panel-heading">
              <ShieldCheck size={20} />
              <h2>Simulated vs ready</h2>
            </div>
            <div className="readiness-list">
              {readinessItems.map((item) => (
                <div key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section id="role-tools" className="panel role-tools-panel">
          <div className="panel-heading">
            <Brain size={20} />
            <h2>Two RepAI tools</h2>
          </div>
          <div className="tool-split-grid">
            {repAiTools.map((tool) => (
              <article key={tool.name} className="tool-split-card">
                <div>
                  <strong>{tool.name}</strong>
                  <span>{tool.status}</span>
                </div>
                <p>{tool.purpose}</p>
                <b>{tool.boundary}</b>
              </article>
            ))}
          </div>
        </section>

        <section id="meeting-capabilities" className="panel meeting-capability-panel">
          <div className="panel-heading split">
            <div>
              <div className="icon-title">
                <CalendarClock size={20} />
                <h2>Meeting capability matrix</h2>
              </div>
              <p>RepAI can reason and recommend today. True autonomous call attendance needs the Teams bot/custom engine layer.</p>
            </div>
            <span className="status-pill">Call layer planned</span>
          </div>
          <div className="capability-table" role="table" aria-label="Meeting capability matrix">
            <div className="capability-row header" role="row">
              <span>Capability</span>
              <span>Today</span>
              <span>Production path</span>
            </div>
            {meetingCapabilities.map((item) => (
              <div key={item.capability} className="capability-row" role="row">
                <strong>{item.capability}</strong>
                <span>{item.today}</span>
                <p>{item.production}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid test-architecture-grid">
          <article className="panel call-architecture-panel">
            <div className="panel-heading">
              <Network size={20} />
              <h2>Teams call architecture</h2>
            </div>
            <div className="call-flow">
              {callArchitectureSteps.map((step) => (
                <div key={step} className="call-flow-node">
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </article>

          <article id="judge-test-mode" className="panel judge-test-panel">
            <div className="panel-heading">
              <FileSearch size={20} />
              <h2>Judge Test Mode</h2>
            </div>
            <div className="judge-mode-list">
              {judgeTestModes.map((mode) => (
                <div key={mode.level}>
                  <strong>{mode.level}: {mode.title}</strong>
                  <span>{mode.body}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel role-selector-panel">
          <div className="panel-heading split">
            <div>
              <div className="icon-title">
                <Sparkles size={20} />
                <h2>Active RepAI role</h2>
              </div>
              <p>Switch the role brain without changing the Microsoft 365 work-context adapter.</p>
            </div>
            <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value as RolePackId)}>
              {rolePacks.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="active-role-card">
            <strong>{selectedRole?.name}</strong>
            <span>{selectedRole?.summary}</span>
            <b>Allowed tools: {selectedRole?.capabilities.join(", ")}</b>
          </div>
        </section>

        <section className="grid hero-grid">
          <article id="before" className="panel meeting-card">
            <div className="panel-heading">
              <CalendarClock size={20} />
              <h2>Before meeting</h2>
            </div>
            <p>{opening}</p>
            <div className="agenda-list">
              {productSync.agenda.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article id="voice" className="panel voice-panel">
            <div className="panel-heading split">
              <div>
                <div className="icon-title">
                  <Mic size={22} />
                  <h2>Ask RepAI by voice</h2>
                </div>
                <p>Participants speak questions. RepAI answers from approved knowledge, Work IQ, and Fabric IQ context.</p>
              </div>
              <button
                type="button"
                className={`mic-button ${isListening ? "listening" : ""}`}
                onClick={isListening ? stopVoiceCapture : startVoiceCapture}
                aria-label={isListening ? "Stop voice capture" : "Start voice capture"}
              >
                {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              </button>
            </div>
            <div className="waveform" aria-hidden="true">
              {Array.from({ length: 28 }, (_, index) => (
                <span key={index} style={{ "--bar": `${20 + ((index * 17) % 64)}%` } as React.CSSProperties} />
              ))}
            </div>
            <div className="transcript-box">
              <span>Voice transcript</span>
              <strong>{liveTranscript}</strong>
            </div>
            <form className="text-activation" onSubmit={askByText}>
              <label>
                <span>Text activation</span>
                <input
                  value={textQuestion}
                  onChange={(event) => setTextQuestion(event.target.value)}
                  placeholder="@RepAI ask from text when voice is unavailable"
                />
              </label>
              <button type="submit">
                <Send size={14} />
                Ask
              </button>
            </form>
            <div className={`answer-box ${lastAnswer?.status === "needs_review" ? "review" : ""}`}>
              <span>{lastAnswer?.status === "answered" ? "Grounded response" : "Escalation response"}</span>
              <p>{lastAnswer?.message}</p>
              {lastAnswer?.citations.length ? (
                <div className="citations">
                  {lastAnswer.citations.map((citation) => (
                    <b key={citation.documentId}>{citation.title}</b>
                  ))}
                </div>
              ) : (
                <div className="citations muted">No citation. Jeremiah review required.</div>
              )}
            </div>
            <div className="speech-controls">
              <span>{voiceStatus}</span>
              <button type="button" onClick={() => lastAnswer && speakAnswer(lastAnswer.message)}>
                Speak response
              </button>
              <button type="button" onClick={stopSpeaking} disabled={!isSpeaking}>
                Stop speaking
              </button>
            </div>
            <div className="prompt-row" aria-label="Demo voice prompts">
              {voicePrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => askByVoice(prompt)}>
                  <Send size={14} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </article>

          <aside className="right-stack">
            <KnowledgeFolderPanel
              query={knowledgeQuery}
              documents={filteredDocuments}
              onQueryChange={setKnowledgeQuery}
              onUpload={uploadKnowledge}
            />
            <SignalPanel title="Work IQ" icon={<Brain size={18} />} items={workIqSignals} />
            <SignalPanel title="Fabric IQ" icon={<Database size={18} />} items={fabricIqSignals} />
          </aside>
        </section>

        <section id="voice-pipeline" className="panel voice-pipeline-panel">
          <div className="panel-heading">
            <Mic size={20} />
            <h2>Voice pipeline</h2>
          </div>
          <div className="voice-picker">
            <div>
              <strong>Voice profile</strong>
              <span>{roleVoiceProfile.label}: {roleVoiceProfile.style}</span>
            </div>
            <label>
              Mode
              <select
                value={voiceMode}
                onChange={(event) => changeVoiceMode(event.target.value as "role" | "custom" | "clone")}
              >
                <option value="role">Use role voice profile</option>
                <option value="custom">Use custom browser voice</option>
                <option value="clone">Use cloned voice (consent required)</option>
              </select>
            </label>
            <label>
              Custom voice
              <select
                value={selectedVoiceName}
                onChange={(event) => setSelectedVoiceName(event.target.value)}
                disabled={(voiceMode !== "custom" && voiceMode !== "clone") || availableVoices.length === 0}
              >
                {availableVoices.length === 0 ? (
                  <option value="">No browser voices loaded</option>
                ) : (
                  availableVoices.map((voice) => (
                    <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
          {voiceMode === "clone" ? (
            <div className="clone-consent-note">
              <strong>Voice clone mode consent recorded</strong>
              <span>RepAI still announces itself as RepAI. This demo does not perform real voice cloning without a production provider.</span>
            </div>
          ) : null}
          <div className="voice-pipeline-grid">
            {voicePipeline.map((stage) => (
              <div key={stage.name} className="voice-stage">
                <strong>{stage.name}</strong>
                <span>Demo: {stage.demo}</span>
                <span>Production: {stage.production}</span>
              </div>
            ))}
          </div>
        </section>
        {showCloneConsent ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="voice-clone-title">
            <div className="consent-modal">
              <h2 id="voice-clone-title">Voice clone consent required</h2>
              <p>
                Voice cloning requires explicit consent from {cloneConsent.speakerName}, visible disclosure, audit logging,
                and company policy approval. Consent helps reduce risk, but does not remove every legal or compliance obligation.
              </p>
              <ul>
                <li>{cloneConsent.speakerName} authorizes RepAI to use a cloned voice profile.</li>
                <li>RepAI will still disclose that it is RepAI before speaking.</li>
                <li>Production use must be logged and approved by company policy.</li>
              </ul>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCloneConsent(false)}>
                  Cancel
                </button>
                <button type="button" className="primary" onClick={acceptVoiceCloneConsent}>
                  I have consent
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section id="after" className="grid lower-grid">
          <article className="panel">
            <div className="panel-heading">
              <CheckCircle2 size={20} />
              <h2>Post-meeting brief</h2>
            </div>
            <p>{brief.summary}</p>
            <div className="brief-columns">
              <BriefList title="Decisions" items={brief.decisions} />
              <BriefList title="Action items" items={brief.actionItems} />
              <BriefList title="Risks" items={brief.risks} />
            </div>
          </article>

          <article className="panel card-preview">
            <div className="panel-heading">
              <Users size={20} />
              <h2>Teams Adaptive Card</h2>
            </div>
            <div className="adaptive-card">
              <strong>{card.body[0]?.type === "TextBlock" ? card.body[0].text : "Meeting brief"}</strong>
              <p>{followUp}</p>
              <div className="card-actions">
                <button type="button">Review follow-up</button>
                <button type="button">Open meeting</button>
              </div>
            </div>
          </article>
        </section>

        <section id="architecture" className="panel architecture-panel">
          <div className="panel-heading">
            <Network size={20} />
            <h2>Hybrid Copilot + RepAI engine architecture</h2>
          </div>
          <div className="hybrid-summary">
            <div>
              <Bot size={18} />
              <strong>Microsoft 365 Copilot</strong>
              <span>Work brain for Teams, Outlook, SharePoint, OneDrive, Work IQ, and meeting context.</span>
            </div>
            <div>
              <Brain size={18} />
              <strong>Custom RepAI engine</strong>
              <span>Role brain for voice, role packs, neutral speech, custom data, approvals, and non-Microsoft tools.</span>
            </div>
          </div>
          <div className="architecture-diagram" role="img" aria-label="RepAI Copilot and Teams integration architecture">
            <ArchitectureNode icon={<Mic size={18} />} title="Meeting voice" body="Participant asks RepAI out loud" />
            <ArchitectureNode icon={<Bot size={18} />} title="Copilot work brain" body="Microsoft 365 context and Work IQ" />
            <ArchitectureNode icon={<Brain size={18} />} title="RepAI role brain" body="Voice, role packs, approvals" />
            <ArchitectureNode icon={<Brain size={18} />} title="Work IQ" body="Teams, Outlook, SharePoint, OneDrive" />
            <ArchitectureNode icon={<Database size={18} />} title="Fabric IQ" body="Semantic models and data agents" />
            <ArchitectureNode icon={<FileSearch size={18} />} title="Knowledge folder" body="Approved wiki and files" />
            <ArchitectureNode icon={<Users size={18} />} title="Teams card" body="Brief and review-only follow-up" />
          </div>
        </section>

        <section className="grid capability-grid">
          <article className="panel">
            <div className="panel-heading">
              <BarChart3 size={20} />
              <h2>Role packs</h2>
            </div>
            <div className="role-grid">
              {rolePacks.map((role) => (
                <div key={role.id} className="role-card">
                  <strong>{role.name}</strong>
                  <p>{role.summary}</p>
                  <span>{role.capabilities.slice(0, 3).join(" / ")}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel guardrail-panel">
            <div className="panel-heading">
              <ShieldCheck size={20} />
              <h2>Voice and multi-account guardrails</h2>
            </div>
            <div className="voice-policy">
              <strong>Neutral disclosed voice</strong>
              <p>RepAI speaks as RepAI, not as a cloned human voice: "I am RepAI, speaking as Jeremiah's disclosed delegate."</p>
            </div>
            <div className={`join-decision ${joinDecision.allowed ? "allowed" : "blocked"}`}>
              <strong>{joinDecision.allowed ? "Two-role call allowed" : "Two-role call blocked"}</strong>
              {delegateSessions.map((session) => (
                <span key={session.visibleIdentity}>{session.visibleIdentity}</span>
              ))}
            </div>
            <ul className="guardrail-list">
              {joinDecision.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
        </section>

        <section id="staff-support" className="panel staff-panel">
          <div className="panel-heading split">
            <div>
              <div className="icon-title">
                <Users size={20} />
                <h2>Staff Support queue</h2>
              </div>
              <p>Copilot helps a user work. RepAI Staff Support can be assigned work, own a queue, report status, and escalate when authority is needed.</p>
            </div>
            <span className="status-pill strong">@RepAI intake</span>
          </div>
          <div className="staff-layout">
            <div className="channel-list">
              <strong>Intake channels</strong>
              {staffSupportChannels.map((channel) => (
                <span key={channel}>{channel}</span>
              ))}
            </div>
            <div className="queue-list">
              {staffQueue.map((item, index) => {
                const decision = classifyStaffSupportWork(item);
                return (
                  <button
                    key={item.request}
                    type="button"
                    className={`queue-item ${decision.mode} ${selectedWorkIndex === index ? "selected" : ""}`}
                    onClick={() => setSelectedWorkIndex(index)}
                  >
                    <div>
                      <strong>{item.request}</strong>
                      <span>{item.channel} / {item.sla}</span>
                    </div>
                    <b>{formatMode(decision.mode)}</b>
                    <p>{decision.reason}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {workflowResult ? (
            <div className="workflow-output">
              <div>
                <strong>Mock Work IQ context</strong>
                <span>{workflowResult.context.emails[0]}</span>
                <span>{workflowResult.context.teamsThreads[0]}</span>
                <span>{workflowResult.context.policyHits[0]}</span>
              </div>
              <div>
                <strong>RepAI action draft</strong>
                <p>{workflowResult.draft}</p>
              </div>
              <div>
                <strong>Audit log</strong>
                {workflowResult.auditLog.map((entry) => (
                  <span key={entry}>{entry}</span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section id="submission" className="panel submission-panel">
          <div className="panel-heading split">
            <div>
              <div className="icon-title">
                <BadgeCheck size={20} />
                <h2>Submission pack</h2>
              </div>
              <p>Everything judges need to understand what is built, what is simulated, and what becomes production Microsoft 365 integration.</p>
            </div>
            <span className="status-pill strong">Hackathon-ready</span>
          </div>
          <div className="submission-grid">
            {submissionAssets.map((asset) => (
              <div key={asset} className="submission-item">
                <CheckCircle2 size={17} />
                <span>{asset}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function DemoControlCenter() {
  return (
    <section id="demo-control" className="demo-control">
      <div className="control-main">
        <div className="control-copy">
          <span>Judge path</span>
          <h2>Demo Control Center</h2>
          <p>
            Run RepAI as a disclosed meeting delegate, then switch into Staff Support to show how the same agent can own assigned work without pretending to be the human.
          </p>
        </div>
        <div className="control-actions">
          {controlCenterActions.map((action) => (
            <a key={action.href} href={action.href} className="control-action">
              <span>{action.icon}</span>
              <strong>{action.title}</strong>
              <small>{action.body}</small>
            </a>
          ))}
        </div>
      </div>
      <aside className="control-rail" aria-label="Submission readiness">
        <div className="readiness-meter">
          <strong>Submission readiness</strong>
          <span>4 / 4</span>
        </div>
        <div className="control-checks">
          <span><CheckCircle2 size={15} /> Demo UI</span>
          <span><CheckCircle2 size={15} /> Voice flow</span>
          <span><CheckCircle2 size={15} /> Agent scaffold</span>
          <span><CheckCircle2 size={15} /> Pitch assets</span>
        </div>
        <div className="hybrid-chip">
          <Bot size={16} />
          <span>Copilot work brain</span>
          <Brain size={16} />
          <span>RepAI role brain</span>
        </div>
      </aside>
    </section>
  );
}

function KnowledgeFolderPanel({
  query,
  documents,
  onQueryChange,
  onUpload,
}: {
  query: string;
  documents: KnowledgeDocument[];
  onQueryChange: (query: string) => void;
  onUpload: (files: FileList | null) => void;
}) {
  return (
    <article className="panel compact-panel">
      <div className="panel-heading split">
        <div className="icon-title">
          <FolderUp size={18} />
          <h2>Knowledge Folder</h2>
        </div>
        <label className="upload-button">
          Upload
          <input type="file" multiple onChange={(event) => onUpload(event.target.files)} />
        </label>
      </div>
      <label className="search-field">
        <FileSearch size={16} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search approved sources"
        />
      </label>
      <div className="document-list">
        {documents.map((document) => (
          <div key={document.id} className="document-row">
            <strong>{document.title}</strong>
            <span>{document.source}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function SignalPanel({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <article className="panel compact-panel signal-panel">
      <div className="panel-heading">
        {icon}
        <h2>{title}</h2>
      </div>
      {items.map((item) => (
        <p key={item}>
          <Sparkles size={14} />
          {item}
        </p>
      ))}
    </article>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="brief-list">
      <strong>{title}</strong>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function ArchitectureNode({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="architecture-node">
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function formatMode(mode: "auto_handle" | "draft_for_review" | "escalate") {
  if (mode === "auto_handle") {
    return "Auto-handle";
  }

  if (mode === "draft_for_review") {
    return "Draft for review";
  }

  return "Escalate";
}
