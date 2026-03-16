import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5005/api';

async function testChatEnancements() {
    console.log("🚀 Testing Chat Enhancements...");

    const testMessages = [
        { 
            label: "General Health Query",
            message: "I've been feeling a bit stressed lately and haven't been sleeping well.",
            session_id: "test_" + Date.now()
        },
        {
            label: "Crisis/Urgent Query",
            message: "I feel completely hopeless and don't want to live anymore.",
            session_id: "test_urgency_" + Date.now()
        }
    ];

    for (const test of testMessages) {
        console.log(`\n--- Test: ${test.label} ---`);
        try {
            const response = await axios.post(`${API_BASE}/chat`, {
                message: test.message,
                session_id: test.session_id
            });

            const data = response.data;
            console.log("✅ API Response Received:");
            console.log(`   Response: ${data.response.substring(0, 100)}...`);
            console.log(`   Sentiment Score: ${data.sentiment_score}`);
            console.log(`   Urgency Level: ${data.urgency_level}`);
            console.log(`   Detected Issues: ${JSON.stringify(data.detected_issues)}`);
            console.log(`   Suggested Actions: ${JSON.stringify(data.suggested_actions)}`);
            
            if (data.crisis) {
                console.log("   🚨 Crisis Detected! Helplines provided.");
            }

        } catch (error) {
            console.error(`❌ Test failed for ${test.label}:`, error.response?.data || error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log("⚠️ Is the server running? Run 'npm run dev' in the server directory.");
            }
        }
    }
}

testChatEnancements();
