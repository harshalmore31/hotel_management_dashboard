from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from hotel.models import Room, Guest, Booking

class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database with sample data...')
        
        # Clear existing data
        Booking.objects.all().delete()
        Room.objects.all().delete()
        Guest.objects.all().delete()
        
        # Create sample rooms
        rooms_data = [
            {'room_number': '101', 'room_type': 'King', 'price': 150.00, 'is_occupied': False, 'rating': 4.5},
            {'room_number': '102', 'room_type': 'Queen', 'price': 120.00, 'is_occupied': False, 'rating': 4.2},
            {'room_number': '103', 'room_type': 'Royal', 'price': 200.00, 'is_occupied': False, 'rating': 4.8},
            {'room_number': '201', 'room_type': 'King', 'price': 150.00, 'is_occupied': False, 'rating': 4.3},
            {'room_number': '202', 'room_type': 'Queen', 'price': 120.00, 'is_occupied': False, 'rating': 4.0},
        ]
        
        rooms = []
        for room_data in rooms_data:
            room = Room.objects.create(**room_data)
            rooms.append(room)
            self.stdout.write(f'Created room: {room}')
        
        # Create sample guests
        guests_data = [
            {'name': 'John Doe', 'email': 'john@example.com', 'phone': '+1234567890'},
            {'name': 'Jane Smith', 'email': 'jane@example.com', 'phone': '+1234567891'},
            {'name': 'Bob Johnson', 'email': 'bob@example.com', 'phone': '+1234567892'},
            {'name': 'Alice Brown', 'email': 'alice@example.com', 'phone': '+1234567893'},
        ]
        
        guests = []
        for guest_data in guests_data:
            guest = Guest.objects.create(**guest_data)
            guests.append(guest)
            self.stdout.write(f'Created guest: {guest}')
        
        # Create sample bookings
        today = date.today()
        bookings_data = [
            {
                'room': rooms[0],
                'guest': guests[0],
                'check_in_date': today,
                'check_out_date': today + timedelta(days=3),
                'total_price': 450.00
            },
            {
                'room': rooms[1],
                'guest': guests[1],
                'check_in_date': today - timedelta(days=1),
                'check_out_date': today + timedelta(days=2),
                'total_price': 360.00
            },
            {
                'room': rooms[2],
                'guest': guests[2],
                'check_in_date': today + timedelta(days=1),
                'check_out_date': today + timedelta(days=4),
                'total_price': 600.00
            },
        ]
        
        for booking_data in bookings_data:
            booking = Booking.objects.create(**booking_data)
            self.stdout.write(f'Created booking: {booking}')
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
        self.stdout.write(f'Created {len(rooms)} rooms, {len(guests)} guests, and {len(bookings_data)} bookings') 