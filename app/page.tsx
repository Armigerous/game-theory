"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

type Personality = "diplomat" | "opportunist" | "skeptic" | "altruist" | "pragmatist"
type ChatMessage = { speaker: "L" | "R"; text: string }
type Scores = { left: number; right: number }

const personalityLabels: Record<Personality, string> = {
  diplomat: "The Diplomat",
  opportunist: "The Opportunist",
  skeptic: "The Skeptic",
  altruist: "The Altruist",
  pragmatist: "The Pragmatist",
}

const personalityOptions = Object.entries(personalityLabels).map(([value, label]) => ({
  value: value as Personality,
  label,
}))

// Payoff matrix: [left_score, right_score]
const payoffMatrix = {
  CC: [3, 3], // Both cooperate
  CD: [0, 5], // Left cooperates, right defects
  DC: [5, 0], // Left defects, right cooperates
  DD: [1, 1], // Both defect
}

export default function GameTheorySimulator() {
  const [leftPersonality, setLeftPersonality] = useState<Personality>("diplomat")
  const [rightPersonality, setRightPersonality] = useState<Personality>("opportunist")
  const [topic, setTopic] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [scores, setScores] = useState<Scores>({ left: 0, right: 0 })
  const [round, setRound] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // TODO: Replace with actual OpenAI API calls
  const runSimulation = async () => {
    setIsRunning(true)
    setChatHistory([])
    setScores({ left: 0, right: 0 })
    setRound(0)

    const cooperationMessages = {
      diplomat: "I believe cooperation serves our mutual interests.",
      opportunist: "Cooperation might benefit me this round.",
      skeptic: "I'll cooperate, but I'm watching you closely.",
      altruist: "I choose to cooperate for the greater good.",
      pragmatist: "Cooperation seems like the logical choice here.",
    }

    const defectionMessages = {
      diplomat: "I must reluctantly choose to defect this time.",
      opportunist: "I see an opportunity to gain an advantage.",
      skeptic: "I don't trust you - I'm defecting.",
      altruist: "Sometimes defection is necessary for the greater good.",
      pragmatist: "The data suggests defection is optimal.",
    }

    const currentScores = { left: 0, right: 0 }

    for (let i = 1; i <= 50; i++) {
      // Randomly choose cooperation (C) or defection (D) for each player
      const leftChoice = Math.random() > 0.5 ? "C" : "D"
      const rightChoice = Math.random() > 0.5 ? "C" : "D"

      // Calculate scores using payoff matrix
      const outcome = (leftChoice + rightChoice) as keyof typeof payoffMatrix
      const [leftPoints, rightPoints] = payoffMatrix[outcome]

      currentScores.left += leftPoints
      currentScores.right += rightPoints

      // Generate chat messages
      const leftMessage = leftChoice === "C" ? cooperationMessages[leftPersonality] : defectionMessages[leftPersonality]

      const rightMessage =
        rightChoice === "C" ? cooperationMessages[rightPersonality] : defectionMessages[rightPersonality]

      // Add messages to chat
      setChatHistory((prev) => [
        ...prev,
        { speaker: "L", text: `Round ${i}: ${leftMessage}` },
        { speaker: "R", text: `Round ${i}: ${rightMessage}` },
      ])

      // Update scores and round
      setScores({ ...currentScores })
      setRound(i)

      // 50ms delay to animate progress
      await new Promise((r) => setTimeout(r, 50))
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Game Theory Simulator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Choose Personalities */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Choose Personalities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="left-player">Left Player</Label>
                  <Select value={leftPersonality} onValueChange={(value: Personality) => setLeftPersonality(value)}>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="right-player">Right Player</Label>
                  <Select value={rightPersonality} onValueChange={(value: Personality) => setRightPersonality(value)}>
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
                </div>
              </div>
            </div>

            {/* Topic */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Topic</h3>
              <Textarea
                placeholder="e.g. Nuclear disarmament"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Controls */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Controls</h3>
              <Button onClick={runSimulation} disabled={isRunning} className="w-full" size="lg">
                {isRunning ? "Running Simulation..." : "Run Simulation (50 Rounds)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chat Area */}
            <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center">Chat messages will appear here during simulation...</p>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.speaker === "L" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.speaker === "L" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
                        }`}
                      >
                        <div className="font-mono text-xs font-bold mb-1">
                          {message.speaker === "L"
                            ? `L (${personalityLabels[leftPersonality]})`
                            : `R (${personalityLabels[rightPersonality]})`}
                        </div>
                        <div className="text-sm">{message.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scoreboard */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-sm">
                  Left Score: {scores.left}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Right Score: {scores.right}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{round} / 50 rounds</span>
                </div>
                <Progress value={(round / 50) * 100} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
