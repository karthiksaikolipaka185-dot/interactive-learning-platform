import Groq from 'groq-sdk';
import 'dotenv/config';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface TutorContext {
    subject?: string;
    chapter?: string;
    exercise?: string;
    day?: string;
    video?: string;
    cheatSheet?: string;
    questionText?: string;
    options?: string[];
    selectedAnswer?: string;
    correctAnswer?: string;
}

const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are an experienced, patient, and highly encouraging Mathematics AI Tutor.

INSTRUCTIONS:
• Teach step-by-step instead of just giving direct answers.
• Explain concepts using clear, simple English.
• Be encouraging, warm, and supportive. Never criticize or shame students for mistakes.
• Provide worked examples whenever explaining a concept or solving a problem.
• Explain mistakes gently and show how to fix them.
• Ask engaging follow-up questions when appropriate to test understanding.

INLINE QUIZ & QUESTION BANK CONTEXT:
When reviewing a quiz or question context provided with a student's answer:
1. Explain step-by-step why the student's selected answer is incorrect (if incorrect).
2. Explain why the correct answer is correct.
3. Identify the core mathematical concept being tested.
4. Provide a handy memory trick or mnemonic to remember the concept.
5. Provide a short worked example demonstrating the concept.
6. Encourage the student and ask if they have any follow-up questions.`;

export async function generateLLMResponse(
    messages: ChatMessage[],
    context?: TutorContext
): Promise<string> {
    const rawKey = process.env.GROQ_API_KEY || process.env['GROQ_API_KEY '] || process.env[' GROQ_API_KEY'];
    const apiKey = rawKey ? rawKey.trim() : undefined;

    if (!apiKey || apiKey === '' || apiKey === 'your_api_key') {
        console.error('❌ [Groq Service Error]: GROQ_API_KEY is not configured in backend/.env');
        throw new Error('GROQ_API_KEY is missing or unconfigured.');
    }

    const groq = new Groq({ apiKey });

    // Format context string if provided
    let contextBlock = '';
    if (context && Object.keys(context).length > 0) {
        const parts: string[] = [];
        if (context.subject) parts.push(`Subject: ${context.subject}`);
        if (context.chapter) parts.push(`Chapter: ${context.chapter}`);
        if (context.exercise) parts.push(`Exercise: ${context.exercise}`);
        if (context.day) parts.push(`Day: ${context.day}`);
        if (context.video) parts.push(`Video: ${context.video}`);
        if (context.cheatSheet) parts.push(`Cheat Sheet: ${context.cheatSheet}`);
        if (context.questionText) parts.push(`Current Quiz Question: "${context.questionText}"`);
        if (context.options && context.options.length > 0) parts.push(`Options: ${context.options.join(' | ')}`);
        if (context.selectedAnswer !== undefined) parts.push(`Student Answer: "${context.selectedAnswer}"`);
        if (context.correctAnswer !== undefined) parts.push(`Correct Answer: "${context.correctAnswer}"`);

        if (parts.length > 0) {
            contextBlock = `\n--- AUTOMATIC LEARNING CONTEXT ---\n${parts.join('\n')}\n-----------------------------------\n`;
        }
    }

    // Build messages payload
    const formattedMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: contextBlock ? `${SYSTEM_PROMPT}\n${contextBlock}` : SYSTEM_PROMPT
        }
    ];

    for (const msg of messages) {
        if (msg.role === 'system') continue; // Avoid duplicating system messages
        formattedMessages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        });
    }

    console.log('\n================ GROQ REQUEST DEBUG ================');
    console.log('📥 Incoming User Messages Count:', messages.length);
    console.log('📥 Last User Message:', messages[messages.length - 1]?.content || '(None)');
    if (contextBlock) {
        console.log('📌 Context Payload Included:\n', contextBlock.trim());
    }

    // Attempt Primary Model
    try {
        console.log(`🚀 Sending request to Groq Model: ${PRIMARY_MODEL}`);
        const completion = await groq.chat.completions.create({
            model: PRIMARY_MODEL,
            messages: formattedMessages,
            temperature: 0.6,
            max_completion_tokens: 1024,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error(`Empty response content received from Groq model ${PRIMARY_MODEL}`);
        }

        console.log('✅ Groq Response Received Successfully!');
        if (completion.usage) {
            console.log('📊 Token Usage:', {
                prompt_tokens: completion.usage.prompt_tokens,
                completion_tokens: completion.usage.completion_tokens,
                total_tokens: completion.usage.total_tokens
            });
        }
        console.log('====================================================\n');

        return responseText;
    } catch (primaryError: any) {
        console.error(`⚠️ [Groq Primary Model Error (${PRIMARY_MODEL})]:`, primaryError?.message || primaryError);
        console.log(`🔄 Attempting fallback to Groq Model: ${FALLBACK_MODEL}`);

        // Fallback Model Attempt
        try {
            const fallbackCompletion = await groq.chat.completions.create({
                model: FALLBACK_MODEL,
                messages: formattedMessages,
                temperature: 0.6,
                max_completion_tokens: 1024,
            });

            const fallbackText = fallbackCompletion.choices[0]?.message?.content;
            if (!fallbackText) {
                throw new Error(`Empty response content received from fallback Groq model ${FALLBACK_MODEL}`);
            }

            console.log('✅ Groq Fallback Response Received Successfully!');
            if (fallbackCompletion.usage) {
                console.log('📊 Fallback Token Usage:', {
                    prompt_tokens: fallbackCompletion.usage.prompt_tokens,
                    completion_tokens: fallbackCompletion.usage.completion_tokens,
                    total_tokens: fallbackCompletion.usage.total_tokens
                });
            }
            console.log('====================================================\n');

            return fallbackText;
        } catch (fallbackError: any) {
            console.error('❌ [Groq Fallback Model Error]: Complete Backend Error Details:\n', fallbackError);
            console.log('====================================================\n');
            throw fallbackError;
        }
    }
}
