console.log("Email writer extension loaded");

function findComposeToolbar(){
    const selectors=[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up',
    ];
    for(const selector of selectors){
        const toolbar=document.querySelector(selector);
        if(toolbar) return toolbar;
    }
    return null;
}

function getEmailContent(){
    const selectors=[
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]',
    ];
    for(const selector of selectors){
        const content=document.querySelector(selector);
        if(content) return content.innerText.trim();
    }
    return "";
}

function createAIButton(){
    const button=document.createElement('div');
    button.className='T-J J-J5-Ji aaO v7 T-I-atl L3';
    button.style.marginRight='8px';
    button.innerHTML='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','AI Reply');
}

function injectButton{
    const existingButton=document.querySelector('.ai-reply-button');
    if(existingButton){
        existingButton.remove();
        const toolbar=findComposeToolbar();
        if(!toolbar) 
        {
            console.error("Compose toolbar not found");
            return;
        }
        console.log("Compose toolbar found");
        const button=createAIButton();
        button.classList.add(ai-reply-button);

        button.addEventListener('click',async ()=>{
            console.log("AI reply button clicked");
            try {
                button.innerHTML='Generating...';
                button.disabled=true;

                const emailContent=getEmailContent();

                const response=await fetch('http://localhost:8080/api/email/generate',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify({
                        emailContent:emailContent,
                        tone:"professional"
                    }),
                })
                if(!response.ok){
                    throw new Error('Failed to generate AI reply');
                }
                const generatedReply=await response.text();
                const composeBox=document.querySelector('[role="textbox"][g_editable="true"]');

                if(composeBox){
                    composeBox.focus();
                    document.execCommand('insertText',false,generatedReply);
                }else{
                    console.error('Compose box not found');
                }
            } catch (error) {
                console.error(error);
                alert('Failed to generate AI reply');
            } finally{
                button.innerHTML='AI Reply';
                button.disabled=false;
            }
        });
        toolbar.insertBefore(button, toolbar.firstElementChild);
    }
}

const observer= new MutationObserver((mutations)=> {
    for(const mutation of mutations) {
        const addNodes=Array.from(mutation.addedNodes);
        const hasComposeElements=addedNodes.some(node=>
            node.nodeType===node.ELEMENT_NODE &&
            (node.matches('aDh, btC, [role="dialog"]') || node.querySelector('.aDh, .btC'))
        );

        if(hasComposeElements){
            console.log("Compose window detected");
            setTimeout(injectButton, 500)
        }
    }
});

observer.observe(document.body,{
    childList: true,
    subtree: true
});