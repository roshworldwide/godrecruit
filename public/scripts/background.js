import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

let supabase = null;

const initSupabase = async (url, key) => {
    if (url && key) {
        supabase = createClient(url, key);
    }
};

const generateAnswersFromGemini = async (apiKey, resumeText, formQuestions) => {
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
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FETCH_GEMINI_ANSWERS") {

        chrome.storage.sync.get(["geminiKey", "supabaseUrl", "supabaseKey"], async (config) => {
            try {
                if (!config.geminiKey) {
                    throw new Error("Missing Gemini API Key. Please configure it in the Options Dashboard.");
                }

                chrome.storage.local.get(["masterResume"], async (localData) => {
                    try {
                        const resume = localData.masterResume;
                        if (!resume || !resume.fullName) {
                            throw new Error("Missing Master Resume profile. Please fill it out in the Options Dashboard.");
                        }

                        const resumeContext = [
                            `Name: ${resume.fullName}`,
                            `Email: ${resume.email}`,
                            `Phone: ${resume.phone}`,
                            resume.linkedin ? `LinkedIn: ${resume.linkedin}` : '',
                            resume.portfolio ? `Portfolio: ${resume.portfolio}` : '',
                            '',
                            'PROFESSIONAL SUMMARY:',
                            resume.summary,
                            '',
                            'WORK EXPERIENCE:',
                            resume.experience,
                            '',
                            'EDUCATION:',
                            resume.education,
                            '',
                            'SKILLS:',
                            resume.skills,
                        ].filter(Boolean).join('\n');

                        if (!supabase && config.supabaseUrl && config.supabaseKey) {
                            await initSupabase(config.supabaseUrl, config.supabaseKey);
                        }

                        const answers = await generateAnswersFromGemini(
                            config.geminiKey,
                            resumeContext,
                            request.payload
                        );

                        if (supabase) {
                            await supabase.from('application_logs').insert([{
                                url: sender.tab?.url,
                                timestamp: new Date().toISOString(),
                                questions: request.payload,
                                answers_injected: answers
                            }]);
                        }

                        sendResponse({ answers });
                    } catch (err) {
                        console.error("Background Worker Error:", err);
                        sendResponse({ error: err.message });
                    }
                });

            } catch (err) {
                console.error("Background Worker Error:", err);
                sendResponse({ error: err.message });
            }
        });

        return true;
    }
});
