"""Add market_price and selling_price to LoanType

Revision ID: e9f0g1h2i3j4
Revises: 49668258d314
Create Date: 2025-12-20 11:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e9f0g1h2i3j4'
down_revision = '49668258d314'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('loan_types', schema=None) as batch_op:
        batch_op.add_column(sa.Column('market_price', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('selling_price', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0'))


def downgrade():
    with op.batch_alter_table('loan_types', schema=None) as batch_op:
        batch_op.drop_column('selling_price')
        batch_op.drop_column('market_price')
