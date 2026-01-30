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

// Load booking history
function loadHistory() {
    const currentUser = localStorage.getItem('currentUser');
    const list = document.getElementById('history-list');
    if (!list) return;

    list.innerHTML = '';
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.user === currentUser);
    if (userBookings.length === 0) {
        list.innerHTML = '<li>No bookings yet.</li>';
    } else {
        userBookings.forEach(b => {
            const li = document.createElement('li');
            // Support both old (single time) and new (time range) format
            const timeDisplay = b.timeRange || b.time || `${b.startTime} - ${b.endTime}`;
            li.textContent = `${b.equipment} on ${b.date} at ${timeDisplay}`;
            list.appendChild(li);
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