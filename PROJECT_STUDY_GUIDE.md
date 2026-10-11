# 🚀 GenAI Interview Architect & Resume Builder
## Complete Master Study Guide & Viva / Interview Question Bank

---

## 📌 Table of Contents
1. [Architecture & Project Overview](#1-architecture--project-overview)
2. [`server.js` - Application Bootstrapper](#2-serverjs---application-bootstrapper)
3. [`src/config/database.js` - MongoDB Connection](#3-srcconfigdatabasejs---mongodb-connection)
4. [`src/app.js` - Express Central Configuration](#4-srcappjs---express-central-configuration)
5. [`src/models/user.model.js` - User Schema](#5-srcmodelsusermodeljs---user-schema)
6. [`src/models/blacklist.model.js` - JWT Blacklist & TTL Index](#6-srcmodelsblacklistmodeljs---jwt-blacklist--ttl-index)
7. [`src/models/interviewReport.model.js` - Core Analysis Schema](#7-srcmodelsinterviewreportmodeljs---core-analysis-schema)
8. [`src/middlewares/auth.middleware.js` - Authentication Gatekeeper](#8-srcmiddlewaresauthmiddlewarejs---authentication-gatekeeper)
9. [`src/middlewares/file.middleware.js` - In-Memory File Uploads](#9-srcmiddlewaresfilemiddlewarejs---in-memory-file-uploads)

---

## 1. Architecture & Project Overview
- **Tech Stack**:
  - **Backend**: Node.js, Express.js 5, MongoDB (Mongoose), JWT, BcryptJS, Multer, PDF-Parse, Puppeteer, Google GenAI SDK (`@google/genai`), Zod.
  - **Frontend**: React 19, Vite, SCSS, React Router v7, Axios.
- **Core Purpose**:
  - Job Description (JD) aur candidate ke Resume (PDF) / Self Description ko analyze karna.
  - Google Gemini AI ke through strict schema-based structured output lena:
    - Match Score (0 - 100)
    - Technical Questions (Question, Intention, Model Answer)
    - Behavioral Questions (Question, Intention, Model Answer)
    - Identified Skill Gaps (Severity: High, Medium, Low)
    - Day-by-Day Preparation Plan (Day, Focus, Actionable Tasks)
  - ATS-compliant tailored HTML resume create karke Puppeteer se pixel-perfect PDF export karna.

---

## 2. `server.js` - Application Bootstrapper

### Code:
```javascript
require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Line-by-Line Key Points:
1. `require("dotenv").config()` sabse pehli line mein hona zaroori hai taaki poore system ko boot hote hi `.env` variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, etc.) mil sakein.
2. `server.js` aur `app.js` ko alag rakhna **Separation of Concerns** principle follow karta hai. Server ka kaam sirf port listen karna aur DB connect karna hai, jabki routing/middlewares `app.js` mein rehte hain.
3. Fallback port pattern: `process.env.PORT || 3000`.

### 🎯 Interview & Viva Questions from `server.js`:
- **Q1: `dotenv.config()` ko line 1 par kyun likha gaya hai?**
  - **Ans**: Agar kisi imported module (jaise database ya routes) mein environment variables use ho rahe hain aur `dotenv` baad mein call hua, to variables `undefined` aayenge aur app crash ho jayegi.
- **Q2: `server.js` aur `app.js` ko separate kyun rakhte hain?**
  - **Ans**: Testing (Supertest) ke liye aur modularity ke liye. Testing ke time bina network port open kiye `app` instance ko directly test kiya ja sakta hai.

---

## 3. `src/config/database.js` - MongoDB Connection

### Code:
```javascript
const mongoose = require("mongoose");

async function connectToDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn("⚠️  WARNING: MONGO_URI is not set in .env! Database connection skipped until configured.");
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB successfully.");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
    }
}

module.exports = connectToDB;
```

### Line-by-Line Key Points:
1. Mongoose ek **ODM (Object Data Modeling)** library hai jo MongoDB NoSQL documents ko schema aur validation deti hai.
2. `if (!uri)` check ek **Defensive Programming Guard** hai jo application ko silent crash se bachata hai agar `.env` file set na ho.
3. Asynchronous handshake `await mongoose.connect(uri)` ke through hota hai.

### 🎯 Interview & Viva Questions:
- **Q1: MongoDB NoSQL hai to Mongoose ki kya zaroorat hai?**
  - **Ans**: MongoDB schemaless hoti hai. Production apps mein data integrity, data types, validation, required fields, aur pre/post hooks enforce karne ke liye ODM (Mongoose) zaroori hota hai.
- **Q2: Database connection mein `async/await` kyun use kiya gaya?**
  - **Ans**: Database connection ek remote network I/O operation hai jisme time lagta hai. Is asynchronous operation ko handle karne ke liye `async/await` use hota hai.

---

## 4. `src/app.js` - Express Central Configuration

### Key Features:
1. `express.json()`: Request body ko parse karke `req.body` mein convert karta hai.
2. `cookieParser()`: Incoming `Cookie` headers ko parse karke `req.cookies` banata hai.
3. `cors({ credentials: true, origin: ... })`: Cross-origin security manage karta hai taaki frontend backend ke sath cookies exchange kar sake.
4. Route Mounts: `/api/auth` aur `/api/interview`.
5. Global Error Handling Middleware: `(err, req, res, next)` jisme 4 parameters hote hain.

### 🎯 Interview & Viva Questions:
- **Q1: CORS mein `credentials: true` kyun zaroori hai?**
  - **Ans**: Browser security policy by default cross-origin requests par cookies ya authorization headers share nahi karne deti. `credentials: true` backend aur frontend dono taraf configure karne par hi HTTP cookies transmit hoti hain.
- **Q2: Express Global Error Handler ko normal middleware se kaise pehchana jata hai?**
  - **Ans**: Uske function signature mein 4 arguments hote hain: `(err, req, res, next)`. Agar pehla argument `err` na ho to Express use normal middleware manta hai.

---

## 5. `src/models/user.model.js` - User Schema

### Code:
```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already taken"],
        required: true,
    },
    email: {
        type: String,
        unique: [true, "Account already exists with this email address"],
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});
```

### Line-by-Line Key Points:
1. `unique: true` MongoDB collection level par **Unique Index** banata hai duplicate records rokne ke liye.
2. Passwords database mein plain text save nahi hote; controller mein `bcryptjs.hash(password, 10)` se hash kiye jaate hain.

### 🎯 Interview & Viva Questions:
- **Q1: Schema aur Model mein kya difference hai?**
  - **Ans**: Schema document ka blueprint/structure hota hai. Model us schema par bani ek Mongoose class hoti hai jo database queries (`create`, `find`, `delete`) chalane ke methods provide karti hai.
- **Q2: Password field par validation kahan honi chahiye?**
  - **Ans**: Client level (UX ke liye) + Controller level par hashing se pehle (Security ke liye). Database mein hashed string store hoti hai.

---

## 6. `src/models/blacklist.model.js` - JWT Blacklist & TTL Index

### Code:
```javascript
const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to be added in blacklist"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // 24 hours (TTL)
    },
});
```

### Line-by-Line Key Points:
1. **The Stateless JWT Problem**: JWT stateless hota hai; logout karne ke baad bhi token expire hone tak mathematically valid rehta hai.
2. **Solution**: Logout hone par token ko `blacklistTokens` collection mein save kar dete hain.
3. **TTL (Time-To-Live) Index (`expires: 86400`)**: MongoDB ka background worker har 60 seconds mein check karta hai aur 24 ghante purane tokens ko automatically delete kar deta hai bina kisi cron job ke!

### 🎯 Interview & Viva Questions:
- **Q1: JWT logout problem kya hai aur aapne ise kaise solve kiya?**
  - **Ans**: JWT stateless hota hai to server use invalidate nahi kar sakta. Humne hybrid approach use ki — logout par token blacklist DB mein daala aur Auth middleware mein check kiya.
- **Q2: MongoDB TTL index kaise kaam karta hai?**
  - **Ans**: Date field par `expires` property set karne se MongoDB background process documents ki age check karke time poora hone par document ko auto-delete kar deta hai.

---

## 7. `src/models/interviewReport.model.js` - Core Analysis Schema

### Schema Breakdown:
- **Sub-Schemas**:
  - `technicalQuestions`: `[{ question, intention, answer }]` (`_id: false`)
  - `behavioralQuestions`: `[{ question, intention, answer }]` (`_id: false`)
  - `skillGaps`: `[{ skill, severity: ["low", "medium", "high"] }]` (`_id: false`)
  - `preparationPlan`: `[{ day, focus, tasks: [String] }]` (Has default `_id`)
- **Main Document**:
  - `jobDescription`: String (required)
  - `resume`: String (parsed raw text)
  - `selfDescription`: String
  - `matchScore`: Number (min: 0, max: 100)
  - `user`: ObjectId referencing `"users"`
  - `title`: String
  - `timestamps: true`

### 🎯 Interview & Viva Questions:
- **Q1: Questions sub-schema mein `_id: false` kyun kiya jabki preparationPlan mein nahi kiya?**
  - **Ans**: Questions aur skill gaps static read-only items hain jinhe individually update nahi karna hota, isliye space aur indexing overhead bachane ke liye `_id: false` kiya. Lekin Preparation Plan ek dynamic roadmap hai jisko future mein day-wise completion ya tracking ke liye individually update kiya ja sakta hai aur React rendering mein unique key deta hai.
- **Q2: Subdocuments vs Referenced Documents mein kya fark hai?**
  - **Ans**: Embedded subdocuments (jaise questions) parent document ke sath ek hi query mein load ho jaate hain (fast read). Referenced documents (jaise `user`) ID ke zariye alag collection se point hote hain.

---

## 8. `src/middlewares/auth.middleware.js` - Authentication Gatekeeper

### Code Highlights:
```javascript
let token = req.cookies.token;
if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
}
```
- Dual extraction: Cookie ya Authorization header dono se token accept karta hai.
- Blacklist check: `await tokenBlacklistModel.findOne({ token })`.
- Signature verify: `jwt.verify(token, process.env.JWT_SECRET)`.
- Request decoration: `req.user = decoded;` karke aage bhejta hai via `next()`.

### 🎯 Interview & Viva Questions:
- **Q1: `decoded` mein kya hota hai? Kya isme user ka password hota hai?**
  - **Ans**: Nahi, password kabhi nahi hota. `decoded` mein wahi data hota hai jo `jwt.sign()` ke payload mein dala gaya tha (jaise `id` aur `username`) plus `iat` (issued at) aur `exp` (expiry).
- **Q2: Agar user ka token expired ho to `jwt.verify` kya return karta hai?**
  - **Ans**: Wo `TokenExpiredError` throw karta hai jo `catch` block mein jakar 401 response return karta hai.

---

## 9. `src/middlewares/file.middleware.js` - In-Memory File Uploads

### Code:
```javascript
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
    },
});

module.exports = upload;
```

### Key Points:
1. `multer.memoryStorage()`: File ko disk par save karne ki jagah RAM buffer (`req.file.buffer`) mein rakhta hai.
2. Temporary disk files ka cleanup nahi karna padta.
3. Serverless (Vercel/AWS) compatible rehta hai.
4. `fileSize: 3MB` DoS attacks aur large files ko block karta hai.

### 🎯 Interview & Viva Questions:
- **Q1: DiskStorage ki jagah MemoryStorage kyun choose kiya?**
  - **Ans**: Hume file ko permanently host nahi karna, sirf text extract karke AI ko bhejna hai. Memory storage se direct RAM buffer milta hai jo I/O overhead bachata hai aur serverless platforms par read-only filesystem restrictions ko bypass karta hai.

---

## 10. `src/routes/auth.routes.js` & `src/controllers/auth.controller.js`

### API Endpoints Summary:
| Method | Endpoint | Access | Controller Method | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `registerUserController` | Creates new user, hashes password, sets cookie & returns JWT |
| `POST` | `/api/auth/login` | Public | `loginUserController` | Verifies email & bcrypt hash, returns JWT |
| `GET` | `/api/auth/logout` | Public | `logoutUserController` | Adds token to blacklist & clears HTTP-only cookie |
| `GET` | `/api/auth/get-me` | Private | `getMeController` | Fetches currently authenticated user details via `req.user.id` |

### Key Code Mechanisms:
1. **Password Hashing**: `bcrypt.hash(password, 10)` — 10 salt rounds ensure high cryptographic cost against brute force.
2. **Generic Error Messages**: Email wrong ho ya password, response is `"Invalid email or password"` to prevent User Enumeration attacks.
3. **Cookie Security Options**:
   - `httpOnly: true` (prevents XSS attacks; client JS cannot read `document.cookie`).
   - `secure: true` in production (forces HTTPS transmission).
   - `sameSite: "lax" / "none"` (guards against CSRF attacks).

### 🎯 Interview & Viva Questions:
- **Q1: Bcrypt mein Salt Rounds (Cost Factor = 10) ka kya matlab hai?**
  - **Ans**: Salt random characters hote hain jo password ke sath hash hone se pehle judte hain (Rainbow Table attacks ko fail karne ke liye). 10 rounds ka matlab hai 2^10 = 1024 hashing iterations, jo fast bhi hai aur brute-force resistance bhi deta hai.
- **Q2: `httpOnly: true` cookie lagane ka main purpose kya hai?**
  - **Ans**: Agar frontend mein koi XSS (Cross-Site Scripting) vulnerability aa jaye, to malicious JavaScript `document.cookie` se JWT token nahi chura sakti.
- **Q3: User Enumeration Attack kya hota hai aur controller ne ise kaise roka?**
  - **Ans**: Agar backend bole "Email not registered", to attacker pata laga sakta hai kaunse emails exist karte hain. Generic error message `"Invalid email or password"` dekar is attack ko roka gaya hai.

