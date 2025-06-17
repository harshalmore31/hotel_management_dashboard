# Hotel Management System

A Django-based hotel management system that provides functionality for managing rooms, guests, and bookings.

## Features

- Room management (CRUD operations)
- Guest management (CRUD operations)
- Booking management (CRUD operations)
- Dashboard with real-time statistics
- RESTful API endpoints
- Modern and responsive UI

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel_management
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with the following variables:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
```

5. Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (admin):
```bash
python manage.py createsuperuser
```

## Running the Application

1. Start the development server:
```bash
python manage.py runserver
```

2. Access the application:
- Web interface: http://localhost:8000
- Admin interface: http://localhost:8000/admin
- API endpoints: http://localhost:8000/api/

## API Endpoints

- `/api/rooms/` - Room management
- `/api/guests/` - Guest management
- `/api/bookings/` - Booking management
- `/api/dashboard/stats/` - Dashboard statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 