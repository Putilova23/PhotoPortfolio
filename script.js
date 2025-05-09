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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // Инициализация модального окна
    const bookingModal = new Modal('bookingModal');

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
