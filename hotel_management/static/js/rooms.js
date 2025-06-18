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

// Load rooms when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing rooms page...');
    
    // Check if api object is available
    if (typeof api === 'undefined') {
        console.error('API object not found. Make sure main.js is loaded before rooms.js');
        return;
    }
    
    loadRooms();
    
    // Add event listeners for forms
    const addRoomForm = document.getElementById('addRoomForm');
    const editRoomForm = document.getElementById('editRoomForm');
    
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addRoom();
        });
    }
    
    if (editRoomForm) {
        editRoomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateRoom();
        });
    }
});

// Function to load rooms
async function loadRooms() {
    console.log('Fetching rooms from API...');
    try {
        const rooms = await api.get('/rooms/');
        console.log('Received rooms data:', rooms);
        displayRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load rooms. Please try again later.');
        }
    }
}

// Function to display rooms in the table
function displayRooms(rooms) {
    console.log('Displaying rooms in table...');
    const tbody = document.querySelector('#roomsTable tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(rooms)) {
        console.error('Rooms data is not an array:', rooms);
        return;
    }
    
    if (rooms.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="bi bi-house"></i>
                        <h3>No rooms found</h3>
                        <p>Add your first room to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`Rendering ${rooms.length} rooms`);
    rooms.forEach(room => {
        console.log('Rendering room:', room);
        const row = document.createElement('tr');
        
        // Format price
        let price = room.price;
        if (typeof utils !== 'undefined') {
            price = utils.formatCurrency(room.price);
        }
        
        // Status badge
        const statusClass = room.is_occupied ? 'status-occupied' : 'status-available';
        const statusText = room.is_occupied ? 'Occupied' : 'Available';
        
        row.innerHTML = `
            <td><strong>${room.room_number || ''}</strong></td>
            <td>${room.room_type || ''}</td>
            <td><strong>${price}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${room.rating || '0.0'} ⭐</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary" onclick="editRoom(${room.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new room
async function addRoom() {
    const form = document.getElementById('addRoomForm');
    if (!form) {
        console.error('Add room form not found');
        return;
    }
    
    const formData = new FormData(form);
    const roomData = {
        room_number: formData.get('room_number'),
        room_type: formData.get('room_type'),
        price: parseFloat(formData.get('price')),
        is_occupied: false,
        rating: 0.0
    };

    // Validate required fields
    if (!roomData.room_number || !roomData.room_type || !roomData.price) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate price
    if (roomData.price <= 0) {
        alert('Price must be greater than zero.');
        return;
    }

    try {
        console.log('Adding new room:', roomData);
        const response = await api.post('/rooms/', roomData);
        console.log('Room created successfully:', response);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
        if (modal) {
            modal.hide();
        }
        form.reset();

        // Reload rooms
        loadRooms();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Room added successfully!');
        } else {
            alert('Room added successfully!');
        }
    } catch (error) {
        console.error('Error adding room:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to add room. Please try again.');
        }
    }
}

// Function to edit a room
async function editRoom(roomId) {
    try {
        const room = await api.get(`/rooms/${roomId}/`);

        // Populate the edit form
        const editRoomId = document.getElementById('edit_room_id');
        const editRoomNumber = document.getElementById('edit_room_number');
        const editRoomType = document.getElementById('edit_room_type');
        const editPrice = document.getElementById('edit_price');
        const editIsOccupied = document.getElementById('edit_is_occupied');
        const editRating = document.getElementById('edit_rating');
        
        if (editRoomId) editRoomId.value = room.id;
        if (editRoomNumber) editRoomNumber.value = room.room_number;
        if (editRoomType) editRoomType.value = room.room_type;
        if (editPrice) editPrice.value = room.price;
        if (editIsOccupied) editIsOccupied.value = room.is_occupied;
        if (editRating) editRating.value = room.rating;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editRoomModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading room details:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load room details. Please try again.');
        }
    }
}

// Function to update a room
async function updateRoom() {
    const form = document.getElementById('editRoomForm');
    if (!form) {
        console.error('Edit room form not found');
        return;
    }
    
    const formData = new FormData(form);
    const roomId = formData.get('edit_room_id');
    
    const roomData = {
        room_number: formData.get('edit_room_number'),
        room_type: formData.get('edit_room_type'),
        price: parseFloat(formData.get('edit_price')),
        is_occupied: formData.get('edit_is_occupied') === 'true',
        rating: parseFloat(formData.get('edit_rating'))
    };

    // Validate required fields
    if (!roomData.room_number || !roomData.room_type || !roomData.price) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate price
    if (roomData.price <= 0) {
        alert('Price must be greater than zero.');
        return;
    }

    // Validate rating
    if (roomData.rating < 0 || roomData.rating > 5) {
        alert('Rating must be between 0 and 5.');
        return;
    }

    try {
        console.log('Updating room:', roomId, roomData);
        const response = await api.put(`/rooms/${roomId}/`, roomData);
        console.log('Room updated successfully:', response);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoomModal'));
        if (modal) {
            modal.hide();
        }

        // Reload rooms
        loadRooms();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Room updated successfully!');
        } else {
            alert('Room updated successfully!');
        }
    } catch (error) {
        console.error('Error updating room:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to update room. Please try again.');
        }
    }
}

// Function to delete a room
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) {
        return;
    }

    try {
        console.log('Deleting room with ID:', roomId);
        await api.delete(`/rooms/${roomId}/`);
        console.log('Room deleted successfully');

        // Reload rooms
        loadRooms();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Room deleted successfully!');
        } else {
            alert('Room deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to delete room. Please try again.');
        }
    }
} 