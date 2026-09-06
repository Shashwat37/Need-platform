"""
models.py — the database tables for NEED.

WHAT: Each Python class below becomes one table in SQLite.
WHY:  SQLAlchemy lets us describe tables as classes, so we write Python
      instead of raw SQL. Easier to read and explain.
HOW:  `db.Model` is the base class. Each `db.Column` is one column.

All tables are defined in this single file on purpose — for a project of this
size it is much easier to explain "here is my whole database" than to hunt
through many files.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# One shared database object, created here and connected to the app in app.py.
db = SQLAlchemy()


class Cooperative(db.Model):
    """A Labour Cooperative / Society registered on the NEED platform."""

    __tablename__ = "cooperatives"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    registration_number = db.Column(db.String(80), unique=True)  # e.g. "COOP-DL-2024-8842"
    verification_status = db.Column(db.String(20), default="verified")  # verified / pending / rejected
    city = db.Column(db.String(80))
    address = db.Column(db.String(255))
    service_categories = db.Column(db.String(255))  # e.g. "Electrician, Plumbing, AC Repair"
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))

    # User ID of the Cooperative Administrator
    admin_user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    rating = db.Column(db.Float, default=4.8)
    verification_badge = db.Column(db.String(80), default="Government Registered Cooperative")
    platform_fee_percent = db.Column(db.Float, default=10.0)
    cooperative_fee_percent = db.Column(db.Float, default=5.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    admin_user = db.relationship("User", foreign_keys=[admin_user_id], lazy="joined")
    workers = db.relationship("WorkerProfile", back_populates="cooperative", lazy="select")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "registration_number": self.registration_number,
            "verification_status": self.verification_status,
            "city": self.city,
            "address": self.address,
            "service_categories": self.service_categories,
            "description": self.description,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
            "admin_user_id": self.admin_user_id,
            "admin_name": self.admin_user.name if self.admin_user else "Cooperative Admin",
            "rating": round(self.rating or 4.8, 1),
            "verification_badge": self.verification_badge,
            "platform_fee_percent": self.platform_fee_percent,
            "cooperative_fee_percent": self.cooperative_fee_percent,
            "active_worker_count": len([w for w in self.workers if w.verification_status == "verified"]) if self.workers else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class User(db.Model):
    """Every person who logs in: customer, worker, cooperative_admin, or platform admin."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    # "customer", "worker", "cooperative_admin", "admin"
    role = db.Column(db.String(30), nullable=False, default="customer")

    address = db.Column(db.String(255))
    gender = db.Column(db.String(20))
    language = db.Column(db.String(10), default="en")

    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    # Two-sided trust & OTP verification
    is_verified = db.Column(db.Boolean, default=True)
    trust_badge = db.Column(db.String(80), default="Verified Member")
    is_mobile_verified = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=True)
    aadhaar_number = db.Column(db.String(20))
    is_aadhaar_verified = db.Column(db.Boolean, default=False)

    accepted_terms = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    worker_profile = db.relationship(
        "WorkerProfile", back_populates="user", uselist=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "address": self.address,
            "gender": self.gender,
            "language": self.language,
            "is_verified": self.is_verified,
            "trust_badge": self.trust_badge,
            "is_mobile_verified": self.is_mobile_verified if self.is_mobile_verified is not None else True,
            "is_email_verified": self.is_email_verified if self.is_email_verified is not None else True,
            "aadhaar_number": self.aadhaar_number,
            "is_aadhaar_verified": self.is_aadhaar_verified if self.is_aadhaar_verified is not None else False,
        }


class OTPTransaction(db.Model):
    """Tracks active and historical 6-digit OTP transactions for Mobile, Email, and Govt Aadhaar verification."""

    __tablename__ = "otp_transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    target = db.Column(db.String(120), nullable=False)  # Mobile phone, Email address, or Aadhaar number
    otp_type = db.Column(db.String(20), nullable=False)  # "mobile", "email", "aadhaar"
    otp_code = db.Column(db.String(10), nullable=False)  # 6-digit code e.g. "123456"
    status = db.Column(db.String(20), default="pending")  # "pending", "verified", "expired"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target": self.target,
            "otp_type": self.otp_type,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }


class WorkerProfile(db.Model):
    """Extra information that service providers (workers) have."""

    __tablename__ = "worker_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Labour Cooperative Association
    cooperative_id = db.Column(db.Integer, db.ForeignKey("cooperatives.id"))

    skills = db.Column(db.String(255))
    certifications = db.Column(db.String(255))
    experience_years = db.Column(db.Integer, default=0)

    # Verification badges & checks
    verification_status = db.Column(db.String(20), default="pending")  # pending/verified/rejected
    identity_verified = db.Column(db.Boolean, default=True)
    skill_verified = db.Column(db.Boolean, default=True)
    identity_proof = db.Column(db.String(255))
    verification_notes = db.Column(db.Text)

    rating = db.Column(db.Float, default=0.0)
    total_jobs = db.Column(db.Integer, default=0)
    earnings = db.Column(db.Float, default=0.0)

    service_radius_km = db.Column(db.Integer, default=10)
    is_available = db.Column(db.Boolean, default=True)

    primary_service = db.Column(db.String(80))
    city = db.Column(db.String(80))
    photo_url = db.Column(db.String(255))

    # Dynamic Payment & Bank Details
    upi_id = db.Column(db.String(120), default="thakuraayush@fam")
    bank_account_number = db.Column(db.String(50), default="919876543210")
    bank_ifsc = db.Column(db.String(20), default="PUNB0123400")
    bank_name = db.Column(db.String(100), default="Punjab National Bank")
    account_holder_name = db.Column(db.String(120))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="worker_profile")
    cooperative = db.relationship("Cooperative", back_populates="workers")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skills": self.skills,
            "certifications": self.certifications,
            "experience_years": self.experience_years,
            "verification_status": self.verification_status,
            "identity_verified": self.identity_verified,
            "skill_verified": self.skill_verified,
            "identity_proof": self.identity_proof,
            "verification_notes": self.verification_notes,
            "cooperative_id": self.cooperative_id,
            "cooperative_name": self.cooperative.name if self.cooperative else "Independent Member Cooperative",
            "rating": round(self.rating or 0.0, 1),
            "total_jobs": self.total_jobs or 0,
            "earnings": round(self.earnings or 0.0, 2),
            "service_radius_km": self.service_radius_km,
            "is_available": self.is_available,
            "primary_service": self.primary_service,
            "city": self.city,
            "photo_url": self.photo_url,
            "upi_id": self.upi_id or "thakuraayush@fam",
            "bank_account_number": self.bank_account_number or "919876543210",
            "bank_ifsc": self.bank_ifsc or "PUNB0123400",
            "bank_name": self.bank_name or "Punjab National Bank",
            "account_holder_name": self.account_holder_name or (self.user.name if self.user else "Cooperative Artisan"),
        }


class Service(db.Model):
    """The list of services customers can book."""

    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(255))
    starting_price = db.Column(db.Float, nullable=False)
    icon = db.Column(db.String(40), default="wrench")
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "starting_price": self.starting_price,
            "icon": self.icon,
        }


class Booking(db.Model):
    """One service request made by a customer."""

    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    cooperative_id = db.Column(db.Integer, db.ForeignKey("cooperatives.id"))
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)

    scheduled_date = db.Column(db.String(20))
    scheduled_time = db.Column(db.String(20))
    address = db.Column(db.String(255))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))

    is_emergency = db.Column(db.Boolean, default=False)
    amount = db.Column(db.Float, default=0.0)

    # Customer-side revenue fee model
    base_service_amount = db.Column(db.Float, default=0.0)
    convenience_fee = db.Column(db.Float, default=20.0)  # Compulsory platform convenience fee
    protection_fee = db.Column(db.Float, default=0.0)   # Optional Customer Protection Fee (max ₹50)
    has_protection = db.Column(db.Boolean, default=False)

    # Lifecycle: requested -> accepted -> worker_assigned -> on_the_way -> arrived -> in_progress -> completed -> confirmed (or cancelled)
    status = db.Column(db.String(30), default="requested")

    # Timestamps for complete lifecycle accountability
    accepted_at = db.Column(db.DateTime)
    assigned_at = db.Column(db.DateTime)
    on_the_way_at = db.Column(db.DateTime)
    arrived_at = db.Column(db.DateTime)
    in_progress_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    confirmed_at = db.Column(db.DateTime)
    cancelled_at = db.Column(db.DateTime)

    # Cancellation accountability
    cancellation_reason = db.Column(db.Text)
    cancelled_by = db.Column(db.String(20))  # "customer", "worker", "cooperative", "admin"

    completion_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    service     = db.relationship("Service",     foreign_keys=[service_id],     lazy="joined")
    worker      = db.relationship("User",        foreign_keys=[worker_id],      lazy="joined")
    customer    = db.relationship("User",        foreign_keys=[customer_id],    lazy="joined")
    cooperative = db.relationship("Cooperative", foreign_keys=[cooperative_id], lazy="joined")
    payment     = db.relationship("Payment",     backref="booking", uselist=False, lazy="joined")
    review_rel  = db.relationship("Review",      foreign_keys="Review.booking_id", uselist=False, lazy="joined")

    def to_dict(self):
        return {
            "id":                  self.id,
            "service_id":          self.service_id,
            "service_name":        self.service.name if self.service else None,
            "customer_id":         self.customer_id,
            "customer_name":       self.customer.name if self.customer else "Customer",
            "worker_id":           self.worker_id,
            "worker_name":         self.worker.name if self.worker else "Pending Worker Assignment",
            "worker_upi_id":       self.worker.worker_profile.upi_id if (self.worker and self.worker.worker_profile and self.worker.worker_profile.upi_id) else "thakuraayush@fam",
            "worker_bank_account": self.worker.worker_profile.bank_account_number if (self.worker and self.worker.worker_profile and self.worker.worker_profile.bank_account_number) else "919876543210",
            "worker_bank_ifsc":    self.worker.worker_profile.bank_ifsc if (self.worker and self.worker.worker_profile and self.worker.worker_profile.bank_ifsc) else "PUNB0123400",
            "worker_bank_name":    self.worker.worker_profile.bank_name if (self.worker and self.worker.worker_profile and self.worker.worker_profile.bank_name) else "Punjab National Bank",
            "worker_account_holder": self.worker.worker_profile.account_holder_name if (self.worker and self.worker.worker_profile and self.worker.worker_profile.account_holder_name) else (self.worker.name if self.worker else "Pooja Bisht"),
            "cooperative_id":      self.cooperative_id,
            "cooperative_name":    self.cooperative.name if self.cooperative else (self.worker.worker_profile.cooperative.name if (self.worker and self.worker.worker_profile and self.worker.worker_profile.cooperative) else "NEED Cooperative Federation"),
            "scheduled_date":      self.scheduled_date,
            "scheduled_time":      self.scheduled_time,
            "address":             self.address,
            "is_emergency":        self.is_emergency,
            "amount":              self.amount,
            "base_service_amount": round(self.base_service_amount if self.base_service_amount else (self.amount - (self.convenience_fee or 0.0) - (self.protection_fee or 0.0)), 2),
            "convenience_fee":     round(self.convenience_fee or 0.0, 2),
            "protection_fee":      round(self.protection_fee or 0.0, 2),
            "has_protection":      bool(self.has_protection),
            "status":              self.status,
            "accepted_at":         self.accepted_at.isoformat() if self.accepted_at else None,
            "on_the_way_at":       self.on_the_way_at.isoformat() if self.on_the_way_at else None,
            "arrived_at":          self.arrived_at.isoformat() if self.arrived_at else None,
            "in_progress_at":      self.in_progress_at.isoformat() if self.in_progress_at else None,
            "completed_at":        self.completed_at.isoformat() if self.completed_at else None,
            "confirmed_at":        self.confirmed_at.isoformat() if self.confirmed_at else None,
            "cancelled_at":        self.cancelled_at.isoformat() if self.cancelled_at else None,
            "cancellation_reason": self.cancellation_reason,
            "cancelled_by":        self.cancelled_by,
            "completion_note":     self.completion_note,
            "is_paid":             bool(self.payment and self.payment.status == "successful"),
            "invoice_id":          self.payment.invoice_id if self.payment else None,
            "payment_method":      self.payment.method if self.payment else None,
            "payment_breakdown":   self.payment.to_dict() if self.payment else None,
            "review":              self.review_rel.to_dict() if self.review_rel else None,
            "created_at":          self.created_at.isoformat() if self.created_at else None,
        }


class Payment(db.Model):
    """Payment record with transparent fee breakdown."""

    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(20))   # "upi", "card", "cash"
    status = db.Column(db.String(20), default="pending")
    invoice_id = db.Column(db.String(40), unique=True)
    
    # Transparent Fee Breakdown
    platform_fee = db.Column(db.Float, default=0.0)      # e.g., 10%
    cooperative_share = db.Column(db.Float, default=0.0)  # e.g., 5%
    worker_earnings = db.Column(db.Float, default=0.0)    # e.g., 85%
    welfare_contribution = db.Column(db.Float, default=0.0)
    convenience_fee = db.Column(db.Float, default=0.0)
    protection_fee = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "amount": round(self.amount or 0.0, 2),
            "method": self.method,
            "status": self.status,
            "invoice_id": self.invoice_id,
            "platform_fee": round(self.platform_fee or (self.amount * 0.10), 2),
            "cooperative_share": round(self.cooperative_share or (self.amount * 0.05), 2),
            "worker_earnings": round(self.worker_earnings or (self.amount * 0.85), 2),
            "welfare_contribution": round(self.welfare_contribution or 0.0, 2),
            "convenience_fee": round(self.convenience_fee or 0.0, 2),
            "protection_fee": round(self.protection_fee or 0.0, 2),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WelfareWallet(db.Model):
    """A worker's welfare savings, funded by a small share of each job."""

    __tablename__ = "welfare_wallets"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    total_contribution = db.Column(db.Float, default=0.0)
    insurance_contribution = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "worker_id": self.worker_id,
            "balance": round(self.balance or 0.0, 2),
            "total_contribution": round(self.total_contribution or 0.0, 2),
            "insurance_contribution": round(self.insurance_contribution or 0.0, 2),
        }


class WelfareTransaction(db.Model):
    """One line in the welfare wallet history."""

    __tablename__ = "welfare_transactions"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))
    amount = db.Column(db.Float, nullable=False)
    note = db.Column(db.String(140))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "worker_id": self.worker_id,
            "booking_id": self.booking_id,
            "amount": round(self.amount or 0.0, 2),
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WelfareWithdrawalRequest(db.Model):
    """An emergency cash withdrawal request submitted by a worker from their welfare wallet."""

    __tablename__ = "welfare_withdrawal_requests"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="pending")
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    worker = db.relationship("User", foreign_keys=[worker_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "worker_id": self.worker_id,
            "worker_name": self.worker.name if self.worker else "Worker",
            "amount": round(self.amount or 0.0, 2),
            "reason": self.reason,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Tip(db.Model):
    """Optional extra money the customer gives the worker after a job."""

    __tablename__ = "tips"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "worker_id": self.worker_id,
            "amount": round(self.amount or 0.0, 2),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Review(db.Model):
    """Two-sided star rating and detailed service feedback."""

    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    quality_score = db.Column(db.Integer, default=5)
    professionalism_score = db.Column(db.Integer, default=5)
    timeliness_score = db.Column(db.Integer, default=5)

    comment = db.Column(db.Text)
    review_type = db.Column(db.String(30), default="customer_to_worker")
    is_disputed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship("User", foreign_keys=[customer_id], lazy="joined")
    worker   = db.relationship("User", foreign_keys=[worker_id],   lazy="joined")
    booking  = db.relationship("Booking", foreign_keys=[booking_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.name if self.customer else "Customer",
            "worker_id": self.worker_id,
            "worker_name": self.worker.name if self.worker else "Worker",
            "rating": self.rating,
            "quality_score": self.quality_score,
            "professionalism_score": self.professionalism_score,
            "timeliness_score": self.timeliness_score,
            "comment": self.comment,
            "review_type": self.review_type,
            "is_disputed": self.is_disputed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Dispute(db.Model):
    """Structured dispute system for booking conflicts."""

    __tablename__ = "disputes"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    raised_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    against_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    cooperative_id = db.Column(db.Integer, db.ForeignKey("cooperatives.id"))

    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    evidence_url = db.Column(db.String(255))

    status = db.Column(db.String(20), default="open")  # open / under_review / resolved / rejected
    resolution_notes = db.Column(db.Text)
    resolved_by_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship("Booking", foreign_keys=[booking_id], lazy="joined")
    raised_by = db.relationship("User", foreign_keys=[raised_by_id], lazy="joined")
    against = db.relationship("User", foreign_keys=[against_id], lazy="joined")
    cooperative = db.relationship("Cooperative", foreign_keys=[cooperative_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "service_name": self.booking.service.name if (self.booking and self.booking.service) else None,
            "raised_by_id": self.raised_by_id,
            "raised_by_name": self.raised_by.name if self.raised_by else "User",
            "raised_by_role": self.raised_by.role if self.raised_by else "User",
            "against_id": self.against_id,
            "against_name": self.against.name if self.against else "N/A",
            "cooperative_id": self.cooperative_id,
            "cooperative_name": self.cooperative.name if self.cooperative else None,
            "category": self.category,
            "description": self.description,
            "evidence_url": self.evidence_url,
            "status": self.status,
            "resolution_notes": self.resolution_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SupportTicket(db.Model):
    """A help request raised from the Help Centre."""

    __tablename__ = "support_tickets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))
    category = db.Column(db.String(40))
    subject = db.Column(db.String(140), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default="open")
    admin_response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", foreign_keys=[user_id], lazy="joined")
    booking = db.relationship("Booking", foreign_keys=[booking_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "user_role": self.user.role if self.user else None,
            "user_email": self.user.email if self.user else None,
            "booking_id": self.booking_id,
            "service_name": self.booking.service.name if (self.booking and self.booking.service) else None,
            "category": self.category,
            "subject": self.subject,
            "description": self.description,
            "status": self.status,
            "admin_response": self.admin_response,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ===========================================================================
# REVENUE MODEL ARCHITECTURE (Step 18)
# ===========================================================================

class LeadPricing(db.Model):
    """Admin-configurable pricing for job leads per service category and job tier."""

    __tablename__ = "lead_pricings"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(80), nullable=False, unique=True)  # e.g. "Electrician", "Plumber"
    job_type = db.Column(db.String(50), default="standard")          # "standard", "emergency", "high_value"
    lead_price = db.Column(db.Float, nullable=False, default=15.0)   # e.g. ₹10, ₹15, ₹20
    min_job_value = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "job_type": self.job_type,
            "lead_price": round(self.lead_price, 2),
            "min_job_value": round(self.min_job_value or 0.0, 2),
            "is_active": self.is_active,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class LeadCreditWallet(db.Model):
    """Tracks worker's pre-funded lead credits balance for unlocking customer job leads."""

    __tablename__ = "lead_credit_wallets"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    balance = db.Column(db.Float, default=150.0)  # default demo credits
    total_spent = db.Column(db.Float, default=0.0)
    total_leads_unlocked = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    worker = db.relationship("User", foreign_keys=[worker_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "worker_id": self.worker_id,
            "balance": round(self.balance or 0.0, 2),
            "total_spent": round(self.total_spent or 0.0, 2),
            "total_leads_unlocked": self.total_leads_unlocked or 0,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class WorkerLeadPurchase(db.Model):
    """Records an unlocked job lead by a worker to prevent duplicate charges and preserve audit trail."""

    __tablename__ = "worker_lead_purchases"
    __table_args__ = (
        db.UniqueConstraint("worker_id", "booking_id", name="uq_worker_booking_lead"),
    )

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="unlocked")
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)

    worker = db.relationship("User", foreign_keys=[worker_id], lazy="joined")
    booking = db.relationship("Booking", foreign_keys=[booking_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "worker_id": self.worker_id,
            "worker_name": self.worker.name if self.worker else "Worker",
            "booking_id": self.booking_id,
            "service_name": self.booking.service.name if (self.booking and self.booking.service) else "Service",
            "service_category": self.booking.service.category if (self.booking and self.booking.service) else "General",
            "customer_name": self.booking.customer.name if (self.booking and self.booking.customer) else "Customer",
            "customer_phone": self.booking.customer.phone if (self.booking and self.booking.customer) else None,
            "customer_address": self.booking.address if self.booking else None,
            "amount_paid": round(self.amount_paid or 0.0, 2),
            "status": self.status,
            "unlocked_at": self.unlocked_at.isoformat() if self.unlocked_at else None,
        }


class SubscriptionPlan(db.Model):
    """Configurable recurring service subscription plans for organizations (PG/Hostel, Offices, Local Industries)."""

    __tablename__ = "subscription_plans"

    id = db.Column(db.Integer, primary_key=True)
    org_type = db.Column(db.String(50), nullable=False)       # "PG / Hostel", "Office", "Local Industry"
    billing_cycle = db.Column(db.String(20), nullable=False)  # "weekly", "monthly", "yearly"
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    features = db.Column(db.Text)  # separated by ;;
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "org_type": self.org_type,
            "billing_cycle": self.billing_cycle,
            "name": self.name,
            "price": round(self.price, 2),
            "description": self.description,
            "features": [f.strip() for f in self.features.split(";;") if f.strip()] if self.features else [],
            "is_active": self.is_active,
        }


class Subscription(db.Model):
    """Active or historical organization subscription to NEED facility maintenance services."""

    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("subscription_plans.id"), nullable=False)

    org_name = db.Column(db.String(150), nullable=False)
    org_type = db.Column(db.String(50), nullable=False)       # "PG / Hostel", "Office", "Local Industry"
    billing_cycle = db.Column(db.String(20), nullable=False)  # "weekly", "monthly", "yearly"
    price = db.Column(db.Float, nullable=False)

    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="active")       # "active", "cancelled", "expired"
    auto_renew = db.Column(db.Boolean, default=True)

    cancellation_reason = db.Column(db.Text)
    cancelled_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", foreign_keys=[user_id], lazy="joined")
    plan = db.relationship("SubscriptionPlan", foreign_keys=[plan_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subscriber_name": self.user.name if self.user else None,
            "subscriber_email": self.user.email if self.user else None,
            "org_name": self.org_name,
            "org_type": self.org_type,
            "plan_id": self.plan_id,
            "plan_name": self.plan.name if self.plan else "Custom Enterprise Plan",
            "billing_cycle": self.billing_cycle,
            "price": round(self.price, 2),
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "status": self.status,
            "auto_renew": self.auto_renew,
            "is_active": self.status == "active" and (self.expiry_date > datetime.utcnow() if self.expiry_date else True),
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class RevenueRecord(db.Model):
    """Centralized, immutable audit record for every revenue-generating event."""

    __tablename__ = "revenue_records"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    source_type = db.Column(db.String(30), nullable=False)  # "JOB_LEAD", "SUBSCRIPTION", "CONVENIENCE_FEE", "PROTECTION_FEE", "PLATFORM_FEE"
    amount = db.Column(db.Float, nullable=False)
    reference_id = db.Column(db.String(80))                 # e.g. booking_id, subscription_id, lead_purchase_id
    service_category = db.Column(db.String(80))             # for category reporting
    org_type = db.Column(db.String(50))                     # for organization reporting
    description = db.Column(db.String(255))
    status = db.Column(db.String(20), default="completed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", foreign_keys=[user_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Platform Guest",
            "source_type": self.source_type,
            "amount": round(self.amount or 0.0, 2),
            "reference_id": self.reference_id,
            "service_category": self.service_category,
            "org_type": self.org_type,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
