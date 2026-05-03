export type AiChatRole = "system" | "user" | "assistant";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface RunOllamaChatInput {
  model: string;
  messages: AiChatMessage[];
  timeoutMs?: number;
}

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

export async function runOllamaChat({ model, messages, timeoutMs = 45000 }: RunOllamaChatInput) {
  if (!model) {
    throw new Error("Ollama model missing. Set OLLAMA_DEFAULT_MODEL or pass a model name.");
  }

  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      if (response.status === 404) {
        throw new Error(`Ollama model "${model}" was not found. Run: ollama pull ${model}`);
      }
      throw new Error(`Ollama returned ${response.status}. ${text || "Check that Ollama is running and the model is available."}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content;

    if (!content) {
      throw new Error(data.error || "Ollama returned an empty response.");
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Ollama timed out. Check the model is loaded, or try a smaller model such as mistral.");
    }

    if (error instanceof TypeError) {
      throw new Error("Ollama is not reachable. Start Ollama locally and confirm http://localhost:11434 is available.");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
