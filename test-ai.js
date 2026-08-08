import fs from 'fs';

async function testAI() {
    try {
        const response = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hello",
                context: {}
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
        fs.writeFileSync('response.txt', text);
    } catch (error) {
        console.error('Fetch Error:', error);
        fs.writeFileSync('response.txt', 'Fetch Error: ' + error.message);
    }
}

testAI();
