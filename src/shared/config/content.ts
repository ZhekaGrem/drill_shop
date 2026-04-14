// src/shared/config/content.ts
// Централізоване сховище текстового контенту

export const content = {
  // ===== НАВІГАЦІЯ =====
  navigation: {
    home: 'ДІМ',
    shop: 'МАГАЗИН',
    about: 'ПРО НАС',
    contacts: 'КОНТАКТИ',
    account: 'АКАУНТ',
    cart: 'КОШИК',
    profile: 'ПРОФІЛЬ',
    // favorites: 'ОБРАНІ',
    orders: 'ЗАМОВЛЕННЯ',
    adminPanel: 'АДМІН ПАНЕЛЬ',
    logout: 'ВИЙТИ',
  },

  // ===== HEADER =====
  header: {
    navigation: 'Навігація',
    promoBanner: {
      text: ' Безкоштовна доставка на замовлення від 2000 грн! • Знижки до 30% на окремі товари • Нові дропи регулярно •',
      enabled: true,
    },
    accountMenu: {
      label: 'Акаунт',
      profile: 'Профіль',
      // favorites: 'Обрані',
      orders: 'Замовлення',
      management: 'Управління',
      adminPanel: 'Адмін панель',
      logout: 'Вийти',
    },
  },

  // ===== FOOTER =====
  footer: {
    description:
      'Офіційний магазин мерчу Щільного Drill. Футболки, худі, постери та аксесуари лімітованими тиражами з доставкою по всій Україні.',
    sections: {
      customers: 'Покупцям',
      categories: 'Категорії',
      social: 'Слідкуйте за нами',
    },
    links: {
      catalog: 'Каталог товарів',
      about: 'Про нас',
      delivery: 'Доставка і оплата',
      faq: 'Питання та відповіді',
      contacts: 'Контакти',
    },
    categories: {
      sausages: 'Футболки',
      meat: 'Худі',
      smoked: 'Постери',
      sauces: 'Аксесуари',
    },
    socialDescription: 'Отримуйте новини про акції та новинки',
    blog: 'Наш блог',
    reviews: 'Відгуки клієнтів',
    privacyPolicy: 'Політика конфіденційності',
    copyright: ' Drill shop. Усі права захищені.',
  },

  // ===== ГОЛОВНА СТОРІНКА =====
  home: {
    hero: {
      title: 'Офіційний мерч Щільного Drill',
      description:
        'Drill shop — офіційний магазин мерчу Щільного Drill зі Львова. Футболки, худі, постери та аксесуари лімітованими тиражами, без перепродажу та fan-made копій. Носи своє.',
    },
    buttons: {
      freshProducts: 'Нові дропи',
      specialOffers: 'Спеціальні пропозиції',
    },
    sections: {
      freshness: {
        subtitle: 'Від бренду — до тебе',
        title: 'Офіційний мерч напряму',
        description:
          'Ми продаємо лише офіційний мерч Щільного Drill без посередників. Замовлення відправляємо прямо з нашої точки у Львові — Новою Поштою, Укрпоштою або самовивозом.',
        buttonText: 'Перейти до каталогу',
      },
      quality: {
        subtitle: 'Якість, яку видно та відчутно',
        title: 'Наша якість — наша репутація',
        description:
          'Ми самі контролюємо виробництво мерчу: підбираємо щільну бавовну, стежимо за якістю друку та пошиття. Без fan-made копій — лише офіційні речі, за які ми відповідаємо.',
        buttonText: 'Дізнатися більше про нас',
      },
    },
    social: {
      title: 'Слідкуйте за нами:',
    },
  },

  // ===== СТОРІНКА "ПРО НАС" =====
  about: {
    sections: {
      story: {
        title: 'Наша історія: офіційний мерч Щільного Drill',
        description:
          'Drill shop — офіційна точка продажу мерчу Щільного Drill. Ми створили магазин, щоб фанати могли купити оригінальний одяг та аксесуари бренду напряму, без перепродажу та fan-made копій. Кожен дроп — це лімітована серія, над якою ми працюємо разом із командою Щільного Drill.',
      },
      freshness: {
        title: 'Від бренду — до твоїх плечей',
        description:
          'Ми відправляємо замовлення прямо з нашої точки у Львові, без довгих складських шляхів. Якісне пакування, офіційні чеки та накладні, швидка доставка по всій Україні — ти отримуєш мерч у тому стані, у якому він залишив наш склад.',
      },
      quality: {
        title: 'Контроль на кожному етапі',
        description:
          'Ми самі визначаємо, яким буде мерч: підбираємо тканину, друкарню та пошиттєвий цех. Ми перевіряємо кожен тираж перед відправкою — щільність бавовни, точність принту, рівність швів. Ця відповідальність і є нашою гарантією якості.',
      },
      service: {
        title: 'Сервіс із людським обличчям',
        description:
          'Наша команда — фанати бренду, як і ти. Ми готові підказати по розмірах та посадці, проконсультувати щодо доставки та допомогти з будь-якими питаннями стосовно замовлення. Для нас кожен клієнт — частина сцени.',
      },
      experience: {
        title: 'Бренд, за яким йде сцена',
        description:
          'Щільний Drill — це більше, ніж одяг: це візуальна мова української сцени, яка формується щодня. Ми пишаємося тим, що транслюємо цю енергію через мерч і робимо її доступною фанатам по всій Україні та за її межами.',
        buttonText: "Зв'язатися з нами",
      },
    },
  },

  // ===== НОТИФІКАЦІЇ =====
  notifications: {
    // Кошик
    cart: {
      addError: 'Не вдалося додати товар',
      updateError: 'Не вдалося оновити кількість',
      removeSuccess: 'Товар видалено',
      removeError: 'Не вдалося видалити товар',
      clearError: 'Не вдалося очистити кошик',
    },

    // Аутентифікація
    auth: {
      loginSuccess: {
        title: 'Успішний вхід!',
        message: 'Вітаємо з поверненням!',
      },
      loginError: {
        title: 'Помилка входу',
      },
      emailVerified: {
        title: '✅ Email підтверджено!',
        message: 'Тепер введіть ваш пароль для входу',
      },
      registerError: 'Сталася помилка при реєстрації',
    },

    // Замовлення
    order: {
      createSuccess: {
        title: 'Замовлення створено!',
        message: (orderNumber: string) => `Ваш номер замовлення: ${orderNumber}`,
      },
      createError: {
        title: 'Помилка створення замовлення',
        message: 'Спробуйте ще раз пізніше.',
      },
      statusUpdateSuccess: {
        title: 'Успіх',
        message: 'Статус замовлення оновлено',
      },
    },

    // Адмін панель
    admin: {
      userRoleUpdated: {
        title: 'Успіх',
        message: 'Роль користувача оновлено',
      },
      userRoleError: {
        title: 'Помилка',
        message: 'Не вдалося оновити роль користувача',
      },
    },

    // Обрані
    favorites: {
      removeSuccess: 'Товар видалено з обраних',
      removeError: 'Не вдалося видалити товар з обраних',
    },

    // Профіль
    profile: {
      updateSuccess: {
        title: 'Успіх',
        message: 'Дані профілю оновлено',
      },
      updateError: {
        title: 'Помилка',
        message: 'Не вдалося оновити дані',
      },
      passwordChangeSuccess: {
        title: 'Успіх',
        message: 'Пароль успішно змінено',
      },
      passwordChangeError: {
        title: 'Помилка',
        message: 'Не вдалося змінити пароль',
      },
    },

    // Відгуки
    reviews: {
      createSuccess: 'Відгук успішно додано',
      createError: 'Не вдалося додати відгук',
      deleteSuccess: 'Відгук видалено',
      deleteError: 'Не вдалося видалити відгук',
    },

    // Платежі
    payment: {
      error: 'Помилка при створенні платежу',
    },
  },

  // ===== ФОРМИ =====
  forms: {
    // Форма логіну
    login: {
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      emailError: 'Неправильний формат email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Ваш пароль',
      passwordError: 'Пароль не може бути порожнім',
      rememberMe: "Запам'ятати мене",
      forgotPassword: 'Забули пароль?',
      submitButton: 'Увійти',
      resendVerification: '→ Якщо лист не прийшов',
    },

    // Форма реєстрації
    register: {
      firstNameLabel: "Ім'я",
      lastNameLabel: 'Прізвище',
      emailLabel: 'Email',
      passwordLabel: 'Пароль',
      confirmPasswordLabel: 'Підтвердження пароля',
      phoneLabel: 'Телефон',
      submitButton: 'Зареєструватися',
    },

    // Форма чекауту
    checkout: {
      guestEmailLabel: 'Email для зв`язку',
      notesLabel: 'Коментар до замовлення',
      deliveryMethodLabel: 'Спосіб доставки',
      paymentMethodLabel: 'Спосіб оплати',
      submitButton: 'Оформити замовлення',
      shippingAddress: {
        firstNameLabel: "Ім'я",
        lastNameLabel: 'Прізвище',
        phoneLabel: 'Телефон',
        addressLabel: 'Адреса',
        cityLabel: 'Місто',
        zipCodeLabel: 'Індекс',
      },
    },
  },

  // ===== КНОПКИ =====
  buttons: {
    catalog: 'Каталог',
    addToCart: 'Додати в кошик',
    buy: 'Купити',
    readMore: 'Читати далі',
    viewAll: 'Переглянути всі',
    back: 'Назад',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Редагувати',
    submit: 'Відправити',
    close: 'Закрити',
    continue: 'Продовжити',
    confirm: 'Підтвердити',
  },

  // ===== СТАТУСИ =====
  statuses: {
    order: {
      pending: 'В обробці',
      processing: 'Обробляється',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      cancelled: 'Скасовано',
    },
    payment: {
      pending: 'Очікує оплати',
      paid: 'Оплачено',
      failed: 'Помилка оплати',
      refunded: 'Повернуто',
    },
  },

  // ===== ЗАГАЛЬНІ ТЕКСТИ =====
  common: {
    loading: 'Завантаження...',
    error: 'Сталася помилка',
    noData: 'Немає даних',
    search: 'Пошук',
    filter: 'Фільтр',
    sort: 'Сортування',
    price: 'Ціна',
    quantity: 'Кількість',
    total: 'Всього',
    subtotal: 'Проміжний підсумок',
    shipping: 'Доставка',
    discount: 'Знижка',
    emptyCart: 'Кошик порожній',
    emptyFavorites: 'Список обраних порожній',
    emptyOrders: 'У вас поки немає замовлень',
  },
};

export type Content = typeof content;
