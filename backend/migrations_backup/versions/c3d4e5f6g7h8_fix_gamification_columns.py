"""Fix gamification table columns

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2025-12-16 20:23:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6g7h8'
down_revision = 'b2c3d4e5f6g7'
branch_labels = None
depends_on = None


def upgrade():
    # Drop and recreate user_points table with correct schema
    with op.batch_alter_table('user_points', schema=None) as batch_op:
        batch_op.drop_column('points')
        batch_op.drop_column('level')
        batch_op.add_column(sa.Column('total_points', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('lifetime_points', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('points_tier', sa.Text(), nullable=False, server_default='bronze'))
    
    # Fix challenges table
    with op.batch_alter_table('challenges', schema=None) as batch_op:
        batch_op.drop_column('objective')
        batch_op.drop_column('target')
        batch_op.add_column(sa.Column('challenge_type', sa.Text(), nullable=False, server_default='milestone'))
        batch_op.add_column(sa.Column('target_value', sa.Numeric(12, 2), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('current_value', sa.Numeric(12, 2), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade():
    with op.batch_alter_table('challenges', schema=None) as batch_op:
        batch_op.drop_column('is_active')
        batch_op.drop_column('current_value')
        batch_op.drop_column('target_value')
        batch_op.drop_column('challenge_type')
        batch_op.add_column(sa.Column('target', sa.Integer()))
        batch_op.add_column(sa.Column('objective', sa.Text()))
    
    with op.batch_alter_table('user_points', schema=None) as batch_op:
        batch_op.drop_column('points_tier')
        batch_op.drop_column('lifetime_points')
        batch_op.drop_column('total_points')
        batch_op.add_column(sa.Column('level', sa.Integer(), nullable=False, server_default='1'))
        batch_op.add_column(sa.Column('points', sa.Integer(), nullable=False, server_default='0'))
