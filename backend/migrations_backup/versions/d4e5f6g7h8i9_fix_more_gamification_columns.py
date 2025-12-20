"""Fix more gamification table columns

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2025-12-16 20:26:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4e5f6g7h8i9'
down_revision = 'c3d4e5f6g7h8'
branch_labels = None
depends_on = None


def upgrade():
    # Fix user_achievements - change unlocked_at to awarded_at
    with op.batch_alter_table('user_achievements', schema=None) as batch_op:
        batch_op.add_column(sa.Column('awarded_at', sa.DateTime(), nullable=False, server_default='2025-01-01 00:00:00'))
    
    # Fix leaderboards table - add missing columns
    with op.batch_alter_table('leaderboards', schema=None) as batch_op:
        batch_op.add_column(sa.Column('leaderboard_type', sa.Text(), nullable=False, server_default='global'))
        batch_op.add_column(sa.Column('points', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('period', sa.Text(), nullable=False, server_default='monthly'))
        batch_op.add_column(sa.Column('last_updated', sa.DateTime()))


def downgrade():
    with op.batch_alter_table('leaderboards', schema=None) as batch_op:
        batch_op.drop_column('last_updated')
        batch_op.drop_column('period')
        batch_op.drop_column('points')
        batch_op.drop_column('leaderboard_type')
    
    with op.batch_alter_table('user_achievements', schema=None) as batch_op:
        batch_op.drop_column('awarded_at')
