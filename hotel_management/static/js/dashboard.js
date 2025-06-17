document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentBookings();
});

async function loadDashboardStats() {
    try {
        const stats = await api.get('/dashboard/stats');
        updateDashboardCards(stats);
    } catch (error) {
        utils.handleError(error);
    }
}

function updateDashboardCards(stats) {
    // Update occupancy card
    document.getElementById('occupancy-value').textContent = `${stats.occupancy_rate}%`;
    document.getElementById('total-rooms').textContent = stats.total_rooms;
    document.getElementById('occupied-rooms').textContent = stats.occupied_rooms;

    // Update average price card
    document.getElementById('avg-price').textContent = utils.formatCurrency(stats.avg_price);

    // Update bookings card
    document.getElementById('todays-bookings').textContent = stats.todays_bookings;

    // Update room types card
    const roomTypesCount = stats.room_types.length;
    document.getElementById('room-types-count').textContent = `${roomTypesCount} Types`;
}

async function loadRecentBookings() {
    try {
        const stats = await api.get('/dashboard/stats');
        updateRecentBookingsTable(stats.recent_bookings);
    } catch (error) {
        utils.handleError(error);
    }
}

function updateRecentBookingsTable(bookings) {
    const tbody = document.querySelector('#recent-bookings tbody');
    tbody.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.room.room_number}</td>
            <td>${booking.guest.name}</td>
            <td>${utils.formatDate(booking.check_in_date)}</td>
            <td>${utils.formatDate(booking.check_out_date)}</td>
            <td>${utils.formatCurrency(booking.total_price)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Refresh dashboard data every 5 minutes
setInterval(() => {
    loadDashboardStats();
    loadRecentBookings();
}, 5 * 60 * 1000); 