document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded, fetching data...');
    
    // Check if api object is available
    if (typeof api === 'undefined') {
        console.error('API object not found. Make sure main.js is loaded before dashboard.js');
        return;
    }
    
    // Test if API is accessible
    testAPI();
    
    loadDashboardStats();
    loadRecentBookings();
});

async function testAPI() {
    try {
        console.log('Testing API accessibility...');
        const response = await fetch('/api/dashboard/stats/');
        console.log('API test response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('API test data:', data);
        } else {
            console.error('API test failed with status:', response.status);
        }
    } catch (error) {
        console.error('API test error:', error);
    }
}

async function loadDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');
        const stats = await api.get('/dashboard/stats');
        console.log('Dashboard stats received:', stats);
        updateDashboardCards(stats);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            console.error('Utils not available for error handling');
        }
    }
}

function updateDashboardCards(stats) {
    console.log('Updating dashboard cards with:', stats);
    
    // Update occupancy card
    const occupancyElement = document.getElementById('occupancy-value');
    if (occupancyElement) {
        occupancyElement.textContent = `${stats.occupancy_rate}%`;
    } else {
        console.error('Occupancy element not found');
    }
    
    const totalRoomsElement = document.getElementById('total-rooms');
    if (totalRoomsElement) {
        totalRoomsElement.textContent = stats.total_rooms;
    } else {
        console.error('Total rooms element not found');
    }
    
    const occupiedRoomsElement = document.getElementById('occupied-rooms');
    if (occupiedRoomsElement) {
        occupiedRoomsElement.textContent = stats.occupied_rooms;
    } else {
        console.error('Occupied rooms element not found');
    }

    // Update average price card
    const avgPriceElement = document.getElementById('avg-price');
    if (avgPriceElement) {
        if (typeof utils !== 'undefined') {
            avgPriceElement.textContent = utils.formatCurrency(stats.avg_price);
        } else {
            avgPriceElement.textContent = `$${stats.avg_price}`;
        }
    } else {
        console.error('Average price element not found');
    }

    // Update bookings card
    const todaysBookingsElement = document.getElementById('todays-bookings');
    if (todaysBookingsElement) {
        todaysBookingsElement.textContent = stats.todays_bookings;
    } else {
        console.error('Today\'s bookings element not found');
    }

    // Update room types card
    const roomTypesElement = document.getElementById('room-types-count');
    if (roomTypesElement) {
        const roomTypesCount = stats.room_types.length;
        roomTypesElement.textContent = `${roomTypesCount} Types`;
    } else {
        console.error('Room types element not found');
    }
}

async function loadRecentBookings() {
    try {
        console.log('Fetching recent bookings...');
        const stats = await api.get('/dashboard/stats');
        console.log('Recent bookings data:', stats.recent_bookings);
        updateRecentBookingsTable(stats.recent_bookings);
    } catch (error) {
        console.error('Error loading recent bookings:', error);
        if (typeof utils !== 'undefined') {
            utils.handleError(error);
        } else {
            console.error('Utils not available for error handling');
        }
    }
}

function updateRecentBookingsTable(bookings) {
    console.log('Updating recent bookings table with:', bookings);
    const tbody = document.querySelector('#recent-bookings tbody');
    if (!tbody) {
        console.error('Recent bookings table body not found');
        return;
    }
    
    tbody.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent bookings</td></tr>';
        return;
    }

    bookings.forEach(booking => {
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
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.room.room_number}</td>
            <td>${booking.guest.name}</td>
            <td>${checkInDate}</td>
            <td>${checkOutDate}</td>
            <td>${totalPrice}</td>
        `;
        tbody.appendChild(row);
    });
}

// Refresh dashboard data every 5 minutes
setInterval(() => {
    loadDashboardStats();
    loadRecentBookings();
}, 5 * 60 * 1000); 