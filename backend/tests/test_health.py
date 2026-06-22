"""
בדיקת עשן ל-/health — מוודאת שה-app עולה וה-routers נטענים.
הרצה: pytest  (דורש httpx + pytest — ראה requirements-dev.txt)

TODO (צוות הפרקטיקום): להוסיף בדיקות ל-routers (prayers/donations/users) עם DB בדיקה.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
