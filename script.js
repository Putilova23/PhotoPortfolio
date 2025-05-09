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

function getServiceName(serviceId) {
    const services = {
        'family': 'Семейная съёмка',
        'wedding': 'Свадебная съёмка',
        'portrait': 'Портретная съёмка',
        'event': 'Съёмка мероприятий'
    };
    return services[serviceId] || serviceId;
}

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

  removeSession(date) {
    this.sessions = this.sessions.filter(s => s.date !== date);
    this.saveToStorage();
  }

  getSessionsByDate(date) {
    return this.sessions.filter(s => s.date === date);
  }

  getAllSessions() {
    return [...this.sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

// Класс для работы с модальным окном
class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.error(`Модальное окно с id "${modalId}" не найдено`);
            return;
        }
        this.closeButtons = this.modal.querySelectorAll('.close-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Закрытие по кнопке
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hide());
        });

        // Закрытие по клику вне модального окна
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hide();
            }
        });
    }

    show() {
        console.log('Открытие модального окна');
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        console.log('Закрытие модального окна');
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Класс для работы с вкладками
class Tabs {
    constructor(container) {
        this.container = container;
        this.tabButtons = container.querySelectorAll('.tab-btn');
        this.tabPanes = container.querySelectorAll('.tab-pane');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Деактивируем все кнопки и панели
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanes.forEach(pane => pane.classList.remove('active'));

        // Активируем выбранную вкладку
        const activeButton = this.container.querySelector(`[data-tab="${tabId}"]`);
        const activePane = this.container.querySelector(`#${tabId}`);
        
        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activePane.classList.add('active');
        }
    }
}

// Класс для работы с навигацией
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.toggler = document.querySelector('.navbar-toggler');
        this.collapse = document.querySelector('.navbar-collapse');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollTop = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчик для кнопки мобильного меню
        if (this.toggler) {
            this.toggler.addEventListener('click', () => this.toggleMenu());
        }

        // Закрытие меню при клике на ссылку
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.collapse.classList.remove('show');
                }
            });
        });

        // Закрытие меню при клике вне меню
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.collapse.classList.contains('show') && 
                !this.navbar.contains(e.target)) {
                this.collapse.classList.remove('show');
            }
        });

        // Обработчик прокрутки страницы
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Определяем направление прокрутки
        if (currentScroll > this.lastScrollTop && currentScroll > 100) {
            // Прокрутка вниз и страница прокручена более чем на 100px
            this.navbar.style.transform = 'translateY(-100%)';
        } else {
            // Прокрутка вверх или страница прокручена менее чем на 100px
            this.navbar.style.transform = 'translateY(0)';
        }
        
        this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    toggleMenu() {
        this.collapse.classList.toggle('show');
    }
}

// Класс для работы с календарем
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.sessions = new SessionStorage();
        this.calendarBody = document.getElementById('calendarBody');
        this.currentMonthElement = document.querySelector('.current-month');
        this.prevMonthBtn = document.querySelector('.prev-month');
        this.nextMonthBtn = document.querySelector('.next-month');
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        this.nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Обновляем заголовок календаря
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Получаем первый день месяца и количество дней
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Получаем день недели первого дня (0 - воскресенье, 1 - понедельник, ...)
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Преобразуем воскресенье в 7
        
        // Создаем календарь
        let html = '';
        let day = 1;
        
        // Создаем строки календаря
        for (let i = 0; i < 6; i++) {
            html += '<tr>';
            
            // Заполняем ячейки
            for (let j = 1; j <= 7; j++) {
                if (i === 0 && j < firstDayOfWeek) {
                    // Пустые ячейки в начале месяца
                    html += '<td></td>';
                } else if (day > daysInMonth) {
                    // Пустые ячейки в конце месяца
                    html += '<td></td>';
                } else {
                    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = this.isToday(year, month, day);
                    const hasSession = this.sessions.getSessionsByDate(date).length > 0;
                    
                    let classes = [];
                    if (isToday) classes.push('today');
                    if (hasSession) classes.push('has-session');
                    
                    html += `<td data-date="${date}" class="${classes.join(' ')}">${day}</td>`;
                    day++;
                }
            }
            
            html += '</tr>';
            if (day > daysInMonth) break;
        }
        
        this.calendarBody.innerHTML = html;
        
        // Добавляем обработчики для ячеек
        this.calendarBody.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', () => this.handleDateClick(cell));
        });
    }

    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    }

    handleDateClick(cell) {
        const date = cell.dataset.date;
        const sessions = this.sessions.getSessionsByDate(date);
        
        if (sessions.length > 0) {
            // Показываем список сессий на эту дату
            const sessionList = sessions.map(s => s.service).join(', ');
            alert(`Запланированные сессии на ${date}:\n${sessionList}`);
        } else {
            // Предлагаем добавить новую сессию
            if (confirm(`Добавить новую сессию на ${date}?`)) {
                const service = prompt('Введите тип съёмки:');
                if (service) {
                    this.sessions.addSession(date, [service]);
                    this.render();
                    this.updateSessionsList();
                }
            }
        }
    }

    updateSessionsList() {
        const sessionsList = document.getElementById('futureSessions');
        const allSessions = this.sessions.getAllSessions();
        
        sessionsList.innerHTML = allSessions.map(session => `
            <li class="session-item">
                <span><strong>${this.formatDate(session.date)}:</strong> ${getServiceName(session.service)}</span>
                <button class="btn btn-sm btn-outline-danger delete-session" data-date="${session.date}">Удалить</button>
            </li>
        `).join('');

        // Добавляем обработчики для кнопок удаления
        sessionsList.querySelectorAll('.delete-session').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const date = e.target.dataset.date;
                if (confirm('Удалить эту сессию?')) {
                    this.sessions.removeSession(date);
                    this.render();
                    this.updateSessionsList();
                }
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // Инициализация навигации
    const navigation = new Navigation();

    // Инициализация модального окна бронирования
    const bookingModal = new Modal('bookingModal');

    // Инициализация модального окна личного кабинета
    const accountModal = new Modal('accountModal');

    // Инициализация вкладок в личном кабинете
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
        const tabs = new Tabs(tabsContainer);
    }

    // Инициализация календаря
    const calendar = new Calendar();

    // Обработчик для кнопки личного кабинета
    const btnAccount = document.getElementById('btnAccount');
    if (btnAccount) {
        btnAccount.addEventListener('click', () => {
            accountModal.show();
        });
    }

    // Обработчики для кнопок "Записаться на съёмку"
    const btnBookingMain = document.getElementById('btnBookingMain');
    if (btnBookingMain) {
        console.log('Кнопка btnBookingMain найдена');
        btnBookingMain.addEventListener('click', () => {
            console.log('Клик по кнопке btnBookingMain');
            bookingModal.show();
        });
    } else {
        console.error('Кнопка btnBookingMain не найдена');
    }

    const btnBookingServices = document.getElementById('btnBookingServices');
    if (btnBookingServices) {
        console.log('Кнопка btnBookingServices найдена');
        btnBookingServices.addEventListener('click', () => {
            console.log('Клик по кнопке btnBookingServices');
            bookingModal.show();
        });
    } else {
        console.error('Кнопка btnBookingServices не найдена');
    }

    // Установка минимальной даты для формы бронирования
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    // Обработка отправки формы
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Отправка формы');
            
            if (!bookingForm.checkValidity()) {
                event.stopPropagation();
                bookingForm.classList.add('was-validated');
                return;
            }

            const formData = new FormData(bookingForm);
            const fullName = formData.get('fullName');
            const contact = formData.get('contact');
            const services = formData.getAll('services');
            const date = formData.get('date');

            // Простое уведомление об успешной записи
            alert(`Спасибо за запись, ${fullName}! Мы свяжемся с вами по номеру ${contact} для подтверждения записи на ${date}`);
            
            // Сброс формы и закрытие модального окна
            bookingForm.reset();
            bookingForm.classList.remove('was-validated');
            bookingModal.hide();
        });
    }

    // Обработчик для кнопки "Наверх"
    const btnScrollTop = document.getElementById('btnScrollTop');
    if (btnScrollTop) {
        btnScrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
