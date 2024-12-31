"""create settings table

Revision ID: 4b5c6d7e8f9g
Revises: 3a4c5d6e7f8g
Create Date: 2023-12-20 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4b5c6d7e8f9g'
down_revision = '3a4c5d6e7f8g'  # This should point to the notifications table migration
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('description', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )
    op.create_index(op.f('ix_settings_key'), 'settings', ['key'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_settings_key'), table_name='settings')
    op.drop_table('settings') 