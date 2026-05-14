# 🎬 AveragezXD - Roblox Animator Portfolio

A premium, fully-featured portfolio website for Roblox animators with a beautiful UI, smooth animations, and an in-depth admin panel for managing projects.

## ✨ Features

### Public Portfolio
- **Hero Section** - Captivating introduction with smooth animations
- **About Section** - Professional bio with skills showcase
- **Projects Gallery** - Interactive project display with filtering
- **Contact Section** - Discord contact information
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Fluid UI transitions and effects

### Admin Panel
- **Project Management**
  - Create, edit, and delete projects
  - Upload custom thumbnails
  - Categorize projects
  - Track view counts
- **Settings Management**
  - Update Discord username
  - Change admin password
  - Theme preferences
- **Dashboard Statistics**
  - Total projects count
  - Total views
  - Category count
- **Secure Authentication**
  - Password-protected access
  - Session management
  - Password hashing with bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/AveragezXD/portfolio.git
cd portfolio
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```bash
cp .env.example .env
```

4. Update the `.env` file with your settings
```
PORT=3000
ADMIN_PASSWORD=your_secure_password_here
NODE_ENV=development
```

5. Start the server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── css/
│   │   ├── style.css       # Main portfolio styles
│   │   └── admin.css       # Admin panel styles
│   └── js/
│       ├── portfolio.js    # Portfolio functionality
│       ├── admin.js        # Admin panel functionality
│       └── theme.js        # Theme switching
├── views/
│   ├── index.ejs           # Main portfolio page
│   └── admin/
│       ├── login.ejs       # Admin login page
│       └── dashboard.ejs   # Admin dashboard
├── data/
│   ├── projects.json       # Projects database
│   └── settings.json       # Settings database
├── uploads/                # Project thumbnail uploads
├── server.js               # Main server file
├── package.json
└── README.md
```

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Enter your admin password (default: `admin123` or set in `.env`)
3. Access the dashboard to manage your portfolio

## 🎨 Customization

### Colors
Edit the CSS variables in `public/css/style.css` and `public/css/admin.css`:

```css
:root {
  --primary: #00d4ff;
  --secondary: #0099cc;
  --accent: #ff006e;
  --dark-bg: #0a0e27;
  /* ... */
}
```

### Content
Edit `views/index.ejs` to customize portfolio content and information.

## 📱 Responsive

The portfolio is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔒 Security

- Password hashing with bcryptjs
- Session-based authentication
- Secure file uploads
- Environment variable protection

## 📦 Dependencies

- **express** - Web framework
- **express-session** - Session management
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **ejs** - Template engine
- **dotenv** - Environment variables
- **uuid** - Unique ID generation

## 🤝 Contributing

Feel free to fork and customize this portfolio for your own use!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**AveragezXD** - Roblox Animator
- Discord: averageishere

---

**Made with ❤️ for Roblox animators**
