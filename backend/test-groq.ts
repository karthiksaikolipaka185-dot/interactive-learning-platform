import 'dotenv/config';
import { generateLLMResponse } from './src/aiService';

async function testGroqValidation() {
    const questions = [
        "What is a triangle?",
        "What is an LLM?",
        "What is sin theta?",
        "Explain SOH CAH TOA.",
        "What is the hypotenuse?"
    ];

    console.log('🧪 Starting Groq AI Tutor Validation Test...\n');

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        console.log(`---------------- Question ${i + 1} ----------------`);
        console.log(`❓ Prompt: "${q}"`);
        try {
            const res = await generateLLMResponse([{ role: 'user', content: q }]);
            console.log(`💬 Response (First 150 chars):\n${res.substring(0, 150)}...\n`);
        } catch (err: any) {
            console.error(`❌ Error testing question "${q}":`, err?.message || err);
        }
    }
}

if (require.main === module) {
    testGroqValidation();
}
