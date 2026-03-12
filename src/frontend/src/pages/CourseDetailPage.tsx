import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Loader2,
  MessageCircle,
  Send,
  Video,
} from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAllCategories, useCourse, useQuiz } from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface CourseDetailPageProps {
  courseId: string;
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function generateFallbackQuiz(courseTitle: string): QuizQuestion[] {
  return [
    {
      question: `What is the main topic of "${courseTitle}"?`,
      options: [
        "Fundamentals and core concepts",
        "Advanced techniques only",
        "Historical context",
        "Unrelated subject matter",
      ],
      correctIndex: BigInt(0),
    },
    {
      question: `Which skill level is "${courseTitle}" most suitable for?`,
      options: [
        "Beginners to intermediates",
        "PhD researchers only",
        "Industry veterans only",
        "None of the above",
      ],
      correctIndex: BigInt(0),
    },
    {
      question: `What is the best way to learn from "${courseTitle}"?`,
      options: [
        "Practice exercises and application",
        "Only reading theory",
        "Memorizing definitions",
        "Skipping examples",
      ],
      correctIndex: BigInt(0),
    },
    {
      question: `Which resource complements "${courseTitle}" best?`,
      options: [
        "Hands-on projects",
        "Watching unrelated videos",
        "Avoiding practice",
        "Only flashcards",
      ],
      correctIndex: BigInt(0),
    },
    {
      question: `After completing "${courseTitle}", learners should be able to?`,
      options: [
        "Apply key concepts to real problems",
        "Teach others immediately",
        "Only pass exams",
        "None of the above",
      ],
      correctIndex: BigInt(0),
    },
  ];
}

function QuizSection({
  courseId,
  courseTitle,
  theme,
}: { courseId: bigint; courseTitle: string; theme: ThemeConfig }) {
  const { data: quiz, isLoading } = useQuiz(courseId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = quiz?.questions ?? generateFallbackQuiz(courseTitle);

  const score = submitted
    ? questions.reduce((acc, q, i) => {
        return answers[i] === Number(q.correctIndex) ? acc + 1 : acc;
      }, 0)
    : 0;

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  return (
    <div data-ocid="course.quiz_section" className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: theme.primaryColor }}
        >
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            AI Knowledge Quiz
          </h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions
          </p>
        </div>
      </div>

      {submitted ? (
        <div
          className="p-6 rounded-2xl text-center border"
          style={{
            borderColor:
              score >= 3 ? "oklch(0.65 0.18 145)" : "oklch(0.6 0.22 25)",
          }}
        >
          <div
            className="text-5xl font-display font-bold mb-2"
            style={{
              color: score >= 3 ? theme.primaryColor : "oklch(0.65 0.22 25)",
            }}
          >
            {score}/{questions.length}
          </div>
          <p className="text-lg font-medium text-foreground">
            {score >= 4
              ? "Excellent! 🎉"
              : score >= 3
                ? "Good job! 👍"
                : "Keep studying! 📚"}
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            variant="outline"
          >
            Retake Quiz
          </Button>
        </div>
      ) : (
        <>
          {questions.map((q, qi) => (
            <div
              key={q.question.slice(0, 20)}
              className="p-5 rounded-xl bg-muted/30 border border-border/50"
            >
              <p className="font-medium text-foreground mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    className={`p-3 rounded-lg text-left text-sm font-medium border transition-all ${
                      answers[qi] === oi
                        ? "text-white border-transparent"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                    style={
                      answers[qi] === oi
                        ? {
                            background: theme.primaryColor,
                            borderColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            data-ocid="course.quiz_submit_button"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full h-12 font-semibold"
            style={{ background: theme.primaryColor }}
          >
            Submit Quiz ({Object.keys(answers).length}/{questions.length}{" "}
            answered)
          </Button>
        </>
      )}
    </div>
  );
}

function DoubtChat({
  courseId,
  theme,
}: { courseId: bigint; theme: ThemeConfig }) {
  const { actor } = useActor();
  let msgId = 0;
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string; id: number }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendDoubt = async () => {
    if (!input.trim() || !actor) return;
    const q = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q, id: ++msgId }]);
    setLoading(true);
    try {
      const answer = await actor.askDoubt(courseId, q);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: answer, id: ++msgId },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Sorry, I couldn't process your question. Please try again.",
          id: ++msgId,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${theme.accentColor}33` }}
        >
          <MessageCircle
            className="w-5 h-5"
            style={{ color: theme.accentColor }}
          />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            AI Doubt Solver
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask anything about this course
          </p>
        </div>
      </div>

      <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Ask a question to get AI-powered help</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "text-white"
                  : "bg-muted/50 text-foreground"
              }`}
              style={
                msg.role === "user" ? { background: theme.primaryColor } : {}
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 px-4 py-3 rounded-2xl">
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: theme.primaryColor }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          data-ocid="course.doubt_input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendDoubt();
            }
          }}
          placeholder="Ask your doubt here..."
          className="min-h-[60px] resize-none"
          rows={2}
        />
        <Button
          data-ocid="course.doubt_send_button"
          onClick={() => void sendDoubt()}
          disabled={loading || !input.trim() || !actor}
          className="h-auto px-4"
          style={{ background: theme.primaryColor }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {!actor && (
        <p className="text-xs text-muted-foreground text-center">
          Sign in to use AI Doubt Solver
        </p>
      )}
    </div>
  );
}

export default function CourseDetailPage({
  courseId,
  theme,
  onNavigate,
}: CourseDetailPageProps) {
  const id = BigInt(courseId);
  const { data: course, isLoading } = useCourse(id);
  const { data: categories } = useAllCategories();

  const category = categories?.find((c) => c.id === course?.categoryId);

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-24 w-full" />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Course not found
        </h2>
        <Button className="mt-4" onClick={() => onNavigate("home")}>
          Go Home
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.heroBgFrom} 0%, ${theme.heroBgTo} 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="free-badge text-xs px-3 py-1 rounded-full">
              FREE
            </span>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            {course.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="overview" data-ocid="course.lesson_tab.1">
            <BookOpen className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="quiz" data-ocid="course.lesson_tab.2">
            <HelpCircle className="w-4 h-4 mr-2" /> Quiz
          </TabsTrigger>
          <TabsTrigger value="doubt" data-ocid="course.lesson_tab.3">
            <MessageCircle className="w-4 h-4 mr-2" /> Doubt Solver
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              About this Course
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {course.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Video,
                  label: "Video Lessons",
                  desc: "Expert-recorded content",
                },
                {
                  icon: HelpCircle,
                  label: "AI Quiz",
                  desc: "Test your knowledge",
                },
                {
                  icon: MessageCircle,
                  label: "AI Doubt Solver",
                  desc: "Instant answers",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30"
                >
                  <Icon
                    className="w-6 h-6 mb-2"
                    style={{ color: theme.primaryColor }}
                  />
                  <div className="font-medium text-sm text-foreground">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                📚 Lesson content is available after enrollment. Use the Quiz
                and Doubt Solver tabs to interact with AI-powered learning tools
                for this course.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <QuizSection
              courseId={id}
              courseTitle={course.title}
              theme={theme}
            />
          </div>
        </TabsContent>

        <TabsContent value="doubt">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <DoubtChat courseId={id} theme={theme} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
