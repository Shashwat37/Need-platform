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


class User(db.Model):
    """Every person who logs in: customer, worker, or admin."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)

    # We never store the real password. We store a one-way hash of it.
    # The column is named password_hash so it is obvious that it is not plaintext.
    password_hash = db.Column(db.String(255), nullable=False)

    # "customer", "worker" or "admin" — decides which dashboard the user sees.
    role = db.Column(db.String(20), nullable=False, default="customer")

    address = db.Column(db.String(255))
    gender = db.Column(db.String(20))
    language = db.Column(db.String(10), default="en")  # "en" or "hi"

    # Latitude/longitude are used later for "workers near you" distance sorting.
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    accepted_terms = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Shortcut so we can write user.worker_profile
    worker_profile = db.relationship(
        "WorkerProfile", back_populates="user", uselist=False
    )

    def to_dict(self):
        """Safe version of the user to send to the frontend (no password)."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "address": self.address,
            "gender": self.gender,
            "language": self.language,
        }


class WorkerProfile(db.Model):
    """Extra information that only service providers (workers) have."""

    __tablename__ = "worker_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    skills = db.Column(db.String(255))          # e.g. "Wiring, Fan repair"
    certifications = db.Column(db.String(255))  # e.g. "ITI Electrician"
    experience_years = db.Column(db.Integer, default=0)

    # "pending" -> "verified" or "rejected". Set by the admin in Step 11.
    verification_status = db.Column(db.String(20), default="pending")
    identity_proof = db.Column(db.String(255))  # filename or reference of the uploaded document
    verification_notes = db.Column(db.Text)      # Federation admin approval note or rejection reason

    rating = db.Column(db.Float, default=0.0)
    total_jobs = db.Column(db.Integer, default=0)
    earnings = db.Column(db.Float, default=0.0)

    service_radius_km = db.Column(db.Integer, default=10)
    is_available = db.Column(db.Boolean, default=True)

    # Which service this worker mainly does, e.g. "Electrician".
    primary_service = db.Column(db.String(80))
    city = db.Column(db.String(80))
    photo_url = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="worker_profile")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skills": self.skills,
            "certifications": self.certifications,
            "experience_years": self.experience_years,
            "verification_status": self.verification_status,
            "identity_proof": self.identity_proof,
            "verification_notes": self.verification_notes,
            "rating": round(self.rating or 0.0, 1),
            "total_jobs": self.total_jobs or 0,
            "earnings": round(self.earnings or 0.0, 2),
            "service_radius_km": self.service_radius_km,
            "is_available": self.is_available,
            "primary_service": self.primary_service,
            "city": self.city,
            "photo_url": self.photo_url,
        }


class Service(db.Model):
    """The list of services customers can book, e.g. Electrician, AC Service."""

    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(255))
    starting_price = db.Column(db.Float, nullable=False)

    # A short text key like "electrician". The frontend turns this into an icon.
    # We store a name instead of an image so services stay pure data.
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
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)

    scheduled_date = db.Column(db.String(20))  # "2026-08-30"
    scheduled_time = db.Column(db.String(20))  # "17:00"
    address = db.Column(db.String(255))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))

    is_emergency = db.Column(db.Boolean, default=False)
    amount = db.Column(db.Float, default=0.0)

    # pending -> accepted -> in_progress -> completed  (or rejected / cancelled)
    status = db.Column(db.String(30), default="pending")

    # What the worker typed after finishing the job.
    completion_note = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships used when serialising — loaded only when accessed.
    service    = db.relationship("Service",  foreign_keys=[service_id],  lazy="joined")
    worker     = db.relationship("User",     foreign_keys=[worker_id],   lazy="joined")
    customer   = db.relationship("User",     foreign_keys=[customer_id], lazy="joined")
    payment    = db.relationship("Payment",  backref="booking", uselist=False, lazy="joined")
    review_rel = db.relationship("Review",   foreign_keys="Review.booking_id", uselist=False, lazy="joined")

    def to_dict(self):
        """JSON-safe representation, including nested service name and payment status."""
        return {
            "id":             self.id,
            "service_id":     self.service_id,
            "service_name":   self.service.name if self.service else None,
            "worker_id":      self.worker_id,
            "worker_name":    self.worker.name if self.worker else None,
            "scheduled_date": self.scheduled_date,
            "scheduled_time": self.scheduled_time,
            "address":        self.address,
            "is_emergency":   self.is_emergency,
            "amount":         self.amount,
            "status":         self.status,
            "is_paid":        bool(self.payment and self.payment.status == "successful"),
            "invoice_id":     self.payment.invoice_id if self.payment else None,
            "payment_method": self.payment.method if self.payment else None,
            "review":         self.review_rel.to_dict() if self.review_rel else None,
            "created_at":     self.created_at.isoformat() if self.created_at else None,
        }


class Payment(db.Model):
    """Payment record for a booking. Demo payments in this prototype."""

    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(20))   # "upi", "card", "cash"
    status = db.Column(db.String(20), default="pending")  # pending/successful/failed
    invoice_id = db.Column(db.String(40), unique=True)
    welfare_contribution = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "amount": round(self.amount or 0.0, 2),
            "method": self.method,
            "status": self.status,
            "invoice_id": self.invoice_id,
            "welfare_contribution": round(self.welfare_contribution or 0.0, 2),
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
    """One line in the welfare wallet history, so the balance is explainable."""

    __tablename__ = "welfare_transactions"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))
    amount = db.Column(db.Float, nullable=False)  # positive in, negative out
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
    status = db.Column(db.String(20), default="pending")  # pending / approved / rejected
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
    """Star rating and comment, written after a booking is completed."""

    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    customer = db.relationship("User", foreign_keys=[customer_id], lazy="joined")
    worker = db.relationship("User", foreign_keys=[worker_id], lazy="joined")
    booking = db.relationship("Booking", foreign_keys=[booking_id], lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.name if self.customer else "Customer",
            "worker_id": self.worker_id,
            "worker_name": self.worker.name if self.worker else "Worker",
            "rating": self.rating,
            "comment": self.comment,
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
    status = db.Column(db.String(20), default="open")  # open/in_progress/resolved
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
