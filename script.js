let currentContent = '';

// Configure marked options
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false
});

async function generatePaper() {
    const prompt = document.getElementById('prompt').value;
    const output = document.getElementById('output');
    const loader = document.getElementById('loader');
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('status');
    
    if (!prompt) {
        alert('Please enter a research theme');
        return;
    }

    loader.style.display = 'block';
    downloadBtn.style.display = 'none';
    output.innerHTML = '';
    status.textContent = 'Generating...';

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer <API-KEY>",
                "Content-Type": "application/json"

                "HTTP-Referer": "https://github.com/NeuraPapers", // Optional. Site URL for rankings on openrouter.ai.
                "X-Title": "NeuraPapers", // Optional. Site title for rankings on openrouter.ai.

            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an academic writing assistant. Generate papers directly starting with the title in **bold** using Markdown. No introductory paragraphs. Use structured sections, APA citations, and verified sources only."
                    },
                    {
                        "role": "user",
                        "content": `Research theme: ${prompt}\n\nGenerate evidence-based paper using peer-reviewed sources only. No explanatory text before title. Format the paper using proper Markdown headings, lists, and other formatting.`
                    }
                ]
            })
        });

        const data = await response.json();
        loader.style.display = 'none';
        
        if (data.error) {
            output.textContent = `Error: ${data.error.message}`;
            status.textContent = 'Failed to generate';
            status.style.color = '#dc2f02';
        } else {
            currentContent = data.choices[0].message.content;
            
            // Render markdown content
            output.innerHTML = marked.parse(currentContent);
            
            // Initialize syntax highlighting for code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
            
            downloadBtn.style.display = 'inline-flex';
            status.textContent = 'Paper generated successfully';
            status.style.color = '#06d6a0';
        }
    } catch (error) {
        loader.style.display = 'none';
        output.textContent = `Error: ${error.message}`;
        status.textContent = 'Failed to generate';
        status.style.color = '#dc2f02';
    }
}

function downloadPaper() {
    const prompt = document.getElementById('prompt').value.trim();
    const filename = prompt 
        ? `${prompt.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_')}.md`
        : 'research_paper.md';
    
    const blob = new Blob([currentContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
