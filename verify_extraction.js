const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log("Launching Headless Chrome for parsing test...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlUrl = 'file://' + path.resolve(__dirname, 'mock-ats.html');
    await page.goto(htmlUrl);

    // Read and inject content.js directly into the page
    const contentJsPath = path.resolve(__dirname, 'out/scripts/content.js');
    const contentCode = fs.readFileSync(contentJsPath, 'utf8');

    await page.addScriptTag({ content: contentCode });

    console.log("Running Form Extraction Engine...");

    const extracted = await page.evaluate(() => {
        // extractFormInputs is defined in content.js
        return extractFormInputs();
    });

    console.log("Parsed Inputs:", extracted);

    // Now test the injector
    const mockAnswers = {
        "first_name": "GodRecruit",
        "last_name": "AI",
        "email": "auto@godrecruit.ai",
        "experience": "10",
        "why_here": "I am an automated AI agent.",
        "visa_status": "No"
    };

    console.log("\nRunning Injection Engine with mock answers...");

    await page.evaluate((answers) => {
        injectAnswers(answers);
    }, mockAnswers);

    const results = await page.evaluate(() => {
        return {
            firstName: document.getElementById('first_name').value,
            lastName: document.getElementById('last_name').value,
            experience: document.getElementById('experience').value,
            visaStatus: document.getElementById('visa_status').value,
            eventsFired: document.getElementById('first_name').getAttribute('data-event-fired')
        };
    });

    console.log("Validation Results:", results);

    if (results.firstName === "GodRecruit" && results.eventsFired === "true") {
        console.log("\n✅ SUCCESS: Core extraction and React-bypass injection engines are fully functional.");
    } else {
        console.log("\n❌ FAILED to inject values correctly.");
    }

    await browser.close();
})();
