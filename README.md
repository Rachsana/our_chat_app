# OurChat - Real-time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) using **Server-Sent Events (SSE)** for real-time communication.

## Features

### 🔐 Authentication
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Session persistence
- Logout functionality

### 💬 Messaging
- Real-time messaging using Server-Sent Events (SSE)
- Send and receive messages instantly
- Message timestamps
- Message history
- Auto-scroll to latest message
- Message read status

### 👥 Contact Management
- Add contacts by email or phone number
- Search and find users
- View contact list with online/offline status
- Contact counter
- Last seen timestamps
- Real-time online status updates

### 🎨 User Interface
- Responsive and intuitive design
- Beautiful gradient themes
- Contact list sidebar
- Chat interface with message bubbles
- Empty states with helpful messages
- Loading indicators
- Error handling with user-friendly messages

## Tech Stack

### Backend
- **Node.js** (v14+) - JavaScript runtime
- **Express.js** (v4.18+) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v7.5+) - MongoDB ODM
- **JWT** (jsonwebtoken v9.0+) - Authentication tokens
- **bcryptjs** (v2.4+) - Password hashing
- **Server-Sent Events (SSE)** - Real-time updates
- **CORS** - Cross-origin resource sharing
- **express-validator** - Input validation

### Frontend
- **React.js** (v18.2+) - UI library
- **React Router DOM** (v6.16+) - Navigation and routing
- **Axios** (v1.5+) - HTTP client
- **EventSource API** - SSE client implementation
- **CSS3** - Styling with gradients and animations

## Project Structure

```
mern-chat-app/
├── server/
│   ├── models/
│   │   ├── User.js              # User schema with email, phone, password
│   │   └── Message.js           # Message schema with sender/receiver
│   ├── routes/
│   │   ├── auth.js              # Authentication routes (register, login, logout)
│   │   └── chat.js              # Chat routes (messages, contacts, SSE stream)
│   ├── utils/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── index.js                 # Server entry point
│   ├── package.json             # Server dependencies
│   └── .env                     # Environment variables
│
├── client/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactList.js   # User list with online status
│   │   │   ├── MessageList.js   # Message display with timestamps
│   │   │   └── MessageInput.js  # Message input with send button
│   │   ├── pages/
│   │   │   ├── Login.js         # Login page with form validation
│   │   │   ├── Register.js      # Registration page
│   │   │   └── Chat.js          # Main chat interface
│   │   ├── styles/
│   │   │   ├── Auth.css         # Authentication page styles
│   │   │   └── Chat.css         # Chat interface styles
│   │   ├── utils/
│   │   │   ├── api.js           # Axios configuration and API calls
│   │   │   └── useSSE.js        # Custom React hook for SSE connection
│   │   ├── App.js               # Main app with routing
│   │   ├── App.css              # Global app styles
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global CSS reset
│   └── package.json             # Client dependencies
│
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/ourchat.git
cd ourchat
```

### Step 2: Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ourchat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a random secure string in production!

4. Start MongoDB:
```bash
# If MongoDB is installed locally
mongod
```

Or use MongoDB Atlas cloud database and update the `MONGODB_URI` in `.env`

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

If not specified, the app will use the proxy defined in `package.json`

4. Start the development server:
```bash
npm start
```

The app will open automatically at `http://localhost:3000`

## How It Works

### Real-time Communication with SSE

This application uses **Server-Sent Events (SSE)** instead of WebSockets/Socket.IO:

1. **Connection**: When a user logs in, the client establishes an SSE connection to `/api/chat/stream`
2. **Server Push**: The server keeps the connection open and pushes updates when:
   - New messages arrive from other users
   - Users come online or go offline
   - Typing indicators change (optional feature)
3. **Message Sending**: Regular HTTP POST requests to `/api/chat/messages`
4. **Auto-Reconnection**: If the connection drops, the browser automatically reconnects

**Advantages of SSE:**
- ✅ Simpler implementation using standard HTTP
- ✅ Perfect for one-way server-to-client communication
- ✅ Built-in automatic reconnection in browsers
- ✅ No additional WebSocket library needed
- ✅ Works seamlessly through firewalls and proxies
- ✅ Lower overhead and easier to maintain
- ✅ Native browser support with EventSource API

### Authentication Flow

1. User registers with username, email, phone, and password
2. Password is hashed using bcryptjs (10 salt rounds)
3. JWT token is generated with 7-day expiry
4. Token is stored in localStorage
5. Token is sent with every request in the Authorization header
6. Server validates token using middleware

### Contact Discovery

Users can add contacts in two ways:

**1. By Email:**
```
Example: david@example.com
```

**2. By Phone Number:**
```
Examples: 
- +1234567890
- 1234567890
- (123) 456-7890
```

The system validates the format and searches the database for matching users.

### Message Flow

1. User types a message in the input field
2. Client sends POST request to `/api/chat/messages`
3. Server saves message to MongoDB
4. Server identifies the recipient's SSE connection
5. Server pushes message through SSE to recipient
6. Both sender and receiver see the message instantly
7. Message status updates to "read" when viewed

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/users` | Get all users (for contacts) | Yes |
| POST | `/api/chat/messages` | Send a message | Yes |
| GET | `/api/chat/messages/:userId` | Get messages with specific user | Yes |
| GET | `/api/chat/unread` | Get unread message counts | Yes |
| GET | `/api/chat/stream` | SSE endpoint for real-time updates | Yes |
| POST | `/api/chat/typing` | Send typing indicator | Yes |

### Request/Response Examples

**Register User:**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "default-avatar.png"
  }
}
```

**Send Message:**
```json
POST /api/chat/messages
Headers: { "Authorization": "Bearer <token>" }
{
  "receiverId": "507f1f77bcf86cd799439012",
  "content": "Hello! How are you?"
}

Response:
{
  "id": "507f1f77bcf86cd799439013",
  "sender": { "id": "...", "username": "john_doe" },
  "receiver": { "id": "...", "username": "jane_doe" },
  "content": "Hello! How are you?",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "read": false
}
```

## Environment Variables

### Server Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ourchat` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Client Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Database Schema

### User Model
```javascript
{
  username: String (required, unique, min 3 chars),
  email: String (required, unique, lowercase),
  phone: String (required, unique),
  password: String (required, hashed, min 6 chars),
  avatar: String (default: 'default-avatar.png'),
  online: Boolean (default: false),
  lastSeen: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Message Model
```javascript
{
  sender: ObjectId (ref: 'User', required),
  receiver: ObjectId (ref: 'User', required),
  content: String (required),
  read: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Usage Guide

### For Users

1. **Registration:**
   - Navigate to the registration page
   - Enter username, email, phone, and password
   - Click "Register" to create your account
   - You'll be automatically logged in

2. **Login:**
   - Enter your email and password
   - Click "Login" to access your account
   - Your session persists until logout

3. **Adding Contacts:**
   - Click "+ Add Contact" button
   - Enter email (e.g., `david@example.com`) or phone (e.g., `+1234567890`)
   - Click "Search" to find the user
   - Click "Add to Contacts" to add them
   - Start chatting immediately!

4. **Sending Messages:**
   - Select a contact from the sidebar
   - Type your message in the input field
   - Press Enter or click "Send"
   - Watch for real-time responses

5. **Logout:**
   - Click "Logout" button in the header
   - You'll be redirected to the login page

## Testing the Application

### Test Accounts (Demo Data)

You can test with these example contacts:

| Name | Email | Phone | Status |
|------|-------|-------|--------|
| Alice | alice@example.com | +1234567890 | Online |
| Bob | bob@example.com | +1234567891 | Online |
| Charlie | charlie@example.com | +1234567892 | Offline |
| David | david@example.com | +1234567893 | Online |
| Emma | emma@example.com | +1234567894 | Offline |
| Frank | frank@example.com | +1234567895 | Online |
| Grace | grace@example.com | +1234567896 | Online |

### Testing Workflow

1. **Create Two Accounts:**
   ```
   Account 1: user1@test.com / password123
   Account 2: user2@test.com / password123
   ```

2. **Add Contact:**
   - Login as user1
   - Add contact using user2@test.com
   - Send a message

3. **Test Real-time:**
   - Open another browser/incognito window
   - Login as user2
   - Check if you received the message
   - Reply and see real-time update

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Start MongoDB
mongod

# Or check if it's running
mongo
```

**2. Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process or change the port:
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
PORT=5001
```

**3. JWT Token Invalid:**
```
Error: Invalid token
```
**Solution:** Clear localStorage and login again:
```javascript
// In browser console
localStorage.clear();
```

**4. CORS Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Make sure CORS is configured in server/index.js:
```javascript
app.use(cors());
```

**5. SSE Connection Fails:**
```
EventSource's response has a MIME type that is not text/event-stream
```
**Solution:** Check that the SSE endpoint sets proper headers:
```javascript
res.setHeader('Content-Type', 'text/event-stream');
```

## Deployment

### Deploy to Heroku

1. **Backend:**
```bash
cd server
heroku create ourchat-api
heroku addons:create mongolab
git push heroku main
```

2. **Frontend:**
```bash
cd client
# Update API URL in .env
REACT_APP_API_URL=https://ourchat-api.herokuapp.com/api
npm run build
# Deploy to Netlify, Vercel, or Heroku
```

### Deploy to Vercel/Netlify

1. Build the client:
```bash
cd client
npm run build
```

2. Deploy the `build` folder to Vercel or Netlify

3. Update environment variables in the hosting platform

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Environment variable configuration

⚠️ **Recommended for Production:**
- Enable HTTPS/SSL
- Implement rate limiting
- Add CSRF protection
- Set secure HTTP headers (helmet.js)
- Use MongoDB Atlas with authentication
- Implement password reset functionality
- Add two-factor authentication
- Log security events
- Implement message encryption

## Future Enhancements

Planned features for future versions:

- [ ] Group chat functionality
- [ ] File and image sharing
- [ ] Voice messages
- [ ] Video calling
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] User profile customization
- [ ] Avatar upload
- [ ] Message search
- [ ] Push notifications
- [ ] Message deletion
- [ ] Message editing
- [ ] Emoji picker
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] End-to-end encryption
- [ ] Message reactions
- [ ] Status updates
- [ ] Backup and export chat history

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or suggestions:

- Open an issue on GitHub
- Email: support@ourchat.com
- Documentation: https://ourchat.com/docs

## Acknowledgments

- Inspired by modern chat applications like WhatsApp and Telegram
- Built with the MERN stack
- Uses Server-Sent Events for real-time communication
- UI design inspired by Material Design principles

## Credits

Developed by [Your Name]

## Version History

- **v1.0.0** (2024-01-15)
  - Initial release
  - Basic chat functionality
  - User authentication
  - Contact management
  - Real-time messaging with SSE

---

