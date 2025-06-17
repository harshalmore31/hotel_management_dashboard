from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Room(models.Model):
    ROOM_TYPES = [
        ('King', 'King'),
        ('Queen', 'Queen'),
        ('Royal', 'Royal'),
    ]
    
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_occupied = models.BooleanField(default=False)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    
    def __str__(self):
        return f"Room {self.room_number} ({self.room_type})"

class Guest(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Booking {self.id} - {self.guest.name} in Room {self.room.room_number}"
    
    class Meta:
        ordering = ['-created_at'] 