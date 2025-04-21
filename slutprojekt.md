# Slutprojekt Dokumentation

## Översikt
Detta projekt är en webbapplikation byggd med **Node.js**, **Express** och **Socket.IO**. Applikationen är en enkel sociala media, och inkluderar funktioner som användarautentisering, profilhantering, chattrum och skapande av inlägg. JSON-filer används för datalagring, och applikationen stödjer filuppladdningar för profilbilder och inläggsbilder.

---

## Funktioner

### 1. **Användarautentisering**
- **Registrering**: Användare kan skapa ett konto med användarnamn, e-post och lösenord.
- **Inloggning**: Användare kan logga in för att få tillgång till skyddade funktioner.
- **Sessionshantering**: Användarsessioner hanteras med hjälp av `express-session`.

### 2. **Profilhantering**
- Visa profiler.
- Redigera profilinformation (användarnamn, beskrivning, profilbild).
- Ta bort profiler.

### 3. **Inlägg**
- Användare kan skapa inlägg med titel, beskrivning och bild.
- Inlägg visas på startsidan med detaljer som användarnamn och datum.

### 4. **Chattrum**
- Användare kan skapa och gå med i chattrum.
- Meddelanden lagras i JSON-filer och visas i realtid med hjälp av **Socket.IO**.
- Chattrum raderas efter 10 minuters inaktivitet.

### 5. **Mörkt läge**
- Användare kan växla mellan ljust och mörkt läge, och preferenser sparas i `localStorage`.

---

## Filstruktur

### **Huvudfiler**
- `index.js`: Applikationens startpunkt. Hanterar routes, middleware och WebSocket-logik.
- `utils.js`: Innehåller hjälpfunktioner för rendering av templates och hantering av filuppladdningar.

### **Moduler**
- `userModule.js`: Hanterar användarrelaterad funktionalitet (inloggning, registrering, profilhantering).
- `postModule.js`: Hanterar skapande och lagring av inlägg.
- `generalModule.js`: Hanterar generella sidor som startsidan och profilsidor.
- `chatModule.js`: Hanterar skapande av chattrum, meddelandehantering och rensning.

### **Templates**
- `render.html`: Grundmall för rendering av sidor.
- `registerForm.html` & `loginForm.html`: Formulär för registrering och inloggning.
- `upload.html`: Formulär för att skapa inlägg.
- `chat.html`: Mall för chattrum.

### **Statiska filer**
- `style.css`: Innehåller stilmallar för applikationen, inklusive stöd för mörkt läge.
- `chat.js`: Klientbaserad JavaScript för realtidschatt.

### **Datafiler**
- `users.json`: Lagrar användardata (användarnamn, e-post, hashade lösenord, profilbild, etc.).
- `posts.json`: Lagrar inläggsdata (titel, beskrivning, bild, användare, etc.).
- `chats`: Katalog för lagring av chattmeddelanden i JSON-filer.

---

## Viktiga Endpoints

### **Generellt**
- `GET /`: Startsida som visar alla inlägg.
- `GET /profile/:id`: Visa en användares profil.
- `POST /deleteProfile`: Ta bort den inloggade användarens profil.

### **Användare**
- `GET /login`: Inloggningssida.
- `POST /login`: Hantera inloggningsförfrågningar.
- `GET /register`: Registreringssida.
- `POST /register`: Hantera registreringsförfrågningar.
- `GET /editProfile`: Sida för att redigera profil.
- `POST /editProfile`: Uppdatera profilinformation.

### **Inlägg**
- `GET /post`: Sida för att skapa ett nytt inlägg.
- `POST /post`: Hantera skapande av inlägg (med bilduppladdning).

### **Chatt**
- `GET /chat`: Lista över aktiva chattrum.
- `GET /chat/:id`: Gå med i ett specifikt chattrum.
- `POST /createChat`: Skapa ett nytt chattrum.
- `POST /addMessage`: Lägg till ett meddelande i ett chattrum.

---

## Använda teknologier
- **Backend**: Node.js, Express
- **WebSocket**: Socket.IO
- **Filuppladdningar**: Multer
- **Sessionshantering**: express-session
- **Datalagring**: JSON-filer
- **Stilmallar**: CSS (med stöd för mörkt läge)

---

## Installationsinstruktioner

1. **Klona projektet**
   ```bash
   git clone <repository-url>
   cd Slutprojekt
   ```

2. **Installera beroenden**
   ```bash
   npm install
   ```

3. **Starta applikationen**
   ```bash
   node index.js
   ```
   Servern körs på `http://localhost:3000`.

4. **Öppna applikationen**
   Öppna din webbläsare och navigera till `http://localhost:3000`.

---

## Framtida förbättringar
- Lägga inlägg på separata sidor.
- Implementera likes och följare för att ge top- och following-sidorna funktionalitet.
- Utöka användningen av roller (t.ex. admin).
- Förbättra felhantering.
- Förbättra css.