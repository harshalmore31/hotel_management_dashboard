# Hotel Management System

A web-based hotel management application built with Django framework. This project manages hotel operations including room bookings, guest registration, and room administration.

## Technologies Used

- **Backend**: Python 3.12, Django 5.0.1, Django REST Framework
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite
- **Styling**: Bootstrap 5

## Features

- **Dashboard**: Real-time hotel statistics and occupancy rates
- **Room Management**: Add, edit, delete rooms with pricing and status tracking
- **Guest Management**: Register and manage guest information
- **Booking System**: Create and manage room reservations
- **API Endpoints**: RESTful API for all operations

## Quick Setup

1. **Navigate to project directory**
   ```
   cd hotel_management_django/hotel_management
   ```

2. **Create and activate virtual environment**
   ```
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies**
   ```
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```
   python manage.py migrate
   ```

5. **Start server**
   ```
   python manage.py runserver
   ```

6. **Access application**
   ```
   Open browser: http://127.0.0.1:8000
   ```

## Project Structure

```
hotel_management/
├── hotel/                    # Main Django app
│   ├── models.py            # Database models
│   ├── views.py             # API views
│   ├── serializers.py       # Data serialization
│   └── urls.py              # URL routing
├── templates/               # HTML templates
├── static/                  # CSS, JS, images
└── manage.py                # Django management
```

## Database Models

- **Room**: room_number, room_type, price, is_occupied, rating
- **Guest**: name, email, phone
- **Booking**: room, guest, check_in_date, check_out_date, total_price

## API Endpoints

- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET/POST /api/rooms/` - Room management
- `GET/POST /api/guests/` - Guest management
- `GET/POST /api/bookings/` - Booking management

## How to Use

1. **Add Room**: Go to Rooms page → New Room → Fill details → Create
2. **Add Guest**: Go to Guests page → New Guest → Enter info → Create
3. **Create Booking**: Go to Bookings page → New Booking → Select guest/room → Set dates → Create

## Key Features

- Responsive design with Bootstrap 5
- Real-time data updates
- Form validation and error handling
- Automatic room occupancy management
- Dashboard with live statistics

## Testing

All CRUD operations have been tested:
- Create, Read, Update, Delete for all entities
- Form validation and error handling
- API endpoint functionality
- Responsive design on different screens

## Student Information

**Name**: Harshal More, 23108A0054
**Project**: Hotel Management System
**Technology Stack**: Python, Django, HTML, CSS, JavaScript 