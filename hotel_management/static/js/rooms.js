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
    loadRooms();
    
    // Add event listeners for forms
    document.getElementById('addRoomForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addRoom();
    });
    
    document.getElementById('editRoomForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateRoom();
    });
});

// Function to load rooms
async function loadRooms() {
    console.log('Fetching rooms from API...');
    try {
        const response = await fetch('/api/rooms/');
        console.log('API Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rooms = await response.json();
        console.log('Received rooms data:', rooms);
        displayRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        alert('Failed to load rooms. Please try again later.');
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
    
    console.log(`Rendering ${rooms.length} rooms`);
    rooms.forEach(room => {
        console.log('Rendering room:', room);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.room_number || ''}</td>
            <td>${room.room_type || ''}</td>
            <td>$${room.price || '0.00'}</td>
            <td>${room.is_occupied ? 'Occupied' : 'Available'}</td>
            <td>${room.rating || '0.0'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editRoom(${room.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new room
async function addRoom() {
    const form = document.getElementById('addRoomForm');
    const formData = new FormData(form);
    const roomData = {
        room_number: formData.get('room_number'),
        room_type: formData.get('room_type'),
        price: parseFloat(formData.get('price')),
        is_occupied: false,
        rating: 0.0
    };

    try {
        const response = await fetch('/api/rooms/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
        modal.hide();
        form.reset();

        // Reload rooms
        loadRooms();
    } catch (error) {
        console.error('Error adding room:', error);
        alert('Failed to add room. Please try again.');
    }
}

// Function to edit a room
async function editRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const room = await response.json();

        // Populate the edit form
        document.getElementById('edit_room_id').value = room.id;
        document.getElementById('edit_room_number').value = room.room_number;
        document.getElementById('edit_room_type').value = room.room_type;
        document.getElementById('edit_price').value = room.price;
        document.getElementById('edit_is_occupied').value = room.is_occupied;
        document.getElementById('edit_rating').value = room.rating;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editRoomModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading room details:', error);
        alert('Failed to load room details. Please try again.');
    }
}

// Function to update a room
async function updateRoom() {
    const form = document.getElementById('editRoomForm');
    const formData = new FormData(form);
    const roomId = formData.get('edit_room_id');
    
    const roomData = {
        room_number: formData.get('edit_room_number'),
        room_type: formData.get('edit_room_type'),
        price: parseFloat(formData.get('edit_price')),
        is_occupied: formData.get('edit_is_occupied') === 'true',
        rating: parseFloat(formData.get('edit_rating'))
    };

    try {
        const response = await fetch(`/api/rooms/${roomId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoomModal'));
        modal.hide();
        form.reset();

        // Reload rooms
        loadRooms();
    } catch (error) {
        console.error('Error updating room:', error);
        alert('Failed to update room. Please try again.');
    }
}

// Function to delete a room
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) {
        return;
    }

    try {
        const response = await fetch(`/api/rooms/${roomId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reload rooms
        loadRooms();
    } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room. Please try again.');
    }
} 