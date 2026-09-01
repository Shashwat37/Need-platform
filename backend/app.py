"""
app.py — the entry point of the NEED backend.

WHAT: Creates the Flask application, connects the database, allows the React
      app to call us, and registers the API routes.
WHY:  Everything the server needs to start lives in one short, readable file.
HOW:  Run it with:   python app.py
      Then open:     http://localhost:5000/api/health
"""

import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from auth import auth
from models import db
from routes import api

# Read the .env file (if there is one) into environment variables.
load_dotenv()

# Absolute path to this backend folder, so the database is always the same file
# no matter which folder you launch the server from.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Where the database actually lives: backend/instance/database.db
#
# WHY it is spelled out as an absolute path: when DATABASE_URL is a *relative*
# path like "sqlite:///database.db", Flask-SQLAlchemy resolves it inside the
# instance folder. The fallback used to point next to app.py instead, one level
# up. So running with a .env file and running without one opened two different
# database files — and the one without looked like the app had lost all its
# data, with no error to explain why. Both now resolve to the same file.
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "instance", "database.db")
os.makedirs(os.path.dirname(DEFAULT_DB_PATH), exist_ok=True)


def create_app():
    """Build and configure the Flask app."""
    app = Flask(__name__)

    # --- Configuration -----------------------------------------------------
    # Secrets and settings come from .env, never hardcoded.
    # The second argument to os.getenv is the fallback used in development.
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- Session -----------------------------------------------------------
    # Sessions are stored server-side in a signed cookie. The secret key
    # signs the cookie so clients cannot forge it.
    # SameSite=Lax stops cross-site request forgery in most cases.
    # HttpOnly hides the cookie from JavaScript (not readable by XSS).
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = False  # True in production (HTTPS)
    app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 7  # 7 days

    # --- CORS --------------------------------------------------------------
    # Allows cross-origin calls from local Vite dev server, custom ports, or deployed domains.
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    if cors_origins == "*":
        CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    else:
        allowed_list = [o.strip() for o in cors_origins.split(",") if o.strip()]
        CORS(app, origins=allowed_list, supports_credentials=True)

    # --- Database ----------------------------------------------------------
    db.init_app(app)
    with app.app_context():
        db.create_all()
        # Ensure SQLite table worker_profiles has verification_notes column
        try:
            db.session.execute(db.text("ALTER TABLE worker_profiles ADD COLUMN verification_notes TEXT;"))
            db.session.commit()
        except Exception:
            db.session.rollback()

        # Ensure SQLite table support_tickets has booking_id and admin_response columns
        for col_def in ("booking_id INTEGER", "admin_response TEXT"):
            try:
                db.session.execute(db.text(f"ALTER TABLE support_tickets ADD COLUMN {col_def};"))
                db.session.commit()
            except Exception:
                db.session.rollback()

    # --- Routes ------------------------------------------------------------
    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(auth, url_prefix="/api/auth")

    @app.get("/")
    def index():
        return jsonify(
            {
                "name": "NEED API",
                "status": "online",
                "docs": "Try /api/health, /api/services, /api/stats, /api/auth/me",
            }
        )

    # --- Error handlers ----------------------------------------------------
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Something went wrong on the server"}), 500

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
