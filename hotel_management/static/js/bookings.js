// Get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Load bookings when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing bookings page...');
    loadBookings();
    loadRooms();
    loadGuests();
    
    // Add event listeners for forms
    document.getElementById('addBookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addBooking();
    });
    
    document.getElementById('editBookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateBooking();
    });
});

// Function to load bookings
async function loadBookings() {
    console.log('Fetching bookings from API...');
    try {
        const response = await fetch('/api/bookings/');
        console.log('API Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();
        console.log('Received bookings data:', bookings);
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Failed to load bookings. Please try again later.');
    }
}

// Function to load rooms for dropdown
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rooms = await response.json();
        const roomSelects = document.querySelectorAll('.room-select');
        roomSelects.forEach(select => {
            select.innerHTML = '<option value="">Select a room</option>';
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.room_number} - ${room.room_type} ($${room.price})`;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading rooms:', error);
        alert('Failed to load rooms. Please try again later.');
    }
}

// Function to load guests for dropdown
async function loadGuests() {
    try {
        const response = await fetch('/api/guests/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const guests = await response.json();
        const guestSelects = document.querySelectorAll('.guest-select');
        guestSelects.forEach(select => {
            select.innerHTML = '<option value="">Select a guest</option>';
            guests.forEach(guest => {
                const option = document.createElement('option');
                option.value = guest.id;
                option.textContent = `${guest.name} (${guest.email})`;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading guests:', error);
        alert('Failed to load guests. Please try again later.');
    }
}

// Function to display bookings in the table
function displayBookings(bookings) {
    console.log('Displaying bookings in table...');
    const tbody = document.querySelector('#bookingsTable tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(bookings)) {
        console.error('Bookings data is not an array:', bookings);
        return;
    }
    
    console.log(`Rendering ${bookings.length} bookings`);
    bookings.forEach(booking => {
        console.log('Rendering booking:', booking);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.room_number || ''}</td>
            <td>${booking.guest_name || ''}</td>
            <td>${booking.check_in_date || ''}</td>
            <td>${booking.check_out_date || ''}</td>
            <td>$${booking.total_price || '0.00'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBooking(${booking.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBooking(${booking.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new booking
async function addBooking() {
    const form = document.getElementById('addBookingForm');
    const formData = new FormData(form);
    const bookingData = {
        room: formData.get('room'),
        guest: formData.get('guest'),
        check_in_date: formData.get('check_in_date'),
        check_out_date: formData.get('check_out_date')
    };

    try {
        console.log('Adding new booking:', bookingData);
        const response = await fetch('/api/bookings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBookingModal'));
        modal.hide();
        form.reset();

        // Reload bookings
        loadBookings();
    } catch (error) {
        console.error('Error adding booking:', error);
        alert('Failed to add booking. Please try again.');
    }
}

// Function to edit a booking
async function editBooking(bookingId) {
    try {
        console.log('Fetching booking details for ID:', bookingId);
        const response = await fetch(`/api/bookings/${bookingId}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const booking = await response.json();
        console.log('Received booking details:', booking);

        // Populate the edit form
        document.getElementById('edit_booking_id').value = booking.id;
        document.getElementById('edit_room').value = booking.room;
        document.getElementById('edit_guest').value = booking.guest;
        document.getElementById('edit_check_in_date').value = booking.check_in_date;
        document.getElementById('edit_check_out_date').value = booking.check_out_date;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editBookingModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading booking details:', error);
        alert('Failed to load booking details. Please try again.');
    }
}

// Function to update a booking
async function updateBooking() {
    const form = document.getElementById('editBookingForm');
    const formData = new FormData(form);
    const bookingId = formData.get('edit_booking_id');
    
    const bookingData = {
        room: formData.get('edit_room'),
        guest: formData.get('edit_guest'),
        check_in_date: formData.get('edit_check_in_date'),
        check_out_date: formData.get('edit_check_out_date')
    };

    try {
        console.log('Updating booking:', bookingData);
        const response = await fetch(`/api/bookings/${bookingId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'));
        modal.hide();
        form.reset();

        // Reload bookings
        loadBookings();
    } catch (error) {
        console.error('Error updating booking:', error);
        alert('Failed to update booking. Please try again.');
    }
}

// Function to delete a booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    try {
        console.log('Deleting booking with ID:', bookingId);
        const response = await fetch(`/api/bookings/${bookingId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reload bookings
        loadBookings();
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
    }
} 