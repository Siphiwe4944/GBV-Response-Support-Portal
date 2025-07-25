// Chat functionality for SafeVoice

class ChatSupport {
    constructor() {
        this.messages = [];
        this.isConnected = false;
        this.counselorTyping = false;
        this.init();
    }

    init() {
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
        this.messagesContainer = document.getElementById('messages');
        this.chatWindow = document.getElementById('chatWindow');

        if (this.messageForm) {
            this.messageForm.addEventListener('submit', (e) => this.sendMessage(e));
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(e);
                }
            });
        }

        // Simulate connection
        this.connect();
        
        // Add some automated responses
        this.setupAutomatedResponses();
    }

    connect() {
        this.isConnected = true;
        console.log('Connected to chat support');
    }

    sendMessage(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';
        
        // Simulate counselor response
        this.simulateCounselorResponse(message);
    }

    addMessage(sender, content, timestamp = new Date()) {
        const message = {
            sender,
            content,
            timestamp
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        const timeString = message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (message.sender === 'user') {
            messageElement.innerHTML = `
                <div class="user-message-content">
                    <div class="message-bubble user-bubble">
                        <p>${this.sanitizeMessage(message.content)}</p>
                        <small class="message-time">${timeString}</small>
                    </div>
                    <div class="message-avatar user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="counselor-message">
                    <div class="message-avatar counselor-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="message-content">
                        <strong>SafeVoice Counselor</strong>
                        <div class="message-bubble counselor-bubble">
                            <p>${this.sanitizeMessage(message.content)}</p>
                            <small class="message-time">${timeString}</small>
                        </div>
                    </div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageElement);
    }

    simulateCounselorResponse(userMessage) {
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(userMessage);
            this.addMessage('counselor', response);
        }, 1500 + Math.random() * 2000);
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Keywords and responses
        const responses = {
            emergency: [
                "I understand this is urgent. If you're in immediate danger, please call 10111 right away. I'm here to support you through this.",
                "Your safety is the priority. Emergency services (10111) are available 24/7. Can you tell me more about your current situation?"
            ],
            scared: [
                "It takes courage to reach out when you're scared. You're not alone in this. Can you tell me what's making you feel afraid right now?",
                "Feeling scared is a natural response. You've taken a brave step by connecting with us. What would help you feel safer right now?"
            ],
            help: [
                "I'm here to help you. You've come to the right place. What kind of support are you looking for today?",
                "There are many ways we can support you. Would you like to talk about what's happening, or would you prefer information about resources?"
            ],
            abuse: [
                "I'm sorry you're going through this. No one deserves to be treated badly. You're safe to share as much or as little as you're comfortable with.",
                "Thank you for trusting us with this. Recognizing abuse takes strength. How can I best support you right now?"
            ],
            alone: [
                "You are not alone. There are people who care and want to help. You've already taken an important step by reaching out.",
                "Many people feel isolated in difficult situations, but there is support available. You matter, and your feelings are valid."
            ],
            default: [
                "Thank you for sharing that with me. Can you tell me more about what you're experiencing?",
                "I hear you. Take your time - there's no pressure to share more than you're comfortable with.",
                "That sounds difficult. How are you feeling right now?",
                "I want to make sure I understand. Can you help me learn more about your situation?",
                "You're being very brave by talking about this. What would be most helpful for you right now?"
            ]
        };

        // Check for keywords
        for (const [keyword, responseArray] of Object.entries(responses)) {
            if (keyword !== 'default' && message.includes(keyword)) {
                return responseArray[Math.floor(Math.random() * responseArray.length)];
            }
        }

        // Default response
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="counselor-message">
                <div class="message-avatar counselor-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        if (this.chatWindow) {
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        }
    }

    sanitizeMessage(message) {
        const div = document.createElement('div');
        div.textContent = message;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    setupAutomatedResponses() {
        // Add some helpful automated messages after a delay
        setTimeout(() => {
            this.addMessage('counselor', "Is there anything specific you'd like to talk about today? I'm here to listen and provide support.");
        }, 30000);

        setTimeout(() => {
            this.addMessage('counselor', "Remember, you can also access our safety planning tools or find local support services anytime. What would be most helpful for you?");
        }, 120000);
    }
}

// Global functions for chat management
function clearChat() {
    if (confirm('Are you sure you want to clear the chat? This cannot be undone.')) {
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Recreate the chat instance
        if (window.chatSupport) {
            window.chatSupport.messages = [];
        }
        
        showAlert('Chat cleared successfully', 'info');
    }
}

function endChat() {
    if (confirm('Are you sure you want to end this chat session?')) {
        showAlert('Chat session ended. Thank you for reaching out to SafeVoice.', 'info');
        
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const chatCard = document.querySelector('.chat-card');
    if (chatCard) {
        chatCard.insertBefore(alert, chatCard.firstChild);
    }
}

// CSS for chat messages (injected dynamically)
const chatStyles = `
<style>
.message {
    margin-bottom: 20px;
}

.user-message-content {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
}

.message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 18px;
    word-wrap: break-word;
}

.user-bubble {
    background: #3B82F6;
    color: white;
    margin-right: 12px;
}

.counselor-bubble {
    background: white;
    border: 1px solid #E2E8F0;
    margin-left: 12px;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    display: block;
    margin-top: 4px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: #64748B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    flex-shrink: 0;
}

.counselor-avatar {
    width: 32px;
    height: 32px;
    background: #3B82F6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
}

.typing-indicator {
    margin-bottom: 20px;
}

.typing-dots {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    margin-left: 12px;
    width: fit-content;
}

.typing-dots span {
    width: 6px;
    height: 6px;
    background: #64748B;
    border-radius: 50%;
    margin: 0 2px;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% {
        opacity: 0.4;
        transform: scale(0.8);
    }
    40% {
        opacity: 1;
        transform: scale(1);
    }
}

@media (max-width: 768px) {
    .message-bubble {
        max-width: 85%;
    }
}
</style>
`;

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Inject chat styles
    document.head.insertAdjacentHTML('beforeend', chatStyles);
    
    // Initialize chat support
    if (document.getElementById('messageForm')) {
        window.chatSupport = new ChatSupport();
    }
});