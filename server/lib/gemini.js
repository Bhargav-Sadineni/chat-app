const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${GEMINI_API_KEY}`;

const REQUEST_TIMEOUT_MS = 45000; // summaries with long transcripts need more headroom
const MAX_PROMPT_CHARS = 12000;

// Sends a prompt to Gemini and returns the plain-text reply
export const askGemini = async (prompt) => {
    if (!GEMINI_API_KEY) {
        throw new Error("Server is missing GEMINI_API_KEY. Add it to server/.env and restart the server.");
    }

    const trimmedPrompt = prompt.length > MAX_PROMPT_CHARS
        ? prompt.slice(0, MAX_PROMPT_CHARS) + "\n\n[...truncated for length]"
        : prompt;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: trimmedPrompt }] }],
            }),
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("The AI took too long to respond. Please try again.");
        }
        throw new Error("Couldn't reach the AI service. Please check your connection and try again.");
    } finally {
        clearTimeout(timeoutId);
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("The AI service returned an unexpected response.");
    }

    if (data?.error) {
        const msg = data.error.message || "";
        if (response.status === 503 || /overloaded|unavailable/i.test(msg)) {
            throw new Error("The AI is a bit busy right now. Please try again in a few seconds.");
        }
        if (response.status === 429 || /quota/i.test(msg)) {
            throw new Error("The AI has hit its usage limit for now. Please try again shortly.");
        }
        if (response.status === 404 || /not found/i.test(msg)) {
            throw new Error("The AI model is currently unavailable. Please try again later.");
        }
        if (response.status === 400 || response.status === 403) {
            throw new Error("The AI service rejected the request — check that GEMINI_API_KEY is valid.");
        }
        throw new Error(msg || "Gemini request failed");
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Sorry, I couldn't generate a response.";
};

// Same as askGemini, but retries once on a timeout/overload before giving up.
// Used for summaries and context-heavy questions, where a single slow
// response shouldn't mean an outright failure.
export const askGeminiWithRetry = async (prompt) => {
    try {
        return await askGemini(prompt);
    } catch (err) {
        const isRetryable = /took too long|busy right now/i.test(err.message);
        if (!isRetryable) throw err;
        return await askGemini(prompt); // one retry
    }
};