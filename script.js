class Service {
    constructor(id, name, duration, price) {
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.price = price;
    }
}

class Booking {
    constructor(id, clientName, clientPhone, date, time, serviceId) {
        this.id = id;
        this.clientName = clientName;
        this.clientPhone = clientPhone;
        this.date = date;
        this.time = time;
        this.serviceId = serviceId;
    }
}

class BookingManager {
    constructor() {
        this.bookings = [];
        this.services = [];
        this.nextBookingId = 1;
        this.nextServiceId = 1;
        this._initDemoData();
    }

    _initDemoData() {
        const service1 = this.addService('Маникюр', 60, 1500);
        const service2 = this.addService('Стрижка', 40, 1200);
        this.createBooking('Иван Петров', '+79991234567', '2024-04-15', '10:00', service1.id);
    }

    addService(name, duration, price) {
        const service = new Service(this.nextServiceId++, name, parseInt(duration), parseFloat(price));
        this.services.push(service);
        return service;
    }

    getServices() {
        return this.services;
    }

    deleteService(serviceId) {
        this.services = this.services.filter(s => s.id !== serviceId);
    }

    createBooking(clientName, clientPhone, date, time, serviceId) {
        const isSlotTaken = this.bookings.some(b => b.date === date && b.time === time && b.serviceId === serviceId);
        if (isSlotTaken) {
            alert('Это время только что заняли. Выберите другое.');
            return false;
        }
        const booking = new Booking(this.nextBookingId++, clientName, clientPhone, date, time, serviceId);
        this.bookings.push(booking);
        return true;
    }

    getBookings() {
        return this.bookings;
    }

    deleteBooking(bookingId) {
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
    }

    getAvailableSlots(date, serviceId) {
        const service = this.services.find(s => s.id == serviceId);
        if (!service) return [];

        const startHour = 10;
        const endHour = 18;
        const allSlots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += service.duration) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                allSlots.push(timeStr);
            }
        }

        const bookedSlots = this.bookings
            .filter(b => b.date === date && b.serviceId == serviceId)
            .map(b => b.time);

        return allSlots.filter(slot => !bookedSlots.includes(slot));
    }
}

const manager = new BookingManager();

const serviceSelect = document.getElementById('serviceSelect');
const dateInput = document.getElementById('dateInput');
const checkSlotsBtn = document.getElementById('checkSlotsBtn');
const slotsContainer = document.getElementById('slotsContainer');
const bookingForm = document.getElementById('bookingForm');
const clientName = document.getElementById('clientName');
const clientPhone = document.getElementById('clientPhone');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const selectedSlotInfo = document.getElementById('selectedSlotInfo');
const bookingsContainer = document.getElementById('bookingsContainer');
const addServiceBtn = document.getElementById('addServiceBtn');
const serviceName = document.getElementById('serviceName');
const serviceDuration = document.getElementById('serviceDuration');
const servicePrice = document.getElementById('servicePrice');

let selectedDate = '';
let selectedTime = '';
let selectedServiceId = null;

function renderServices() {
    const services = manager.getServices();
    serviceSelect.innerHTML = '<option value="">Выберите услугу</option>';
    services.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.name} (${s.duration} мин) - ${s.price} руб.`;
        serviceSelect.appendChild(option);
    });
}

function renderBookings() {
    const bookings = manager.getBookings();
    const services = manager.getServices();
    bookingsContainer.innerHTML = '';
    bookings.forEach(b => {
        const service = services.find(s => s.id === b.serviceId) || { name: 'Неизвестно' };
        const li = document.createElement('li');
        li.innerHTML = `
            <span>
                <strong>${b.clientName}</strong> (${b.clientPhone})<br>
                <small>${b.date} в ${b.time}, ${service.name}</small>
            </span>
            <button class="delete-booking" data-id="${b.id}">❌</button>
        `;
        bookingsContainer.appendChild(li);
    });

    document.querySelectorAll('.delete-booking').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            manager.deleteBooking(id);
            renderBookings();
            if (selectedDate && selectedServiceId) {
                checkSlotsBtn.click();
            }
        });
    });
}

function renderSlots(date, serviceId) {
    const slots = manager.getAvailableSlots(date, serviceId);
    slotsContainer.innerHTML = '';
    if (slots.length === 0) {
        slotsContainer.innerHTML = '<p>На этот день нет свободных слотов.</p>';
        return;
    }
    slots.forEach(time => {
        const slotBtn = document.createElement('button');
        slotBtn.classList.add('time-slot');
        slotBtn.textContent = time;
        slotBtn.addEventListener('click', () => {
            selectedDate = date;
            selectedTime = time;
            selectedServiceId = parseInt(serviceId);
            bookingForm.style.display = 'block';
            selectedSlotInfo.textContent = `Вы выбрали: ${date} в ${time}`;
        });
        slotsContainer.appendChild(slotBtn);
    });
}

addServiceBtn.addEventListener('click', () => {
    const name = serviceName.value.trim();
    const duration = serviceDuration.value.trim();
    const price = servicePrice.value.trim();
    if (name && duration && price) {
        manager.addService(name, duration, price);
        renderServices();
        serviceName.value = '';
        serviceDuration.value = '';
        servicePrice.value = '';
    } else {
        alert('Заполните все поля услуги');
    }
});

checkSlotsBtn.addEventListener('click', () => {
    const serviceId = serviceSelect.value;
    const date = dateInput.value;
    if (!serviceId || !date) {
        alert('Выберите услугу и дату');
        return;
    }
    renderSlots(date, serviceId);
});

confirmBookingBtn.addEventListener('click', () => {
    const name = clientName.value.trim();
    const phone = clientPhone.value.trim();
    if (!name || !phone) {
        alert('Введите имя и телефон');
        return;
    }
    const success = manager.createBooking(name, phone, selectedDate, selectedTime, selectedServiceId);
    if (success) {
        alert('Запись подтверждена!');
        bookingForm.style.display = 'none';
        clientName.value = '';
        clientPhone.value = '';
        renderBookings();
        renderSlots(selectedDate, selectedServiceId);
    }
});

const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

renderServices();
renderBookings();
