import express from "express";
import ChatLog from "../models/ChatLog.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const router = express.Router();

// Crisis keywords
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die",
  "hurt myself", "self harm", "cutting", "overdose",
  "no reason to live", "better off dead"
];

function detectCrisis(message) {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

router.post("/", async (req, res) => {
  try {
    const { session_id, message, user_id } = req.body;

    if (!message || !session_id) {
      return res.status(400).json({ error: "Message and session_id are required" });
    }

    // Get chat history for this session
    const history = await ChatLog.find({ session_id }).sort({ created_at: 1 });

    // Construct messages for the LLM
    const messages = [
      new SystemMessage(`You are a compassionate and structured AI mental health assistant. 
Your goal is to provide supportive conversation and medical triage analysis.
Respond in JSON format with the following keys:
- "response": Your empathetic and supportive message to the user.
- "sentiment_score": A number from -1.0 (unhappy/distressed) to 1.0 (happy/calm).
- "urgency_level": "low", "medium", "high", or "crisis".
- "detected_issues": An array of strings identifying symptoms or concerns (e.g., ["anxiety", "insomnia"]).
- "suggested_actions": An array of strings suggesting next steps (e.g., ["breathing_exercise", "consult_doctor"]).

CRITICAL: If the user is in severe crisis, set "urgency_level" to "crisis" and include explicit immediate help advice in the "response".`)
    ];

    history.forEach(log => {
      messages.push(new HumanMessage(log.user_message));
      messages.push(new AIMessage(log.ai_response));
    });

    messages.push(new HumanMessage(message));

    // Call LLM with error handling
    let ai_response, sentiment_score, urgency_level, detected_issues, suggested_actions;

    try {
      const llm = new ChatOpenAI({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.OPENAI_API_KEY,
        configuration: {
          baseURL: process.env.OPENAI_BASE_URL,
        },
        modelKwargs: { response_format: { type: "json_object" } },
        maxRetries: 1
      });

      const response = await llm.invoke(messages);
      const parsedResponse = JSON.parse(response.content);

      ai_response = parsedResponse.response;
      sentiment_score = parsedResponse.sentiment_score;
      urgency_level = parsedResponse.urgency_level;
      detected_issues = parsedResponse.detected_issues;
      suggested_actions = parsedResponse.suggested_actions;
    } catch (llmError) {
      console.error("LLM Error, using fallback analysis:", llmError.message);
      // Fallback for medical assessment if API is down
      ai_response = "I'm here to support you, but I'm currently having a bit of trouble connecting to my full medical database. Please tell me more about how you're feeling.";
      sentiment_score = 0;
      urgency_level = detectCrisis(message) ? "crisis" : "medium";
      detected_issues = ["api_connectivity_issue"];
      suggested_actions = ["retry_later", "contact_direct_support"];
    }

    // Crisis detection (fallback/redundancy)
    const isCrisis = urgency_level === "crisis" || detectCrisis(message);

    // Save interaction
    const chatLog = new ChatLog({
      session_id,
      user_id,
      user_message: message,
      ai_response,
      sentiment_score,
      urgency_level: isCrisis ? "crisis" : urgency_level,
      detected_issues
    });

    await chatLog.save();

    const responsePayload = {
      response: ai_response,
      session_id,
      sentiment_score,
      urgency_level: chatLog.urgency_level,
      detected_issues,
      suggested_actions
    };

    if (isCrisis) {
      responsePayload.crisis = true;
      responsePayload.helplines = [
        { name: "iCall", number: "9152987821" },
        { name: "Vandrevala Foundation", number: "1860-2662-345" },
        { name: "NIMHANS", number: "080-46110007" },
      ];
    }

    res.json(responsePayload);
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Server error processing chat message." });
  }
});

router.get("/history/:session_id", async (req, res) => {
  try {
    const { session_id } = req.params;
    const history = await ChatLog.find({ session_id }).sort({ created_at: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export default router;
