from flask import Blueprint, request, jsonify
from src.models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user.to_dict(include_sensitive=True)), 200

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.phone = data.get("phone", user.phone)
    user.date_of_birth = data.get("date_of_birth", user.date_of_birth)
    user.gender = data.get("gender", user.gender)
    user.city = data.get("city", user.city)
    user.state = data.get("state", user.state)
    user.pincode = data.get("pincode", user.pincode)
    user.emergency_contact_name = data.get("emergency_contact_name", user.emergency_contact_name)
    user.emergency_contact_phone = data.get("emergency_contact_phone", user.emergency_contact_phone)
    
    if "medical_conditions" in data:
        user.set_medical_conditions(data["medical_conditions"])
    if "current_medications" in data:
        user.set_current_medications(data["current_medications"])
    if "privacy_settings" in data:
        user.set_privacy_settings(data["privacy_settings"])
    if "notification_preferences" in data:
        user.set_notification_preferences(data["notification_preferences"])

    db.session.commit()
    return jsonify({"msg": "Profile updated successfully", "user": user.to_dict()}), 200


