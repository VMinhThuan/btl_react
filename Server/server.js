const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 7979;

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Thay bằng mật khẩu MySQL của bạn
  database: 'food_ordering_system', // Tên cơ sở dữ liệu MySQL
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
  } else {
    console.log('Đã kết nối tới MySQL!');
  }
});

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/food_ordering_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Đã kết nối MongoDB!');
}).catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Định nghĩa mô hình MongoDB
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone_number: String,
  password: String,
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  type: String,
  rating: Number,
  tags: [String],
  image_path: String,
  address: String,
});

const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Middleware
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// API: Đồng bộ dữ liệu từ MySQL sang MongoDB
app.get('/sync-restaurants', (req, res) => {
  db.query('SELECT * FROM restaurants', async (err, results) => {
    if (err) {
      return res.status(500).send('Lỗi khi lấy dữ liệu từ MySQL.');
    }

    for (const item of results) {
      const existingRestaurant = await Restaurant.findOne({ name: item.name });
      if (!existingRestaurant) {
        const newRestaurant = new Restaurant({
          name: item.name,
          type: item.type,
          rating: item.rating,
          tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
          image_path: item.image_path,
          address: item.address,
        });

        await newRestaurant.save();
        console.log(`Đã đồng bộ nhà hàng: ${item.name}`);
      }
    }

    res.status(200).send('Hoàn thành đồng bộ dữ liệu nhà hàng!');
  });
});

// API: Lấy danh sách nhà hàng từ MongoDB
app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách nhà hàng từ MongoDB.');
  }
});

// API: Đăng ký người dùng
app.post('/register', async (req, res) => {
  const { name, email, phone_number, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Các trường bắt buộc không được để trống.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu người dùng vào MongoDB
    const newUser = new User({ name, email, phone_number, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tạo tài khoản.' });
  }
});

// API: Đăng nhập người dùng
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    res.status(200).json({ message: 'Đăng nhập thành công!', user_id: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi đăng nhập.' });
  }
});

// API: Lấy danh sách người dùng từ MongoDB
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách người dùng từ MongoDB.');
  }
});

// API: Đồng bộ người dùng từ MySQL sang MongoDB
app.get('/sync-users', (req, res) => {
  db.query('SELECT * FROM Users', async (err, results) => {
    if (err) {
      return res.status(500).send('Lỗi khi lấy dữ liệu từ MySQL.');
    }

    for (const user of results) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          password: user.password,
        });

        await newUser.save();
        console.log(`Đã đồng bộ người dùng: ${user.name}`);
      }
    }

    res.status(200).send('Hoàn thành đồng bộ dữ liệu người dùng!');
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
