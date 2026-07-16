from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config

db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.teams import teams_bp
    from app.routes.players import players_bp
    from app.routes.tournaments import tournaments_bp
    from app.routes.registrations import registrations_bp
    from app.routes.matches import matches_bp
    from app.routes.results import results_bp
    from app.routes.leaderboard import leaderboard_bp
    from app.routes.analytics import analytics_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(teams_bp, url_prefix="/api/teams")
    app.register_blueprint(players_bp, url_prefix="/api/players")
    app.register_blueprint(tournaments_bp, url_prefix="/api/tournaments")
    app.register_blueprint(registrations_bp, url_prefix="/api/registrations")
    app.register_blueprint(matches_bp, url_prefix="/api/matches")
    app.register_blueprint(results_bp, url_prefix="/api/results")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "BGMI Tournament Management System API"})

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"success": False, "message": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "message": "Authorization token is required"}), 401

    return app
