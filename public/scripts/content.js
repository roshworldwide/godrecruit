console.log("GodRecruit Content Script Loaded");

const extractFormInputs = () => {
    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']), textarea, select"));

    return inputs.map((el) => {
        let labelText = "";

        if (el.id) {
            const explicitLabel = document.querySelector(`label[for="${el.id}"]`);
            if (explicitLabel) labelText = explicitLabel.textContent || "";
        }

        if (!labelText) {
            const parentLabel = el.closest("label");
            if (parentLabel) labelText = parentLabel.textContent || "";
        }

        if (!labelText) {
            labelText = el.getAttribute("aria-label") || el.name || el.placeholder || "";
        }

        labelText = labelText.replace(/\\n/g, " ").trim();

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

const injectAnswers = (answers) => {
    for (const [inputId, value] of Object.entries(answers)) {
        const el = document.getElementById(inputId);
        if (!el) continue;

        el.value = value;

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

        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_AUTO_APPLY") {
        console.log("GodRecruit: Start Auto Apply triggered");

        const questions = extractFormInputs();
        console.log("Parsed Questions:", questions);

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
