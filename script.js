// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Установка минимальной даты в форме записи (сегодня)
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Инициализация модальных окон Bootstrap
  const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
  const accountModal = new bootstrap.Modal(document.getElementById('accountModal'));

  // Кнопки вызова модального окна записи
  const bookingButtons = [
    document.getElementById('btnBookingMain'),
    document.getElementById('btnBookingServices')
  ];
  bookingButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        bookingModal.show();
      });
    }
  });

  // Кнопка вызова личного кабинета
  const btnAccount = document.getElementById('btnAccount');
  if (btnAccount) {
    btnAccount.addEventListener('click', () => {
      accountModal.show();
      renderCalendar();
    });
  }

  // Кнопка прокрутки наверх
  const btnScrollTop = document.getElementById('btnScrollTop');
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Валидация формы записи
  const bookingForm = document.getElementById('bookingForm');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bookingForm.checkValidity()) {
      e.stopPropagation();
      bookingForm.classList.add('was-validated');
      return;
    }
    // Собираем данные
    const formData = new FormData(bookingForm);
    const fullName = formData.get('fullName').trim();
    const contact = formData.get('contact').trim();
    const services = formData.getAll('services');
    const date = formData.get('date');

    if (services.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну услугу.');
      return;
    }

    // Здесь можно добавить отправку данных на сервер (fetch/ajax)
    alert(
      `Спасибо, ${fullName}! Ваша заявка на ${services.join(
        ', '
      )} на дату ${date} принята. Мы свяжемся с вами по номеру ${contact}.`
    );

    bookingForm.reset();
    bookingForm.classList.remove('was-validated');
    bookingModal.hide();

    // Добавляем запись в "Будущие фотосессии" и календарь (локально)
    addSession(date, services);
  });

  // Локальное хранилище для будущих фотосессий
  let sessions = [];

  function addSession(date, services) {
    services.forEach((service) => {
      sessions.push({ date, service });
    });
    updateFutureSessions();
    renderCalendar();
  }

  function updateFutureSessions() {
    const futureSessionsList = document.getElementById('futureSessions');
    if (!futureSessionsList) return;

    // Очистить список
    futureSessionsList.innerHTML = '';

    // Отсортировать по дате
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Группируем по дате
    const grouped = {};
    sessions.forEach(({ date, service }) => {
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(service);
    });

    for (const date in grouped) {
      const dateFormatted = new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const servicesList = grouped[date]
        .map((s) => serviceNameByKey(s))
        .join(', ');
      const li = document.createElement('li');
      li.className = 'list-group-item bg-secondary bg-opacity-50 text-white rounded mb-2';
      li.textContent = `${dateFormatted}: ${servicesList}`;
      futureSessionsList.appendChild(li);
    }
  }

  // Названия услуг по ключу
  function serviceNameByKey(key) {
    const map = {
      fashion: 'Fashion',
      portrait: 'Портрет',
      interior: 'Интерьерная фотография',
      product: 'Предметная фотография',
      wedding: 'Свадебная фотография',
      landscape: 'Пейзаж',
    };
    return map[key] || key;
  }

  // Рендер календаря с отметками
  function renderCalendar() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;

    // Очистить
    calendarContainer.innerHTML = '';

    // Создаем календарь на текущий месяц
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Заголовок
    const monthName = now.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    const header = document.createElement('h4');
    header.textContent = monthName;
    header.className = 'text-center mb-3';
    calendarContainer.appendChild(header);

    // Таблица календаря
    const table = document.createElement('table');
    table.className = 'table table-bordered text-center';

    // Заголовок дней недели
    const thead = document.createElement('thead');
    const daysRow = document.createElement('tr');
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    days.forEach((day) => {
      const th = document.createElement('th');
      th.textContent = day;
      daysRow.appendChild(th);
    });
    thead.appendChild(daysRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');

    // Первый день месяца (понедельник=1, воскресенье=7)
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7; // воскресенье = 7

    // Количество дней в месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dayCounter = 1;
    for (let week = 0; week < 6; week++) {
      const tr = document.createElement('tr');
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const td = document.createElement('td');
        if ((week === 0 && dayOfWeek < startDay) || dayCounter > daysInMonth) {
          td.textContent = '';
        } else {
          td.textContent = dayCounter;

          // Проверяем, есть ли фотосессии на этот день
          const dateISO = new Date(year, month, dayCounter).toISOString().split('T')[0];
          const daySessions = sessions.filter((s) => s.date === dateISO);

          if (daySessions.length > 0) {
            // Добавляем отметки услуг
            const marks = document.createElement('div');
            marks.className = 'mt-1 d-flex flex-wrap justify-content-center gap-1';

            daySessions.forEach(({ service }) => {
              const mark = document.createElement('span');
              mark.className = 'badge bg-primary text-truncate';
              mark.style.maxWidth = '80px';
              mark.title = serviceNameByKey(service);
              mark.textContent = serviceNameByKey(service);
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
      if (dayCounter > daysInMonth) break;
    }
    table.appendChild(tbody);
    calendarContainer.appendChild(table);
  }

  // Инициализация списка будущих фотосессий и календаря (если есть сохранённые данные)
  updateFutureSessions();
  renderCalendar();
});
