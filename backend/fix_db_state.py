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
        has_other_tables = len([t for t in tables if t != 'alembic_version']) > 0
        
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
                        print("This database has tables but incompatible migration history.")
                        
                        if has_other_tables:
                            print("Database has existing data. Will stamp to latest migration to preserve data.")
                            latest_revision = migration_files[-1] if migration_files else None
                            if latest_revision:
                                try:
                                    conn.execute(text(f"UPDATE alembic_version SET version_num = '{latest_revision}'"))
                                    conn.commit()
                                    print(f"Stamped database to revision {latest_revision}")
                                except Exception as e:
                                    print(f"Failed to stamp: {e}")
                        else:
                            print("Dropping alembic_version to reset migration state...")
                            try:
                                conn.execute(text("DROP TABLE alembic_version"))
                                conn.commit()
                                print("alembic_version dropped. Migrations will run from scratch.")
                            except Exception as e:
                                print(f"Failed to drop alembic_version: {e}")
                    else:
                        print("Revision found in migration files. Database state is consistent.")
        elif not has_roles and not has_other_tables:
             print("Database is empty. Migrations should run normally.")
        else:
            print("Database has tables but no alembic_version.")
            if has_other_tables:
                print("Attempting to stamp database with latest migration...")
                migration_files = []
                try:
                    versions_dir = os.path.join(os.path.dirname(__file__), 'migrations', 'versions')
                    if os.path.exists(versions_dir):
                        for file in sorted(os.listdir(versions_dir)):
                            if file.endswith('.py') and file != '__init__.py':
                                migration_files.append(file.split('_')[0])
                except:
                    pass
                
                if migration_files:
                    latest_revision = migration_files[-1]
                    try:
                        with engine.connect() as conn:
                            conn.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{latest_revision}')"))
                            conn.commit()
                            print(f"Created alembic_version table and stamped to {latest_revision}")
                    except Exception as e:
                        print(f"Failed to create alembic_version: {e}")
            
    except Exception as e:
        print(f"Error checking/fixing database state: {e}")

if __name__ == '__main__':
    fix_db_state()
