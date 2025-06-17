from django.contrib import admin
from .models import Room, Guest, Booking

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'room_type', 'price', 'is_occupied', 'rating')
    list_filter = ('room_type', 'is_occupied')
    search_fields = ('room_number',)

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name', 'email', 'phone')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'guest', 'room', 'check_in_date', 'check_out_date', 'total_price')
    list_filter = ('check_in_date', 'check_out_date')
    search_fields = ('guest__name', 'room__room_number')
    date_hierarchy = 'check_in_date' 