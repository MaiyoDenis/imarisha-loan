import os
from sqlalchemy import create_engine, text, inspect
from config import Config

def fix_db_state():
    print("Checking database state...")
    
    db_url = Config.SQLALCHEMY_DATABASE_URI
    if not db_url:
        print("No database URL found.")
        return

    try:
        engine = create_engine(db_url)
        inspector = inspect(engine)
        
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")
        
        has_alembic = 'alembic_version' in tables
        has_roles = 'roles' in tables
        
        if has_alembic:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
                row = result.fetchone()
                if row:
                    current_revision = row[0]
                    print(f"Current revision in database: {current_revision}")
                    
                    migration_files = []
                    try:
                        versions_dir = os.path.join(os.path.dirname(__file__), 'migrations', 'versions')
                        if os.path.exists(versions_dir):
                            for file in os.listdir(versions_dir):
                                if file.endswith('.py') and file != '__init__.py':
                                    migration_files.append(file.split('_')[0])
                    except:
                        pass
                    
                    if current_revision not in migration_files:
                        print(f"Revision {current_revision} not found in migration files.")
                        print("Dropping alembic_version to reset migration state...")
                        conn.execute(text("DROP TABLE alembic_version"))
                        conn.commit()
                        print("alembic_version dropped. Migrations will run from scratch.")
                    else:
                        print("Revision found in migration files. Database state is consistent.")
        elif not has_roles:
             print("Database is empty. Migrations should run normally.")
        else:
            print("Database has tables but no alembic_version. This may indicate a problem.")
            
    except Exception as e:
        print(f"Error checking/fixing database state: {e}")

if __name__ == '__main__':
    fix_db_state()
