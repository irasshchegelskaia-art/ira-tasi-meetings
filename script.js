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

// Выбранные дни
let selectedMeetings = {
    ira: new Set(),
    tasi: new Set()
};

// Текущий пользователь
let currentUser = null;

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
        const dateKey = `${year}-${month}-${day}`;
        
        let dayClass = 'day';
        let title = '';

        // Проверяем выбор
        const iraSelected = selectedMeetings.ira.has(dateKey);
        const tasiSelected = selectedMeetings.tasi.has(dateKey);

        // Если обе выбрали - встреча подтверждена
        if (iraSelected && tasiSelected) {
            dayClass += ' meeting-day';
            title = '✨ Встреча подтверждена! ✨';
        } else if (iraSelected) {
            dayClass += ' ira-selected';
            title = '💕 Ира выбрала эту дату';
        } else if (tasiSelected) {
            dayClass += ' tasi-selected';
            title = '💕 Таси выбрала эту дату';
        } else {
            // Суббота и воскресенье - идеальные дни для встреч
            if (dayOfWeek === 6 || dayOfWeek === 0) {
                dayClass += ' possible-day';
                title = 'Выходной - можно встретиться! 🎉';
            } else {
                dayClass += ' busy-day';
                title = `Ира занята до ${schedule[dayName].freeAfter}`;
            }
        }

        calendarHTML += `
            <div class="${dayClass}" title="${title}" data-date="${dateKey}" data-day="${day}" data-month="${month}" data-year="${year}">
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

function getFormattedDate(year, month, day) {
    const date = new Date(year, month, day);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const days = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
    return `${days[date.getDay()]}, ${day} ${months[month]} ${year}`;
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
    updateMeetingStatus();
}

function addCalendarInteractivity() {
    const days = document.querySelectorAll('.day:not(.other-month)');
    
    days.forEach(day => {
        day.addEventListener('click', function() {
            if (!currentUser) {
                showNotification('Пожалуйста, выбери своё имя вверху! 👆', 'warning');
                return;
            }

            const dateKey = this.getAttribute('data-date');
            const year = parseInt(this.getAttribute('data-year'));
            const month = parseInt(this.getAttribute('data-month'));
            const dayNum = parseInt(this.getAttribute('data-day'));

            // Если это день встречи и пользователь не выбирал его
            if (this.classList.contains('meeting-day')) {
                showNotification('✨ Встреча уже подтверждена! Не требуется никаких действий', 'success');
                return;
            }

            // Проверяем занятость Иры
            if (this.classList.contains('busy-day')) {
                showNotification('Ира занята в этот день 😿 Выбери выходной!', 'warning');
                return;
            }

            // Переключаем выбор
            if (selectedMeetings[currentUser].has(dateKey)) {
                selectedMeetings[currentUser].delete(dateKey);
            } else {
                selectedMeetings[currentUser].add(dateKey);
            }

            // Переинициализируем календарь
            initCalendar();
            
            // Проверяем, подтверждена ли встреча
            const formattedDate = getFormattedDate(year, month, dayNum);
            if (selectedMeetings.ira.has(dateKey) && selectedMeetings.tasi.has(dateKey)) {
                showNotification(`🎉 Встреча подтверждена на ${formattedDate}! Встречаемся в Буханке! ☕`, 'success');
                scheduleNotification(year, month, dayNum);
            } else {
                showNotification(`${currentUser === 'ira' ? '💕 Ира' : '💕 Таси'} выбрала ${formattedDate}!`, 'success');
            }
        });
    });
}

function updateMeetingStatus() {
    const statusEl = document.getElementById('meetingStatus');
    const confirmedMeetings = Array.from(selectedMeetings.ira).filter(date => selectedMeetings.tasi.has(date));
    
    if (confirmedMeetings.length > 0) {
        const nextMeeting = confirmedMeetings[0];
        const [year, month, day] = nextMeeting.split('-').map(Number);
        const formattedDate = getFormattedDate(year, month, day);
        statusEl.innerHTML = `✨ Следующая встреча: <strong>${formattedDate}</strong> в Буханке! ☕`;
        statusEl.classList.add('confirmed');
    } else {
        statusEl.innerHTML = '';
        statusEl.classList.remove('confirmed');
    }
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function scheduleNotification(year, month, day) {
    // Устанавливаем уведомление за день до встречи
    const meetingDate = new Date(year, month, day);
    const notificationDate = new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000);
    
    // Проверяем, поддерживает ли браузер Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
        // Используем простую систему уведомлений через LocalStorage
        const meetingData = {
            date: `${year}-${month}-${day}`,
            title: '☕ Напоминание о встречи в Буханке!',
            body: `Завтра в ${new Date(year, month, day).toLocaleDateString('ru-RU')} вы встречаетесь в Буханке! 💕`
        };
        
        // Сохраняем в localStorage
        const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
        meetings.push(meetingData);
        localStorage.setItem('meetings', JSON.stringify(meetings));
    }
}

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем календарь
    initCalendar();

    // Выбор пользователя
    const userButtons = document.querySelectorAll('.user-btn');
    userButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const user = this.getAttribute('data-user');
            currentUser = user;
            
            // Обновляем активную кнопку
            userButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем текст
            const nameDisplay = document.getElementById('selectedUser');
            nameDisplay.textContent = user === 'ira' ? '👩 Ты Ира' : '👩 Ты Таси';
            
            // Обновляем навбар
            const navNames = document.querySelectorAll('.navbar .name');
            navNames.forEach(name => {
                if ((user === 'ira' && name.textContent.includes('Ира')) || 
                    (user === 'tasi' && name.textContent.includes('Таси'))) {
                    name.classList.add('selected');
                } else {
                    name.classList.remove('selected');
                }
            });
            
            showNotification(`Привет, ${user === 'ira' ? 'Ира' : 'Таси'}! Выбери удобную дату для встречи! 💕`);
        });
    });

    // Добавляем немного магии на странице
    addPageAnimations();

    // Запрашиваем разрешение на уведомления
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
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
    
    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);