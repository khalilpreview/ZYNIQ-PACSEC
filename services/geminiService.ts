import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SecretConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "configure_generator",
        description: "Configure a secure key generator, recipe, secure note, RSA keypair, hash utility, AES tool, sanitizer, ghost link, or breach radar.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ["password", "jwt", "uuid", "apiKey", "recipe", "note", "rsa", "hash", "aes", "sanitize", "ghostLink", "breachRadar"],
              description: "The type of secret/tool. Use 'breachRadar' for checking pwned passwords/emails."
            },
            // Single Item Params
            length: { type: Type.INTEGER, description: "Length for passwords/keys." },
            bits: { type: Type.INTEGER, description: "Bit strength (128, 256, 512, 2048, 4096)." },
            format: { type: Type.STRING, enum: ["hex", "base64"] },
            useSymbols: { type: Type.BOOLEAN },
            useNumbers: { type: Type.BOOLEAN },
            useUppercase: { type: Type.BOOLEAN },
            // Recipe Params
            recipeItems: {
              type: Type.ARRAY,
              description: "List of items for 'recipe' type.",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  config: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        length: { type: Type.INTEGER },
                        bits: { type: Type.INTEGER },
                        format: { type: Type.STRING },
                        useSymbols: { type: Type.BOOLEAN },
                        useNumbers: { type: Type.BOOLEAN },
                        useUppercase: { type: Type.BOOLEAN }
                    },
                    required: ["type"]
                  }
                },
                required: ["label", "config"]
              }
            }
          },
          required: ["type"]
        }
      }
    ]
  }
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function generateWithRetry(model: string, contents: string, config: any, retries = 0): Promise<any> {
    try {
        // Safe access to process.env for browser environments
        const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
        if (!apiKey) {
            console.warn("API Key might be missing or process.env is undefined");
        }
        
        return await ai.models.generateContent({
            model,
            contents,
            config
        });
    } catch (error: any) {
        if (retries < MAX_RETRIES) {
            const status = error.status;
            const isRetryable = status === 429 || (status && status >= 500) || !status;
            const isAuthOrClientError = status === 400 || status === 401 || status === 403;

            if (isRetryable && !isAuthOrClientError) {
                const delay = BASE_DELAY * Math.pow(2, retries);
                console.warn(`Request failed (Attempt ${retries + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateWithRetry(model, contents, config, retries + 1);
            }
        }
        throw error;
    }
}

export interface GeminiResponse {
    text: string;
    toolCall?: SecretConfig;
    isError?: boolean;
    usage?: {
        promptTokens: number;
        responseTokens: number;
        totalTokens: number;
    };
}

export const processUserRequest = async (prompt: string): Promise<GeminiResponse> => {
  try {
    const modelId = "gemini-2.5-flash";

    const response = await generateWithRetry(modelId, prompt, {
        tools: tools,
        systemInstruction: `You are a cybersecurity expert assistant for 'Pac-Sec'.
        
        Rules:
        1. Single Key: If user asks for one thing (e.g. "password"), use type='password', 'jwt', 'apiKey', or 'uuid'.
        2. Multi-Key (Recipe): If user asks for a set/stack (e.g. "API credentials", "OAuth setup", "App loot crate"), use type='recipe'.
           - OAuth Stack: Client ID (apiKey, 32 chars) + Client Secret (apiKey, 256 bits hex).
           - Cloud Keys: Access Key (apiKey, 20 chars caps) + Secret Key (apiKey, 40 chars base64).
           - Webhook: Signing Secret (jwt, 256 bits) + Verification Token (apiKey, 32 chars).
        3. Secure Notes: If user asks to "create a note", "share a secret", "write a self-destruct message", use type='note'.
        4. RSA Keys: If user asks for "SSH keys", "Public/Private pair", "Asymmetric keys", use type='rsa' (bits defaults to 2048).
        5. Hashing: If user asks to "hash this", "generate checksum", "SHA-256", use type='hash'.
        6. AES: If user asks to "encrypt", "decrypt", "AES", use type='aes'.
        7. Sanitize: If user asks to "sanitize", "escape inputs", "clean text", use type='sanitize'.
        8. Ghost Link (Pastebin): If user asks to "share securely", "create pastebin", "generate link", "ghost link", use type='ghostLink'.
        9. Breach Radar: If user asks "am I pwned?", "check password leak", "HIBP check", "breach check", use type='breachRadar'.
        10. Defaults: Password length 16+, Key bits 256.
        11. Persona: Professional, retro-arcade style. Brief text.
        `
    });

    // Extract usage metadata if available, otherwise estimate
    const usageMetadata = response.usageMetadata;
    let usage = {
        promptTokens: 0,
        responseTokens: 0,
        totalTokens: 0
    };

    if (usageMetadata) {
        usage = {
            promptTokens: usageMetadata.promptTokenCount || 0,
            responseTokens: usageMetadata.candidatesTokenCount || 0,
            totalTokens: usageMetadata.totalTokenCount || 0
        };
    } else {
        // Fallback estimation: ~4 chars per token
        const pTokens = Math.ceil(prompt.length / 4);
        const rTokens = Math.ceil((response.text?.length || 0) / 4);
        usage = {
            promptTokens: pTokens,
            responseTokens: rTokens,
            totalTokens: pTokens + rTokens
        };
    }

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.functionCall) {
            const args = part.functionCall.args as any;
            let loadingText = "Configuring secure module...";
            if (args.type === 'note') loadingText = "Initializing Zero Knowledge Container...";
            if (args.type === 'recipe') loadingText = "Compiling secure Loot Crate bundle...";
            if (args.type === 'rsa') loadingText = "Forging RSA Keypair (Client-Side)...";
            if (args.type === 'hash') loadingText = "Initializing Ghost Hash Algorithm...";
            if (args.type === 'aes') loadingText = "Loading AES-256-GCM Module...";
            if (args.type === 'sanitize') loadingText = "Engaging Input Sanitizer...";
            if (args.type === 'ghostLink') loadingText = "Initializing E2E Encrypted Pastebin...";
            if (args.type === 'breachRadar') loadingText = "Connecting to Dark Web Scanners (Anonymized)...";

            return {
                text: loadingText,
                toolCall: args as SecretConfig,
                usage
            }
        }
      }
      
      return {
          text: parts[0].text || "I can help generate keys. Try 'Generate RSA Pair' or 'Hash this text'.",
          toolCall: undefined,
          usage
      };
    }

    return { text: "Input unclear. Specify key type.", toolCall: undefined, usage };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    let errorMessage = "CONNECTION FAILURE. SECURE CHANNEL UNSTABLE.";
    
    if (error.status === 401 || error.message?.includes("API key")) {
        errorMessage = "AUTHENTICATION ERROR: INVALID API KEY CREDENTIALS.";
    } else if (error.status === 429) {
        errorMessage = "SYSTEM OVERLOAD: REQUEST LIMIT EXCEEDED. PLEASE STAND BY.";
    } else if (error.status >= 500) {
        errorMessage = "SERVER ERROR: MAINFRAME TEMPORARILY UNREACHABLE.";
    } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
         errorMessage = "NETWORK ERROR: UNABLE TO ESTABLISH UPLINK.";
    }

    return { 
        text: errorMessage, 
        toolCall: undefined,
        isError: true,
        usage: { promptTokens: 0, responseTokens: 0, totalTokens: 0 }
    };
  }
};