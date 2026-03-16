from flask import Blueprint, request, jsonify
from src.models import db, ChatLog, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import google.generativeai as genai
import os

chat_bp = Blueprint("chat", __name__)

# Configure Google Generative AI
genai.configure(api_key=os.environ.get("OPENAI_API_KEY")) # Using OPENAI_API_KEY as a placeholder for Gemini API Key
model = genai.GenerativeModel("gemini-pro")

@chat_bp.route("/chat", methods=["POST"])
@jwt_required(optional=True)
def send_message():
    """Send a message to the AI chatbot and get a response"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    user_message = data.get("message")
    session_id = data.get("session_id") # Client-generated session ID

    if not user_message or not session_id:
        return jsonify({"msg": "Message and session_id are required"}), 400

    try:
        # Get chat history for the session
        chat_history = ChatLog.query.filter_by(session_id=session_id).order_by(ChatLog.created_at.asc()).all()
        
        # Prepare conversation for Gemini API
        conversation = []
        for log in chat_history:
            conversation.append({"role": "user", "parts": [log.user_message]})
            conversation.append({"role": "model", "parts": [log.ai_response]})
        conversation.append({"role": "user", "parts": [user_message]})

        # Get AI response
        response = model.generate_content(conversation)
        ai_response_text = response.text

        # Save chat log
        chat_log = ChatLog(
            user_id=current_user_id,
            session_id=session_id,
            user_message=user_message,
            ai_response=ai_response_text,
            response_time_ms=0 # TODO: Implement actual response time calculation
        )
        db.session.add(chat_log)
        db.session.commit()

        return jsonify({"response": ai_response_text, "session_id": session_id}), 200

    except Exception as e:
        return jsonify({"msg": f"Error communicating with chatbot: {str(e)}"}), 500

@chat_bp.route("/chat/history/<session_id>", methods=["GET"])
@jwt_required(optional=True)
def get_chat_history(session_id):
    """Get chat history for a specific session"""
    current_user_id = get_jwt_identity()
    
    # For anonymous users, only allow access to their own session_id if not logged in
    # For logged in users, ensure they own the session or it's a public session
    
    chat_logs = ChatLog.query.filter_by(session_id=session_id).order_by(ChatLog.created_at.asc()).all()
    
    if not chat_logs:
        return jsonify({"msg": "No chat history found for this session"}), 404
    
    return jsonify([log.to_dict() for log in chat_logs]), 200

@chat_bp.route("/chat/crisis", methods=["POST"])
@jwt_required(optional=True)
def report_crisis():
    """Endpoint to report a crisis or trigger an alert"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    chat_log_id = data.get("chat_log_id")
    alert_type = data.get("alert_type")
    severity_level = data.get("severity_level", "high")

    if not chat_log_id or not alert_type:
        return jsonify({"msg": "chat_log_id and alert_type are required"}), 400

    chat_log = ChatLog.query.get(chat_log_id)
    if not chat_log:
        return jsonify({"msg": "Chat log not found"}), 404

    crisis_alert = CrisisAlert(
        user_id=current_user_id,
        chat_log_id=chat_log_id,
        alert_type=alert_type,
        severity_level=severity_level,
        auto_detected=False # This is manually reported
    )
    db.session.add(crisis_alert)
    db.session.commit()

    return jsonify({"msg": "Crisis alert reported successfully", "alert_id": crisis_alert.id}), 201


