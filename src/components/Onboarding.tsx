import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { UserProfile } from "../App";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS = [
  "Technology",
  "Art",
  "Music",
  "Sports",
  "Travel",
  "Food",
  "Gaming",
  "Reading",
  "Movies",
  "Nature",
  "Science",
  "History",
];

const PROFICIENCY_QUESTIONS = [
  {
    character: "你",
    meaning: "you",
    pronunciation: "nǐ",
    difficulty: 1,
  },
  {
    character: "好",
    meaning: "good/hello",
    pronunciation: "hǎo",
    difficulty: 1,
  },
  {
    character: "水",
    meaning: "water",
    pronunciation: "shuǐ",
    difficulty: 1,
  },
  {
    character: "学",
    meaning: "study/learn",
    pronunciation: "xué",
    difficulty: 2,
  },
  {
    character: "朋",
    meaning: "friend",
    pronunciation: "péng",
    difficulty: 2,
  },
  {
    character: "快",
    meaning: "fast/quick",
    pronunciation: "kuài",
    difficulty: 3,
  },
  {
    character: "想",
    meaning: "think/want",
    pronunciation: "xiǎng",
    difficulty: 3,
  },
  {
    character: "复",
    meaning: "repeat/complex",
    pronunciation: "fù",
    difficulty: 4,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<
    string[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleAnswerQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    if (currentQuestion < PROFICIENCY_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const calculateProficiency = () => {
    const accuracy =
      correctAnswers / PROFICIENCY_QUESTIONS.length;
    const estimatedCharacters = Math.floor(accuracy * 500); // Estimate known characters
    return {
      level: Math.min(Math.floor(accuracy * 10), 10),
      knownCharacters: estimatedCharacters,
    };
  };

  const handleComplete = () => {
    const { level, knownCharacters } = calculateProficiency();
    const profile: UserProfile = {
      name,
      age: parseInt(age),
      interests: selectedInterests,
      proficiencyLevel: level,
      knownCharacters,
    };
    onComplete(profile);
  };

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome to Wision
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="age">How old are you?</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!name || !age}
                className="w-full"
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>
                  What are your interests? (Select 3-5)
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        selectedInterests.includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer justify-center py-2"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedInterests.length < 3}
                className="w-full"
              >
                Continue to Test
              </Button>
            </div>
          )}

          {step === 3 && !testCompleted && (
            <div className="space-y-4">
              <div className="text-center">
                <h3>Proficiency Test</h3>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of{" "}
                  {PROFICIENCY_QUESTIONS.length}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {
                    PROFICIENCY_QUESTIONS[currentQuestion]
                      .character
                  }
                </div>
                <p>What does this character mean?</p>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAnswerQuestion(true)}
                  >
                    {
                      PROFICIENCY_QUESTIONS[currentQuestion]
                        .meaning
                    }
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAnswerQuestion(false)}
                  >
                    Different meaning
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAnswerQuestion(false)}
                  >
                    I don't know
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && testCompleted && (
            <div className="space-y-4 text-center">
              <h3>Test Complete!</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  You got {correctAnswers} out of{" "}
                  {PROFICIENCY_QUESTIONS.length} correct!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated characters known:{" "}
                  {calculateProficiency().knownCharacters}
                </p>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full"
              >
                Start Learning!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}