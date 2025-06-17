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

// Load guests when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing guests page...');
    loadGuests();
    
    // Add event listeners for forms
    document.getElementById('addGuestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addGuest();
    });
    
    document.getElementById('editGuestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateGuest();
    });
});

// Function to load guests
async function loadGuests() {
    console.log('Fetching guests from API...');
    try {
        const response = await fetch('/api/guests/');
        console.log('API Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const guests = await response.json();
        console.log('Received guests data:', guests);
        displayGuests(guests);
    } catch (error) {
        console.error('Error loading guests:', error);
        alert('Failed to load guests. Please try again later.');
    }
}

// Function to display guests in the table
function displayGuests(guests) {
    console.log('Displaying guests in table...');
    const tbody = document.querySelector('#guestsTable tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(guests)) {
        console.error('Guests data is not an array:', guests);
        return;
    }
    
    console.log(`Rendering ${guests.length} guests`);
    guests.forEach(guest => {
        console.log('Rendering guest:', guest);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest.name || ''}</td>
            <td>${guest.email || ''}</td>
            <td>${guest.phone || ''}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new guest
async function addGuest() {
    const form = document.getElementById('addGuestForm');
    const formData = new FormData(form);
    const guestData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    try {
        console.log('Adding new guest:', guestData);
        const response = await fetch('/api/guests/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(guestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGuestModal'));
        modal.hide();
        form.reset();

        // Reload guests
        loadGuests();
    } catch (error) {
        console.error('Error adding guest:', error);
        alert('Failed to add guest. Please try again.');
    }
}

// Function to edit a guest
async function editGuest(guestId) {
    try {
        console.log('Fetching guest details for ID:', guestId);
        const response = await fetch(`/api/guests/${guestId}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const guest = await response.json();
        console.log('Received guest details:', guest);

        // Populate the edit form
        document.getElementById('edit_guest_id').value = guest.id;
        document.getElementById('edit_name').value = guest.name;
        document.getElementById('edit_email').value = guest.email;
        document.getElementById('edit_phone').value = guest.phone;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editGuestModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading guest details:', error);
        alert('Failed to load guest details. Please try again.');
    }
}

// Function to update a guest
async function updateGuest() {
    const form = document.getElementById('editGuestForm');
    const formData = new FormData(form);
    const guestId = formData.get('edit_guest_id');
    
    const guestData = {
        name: formData.get('edit_name'),
        email: formData.get('edit_email'),
        phone: formData.get('edit_phone')
    };

    try {
        console.log('Updating guest:', guestData);
        const response = await fetch(`/api/guests/${guestId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(guestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGuestModal'));
        modal.hide();
        form.reset();

        // Reload guests
        loadGuests();
    } catch (error) {
        console.error('Error updating guest:', error);
        alert('Failed to update guest. Please try again.');
    }
}

// Function to delete a guest
async function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) {
        return;
    }

    try {
        console.log('Deleting guest with ID:', guestId);
        const response = await fetch(`/api/guests/${guestId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reload guests
        loadGuests();
    } catch (error) {
        console.error('Error deleting guest:', error);
        alert('Failed to delete guest. Please try again.');
    }
} 