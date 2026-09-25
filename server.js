const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const MENU_FILE = path.join(__dirname, 'menu.json');
const OFFERS_FILE = path.join(__dirname, 'offers.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const readJSON = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

if (!fs.existsSync(USERS_FILE)) {
    writeJSON(USERS_FILE, [
        { name: 'مدير المطعم', email: 'admin@kazamix.com', password: 'admin123', role: 'admin' }
    ]);
}
if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);
if (!fs.existsSync(REVIEWS_FILE)) {
    writeJSON(REVIEWS_FILE, [
        { id: 1, name: 'أحمد محمود', rating: 5, comment: 'أحلى دابل سماش كلته في حياتي.' },
        { id: 2, name: 'كريم الشريف', rating: 5, comment: 'الصوصات بتاعتهم تحفة والبطاطس.' }
    ]);
}
if (!fs.existsSync(MENU_FILE)) {
    writeJSON(MENU_FILE, [
        { id: 1, name: 'دابل سماش برجر', price: 160, desc: 'قطعتين لحم بقرى طازج، جبنة أمريكي مزدوجة، صوص كرافت.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' }
    ]);
}
if (!fs.existsSync(OFFERS_FILE)) {
    writeJSON(OFFERS_FILE, [
        { id: 1, title: 'عرض العيلة الحصري', price: 299, desc: '٣ سندوتش برجر مشوي + طبق بطاطس كبير مع صوصات.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', badge: 'وفر 30%' }
    ]);
}
if (!fs.existsSync(SETTINGS_FILE)) {
    writeJSON(SETTINGS_FILE, { pdfUrl: '#' });
}

// Auth API
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    let users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم مسبقاً!' });
    }
    const newUser = { name, email, password, role: 'customer' };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح!', user: { name, email, role: 'customer' } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    let users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة!' });
    }
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح!', user: { name: user.name, email: user.email, role: user.role } });
});

// Orders API
app.post('/api/orders', (req, res) => {
    const order = req.body;
    order.orderId = 'KM-' + Math.floor(1000 + Math.random() * 9000);
    order.date = new Date().toLocaleString('ar-EG');
    order.status = 'قيد التجهيز';

    let orders = readJSON(ORDERS_FILE);
    orders.push(order);
    writeJSON(ORDERS_FILE, orders);

    res.json({ success: true, orderId: order.orderId });
});

app.get('/api/orders', (req, res) => res.json(readJSON(ORDERS_FILE)));

app.put('/api/orders/:orderId/status', (req, res) => {
    const orderId = decodeURIComponent(req.params.orderId).trim();
    const { status } = req.body;
    let orders = readJSON(ORDERS_FILE);
    const order = orders.find(o => o.orderId.toString().trim() === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود!' });

    order.status = status;
    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, message: 'تم تحديث الحالة بنجاح!' });
});

app.delete('/api/orders/:orderId', (req, res) => {
    const orderId = decodeURIComponent(req.params.orderId).trim();
    let orders = readJSON(ORDERS_FILE);
    orders = orders.filter(o => o.orderId.toString().trim() !== orderId);
    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, message: 'تم حذف الطلب بنجاح!' });
});

app.get('/api/track-orders', (req, res) => {
    const { phone } = req.query;
    let orders = readJSON(ORDERS_FILE);
    if (!phone) return res.json([]);
    res.json(orders.filter(o => o.customerPhone === phone));
});

// Menu, Offers & Settings API
app.get('/api/menu', (req, res) => res.json(readJSON(MENU_FILE)));
app.post('/api/menu', (req, res) => {
    const { name, price, desc, img } = req.body;
    let menu = readJSON(MENU_FILE);
    menu.push({ id: Date.now(), name, price: parseFloat(price), desc, img: img || 'https://images.unsplash.com/photo-1568901346375' });
    writeJSON(MENU_FILE, menu);
    res.json({ success: true, message: 'تمت الإضافة بنجاح!' });
});
app.delete('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id);
    writeJSON(MENU_FILE, readJSON(MENU_FILE).filter(m => m.id !== id));
    res.json({ success: true, message: 'تم الحذف!' });
});

app.get('/api/offers', (req, res) => res.json(readJSON(OFFERS_FILE)));
app.post('/api/offers', (req, res) => {
    const { title, price, desc, img, badge } = req.body;
    let offers = readJSON(OFFERS_FILE);
    offers.push({ id: Date.now(), title, price: parseFloat(price), desc, img: img || 'https://images.unsplash.com/photo-1568901346375', badge: badge || 'عرض خاص' });
    writeJSON(OFFERS_FILE, offers);
    res.json({ success: true, message: 'تم إضافة العرض!' });
});
app.delete('/api/offers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    writeJSON(OFFERS_FILE, readJSON(OFFERS_FILE).filter(o => o.id !== id));
    res.json({ success: true, message: 'تم الحذف!' });
});

app.get('/api/settings', (req, res) => res.json(readJSON(SETTINGS_FILE)));
app.post('/api/settings/pdf', (req, res) => {
    const { pdfUrl } = req.body;
    let settings = readJSON(SETTINGS_FILE);
    settings.pdfUrl = pdfUrl;
    writeJSON(SETTINGS_FILE, settings);
    res.json({ success: true, message: 'تم حفظ رابط المنيو PDF!' });
});

app.listen(PORT, () => console.log(`🚀 Kaza Mix Backend running on port ${PORT}`));