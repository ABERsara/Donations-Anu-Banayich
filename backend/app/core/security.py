"""
עזרי אבטחה בצד השרת.

הערה: אימות טוקני Firebase מתבצע ב-middleware/auth.py.
כאן ייכנסו עזרים נוספים (אימות חתימת Stripe webhook, hashing, וכו').

TODO (צוות הפרקטיקום): לממש לפי הצורך.
"""

# TODO: לדוגמה — verify_stripe_signature(payload, sig_header) עובר דרך
#       services/stripe_service.construct_webhook_event
