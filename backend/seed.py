"""
seed.py — fills the database with demo data.

WHAT: Creates the 20 services, one admin, a few customers, and 20 workers.
WHY:  An empty app looks broken during a demo. Seeding means the moment you
      start the project, the pages already have realistic content.
HOW:  Run it once from the backend folder:

          python seed.py

      It DELETES all existing rows first, then inserts fresh demo data.
      That is intentional: running it again always gives you a clean, known
      state, which is exactly what you want before a presentation.

Every account created here uses an obvious demo password (see README).
"""

from werkzeug.security import generate_password_hash

from app import app
from models import Service, User, WelfareWallet, WorkerProfile, db
from routes import WALLET_INSURANCE_SHARE, WALLET_LIQUID_SHARE, WELFARE_RATE

# The password for every demo account. Fine for a prototype, never for real use.
DEMO_PASSWORD = "demo123"


# --------------------------------------------------------------------------
# 1. Services
# --------------------------------------------------------------------------
# The "icon" value is a short text key. The React app maps it to a Lucide
# icon component. Storing a name (not an image) keeps services as pure data,
# so an admin can add a service later without touching any code.
SERVICES = [
    # name, category, description, starting_price, icon
    ("Electrician", "Home Services", "Wiring, switches, fans and light fittings", 299, "electrician"),
    ("Plumber", "Home Services", "Leaking taps, blocked drains and pipe fitting", 249, "plumber"),
    ("Carpenter", "Home Services", "Furniture repair, door and cupboard work", 349, "carpenter"),
    ("Painter", "Home Services", "Wall painting, putty work and touch-ups", 1499, "painter"),
    ("Cleaner", "Home Services", "Deep cleaning for kitchen, bathroom and floors", 499, "cleaner"),
    ("Gardener", "Home Services", "Lawn cutting, plant care and terrace gardens", 399, "gardener"),
    ("House Help", "Home Services", "Daily household help and kitchen assistance", 599, "house-help"),
    ("Caregiver", "Home Services", "Elderly care, patient care and child care", 899, "caregiver"),
    ("Driver", "Home Services", "Hourly or full-day driver on request", 699, "driver"),
    ("Technician", "Home Services", "General technical repairs around the house", 349, "technician"),

    ("AC Service", "Appliance Services", "AC servicing, gas refilling and installation", 599, "ac-service"),
    ("Refrigerator Service", "Appliance Services", "Cooling problems, gas charging and repair", 449, "refrigerator"),
    ("Washing Machine Service", "Appliance Services", "Drum, motor and drainage repairs", 399, "washing-machine"),
    ("TV Installation", "Appliance Services", "Wall mounting, setup and channel tuning", 499, "tv"),
    ("Appliance Repair", "Appliance Services", "Mixer, geyser, microwave and small appliances", 349, "appliance-repair"),

    ("Car Washing", "Other Services", "Doorstep car cleaning, inside and outside", 199, "car-washing"),
    ("Construction Labour", "Other Services", "Skilled and unskilled labour on daily wages", 799, "construction"),
    ("Pest Control", "Other Services", "Cockroach, termite and mosquito treatment", 1199, "pest-control"),
    ("Pet Grooming", "Other Services", "Bathing, trimming and nail care for pets", 699, "pet-grooming"),
    ("Barber", "Other Services", "Haircut and grooming at your doorstep", 149, "barber"),
]


# --------------------------------------------------------------------------
# 2. Demo customers
# --------------------------------------------------------------------------
CUSTOMERS = [
    # name, email, phone, address, gender, latitude, longitude
    ("Ananya Mehta", "ananya@example.com", "9810000001", "B-42, Sector 62, Noida", "female", 28.6270, 77.3720),
    ("Rohit Malhotra", "rohit@example.com", "9810000002", "C-11, Sector 18, Noida", "male", 28.5700, 77.3210),
    ("Sneha Kapoor", "sneha@example.com", "9810000003", "Flat 304, Indirapuram, Ghaziabad", "female", 28.6420, 77.3720),
    ("Imran Qureshi", "imran@example.com", "9810000004", "A-9, Sector 50, Noida", "male", 28.5680, 77.3600),
    ("Divya Nair", "divya@example.com", "9810000005", "D-7, Sector 76, Noida", "female", 28.5700, 77.3900),
]


# --------------------------------------------------------------------------
# 3. Demo workers
# --------------------------------------------------------------------------
# verification_status is one of: verified, pending, rejected.
# Having all three in the demo data means the admin verification screen and
# the coloured status badges have something real to show.
WORKERS = [
    # name, email, phone, service, skills, certification, years, rating, jobs,
    # status, city, latitude, longitude
    ("Rahul Kumar", "rahul@example.com", "9820000001", "Electrician",
     "House wiring, Fan repair, MCB fitting", "ITI Electrician", 5, 4.8, 213,
     "verified", "Sector 62, Noida", 28.6280, 77.3649),

    ("Amit Sharma", "amit@example.com", "9820000002", "Plumber",
     "Pipe fitting, Leak repair, Tank cleaning", "Plumbing Level 2", 7, 4.6, 341,
     "verified", "Sector 18, Noida", 28.5701, 77.3230),

    ("Suresh Yadav", "suresh@example.com", "9820000003", "Carpenter",
     "Modular furniture, Door frames, Polishing", "Woodwork Craftsman", 10, 4.9, 402,
     "verified", "Indirapuram, Ghaziabad", 28.6430, 77.3710),

    ("Neha Devi", "neha@example.com", "9820000004", "Cleaner",
     "Deep cleaning, Sofa shampoo, Bathroom care", "Housekeeping Certified", 3, 4.7, 156,
     "verified", "Sector 50, Noida", 28.5690, 77.3610),

    ("Priya Singh", "priya@example.com", "9820000005", "Painter",
     "Emulsion, Putty work, Texture finish", "Painting Skill Cert.", 4, 4.5, 98,
     "verified", "Vaishali, Ghaziabad", 28.6500, 77.3390),

    ("Ramesh Chandra", "ramesh@example.com", "9820000006", "AC Service",
     "Split AC service, Gas refill, Installation", "HVAC Technician", 8, 4.8, 287,
     "verified", "Sector 62, Noida", 28.6260, 77.3680),

    ("Sunita Kumari", "sunita@example.com", "9820000007", "House Help",
     "Cooking, Utensils, Daily cleaning", "Home Care Basics", 6, 4.6, 512,
     "verified", "Sector 76, Noida", 28.5720, 77.3880),

    ("Vikram Rathore", "vikram@example.com", "9820000008", "Driver",
     "City driving, Outstation, Manual and automatic", "Commercial Licence", 9, 4.4, 176,
     "verified", "Sector 15, Noida", 28.5830, 77.3110),

    ("Manoj Gupta", "manoj@example.com", "9820000009", "Refrigerator Service",
     "Cooling repair, Compressor, Gas charging", "Refrigeration Cert.", 6, 4.5, 143,
     "verified", "Mayur Vihar, Delhi", 28.6090, 77.2950),

    ("Kavita Sharma", "kavita@example.com", "9820000010", "Caregiver",
     "Elderly care, Post-surgery care, Child care", "Nursing Assistant", 5, 4.9, 121,
     "verified", "Sector 47, Noida", 28.5660, 77.3550),

    ("Deepak Verma", "deepak@example.com", "9820000011", "Washing Machine Service",
     "Front load, Top load, Drainage repair", "Appliance Repair Cert.", 4, 4.3, 87,
     "verified", "Sector 63, Noida", 28.6270, 77.3810),

    ("Anil Kumar", "anil@example.com", "9820000012", "Pest Control",
     "Termite, Cockroach, Mosquito treatment", "Pest Management Lic.", 5, 4.6, 164,
     "verified", "Sector 12, Noida", 28.5890, 77.3260),

    ("Rajesh Nair", "rajesh@example.com", "9820000013", "Technician",
     "Geyser, Mixer, Microwave, Chimney", "Multi-skill Technician", 11, 4.8, 356,
     "verified", "Sector 61, Noida", 28.6200, 77.3620),

    # These four cover the last services that had no verified partner at all.
    #
    # WHY they matter: a booking is only created once a verified partner can take
    # it. Without these, four of the twenty services in the catalogue could not
    # be booked, which is a dead end to walk into while presenting.
    ("Irfan Khan", "irfan@example.com", "9820000017", "TV Installation",
     "Wall mounting, Set-top box, Channel tuning", "Electronics Install Cert.", 5, 4.6, 132,
     "verified", "Sector 27, Noida", 28.5820, 77.3230),

    ("Pooja Bisht", "pooja@example.com", "9820000018", "Appliance Repair",
     "Mixer, Geyser, Microwave, Induction", "Small Appliance Repair", 4, 4.4, 96,
     "verified", "Sector 55, Noida", 28.5910, 77.3590),

    ("Shyam Lal", "shyam@example.com", "9820000019", "Construction Labour",
     "Masonry, Plastering, Site helper", "Skilled Mason", 12, 4.5, 268,
     "verified", "Sector 71, Noida", 28.5960, 77.3800),

    ("Ritu Chauhan", "ritu@example.com", "9820000020", "Pet Grooming",
     "Bathing, Trimming, Nail care, De-shedding", "Pet Care Basics", 3, 4.7, 74,
     "verified", "Sector 29, Noida", 28.5700, 77.3260),

    # Waiting for the admin to review — shows the yellow "Pending" badge.
    # Booking their trade is refused until the admin verifies them, which is the
    # point: verifying Farhan live during a demo makes Barber bookable.
    ("Farhan Ali", "farhan@example.com", "9820000014", "Barber",
     "Haircut, Beard styling, Head massage", "Grooming Course", 6, 0.0, 0,
     "pending", "Sector 22, Noida", 28.5810, 77.3320),

    ("Geeta Rani", "geeta@example.com", "9820000015", "Gardener",
     "Lawn care, Pruning, Terrace garden setup", "Horticulture Basics", 3, 0.0, 0,
     "pending", "Sector 44, Noida", 28.5620, 77.3480),

    # Rejected — shows the red badge and explains why verification matters.
    ("Mohit Saini", "mohit@example.com", "9820000016", "Car Washing",
     "Exterior wash, Interior vacuum", "", 1, 0.0, 0,
     "rejected", "Sector 37, Noida", 28.5580, 77.3300),
]


def seed():
    """Wipe the database and insert all demo data."""
    with app.app_context():
        print("Clearing old data...")
        db.drop_all()
        db.create_all()

        # --- Services ------------------------------------------------------
        for name, category, description, price, icon in SERVICES:
            db.session.add(
                Service(
                    name=name,
                    category=category,
                    description=description,
                    starting_price=price,
                    icon=icon,
                )
            )
        print(f"Added {len(SERVICES)} services")

        # --- Admin ---------------------------------------------------------
        db.session.add(
            User(
                name="NEED Admin",
                email="admin@need.in",
                phone="9800000000",
                password_hash=generate_password_hash("admin123"),
                role="admin",
                address="Cooperative Federation Office, Noida",
                gender="other",
                language="en",
                accepted_terms=True,
            )
        )
        print("Added 1 admin")

        # --- Customers -----------------------------------------------------
        for name, email, phone, address, gender, lat, lng in CUSTOMERS:
            db.session.add(
                User(
                    name=name,
                    email=email,
                    phone=phone,
                    password_hash=generate_password_hash(DEMO_PASSWORD),
                    role="customer",
                    address=address,
                    gender=gender,
                    language="en",
                    latitude=lat,
                    longitude=lng,
                    accepted_terms=True,
                )
            )
        print(f"Added {len(CUSTOMERS)} customers")

        # We need the customer/admin rows saved before adding workers, because
        # WorkerProfile stores a user_id that must already exist.
        db.session.commit()

        # --- Workers -------------------------------------------------------
        for (
            name, email, phone, service, skills, certification, years,
            rating, jobs, status, city, lat, lng,
        ) in WORKERS:
            user = User(
                name=name,
                email=email,
                phone=phone,
                password_hash=generate_password_hash(DEMO_PASSWORD),
                role="worker",
                address=city,
                gender="female" if name.split()[0] in
                ("Neha", "Priya", "Sunita", "Kavita", "Geeta") else "male",
                language="hi",
                latitude=lat,
                longitude=lng,
                accepted_terms=True,
            )
            db.session.add(user)
            db.session.flush()  # gives `user.id` a value without a full commit

            db.session.add(
                WorkerProfile(
                    user_id=user.id,
                    skills=skills,
                    certifications=certification,
                    experience_years=years,
                    verification_status=status,
                    identity_proof="aadhaar_demo.jpg",
                    rating=rating,
                    total_jobs=jobs,
                    # Rough demo earnings so the worker dashboard is not empty.
                    earnings=round(jobs * 380.0, 2),
                    service_radius_km=10,
                    is_available=status == "verified",
                    primary_service=service,
                    city=city,
                )
            )

            # Welfare wallet: 10% of earnings has been set aside over time,
            # split the same way a live job splits it.
            #
            # WHY the shares are imported rather than typed in: the seeded rows
            # used a 0.55 liquid share while the app credits 0.70. The admin
            # dashboard shows lifetime welfare, liquid reserve and insurance
            # reserve side by side, so the second and third cards added up to
            # 15% less than the first with nothing on screen to explain the gap.
            contribution = round(jobs * 380.0 * WELFARE_RATE, 2)
            db.session.add(
                WelfareWallet(
                    worker_id=user.id,
                    balance=round(contribution * WALLET_LIQUID_SHARE, 2),
                    total_contribution=contribution,
                    insurance_contribution=round(contribution * WALLET_INSURANCE_SHARE, 2),
                )
            )

        db.session.commit()
        print(f"Added {len(WORKERS)} workers with welfare wallets")

        print("\nDone. Demo login details:")
        print("  Admin    : admin@need.in / admin123")
        print(f"  Customer : ananya@example.com / {DEMO_PASSWORD}")
        print(f"  Worker   : rahul@example.com / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()
