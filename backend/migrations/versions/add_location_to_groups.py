"""add location to groups table

Revision ID: 8f1a7a7315b6
Revises: final_cleanup_role_column
Create Date: 2025-12-20 22:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f1a7a7315b6'
down_revision = 'final_cleanup_role_column'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.add_column(sa.Column('location', sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.drop_column('location')
