from flask import Blueprint, request, jsonify
from src.models.mood import db, MoodEntry, JournalEntry
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
from sqlalchemy import func

mood_bp = Blueprint("mood", __name__)

# Mood Entry Routes
@mood_bp.route("/mood", methods=["POST"])
@jwt_required()
def create_mood_entry():
    """Create a new mood entry"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    mood_entry = MoodEntry(
        user_id=current_user_id,
        mood_level=data.get("mood_level"),
        mood_type=data.get("mood_type"),
        energy_level=data.get("energy_level"),
        sleep_hours=data.get("sleep_hours"),
        stress_level=data.get("stress_level"),
        notes=data.get("notes"),
        date_recorded=datetime.strptime(data.get("date_recorded", str(date.today())), "%Y-%m-%d").date()
    )
    
    if "tags" in data:
        mood_entry.set_tags(data["tags"])
    
    db.session.add(mood_entry)
    db.session.commit()
    
    return jsonify(mood_entry.to_dict()), 201

@mood_bp.route("/mood", methods=["GET"])
@jwt_required()
def get_mood_entries():
    """Get user's mood entries with optional date filtering"""
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    limit = int(request.args.get("limit", 30))
    
    query = MoodEntry.query.filter_by(user_id=current_user_id)
    
    if start_date:
        query = query.filter(MoodEntry.date_recorded >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(MoodEntry.date_recorded <= datetime.strptime(end_date, "%Y-%m-%d").date())
    
    mood_entries = query.order_by(MoodEntry.date_recorded.desc()).limit(limit).all()
    
    return jsonify([entry.to_dict() for entry in mood_entries]), 200

@mood_bp.route("/mood/stats", methods=["GET"])
@jwt_required()
def get_mood_stats():
    """Get mood statistics for the user"""
    current_user_id = get_jwt_identity()
    
    # Get date range (default to last 30 days)
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    
    mood_entries = MoodEntry.query.filter(
        MoodEntry.user_id == current_user_id,
        MoodEntry.date_recorded >= start_date,
        MoodEntry.date_recorded <= end_date
    ).all()
    
    if not mood_entries:
        return jsonify({
            "average_mood": 0,
            "average_energy": 0,
            "average_stress": 0,
            "average_sleep": 0,
            "total_entries": 0,
            "mood_trend": []
        }), 200
    
    # Calculate averages
    total_entries = len(mood_entries)
    avg_mood = sum(entry.mood_level for entry in mood_entries) / total_entries
    avg_energy = sum(entry.energy_level or 0 for entry in mood_entries) / total_entries
    avg_stress = sum(entry.stress_level or 0 for entry in mood_entries) / total_entries
    avg_sleep = sum(entry.sleep_hours or 0 for entry in mood_entries) / total_entries
    
    # Create mood trend data
    mood_trend = []
    for entry in sorted(mood_entries, key=lambda x: x.date_recorded):
        mood_trend.append({
            "date": entry.date_recorded.isoformat(),
            "mood_level": entry.mood_level,
            "energy_level": entry.energy_level,
            "stress_level": entry.stress_level
        })
    
    return jsonify({
        "average_mood": round(avg_mood, 2),
        "average_energy": round(avg_energy, 2),
        "average_stress": round(avg_stress, 2),
        "average_sleep": round(avg_sleep, 2),
        "total_entries": total_entries,
        "mood_trend": mood_trend
    }), 200

# Journal Entry Routes
@mood_bp.route("/journal", methods=["POST"])
@jwt_required()
def create_journal_entry():
    """Create a new journal entry"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    journal_entry = JournalEntry(
        user_id=current_user_id,
        title=data.get("title"),
        content=data.get("content"),
        mood_at_time=data.get("mood_at_time"),
        is_private=data.get("is_private", True),
        date_written=datetime.strptime(data.get("date_written", str(date.today())), "%Y-%m-%d").date()
    )
    
    if "tags" in data:
        journal_entry.set_tags(data["tags"])
    
    db.session.add(journal_entry)
    db.session.commit()
    
    return jsonify(journal_entry.to_dict()), 201

@mood_bp.route("/journal", methods=["GET"])
@jwt_required()
def get_journal_entries():
    """Get user's journal entries"""
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    limit = int(request.args.get("limit", 20))
    search = request.args.get("search")
    
    query = JournalEntry.query.filter_by(user_id=current_user_id)
    
    if start_date:
        query = query.filter(JournalEntry.date_written >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(JournalEntry.date_written <= datetime.strptime(end_date, "%Y-%m-%d").date())
    if search:
        query = query.filter(
            (JournalEntry.title.contains(search)) | 
            (JournalEntry.content.contains(search))
        )
    
    journal_entries = query.order_by(JournalEntry.date_written.desc()).limit(limit).all()
    
    return jsonify([entry.to_dict() for entry in journal_entries]), 200

@mood_bp.route("/journal/<int:entry_id>", methods=["GET"])
@jwt_required()
def get_journal_entry(entry_id):
    """Get a specific journal entry"""
    current_user_id = get_jwt_identity()
    entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first_or_404()
    return jsonify(entry.to_dict()), 200

@mood_bp.route("/journal/<int:entry_id>", methods=["PUT"])
@jwt_required()
def update_journal_entry(entry_id):
    """Update a journal entry"""
    current_user_id = get_jwt_identity()
    entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first_or_404()
    
    data = request.get_json()
    entry.title = data.get("title", entry.title)
    entry.content = data.get("content", entry.content)
    entry.mood_at_time = data.get("mood_at_time", entry.mood_at_time)
    entry.is_private = data.get("is_private", entry.is_private)
    
    if "tags" in data:
        entry.set_tags(data["tags"])
    
    db.session.commit()
    return jsonify(entry.to_dict()), 200

@mood_bp.route("/journal/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_journal_entry(entry_id):
    """Delete a journal entry"""
    current_user_id = get_jwt_identity()
    entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first_or_404()
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({"msg": "Journal entry deleted successfully"}), 200

