document.addEventListener('DOMContentLoaded', () => {
    loadGuests();
});

async function loadGuests() {
    try {
        const guests = await api.get('/guests/');
        updateGuestsTable(guests);
    } catch (error) {
        utils.handleError(error);
    }
}

function updateGuestsTable(guests) {
    const tbody = document.querySelector('#guests-table tbody');
    tbody.innerHTML = '';

    guests.forEach(guest => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest.name}</td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addGuest() {
    const form = document.getElementById('addGuestForm');
    const formData = formHandler.getFormData(form);

    try {
        await api.post('/guests/', formData);
        utils.showNotification('Guest added successfully');
        bootstrap.Modal.getInstance(document.getElementById('addGuestModal')).hide();
        form.reset();
        loadGuests();
    } catch (error) {
        utils.handleError(error);
    }
}

async function editGuest(guestId) {
    try {
        const guest = await api.get(`/guests/${guestId}/`);
        populateEditForm(guest);
        new bootstrap.Modal(document.getElementById('editGuestModal')).show();
    } catch (error) {
        utils.handleError(error);
    }
}

function populateEditForm(guest) {
    document.getElementById('editGuestId').value = guest.id;
    document.getElementById('editName').value = guest.name;
    document.getElementById('editEmail').value = guest.email;
    document.getElementById('editPhone').value = guest.phone;
}

async function updateGuest() {
    const form = document.getElementById('editGuestForm');
    const formData = formHandler.getFormData(form);
    const guestId = document.getElementById('editGuestId').value;

    try {
        await api.put(`/guests/${guestId}/`, formData);
        utils.showNotification('Guest updated successfully');
        bootstrap.Modal.getInstance(document.getElementById('editGuestModal')).hide();
        loadGuests();
    } catch (error) {
        utils.handleError(error);
    }
}

async function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) {
        return;
    }

    try {
        await api.delete(`/guests/${guestId}/`);
        utils.showNotification('Guest deleted successfully');
        loadGuests();
    } catch (error) {
        utils.handleError(error);
    }
} 