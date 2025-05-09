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

// Ждем полной загрузки страницы и Bootstrap
window.addEventListener('load', function() {
    // Проверяем, что Bootstrap доступен
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap не загружен');
        return;
    }

    try {
        // Инициализация модальных окон
        const bookingModal = new bootstrap.Modal('#bookingModal');
        const accountModal = new bootstrap.Modal('#accountModal');

        // Обработчик для главной кнопки "Записаться на съёмку"
        document.getElementById('btnBookingMain')?.addEventListener('click', () => {
            bookingModal.show();
        });

        // Обработчик для кнопки "Записаться на съёмку" в разделе услуг
        document.getElementById('btnBookingServices')?.addEventListener('click', () => {
            bookingModal.show();
        });

        // Обработчик для кнопки личного кабинета
        document.getElementById('btnAccount')?.addEventListener('click', () => {
            accountModal.show();
        });

        // Обработчик для кнопки "Наверх"
        document.getElementById('btnScrollTop')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

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
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});
