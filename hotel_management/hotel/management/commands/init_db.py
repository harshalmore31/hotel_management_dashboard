from django.core.management.base import BaseCommand
from django.db import connection
from hotel.models import Room, Guest, Booking

class Command(BaseCommand):
    help = 'Initialize the database with required tables'

    def handle(self, *args, **kwargs):
        self.stdout.write('Initializing database...')
        
        # Create tables if they don't exist
        with connection.cursor() as cursor:
            # Create rooms table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hotel_room (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_number VARCHAR(10) UNIQUE NOT NULL,
                    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('King', 'Queen', 'Royal')),
                    price DECIMAL(10, 2) NOT NULL,
                    is_occupied BOOLEAN DEFAULT 0,
                    rating DECIMAL(3, 1) DEFAULT 0.0
                );
            """)
            
            # Create guests table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hotel_guest (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20) NOT NULL
                );
            """)
            
            # Create bookings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hotel_booking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_id INTEGER NOT NULL,
                    guest_id INTEGER NOT NULL,
                    check_in_date DATE NOT NULL,
                    check_out_date DATE NOT NULL,
                    total_price DECIMAL(10, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (room_id) REFERENCES hotel_room(id),
                    FOREIGN KEY (guest_id) REFERENCES hotel_guest(id)
                );
            """)
        
        self.stdout.write(self.style.SUCCESS('Database initialized successfully')) 