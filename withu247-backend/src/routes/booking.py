from flask import Blueprint, request, jsonify
from src.models.booking import db, Booking, TherapistAvailability
from src.models.therapist import Therapist
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, time, timedelta

booking_bp = Blueprint("booking", __name__)

@booking_bp.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    """Create a new booking"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate therapist exists
    therapist = Therapist.query.get(data.get("therapist_id"))
    if not therapist:
        return jsonify({"msg": "Therapist not found"}), 404
    
    # Parse appointment date and time
    appointment_date = datetime.strptime(data.get("appointment_date"), "%Y-%m-%d").date()
    appointment_time = datetime.strptime(data.get("appointment_time"), "%H:%M").time()
    
    # Check if slot is available
    existing_booking = Booking.query.filter_by(
        therapist_id=data.get("therapist_id"),
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status="confirmed"
    ).first()
    
    if existing_booking:
        return jsonify({"msg": "This time slot is already booked"}), 409
    
    booking = Booking(
        user_id=current_user_id,
        therapist_id=data.get("therapist_id"),
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        duration_minutes=data.get("duration_minutes", 60),
        session_type=data.get("session_type", "online"),
        reason_for_visit=data.get("reason_for_visit"),
        special_requests=data.get("special_requests"),
        amount=therapist.consultation_fee
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify(booking.to_dict()), 201

@booking_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_user_bookings():
    """Get user's bookings"""
    current_user_id = get_jwt_identity()
    
    status_filter = request.args.get("status")
    upcoming_only = request.args.get("upcoming") == "true"
    
    query = Booking.query.filter_by(user_id=current_user_id)
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    if upcoming_only:
        today = date.today()
        query = query.filter(Booking.appointment_date >= today)
    
    bookings = query.order_by(Booking.appointment_date.desc(), Booking.appointment_time.desc()).all()
    
    # Include therapist information
    booking_data = []
    for booking in bookings:
        booking_dict = booking.to_dict()
        booking_dict["therapist"] = booking.therapist.to_dict()
        booking_data.append(booking_dict)
    
    return jsonify(booking_data), 200

@booking_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    """Get a specific booking"""
    current_user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=current_user_id).first_or_404()
    
    booking_dict = booking.to_dict()
    booking_dict["therapist"] = booking.therapist.to_dict()
    booking_dict["user"] = booking.user.to_dict()
    
    return jsonify(booking_dict), 200

@booking_bp.route("/bookings/<int:booking_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking"""
    current_user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=current_user_id).first_or_404()
    
    if booking.status == "cancelled":
        return jsonify({"msg": "Booking is already cancelled"}), 400
    
    if booking.status == "completed":
        return jsonify({"msg": "Cannot cancel a completed booking"}), 400
    
    data = request.get_json()
    booking.status = "cancelled"
    booking.cancellation_reason = data.get("cancellation_reason")
    booking.cancelled_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({"msg": "Booking cancelled successfully", "booking": booking.to_dict()}), 200

@booking_bp.route("/bookings/<int:booking_id>/confirm", methods=["PUT"])
@jwt_required()
def confirm_booking(booking_id):
    """Confirm a booking (therapist action)"""
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(booking_id)
    
    # TODO: Add therapist authentication check
    # For now, allowing any authenticated user to confirm
    
    if booking.status != "pending":
        return jsonify({"msg": "Only pending bookings can be confirmed"}), 400
    
    data = request.get_json()
    booking.status = "confirmed"
    booking.confirmed_at = datetime.utcnow()
    booking.meeting_link = data.get("meeting_link")
    
    db.session.commit()
    
    return jsonify({"msg": "Booking confirmed successfully", "booking": booking.to_dict()}), 200

@booking_bp.route("/therapists/<int:therapist_id>/availability", methods=["GET"])
def get_therapist_availability(therapist_id):
    """Get therapist's availability"""
    therapist = Therapist.query.get_or_404(therapist_id)
    
    # Get date range (default to next 30 days)
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date:
        start_date = date.today()
    else:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    
    if not end_date:
        end_date = start_date + timedelta(days=30)
    else:
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    # Get availability slots
    availability_slots = TherapistAvailability.query.filter_by(
        therapist_id=therapist_id,
        is_available=True
    ).all()
    
    # Get existing bookings
    existing_bookings = Booking.query.filter(
        Booking.therapist_id == therapist_id,
        Booking.appointment_date >= start_date,
        Booking.appointment_date <= end_date,
        Booking.status.in_(["pending", "confirmed"])
    ).all()
    
    # Generate available time slots
    available_slots = []
    current_date = start_date
    
    while current_date <= end_date:
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        
        # Find availability for this day
        day_availability = [slot for slot in availability_slots if slot.day_of_week == day_of_week]
        
        for slot in day_availability:
            # Check if this time slot is already booked
            is_booked = any(
                booking.appointment_date == current_date and 
                booking.appointment_time == slot.start_time
                for booking in existing_bookings
            )
            
            if not is_booked:
                available_slots.append({
                    "date": current_date.isoformat(),
                    "time": slot.start_time.strftime("%H:%M"),
                    "end_time": slot.end_time.strftime("%H:%M"),
                    "available": True
                })
        
        current_date += timedelta(days=1)
    
    return jsonify({
        "therapist_id": therapist_id,
        "available_slots": available_slots
    }), 200

@booking_bp.route("/therapists/<int:therapist_id>/availability", methods=["POST"])
@jwt_required()
def set_therapist_availability(therapist_id):
    """Set therapist availability (therapist action)"""
    # TODO: Add therapist authentication check
    
    data = request.get_json()
    availability_data = data.get("availability", [])
    
    # Clear existing availability
    TherapistAvailability.query.filter_by(therapist_id=therapist_id).delete()
    
    # Add new availability slots
    for slot_data in availability_data:
        availability = TherapistAvailability(
            therapist_id=therapist_id,
            day_of_week=slot_data["day_of_week"],
            start_time=datetime.strptime(slot_data["start_time"], "%H:%M").time(),
            end_time=datetime.strptime(slot_data["end_time"], "%H:%M").time(),
            is_available=slot_data.get("is_available", True)
        )
        db.session.add(availability)
    
    db.session.commit()
    
    return jsonify({"msg": "Availability updated successfully"}), 200

