const form = document.getElementById('queryForm');
const input = document.getElementById('queryInput');
const chatBox = document.getElementById('chat');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = input.value.trim();
  if (!question) return;

  appendMessage('You', question);
  input.value = '';

  appendMessage('Bot', 'Bot is typing...');

  try {
    const response = await fetch('http://localhost:3000/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    removeLastBotMessage();
    appendMessage('Bot', data.answer || 'Sorry, no response.');

  } catch (error) {
    removeLastBotMessage();
    appendMessage('Bot', `Error: ${error.message}`);
    console.error('Error:', error);
  }
});

// Append messages to the chat box and optionally speak bot responses
function appendMessage(sender, text) {
  if (sender === 'Bot') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    speechSynthesis.speak(utterance);
  }

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender.toLowerCase());
  messageDiv.innerHTML = `<strong>${sender}:</strong><br>${text.replace(/\n/g, "<br>")}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove last temporary bot message (e.g., "Bot is typing...")
function removeLastBotMessage() {
  const botMessages = chatBox.querySelectorAll('.bot');
  if (botMessages.length > 0) {
    chatBox.removeChild(botMessages[botMessages.length - 1]);
  }
}

// Voice input logic — assumed to be triggered by mic button created in index.html
function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;

  const micButton = document.querySelector('form .chat-form button[type="button"], form button:last-child');

  recognition.onstart = () => {
    if (micButton) micButton.textContent = '🎙️ Listening...';
  };

  recognition.onend = () => {
    if (micButton) micButton.textContent = '🎙️';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    form.requestSubmit(); // Submit the form
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    appendMessage('Bot', 'Voice input failed.');
    if (micButton) micButton.textContent = '🎙️';
  };

  recognition.start();
}
