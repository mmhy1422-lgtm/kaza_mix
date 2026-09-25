const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// إعدادات استقبال البيانات بصيغة JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. تفعيل قراءة الملفات الثابتة (HTML, CSS, JS, الصور) من مجلد المشروع الرئيسي
app.use(express.static(__dirname));

// 2. توجيه الصفحة الرئيسية لفتح index.html تلقائياً
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// توجيه لوحة التحكم لو موجودة
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- مسارات الـ API (المنيو والطلبات باستخدام ملفات الـ JSON) ---
const menuFilePath = path.join(__dirname, 'menu.json');
const ordersFilePath = path.join(__dirname, 'orders.json');

// جلب قائمة المنيو
app.get('/api/menu', (req, res) => {
    fs.readFile(menuFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'عفواً، لا يمكن قراءة ملف المنيو' });
        }
        try {
            res.json(JSON.parse(data || '[]'));
        } catch (e) {
            res.json([]);
        }
    });
});

// جلب الطلبات
app.get('/api/orders', (req, res) => {
    fs.readFile(ordersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'عفواً، لا يمكن قراءة ملف الطلبات' });
        }
        try {
            res.json(JSON.parse(data || '[]'));
        } catch (e) {
            res.json([]);
        }
    });
});

// إضافة طلب جديد
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    fs.readFile(ordersFilePath, 'utf8', (err, data) => {
        let orders = [];
        if (!err && data) {
            try {
                orders = JSON.parse(data);
            } catch (e) {
                orders = [];
            }
        }
        orders.push({ id: Date.now(), ...newOrder, date: new Date() });
        
        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'فشل حفظ الطلب' });
            }
            res.json({ success: true, message: 'تم إرسال الطلب بنجاح' });
        });
    });
});

// ---------------------------------------------------
// التشغيل المحلي وفي نفس الوقت متوافق مع Vercel Serverless
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// السطر الأهم لتشغيل التطبيق على Vercel
module.exports = app;