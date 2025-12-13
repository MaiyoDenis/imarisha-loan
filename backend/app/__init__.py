from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import Config

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
    bcrypt.init_app(app)

    from app.routes import auth, branches, groups, members, loans, products, transactions, dashboard
    app.register_blueprint(auth.bp)
    app.register_blueprint(branches.bp)
    app.register_blueprint(groups.bp)
    app.register_blueprint(members.bp)
    app.register_blueprint(loans.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(dashboard.bp)

    return app
