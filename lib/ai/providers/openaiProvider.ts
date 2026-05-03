export interface RunOpenAIResponseInput {
  model?: string;
  instructions: string;
  input: string;
}

interface OpenAIResponseOutput {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

export async function runOpenAIResponse({ model, instructions, input }: RunOpenAIResponseInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI provider not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || process.env.OPENAI_DEFAULT_MODEL || "gpt-5.5",
      instructions,
      input,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI provider failed with ${response.status}. ${text || "Check server-side configuration."}`);
  }

  const data = (await response.json()) as OpenAIResponseOutput;
  const content =
    data.output_text ||
    data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text" || item.text)?.text;

  if (!content) {
    throw new Error("OpenAI provider returned an empty response.");
  }

  return content;
}
