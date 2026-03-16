from flask import Blueprint, request, jsonify
from src.models.quiz import db, Quiz, QuizResult
from src.models.therapist import Therapist
from flask_jwt_extended import jwt_required, get_jwt_identity

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/quizzes", methods=["GET"])
def get_quizzes():
    """Get all active quizzes"""
    quizzes = Quiz.query.filter_by(active=True).all()
    return jsonify([quiz.to_dict() for quiz in quizzes]), 200

@quiz_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    """Get a specific quiz"""
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify(quiz.to_dict()), 200

@quiz_bp.route("/quizzes/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    """Submit quiz answers and get results"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    answers = data.get("answers", [])
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Calculate score based on quiz scoring logic
    score = calculate_quiz_score(quiz, answers)
    
    # Generate interpretation
    interpretation = generate_interpretation(quiz, score, answers)
    
    # Get recommended therapists
    recommended_therapists = get_recommended_therapists(score, interpretation)
    
    # Save quiz result
    quiz_result = QuizResult(
        user_id=current_user_id,
        quiz_id=quiz_id,
        score=score,
        interpretation=interpretation
    )
    quiz_result.set_answers(answers)
    quiz_result.set_recommended_therapists([t.id for t in recommended_therapists])
    
    db.session.add(quiz_result)
    db.session.commit()
    
    return jsonify({
        "score": score,
        "interpretation": interpretation,
        "recommended_therapists": [t.to_dict() for t in recommended_therapists],
        "result_id": quiz_result.id
    }), 200

@quiz_bp.route("/quiz-results", methods=["GET"])
@jwt_required()
def get_user_quiz_results():
    """Get user's quiz results"""
    current_user_id = get_jwt_identity()
    results = QuizResult.query.filter_by(user_id=current_user_id).order_by(QuizResult.taken_at.desc()).all()
    return jsonify([result.to_dict() for result in results]), 200

@quiz_bp.route("/quiz-results/<int:result_id>", methods=["GET"])
@jwt_required()
def get_quiz_result(result_id):
    """Get specific quiz result"""
    current_user_id = get_jwt_identity()
    result = QuizResult.query.filter_by(id=result_id, user_id=current_user_id).first_or_404()
    
    # Include recommended therapists
    therapist_ids = result.get_recommended_therapists()
    therapists = Therapist.query.filter(Therapist.id.in_(therapist_ids)).all()
    
    result_data = result.to_dict()
    result_data["recommended_therapists"] = [t.to_dict() for t in therapists]
    
    return jsonify(result_data), 200

def calculate_quiz_score(quiz, answers):
    """Calculate quiz score based on answers"""
    scoring_logic = quiz.get_scoring_logic()
    questions = quiz.get_questions()
    
    total_score = 0
    
    for i, answer in enumerate(answers):
        if i < len(questions):
            question = questions[i]
            question_type = question.get("type", "multiple_choice")
            
            if question_type == "multiple_choice":
                # Score based on selected option
                options = question.get("options", [])
                if answer < len(options):
                    option_score = options[answer].get("score", 0)
                    total_score += option_score
            
            elif question_type == "scale":
                # Direct score for scale questions (1-10)
                total_score += int(answer)
    
    return total_score

def generate_interpretation(quiz, score, answers):
    """Generate interpretation based on score"""
    if score <= 20:
        return {
            "level": "Low Risk",
            "description": "You appear to be managing well overall. Consider maintaining healthy habits and staying connected with support systems.",
            "recommendations": [
                "Continue with regular self-care practices",
                "Maintain social connections",
                "Consider preventive mental health resources"
            ]
        }
    elif score <= 40:
        return {
            "level": "Mild Concern",
            "description": "You may be experiencing some stress or mild symptoms. It could be helpful to speak with a mental health professional.",
            "recommendations": [
                "Consider counseling or therapy",
                "Practice stress management techniques",
                "Maintain regular sleep and exercise routines",
                "Connect with trusted friends or family"
            ]
        }
    elif score <= 60:
        return {
            "level": "Moderate Concern",
            "description": "You appear to be experiencing significant stress or symptoms that may benefit from professional support.",
            "recommendations": [
                "Strongly consider professional counseling",
                "Explore therapy options in your area",
                "Practice daily mindfulness or relaxation",
                "Consider support groups"
            ]
        }
    else:
        return {
            "level": "High Concern",
            "description": "You may be experiencing significant mental health challenges. We strongly recommend seeking professional help.",
            "recommendations": [
                "Seek immediate professional help",
                "Contact a mental health crisis line if needed",
                "Consider both therapy and psychiatric evaluation",
                "Reach out to emergency contacts for support"
            ]
        }

def get_recommended_therapists(score, interpretation):
    """Get recommended therapists based on quiz results"""
    level = interpretation["level"]
    
    # Base query for therapists with good ratings
    query = Therapist.query.filter(Therapist.rating >= 4.0, Therapist.verified == True)
    
    if level == "High Concern":
        # Prioritize psychiatrists and crisis specialists
        specializations = ["Crisis Intervention", "Severe Depression", "Anxiety Disorders", "PTSD"]
    elif level == "Moderate Concern":
        # General therapists with relevant specializations
        specializations = ["Anxiety", "Depression", "Stress Management", "Cognitive Behavioral Therapy"]
    else:
        # Counselors and general therapists
        specializations = ["General Counseling", "Stress Management", "Life Coaching", "Mindfulness"]
    
    # Filter by specializations
    therapists = []
    all_therapists = query.all()
    
    for therapist in all_therapists:
        therapist_specs = therapist.get_specializations()
        if any(spec in therapist_specs for spec in specializations):
            therapists.append(therapist)
    
    # Sort by rating and return top 5
    therapists.sort(key=lambda x: x.rating, reverse=True)
    return therapists[:5]

