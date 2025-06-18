from rest_framework import serializers
from .models import Room, Guest, Booking
from decimal import Decimal

class RoomSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    rating = serializers.DecimalField(max_digits=3, decimal_places=1, coerce_to_string=False)

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'price', 'is_occupied', 'rating']

    def validate_room_number(self, value):
        """
        Check that the room number is unique.
        """
        if Room.objects.filter(room_number=value).exists():
            raise serializers.ValidationError("A room with this number already exists.")
        return value

    def validate_price(self, value):
        """
        Check that the price is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_rating(self, value):
        """
        Check that the rating is between 0 and 5.
        """
        if value < 0 or value > 5:
            raise serializers.ValidationError("Rating must be between 0 and 5.")
        return value

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'name', 'email', 'phone']

    def validate_email(self, value):
        """
        Check that the email is unique.
        """
        if Guest.objects.filter(email=value).exists():
            raise serializers.ValidationError("A guest with this email already exists.")
        return value

    def validate_phone(self, value):
        """
        Check that the phone number is unique.
        """
        if Guest.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A guest with this phone number already exists.")
        return value

class BookingSerializer(serializers.ModelSerializer):
    # For reading (nested objects)
    room_detail = RoomSerializer(source='room', read_only=True)
    guest_detail = GuestSerializer(source='guest', read_only=True)
    
    # For writing (IDs)
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())
    guest = serializers.PrimaryKeyRelatedField(queryset=Guest.objects.all())
    
    # Additional fields for display
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    guest_name = serializers.CharField(source='guest.name', read_only=True)
    
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Booking
        fields = [
            'id', 'room', 'guest', 'room_detail', 'guest_detail', 
            'room_number', 'guest_name', 'check_in_date', 'check_out_date', 'total_price'
        ]

    def validate(self, data):
        """
        Check that check_out_date is after check_in_date.
        """
        if data['check_out_date'] <= data['check_in_date']:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
        return data

    def create(self, validated_data):
        # Mark room as occupied when booking is created
        room = validated_data['room']
        room.is_occupied = True
        room.save()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle room occupancy changes
        old_room = instance.room
        new_room = validated_data.get('room', old_room)
        
        # Update old room occupancy if room changed
        if old_room != new_room:
            old_room.is_occupied = False
            old_room.save()
            new_room.is_occupied = True
            new_room.save()
        
        return super().update(instance, validated_data) 