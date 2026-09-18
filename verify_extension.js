const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const extensionPath = path.resolve(__dirname, 'out');

    console.log("Launching Puppeteer with extension from:", extensionPath);

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });

    await new Promise(r => setTimeout(r, 1000));

    const workerTarget = await browser.waitForTarget(
        t => t.type() === 'service_worker' && t.url().endsWith('background.js')
    );
    const worker = await workerTarget.worker();

    await worker.evaluate(async () => {
        while (typeof chrome === 'undefined' || !chrome.storage) {
            await new Promise(r => globalThis.setTimeout(r, 100));
        }
        await new Promise(r => {
            chrome.storage.sync.set({
                geminiKey: "mock-api-key",
                resumeText: "I am an experienced Software Engineer with 5 years in React and Node.js. I don't need a visa."
            }, r);
        });

        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => {
            if (url.includes("generativelanguage.googleapis.com")) {
                console.log("[MOCK] Intercepted Gemini API Call!");
                const body = JSON.parse(options.body);
                const prompt = body.contents[0].parts[0].text;

                const mockAnswers = {
                    "first_name": "Rosh",
                    "last_name": "Developer",
                    "email": "rosh@example.com",
                    "experience": "5",
                    "why_here": "Because I love building cool extensions.",
                    "visa_status": "No"
                };

                return {
                    ok: true,
                    json: async () => ({
                        candidates: [{
                            content: {
                                parts: [{ text: JSON.stringify(mockAnswers) }]
                            }
                        }]
                    })
                };
            }
            return originalFetch(url, options);
        };
    });

    const page = await browser.newPage();
    const htmlUrl = 'file://' + path.resolve(__dirname, 'mock-ats.html');

    console.log("Navigating to Mock Form:", htmlUrl);
    await page.goto(htmlUrl);

    console.log("Triggering the Auto-Apply Extension Content Script...");

    const targets = await browser.targets();

    const activeTab = await page.target().page();

    await worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "START_AUTO_APPLY" });
        }
    });

    console.log("Waiting for injection to complete...");
    await new Promise(r => setTimeout(r, 2000));

    const results = await page.evaluate(() => {
        return {
            firstName: document.getElementById('first_name').value,
            lastName: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            experience: document.getElementById('experience').value,
            whyHere: document.getElementById('why_here').value,
            visaStatus: document.getElementById('visa_status').value,
            eventsFired: document.getElementById('first_name').getAttribute('data-event-fired')
        };
    });

    console.log("\n--- INJECTION RESULTS ---");
    console.log(results);

    if (results.firstName === "Rosh" && results.eventsFired === "true") {
        console.log("\n✅ Extension worked successfully! DOM Parsing, Background Messaging, API Mock, and React-bypass Injection verified.");
    } else {
        console.log("\n❌ Extension test failed. DOM values not updated correctly.");
    }

    await browser.close();
})();
