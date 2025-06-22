# 🔨 Syncro
**Syncro** to intuicyjna i darmowa aplikacja webowa do zarządzania projektami i zespołem. Utwórz projekt, zaproś członków zespołu i przypisuj im zadania. Dzięki wizualnemu podejściu do pracy (styl tablicy Kanban), z łatwością zapanujesz nad każdym etapem realizacji.

🌐 **Wypróbuj teraz:** [https://syncroo.vercel.app/](https://syncroo.vercel.app/)


## 📚 Spis treści
- [Funkcje](#funkcje)  
- [Technologie](#technologie)  
- [Instalacja](#instalacja)  
- [Uruchomienie](#uruchomienie)  

## ✅ Funkcje
- Tworzenie i zarządzanie własnymi projektami
- Współpraca zespołowa - zapraszanie członków i przypisywanie im zadań
- Tablica Kanban - przejrzyste śledzenie postępów (**To Do**, **Ongoing**, **Reviewing**, **Done**)  
- Obsługa podzadań dla każdego zadania
- System notatek - zapisuj ważne informacje w kontekście projektu

## 🛠️ Technologie
- **Frontend:** Next.js (React), SCSS, TypeScript  
- **Backend:** Next.js API Routes, TypeScript, Prisma ORM  
- **Baza danych:** PostgreSQL  
- **Autoryzacja:** Auth.js (dawniej NextAuth.js) – z obsługą logowania przez Google i GitHub

## 💾 Instalacja
1. Klonowanie repozytorium i instalacja bibliotek
```bash
git clone https://github.com/Yndh/syncro.git
cd syncro
npm install
```

2. Konfiguracja pliku .env

| Zmienna              | Typ    | Opis                                                                       |
| -------------------- | ------ | -------------------------------------------------------------------------- |
| `NEXTAUTH_URL`        | string | Adres URL aplikacji (np http://localhost:3000).                            |
| `NEXTAUTH_SECRET`    | string | Sekret służący do generowania i weryfikowania tokenów uwierzytelniających.          |
| `DATABASE_URL`       | string | URL połączenia z bazą danych (PostgreSQL).                                 |
| `GITHUB_CLIENT_ID`     | string | ID aplikacji GitHub, używane w procesie uwierzytelniania przez GitHub.     |
| `GITHUB_CLIENT_SECRET` | string | Sekret aplikacji GitHub, wymagany do autentykacji przez GitHub.            |
| `GOOGLE_CLIENT_ID`     | string | ID aplikacji Google, używane w procesie uwierzytelniania przez Google.     |
| `GOOGLE_CLIENT_SECRET` | string | Sekret aplikacji Google, wymagany do autentykacji przez Google.            |
| `MAX_PROJECTS` | number | Maksymalna ilość projektów na użytkownika. |
| `MAX_USERS` | number | Maksymalna liczba członków w jednym projekcie. |
| `MAX_TASKS` | number | Maksymalna liczba zadań w projekcie. |
| `MAX_NOTES` | number | Maksymalna liczba notatek w projekcie. |

3. Migracja bazy danych
```bash
npx prisma migrate dev
```

4. Uruchomienie aplikacji
```bash
npm run build
npm run start
```
Gotowe! Teraz możesz korzystać z Syncro lokalnie.
