from app import create_app, db
from flask_migrate import init, migrate, upgrade
import subprocess

app = create_app()

with app.app_context():
    # Initialize the migrations directory
    init()
    # Create an initial migration
    migrate(message="Initial migration.")
    # Apply the migration to the database
    upgrade()
    # Seed the database
    subprocess.run(["python", "seed.py"])
