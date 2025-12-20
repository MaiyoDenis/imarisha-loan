"""Add branch_id to Member table

Revision ID: a1b2c3d4e5f6
Revises: 4550f4b842fc
Create Date: 2025-12-16 20:07:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '4550f4b842fc'
branch_labels = None
depends_on = None


def upgrade():
    # Add branch_id column to members table
    with op.batch_alter_table('members', schema=None) as batch_op:
        batch_op.add_column(sa.Column('branch_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_members_branch_id', 'branches', ['branch_id'], ['id'])


def downgrade():
    # Remove branch_id column from members table
    with op.batch_alter_table('members', schema=None) as batch_op:
        batch_op.drop_constraint('fk_members_branch_id', type_='foreignkey')
        batch_op.drop_column('branch_id')
