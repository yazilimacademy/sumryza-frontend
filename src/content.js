// Helper function to extract video ID from the URL
function getVideoIdFromUrl(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
}

// Simple helper to show messages (using alert for MVP)
function showMessage(msg) {
    alert(msg);
}

// Display the transcript to the user (showing complete text)
function displayTranscript(text) {
    // Check for user theme preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Create a modal dialog for better visibility
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = isDarkMode ? '#333' : 'white';
    modal.style.color = isDarkMode ? 'white' : 'black';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = isDarkMode
        ? '0 4px 6px rgba(255, 255, 255, 0.1)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)';
    modal.style.maxWidth = '80%';
    modal.style.maxHeight = '80vh';
    modal.style.overflow = 'auto';
    modal.style.zIndex = '10000';

    // Add transcript text
    const textContent = document.createElement('pre');
    textContent.style.whiteSpace = 'pre-wrap';
    textContent.style.wordBreak = 'break-word';
    textContent.style.margin = '0';
    textContent.style.fontSize = '14px';
    textContent.textContent = text;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.backgroundColor = isDarkMode ? '#555' : '#f0f0f0';
    closeButton.style.color = isDarkMode ? 'white' : 'black';
    closeButton.style.border = isDarkMode ? '1px solid #777' : '1px solid #ccc';
    closeButton.style.borderRadius = '4px';
    closeButton.onclick = () => modal.remove();

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.onclick = () => {
        overlay.remove();
        modal.remove();
    };

    modal.appendChild(textContent);
    modal.appendChild(closeButton);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

// Show Loading Spinner
function showLoadingSpinner() {
    // Check if spinner already exists
    if (document.getElementById('loading-spinner-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'loading-spinner-overlay';

    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // Display the spinner
    overlay.style.display = 'flex';
}

// Hide Loading Spinner
function hideLoadingSpinner() {
    const overlay = document.getElementById('loading-spinner-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Handle Summarize Button Click
async function handleSummarizeButtonClick() {
    const videoId = getVideoIdFromUrl(window.location.href);
    if (!videoId) {
        showMessage("No video ID found. Cannot get transcript.");
        return;
    }

    // Retrieve the user's preferred language
    const preferredLanguage = await new Promise((resolve) => {
        chrome.storage.sync.get(['preferredLanguage'], (result) => {
            // Default to 'tr' if not set
            resolve(result.preferredLanguage || 'tr');
        });
    });

    try {
        showLoadingSpinner();

        const response = await fetch(`http://localhost:8000/transcript?video_id=${videoId}&summary_language=${preferredLanguage}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 404) {
                showMessage("No captions or transcript found for this video.");
            } else if (response.status === 500) {
                showMessage("Error fetching transcript from the server.");
            } else {
                showMessage("An unexpected error occurred: " + errorText);
            }
            return;
        }

        const data = await response.json();
        if (data && data.summary) {
            displayTranscript(data.summary);
        } else {
            showMessage("No summary returned from the server.");
        }        
    } catch (error) {
        console.error("Error fetching transcript:", error);
        showMessage("Failed to connect to the transcript service.");
    } finally {
        hideLoadingSpinner();
    }
}


function addSummarizeButtonIfNeeded() {
    // Try the selector related to the Subscribe button
    const subscribeBtnDiv = document.querySelector("#subscribe-button > ytd-button-renderer > yt-button-shape > a > yt-touch-feedback-shape > div");

    if (subscribeBtnDiv && !document.querySelector('#mySummarizeButton')) {
        const summarizeBtn = document.createElement('button');
        summarizeBtn.id = 'mySummarizeButton';
        summarizeBtn.textContent = 'SUMMARIZE';

        summarizeBtn.style.display = 'inline-flex';
        summarizeBtn.style.alignItems = 'center';
        summarizeBtn.style.justifyContent = 'center';
        summarizeBtn.style.padding = '6px 12px';
        summarizeBtn.style.marginLeft = '12px';
        summarizeBtn.style.backgroundColor = '#ff5757';
        summarizeBtn.style.color = '#ffffff';
        summarizeBtn.style.border = 'none';
        summarizeBtn.style.borderRadius = '4px';
        summarizeBtn.style.cursor = 'pointer';
        summarizeBtn.style.fontWeight = '600';
        summarizeBtn.style.fontSize = '14px';
        summarizeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        summarizeBtn.addEventListener('mouseenter', () => {
            summarizeBtn.style.backgroundColor = '#e64646';
        });
        summarizeBtn.addEventListener('mouseleave', () => {
            summarizeBtn.style.backgroundColor = '#ff5757';
        });

        subscribeBtnDiv.insertAdjacentElement('afterend', summarizeBtn);

        summarizeBtn.addEventListener('click', async () => {
            console.log('Summarize button clicked!');
            await handleSummarizeButtonClick();
        });
    } else if (!subscribeBtnDiv && !document.querySelector('#mySummarizeButton')) {
        // Fallback in case subscribe button is not found
        const actionButtonsContainer = document.querySelector('#top-level-buttons-computed');
        if (actionButtonsContainer && !document.querySelector('#mySummarizeButton')) {
            const summarizeBtn = document.createElement('button');
            summarizeBtn.id = 'mySummarizeButton';
            summarizeBtn.textContent = 'SUMMARIZE';

            summarizeBtn.style.display = 'inline-flex';
            summarizeBtn.style.alignItems = 'center';
            summarizeBtn.style.justifyContent = 'center';
            summarizeBtn.style.padding = '6px 12px';
            summarizeBtn.style.marginLeft = '12px';
            summarizeBtn.style.backgroundColor = '#ff5757';
            summarizeBtn.style.color = '#ffffff';
            summarizeBtn.style.border = 'none';
            summarizeBtn.style.borderRadius = '4px';
            summarizeBtn.style.cursor = 'pointer';
            summarizeBtn.style.fontWeight = '600';
            summarizeBtn.style.fontSize = '14px';
            summarizeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            summarizeBtn.addEventListener('mouseenter', () => {
                summarizeBtn.style.backgroundColor = '#e64646';
            });
            summarizeBtn.addEventListener('mouseleave', () => {
                summarizeBtn.style.backgroundColor = '#ff5757';
            });

            actionButtonsContainer.appendChild(summarizeBtn);

            summarizeBtn.addEventListener('click', async () => {
                console.log('Summarize button clicked!');
                await handleSummarizeButtonClick();
            });
        }
    }
}

// Observe changes in the DOM and try adding the button
const observer = new MutationObserver(() => {
    addSummarizeButtonIfNeeded();
});
observer.observe(document.body, { childList: true, subtree: true });

// Run once on load
addSummarizeButtonIfNeeded();
