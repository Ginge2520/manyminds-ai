# Local Agents

Use this guide to test real ManyMinds AI agents locally with Ollama.

## 1. Install Ollama

Download and install Ollama from:

```text
https://ollama.com
```

## 2. Start Ollama

Open Ollama on your machine. The local API should be available at:

```text
http://localhost:11434
```

## 3. Pull a model

Use either model:

```bash
ollama pull llama3.1
```

or:

```bash
ollama pull mistral
```

## 4. Configure the app

Create `.env.local` from `.env.example` and adjust the model if needed:

```bash
cp .env.example .env.local
```

Default local settings:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1
```

## 5. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000/agent-test
```

## Notes

- Ollama is called from the backend API route only.
- The frontend never receives provider keys.
- Free testing is limited to 3 selected agents and does not allow Debate Mode yet.
- The provider layer is ready for future streaming and paid OpenAI-backed plans.
