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
    
    // Check if api object is available
    if (typeof api === 'undefined') {
        console.error('API object not found. Make sure main.js is loaded before bookings.js');
        return;
    }
    
    loadBookings();
    loadRooms();
    loadGuests();
    
    // Add event listeners for forms
    const addBookingForm = document.getElementById('addBookingForm');
    const editBookingForm = document.getElementById('editBookingForm');
    
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addBooking();
        });
    }
    
    if (editBookingForm) {
        editBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBooking();
        });
    }
});

// Function to load bookings
async function loadBookings() {
    console.log('Fetching bookings from API...');
    try {
        const bookings = await api.get('/bookings/');
        console.log('Received bookings data:', bookings);
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load bookings. Please try again later.');
        }
    }
}

// Function to load rooms for dropdown
async function loadRooms() {
    try {
        const rooms = await api.get('/rooms/');
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
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load rooms. Please try again later.');
        }
    }
}

// Function to load guests for dropdown
async function loadGuests() {
    try {
        const guests = await api.get('/guests/');
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
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load guests. Please try again later.');
        }
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
    
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="bi bi-calendar-x"></i>
                        <h3>No bookings found</h3>
                        <p>Create your first booking to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`Rendering ${bookings.length} bookings`);
    bookings.forEach(booking => {
        console.log('Rendering booking:', booking);
        const row = document.createElement('tr');
        
        // Format dates
        let checkInDate = booking.check_in_date;
        let checkOutDate = booking.check_out_date;
        let totalPrice = booking.total_price;
        
        if (typeof utils !== 'undefined') {
            checkInDate = utils.formatDate(booking.check_in_date);
            checkOutDate = utils.formatDate(booking.check_out_date);
            totalPrice = utils.formatCurrency(booking.total_price);
        }
        
        // Get room number and guest name from the new field structure
        const roomNumber = booking.room_number || (booking.room_detail && booking.room_detail.room_number) || '';
        const guestName = booking.guest_name || (booking.guest_detail && booking.guest_detail.name) || '';
        
        row.innerHTML = `
            <td><strong>${roomNumber}</strong></td>
            <td>${guestName}</td>
            <td>${checkInDate}</td>
            <td>${checkOutDate}</td>
            <td><strong>${totalPrice}</strong></td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary" onclick="editBooking(${booking.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBooking(${booking.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new booking
async function addBooking() {
    const form = document.getElementById('addBookingForm');
    if (!form) {
        console.error('Add booking form not found');
        return;
    }
    
    const formData = new FormData(form);
    const bookingData = {
        room: parseInt(formData.get('room')),
        guest: parseInt(formData.get('guest')),
        check_in_date: formData.get('check_in_date'),
        check_out_date: formData.get('check_out_date'),
        total_price: parseFloat(formData.get('total_price'))
    };

    // Validate required fields
    if (!bookingData.room || !bookingData.guest || !bookingData.check_in_date || !bookingData.check_out_date || !bookingData.total_price) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        console.log('Adding new booking:', bookingData);
        const response = await api.post('/bookings/', bookingData);
        console.log('Booking created successfully:', response);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBookingModal'));
        if (modal) {
            modal.hide();
        }
        form.reset();

        // Reload bookings
        loadBookings();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Booking added successfully!');
        } else {
            alert('Booking added successfully!');
        }
    } catch (error) {
        console.error('Error adding booking:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to add booking. Please try again.');
        }
    }
}

// Function to edit a booking
async function editBooking(bookingId) {
    try {
        console.log('Fetching booking details for ID:', bookingId);
        const booking = await api.get(`/bookings/${bookingId}/`);
        console.log('Received booking details:', booking);

        // Populate the edit form
        const editBookingId = document.getElementById('edit_booking_id');
        const editRoom = document.getElementById('edit_room');
        const editGuest = document.getElementById('edit_guest');
        const editCheckInDate = document.getElementById('edit_check_in_date');
        const editCheckOutDate = document.getElementById('edit_check_out_date');
        const editTotalPrice = document.getElementById('edit_total_price');
        
        if (editBookingId) editBookingId.value = booking.id;
        if (editRoom) editRoom.value = booking.room;
        if (editGuest) editGuest.value = booking.guest;
        if (editCheckInDate) editCheckInDate.value = booking.check_in_date;
        if (editCheckOutDate) editCheckOutDate.value = booking.check_out_date;
        if (editTotalPrice) editTotalPrice.value = booking.total_price;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editBookingModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading booking details:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load booking details. Please try again.');
        }
    }
}

// Function to update a booking
async function updateBooking() {
    const form = document.getElementById('editBookingForm');
    if (!form) {
        console.error('Edit booking form not found');
        return;
    }
    
    const formData = new FormData(form);
    const bookingId = formData.get('edit_booking_id');
    
    const bookingData = {
        room: parseInt(formData.get('edit_room')),
        guest: parseInt(formData.get('edit_guest')),
        check_in_date: formData.get('edit_check_in_date'),
        check_out_date: formData.get('edit_check_out_date'),
        total_price: parseFloat(formData.get('edit_total_price'))
    };

    // Validate required fields
    if (!bookingData.room || !bookingData.guest || !bookingData.check_in_date || !bookingData.check_out_date || !bookingData.total_price) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        console.log('Updating booking:', bookingId, bookingData);
        const response = await api.put(`/bookings/${bookingId}/`, bookingData);
        console.log('Booking updated successfully:', response);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'));
        if (modal) {
            modal.hide();
        }

        // Reload bookings
        loadBookings();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Booking updated successfully!');
        } else {
            alert('Booking updated successfully!');
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to update booking. Please try again.');
        }
    }
}

// Function to delete a booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    try {
        console.log('Deleting booking with ID:', bookingId);
        await api.delete(`/bookings/${bookingId}/`);
        console.log('Booking deleted successfully');

        // Reload bookings
        loadBookings();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Booking deleted successfully!');
        } else {
            alert('Booking deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to delete booking. Please try again.');
        }
    }
} 