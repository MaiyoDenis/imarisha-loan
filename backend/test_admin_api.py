from app import create_app
from app.services.admin_dashboard_service import admin_dashboard_service
import json

app = create_app()
with app.app_context():
    data = admin_dashboard_service.get_admin_dashboard(None)
    print(json.dumps(data, indent=2))
