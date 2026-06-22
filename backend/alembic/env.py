"""
Alembic environment — מחבר את ה-migrations ל-Base.metadata של המודלים.
ה-DATABASE_URL נקרא ממשתני סביבה (.env), לא מ-alembic.ini.

הרצה:
    alembic revision --autogenerate -m "create tables"
    alembic upgrade head
"""

import os

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

# רישום כל המודלים ב-metadata (חובה ל-autogenerate)
import app.models.models  # noqa: F401
from alembic import context
from app.database import Base

load_dotenv()

config = context.config
db_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/prayers_db")
config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
