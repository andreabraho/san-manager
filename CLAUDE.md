# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
npm install
npm run dev       # nodemon, auto-reload
npm start         # production
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Vite dev server on :5173
npm run build
```

### Environment setup
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in MongoDB Atlas URI, JWT secret, SMTP credentials
```

## Architecture

### Stack
- **Backend**: Node.js + Express, MongoDB Atlas via Mongoose
- **Frontend**: React 18 + Vite, React Router v6, react-grid-layout
- Hosted on Render (backend as Web Service, frontend as Static Site)

### Roles & Auth
Three roles stored in one `users` collection using **Mongoose discriminators** (`discriminatorKey: 'role'`):
- `superadmin` — platform admin, created only by other superadmins
- `provider` — offers services, has a public home page, accepts bookings
- `client` — books services (registered or guest with email+data)

JWT issued on login, sent as `Authorization: Bearer <token>`. Frontend auto-attaches via `api.js` interceptor and redirects to `/login` on 401.

### Key data models
| Model | Purpose |
|-------|---------|
| `User` (+ discriminators) | All users in one collection |
| `Location` | A physical location owned by a provider |
| `Service` | A service offered by a provider at N locations |
| `Availability` | Recurring (weekly) or single-date slots per location |
| `Booking` | A booking linking provider/location/service to a client or guest |
| `HomePage` | Provider's widget grid layout (array of positioned widgets) |
| `WidgetType` | Platform-level enable/disable per widget type key |

### Widget system
Widgets are the core of the provider home page. Architecture:

1. **DB** (`HomePage.widgets[]`): stores `{ widgetId, type, x, y, w, h, config }` — type is a string key, config is a free-form object
2. **`WidgetRegistry.js`**: maps type keys → React component + defaultConfig + defaultSize
3. **`BaseWidget.jsx`**: defines the props contract every widget must follow (`config`, `isEditing`, `onConfigChange`)
4. **`GridLayout.jsx`**: renders `react-grid-layout`, handles drag/resize, add/remove, and calls `onSave`

**To add a new widget**: create `NewWidget.jsx` following the BaseWidget interface, import and register it in `WidgetRegistry.js`, add a `WidgetType` document in MongoDB.

### API routes
| Prefix | Auth | Purpose |
|--------|------|---------|
| `POST /api/auth/*` | public | register/login |
| `GET /api/public/*` | public | provider page, services, locations |
| `POST /api/bookings` | public/optional | create booking (guest or client) |
| `GET /api/bookings/slots` | public | check taken slots |
| `/api/provider/*` | provider JWT | profile, homepage, locations, services, availability |
| `/api/bookings/provider` | provider JWT | view + approve/reject bookings |
| `/api/client/*` | client JWT | profile, booking history |
| `/api/admin/*` | superadmin JWT | users, stats, widget type enable/disable, create superadmin |

### Public URLs
Provider pages live at `/:username` (e.g. `/mario-rossi`). Booking page at `/:username/book`. React Router handles both; Vite proxies `/api` to `:5000` in dev.

### Image uploads
Providers can upload images only after superadmin approval (`canUploadImages: true`). Images are stored in `uploads/` (served as static files). `moderationService.js` is a placeholder for future AI moderation.

### Booking flow
1. Client selects location → service → date → time slot
2. `POST /api/bookings` — creates booking with `status: pending`
3. Emails sent to both provider and client/guest
4. Provider approves/rejects via `PATCH /api/bookings/:id/status`
5. Email sent to client on status change
