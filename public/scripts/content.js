// content.js - DOM Parser & Injector

console.log("GodRecruit Content Script Loaded");

// 1. Parser Engine
const extractFormInputs = () => {
    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']), textarea, select"));

    return inputs.map((el) => {
        // Attempt to find the label text.
        let labelText = "";

        // Check if element has an explicit label referenced by id
        if (el.id) {
            const explicitLabel = document.querySelector(`label[for="${el.id}"]`);
            if (explicitLabel) labelText = explicitLabel.textContent || "";
        }

        // Check if element is wrapped in a label
        if (!labelText) {
            const parentLabel = el.closest("label");
            if (parentLabel) labelText = parentLabel.textContent || "";
        }

        // Check aria-label or name as fallback
        if (!labelText) {
            labelText = el.getAttribute("aria-label") || el.name || el.placeholder || "";
        }

        // Clean up label text
        labelText = labelText.replace(/\\n/g, " ").trim();

        // Assign a unique temporary ID if it doesn't have one, so we can map it later
        if (!el.id) {
            el.id = "godrecruit_id_" + Math.random().toString(36).substr(2, 9);
        }

        return {
            inputId: el.id,
            type: el.tagName.toLowerCase() === "input" ? el.type : el.tagName.toLowerCase(),
            labelText,
        };
    }).filter(item => item.labelText && item.type !== "submit" && item.type !== "button");
};

// 2. React/Vue Bypass Injector
const injectAnswers = (answers) => {
    for (const [inputId, value] of Object.entries(answers)) {
        const el = document.getElementById(inputId);
        if (!el) continue;

        // Direct value assignment
        el.value = value;

        // Bypass React Native Setters to force state update triggering
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
        )?.set;

        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value"
        )?.set;

        const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLSelectElement.prototype,
            "value"
        )?.set;

        if (el.tagName.toLowerCase() === "input" && nativeInputValueSetter) {
            nativeInputValueSetter.call(el, value);
        } else if (el.tagName.toLowerCase() === "textarea" && nativeTextAreaValueSetter) {
            nativeTextAreaValueSetter.call(el, value);
        } else if (el.tagName.toLowerCase() === "select" && nativeSelectValueSetter) {
            nativeSelectValueSetter.call(el, value);
        }

        // Dispatch Synthetic Events
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }
};

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_AUTO_APPLY") {
        console.log("GodRecruit: Start Auto Apply triggered");

        const questions = extractFormInputs();
        console.log("Parsed Questions:", questions);

        // Send to Background script to query Gemini
        chrome.runtime.sendMessage(
            { action: "FETCH_GEMINI_ANSWERS", payload: questions },
            (response) => {
                if (response?.error) {
                    console.error("GodRecruit: Error fetching answers:", response.error);
                } else if (response?.answers) {
                    console.log("GodRecruit: Received AI Answers:", response.answers);
                    injectAnswers(response.answers);
                }
            }
        );
    }
});
