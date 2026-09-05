// Расписание Иры
const schedule = {
    'Monday': { end: '18:20', freeAfter: '19:30' },
    'Tuesday': { end: '18:20', freeAfter: '19:30' },
    'Wednesday': { end: '16:30', freeAfter: '17:30' },
    'Thursday': { end: '14:05', freeAfter: '15:05' },
    'Friday': { end: '16:25', freeAfter: '17:25' },
    'Saturday': { end: '16:25', freeAfter: '17:25' },
    'Sunday': { end: null, freeAfter: null }
};

// Дни встреч (примеры)
const meetingDays = new Set();

// Функция для создания календаря
function createCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = `
        <div style="margin-bottom: 30px; text-align: center;">
            <h3 style="color: #ff6b9d; margin-bottom: 20px;">
                ${getMonthName(month)} ${year}
            </h3>
        </div>
        <div class="calendar-header">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
        </div>
        <div class="calendar-days">
    `;

    // Пустые дни до начала месяца
    for (let i = 1; i < startingDayOfWeek; i++) {
        calendarHTML += `<div class="day other-month"></div>`;
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const dayName = getDayName(dayOfWeek);
        
        let dayClass = 'day';
        let title = '';

        // Суббота и воскресенье - идеальные дни для встреч
        if (dayOfWeek === 6 || dayOfWeek === 0) {
            dayClass += ' possible-day';
            title = 'Выходной - можно встретиться! 🎉';
        } else {
            dayClass += ' busy-day';
            title = `Ира занята до ${schedule[dayName].freeAfter}`;
        }

        calendarHTML += `
            <div class="${dayClass}" title="${title}">
                ${day}
            </div>
        `;
    }

    // Пустые дни после конца месяца
    const totalCells = Math.ceil((startingDayOfWeek - 1 + daysInMonth) / 7) * 7;
    for (let i = daysInMonth + startingDayOfWeek - 1; i < totalCells; i++) {
        calendarHTML += `<div class="day other-month"></div>`;
    }

    calendarHTML += `</div>`;

    return calendarHTML;
}

function getMonthName(month) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
}

function getDayName(dayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
}

// Инициализация календаря
function initCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const calendarEl = document.getElementById('calendar');
    
    let html = '';
    
    // Показываем текущий месяц и следующий
    for (let i = 0; i < 2; i++) {
        const currentMonth = month + i;
        const currentYear = currentMonth > 11 ? year + 1 : year;
        const adjustedMonth = currentMonth % 12;
        
        html += createCalendar(currentYear, adjustedMonth);
    }

    calendarEl.innerHTML = html;

    // Добавляем интерактивность
    addCalendarInteractivity();
}

function addCalendarInteractivity() {
    const days = document.querySelectorAll('.day:not(.other-month)');
    
    days.forEach(day => {
        day.addEventListener('click', function() {
            if (this.classList.contains('possible-day')) {
                this.classList.toggle('meeting-day');
            }
        });

        day.addEventListener('mouseenter', function() {
            if (this.classList.contains('possible-day') || this.classList.contains('busy-day')) {
                this.style.opacity = '0.8';
            }
        });

        day.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
}

// Инициализируем календарь при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();

    // Добавляем немного магии на странице
    addPageAnimations();
});

function addPageAnimations() {
    // Анимация для элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.day-schedule, .quote, .photo-placeholder, .info-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);