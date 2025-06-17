from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from datetime import datetime
from .models import Room, Guest, Booking
from .serializers import RoomSerializer, GuestSerializer, BookingSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    def get_queryset(self):
        queryset = Room.objects.all()
        available_only = self.request.query_params.get('available', 'false').lower() == 'true'
        if available_only:
            queryset = queryset.filter(is_occupied=False)
        return queryset.order_by('room_number')

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        guest_id = self.request.query_params.get('guest_id')
        if guest_id:
            queryset = queryset.filter(guest_id=guest_id)
        return queryset.select_related('room', 'guest')

@api_view(['GET'])
def dashboard_stats(request):
    # Get total rooms and occupied rooms
    total_rooms = Room.objects.count()
    occupied_rooms = Room.objects.filter(is_occupied=True).count()
    
    # Calculate occupancy rate
    occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
    
    # Get average room price
    avg_price = Room.objects.aggregate(avg_price=Avg('price'))['avg_price'] or 0
    
    # Get today's bookings
    today = datetime.now().date()
    todays_bookings = Booking.objects.filter(
        Q(check_in_date=today) | Q(check_out_date=today)
    ).count()
    
    # Get room types count
    room_types = Room.objects.values('room_type').annotate(count=Count('room_type'))
    
    # Get recent bookings
    recent_bookings = Booking.objects.select_related('room', 'guest')[:5]
    recent_bookings_data = BookingSerializer(recent_bookings, many=True).data
    
    return Response({
        'occupancy_rate': round(occupancy_rate, 2),
        'total_rooms': total_rooms,
        'occupied_rooms': occupied_rooms,
        'avg_price': round(float(avg_price), 2),
        'todays_bookings': todays_bookings,
        'room_types': room_types,
        'recent_bookings': recent_bookings_data
    }) 