"""חיבור ל-PostgreSQL דרך SQLAlchemy"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/prayers_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency injection ל-FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
