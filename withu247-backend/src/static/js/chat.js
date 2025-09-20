// Chat functionality for WithU247 AI Assistant
class ChatApp {
    constructor() {
        this.apiBase = '/api';
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.chatHistory = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.autoResizeTextarea();
    }
    
    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        // Send message on Enter (but allow Shift+Enter for new lines)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Send button click
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Voice input (placeholder for future implementation)
        // this.setupVoiceInput();
    }
    
    autoResizeTextarea() {
        const textarea = document.getElementById('chatInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input and reset height
        input.value = '';
        this.autoResizeTextarea();
        
        // Hide quick actions after first message
        this.hideQuickActions();
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to API
            const response = await fetch(`${this.apiBase}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(app.authToken && { 'Authorization': `Bearer ${app.authToken}` })
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Add AI response to chat
                this.addMessage(data.response, 'ai');
                
                // Check for crisis keywords and show resources if needed
                this.checkForCrisisKeywords(message, data.response);
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
                console.error('Chat API error:', data);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('Sorry, I\'m having trouble connecting. Please check your internet connection and try again.', 'ai');
        } finally {
            this.hideTypingIndicator();
        }
    }
    
    sendQuickMessage(message) {
        const input = document.getElementById('chatInput');
        input.value = message;
        this.sendMessage();
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'ai') {
            avatar.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6"></path>
                    <path d="m9 9 3-3 3 3"></path>
                    <path d="m9 15 3 3 3-3"></path>
                    <path d="M1 12h6m6 0h6"></path>
                    <path d="m9 9-3-3-3 3"></path>
                    <path d="m15 9 3-3 3 3"></path>
                    <path d="m9 15-3 3-3 3"></path>
                    <path d="m15 15 3 3 3-3"></path>
                </svg>
            `;
        } else {
            avatar.textContent = app.currentUser ? app.currentUser.username.charAt(0).toUpperCase() : 'U';
        }
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(new Date());
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to chat history
        this.chatHistory.push({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        
        // Save to localStorage
        this.saveChatHistory();
        
        // Animate message appearance
        if (typeof gsap !== 'undefined') {
            gsap.from(messageElement, {
                duration: 0.3,
                y: 20,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const indicator = document.getElementById('typingIndicator');
        const sendBtn = document.getElementById('sendBtn');
        
        indicator.classList.add('active');
        sendBtn.disabled = true;
        
        // Add typing animation to AI avatar in header
        const aiAvatar = document.querySelector('.chat-header .ai-avatar');
        if (aiAvatar) {
            aiAvatar.style.animation = 'pulse 1s infinite';
        }
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        const sendBtn = document.getElementById('sendBtn');
        
        indicator.classList.remove('active');
        sendBtn.disabled = false;
        
        // Remove typing animation
        const aiAvatar = document.querySelector('.chat-header .ai-avatar');
        if (aiAvatar) {
            aiAvatar.style.animation = '';
        }
    }
    
    hideQuickActions() {
        const quickActions = document.getElementById('quickActions');
        if (quickActions && this.chatHistory.length > 0) {
            quickActions.style.display = 'none';
        }
    }
    
    checkForCrisisKeywords(userMessage, aiResponse) {
        const crisisKeywords = [
            'suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself',
            'self harm', 'cutting', 'overdose', 'jump off', 'crisis', 'emergency'
        ];
        
        const messageText = userMessage.toLowerCase();
        const hasCrisisKeyword = crisisKeywords.some(keyword => 
            messageText.includes(keyword)
        );
        
        if (hasCrisisKeyword) {
            setTimeout(() => {
                this.showCrisisResources();
            }, 2000);
        }
    }
    
    showCrisisResources() {
        const modal = document.getElementById('crisisModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    formatTime(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem(`chat_history_${this.sessionId}`, JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem(`chat_history_${this.sessionId}`);
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                // Restore messages to UI if needed
                // this.restoreMessages();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            const messagesContainer = document.getElementById('chatMessages');
            
            // Keep only the initial AI message
            const initialMessage = messagesContainer.querySelector('.ai-message');
            messagesContainer.innerHTML = '';
            if (initialMessage) {
                messagesContainer.appendChild(initialMessage);
            }
            
            // Clear history
            this.chatHistory = [];
            this.saveChatHistory();
            
            // Show quick actions again
            const quickActions = document.getElementById('quickActions');
            if (quickActions) {
                quickActions.style.display = 'flex';
            }
            
            // Generate new session ID
            this.sessionId = this.generateSessionId();
            
            app.showNotification('Chat cleared successfully', 'info');
        }
    }
    
    toggleChatInfo() {
        const sidebar = document.getElementById('chatSidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
    
    // Voice input placeholder
    toggleVoiceInput() {
        app.showNotification('Voice input coming soon!', 'info');
        // TODO: Implement speech recognition
    }
    
    // Export chat history
    exportChat() {
        const chatData = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            messages: this.chatHistory
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `withu247_chat_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        app.showNotification('Chat exported successfully', 'success');
    }
}

// Global functions for HTML onclick handlers
function sendQuickMessage(message) {
    if (window.chatApp) {
        window.chatApp.sendQuickMessage(message);
    }
}

function clearChat() {
    if (window.chatApp) {
        window.chatApp.clearChat();
    }
}

function toggleChatInfo() {
    if (window.chatApp) {
        window.chatApp.toggleChatInfo();
    }
}

function toggleVoiceInput() {
    if (window.chatApp) {
        window.chatApp.toggleVoiceInput();
    }
}

function exportChat() {
    if (window.chatApp) {
        window.chatApp.exportChat();
    }
}

// Initialize chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

// Handle page visibility change to manage resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any ongoing operations
        if (window.chatApp && window.chatApp.isTyping) {
            window.chatApp.hideTypingIndicator();
        }
    }
});

// Handle beforeunload to save state
window.addEventListener('beforeunload', () => {
    if (window.chatApp) {
        window.chatApp.saveChatHistory();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearChat();
    }
    
    // Ctrl/Cmd + E to export chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportChat();
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('chatSidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            toggleChatInfo();
        }
    }
});

// Add some helpful utilities
const ChatUtils = {
    // Format message text with basic markdown-like formatting
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    },
    
    // Detect if message contains sensitive content
    isSensitiveContent(text) {
        const sensitiveKeywords = [
            'suicide', 'self-harm', 'abuse', 'violence', 'crisis'
        ];
        return sensitiveKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
    },
    
    // Generate suggested responses
    getSuggestedResponses(lastMessage) {
        const suggestions = [
            "Tell me more about that",
            "How does that make you feel?",
            "What would help you right now?",
            "Can you describe what you're experiencing?"
        ];
        return suggestions;
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatApp, ChatUtils };
}

