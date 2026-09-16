// Equipment data
const equipment = [
    { name: "3D Printer", image: "assets/2026-01-06_07-41-49.png", available: true },
    { name: "Robot Kits", image: "assets/2026-01-06_07-44-11.png", available: true },
    { name: "CNC Machine", image: "assets/2026-01-06_07-58-33.png", available: true },
    { name: "Drones", image: "assets/2026-01-06_07-43-17.png", available: true }
];

// Slider functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const slider = document.querySelector('.slider');
const dotIndicators = document.querySelectorAll('.dot-indicator');

function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 25}%)`;

    // Update dot indicators
    dotIndicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

// Add click handlers to dot indicators
dotIndicators.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
});

// Auto slide every 5 seconds
setInterval(() => showSlide(currentSlide + 1), 5000);

// Load equipment list
function loadEquipment() {
    const grid = document.querySelector('.equipment-grid');
    grid.innerHTML = '';
    equipment.forEach(item => {
        const div = document.createElement('div');
        div.className = 'equipment-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Status: ${item.available ? 'Available' : 'Booked'}</p>
            <button onclick="bookEquipment('${item.name}')" ${!item.available ? 'disabled' : ''}>Book</button>
        `;
        grid.appendChild(div);
    });
}

// Book equipment (redirect to booking section)
function bookEquipment(name) {
    document.getElementById('equipment-select').value = name;
    document.getElementById('booking').scrollIntoView();
}

// Handle booking form (only if it exists on the page)
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const currentUser = localStorage.getItem('currentUser');
        const equip = document.getElementById('equipment-select').value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;

        // Validate time range
        if (startTime >= endTime) {
            showWarning('End time must be after start time.', 'Invalid Time Range');
            return;
        }

        // Convert time strings to minutes for easier comparison
        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const newStart = timeToMinutes(startTime);
        const newEnd = timeToMinutes(endTime);

        // Check if slot overlaps with existing bookings
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const conflict = bookings.find(b => {
            if (b.equipment === equip && b.date === date) {
                const existingStart = timeToMinutes(b.startTime);
                const existingEnd = timeToMinutes(b.endTime);

                // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
                return (newStart < existingEnd && newEnd > existingStart);
            }
            return false;
        });

        if (conflict) {
            showWarning(`This equipment is already booked from ${conflict.startTime} to ${conflict.endTime}. Please choose a different time range.`, 'Time Slot Conflict');
            return;
        }

        // Save booking with time range
        const booking = {
            user: currentUser,
            equipment: equip,
            date,
            startTime,
            endTime,
            timeRange: `${startTime} - ${endTime}`
        };
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        showSuccess('Your equipment has been booked successfully!', 'Booking Confirmed!');
        loadHistory();
        this.reset();
    });
}

// Load booking history with modern card design
function loadHistory() {
    const currentUser = localStorage.getItem('currentUser');
    const list = document.getElementById('history-list');
    const countElement = document.getElementById('booking-count');

    if (!list) return;

    list.innerHTML = '';
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.user === currentUser);

    // Update booking count
    if (countElement) {
        countElement.textContent = `${userBookings.length} booking${userBookings.length !== 1 ? 's' : ''}`;
    }

    if (userBookings.length === 0) {
        list.innerHTML = `
            <div class="empty-history">
                <div class="empty-history-icon">📅</div>
                <div class="empty-history-text">No bookings yet</div>
                <p style="margin-top: 0.5rem; color: #95a5a6;">Start by booking your first equipment!</p>
            </div>
        `;
    } else {
        // Sort bookings by date (newest first)
        userBookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        userBookings.forEach(b => {
            // Support both old (single time) and new (time range) format
            const timeDisplay = b.timeRange || b.time || `${b.startTime} - ${b.endTime}`;

            // Get equipment icon
            const equipmentIcons = {
                '3D Printer': '🖨️',
                'Robot Kits': '🤖',
                'CNC Machine': '⚙️',
                'Drones': '🚁'
            };
            const icon = equipmentIcons[b.equipment] || '🔧';

            // Format date
            const dateObj = new Date(b.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="history-card-header">
                    <span class="history-card-icon">${icon}</span>
                    <span class="history-card-title">${b.equipment}</span>
                </div>
                <div class="history-card-details">
                    <div class="history-detail">
                        <span class="history-detail-icon">📅</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-icon">🕐</span>
                        <span>${timeDisplay}</span>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }
}

// Get Started buttons
document.querySelectorAll('.get-started').forEach(btn => {
    btn.addEventListener('click', () => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            window.location.href = 'booking.html';
        } else {
            window.location.href = 'login.html';
        }
    });
});