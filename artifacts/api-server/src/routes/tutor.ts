import { Router } from "express";
import OpenAI from "openai";
import { metricsStore } from "../metrics/store";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorRequestBody {
  question: string;
  topic: string;
  subject: string;
  correctAnswer: string;
  explanation: string;
  messages: ChatMessage[];
  questionId?: number;
}

router.post("/tutor", async (req, res) => {
  const {
    question,
    topic,
    subject,
    correctAnswer,
    explanation,
    messages = [],
    questionId,
  } = req.body as TutorRequestBody;

  if (!question || !topic) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `You are ExamPilot's AI tutor helping a Nigerian student prepare for the ${subject} section of their exam.

The student is reviewing this question:
"${question}"

Correct answer: ${correctAnswer}
Standard explanation: ${explanation}
Topic: ${topic}

Your role:
- Answer follow-up questions clearly and concisely (2-4 sentences max unless more is needed)
- Use simple, encouraging language appropriate for secondary school students
- Build on the standard explanation — don't just repeat it
- Use relatable examples from everyday Nigerian life when helpful
- If the student seems confused, break it down to fundamentals
- Keep responses focused on this question and topic`;

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const startTime = Date.now();
  let tokensIn = 0;
  let tokensOut = 0;
  let hadError = false;

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: chatMessages,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
      // Capture usage from the final chunk
      if (chunk.usage) {
        tokensIn = chunk.usage.prompt_tokens ?? 0;
        tokensOut = chunk.usage.completion_tokens ?? 0;
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    hadError = true;
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  } finally {
    metricsStore.recordAiCall({
      timestamp: Date.now(),
      tokensIn,
      tokensOut,
      latencyMs: Date.now() - startTime,
      error: hadError,
      subject,
      questionId,
    });
  }
});

export default router;
