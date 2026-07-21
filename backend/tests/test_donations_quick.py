"""
טסטים ל-POST /api/donations/quick.
"""

from app.main import app
from app.middleware.auth import get_current_user
from app.models.models import Donation, Prayer, User


def test_quick_donation_success(client, db_session, monkeypatch):
    user = User(
        firebase_uid="uid-success",
        email="michal@example.com",
        has_saved_card=True,
        stripe_customer_id="cus_test123",
    )
    prayer = Prayer(slug="test-prayer-success")
    db_session.add_all([user, prayer])
    db_session.commit()

    app.dependency_overrides[get_current_user] = lambda: user

    async def fake_charge_saved_card(customer_id, amount, currency):
        return {"payment_intent_id": "pi_fake123", "status": "succeeded"}

    monkeypatch.setattr(
        "app.services.donation_service.stripe_service.charge_saved_card",
        fake_charge_saved_card,
    )

    response = client.post(
        "/api/donations/quick",
        json={
            "prayer_id": str(prayer.id),
            "amount": 7200,
            "currency": "ILS",
            "donor_name": "מיכל",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"status": "success", "amount": 7200}

    donation = db_session.query(Donation).filter(Donation.prayer_id == prayer.id).first()
    assert donation is not None
    assert donation.status == "success"


def test_quick_donation_no_saved_card(client, db_session):
    user = User(firebase_uid="uid-no-card", email="noone@example.com", has_saved_card=False)
    prayer = Prayer(slug="test-prayer-no-card")
    db_session.add_all([user, prayer])
    db_session.commit()

    app.dependency_overrides[get_current_user] = lambda: user

    response = client.post(
        "/api/donations/quick",
        json={
            "prayer_id": str(prayer.id),
            "amount": 7200,
            "currency": "ILS",
            "donor_name": "מיכל",
        },
    )

    assert response.status_code == 400


def test_quick_donation_no_token(client):
    response = client.post(
        "/api/donations/quick",
        json={
            "prayer_id": "00000000-0000-0000-0000-000000000000",
            "amount": 7200,
            "currency": "ILS",
            "donor_name": "מיכל",
        },
    )

    assert response.status_code == 401
