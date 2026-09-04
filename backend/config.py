"""
config.py — Centralized Configuration & API Keys Storage for NEED Platform.

WHAT: Holds all application secrets, database URIs, CORS policies, OTP gateways,
      Email SMTP credentials, Govt Aadhaar API keys, and AI keys.
WHY:  Centralizes configuration in one clean, maintainable module so changes are easy.
HOW:  Reads environment variables from .env with fallback defaults for development.
"""

import os
from dotenv import load_dotenv

# Ensure .env file is loaded relative to backend directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    """Master App Configuration."""

    # --- Flask & Security --------------------------------------------------
    SECRET_KEY = os.getenv("SECRET_KEY", "need-cooperative-master-secret-2026")
    DEFAULT_DB_PATH = os.path.join(BASE_DIR, "instance", "database.db")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # --- Session & Security Headers ----------------------------------------
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False  # Set True in production over HTTPS
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 7  # 7 days

    # --- OTP Verification Global Settings ----------------------------------
    # In DEMO_MODE, system accepts default OTP (123456) or generated OTP for testing
    OTP_DEMO_MODE = os.getenv("OTP_DEMO_MODE", "true").lower() in ("true", "1", "yes")
    DEFAULT_DEMO_OTP = os.getenv("DEFAULT_DEMO_OTP", "123456")
    OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))

    # --- Mobile SMS OTP Gateway Keys (e.g. Twilio, MSG91, Fast2SMS) -------
    SMS_GATEWAY_API_KEY = os.getenv("SMS_GATEWAY_API_KEY", "NEED_SMS_GATEWAY_KEY_DEMO_2026")
    SMS_GATEWAY_URL = os.getenv("SMS_GATEWAY_URL", "https://api.msg91.com/v5/otp")
    SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "NEEDIN")

    # --- Email OTP & SMTP Service Settings (e.g. SendGrid, Mailgun, SMTP) ---
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_EMAIL = os.getenv("SMTP_EMAIL", "support@need.in")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "demo_email_app_password")

    # --- Aadhaar Govt Identity API Settings (e.g. Setu, Karza, Cashfree) ----
    AADHAAR_API_KEY = os.getenv("AADHAAR_API_KEY", "NEED_AADHAAR_GOVT_SANDBOX_KEY_2026")
    AADHAAR_CLIENT_ID = os.getenv("AADHAAR_CLIENT_ID", "need_cooperative_client_id")
    AADHAAR_API_URL = os.getenv("AADHAAR_API_URL", "https://api.sandbox.aadhaar.gov.in/v1/verify")

    # --- AI Chatbot & Demand Forecasting API Keys --------------------------
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSy_NEED_Gemini_API_Key_Demo")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-NEED_OpenAI_API_Key_Demo")
