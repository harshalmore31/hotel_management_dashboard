// API Base URL
const API_BASE_URL = '/api';

// Common API functions
const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
};

// Utility functions
const utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    showNotification(message, type = 'success') {
        // You can implement a notification system here
        console.log(`${type}: ${message}`);
    },

    handleError(error) {
        console.error('Error:', error);
        this.showNotification(error.message, 'error');
    },
};

// Form handling
const formHandler = {
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    validateForm(form, rules) {
        let isValid = true;
        const errors = {};

        for (const [field, rule] of Object.entries(rules)) {
            const value = form[field]?.value;
            if (rule.required && !value) {
                errors[field] = 'This field is required';
                isValid = false;
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || 'Invalid format';
                isValid = false;
            }
        }

        return { isValid, errors };
    },

    showErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const input = form[field];
            if (input) {
                input.classList.add('is-invalid');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-danger';
                errorDiv.textContent = message;
                input.parentNode.appendChild(errorDiv);
            }
        }
    },
}; 