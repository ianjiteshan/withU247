from flask import Blueprint, request, jsonify
from src.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"msg": "Missing username, email, or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=24))
    return jsonify(access_token=access_token), 200

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify({"msg": "Access granted to protected route!"}), 200


