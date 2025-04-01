console.log("Email writer extension loaded");

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return "";
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aaO v7 T-I-atl L3 ai-reply-button';
    button.style.marginRight = '10px';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '20px';
    button.style.backgroundColor = '#005eff'  // Google blue
    button.style.color = '#fff';
    button.style.padding = '8px 16px';
    button.style.fontSize = '14px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    if (document.querySelector('.ai-reply-button')) return;  // Prevent duplicate buttons

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.error("Compose toolbar not found");
        return;
    }
    
    console.log("Compose toolbar found");
    const button = createAIButton();

    button.addEventListener('click', async () => {
        console.log("AI reply button clicked");
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailContent: emailContent, tone: "professional" }),
            });

            if (!response.ok) throw new Error('Failed to generate AI reply');

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                composeBox.textContent = generatedReply;  // Alternative to document.execCommand
            } else {
                console.error('Compose box not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate AI reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose window detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
