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
from config import Config
from models import db
from routes import api

# Absolute path to this backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def create_app():
    """Build and configure the Flask app."""
    app = Flask(__name__)

    # --- Load Master Configuration & API Keys ------------------------------
    app.config.from_object(Config)

    # --- CORS --------------------------------------------------------------
    cors_origins = app.config.get("CORS_ORIGINS", "*")
    if cors_origins == "*":
        CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    else:
        allowed_list = [o.strip() for o in cors_origins.split(",") if o.strip()]
        CORS(app, origins=allowed_list, supports_credentials=True)

    # --- Database ----------------------------------------------------------
    db.init_app(app)
    with app.app_context():
        db.create_all()

        # Add optional columns dynamically if SQLite database already exists
        alter_statements = [
            ("worker_profiles", "verification_notes TEXT"),
            ("worker_profiles", "cooperative_id INTEGER"),
            ("worker_profiles", "identity_verified BOOLEAN DEFAULT 1"),
            ("worker_profiles", "skill_verified BOOLEAN DEFAULT 1"),
            ("worker_profiles", "upi_id TEXT DEFAULT 'thakuraayush@fam'"),
            ("worker_profiles", "bank_account_number TEXT DEFAULT '919876543210'"),
            ("worker_profiles", "bank_ifsc TEXT DEFAULT 'PUNB0123400'"),
            ("worker_profiles", "bank_name TEXT DEFAULT 'Punjab National Bank'"),
            ("worker_profiles", "account_holder_name TEXT"),
            ("users", "is_verified BOOLEAN DEFAULT 1"),
            ("users", "trust_badge TEXT DEFAULT 'Verified Member'"),
            ("users", "is_mobile_verified BOOLEAN DEFAULT 1"),
            ("users", "is_email_verified BOOLEAN DEFAULT 1"),
            ("users", "aadhaar_number TEXT"),
            ("users", "is_aadhaar_verified BOOLEAN DEFAULT 0"),
            ("bookings", "cooperative_id INTEGER"),
            ("bookings", "accepted_at DATETIME"),
            ("bookings", "assigned_at DATETIME"),
            ("bookings", "on_the_way_at DATETIME"),
            ("bookings", "arrived_at DATETIME"),
            ("bookings", "in_progress_at DATETIME"),
            ("bookings", "completed_at DATETIME"),
            ("bookings", "confirmed_at DATETIME"),
            ("bookings", "cancelled_at DATETIME"),
            ("bookings", "cancellation_reason TEXT"),
            ("bookings", "cancelled_by TEXT"),
            ("payments", "platform_fee FLOAT DEFAULT 0.0"),
            ("payments", "cooperative_share FLOAT DEFAULT 0.0"),
            ("payments", "worker_earnings FLOAT DEFAULT 0.0"),
            ("reviews", "quality_score INTEGER DEFAULT 5"),
            ("reviews", "professionalism_score INTEGER DEFAULT 5"),
            ("reviews", "timeliness_score INTEGER DEFAULT 5"),
            ("reviews", "review_type TEXT DEFAULT 'customer_to_worker'"),
            ("reviews", "is_disputed BOOLEAN DEFAULT 0"),
            ("support_tickets", "booking_id INTEGER"),
            ("support_tickets", "admin_response TEXT"),
            ("bookings", "base_service_amount FLOAT DEFAULT 0.0"),
            ("bookings", "convenience_fee FLOAT DEFAULT 20.0"),
            ("bookings", "protection_fee FLOAT DEFAULT 0.0"),
            ("bookings", "has_protection BOOLEAN DEFAULT 0"),
            ("payments", "convenience_fee FLOAT DEFAULT 0.0"),
            ("payments", "protection_fee FLOAT DEFAULT 0.0"),
            ("cooperatives", "verification_badge TEXT DEFAULT 'Society Verified Community'"),
        ]

        for table, col_def in alter_statements:
            try:
                db.session.execute(db.text(f"ALTER TABLE {table} ADD COLUMN {col_def};"))
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
