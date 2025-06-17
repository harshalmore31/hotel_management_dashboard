from rest_framework import serializers
from .models import Room, Guest, Booking
from decimal import Decimal

class RoomSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    rating = serializers.DecimalField(max_digits=3, decimal_places=1, coerce_to_string=False)

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'price', 'is_occupied', 'rating']

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'name', 'email', 'phone']

class BookingSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type', read_only=True)
    guest_name = serializers.CharField(source='guest.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Booking
        fields = ['id', 'room', 'guest', 'room_number', 'room_type', 'guest_name', 
                 'check_in_date', 'check_out_date', 'total_price']
        read_only_fields = ['room_number', 'room_type', 'guest_name'] 