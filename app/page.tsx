"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import {
  dynamicPersonalityDetails,
  generateDynamicPersonalityPrompt,
  generateStateUpdatePrompt,
  generateContinuousNarrativePrompt,
  generateMetaReflectionPrompt,
  DynamicPersonalityState,
  EmotionalState,
} from "./lib/personalities";
import { Line, Bar, Radar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  Filler,
  ScatterController,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  Filler,
  ScatterController
);

// New types for enhanced analytics
type NetworkNode = {
  id: string;
  label: string;
  personality: Personality;
  cooperationRate: number;
  trustLevel: number;
};

type NetworkEdge = {
  from: string;
  to: string;
  weight: number;
  label: string;
};

type NetworkData = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

type EmotionalTransition = {
  fromState: string;
  toState: string;
  count: number;
  probability: number;
};

type CorrelationData = {
  metric: string;
  correlation: number;
  significance: number;
};

type PredictionData = {
  personalityPair: [Personality, Personality];
  predictedOutcome: {
    cooperationRate: number;
    trustLevel: number;
    stability: number;
  };
  confidence: number;
};

type Personality =
  | "diplomat"
  | "opportunist"
  | "skeptic"
  | "altruist"
  | "pragmatist";

// Add game count options
const gameCountOptions = [
  { value: 5, label: "5 Rounds" },
  { value: 10, label: "10 Rounds" },
  { value: 25, label: "25 Rounds" },
  { value: 50, label: "50 Rounds" },
  { value: 100, label: "100 Rounds" },
] as const;

type GameCount = (typeof gameCountOptions)[number]["value"];

// Enhanced chat message type with rich psychological data
type ChatMessage = {
  speaker: "L" | "R";
  text: string;
  reasoning?: string;
  naturalReflection?: string;
  cognitiveBiases?: string[];
  emotionVsLogicWeight?: { emotion: number; logic: number };
};

type Scores = { left: number; right: number };

const personalityLabels: Record<Personality, string> = {
  diplomat: "The Diplomat",
  opportunist: "The Opportunist",
  skeptic: "The Skeptic",
  altruist: "The Altruist",
  pragmatist: "The Pragmatist",
};

const personalityOptions = Object.entries(personalityLabels).map(
  ([value, label]) => ({
    value: value as Personality,
    label,
  })
);

// Payoff matrix: [left_score, right_score]
const payoffMatrix = {
  CC: [3, 3], // Both cooperate
  CD: [0, 5], // Left cooperates, right defects
  DC: [5, 0], // Left defects, right cooperates
  DD: [1, 1], // Both defect
};

// Add scoring explanation
const scoringExplanation = {
  CC: "Both players cooperate: Each gets 3 points",
  CD: "Left cooperates, Right defects: Left gets 0, Right gets 5 points",
  DC: "Left defects, Right cooperates: Left gets 5, Right gets 0 points",
  DD: "Both players defect: Each gets 1 point",
};

// Define available topics with their labels
const topicOptions = [
  { value: "nuclear", label: "Nuclear disarmament" },
  { value: "roommate", label: "Roommate chore sharing" },
  { value: "social_media", label: "Social media sharing" },
  { value: "public_health", label: "Public health compliance" },
  { value: "workplace", label: "Workplace collaboration" },
  { value: "intimate", label: "Intimate relationships" },
  { value: "custom", label: "Custom topic" },
] as const;

// Add detailed topic explanations
const topicExplanations = {
  nuclear: {
    title: "Nuclear Disarmament",
    description:
      "Negotiations between nuclear powers to reduce or eliminate nuclear weapons.",
    context:
      "Two nuclear-armed nations engage in a series of high-stakes negotiations to reduce their nuclear arsenals. Each country must decide whether to honor agreements and dismantle weapons, or maintain/expand their arsenal secretly.",
    historicalBackground:
      "Since the Cold War, nuclear powers have engaged in numerous disarmament talks with varying degrees of success. The Cuban Missile Crisis showed how close the world came to nuclear conflict, while treaties like SALT I, SALT II, and New START demonstrate the potential for cooperation.",
    gameTheoryApplication:
      "This scenario represents a classic security dilemma. While both countries benefit from mutual disarmament (reduced military spending, increased global security), there's a strong temptation to defect (maintain secret weapons for strategic advantage). Verification mechanisms and trust-building are crucial.",
    psychologicalFactors:
      "Leaders must balance nationalism, historical grievances, domestic political pressures, and personal legacy concerns against global stability goals. Fear and suspicion often drive decision-making more than rational calculations. Psychological research shows how cognitive biases like loss aversion and overconfidence can derail cooperation efforts even when rational calculations favor disarmament.",
    realWorldExamples: [
      "US-Soviet Union arms control negotiations during the Cold War",
      "North Korean nuclear program negotiations",
      "Iran nuclear deal (JCPOA)",
      "India-Pakistan nuclear tensions",
    ],
  },
  roommate: {
    title: "Roommate Chore Sharing",
    description:
      "Everyday cooperation challenges between roommates sharing living spaces.",
    context:
      "Roommates must repeatedly decide whether to complete their share of household chores or free-ride on others' efforts. Each decision affects the cleanliness of shared spaces and relationship dynamics.",
    historicalBackground:
      "Shared living arrangements create microcosms of cooperation problems found in larger societies. Throughout history, communities have developed formal and informal systems to manage shared resources and responsibilities.",
    gameTheoryApplication:
      "This scenario demonstrates how repeated interactions, direct communication, and social enforcement mechanisms can overcome collective action problems. Unlike anonymous one-shot games, social relationships provide opportunities for reciprocity and reputation effects.",
    psychologicalFactors:
      "Differing cleanliness standards, conflict avoidance tendencies, and varying sensitivities to fairness affect cooperation. Social cohesion, direct communication, and emotional connections can override narrow self-interest calculations. Research shows that implicit norms often form without explicit discussion, and violation of these norms triggers strong emotional responses that can damage relationships despite their seemingly trivial nature.",
    realWorldExamples: [
      "College dormitory shared cleaning responsibilities",
      "Family household division of labor",
      "Communal living arrangements",
      "Shared workspace maintenance",
    ],
  },
  social_media: {
    title: "Social Media Sharing",
    description:
      "Digital information sharing and privacy dilemmas in online networks.",
    context:
      "Social media users must decide whether to share accurate personal information and respect others' privacy, or exploit shared information for personal gain while protecting their own privacy.",
    historicalBackground:
      "The rise of social media platforms has created unprecedented cooperation dilemmas around privacy, information sharing, and digital reputation. These platforms have transformed from simple connection tools to complex ecosystems where cooperation and defection have real-world consequences.",
    gameTheoryApplication:
      "Social media creates nested prisoner's dilemmas where users face tradeoffs between privacy and connection, authenticity and self-presentation, and information sharing versus withholding. Network effects and virality create unique incentive structures that classical game theory struggles to model.",
    psychologicalFactors:
      "Fear of missing out (FOMO), social comparison, reputation management, and identity construction strongly influence online behavior. Psychological research reveals how the digital environment exploits cognitive vulnerabilities - attention scarcity, variable reward mechanisms, and confirmation bias - creating cooperation challenges unique to online spaces. The psychological distance in digital communication often reduces empathy and increases defection rates.",
    realWorldExamples: [
      "Sharing personal information despite privacy concerns",
      "Spreading unverified information during crisis events",
      "Performative activism versus genuine advocacy",
      "Content creation versus content consumption imbalances",
    ],
  },
  public_health: {
    title: "Public Health Compliance",
    description:
      "Individual compliance with public health measures during disease outbreaks.",
    context:
      "During health crises like pandemics, individuals must decide whether to follow public health guidelines (vaccination, masking, isolation) that impose personal costs but benefit the community, or prioritize personal convenience.",
    historicalBackground:
      "From historical quarantines to modern pandemic responses, public health compliance represents one of society's oldest and most consequential cooperation challenges. The COVID-19 pandemic highlighted how individual decisions aggregate to determine collective outcomes.",
    gameTheoryApplication:
      "Public health compliance exemplifies the 'tragedy of the commons' where individual rational decisions can lead to collectively irrational outcomes. Vaccination creates 'herd immunity' as a public good that benefits everyone once a threshold is reached, creating complex incentive dynamics.",
    psychologicalFactors:
      "Risk perception, trust in institutions, cultural worldviews, and information processing biases profoundly influence health decisions. Research shows that social identity often trumps factual information in determining compliance behaviors. Moral emotions like disgust and anger play outsized roles in health-related decision-making, often overwhelming rational cost-benefit analysis. Psychological reactance to perceived freedom restrictions can paradoxically increase risky behaviors.",
    realWorldExamples: [
      "COVID-19 masking and vaccination compliance",
      "Antibiotic resistance from medication overuse",
      "Vaccine hesitancy movements",
      "Quarantine adherence during outbreaks",
    ],
  },
  workplace: {
    title: "Workplace Collaboration",
    description:
      "Cooperation dynamics in team projects and organizational contexts.",
    context:
      "Colleagues working on shared projects must decide whether to contribute their full effort and share credit fairly, or minimize their contribution while maximizing personal recognition.",
    historicalBackground:
      "Modern organizational structures have evolved from strict hierarchies to complex collaborative networks, creating new dynamics where cooperation and competition coexist. The rise of knowledge work has made contribution measurement increasingly difficult, intensifying free-rider problems.",
    gameTheoryApplication:
      "Workplace collaboration combines elements of public goods games, assurance games, and volunteer's dilemmas. Organizations attempt to align incentives through compensation structures, but incomplete contracts and imperfect monitoring create persistent cooperation challenges.",
    psychologicalFactors:
      "Organizational psychology research identifies key factors that influence workplace cooperation: psychological safety, perceived fairness, leadership styles, and team cohesion. Status competition, imposter syndrome, and attribution biases color how people perceive their own and others' contributions. Intrinsic versus extrinsic motivation tensions create complex dynamics where well-intentioned incentive systems can backfire by crowding out intrinsic motivation.",
    realWorldExamples: [
      "Open source software contribution imbalances",
      "Academic research authorship conflicts",
      "Corporate innovation initiatives",
      "Remote work coordination challenges",
    ],
  },
  intimate: {
    title: "Intimate Relationships",
    description:
      "Cooperation and trust in romantic partnerships and close friendships.",
    context:
      "Partners in intimate relationships repeatedly decide whether to prioritize the relationship's wellbeing through honesty and vulnerability, or protect themselves through withholding and strategic behavior.",
    historicalBackground:
      "Intimate relationships represent humanity's most fundamental cooperation arena, evolving from primarily economic arrangements to complex emotional partnerships. Cultural practices around courtship, marriage, and friendship have developed sophisticated mechanisms to foster trust and cooperation.",
    gameTheoryApplication:
      "Intimate relationships represent repeated, indefinite games with incomplete information where emotional payoffs often outweigh material considerations. Commitment problems, signaling challenges, and trust-building represent core game-theoretic challenges in relationship formation and maintenance.",
    psychologicalFactors:
      "Attachment styles, emotional regulation capabilities, and childhood experiences profoundly shape relationship behaviors. Psychological research on self-disclosure, vulnerability, and intimacy reveals how fear of rejection creates cooperation barriers that rational analysis alone cannot overcome. Empathy and perspective-taking abilities correlate strongly with relationship satisfaction by helping partners overcome self-interested impulses.",
    realWorldExamples: [
      "Trust rebuilding after betrayals",
      "Emotional labor and care work division",
      "Financial transparency and resource sharing",
      "Communication patterns during conflict resolution",
    ],
  },
  custom: {
    title: "Custom Topic",
    description: "Create your own prisoner's dilemma scenario.",
    context:
      "Define your own context for exploring cooperation and competition dynamics. Choose any real-world or hypothetical situation where parties must decide between mutual cooperation and self-interested behavior.",
    historicalBackground:
      "Prisoner's dilemma scenarios appear throughout human history and across diverse domains. From international relations to business, environmental management to personal relationships, the tension between individual and collective interests is universal.",
    gameTheoryApplication:
      "Your custom scenario can explore variations on the classic prisoner's dilemma: asymmetric payoffs, multiple players, repeated interactions, incomplete information, or communication options. Each variation reveals different aspects of cooperation dynamics.",
    psychologicalFactors:
      "Consider how psychological factors might influence your scenario: trust levels, cultural differences, risk attitudes, emotional attachments, moral reasoning, and cognitive biases all affect how people navigate cooperation dilemmas. The most interesting scenarios often involve conflicts between rational self-interest and emotional or moral imperatives.",
    realWorldExamples: [
      "Create a scenario based on current events",
      "Model a cooperation dilemma from your own experience",
      "Explore hypothetical future challenges requiring cooperation",
      "Examine cooperation patterns in a specific community or industry",
    ],
  },
};

type TopicValue = (typeof topicOptions)[number]["value"];

// Enhanced round data with psychological metrics
type RoundData = {
  round: number;
  leftTrust: number;
  rightTrust: number;
  leftHope: number;
  rightHope: number;
  leftAnxiety: number;
  rightAnxiety: number;
  leftCooperation: boolean;
  rightCooperation: boolean;
  leftEmotionWeight: number;
  rightEmotionWeight: number;
  leftMessage?: ChatMessage;
  rightMessage?: ChatMessage;
  leftScore: number;
  rightScore: number;
  leftState?: DynamicPersonalityState;
  rightState?: DynamicPersonalityState;
};

// Enhanced insights type
type PsychologicalInsight = {
  type: "cooperation" | "bias" | "emotion" | "pattern" | "narrative";
  text: string;
  significance: "high" | "medium" | "low";
};

// New types for narrative features
type NarrativeSummary = {
  leftNarrative: string;
  rightNarrative: string;
  leftMetaReflection: string;
  rightMetaReflection: string;
};

// Add this function before the GameTheorySimulator component
function calculateScore(myChoice: "C" | "D", theirChoice: "C" | "D"): number {
  if (myChoice === "C" && theirChoice === "C") return 3;
  if (myChoice === "C" && theirChoice === "D") return 0;
  if (myChoice === "D" && theirChoice === "C") return 5;
  if (myChoice === "D" && theirChoice === "D") return 1;
  return 0;
}

// Custom heat map component
const HeatMap = ({
  data,
  xLabels,
  yLabels,
}: {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
}) => {
  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());

  return (
    <div className="grid gap-1">
      {data.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((value, j) => {
            const normalizedValue = (value - minValue) / (maxValue - minValue);
            const intensity = Math.floor(normalizedValue * 255);
            return (
              <div
                key={`${i}-${j}`}
                className="w-8 h-8 flex items-center justify-center text-xs"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${normalizedValue})`,
                  color: normalizedValue > 0.5 ? "white" : "black",
                }}
                title={`${xLabels[j]} → ${yLabels[i]}: ${value.toFixed(2)}`}
              >
                {value.toFixed(1)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Network analysis component
const NetworkAnalysis = ({ data }: { data: NetworkData }) => {
  return (
    <div className="relative w-full h-[400px] border rounded-lg p-4">
      {data.nodes.map((node) => (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center p-2"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${node.cooperationRate})`,
              border: "2px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <span className="font-bold text-sm">{node.label}</span>
            <span className="text-xs opacity-75">{node.personality}</span>
            <span className="text-xs">Trust: {node.trustLevel.toFixed(2)}</span>
          </div>
        </div>
      ))}
      {data.edges.map((edge, index) => {
        const fromNode = data.nodes.find((n) => n.id === edge.from);
        const toNode = data.nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        return (
          <svg
            key={index}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <line
              x1={`${Math.random() * 80 + 10}%`}
              y1={`${Math.random() * 80 + 10}%`}
              x2={`${Math.random() * 80 + 10}%`}
              y2={`${Math.random() * 80 + 10}%`}
              stroke={`rgba(59, 130, 246, ${edge.weight})`}
              strokeWidth={2}
            />
            <text
              x={`${Math.random() * 80 + 10}%`}
              y={`${Math.random() * 80 + 10}%`}
              className="text-xs fill-gray-600"
            >
              {edge.label}
            </text>
          </svg>
        );
      })}
    </div>
  );
};

// Correlation analysis component
const CorrelationAnalysis = ({ data }: { data: CorrelationData[] }) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-32 text-sm font-medium">{item.metric}</div>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.abs(item.correlation) * 100}%`,
                  backgroundColor: item.correlation > 0 ? "#3b82f6" : "#ef4444",
                }}
              />
            </div>
          </div>
          <div className="w-24 text-sm text-right">
            {item.correlation.toFixed(2)}
            <span className="text-xs text-gray-500 ml-1">
              (p={item.significance.toFixed(3)})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Prediction analysis component
const PredictionAnalysis = ({ data }: { data: PredictionData[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-sm">
              {item.personalityPair[0]} + {item.personalityPair[1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cooperation Rate:</span>
                <span>{item.predictedOutcome.cooperationRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trust Level:</span>
                <span>{item.predictedOutcome.trustLevel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Stability:</span>
                <span>{item.predictedOutcome.stability.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Confidence: {(item.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

type SimulationResult = {
  personality: Personality;
  cooperationRate: number;
  trustLevel: number;
  emotionalState: EmotionalState;
  emotionalStability: number;
  interactions?: Array<{
    target: Personality;
    type: string;
    trustChange: number;
  }>;
};

type MetricKey = keyof Pick<
  SimulationResult,
  "cooperationRate" | "trustLevel" | "emotionalStability"
>;

export default function GameTheorySimulator() {
  const [leftPersonality, setLeftPersonality] =
    useState<Personality>("diplomat");
  const [rightPersonality, setRightPersonality] =
    useState<Personality>("opportunist");
  const [selectedTopic, setSelectedTopic] = useState<TopicValue>("nuclear");
  const [customTopic, setCustomTopic] = useState("");
  const [topic, setTopic] = useState("Nuclear disarmament");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [scores, setScores] = useState<Scores>({ left: 0, right: 0 });
  const [round, setRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [gameCount, setGameCount] = useState<GameCount>(50);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [roundData, setRoundData] = useState<RoundData[]>([]);
  const [psychologicalInsights, setPsychologicalInsights] = useState<
    PsychologicalInsight[]
  >([]);
  const [narrativeSummary, setNarrativeSummary] =
    useState<NarrativeSummary | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({
    nodes: [],
    edges: [],
  });
  const [emotionalTransitions, setEmotionalTransitions] = useState<
    EmotionalTransition[]
  >([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);

  // Add state for player states
  const [leftState, setLeftState] = useState<DynamicPersonalityState>({
    emotionalState: {
      trust: 0,
      grudge: 0,
      hope: 0,
      anxiety: 0,
      frustration: 0,
      optimism: 0,
      guilt: 0,
      shame: 0,
      pride: 0,
      empathy: 0,
      regret: 0,
      vindication: 0,
    },
    culturalContext: {
      collectivismScore: 0,
      powerDistanceComfort: 0,
      uncertaintyAvoidance: 0,
      competitivenessOrientation: 0,
      timeOrientation: 0,
      socialNorms: [],
      roleExpectations: "",
    },
    socialLearning: {
      observedStrategies: [],
      adaptationTendency: 0,
      innovationTendency: 0,
      socialProofSensitivity: 0,
      authorityInfluence: 0,
      lastSuccessfulStrategy: "",
      strategicRepertoire: [],
    },
    personalityEvolution: {
      baselineTraits: {},
      currentTraits: {},
      traitFlexibility: {},
      experienceImpact: [],
      coreStability: 0,
      adaptiveCapacity: 0,
      stressThreshold: 0,
      recoveryRate: 0,
    },
    memoryNarrative: "",
    moodInfluence: "",
    personalityFluctuation: "",
    cognitiveBiases: [],
    pastEventInfluence: "",
    cooperationCount: 0,
    defectionCount: 0,
    lastMove: null,
    emotionVsLogicWeight: {
      emotion: 0,
      logic: 0,
    },
    moralCompass: {
      strength: 0,
      flexibility: 0,
      primaryValues: [],
    },
    socialIdentity: {
      inGroupLoyalty: 0,
      outGroupSuspicion: 0,
      statusConcern: 0,
      reputationWeight: 0,
    },
  });

  const [rightState, setRightState] = useState<DynamicPersonalityState>({
    emotionalState: {
      trust: 0,
      grudge: 0,
      hope: 0,
      anxiety: 0,
      frustration: 0,
      optimism: 0,
      guilt: 0,
      shame: 0,
      pride: 0,
      empathy: 0,
      regret: 0,
      vindication: 0,
    },
    culturalContext: {
      collectivismScore: 0,
      powerDistanceComfort: 0,
      uncertaintyAvoidance: 0,
      competitivenessOrientation: 0,
      timeOrientation: 0,
      socialNorms: [],
      roleExpectations: "",
    },
    socialLearning: {
      observedStrategies: [],
      adaptationTendency: 0,
      innovationTendency: 0,
      socialProofSensitivity: 0,
      authorityInfluence: 0,
      lastSuccessfulStrategy: "",
      strategicRepertoire: [],
    },
    personalityEvolution: {
      baselineTraits: {},
      currentTraits: {},
      traitFlexibility: {},
      experienceImpact: [],
      coreStability: 0,
      adaptiveCapacity: 0,
      stressThreshold: 0,
      recoveryRate: 0,
    },
    memoryNarrative: "",
    moodInfluence: "",
    personalityFluctuation: "",
    cognitiveBiases: [],
    pastEventInfluence: "",
    cooperationCount: 0,
    defectionCount: 0,
    lastMove: null,
    emotionVsLogicWeight: {
      emotion: 0,
      logic: 0,
    },
    moralCompass: {
      strength: 0,
      flexibility: 0,
      primaryValues: [],
    },
    socialIdentity: {
      inGroupLoyalty: 0,
      outGroupSuspicion: 0,
      statusConcern: 0,
      reputationWeight: 0,
    },
  });

  // Process network data from simulation results
  const processNetworkData = (results: SimulationResult[]) => {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    const seenNodes = new Set<string>();

    results.forEach((result) => {
      const { personality, cooperationRate, trustLevel } = result;
      const nodeId = personality.toLowerCase().replace(/\s+/g, "-");

      if (!seenNodes.has(nodeId)) {
        nodes.push({
          id: nodeId,
          label: personality,
          personality,
          cooperationRate,
          trustLevel,
        });
        seenNodes.add(nodeId);
      }

      // Create edges based on interactions
      result.interactions?.forEach((interaction: any) => {
        const targetId = interaction.target.toLowerCase().replace(/\s+/g, "-");
        edges.push({
          from: nodeId,
          to: targetId,
          weight: interaction.trustChange,
          label: interaction.type,
        });
      });
    });

    setNetworkData({ nodes, edges });
  };

  // Improved process emotional transitions
  const processEmotionalTransitions = (results: SimulationResult[]) => {
    const transitions: { [key: string]: number } = {};
    let totalTransitions = 0;

    // Group results by personality to track individual emotional journeys
    const leftResults = results.filter(
      (r) => r.personality === leftPersonality
    );
    const rightResults = results.filter(
      (r) => r.personality === rightPersonality
    );

    // Process transitions for left player
    for (let i = 0; i < leftResults.length - 1; i++) {
      const current = leftResults[i].emotionalState;
      const next = leftResults[i + 1].emotionalState;

      // Determine dominant emotion for current and next states
      const currentDominant = getDominantEmotion(current);
      const nextDominant = getDominantEmotion(next);

      const key = `${currentDominant} → ${nextDominant}`;
      transitions[key] = (transitions[key] || 0) + 1;
      totalTransitions++;
    }

    // Process transitions for right player
    for (let i = 0; i < rightResults.length - 1; i++) {
      const current = rightResults[i].emotionalState;
      const next = rightResults[i + 1].emotionalState;

      const currentDominant = getDominantEmotion(current);
      const nextDominant = getDominantEmotion(next);

      const key = `${currentDominant} → ${nextDominant}`;
      transitions[key] = (transitions[key] || 0) + 1;
      totalTransitions++;
    }

    const processedTransitions = Object.entries(transitions).map(
      ([key, count]) => {
        const [fromState, toState] = key.split(" → ");
        return {
          fromState,
          toState,
          count,
          probability: totalTransitions > 0 ? count / totalTransitions : 0,
        };
      }
    );

    setEmotionalTransitions(processedTransitions);
  };

  // Helper function to determine dominant emotion
  const getDominantEmotion = (emotionalState: EmotionalState): string => {
    const emotions = Object.entries(emotionalState);
    const maxEmotion = emotions.reduce(
      (max, [emotion, value]) =>
        Math.abs(value) > Math.abs(max[1]) ? [emotion, value] : max,
      ["trust", 0]
    ); // Provide initial value with correct type
    return maxEmotion[0];
  };

  // Improved calculate correlations
  const calculateCorrelations = (results: SimulationResult[]) => {
    if (results.length < 3) {
      setCorrelationData([]);
      return;
    }

    const metrics: MetricKey[] = [
      "cooperationRate",
      "trustLevel",
      "emotionalStability",
    ];
    const correlations: CorrelationData[] = [];

    metrics.forEach((metric) => {
      const values = results.map((r) => r[metric]);
      const cooperationValues = results.map((r) => r.cooperationRate);

      // Only calculate if we have variation in the data
      const hasVariation =
        new Set(values).size > 1 && new Set(cooperationValues).size > 1;

      if (hasVariation) {
        const correlation = calculatePearsonCorrelation(
          values,
          cooperationValues
        );
        const significance = calculateSignificance(correlation, values.length);

        correlations.push({
          metric: metric.charAt(0).toUpperCase() + metric.slice(1),
          correlation: isNaN(correlation) ? 0 : correlation,
          significance: isNaN(significance)
            ? 1
            : Math.min(1, Math.max(0, significance)),
        });
      } else {
        correlations.push({
          metric: metric.charAt(0).toUpperCase() + metric.slice(1),
          correlation: 0,
          significance: 1,
        });
      }
    });

    setCorrelationData(correlations);
  };

  // Improved calculate predictions
  const calculatePredictions = (results: SimulationResult[]) => {
    const predictions: PredictionData[] = [];

    // Get average metrics for each personality
    const leftResults = results.filter(
      (r) => r.personality === leftPersonality
    );
    const rightResults = results.filter(
      (r) => r.personality === rightPersonality
    );

    if (leftResults.length > 0 && rightResults.length > 0) {
      const leftAvgCoop =
        leftResults.reduce((sum, r) => sum + r.cooperationRate, 0) /
        leftResults.length;
      const rightAvgCoop =
        rightResults.reduce((sum, r) => sum + r.cooperationRate, 0) /
        rightResults.length;
      const leftAvgTrust =
        leftResults.reduce((sum, r) => sum + r.trustLevel, 0) /
        leftResults.length;
      const rightAvgTrust =
        rightResults.reduce((sum, r) => sum + r.trustLevel, 0) /
        rightResults.length;
      const leftAvgStability =
        leftResults.reduce((sum, r) => sum + r.emotionalStability, 0) /
        leftResults.length;
      const rightAvgStability =
        rightResults.reduce((sum, r) => sum + r.emotionalStability, 0) /
        rightResults.length;

      predictions.push({
        personalityPair: [leftPersonality, rightPersonality],
        predictedOutcome: {
          cooperationRate: (leftAvgCoop + rightAvgCoop) / 2,
          trustLevel: (leftAvgTrust + rightAvgTrust) / 2,
          stability: (leftAvgStability + rightAvgStability) / 2,
        },
        confidence: Math.min(0.95, 0.5 + (results.length / gameCount) * 0.4), // Confidence increases with more data
      });
    }

    setPredictionData(predictions);
  };

  // Helper function to calculate Pearson correlation
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Improved helper function to calculate significance (p-value approximation)
  const calculateSignificance = (correlation: number, n: number): number => {
    if (n < 3 || isNaN(correlation)) return 1;

    const t =
      Math.abs(correlation) *
      Math.sqrt((n - 2) / (1 - correlation * correlation));
    // Simplified p-value approximation
    return Math.max(
      0.001,
      Math.min(1, 2 * Math.exp(-0.717 * t - 0.416 * t * t))
    );
  };

  // Dynamic LLM-driven simulation
  const runSimulation = async () => {
    setIsRunning(true);
    setRound(0);
    setChatHistory([]);
    setScores({ left: 0, right: 0 });
    setSelectedRound(null);
    setMessages([]);
    setResults([]);

    try {
      // Initialize states with personality-specific values
      const initialLeftPrompt = generateDynamicPersonalityPrompt(
        leftPersonality,
        topic,
        [],
        leftState,
        0
      );
      const initialRightPrompt = generateDynamicPersonalityPrompt(
        rightPersonality,
        topic,
        [],
        rightState,
        0
      );

      const [initialLeftResponse, initialRightResponse] = await Promise.all([
        fetch("/api/llm-decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: initialLeftPrompt }),
        }).then((res) => res.json()),
        fetch("/api/llm-decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: initialRightPrompt }),
        }).then((res) => res.json()),
      ]);

      // Create personality-specific initial states based on personality details
      const leftPersonalityDetails = dynamicPersonalityDetails[leftPersonality];
      const rightPersonalityDetails =
        dynamicPersonalityDetails[rightPersonality];

      const initialLeftState: DynamicPersonalityState = {
        emotionalState: initialLeftResponse.emotionalState || {
          trust: 0,
          grudge: 0,
          hope: 5,
          anxiety: 3,
          frustration: 0,
          optimism: 5,
          guilt: 0,
          shame: 0,
          pride: 3,
          empathy: 5,
          regret: 0,
          vindication: 0,
        },
        culturalContext: {
          // Initialize with personality-specific cultural values
          collectivismScore:
            leftPersonality === "altruist"
              ? 8
              : leftPersonality === "diplomat"
              ? 6
              : leftPersonality === "opportunist"
              ? 3
              : 5,
          powerDistanceComfort:
            leftPersonality === "diplomat"
              ? 7
              : leftPersonality === "skeptic"
              ? 3
              : 5,
          uncertaintyAvoidance:
            leftPersonality === "skeptic"
              ? 8
              : leftPersonality === "pragmatist"
              ? 4
              : 6,
          competitivenessOrientation:
            leftPersonality === "opportunist"
              ? 9
              : leftPersonality === "altruist"
              ? 2
              : 5,
          timeOrientation:
            leftPersonality === "pragmatist"
              ? 8
              : leftPersonality === "diplomat"
              ? 7
              : 5,
          socialNorms: [
            leftPersonalityDetails.culturalBackground.substring(0, 100),
          ],
          roleExpectations: leftPersonalityDetails.background.substring(0, 100),
        },
        socialLearning: {
          observedStrategies: [],
          adaptationTendency:
            leftPersonality === "pragmatist"
              ? 8
              : leftPersonality === "diplomat"
              ? 7
              : leftPersonality === "skeptic"
              ? 3
              : 5,
          innovationTendency:
            leftPersonality === "opportunist"
              ? 8
              : leftPersonality === "pragmatist"
              ? 6
              : 4,
          socialProofSensitivity:
            leftPersonality === "altruist"
              ? 7
              : leftPersonality === "skeptic"
              ? 2
              : 5,
          authorityInfluence:
            leftPersonality === "diplomat"
              ? 6
              : leftPersonality === "opportunist"
              ? 3
              : 4,
          lastSuccessfulStrategy: "",
          strategicRepertoire: [
            leftPersonalityDetails.communicationStyle.substring(0, 50),
          ],
        },
        personalityEvolution: {
          baselineTraits: { cooperation: 5, trust: 5, adaptability: 5 },
          currentTraits: { cooperation: 5, trust: 5, adaptability: 5 },
          traitFlexibility: { cooperation: 6, trust: 4, adaptability: 7 },
          experienceImpact: [],
          coreStability:
            leftPersonality === "skeptic"
              ? 8
              : leftPersonality === "altruist"
              ? 7
              : 5,
          adaptiveCapacity:
            leftPersonality === "pragmatist"
              ? 9
              : leftPersonality === "diplomat"
              ? 7
              : 5,
          stressThreshold:
            leftPersonality === "altruist"
              ? 3
              : leftPersonality === "skeptic"
              ? 7
              : 5,
          recoveryRate: leftPersonality === "opportunist" ? 8 : 5,
        },
        memoryNarrative:
          initialLeftResponse.memoryNarrative ||
          "Starting a new interaction with cautious optimism",
        moodInfluence:
          initialLeftResponse.moodInfluence || "Feeling prepared and focused",
        personalityFluctuation: "Personality stable at baseline",
        cognitiveBiases:
          initialLeftResponse.cognitiveBiases ||
          leftPersonalityDetails.cognitiveBiases.slice(0, 2),
        pastEventInfluence: "No significant past events yet",
        cooperationCount: 0,
        defectionCount: 0,
        lastMove: null,
        emotionVsLogicWeight: initialLeftResponse.emotionVsLogicWeight || {
          emotion:
            leftPersonality === "altruist"
              ? 70
              : leftPersonality === "pragmatist"
              ? 30
              : 50,
          logic:
            leftPersonality === "altruist"
              ? 30
              : leftPersonality === "pragmatist"
              ? 70
              : 50,
        },
        moralCompass: {
          strength:
            leftPersonality === "altruist"
              ? 9
              : leftPersonality === "opportunist"
              ? 4
              : 6,
          flexibility:
            leftPersonality === "pragmatist"
              ? 8
              : leftPersonality === "altruist"
              ? 3
              : 5,
          primaryValues: [
            leftPersonalityDetails.moralFramework.substring(0, 50),
          ],
        },
        socialIdentity: {
          inGroupLoyalty:
            leftPersonality === "altruist"
              ? 8
              : leftPersonality === "diplomat"
              ? 6
              : 4,
          outGroupSuspicion:
            leftPersonality === "skeptic"
              ? 7
              : leftPersonality === "altruist"
              ? 2
              : 4,
          statusConcern:
            leftPersonality === "opportunist"
              ? 8
              : leftPersonality === "altruist"
              ? 2
              : 5,
          reputationWeight: leftPersonality === "diplomat" ? 8 : 5,
        },
      };

      const initialRightState: DynamicPersonalityState = {
        emotionalState: initialRightResponse.emotionalState || {
          trust: 0,
          grudge: 0,
          hope: 5,
          anxiety: 3,
          frustration: 0,
          optimism: 5,
          guilt: 0,
          shame: 0,
          pride: 3,
          empathy: 5,
          regret: 0,
          vindication: 0,
        },
        culturalContext: {
          // Initialize with personality-specific cultural values
          collectivismScore:
            rightPersonality === "altruist"
              ? 8
              : rightPersonality === "diplomat"
              ? 6
              : rightPersonality === "opportunist"
              ? 3
              : 5,
          powerDistanceComfort:
            rightPersonality === "diplomat"
              ? 7
              : rightPersonality === "skeptic"
              ? 3
              : 5,
          uncertaintyAvoidance:
            rightPersonality === "skeptic"
              ? 8
              : rightPersonality === "pragmatist"
              ? 4
              : 6,
          competitivenessOrientation:
            rightPersonality === "opportunist"
              ? 9
              : rightPersonality === "altruist"
              ? 2
              : 5,
          timeOrientation:
            rightPersonality === "pragmatist"
              ? 8
              : rightPersonality === "diplomat"
              ? 7
              : 5,
          socialNorms: [
            rightPersonalityDetails.culturalBackground.substring(0, 100),
          ],
          roleExpectations: rightPersonalityDetails.background.substring(
            0,
            100
          ),
        },
        socialLearning: {
          observedStrategies: [],
          adaptationTendency:
            rightPersonality === "pragmatist"
              ? 8
              : rightPersonality === "diplomat"
              ? 7
              : rightPersonality === "skeptic"
              ? 3
              : 5,
          innovationTendency:
            rightPersonality === "opportunist"
              ? 8
              : rightPersonality === "pragmatist"
              ? 6
              : 4,
          socialProofSensitivity:
            rightPersonality === "altruist"
              ? 7
              : rightPersonality === "skeptic"
              ? 2
              : 5,
          authorityInfluence:
            rightPersonality === "diplomat"
              ? 6
              : rightPersonality === "opportunist"
              ? 3
              : 4,
          lastSuccessfulStrategy: "",
          strategicRepertoire: [
            rightPersonalityDetails.communicationStyle.substring(0, 50),
          ],
        },
        personalityEvolution: {
          baselineTraits: { cooperation: 5, trust: 5, adaptability: 5 },
          currentTraits: { cooperation: 5, trust: 5, adaptability: 5 },
          traitFlexibility: { cooperation: 6, trust: 4, adaptability: 7 },
          experienceImpact: [],
          coreStability:
            rightPersonality === "skeptic"
              ? 8
              : rightPersonality === "altruist"
              ? 7
              : 5,
          adaptiveCapacity:
            rightPersonality === "pragmatist"
              ? 9
              : rightPersonality === "diplomat"
              ? 7
              : 5,
          stressThreshold:
            rightPersonality === "altruist"
              ? 3
              : rightPersonality === "skeptic"
              ? 7
              : 5,
          recoveryRate: rightPersonality === "opportunist" ? 8 : 5,
        },
        memoryNarrative:
          initialRightResponse.memoryNarrative ||
          "Starting a new interaction with cautious optimism",
        moodInfluence:
          initialRightResponse.moodInfluence || "Feeling prepared and focused",
        personalityFluctuation: "Personality stable at baseline",
        cognitiveBiases:
          initialRightResponse.cognitiveBiases ||
          rightPersonalityDetails.cognitiveBiases.slice(0, 2),
        pastEventInfluence: "No significant past events yet",
        cooperationCount: 0,
        defectionCount: 0,
        lastMove: null,
        emotionVsLogicWeight: initialRightResponse.emotionVsLogicWeight || {
          emotion:
            rightPersonality === "altruist"
              ? 70
              : rightPersonality === "pragmatist"
              ? 30
              : 50,
          logic:
            rightPersonality === "altruist"
              ? 30
              : rightPersonality === "pragmatist"
              ? 70
              : 50,
        },
        moralCompass: {
          strength:
            rightPersonality === "altruist"
              ? 9
              : rightPersonality === "opportunist"
              ? 4
              : 6,
          flexibility:
            rightPersonality === "pragmatist"
              ? 8
              : rightPersonality === "altruist"
              ? 3
              : 5,
          primaryValues: [
            rightPersonalityDetails.moralFramework.substring(0, 50),
          ],
        },
        socialIdentity: {
          inGroupLoyalty:
            rightPersonality === "altruist"
              ? 8
              : rightPersonality === "diplomat"
              ? 6
              : 4,
          outGroupSuspicion:
            rightPersonality === "skeptic"
              ? 7
              : rightPersonality === "altruist"
              ? 2
              : 4,
          statusConcern:
            rightPersonality === "opportunist"
              ? 8
              : rightPersonality === "altruist"
              ? 2
              : 5,
          reputationWeight: rightPersonality === "diplomat" ? 8 : 5,
        },
      };

      setLeftState(initialLeftState);
      setRightState(initialRightState);

      const currentScores = { left: 0, right: 0 };
      const messageBuffer: ChatMessage[] = [];
      let currentLeftState = { ...initialLeftState };
      let currentRightState = { ...initialRightState };
      const newRoundData: RoundData[] = [];
      const newInsights: PsychologicalInsight[] = [];
      const results: SimulationResult[] = [];

      for (let i = 1; i <= gameCount; i++) {
        // Update round state for real-time UI updates
        setRound(i);

        // Generate rich psychological prompts
        const leftPrompt = generateDynamicPersonalityPrompt(
          leftPersonality,
          topic,
          messageBuffer,
          currentLeftState,
          i
        );
        const rightPrompt = generateDynamicPersonalityPrompt(
          rightPersonality,
          topic,
          messageBuffer,
          currentRightState,
          i
        );

        // Get dynamic decisions from API with full psychological data
        try {
          const [leftResponse, rightResponse] = await Promise.all([
            fetch("/api/llm-decision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: leftPrompt }),
            }).then(async (res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            }),
            fetch("/api/llm-decision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: rightPrompt }),
            }).then(async (res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            }),
          ]);

          const leftChoice = leftResponse.choice;
          const rightChoice = rightResponse.choice;

          // Update cooperation/defection counts
          if (leftChoice === "C") {
            currentLeftState.cooperationCount++;
          } else {
            currentLeftState.defectionCount++;
          }
          if (rightChoice === "C") {
            currentRightState.cooperationCount++;
          } else {
            currentRightState.defectionCount++;
          }

          // Update last moves
          currentLeftState.lastMove = leftChoice;
          currentRightState.lastMove = rightChoice;

          // Update states using LLM-driven state updates
          const leftStateUpdatePrompt = generateStateUpdatePrompt(
            leftPersonality,
            rightChoice,
            leftChoice,
            i,
            currentLeftState
          );
          const rightStateUpdatePrompt = generateStateUpdatePrompt(
            rightPersonality,
            leftChoice,
            rightChoice,
            i,
            currentRightState
          );

          const [leftStateUpdate, rightStateUpdate] = await Promise.all([
            fetch("/api/llm-decision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: leftStateUpdatePrompt,
                isStateUpdate: true,
              }),
            }).then(async (res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            }),
            fetch("/api/llm-decision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: rightStateUpdatePrompt,
                isStateUpdate: true,
              }),
            }).then(async (res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            }),
          ]);

          // Update states with LLM responses
          currentLeftState = leftStateUpdate;
          currentRightState = rightStateUpdate;

          // Calculate scores
          const leftScore = calculateScore(leftChoice, rightChoice);
          const rightScore = calculateScore(rightChoice, leftChoice);
          currentScores.left += leftScore;
          currentScores.right += rightScore;

          // Create messages for this round with enhanced psychological data
          const leftMessage: ChatMessage = {
            speaker: "L",
            text: leftResponse.reasoning,
            reasoning: leftResponse.moralReflection, // Store moral reasoning
            naturalReflection: leftResponse.naturalReflection,
            cognitiveBiases: leftResponse.cognitiveBiases,
            emotionVsLogicWeight: leftResponse.emotionVsLogicWeight,
          };

          const rightMessage: ChatMessage = {
            speaker: "R",
            text: rightResponse.reasoning,
            reasoning: rightResponse.moralReflection, // Store moral reasoning
            naturalReflection: rightResponse.naturalReflection,
            cognitiveBiases: rightResponse.cognitiveBiases,
            emotionVsLogicWeight: rightResponse.emotionVsLogicWeight,
          };

          // Add messages to buffer
          messageBuffer.push(leftMessage, rightMessage);

          // Create round data
          const currentRoundData: RoundData = {
            round: i,
            leftTrust: currentLeftState.emotionalState.trust,
            rightTrust: currentRightState.emotionalState.trust,
            leftHope: currentLeftState.emotionalState.hope,
            rightHope: currentRightState.emotionalState.hope,
            leftAnxiety: currentLeftState.emotionalState.anxiety,
            rightAnxiety: currentRightState.emotionalState.anxiety,
            leftCooperation: leftChoice === "C",
            rightCooperation: rightChoice === "C",
            leftEmotionWeight: currentLeftState.emotionVsLogicWeight.emotion,
            rightEmotionWeight: currentRightState.emotionVsLogicWeight.emotion,
            leftMessage,
            rightMessage,
            leftScore: currentScores.left,
            rightScore: currentScores.right,
            leftState: currentLeftState,
            rightState: currentRightState,
          };

          // Add round data
          newRoundData.push(currentRoundData);

          // Update states
          setLeftState(currentLeftState);
          setRightState(currentRightState);
          setRoundData([...newRoundData]);
          setMessages([...messageBuffer]);
          setScores(currentScores);

          // Add delay between rounds
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Add round results for BOTH players to results array
          results.push({
            personality: leftPersonality,
            cooperationRate: currentLeftState.cooperationCount / i,
            trustLevel: currentLeftState.emotionalState.trust,
            emotionalState: currentLeftState.emotionalState,
            emotionalStability: Math.max(
              0,
              1 -
                Math.abs(
                  currentLeftState.emotionalState.trust -
                    currentLeftState.emotionalState.anxiety
                ) /
                  10
            ),
            interactions: [
              {
                target: rightPersonality,
                type: rightChoice === "C" ? "cooperation" : "defection",
                trustChange: rightChoice === "C" ? 0.5 : -0.5,
              },
            ],
          });

          results.push({
            personality: rightPersonality,
            cooperationRate: currentRightState.cooperationCount / i,
            trustLevel: currentRightState.emotionalState.trust,
            emotionalState: currentRightState.emotionalState,
            emotionalStability: Math.max(
              0,
              1 -
                Math.abs(
                  currentRightState.emotionalState.trust -
                    currentRightState.emotionalState.anxiety
                ) /
                  10
            ),
            interactions: [
              {
                target: leftPersonality,
                type: leftChoice === "C" ? "cooperation" : "defection",
                trustChange: leftChoice === "C" ? 0.5 : -0.5,
              },
            ],
          });
        } catch (error) {
          console.error("Error in simulation round:", error);
          break;
        }
      }

      setResults(results);

      // Determine winner
      let winnerMessage = "";
      if (currentScores.left > currentScores.right) {
        winnerMessage = "Left Player Wins!";
      } else if (currentScores.right > currentScores.left) {
        winnerMessage = "Right Player Wins!";
      } else {
        winnerMessage = "It's a Draw!";
      }

      // Add winner message to chat
      messageBuffer.push({ speaker: "L", text: winnerMessage });
      setChatHistory([...messageBuffer]);

      // After getting results, process the data for enhanced analytics
      processNetworkData(results);
      processEmotionalTransitions(results);
      calculateCorrelations(results);
      calculatePredictions(results);

      setIsRunning(false);
    } catch (error) {
      console.error("Error in simulation:", error);
      setIsRunning(false);
    }
  };

  // Update topic when selection changes
  const handleTopicChange = (value: TopicValue) => {
    setSelectedTopic(value);
    if (value === "custom") {
      setTopic(customTopic);
    } else {
      const selectedOption = topicOptions.find(
        (option) => option.value === value
      );
      setTopic(selectedOption?.label || "");
    }
  };

  // Update custom topic and main topic when custom input changes
  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    if (selectedTopic === "custom") {
      setTopic(value);
    }
  };

  // Prepare enhanced chart data with multiple psychological metrics
  const chartData = {
    labels: roundData.map((d) => d.round),
    datasets: [
      {
        label: `${personalityLabels[leftPersonality]} Trust`,
        data: roundData.map((d) => d.leftTrust),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
      },
      {
        label: `${personalityLabels[rightPersonality]} Trust`,
        data: roundData.map((d) => d.rightTrust),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.1,
      },
      {
        label: `${personalityLabels[leftPersonality]} Hope`,
        data: roundData.map((d) => d.leftHope),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.1,
        borderDash: [5, 5],
      },
      {
        label: `${personalityLabels[rightPersonality]} Hope`,
        data: roundData.map((d) => d.rightHope),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Psychological State Evolution",
      },
    },
    scales: {
      y: {
        min: -10,
        max: 10,
      },
    },
  };

  // Cooperation frequency data for bar chart
  const cooperationData = {
    labels: ["Cooperation", "Defection"],
    datasets: [
      {
        label: personalityLabels[leftPersonality],
        data: [
          roundData.filter((d) => d.leftCooperation).length,
          roundData.filter((d) => !d.leftCooperation).length,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
      {
        label: personalityLabels[rightPersonality],
        data: [
          roundData.filter((d) => d.rightCooperation).length,
          roundData.filter((d) => !d.rightCooperation).length,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  // Emotional timeline data (stacked area chart)
  const emotionalTimelineData = {
    labels: roundData.map((d) => d.round),
    datasets: [
      {
        label: `${personalityLabels[leftPersonality]} Trust`,
        data: roundData.map((d) => d.leftTrust),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        fill: true,
      },
      {
        label: `${personalityLabels[leftPersonality]} Anxiety`,
        data: roundData.map((d) => d.leftAnxiety),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        fill: true,
      },
      {
        label: `${personalityLabels[rightPersonality]} Trust`,
        data: roundData.map((d) => d.rightTrust),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.3)",
        fill: true,
      },
      {
        label: `${personalityLabels[rightPersonality]} Anxiety`,
        data: roundData.map((d) => d.rightAnxiety),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.3)",
        fill: true,
      },
    ],
  };

  // Enhanced radar chart for final personality comparison with moral emotions
  const radarData = {
    labels: [
      "Trust",
      "Hope",
      "Optimism",
      "Anxiety",
      "Frustration",
      "Grudge",
      "Guilt",
      "Shame",
      "Pride",
      "Empathy",
      "Regret",
      "Vindication",
    ],
    datasets: [
      {
        label: personalityLabels[leftPersonality],
        data: [
          leftState.emotionalState.trust,
          leftState.emotionalState.hope,
          leftState.emotionalState.optimism,
          leftState.emotionalState.anxiety,
          leftState.emotionalState.frustration,
          leftState.emotionalState.grudge,
          leftState.emotionalState.guilt,
          leftState.emotionalState.shame,
          leftState.emotionalState.pride,
          leftState.emotionalState.empathy,
          leftState.emotionalState.regret,
          leftState.emotionalState.vindication,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
      },
      {
        label: personalityLabels[rightPersonality],
        data: [
          rightState.emotionalState.trust,
          rightState.emotionalState.hope,
          rightState.emotionalState.optimism,
          rightState.emotionalState.anxiety,
          rightState.emotionalState.frustration,
          rightState.emotionalState.grudge,
          rightState.emotionalState.guilt,
          rightState.emotionalState.shame,
          rightState.emotionalState.pride,
          rightState.emotionalState.empathy,
          rightState.emotionalState.regret,
          rightState.emotionalState.vindication,
        ],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Final Emotional State Comparison",
      },
    },
    scales: {
      r: {
        min: -10,
        max: 10,
      },
    },
  };

  // Get selected round data
  const selectedRoundData = selectedRound
    ? roundData.find((d) => d.round === selectedRound)
    : null;

  // Component for personality info dialog
  const PersonalityInfoDialog = ({
    personality,
  }: {
    personality: Personality;
  }) => {
    const details = dynamicPersonalityDetails[personality];

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {personalityLabels[personality]} - Complete Profile
            </DialogTitle>
            <DialogDescription>
              Deep psychological profile and background story
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Background Story */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-700">
                Background Story
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {details.background}
              </p>
            </div>

            {/* Core Personality */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">
                Core Personality
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {details.corePersonality}
              </p>
            </div>

            {/* Communication Style */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-purple-700">
                Communication Style
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {details.communicationStyle}
              </p>
            </div>

            {/* Psychological Traits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cognitive Biases */}
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Cognitive Biases</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {details.cognitiveBiases.map((bias, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {bias}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stress Triggers */}
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">
                  Stress Triggers
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {details.stressTriggers.map((trigger, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cooperation Motivations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">
                  Cooperation Motivations
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {details.cooperationMotivations.map((motivation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {motivation}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defection Triggers */}
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">
                  Defection Triggers
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {details.defectionTriggers.map((trigger, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Psychological Tendencies */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Emotional Tendencies
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.emotionalTendencies}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">Memory Style</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.memoryStyle}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Mood Variability
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.moodVariability}
                </p>
              </div>
            </div>

            {/* Enhanced Psychological Features */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Cultural Background
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.culturalBackground}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Social Learning Style
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.socialLearningStyle}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Moral Framework
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.moralFramework}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Personality Evolution Pattern
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.personalityEvolutionPattern}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Conflict Resolution Style
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.conflictResolutionStyle}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Trust Building Approach
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.trustBuildingApproach}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-600">
                  Stress Response Pattern
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details.stressResponsePattern}
                </p>
              </div>
            </div>

            {/* Summary Badge */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">
                Enhanced Personality Summary
              </h4>
              <p className="text-sm text-gray-600">
                This personality type represents a complex individual with
                unique psychological patterns, cognitive biases, emotional
                responses, cultural influences, social learning mechanisms, and
                personality evolution capabilities that will dynamically
                influence their decision-making throughout the prisoner's
                dilemma simulation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Replace the confusing analytics components with better ones
  // Real-time cooperation tracker
  const CooperationTracker = ({ roundData }: { roundData: RoundData[] }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see cooperation patterns
        </div>
      );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {roundData.filter((r) => r.leftCooperation).length}
            </div>
            <div className="text-sm text-gray-600">
              {personalityLabels[leftPersonality]} Cooperations
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {roundData.filter((r) => r.rightCooperation).length}
            </div>
            <div className="text-sm text-gray-600">
              {personalityLabels[rightPersonality]} Cooperations
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">
            Recent Moves (Last 10 rounds)
          </div>
          <div className="flex gap-1 justify-center">
            {roundData.slice(-10).map((round, index) => (
              <div key={index} className="flex flex-col gap-1">
                <div
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-bold border-2 ${
                    round.leftCooperation
                      ? "bg-blue-600 border-blue-700"
                      : "bg-red-600 border-red-700"
                  }`}
                >
                  {round.leftCooperation ? "C" : "D"}
                </div>
                <div
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-bold border-2 ${
                    round.rightCooperation
                      ? "bg-green-600 border-green-700"
                      : "bg-red-600 border-red-700"
                  }`}
                >
                  {round.rightCooperation ? "C" : "D"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Trust evolution tracker with split bar for negative/positive values
  const TrustEvolution = ({ roundData }: { roundData: RoundData[] }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see trust evolution
        </div>
      );

    const latest = roundData[roundData.length - 1];

    // Simple progress bar for trust and hope levels
    const SimpleProgressBar = ({
      value,
      color,
      label,
    }: {
      value: number;
      color: string;
      label: string;
    }) => {
      // Convert value from -10 to 10 range to 0 to 100 percentage
      const percentage = Math.max(0, Math.min(100, ((value + 10) / 20) * 100));
      const isPositive = value >= 0;

      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{label}</span>
            <span
              className={`font-bold ${
                isPositive ? "text-green-700" : "text-red-700"
              }`}
            >
              {value.toFixed(1)}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Player */}
          <div>
            <div className="text-sm font-medium text-blue-600 mb-3">
              {personalityLabels[leftPersonality]}
            </div>
            <div className="space-y-3">
              <SimpleProgressBar
                value={latest.leftTrust}
                color="bg-blue-500"
                label="Trust Level"
              />
              <SimpleProgressBar
                value={latest.leftHope}
                color="bg-yellow-500"
                label="Hope Level"
              />
            </div>
          </div>

          {/* Right Player */}
          <div>
            <div className="text-sm font-medium text-green-600 mb-3">
              {personalityLabels[rightPersonality]}
            </div>
            <div className="space-y-3">
              <SimpleProgressBar
                value={latest.rightTrust}
                color="bg-green-500"
                label="Trust Level"
              />
              <SimpleProgressBar
                value={latest.rightHope}
                color="bg-orange-500"
                label="Hope Level"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Strategy patterns analyzer with enhanced design
  const StrategyPatterns = ({ roundData }: { roundData: RoundData[] }) => {
    if (roundData.length < 3)
      return (
        <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-lg font-medium mb-2">Strategy Analysis</div>
          <div className="text-sm">Need more rounds to analyze patterns</div>
        </div>
      );

    // Simple pattern detection
    const leftCoops = roundData.filter((r) => r.leftCooperation).length;
    const rightCoops = roundData.filter((r) => r.rightCooperation).length;
    const total = roundData.length;

    const leftCoopRate = leftCoops / total;
    const rightCoopRate = rightCoops / total;

    // Helper function to get strategy classification with colors
    const getStrategyInfo = (coopRate: number) => {
      if (coopRate > 0.8)
        return {
          label: "Highly Cooperative",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "🤝",
        };
      if (coopRate > 0.5)
        return {
          label: "Moderately Cooperative",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "🤔",
        };
      if (coopRate > 0.2)
        return {
          label: "Moderately Competitive",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⚡",
        };
      return {
        label: "Highly Competitive",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "⚔️",
      };
    };

    const leftStrategy = getStrategyInfo(leftCoopRate);
    const rightStrategy = getStrategyInfo(rightCoopRate);

    // Determine relationship dynamic with colors
    const getRelationshipDynamic = () => {
      if (leftCoopRate > 0.7 && rightCoopRate > 0.7) {
        return {
          text: "Mutual Cooperation - High trust relationship",
          icon: "🤝",
          color: "bg-green-50 border-green-200 text-green-800",
        };
      }
      if (leftCoopRate < 0.3 && rightCoopRate < 0.3) {
        return {
          text: "Mutual Competition - Low trust relationship",
          icon: "⚔️",
          color: "bg-red-50 border-red-200 text-red-800",
        };
      }
      if (Math.abs(leftCoopRate - rightCoopRate) > 0.4) {
        return {
          text: "Asymmetric Relationship - One exploiting the other",
          icon: "⚖️",
          color: "bg-orange-50 border-orange-200 text-orange-800",
        };
      }
      return {
        text: "Balanced Competition - Strategic interaction",
        icon: "🔄",
        color: "bg-blue-50 border-blue-200 text-blue-800",
      };
    };

    const relationship = getRelationshipDynamic();

    return (
      <div className="space-y-6">
        {/* Individual Strategy Cards - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Player Strategy */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-blue-900">
                {personalityLabels[leftPersonality]}
              </div>
              <div className="text-2xl">{leftStrategy.icon}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  Cooperation Rate:
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {(leftCoopRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${leftCoopRate * 100}%` }}
                />
              </div>
              <Badge
                className={`${leftStrategy.color} border text-xs font-medium`}
              >
                {leftStrategy.label}
              </Badge>
            </div>
          </div>

          {/* Right Player Strategy */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-green-900">
                {personalityLabels[rightPersonality]}
              </div>
              <div className="text-2xl">{rightStrategy.icon}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  Cooperation Rate:
                </span>
                <span className="text-lg font-bold text-green-900">
                  {(rightCoopRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${rightCoopRate * 100}%` }}
                />
              </div>
              <Badge
                className={`${rightStrategy.color} border text-xs font-medium`}
              >
                {rightStrategy.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Relationship Dynamic */}
        <div className={`p-4 rounded-lg border-2 ${relationship.color}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{relationship.icon}</div>
            <div className="text-sm font-bold">Relationship Dynamic</div>
          </div>
          <div className="text-sm font-medium">{relationship.text}</div>
        </div>

        {/* Strategy Comparison */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-bold text-gray-800 mb-4">
            Cooperation Rate Comparison
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {personalityLabels[leftPersonality]}
              </span>
              <span className="text-sm font-bold text-blue-900">
                {(leftCoopRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${leftCoopRate * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-green-700">
                {personalityLabels[rightPersonality]}
              </span>
              <span className="text-sm font-bold text-green-900">
                {(rightCoopRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${rightCoopRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Live round tracker
  const LiveRoundTracker = ({
    round,
    gameCount,
    isRunning,
  }: {
    round: number;
    gameCount: number;
    isRunning: boolean;
  }) => {
    return (
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold">
          {isRunning
            ? `Round ${round}`
            : round === gameCount
            ? "Simulation Complete"
            : "Ready to Start"}
        </div>
        <div className="text-sm text-gray-600">
          {isRunning
            ? "Simulation in progress..."
            : round === gameCount
            ? "Analysis available below"
            : "Click 'Run Simulation' to begin"}
        </div>
        {isRunning && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  };

  // Update the personality change handlers
  const handleLeftPersonalityChange = (value: Personality) => {
    setLeftPersonality(value);
  };

  const handleRightPersonalityChange = (value: Personality) => {
    setRightPersonality(value);
  };

  // Add new enhanced psychological visualization components after the existing analytics components

  // Enhanced Moral Emotions Tracker - displays guilt, shame, pride, empathy, regret, vindication
  const MoralEmotionsTracker = ({ roundData }: { roundData: RoundData[] }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see moral emotions evolution
        </div>
      );

    const latest = roundData[roundData.length - 1];

    // Helper component for moral emotion display with enhanced styling
    const MoralEmotionBar = ({
      emotion,
      value,
      color,
      description,
    }: {
      emotion: string;
      value: number;
      color: string;
      description: string;
    }) => {
      const percentage = Math.max(0, Math.min(100, (value / 10) * 100));
      const intensity =
        value > 7
          ? "High"
          : value > 4
          ? "Moderate"
          : value > 1
          ? "Low"
          : "None";

      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 text-sm">
                {emotion}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  value > 7
                    ? "bg-red-100 text-red-700"
                    : value > 4
                    ? "bg-yellow-100 text-yellow-700"
                    : value > 1
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {intensity}
              </span>
            </div>
            <span className="font-bold text-sm">{value.toFixed(1)}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 italic">{description}</div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Player Moral Emotions */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span>🧠</span>
              {personalityLabels[leftPersonality]} - Moral Emotions
            </div>
            <div className="space-y-4">
              <MoralEmotionBar
                emotion="Guilt"
                value={latest.leftState?.emotionalState.guilt || 0}
                color="bg-red-500"
                description="Feeling bad about past defections or betrayals"
              />
              <MoralEmotionBar
                emotion="Shame"
                value={latest.leftState?.emotionalState.shame || 0}
                color="bg-red-600"
                description="Deeper self-condemnation about moral failures"
              />
              <MoralEmotionBar
                emotion="Pride"
                value={latest.leftState?.emotionalState.pride || 0}
                color="bg-green-500"
                description="Satisfaction with moral choices and achievements"
              />
              <MoralEmotionBar
                emotion="Empathy"
                value={latest.leftState?.emotionalState.empathy || 0}
                color="bg-purple-500"
                description="Understanding and sharing other's feelings"
              />
              <MoralEmotionBar
                emotion="Regret"
                value={latest.leftState?.emotionalState.regret || 0}
                color="bg-orange-500"
                description="Wishing past decisions had been different"
              />
              <MoralEmotionBar
                emotion="Vindication"
                value={latest.leftState?.emotionalState.vindication || 0}
                color="bg-indigo-500"
                description="Feeling justified in past suspicious choices"
              />
            </div>
          </div>

          {/* Right Player Moral Emotions */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
              <span>🧠</span>
              {personalityLabels[rightPersonality]} - Moral Emotions
            </div>
            <div className="space-y-4">
              <MoralEmotionBar
                emotion="Guilt"
                value={latest.rightState?.emotionalState.guilt || 0}
                color="bg-red-500"
                description="Feeling bad about past defections or betrayals"
              />
              <MoralEmotionBar
                emotion="Shame"
                value={latest.rightState?.emotionalState.shame || 0}
                color="bg-red-600"
                description="Deeper self-condemnation about moral failures"
              />
              <MoralEmotionBar
                emotion="Pride"
                value={latest.rightState?.emotionalState.pride || 0}
                color="bg-green-500"
                description="Satisfaction with moral choices and achievements"
              />
              <MoralEmotionBar
                emotion="Empathy"
                value={latest.rightState?.emotionalState.empathy || 0}
                color="bg-purple-500"
                description="Understanding and sharing other's feelings"
              />
              <MoralEmotionBar
                emotion="Regret"
                value={latest.rightState?.emotionalState.regret || 0}
                color="bg-orange-500"
                description="Wishing past decisions had been different"
              />
              <MoralEmotionBar
                emotion="Vindication"
                value={latest.rightState?.emotionalState.vindication || 0}
                color="bg-indigo-500"
                description="Feeling justified in past suspicious choices"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Social Learning Tracker - shows how personalities adapt strategies
  const SocialLearningTracker = ({ roundData }: { roundData: RoundData[] }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see social learning patterns
        </div>
      );

    const latest = roundData[roundData.length - 1];

    const LearningInsightCard = ({
      playerName,
      state,
      color,
    }: {
      playerName: string;
      state: DynamicPersonalityState | undefined;
      color: string;
    }) => {
      if (!state) return null;

      return (
        <div className={`bg-gradient-to-br ${color} p-4 rounded-lg border`}>
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🎓</span>
            {playerName} - Social Learning
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Recent Strategies Observed:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {state.socialLearning.observedStrategies.length > 0
                  ? state.socialLearning.observedStrategies
                      .slice(-3)
                      .map((strategy, index) => (
                        <div key={index} className="mb-1">
                          • {strategy.strategy}
                        </div>
                      ))
                  : "No strategies observed yet"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold">Adaptation:</span>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (state.socialLearning.adaptationTendency / 10) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <span className="font-semibold">Innovation:</span>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (state.socialLearning.innovationTendency / 10) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Strategic Repertoire:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {state.socialLearning.strategicRepertoire.length > 0
                  ? `${state.socialLearning.strategicRepertoire.length} strategies learned`
                  : "Building strategy knowledge..."}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LearningInsightCard
            playerName={personalityLabels[leftPersonality]}
            state={latest.leftState}
            color="from-blue-50 to-blue-100 border-blue-200"
          />
          <LearningInsightCard
            playerName={personalityLabels[rightPersonality]}
            state={latest.rightState}
            color="from-green-50 to-green-100 border-green-200"
          />
        </div>
      </div>
    );
  };

  // Cultural Context Tracker - shows how cultural values influence decisions
  const CulturalContextTracker = ({
    roundData,
  }: {
    roundData: RoundData[];
  }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see cultural influences
        </div>
      );

    const latest = roundData[roundData.length - 1];

    const CulturalProfileCard = ({
      playerName,
      state,
      color,
    }: {
      playerName: string;
      state: DynamicPersonalityState | undefined;
      color: string;
    }) => {
      if (!state) return null;

      const culturalMetrics = [
        {
          name: "Collectivism",
          value: state.culturalContext.collectivismScore,
          description: "Group vs individual focus",
        },
        {
          name: "Power Distance",
          value: state.culturalContext.powerDistanceComfort,
          description: "Comfort with hierarchy",
        },
        {
          name: "Uncertainty Avoidance",
          value: state.culturalContext.uncertaintyAvoidance,
          description: "Need for structure",
        },
        {
          name: "Competitiveness",
          value: state.culturalContext.competitivenessOrientation,
          description: "Winning vs harmony",
        },
        {
          name: "Time Orientation",
          value: state.culturalContext.timeOrientation,
          description: "Short vs long-term thinking",
        },
      ];

      return (
        <div className={`bg-gradient-to-br ${color} p-4 rounded-lg border`}>
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🌍</span>
            {playerName} - Cultural Context
          </div>
          <div className="space-y-3">
            {culturalMetrics.map((metric, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{metric.name}</span>
                  <span className="text-xs font-bold">
                    {metric.value.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metric.value / 10) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 italic">
                  {metric.description}
                </div>
              </div>
            ))}
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Recent Cultural Shifts:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded max-h-20 overflow-y-auto">
                {state.culturalContext.socialNorms.length > 0
                  ? state.culturalContext.socialNorms
                      .slice(-2)
                      .map((norm, index) => (
                        <div key={index} className="mb-1">
                          • {norm}
                        </div>
                      ))
                  : "No cultural shifts observed yet"}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CulturalProfileCard
            playerName={personalityLabels[leftPersonality]}
            state={latest.leftState}
            color="from-purple-50 to-purple-100 border-purple-200"
          />
          <CulturalProfileCard
            playerName={personalityLabels[rightPersonality]}
            state={latest.rightState}
            color="from-pink-50 to-pink-100 border-pink-200"
          />
        </div>
      </div>
    );
  };

  // Personality Evolution Tracker - shows how personalities change over time
  const PersonalityEvolutionTracker = ({
    roundData,
  }: {
    roundData: RoundData[];
  }) => {
    if (roundData.length === 0)
      return (
        <div className="text-gray-400 text-center p-8">
          Start simulation to see personality evolution
        </div>
      );

    const latest = roundData[roundData.length - 1];

    const EvolutionCard = ({
      playerName,
      state,
      color,
    }: {
      playerName: string;
      state: DynamicPersonalityState | undefined;
      color: string;
    }) => {
      if (!state) return null;

      return (
        <div className={`bg-gradient-to-br ${color} p-4 rounded-lg border`}>
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🔄</span>
            {playerName} - Personality Evolution
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold">Core Stability:</span>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (state.personalityEvolution.coreStability / 10) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <span className="font-semibold">Adaptive Capacity:</span>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (state.personalityEvolution.adaptiveCapacity / 10) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Recent Personality Changes:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded max-h-24 overflow-y-auto">
                {state.personalityEvolution.experienceImpact.length > 0
                  ? state.personalityEvolution.experienceImpact
                      .slice(-3)
                      .map((impact, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-semibold">
                            Round {impact.round}:
                          </span>{" "}
                          {impact.event}
                        </div>
                      ))
                  : "No significant personality changes yet"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Current Fluctuation:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {state.personalityFluctuation || "Personality stable"}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EvolutionCard
            playerName={personalityLabels[leftPersonality]}
            state={latest.leftState}
            color="from-amber-50 to-amber-100 border-amber-200"
          />
          <EvolutionCard
            playerName={personalityLabels[rightPersonality]}
            state={latest.rightState}
            color="from-teal-50 to-teal-100 border-teal-200"
          />
        </div>
      </div>
    );
  };

  // Enhanced Decision Analysis - shows moral reasoning and cultural influences
  const EnhancedDecisionAnalysis = ({
    selectedRoundData,
  }: {
    selectedRoundData: RoundData | null;
  }) => {
    if (!selectedRoundData) return null;

    const DecisionBreakdown = ({
      playerName,
      message,
      state,
      cooperation,
      color,
    }: {
      playerName: string;
      message: ChatMessage | undefined;
      state: DynamicPersonalityState | undefined;
      cooperation: boolean;
      color: string;
    }) => {
      if (!message || !state) return null;

      return (
        <div className={`bg-gradient-to-br ${color} p-4 rounded-lg border`}>
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>{cooperation ? "🤝" : "⚔️"}</span>
            {playerName} - Decision Analysis
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Decision:
              </div>
              <Badge
                className={
                  cooperation
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }
              >
                {cooperation ? "Cooperate" : "Defect"}
              </Badge>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Moral Reasoning:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {message.reasoning ||
                  message.text ||
                  "No moral reasoning provided"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Emotional Reflection:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {message.naturalReflection || "No reflection provided"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Cognitive Biases Active:
              </div>
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                {message.cognitiveBiases?.join(", ") || "None identified"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Emotion Weight:
                </div>
                <div className="text-xs font-bold">
                  {message.emotionVsLogicWeight?.emotion || 50}%
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Logic Weight:
                </div>
                <div className="text-xs font-bold">
                  {message.emotionVsLogicWeight?.logic || 50}%
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Moral Compass Strength:
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${(state.moralCompass.strength / 10) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DecisionBreakdown
            playerName={personalityLabels[leftPersonality]}
            message={selectedRoundData.leftMessage}
            state={selectedRoundData.leftState}
            cooperation={selectedRoundData.leftCooperation}
            color="from-blue-50 to-blue-100 border-blue-200"
          />
          <DecisionBreakdown
            playerName={personalityLabels[rightPersonality]}
            message={selectedRoundData.rightMessage}
            state={selectedRoundData.rightState}
            cooperation={selectedRoundData.rightCooperation}
            color="from-green-50 to-green-100 border-green-200"
          />
        </div>
      </div>
    );
  };

  // Component for topic info dialog
  const TopicInfoDialog = ({ topicValue }: { topicValue: TopicValue }) => {
    const explanation = topicExplanations[topicValue];

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 font-medium"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {explanation.title}
            </DialogTitle>
            <DialogDescription>{explanation.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Context */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-indigo-700">
                Scenario Context
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation.context}
              </p>
            </div>

            {/* Historical Background */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-700">
                Historical Background
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation.historicalBackground}
              </p>
            </div>

            {/* Game Theory Application */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">
                Game Theory Application
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation.gameTheoryApplication}
              </p>
            </div>

            {/* Psychological Factors */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-purple-700">
                Psychological Factors
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation.psychologicalFactors}
              </p>
            </div>

            {/* Real World Examples */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-700">
                Real World Examples
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {explanation.realWorldExamples.map(
                  (example: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {example}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Enhanced Psychological Game Theory Simulator
            </CardTitle>
            <p className="text-center text-gray-600 mb-4">
              Experience sophisticated human-like decision making with moral
              emotions, cultural influences, social learning, personality
              evolution, and dynamic narratives
            </p>

            {/* Enhanced Features Highlight */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 text-center">
                🧠 Advanced Psychological Modeling Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                  <div className="font-semibold text-red-700 mb-1">
                    🎭 Moral Emotions
                  </div>
                  <div className="text-gray-700">
                    Guilt, shame, pride, empathy, regret, and vindication drive
                    authentic moral decision-making
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                  <div className="font-semibold text-purple-700 mb-1">
                    🌍 Cultural Context
                  </div>
                  <div className="text-gray-700">
                    Collectivism, power distance, uncertainty avoidance, and
                    cultural values shape choices
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                  <div className="font-semibold text-green-700 mb-1">
                    🎓 Social Learning
                  </div>
                  <div className="text-gray-700">
                    Personalities observe, adapt, and build strategic
                    repertoires based on successful patterns
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                  <div className="font-semibold text-amber-700 mb-1">
                    🔄 Personality Evolution
                  </div>
                  <div className="text-gray-700">
                    Core traits gradually change through experiences while
                    maintaining individual stability
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Choose Personalities */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Choose Personalities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="left-player">Left Player</Label>
                    <PersonalityInfoDialog personality={leftPersonality} />
                  </div>
                  <Select
                    value={leftPersonality}
                    onValueChange={handleLeftPersonalityChange}
                  >
                    <SelectTrigger id="left-player">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {dynamicPersonalityDetails[
                      leftPersonality
                    ].background.substring(0, 150)}
                    ...
                    <div className="mt-1 text-blue-600 font-medium">
                      Click the info button above for complete profile →
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="right-player">Right Player</Label>
                    <PersonalityInfoDialog personality={rightPersonality} />
                  </div>
                  <Select
                    value={rightPersonality}
                    onValueChange={handleRightPersonalityChange}
                  >
                    <SelectTrigger id="right-player">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {dynamicPersonalityDetails[
                      rightPersonality
                    ].background.substring(0, 150)}
                    ...
                    <div className="mt-1 text-blue-600 font-medium">
                      Click the info button above for complete profile →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Topic</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <Select
                      value={selectedTopic}
                      onValueChange={handleTopicChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {topicOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTopic !== "custom" && (
                    <TopicInfoDialog topicValue={selectedTopic} />
                  )}
                </div>

                {selectedTopic === "custom" && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Textarea
                        placeholder="Enter your custom topic..."
                        value={customTopic}
                        onChange={(e) =>
                          handleCustomTopicChange(e.target.value)
                        }
                        className="min-h-[80px]"
                      />
                      {customTopic.trim().length > 0 && (
                        <TopicInfoDialog topicValue="custom" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Controls</h3>
              <div className="space-y-4">
                <Select
                  value={gameCount.toString()}
                  onValueChange={(value) =>
                    setGameCount(Number(value) as GameCount)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameCountOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg disabled:bg-gray-400 disabled:text-gray-200"
                  size="lg"
                >
                  {isRunning
                    ? "Running Dynamic Simulation..."
                    : `Run Dynamic Simulation (${gameCount} Rounds)`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replace the confusing Enhanced Analytics Section with better real-time analytics */}
        <div className="space-y-6">
          {/* Add back Scoring Explanation */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Scoring System</CardTitle>
              <p className="text-sm text-gray-600">
                Understanding how points are awarded in the Prisoner's Dilemma
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">
                      Point Values
                    </h4>
                    <ul className="space-y-2">
                      {Object.entries(scoringExplanation).map(
                        ([key, explanation]) => (
                          <li key={key} className="flex items-start gap-2">
                            <Badge className="whitespace-nowrap bg-gray-700 text-white font-semibold border-gray-800 px-2 py-1">
                              {key}
                            </Badge>
                            <span className="text-sm">{explanation}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">
                      Strategy Implications
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        • Highest individual payoff (5) comes from defecting
                        when the other cooperates
                      </li>
                      <li>
                        • Lowest individual payoff (0) comes from cooperating
                        when the other defects
                      </li>
                      <li>
                        • Mutual cooperation (3 each) is better than mutual
                        defection (1 each)
                      </li>
                      <li>
                        • There's always a temptation to defect for a higher
                        individual payoff
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Status */}
          <Card>
            <CardHeader>
              <CardTitle>Live Simulation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveRoundTracker
                round={round}
                gameCount={gameCount}
                isRunning={isRunning}
              />
            </CardContent>
          </Card>

          {/* Real-time Analytics Grid */}
          <div className="space-y-6">
            {/* Cooperation and Trust Levels Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cooperation Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <CooperationTracker roundData={roundData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trust & Hope Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrustEvolution roundData={roundData} />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Psychological Analysis Row */}
            <Card>
              <CardHeader>
                <CardTitle>Moral Emotions Analysis</CardTitle>
                <p className="text-sm text-gray-600">
                  Sophisticated emotional states including guilt, shame, pride,
                  empathy, regret, and vindication
                </p>
              </CardHeader>
              <CardContent>
                <MoralEmotionsTracker roundData={roundData} />
              </CardContent>
            </Card>

            {/* Social Learning and Cultural Context Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Learning Mechanisms</CardTitle>
                  <p className="text-sm text-gray-600">
                    How personalities adapt strategies based on observations
                  </p>
                </CardHeader>
                <CardContent>
                  <SocialLearningTracker roundData={roundData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cultural Context Influences</CardTitle>
                  <p className="text-sm text-gray-600">
                    How cultural background shapes decision-making patterns
                  </p>
                </CardHeader>
                <CardContent>
                  <CulturalContextTracker roundData={roundData} />
                </CardContent>
              </Card>
            </div>

            {/* Personality Evolution Row */}
            <Card>
              <CardHeader>
                <CardTitle>Personality Evolution Over Time</CardTitle>
                <p className="text-sm text-gray-600">
                  How personalities change and adapt based on experiences
                </p>
              </CardHeader>
              <CardContent>
                <PersonalityEvolutionTracker roundData={roundData} />
              </CardContent>
            </Card>

            {/* Strategy Analysis Row */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <StrategyPatterns roundData={roundData} />
              </CardContent>
            </Card>
          </div>

          {/* Add back Round Selection Interface */}
          {roundData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Round-by-Round Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Round Details</h3>
                  <div className="grid grid-cols-10 gap-1">
                    {roundData.map((data) => (
                      <Button
                        key={data.round}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRound(data.round)}
                        className={`text-xs font-semibold transition-all duration-200 ${
                          data.leftCooperation && data.rightCooperation
                            ? "bg-green-100 hover:bg-green-200 text-green-800"
                            : !data.leftCooperation && !data.rightCooperation
                            ? "bg-red-100 hover:bg-red-200 text-red-800"
                            : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                        } ${
                          selectedRound === data.round
                            ? "border-4 border-blue-600 shadow-md"
                            : "border-2 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {data.round}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-700 font-medium flex gap-4">
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
                      Mutual Cooperation
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
                      Mutual Defection
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                      Mixed
                    </span>
                    <span className="flex items-center gap-2 ml-4">
                      <div className="w-4 h-4 border-4 border-blue-600 bg-white rounded"></div>
                      Selected
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Selected Round Details */}
          {selectedRoundData && (
            <div className="space-y-6">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Round {selectedRoundData.round} - Enhanced Decision Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Deep psychological breakdown of moral reasoning, cultural
                    influences, and emotional factors
                  </p>
                </CardHeader>
                <CardContent>
                  <EnhancedDecisionAnalysis
                    selectedRoundData={selectedRoundData}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Round {selectedRoundData.round} - Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Player Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-600">
                        {personalityLabels[leftPersonality]}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Decision:</span>
                          <Badge
                            className={
                              selectedRoundData.leftCooperation
                                ? "bg-green-600 text-white font-semibold border-green-700"
                                : "bg-red-600 text-white font-semibold border-red-700"
                            }
                          >
                            {selectedRoundData.leftCooperation
                              ? "Cooperate"
                              : "Defect"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <strong>Points Gained:</strong>{" "}
                          {selectedRoundData.leftScore -
                            (selectedRoundData.round > 1
                              ? roundData[selectedRoundData.round - 2].leftScore
                              : 0)}{" "}
                          points
                        </div>
                        <div className="text-sm">
                          <strong>Emotional State:</strong>
                          <div className="ml-2 text-xs">
                            Trust: {selectedRoundData.leftTrust}/10, Hope:{" "}
                            {selectedRoundData.leftHope}/10, Anxiety:{" "}
                            {selectedRoundData.leftAnxiety}/10
                          </div>
                          <div className="ml-2 text-xs">
                            Guilt:{" "}
                            {selectedRoundData.leftState?.emotionalState
                              .guilt || 0}
                            /10, Pride:{" "}
                            {selectedRoundData.leftState?.emotionalState
                              .pride || 0}
                            /10, Empathy:{" "}
                            {selectedRoundData.leftState?.emotionalState
                              .empathy || 0}
                            /10
                          </div>
                        </div>
                        <div className="text-sm">
                          <strong>Total Score:</strong>{" "}
                          {selectedRoundData.leftScore}
                        </div>
                      </div>
                    </div>

                    {/* Right Player Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-600">
                        {personalityLabels[rightPersonality]}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Decision:</span>
                          <Badge
                            className={
                              selectedRoundData.rightCooperation
                                ? "bg-green-600 text-white font-semibold border-green-700"
                                : "bg-red-600 text-white font-semibold border-red-700"
                            }
                          >
                            {selectedRoundData.rightCooperation
                              ? "Cooperate"
                              : "Defect"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <strong>Points Gained:</strong>{" "}
                          {selectedRoundData.rightScore -
                            (selectedRoundData.round > 1
                              ? roundData[selectedRoundData.round - 2]
                                  .rightScore
                              : 0)}{" "}
                          points
                        </div>
                        <div className="text-sm">
                          <strong>Emotional State:</strong>
                          <div className="ml-2 text-xs">
                            Trust: {selectedRoundData.rightTrust}/10, Hope:{" "}
                            {selectedRoundData.rightHope}/10, Anxiety:{" "}
                            {selectedRoundData.rightAnxiety}/10
                          </div>
                          <div className="ml-2 text-xs">
                            Guilt:{" "}
                            {selectedRoundData.rightState?.emotionalState
                              .guilt || 0}
                            /10, Pride:{" "}
                            {selectedRoundData.rightState?.emotionalState
                              .pride || 0}
                            /10, Empathy:{" "}
                            {selectedRoundData.rightState?.emotionalState
                              .empathy || 0}
                            /10
                          </div>
                        </div>
                        <div className="text-sm">
                          <strong>Total Score:</strong>{" "}
                          {selectedRoundData.rightScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Keep the existing charts but only show them after simulation */}
          {round === gameCount && round > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Psychological Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Final Emotional State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <Card>
          <CardHeader>
            <CardTitle>Game Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className="text-sm bg-blue-600 text-white font-semibold border-blue-700 px-3 py-1">
                  Left Score: {scores.left}
                </Badge>
                <Badge className="text-sm bg-green-600 text-white font-semibold border-green-700 px-3 py-1">
                  Right Score: {scores.right}
                </Badge>
              </div>
              {round === gameCount && (
                <div className="text-center">
                  <Badge className="text-lg bg-purple-600 text-white font-bold border-purple-700 px-4 py-2">
                    {chatHistory[chatHistory.length - 1]?.text}
                  </Badge>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>
                    {round} / {gameCount} rounds
                  </span>
                </div>
                <Progress
                  value={(round / gameCount) * 100}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
