from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from datetime import datetime
from .models import Room, Guest, Booking
from .serializers import RoomSerializer, GuestSerializer, BookingSerializer
import logging

logger = logging.getLogger(__name__)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    def get_queryset(self):
        queryset = Room.objects.all()
        available_only = self.request.query_params.get('available', 'false').lower() == 'true'
        if available_only:
            queryset = queryset.filter(is_occupied=False)
        logger.info(f"Found {queryset.count()} rooms in database")
        return queryset.order_by('room_number')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Serialized {len(serializer.data)} rooms")
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating room with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                room = serializer.save()
                logger.info(f"Created room {room.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Room creation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating room: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Updating room {kwargs.get('pk')} with data: {request.data}")
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if serializer.is_valid():
                room = serializer.save()
                logger.info(f"Updated room {room.id}")
                return Response(serializer.data)
            else:
                logger.error(f"Room update failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating room: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            logger.info(f"Deleted room {kwargs.get('pk')}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting room: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

    def get_queryset(self):
        queryset = Guest.objects.all()
        logger.info(f"Found {queryset.count()} guests in database")
        return queryset.order_by('name')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Serialized {len(serializer.data)} guests")
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating guest with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                guest = serializer.save()
                logger.info(f"Created guest {guest.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Guest creation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating guest: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Updating guest {kwargs.get('pk')} with data: {request.data}")
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if serializer.is_valid():
                guest = serializer.save()
                logger.info(f"Updated guest {guest.id}")
                return Response(serializer.data)
            else:
                logger.error(f"Guest update failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating guest: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            logger.info(f"Deleted guest {kwargs.get('pk')}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting guest: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        guest_id = self.request.query_params.get('guest_id')
        if guest_id:
            queryset = queryset.filter(guest_id=guest_id)
        logger.info(f"Found {queryset.count()} bookings in database")
        return queryset.select_related('room', 'guest')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Serialized {len(serializer.data)} bookings")
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating booking with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                booking = serializer.save()
                logger.info(f"Created booking {booking.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Booking creation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Updating booking {kwargs.get('pk')} with data: {request.data}")
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if serializer.is_valid():
                booking = serializer.save()
                logger.info(f"Updated booking {booking.id}")
                return Response(serializer.data)
            else:
                logger.error(f"Booking update failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating booking: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            room = instance.room
            instance.delete()
            # Mark room as unoccupied when booking is deleted
            room.is_occupied = False
            room.save()
            logger.info(f"Deleted booking {kwargs.get('pk')}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting booking: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def dashboard_stats(request):
    logger.info("Dashboard stats requested")
    
    try:
        # Update room occupancy based on current bookings
        today = datetime.now().date()
        active_bookings = Booking.objects.filter(
            check_in_date__lte=today,
            check_out_date__gte=today
        )
        
        # Mark rooms as occupied if they have active bookings
        for booking in active_bookings:
            if not booking.room.is_occupied:
                booking.room.is_occupied = True
                booking.room.save()
                logger.info(f"Marked room {booking.room.room_number} as occupied")
        
        # Mark rooms as unoccupied if they don't have active bookings
        occupied_rooms = Room.objects.filter(is_occupied=True)
        for room in occupied_rooms:
            has_active_booking = active_bookings.filter(room=room).exists()
            if not has_active_booking:
                room.is_occupied = False
                room.save()
                logger.info(f"Marked room {room.room_number} as unoccupied")
        
        # Get total rooms and occupied rooms
        total_rooms = Room.objects.count()
        occupied_rooms = Room.objects.filter(is_occupied=True).count()
        logger.info(f"Rooms: total={total_rooms}, occupied={occupied_rooms}")
        
        # Calculate occupancy rate
        occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
        
        # Get average room price
        avg_price = Room.objects.aggregate(avg_price=Avg('price'))['avg_price'] or 0
        
        # Get today's bookings
        todays_bookings = Booking.objects.filter(
            Q(check_in_date=today) | Q(check_out_date=today)
        ).count()
        logger.info(f"Today's bookings: {todays_bookings}")
        
        # Get room types count
        room_types = Room.objects.values('room_type').annotate(count=Count('room_type'))
        logger.info(f"Room types: {list(room_types)}")
        
        # Get recent bookings
        recent_bookings = Booking.objects.select_related('room', 'guest')[:5]
        logger.info(f"Recent bookings queryset count: {recent_bookings.count()}")
        
        # Debug each booking
        for booking in recent_bookings:
            logger.info(f"Booking {booking.id}: room={booking.room.room_number}, guest={booking.guest.name}")
        
        recent_bookings_data = BookingSerializer(recent_bookings, many=True).data
        logger.info(f"Serialized bookings data: {recent_bookings_data}")
        
        # Update the response to use the correct field names
        for booking_data in recent_bookings_data:
            # Ensure we have the nested room and guest data for the frontend
            if 'room_detail' in booking_data:
                booking_data['room'] = booking_data['room_detail']
            if 'guest_detail' in booking_data:
                booking_data['guest'] = booking_data['guest_detail']
        
        response_data = {
            'occupancy_rate': round(occupancy_rate, 2),
            'total_rooms': total_rooms,
            'occupied_rooms': occupied_rooms,
            'avg_price': round(float(avg_price), 2),
            'todays_bookings': todays_bookings,
            'room_types': room_types,
            'recent_bookings': recent_bookings_data
        }
        
        logger.info(f"Dashboard stats response: {response_data}")
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in dashboard_stats: {str(e)}")
        return Response({'error': str(e)}, status=500) 