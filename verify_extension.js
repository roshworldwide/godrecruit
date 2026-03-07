const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const extensionPath = path.resolve(__dirname, 'out');

    console.log("Launching Puppeteer with extension from:", extensionPath);

    const browser = await puppeteer.launch({
        headless: false, // Must be false to load extensions
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });

    // Wait for extension background worker to initialize
    await new Promise(r => setTimeout(r, 1000));

    // Find the background service worker target
    const workerTarget = await browser.waitForTarget(
        t => t.type() === 'service_worker' && t.url().endsWith('background.js')
    );
    const worker = await workerTarget.worker();

    // Inject Mock Configuration into Chrome Storage directly via worker evaluation
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

        // Mock the fetch behavior inside the service worker to intercept Gemini API calls
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => {
            if (url.includes("generativelanguage.googleapis.com")) {
                console.log("[MOCK] Intercepted Gemini API Call!");
                // Parse the payload to know what inputs were sent
                const body = JSON.parse(options.body);
                const prompt = body.contents[0].parts[0].text;

                // Construct a mock response based on the inputs in the prompt
                // The prompt contains JSON like: [{"inputId": "first_name", ...}]
                // We'll respond with mock dummy data.
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

    // We simulate the Popup clicking "Start Auto Apply" by sending a message over chrome runtime.
    // However, `chrome.runtime` is not accessible from normal web pages.
    // Instead, we will evaluate inside the context of the extension content script loaded in the page!

    const targets = await browser.targets();
    // Getting the page target context that has extension APIs
    // A simpler way: evaluate a script that dispatches a custom event, and modify the content script momentarily?
    // Let's just execute the content script logic directly, OR wait, we can just find the extension background worker,
    // and tell IT to send a message to the active tab!

    const activeTab = await page.target().page();

    // Ask background worker to send the START message to the active tab
    await worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "START_AUTO_APPLY" });
        }
    });

    console.log("Waiting for injection to complete...");
    await new Promise(r => setTimeout(r, 2000));

    // Verify values in DOM
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
