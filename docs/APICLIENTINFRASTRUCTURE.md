Огляд системи
API Client Infrastructure - це повнофункціональна система для роботи з HTTP запитами у React/Next.js додатку, побудована на axios з автоматичним керуванням JWT токенами, обробкою помилок та інтеграцією з Zustand store.
Архітектура компонентів

1. API Client (src/shared/api/client.ts)
   Призначення: Центральний HTTP клієнт з автоматичним керуванням токенами
   Ключові функції:

Автоматичне додавання Bearer токена до запитів
Автоматичне оновлення токена при 401 помилці
Глобальна обробка помилок
Підтримка httpOnly cookies для refresh token

typescript// Базове використання
import { apiClient } from '@/shared/api/client';

const response = await apiClient.get('/products');
const newProduct = await apiClient.post('/products', productData);
Interceptors логіка:
Request Interceptor:

Додає Authorization: Bearer ${token} до всіх запитів
Працює тільки якщо токен існує

Response Interceptor:

При 401 помилці → запускає процес оновлення токена
Використовує queue для очікування parallel запитів
При успішному refresh → повторює всі failed запити
При failed refresh → очищає токени + redirect на login

2. Token Management
   Функції для керування токенами:
   typescript// Встановити токен (викликається після login/register)
   setAccessToken(token: string)

// Отримати поточний токен
getAccessToken(): string | null

// Очистити всі токени (викликається при logout)
clearTokens()
Логіка збереження:

accessToken зберігається у localStorage + memory
refreshToken передається через httpOnly cookies (безпечніше)
При перезавантаженні сторінки токен відновлюється з localStorage

3. Auth Store (src/shared/stores/auth.ts)
   Призначення: Zustand store для керування станом автентифікації
   State структура:
   typescriptinterface AuthState {
   user: User | null; // Дані поточного користувача
   isAuthenticated: boolean; // Чи авторизований користувач
   isLoading: boolean; // Стан завантаження для UI
   }
   Actions:
   typescript// Вхід користувача
   login(email, password, rememberMe?) → Promise<void>

// Реєстрація нового користувача  
register(data: RegisterData) → Promise<void>

// Вихід з системи
logout() → Promise<void>

// Отримання даних поточного користувача
getCurrentUser() → Promise<void>

// Ручне встановлення користувача
setUser(user: User | null) → void
Persistence: Використовує zustand/middleware/persist для збереження user + isAuthenticated у localStorage 4. Provider Setup (src/app/providers.tsx)
Компоненти:

QueryClientProvider - React Query для server state
MantineProvider - UI бібліотека з кастомною темою
ModalsProvider - Модальні вікна
Notifications - Toast повідомлення

QueryClient конфігурація:

staleTime: 60s - кеш валідний 1 хвилину
retry: 3 для network помилок, 0 для 401/403/404
mutations не retry по замовчуванню

5. Auth Initializer (src/features/auth/components/AuthInitializer.tsx)
   Призначення: Ініціалізує auth state при завантаженні додатку
   Логіка:

Перевіряє наявність токена у localStorage
Якщо токен є → викликає getCurrentUser()
Якщо токен invalid → auth store автоматично очищується

Workflow авторизації
Successful Login Flow:

1. User enters credentials
2. login() → POST /auth/login
3. Response: { user, tokens: { accessToken, refreshToken } }
4. setAccessToken(accessToken) → saves to localStorage + memory
5. refreshToken → автоматично зберігається у httpOnly cookie
6. AuthStore.setUser(user) + isAuthenticated = true
7. UI redirects to dashboard/profile
   Token Refresh Flow:
8. API request → 401 Unauthorized
9. Response interceptor catches error
10. Checks if refresh already in progress → queues request if yes
11. POST /auth/refresh (refreshToken from httpOnly cookie)
12. Success: new accessToken → retry all queued requests
13. Failure: clearTokens() + redirect to /login
    Logout Flow:
14. logout() → POST /auth/logout (invalidates refresh token on server)
15. clearTokens() → removes accessToken from localStorage + memory
16. AuthStore.setUser(null) + isAuthenticated = false
17. Server clears httpOnly cookie
18. UI redirects to login
    Error Handling
    HTTP Status Codes:

401 → Automatic token refresh attempt
403 → No retry, user lacks permissions
404 → No retry, resource not found
5xx → Retry up to 3 times + console.error

Network Errors:

Timeout: 10 seconds
Retry: 3 attempts for 5xx errors
User notification через Mantine notifications

Security Features
Token Security:

accessToken - короткий TTL (15 min), зберігається у localStorage
refreshToken - довгий TTL (7-30 days), httpOnly cookie (захист від XSS)
Automatic token rotation при refresh

CSRF Protection:

withCredentials: true для cookie-based auth
SameSite cookie attributes на backend

XSS Protection:

refreshToken недоступний для JavaScript
accessToken auto-expires швидко

Використання у компонентах
React Query Integration:
typescript// src/features/products/hooks/useProducts.ts
export function useProducts() {
return useQuery({
queryKey: ['products'],
queryFn: async () => {
const response = await apiClient.get('/products');
return response.data.data;
}
});
}
Auth-protected components:
typescript// src/features/profile/components/ProfilePage.tsx
export function ProfilePage() {
const { user, isAuthenticated, getCurrentUser } = useAuthStore();

useEffect(() => {
if (isAuthenticated && !user) {
getCurrentUser();
}
}, [isAuthenticated, user]);

if (!isAuthenticated) {
return <Navigate to="/login" />;
}

return <div>Profile: {user?.firstName}</div>;
}
Error handling у UI:
typescriptexport function LoginForm() {
const { login, isLoading } = useAuthStore();

const handleSubmit = async (data) => {
try {
await login(data.email, data.password);
// Success → redirect handled by router
} catch (error) {
notifications.show({
title: 'Помилка входу',
message: error.message,
color: 'red'
});
}
};
}
Environment Configuration
env# Required variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional

NEXT_PUBLIC_APP_ENV=development
Troubleshooting
Common Issues:

1. "Token refresh loop"

Причина: Backend повертає 401 на /auth/refresh
Рішення: Перевірити httpOnly cookie setup + backend refresh logic

2. "User logged out after page refresh"

Причина: localStorage токен invalid, getCurrentUser() fails
Рішення: Перевірити token expiry + backend /auth/me endpoint

3. "CORS errors"

Причина: withCredentials + неправильна CORS config
Рішення: Backend повинен мати credentials: true + правильні origins

4. "Infinite loading states"

Причина: AuthInitializer не може визначити auth status
Рішення: Додати fallback timeout для getCurrentUser()
