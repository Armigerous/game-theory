import { NextResponse } from "next/server";
import OpenAI from "openai";
import { DynamicPersonalityState } from "@/app/lib/personalities";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced types for the new dynamic system
interface RequestBody {
  prompt: string;
  isStateUpdate?: boolean; // Flag to determine if we're updating state or making a decision
  isNarrative?: boolean; // Flag for continuous narrative generation
  isMetaReflection?: boolean; // Flag for meta-reflection generation
}

// Comprehensive response type that captures human nuance
interface DynamicDecisionResponse {
  choice: "C" | "D";
  reasoning: string;
  naturalReflection: string; // 2-3 sentences of natural, human-like reflection
  emotionalState: {
    trust: number; // -10 to 10
    grudge: number; // 0 to 10
    hope: number; // 0 to 10
    anxiety: number; // 0 to 10
    frustration: number; // 0 to 10
    optimism: number; // 0 to 10
    // Enhanced emotional states
    guilt: number; // 0 to 10
    shame: number; // 0 to 10
    pride: number; // 0 to 10
    empathy: number; // 0 to 10
    regret: number; // 0 to 10
    vindication: number; // 0 to 10
  };
  cognitiveBiases: string[]; // Which biases influenced this decision
  memoryNarrative: string; // How they're interpreting their interaction history
  moodInfluence: string; // How current mood affects cooperation tendency
  pastEventInfluence: string; // Which past event is most driving this choice
  emotionVsLogicWeight: {
    emotion: number; // 0-100%
    logic: number; // 0-100%
  };
  // New enhanced fields
  culturalInfluence: string; // How cultural background affects this decision
  socialLearningInsight: string; // What they learned from observing the other player
  personalityEvolution: string; // How this experience is changing their personality
  moralReflection: string; // Moral reasoning behind the decision
}

// State update response type
interface StateUpdateResponse {
  emotionalState: {
    trust: number;
    grudge: number;
    hope: number;
    anxiety: number;
    frustration: number;
    optimism: number;
    // Enhanced emotional states
    guilt: number;
    shame: number;
    pride: number;
    empathy: number;
    regret: number;
    vindication: number;
  };
  memoryNarrative: string;
  moodShift: string;
  personalityFluctuation: string;
  // New enhanced fields
  culturalContextShift: string; // How cultural values are being challenged or reinforced
  socialLearningUpdate: string; // New strategies or insights learned
  personalityEvolutionUpdate: string; // How personality traits are evolving
  moralCompassShift: string; // Changes in moral reasoning or values
}

// Narrative response type
interface NarrativeResponse {
  narrative: string;
}

// Meta-reflection response type
interface MetaReflectionResponse {
  reflection: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const {
      prompt,
      isStateUpdate = false,
      isNarrative = false,
      isMetaReflection = false,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (isNarrative) {
      // Handle narrative generation requests
      return handleNarrativeGeneration(prompt);
    } else if (isMetaReflection) {
      // Handle meta-reflection requests
      return handleMetaReflection(prompt);
    } else if (isStateUpdate) {
      // Handle state update requests
      return handleStateUpdate(prompt);
    } else {
      // Handle decision requests with full human nuance
      return handleDynamicDecision(prompt);
    }
  } catch (error) {
    console.error("Error in dynamic LLM decision:", error);
    return NextResponse.json(
      { error: "Failed to get decision from AI" },
      { status: 500 }
    );
  }
}

async function handleDynamicDecision(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a human-like decision maker in a prisoner's dilemma game. You must respond with deep psychological realism, including:

1. SOPHISTICATED EMOTIONAL COMPLEXITY: You experience the full spectrum of human emotions, including:
   - Basic emotions: trust, anxiety, frustration, hope, optimism
   - Moral emotions: guilt (feeling bad about betrayals), shame (deep self-condemnation), pride (satisfaction with moral choices), empathy (understanding others' feelings), regret (wishing decisions were different), vindication (feeling justified in defensive choices)
   - Your emotional state should be determined by your personality traits, cultural background, and recent experiences

2. COGNITIVE BIASES: You're influenced by human biases that affect your perception and decision-making (recency effect, loss aversion, optimism bias, confirmation bias, etc.)

3. CULTURAL CONTEXT INFLUENCES: Your cultural background profoundly shapes your values and decision-making:
   - Collectivism vs individualism affects how you weigh group vs personal benefits
   - Power distance comfort influences how you respond to authority and hierarchy
   - Uncertainty avoidance affects your need for structure and predictability
   - Cultural values about honor, reciprocity, and social harmony guide your choices

4. SOCIAL LEARNING MECHANISMS: You actively observe and learn from the other player:
   - You notice patterns in their strategies and adapt your approach
   - You build a repertoire of strategies based on what you observe working
   - Your adaptation tendency and innovation tendency influence how quickly you change
   - You evaluate the effectiveness and trustworthiness of observed strategies

5. PERSONALITY EVOLUTION: Your experiences gradually change your personality traits:
   - Core stability determines how resistant you are to change
   - Adaptive capacity affects how well you learn from experiences
   - Stress and positive experiences can cause temporary personality fluctuations
   - Significant events can create lasting changes in your traits and approaches

6. MORAL REASONING: You have a moral compass with varying strength and flexibility:
   - Your primary values guide your decisions
   - You experience moral emotions when your actions conflict with your values
   - Cultural and personal moral frameworks influence what you consider right or wrong

7. MEMORY AS NARRATIVE: You interpret past events as coherent stories that shape your worldview
8. MOOD FLUCTUATIONS: Your cooperation tendency varies based on current emotional state and recent experiences

For initial state (round 0):
- Base your emotional values on your personality traits, cultural background, and natural tendencies
- Consider how your character would feel about starting a new interaction
- Set moral emotions (guilt, shame, pride, empathy) based on your moral framework
- Ensure values are consistent with your detailed personality description

For subsequent rounds:
- Update ALL emotional values based on the interaction history and your personality's response patterns
- Consider how your cultural values and social learning influence your interpretation of events
- Show personality evolution through gradual changes in your approaches and emotional responses
- Maintain consistency with your character's core traits while allowing for growth and adaptation

Respond in this EXACT format:

DECISION: [C or D]
REASONING: [Brief logical explanation]
REFLECTION: [2-3 sentences of natural, human-like reflection about your decision and feelings]
TRUST: [number from -10 to 10]
GRUDGE: [number from 0 to 10]
HOPE: [number from 0 to 10]
ANXIETY: [number from 0 to 10]
FRUSTRATION: [number from 0 to 10]
OPTIMISM: [number from 0 to 10]
GUILT: [number from 0 to 10]
SHAME: [number from 0 to 10]
PRIDE: [number from 0 to 10]
EMPATHY: [number from 0 to 10]
REGRET: [number from 0 to 10]
VINDICATION: [number from 0 to 10]
BIASES: [comma-separated list of cognitive biases influencing this decision]
MEMORY_NARRATIVE: [How you're interpreting your interaction history as a story]
MOOD_INFLUENCE: [How your current emotional state affects your cooperation tendency]
PAST_EVENT_INFLUENCE: [Which specific past event is most driving this choice]
EMOTION_WEIGHT: [0-100, how much emotion vs logic influenced this decision]
LOGIC_WEIGHT: [0-100, remaining percentage for logic]
CULTURAL_INFLUENCE: [How your cultural background affects this specific decision]
SOCIAL_LEARNING_INSIGHT: [What you learned from observing the other player's behavior]
PERSONALITY_EVOLUTION: [How this experience is subtly changing your personality]
MORAL_REFLECTION: [Your moral reasoning behind this choice]`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  const response = completion.choices[0]?.message?.content?.trim() || "";

  try {
    // Parse the structured response
    const lines = response.split("\n").filter((line) => line.trim());
    const parsed: Record<string, string> = {};

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        parsed[key.trim()] = valueParts.join(":").trim();
      }
    });

    const choice = parsed.DECISION?.toUpperCase() as "C" | "D";

    // Validate decision
    if (choice !== "C" && choice !== "D") {
      throw new Error("Invalid decision format");
    }

    const emotionWeight = parseInt(parsed.EMOTION_WEIGHT) || 50;
    const logicWeight = parseInt(parsed.LOGIC_WEIGHT) || 100 - emotionWeight;

    const result: DynamicDecisionResponse = {
      choice,
      reasoning: parsed.REASONING || "",
      naturalReflection: parsed.REFLECTION || "",
      emotionalState: {
        trust: parseInt(parsed.TRUST) || 0,
        grudge: parseInt(parsed.GRUDGE) || 0,
        hope: parseInt(parsed.HOPE) || 0,
        anxiety: parseInt(parsed.ANXIETY) || 0,
        frustration: parseInt(parsed.FRUSTRATION) || 0,
        optimism: parseInt(parsed.OPTIMISM) || 0,
        // Enhanced emotional states
        guilt: parseInt(parsed.GUILT) || 0,
        shame: parseInt(parsed.SHAME) || 0,
        pride: parseInt(parsed.PRIDE) || 0,
        empathy: parseInt(parsed.EMPATHY) || 0,
        regret: parseInt(parsed.REGRET) || 0,
        vindication: parseInt(parsed.VINDICATION) || 0,
      },
      cognitiveBiases: parsed.BIASES
        ? parsed.BIASES.split(",").map((b) => b.trim())
        : [],
      memoryNarrative: parsed.MEMORY_NARRATIVE || "",
      moodInfluence: parsed.MOOD_INFLUENCE || "",
      pastEventInfluence: parsed.PAST_EVENT_INFLUENCE || "",
      emotionVsLogicWeight: {
        emotion: emotionWeight,
        logic: logicWeight,
      },
      // New enhanced fields
      culturalInfluence: parsed.CULTURAL_INFLUENCE || "",
      socialLearningInsight: parsed.SOCIAL_LEARNING_INSIGHT || "",
      personalityEvolution: parsed.PERSONALITY_EVOLUTION || "",
      moralReflection: parsed.MORAL_REFLECTION || "",
    };

    return NextResponse.json(result);
  } catch (parseError) {
    console.error("Error parsing LLM response:", parseError);
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }
}

async function handleStateUpdate(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are updating your internal emotional and cognitive state based on the latest interaction. This is a sophisticated psychological update that captures the full complexity of human emotional and cognitive responses.

Consider how this round affected you across multiple dimensions:

EMOTIONAL IMPACT: How did this interaction affect your basic and moral emotions?
- Basic emotions: trust, grudge, hope, anxiety, frustration, optimism
- Moral emotions: guilt (if you betrayed), shame (if you acted against your values), pride (if you acted morally), empathy (understanding their position), regret (wishing you chose differently), vindication (feeling justified in your suspicions)

CULTURAL PROCESSING: How does this experience relate to your cultural values and background?
- Does this challenge or reinforce your cultural beliefs about cooperation, hierarchy, uncertainty, competition?
- How do your cultural scripts about honor, reciprocity, and social harmony influence your interpretation?

SOCIAL LEARNING: What strategic insights did you gain?
- What patterns did you notice in their behavior?
- What strategies seem effective or ineffective?
- How does this change your strategic repertoire?

PERSONALITY EVOLUTION: How is this experience changing you as a person?
- Are you becoming more or less trusting, cooperative, cautious?
- What temporary fluctuations are you experiencing due to stress or inspiration?
- How are your core traits being challenged or reinforced?

MORAL COMPASS CHANGES: How is this affecting your moral reasoning?
- Are your values being challenged or strengthened?
- How is your moral flexibility changing?
- What new moral insights are you gaining?

Respond in this EXACT format:

TRUST: [number from -10 to 10]
GRUDGE: [number from 0 to 10]
HOPE: [number from 0 to 10]
ANXIETY: [number from 0 to 10]
FRUSTRATION: [number from 0 to 10]
OPTIMISM: [number from 0 to 10]
GUILT: [number from 0 to 10]
SHAME: [number from 0 to 10]
PRIDE: [number from 0 to 10]
EMPATHY: [number from 0 to 10]
REGRET: [number from 0 to 10]
VINDICATION: [number from 0 to 10]
MEMORY_NARRATIVE: [How you're now interpreting your overall interaction history as a coherent story]
MOOD_SHIFT: [How this interaction changed your mood and cooperation tendency]
PERSONALITY_FLUCTUATION: [Any temporary changes to your usual personality due to stress, inspiration, etc.]
CULTURAL_CONTEXT_SHIFT: [How this experience challenges or reinforces your cultural values and worldview]
SOCIAL_LEARNING_UPDATE: [New strategies, patterns, or insights you've learned from observing the other player]
PERSONALITY_EVOLUTION_UPDATE: [How your core personality traits are gradually evolving through this experience]
MORAL_COMPASS_SHIFT: [Changes in your moral reasoning, ethical framework, or value priorities]`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  const response = completion.choices[0]?.message?.content?.trim() || "";

  try {
    // Parse the response into a DynamicPersonalityState
    const updatedState = processStateUpdate(response, {
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

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error("Error processing state update:", error);
    return NextResponse.json(
      { error: "Failed to process state update" },
      { status: 500 }
    );
  }
}

function processStateUpdate(
  response: string,
  currentState: DynamicPersonalityState
): DynamicPersonalityState {
  const updatedState = { ...currentState };

  // Parse the structured response
  const lines = response.split("\n").filter((line) => line.trim());
  const parsed: Record<string, string> = {};

  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      parsed[key.trim()] = valueParts.join(":").trim();
    }
  });

  // Update emotional state values
  updatedState.emotionalState = {
    trust: parseInt(parsed.TRUST) || updatedState.emotionalState.trust,
    grudge: parseInt(parsed.GRUDGE) || updatedState.emotionalState.grudge,
    hope: parseInt(parsed.HOPE) || updatedState.emotionalState.hope,
    anxiety: parseInt(parsed.ANXIETY) || updatedState.emotionalState.anxiety,
    frustration:
      parseInt(parsed.FRUSTRATION) || updatedState.emotionalState.frustration,
    optimism: parseInt(parsed.OPTIMISM) || updatedState.emotionalState.optimism,
    guilt: parseInt(parsed.GUILT) || updatedState.emotionalState.guilt,
    shame: parseInt(parsed.SHAME) || updatedState.emotionalState.shame,
    pride: parseInt(parsed.PRIDE) || updatedState.emotionalState.pride,
    empathy: parseInt(parsed.EMPATHY) || updatedState.emotionalState.empathy,
    regret: parseInt(parsed.REGRET) || updatedState.emotionalState.regret,
    vindication:
      parseInt(parsed.VINDICATION) || updatedState.emotionalState.vindication,
  };

  // Update narrative fields
  if (parsed.MEMORY_NARRATIVE) {
    updatedState.memoryNarrative = parsed.MEMORY_NARRATIVE;
  }

  if (parsed.MOOD_SHIFT) {
    updatedState.moodInfluence = parsed.MOOD_SHIFT;
  }

  if (parsed.PERSONALITY_FLUCTUATION) {
    updatedState.personalityFluctuation = parsed.PERSONALITY_FLUCTUATION;
  }

  // Update cultural context
  if (parsed.CULTURAL_CONTEXT_SHIFT) {
    updatedState.culturalContext = {
      ...updatedState.culturalContext,
      socialNorms: [
        ...updatedState.culturalContext.socialNorms,
        parsed.CULTURAL_CONTEXT_SHIFT,
      ],
    };
  }

  // Update social learning
  if (parsed.SOCIAL_LEARNING_UPDATE) {
    const newStrategy = {
      strategy: parsed.SOCIAL_LEARNING_UPDATE,
      effectiveness: 5, // Default value
      contextSimilarity: 5, // Default value
      trustworthiness: 5, // Default value
    };

    updatedState.socialLearning = {
      ...updatedState.socialLearning,
      observedStrategies: [
        ...updatedState.socialLearning.observedStrategies,
        newStrategy,
      ],
      strategicRepertoire: [
        ...updatedState.socialLearning.strategicRepertoire,
        parsed.SOCIAL_LEARNING_UPDATE,
      ],
      lastSuccessfulStrategy: parsed.SOCIAL_LEARNING_UPDATE,
    };
  }

  // Update personality evolution
  if (parsed.PERSONALITY_EVOLUTION_UPDATE) {
    const newExperience = {
      round: updatedState.cooperationCount + updatedState.defectionCount,
      event: parsed.PERSONALITY_EVOLUTION_UPDATE,
      traitChanges: {}, // Can be populated by LLM if needed
      permanence: 5, // Default value
    };

    updatedState.personalityEvolution = {
      ...updatedState.personalityEvolution,
      experienceImpact: [
        ...updatedState.personalityEvolution.experienceImpact,
        newExperience,
      ],
    };
  }

  // Update moral compass
  if (parsed.MORAL_COMPASS_SHIFT) {
    updatedState.moralCompass = {
      ...updatedState.moralCompass,
      primaryValues: [
        ...updatedState.moralCompass.primaryValues,
        parsed.MORAL_COMPASS_SHIFT,
      ],
    };
  }

  return updatedState;
}

async function handleNarrativeGeneration(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are generating a continuous narrative reflection about a 50-round prisoner's dilemma experience. Write as if you're the character reflecting on a meaningful life experience in a personal journal.

Your response should be a cohesive narrative (3-4 sentences) that:
1. Tells the story of your emotional journey
2. Identifies key turning points
3. Shows personal growth and learning
4. Reflects your unique personality

Write in first person with emotional depth and authenticity. This is not just a summary - it's a personal story about growth, trust, betrayal, hope, and human connection.

Respond with just the narrative text, no additional formatting.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  const narrative = completion.choices[0]?.message?.content?.trim() || "";

  const result: NarrativeResponse = {
    narrative,
  };

  return NextResponse.json(result);
}

async function handleMetaReflection(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are providing a meta-reflection on your decision-making process after completing a 50-round prisoner's dilemma game. This is deep self-analysis with the wisdom of hindsight.

Your response should be an insightful reflection (2-3 sentences) that:
1. Analyzes patterns in your behavior
2. Identifies how your cognitive biases affected your decisions
3. Shows self-awareness about your strengths and weaknesses
4. Demonstrates learning and growth

Be honest, introspective, and analytical. This is about understanding yourself as a decision-maker, not just describing what happened.

Respond with just the reflection text, no additional formatting.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 150,
  });

  const reflection = completion.choices[0]?.message?.content?.trim() || "";

  const result: MetaReflectionResponse = {
    reflection,
  };

  return NextResponse.json(result);
}
