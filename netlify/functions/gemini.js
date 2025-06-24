exports.handler = async function(event, context) {
    // Solo permite peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY; // Obtiene la clave de forma segura

        if (!apiKey) {
            throw new Error('API key not configured.');
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API error: ${response.statusText}` })
            };
        }

        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ response: text })
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
