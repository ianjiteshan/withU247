from flask import Blueprint, request, jsonify
from src.models import db, Therapist
from flask_jwt_extended import jwt_required, get_jwt_identity
import math

therapist_bp = Blueprint("therapist", __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

@therapist_bp.route("/therapists", methods=["GET"])
def get_therapists():
    # Get query parameters
    min_rating = float(request.args.get("minRating", 4.0))
    specialization = request.args.get("specialization")
    available_now = request.args.get("availableNow")
    max_distance = float(request.args.get("maxDistance", 50))  # km
    user_lat = request.args.get("userLat")
    user_lng = request.args.get("userLng")
    
    # Base query
    query = Therapist.query.filter(Therapist.rating >= min_rating)
    
    # Filter by specialization
    if specialization:
        query = query.filter(Therapist.specializations.contains(f'"{specialization}"'))
    
    # Filter by availability
    if available_now == 'true':
        query = query.filter(Therapist.available_now == True)
    
    therapists = query.all()
    
    # Filter by distance if user location provided
    if user_lat and user_lng:
        user_lat = float(user_lat)
        user_lng = float(user_lng)
        
        filtered_therapists = []
        for therapist in therapists:
            distance = calculate_distance(user_lat, user_lng, therapist.latitude, therapist.longitude)
            if distance <= max_distance:
                therapist_data = therapist.to_dict()
                therapist_data['distance'] = round(distance, 2)
                filtered_therapists.append(therapist_data)
        
        # Sort by distance
        filtered_therapists.sort(key=lambda x: x['distance'])
        return jsonify(filtered_therapists), 200
    
    return jsonify([therapist.to_dict() for therapist in therapists]), 200

@therapist_bp.route("/therapists/<int:therapist_id>", methods=["GET"])
def get_therapist(therapist_id):
    therapist = Therapist.query.get_or_404(therapist_id)
    return jsonify(therapist.to_dict()), 200

@therapist_bp.route("/therapists/search", methods=["POST"])
def search_therapists():
    data = request.get_json()
    
    # Extract search criteria
    specializations = data.get("specializations", [])
    min_rating = data.get("min_rating", 4.0)
    max_fee = data.get("max_fee")
    languages = data.get("languages", [])
    available_now = data.get("available_now", False)
    user_location = data.get("user_location")  # {"lat": 28.609, "lng": 77.056}
    max_distance = data.get("max_distance", 25)  # km
    
    # Build query
    query = Therapist.query.filter(Therapist.rating >= min_rating)
    
    if max_fee:
        query = query.filter(Therapist.consultation_fee <= max_fee)
    
    if available_now:
        query = query.filter(Therapist.available_now == True)
    
    therapists = query.all()
    
    # Filter by specializations
    if specializations:
        filtered_therapists = []
        for therapist in therapists:
            therapist_specializations = therapist.get_specializations()
            if any(spec in therapist_specializations for spec in specializations):
                filtered_therapists.append(therapist)
        therapists = filtered_therapists
    
    # Filter by languages
    if languages:
        filtered_therapists = []
        for therapist in therapists:
            therapist_languages = therapist.get_languages()
            if any(lang in therapist_languages for lang in languages):
                filtered_therapists.append(therapist)
        therapists = filtered_therapists
    
    # Filter by distance and add distance info
    if user_location:
        user_lat = user_location["lat"]
        user_lng = user_location["lng"]
        
        results = []
        for therapist in therapists:
            distance = calculate_distance(user_lat, user_lng, therapist.latitude, therapist.longitude)
            if distance <= max_distance:
                therapist_data = therapist.to_dict()
                therapist_data['distance'] = round(distance, 2)
                results.append(therapist_data)
        
        # Sort by distance
        results.sort(key=lambda x: x['distance'])
        return jsonify(results), 200
    
    return jsonify([therapist.to_dict() for therapist in therapists]), 200

@therapist_bp.route("/therapists/specializations", methods=["GET"])
def get_specializations():
    """Get all unique specializations"""
    therapists = Therapist.query.all()
    specializations = set()
    
    for therapist in therapists:
        therapist_specs = therapist.get_specializations()
        specializations.update(therapist_specs)
    
    return jsonify(sorted(list(specializations))), 200

@therapist_bp.route("/therapists/sectors", methods=["GET"])
def get_sectors():
    """Get all unique Dwarka sectors"""
    sectors = db.session.query(Therapist.sector).distinct().all()
    sector_list = [sector[0] for sector in sectors if sector[0]]
    return jsonify(sorted(sector_list)), 200

