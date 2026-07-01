# Backend — FastAPI (Python 3.12)
FROM python:3.12-slim

WORKDIR /app

# התקנת תלויות תחילה (cache layer)
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

COPY . .

EXPOSE 8000

# TODO (צוות הפרקטיקום): להריץ "alembic upgrade head" לפני ההפעלה בפרודקשן
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
