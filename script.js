// script.js

// Константы
const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const SERVICE_NAMES = {
  fashion: 'Fashion',
  portrait: 'Портрет',
  interior: 'Интерьерная фотография',
  product: 'Предметная фотография',
  wedding: 'Свадебная фотография',
  landscape: 'Пейзаж',
};

// Утилиты
const getServiceName = (key) => SERVICE_NAMES[key] || key;

// Хранилище сессий
class SessionStorage {
  constructor() {
    this.sessions = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('photoSessions');
      if (saved) {
        this.sessions = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Ошибка загрузки сессий:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('photoSessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Ошибка сохранения сессий:', error);
    }
  }

  addSession(date, services) {
    if (!date || !Array.isArray(services) || services.length === 0) {
      throw new Error('Некорректные данные сессии');
    }

    services.forEach(service => {
      this.sessions.push({ date, service });
    });
    this.saveToStorage();
  }

  getSessionsByDate(date) {
    return this.sessions.filter(s => s.date === date);
  }

  getAllSessions() {
    return [...this.sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sessionStorage = new SessionStorage();
  let bookingModal, accountModal;

  // Инициализация модальных окон
  try {
    if (typeof bootstrap !== 'undefined') {
      bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
      accountModal = new bootstrap.Modal(document.getElementById('accountModal'));
    } else {
      console.error('Bootstrap не загружен');
    }
  } catch (error) {
    console.error('Ошибка инициализации модальных окон:', error);
  }

  // Установка минимальной даты
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Обработчики кнопок
  const setupButton = (id, callback) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', callback);
    }
  };

  setupButton('btnBookingMain', () => bookingModal?.show());
  setupButton('btnBookingServices', () => bookingModal?.show());
  setupButton('btnAccount', () => {
    accountModal?.show();
    renderCalendar();
  });
  setupButton('btnScrollTop', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Валидация и отправка формы
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!bookingForm.checkValidity()) {
        e.stopPropagation();
        bookingForm.classList.add('was-validated');
        return;
      }

      const formData = new FormData(bookingForm);
      const fullName = formData.get('fullName')?.trim();
      const contact = formData.get('contact')?.trim();
      const services = formData.getAll('services');
      const date = formData.get('date');

      if (!fullName || !contact || !date || services.length === 0) {
        alert('Пожалуйста, заполните все обязательные поля.');
        return;
      }

      try {
        sessionStorage.addSession(date, services);
        alert(
          `Спасибо, ${fullName}! Ваша заявка на ${services.map(getServiceName).join(', ')} на дату ${date} принята. Мы свяжемся с вами по номеру ${contact}.`
        );

        bookingForm.reset();
        bookingForm.classList.remove('was-validated');
        bookingModal?.hide();

        updateFutureSessions();
        renderCalendar();
      } catch (error) {
        console.error('Ошибка при сохранении сессии:', error);
        alert('Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте позже.');
      }
    });
  }

  // Обновление списка будущих сессий
  function updateFutureSessions() {
    const futureSessionsList = document.getElementById('futureSessions');
    if (!futureSessionsList) return;

    futureSessionsList.innerHTML = '';

    const sessions = sessionStorage.getAllSessions();
    const grouped = sessions.reduce((acc, { date, service }) => {
      if (!acc[date]) acc[date] = [];
      acc[date].push(service);
      return acc;
    }, {});

    for (const [date, services] of Object.entries(grouped)) {
      const dateFormatted = new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const servicesList = services.map(getServiceName).join(', ');
      
      const li = document.createElement('li');
      li.className = 'list-group-item bg-secondary bg-opacity-50 text-white rounded mb-2';
      li.textContent = `${dateFormatted}: ${servicesList}`;
      futureSessionsList.appendChild(li);
    }
  }

  // Рендер календаря
  function renderCalendar() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Создаем фрагмент для оптимизации DOM-операций
    const fragment = document.createDocumentFragment();

    // Заголовок
    const header = document.createElement('h4');
    header.textContent = now.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    header.className = 'text-center mb-3';
    fragment.appendChild(header);

    // Таблица
    const table = document.createElement('table');
    table.className = 'table table-bordered text-center';

    // Заголовок дней недели
    const thead = document.createElement('thead');
    const daysRow = document.createElement('tr');
    DAYS_OF_WEEK.forEach(day => {
      const th = document.createElement('th');
      th.textContent = day;
      daysRow.appendChild(th);
    });
    thead.appendChild(daysRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dayCounter = 1;
    for (let week = 0; week < 6 && dayCounter <= daysInMonth; week++) {
      const tr = document.createElement('tr');
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const td = document.createElement('td');
        if (week === 0 && dayOfWeek < startDay || dayCounter > daysInMonth) {
          td.textContent = '';
        } else {
          td.textContent = dayCounter;

          const dateISO = new Date(year, month, dayCounter).toISOString().split('T')[0];
          const daySessions = sessionStorage.getSessionsByDate(dateISO);

          if (daySessions.length > 0) {
            const marks = document.createElement('div');
            marks.className = 'mt-1 d-flex flex-wrap justify-content-center gap-1';

            daySessions.forEach(({ service }) => {
              const mark = document.createElement('span');
              mark.className = 'badge bg-primary text-truncate';
              mark.style.maxWidth = '80px';
              mark.title = getServiceName(service);
              mark.textContent = getServiceName(service);
              marks.appendChild(mark);
            });
            td.appendChild(marks);
            td.classList.add('bg-secondary', 'bg-opacity-75', 'rounded');
          }

          dayCounter++;
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    fragment.appendChild(table);

    // Очищаем контейнер и добавляем новый календарь
    calendarContainer.innerHTML = '';
    calendarContainer.appendChild(fragment);
  }

  // Инициализация
  updateFutureSessions();
  renderCalendar();
});
