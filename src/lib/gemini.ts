// The background script will use this to call Gemini
// The actual API call expects to fetch standard JSON matching the form inputs.

export const generateAnswersFromGemini = async (
    apiKey: string,
    resumeText: string,
    formQuestions: Array<{ inputId: string; type: string; labelText: string }>
) => {
    const prompt = `
You are an expert AI recruiting assistant. I have parsed a job application form.
Below is my master resume, followed by a JSON array of the form inputs (ID, type, label).
Your job is to respond with a flat JSON object where the keys are the exact 'inputId' strings, and the values are your recommended answers based on my resume.
Respond ONLY with valid JSON. Do not include markdown formatting or explanations.

RESUME:
${resumeText}

FORM INPUTS:
${JSON.stringify(formQuestions, null, 2)}
`;

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Gemini API error");
        }

        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error("No extracted text from Gemini");

        return JSON.parse(jsonText);
    } catch (err) {
        console.error("Gemini Generation Error:", err);
        throw err;
    }
};
