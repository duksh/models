const MODEL_REASONING_PREFIXES = {
    "gpt-oss": true,
    "deepseek-v3": true,
    "qwen3-235b-a22b": true,
    "qwen3-coder": true,
    "qwen3-32": false,
    "llama-3": true,
    "mistral-7b": true,
    "llama-4": false,
    "claude-instant": false,
    "mistral-small": true,
    "mistral-large": true,
    "mixtral": true,
    "pixtral": true,
    r1: true,
    "claude-2": true,
    "claude-3": true,
} as const;

export function isReasoningModel(modelId: string): boolean {
    for (
        const [prefix, isReasoning] of Object.entries(MODEL_REASONING_PREFIXES).sort(
            // Longer prefixes first
            (a, b) => b[0].length - a[0].length
        )
    ) {
        if (modelId.startsWith(prefix)) {
            return isReasoning;
        }
    }

    throw new Error(`Unknown model ID: ${modelId}. Please add it to MODEL_REASONING_PREFIXES in scraper/constants.ts.`);
}

export function isSelfHostableModel(modelId: string, provider: string): boolean {
    if (provider === "Meta") {
        // All Meta models are self-hostable
        return true;
    }

    if (provider === "Anthropic") {
        // No Anthropic models are self-hostable
        return false;
    }

    if (provider === "OpenAI") {
        if (modelId.startsWith("gpt-oss-")) {
            return true;
        }
        return false;
    }

    if (provider === "Qwen") {
        // All Qwen models are self-hostable
        return true;
    }

    if (provider === "DeepSeek") {
        // All DeepSeek models are self-hostable
        return true;
    }

    if (provider === "Mistral") {
        // All Mistral models are self-hostable
        return true;
    }

    throw new Error(`Unknown self-hostable status for model ID: ${modelId} with provider: ${provider}. Please update isSelfHostableModel in scraper/constants.ts.`);
}
