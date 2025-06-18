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
    
    // Check if api object is available
    if (typeof api === 'undefined') {
        console.error('API object not found. Make sure main.js is loaded before guests.js');
        return;
    }
    
    loadGuests();
    
    // Add event listeners for forms
    const addGuestForm = document.getElementById('addGuestForm');
    const editGuestForm = document.getElementById('editGuestForm');
    
    if (addGuestForm) {
        addGuestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addGuest();
        });
    }
    
    if (editGuestForm) {
        editGuestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateGuest();
        });
    }
});

// Function to load guests
async function loadGuests() {
    console.log('Fetching guests from API...');
    try {
        const guests = await api.get('/guests/');
        console.log('Received guests data:', guests);
        displayGuests(guests);
    } catch (error) {
        console.error('Error loading guests:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load guests. Please try again later.');
        }
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
    
    if (guests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="empty-state">
                        <i class="bi bi-people"></i>
                        <h3>No guests found</h3>
                        <p>Add your first guest to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`Rendering ${guests.length} guests`);
    guests.forEach(guest => {
        console.log('Rendering guest:', guest);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${guest.name || ''}</strong></td>
            <td>${guest.email || ''}</td>
            <td>${guest.phone || ''}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to add a new guest
async function addGuest() {
    const form = document.getElementById('addGuestForm');
    if (!form) {
        console.error('Add guest form not found');
        return;
    }
    
    const formData = new FormData(form);
    const guestData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    // Validate required fields
    if (!guestData.name || !guestData.email || !guestData.phone) {
        alert('Please fill in all required fields.');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        console.log('Adding new guest:', guestData);
        const response = await api.post('/guests/', guestData);
        console.log('Guest created successfully:', response);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGuestModal'));
        if (modal) {
            modal.hide();
        }
        form.reset();

        // Reload guests
        loadGuests();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Guest added successfully!');
        } else {
            alert('Guest added successfully!');
        }
    } catch (error) {
        console.error('Error adding guest:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to add guest. Please try again.');
        }
    }
}

// Function to edit a guest
async function editGuest(guestId) {
    try {
        console.log('Fetching guest details for ID:', guestId);
        const guest = await api.get(`/guests/${guestId}/`);
        console.log('Received guest details:', guest);

        // Populate the edit form
        const editGuestId = document.getElementById('edit_guest_id');
        const editName = document.getElementById('edit_name');
        const editEmail = document.getElementById('edit_email');
        const editPhone = document.getElementById('edit_phone');
        
        if (editGuestId) editGuestId.value = guest.id;
        if (editName) editName.value = guest.name;
        if (editEmail) editEmail.value = guest.email;
        if (editPhone) editPhone.value = guest.phone;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editGuestModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading guest details:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to load guest details. Please try again.');
        }
    }
}

// Function to update a guest
async function updateGuest() {
    const form = document.getElementById('editGuestForm');
    if (!form) {
        console.error('Edit guest form not found');
        return;
    }
    
    const formData = new FormData(form);
    const guestId = formData.get('edit_guest_id');
    
    const guestData = {
        name: formData.get('edit_name'),
        email: formData.get('edit_email'),
        phone: formData.get('edit_phone')
    };

    // Validate required fields
    if (!guestData.name || !guestData.email || !guestData.phone) {
        alert('Please fill in all required fields.');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        console.log('Updating guest:', guestId, guestData);
        const response = await api.put(`/guests/${guestId}/`, guestData);
        console.log('Guest updated successfully:', response);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGuestModal'));
        if (modal) {
            modal.hide();
        }

        // Reload guests
        loadGuests();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Guest updated successfully!');
        } else {
            alert('Guest updated successfully!');
        }
    } catch (error) {
        console.error('Error updating guest:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to update guest. Please try again.');
        }
    }
}

// Function to delete a guest
async function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) {
        return;
    }

    try {
        console.log('Deleting guest with ID:', guestId);
        await api.delete(`/guests/${guestId}/`);
        console.log('Guest deleted successfully');

        // Reload guests
        loadGuests();
        
        if (typeof utils !== 'undefined') {
            utils.showNotification('Guest deleted successfully!');
        } else {
            alert('Guest deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting guest:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            alert('Failed to delete guest. Please try again.');
        }
    }
} 