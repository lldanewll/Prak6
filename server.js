const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const port = 3000;

// Настройка кэша
const cache = new NodeCache({ stdTTL: 60 }); // TTL 60 секунд

// Настройка сессий
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Хранение пользователей (в реальном приложении использовать базу данных)
const users = new Map();

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Роуты
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (users.has(username)) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(username, { password: hashedPassword });
    
    res.status(201).json({ message: 'Регистрация успешна' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    req.session.userId = username;
    res.json({ message: 'Вход выполнен успешно' });
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Выход выполнен успешно' });
});

app.get('/data', (req, res) => {
    const cachedData = cache.get('data');
    
    if (cachedData) {
        return res.json(cachedData);
    }

    // Генерация новых данных
    const newData = {
        timestamp: new Date().toISOString(),
        value: Math.random()
    };

    cache.set('data', newData);
    res.json(newData);
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
}); 