let cart = [];
let currentUser = JSON.parse(localStorage.getItem('kazamix_user')) || null;

window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadDynamicMenu();
    loadDynamicOffers();
    setupActiveNavHighlight();
    setupScrollHideActions();
    checkActiveOrdersPulse();
});

// إخفاء الأزرار الإضافية عند التمرير وإبقاء الناف بار والسلة
function setupScrollHideActions() {
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const collapsible = document.getElementById('collapsible-actions');
        if (!collapsible) return;
        if (scrollTop > 40) {
            collapsible.classList.add('opacity-0', 'pointer-events-none', 'max-w-0', 'overflow-hidden');
        } else {
            collapsible.classList.remove('opacity-0', 'pointer-events-none', 'max-w-0', 'overflow-hidden');
        }
    });
}

function showCustomToast(title, msg) {
    const toast = document.getElementById('custom-toast');
    if (!toast) return;
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3500);
}

function updateAuthUI() {
    const btnText = document.getElementById('auth-btn-text');
    const adminContainer = document.getElementById('admin-btn-container');
    if (currentUser) {
        if (btnText) btnText.innerText = currentUser.name.split(' ')[0] + (currentUser.role === 'admin' ? ' (أدمن)' : '');
        if (currentUser.role === 'admin' && adminContainer) {
            adminContainer.innerHTML = `<a href="admin.html" class="glass-nav px-3 py-2 rounded-full font-black text-xs text-amber-400 border border-amber-500/50 flex items-center gap-1 shadow-xl"><i class="fa-solid fa-gauge-high"></i><span>لوحة التحكم</span></a>`;
        }
    } else {
        if (btnText) btnText.innerText = 'دخول';
        if (adminContainer) adminContainer.innerHTML = '';
    }
}

function openAuthModal() {
    if (currentUser) {
        if (confirm(`أهلاً بك يا ${currentUser.name}.\nهل تريد تسجيل الخروج؟`)) {
            localStorage.removeItem('kazamix_user');
            currentUser = null;
            updateAuthUI();
            showCustomToast("تم بنجاح", "تم تسجيل الخروج");
        }
        return;
    }
    document.getElementById('auth-modal').classList.remove('hidden');
}
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }

let isRegisterMode = false;
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('name-field').classList.toggle('hidden');
    document.getElementById('auth-submit-btn').innerText = isRegisterMode ? 'إنشاء الحساب' : 'تسجيل الدخول';
}

async function handleAuthSubmit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const name = document.getElementById('auth-name').value.trim();

    if (!email || !password || (isRegisterMode && !name)) { showCustomToast("تنبيه", "املأ جميع الحقول!"); return; }

    const endpoint = isRegisterMode ? '/api/signup' : '/api/login';
    const payload = isRegisterMode ? { name, email, password } : { email, password };

    try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('kazamix_user', JSON.stringify(currentUser));
            updateAuthUI();
            closeAuthModal();
            showCustomToast("نجاح", result.message);
            if (currentUser.role === 'admin') window.location.href = 'admin.html';
        } else { showCustomToast("خطأ", result.message); }
    } catch (e) { showCustomToast("خطأ", "تعذر الاتصال بالسيرفر"); }
}

async function loadDynamicOffers() {
    try {
        const res = await fetch('http://localhost:3000/api/offers');
        const offers = await res.json();
        const grid = document.getElementById('offers-grid');
        if (!grid) return;
        grid.innerHTML = '';
        offers.forEach(offer => {
            grid.innerHTML += `
                <div onclick="openProductModal('${offer.title}', ${offer.price}, '${offer.desc}', '${offer.img}')" class="cursor-pointer glass-nav rounded-3xl overflow-hidden flex flex-col justify-between group p-3">
                    <div class="h-44 overflow-hidden rounded-2xl relative">
                        <img src="${offer.img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <span class="absolute top-2 right-2 bg-amber-500 text-zinc-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full">${offer.badge}</span>
                    </div>
                    <div class="p-4 space-y-2">
                        <h3 class="text-base font-bold text-white group-hover:text-amber-400 transition">${offer.title}</h3>
                        <p class="text-zinc-400 text-xs line-clamp-2">${offer.desc}</p>
                    </div>
                    <div class="p-4 pt-0 flex items-center justify-between">
                        <span class="text-lg font-black text-amber-400">${offer.price} ج.م</span>
                        <span class="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl font-bold">التفاصيل</span>
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

async function loadDynamicMenu() {
    try {
        const res = await fetch('http://localhost:3000/api/menu');
        const items = await res.json();
        const grid = document.getElementById('menu-grid');
        if (!grid) return;
        grid.innerHTML = '';
        items.forEach((item, index) => {
            grid.innerHTML += `
                <div onclick="openProductModal('${item.name}', ${item.price}, '${item.desc}', '${item.img}')" class="cursor-pointer glass-nav rounded-3xl overflow-hidden flex flex-col justify-between group p-3">
                    <div class="h-44 overflow-hidden rounded-2xl relative">
                        <img src="${item.img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    </div>
                    <div class="p-4 space-y-2">
                        <h3 class="text-base font-bold text-white group-hover:text-amber-400 transition">${index + 1}. ${item.name}</h3>
                        <p class="text-zinc-400 text-xs line-clamp-2">${item.desc}</p>
                    </div>
                    <div class="p-4 pt-0 flex items-center justify-between">
                        <span class="text-lg font-black text-amber-400">${item.price} ج.م</span>
                        <span class="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl font-bold">التفاصيل</span>
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

let currentProduct = null;
function openProductModal(name, price, desc, img) {
    currentProduct = { name, price, desc, img };
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-base-price').innerText = price + ' ج.م';
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal-img').src = img;
    document.querySelectorAll('input[name="addon"]').forEach(cb => cb.checked = false);
    calculateModalTotal();
    document.getElementById('product-modal').classList.remove('hidden');
}
function closeProductModal() { document.getElementById('product-modal').classList.add('hidden'); }

function calculateModalTotal() {
    let total = currentProduct.price;
    document.querySelectorAll('input[name="addon"]:checked').forEach(cb => total += parseInt(cb.dataset.price));
    document.getElementById('modal-total-price').innerText = total + ' ج.م';
}

function addModalItemToCart() {
    let addons = [];
    let extraPrice = 0;
    document.querySelectorAll('input[name="addon"]:checked').forEach(cb => {
        addons.push(cb.value);
        extraPrice += parseInt(cb.dataset.price);
    });
    cart.push({ name: currentProduct.name, price: currentProduct.price + extraPrice, addons });
    updateCart();
    closeProductModal();
    showCustomToast("تمت الإضافة", `تمت إضافة ${currentProduct.name} للسلة`);
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('-translate-x-full');
    document.getElementById('cart-overlay').classList.toggle('hidden');
}

// تحديث السلة وإضاءة وتكبير الزر عند وجود منتجات
function updateCart() {
    const badge = document.getElementById('cart-badge');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const cartBtn = document.getElementById('cart-btn');

    badge.innerText = cart.length;

    if (cart.length > 0) {
        cartBtn.classList.add('scale-125', 'animate-pulse', 'ring-4', 'ring-amber-500', 'bg-amber-500/20');
    } else {
        cartBtn.classList.remove('scale-125', 'animate-pulse', 'ring-4', 'ring-amber-500', 'bg-amber-500/20');
    }

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-center py-8">السلة فارغة حالياً</p>';
        totalEl.innerText = '٠ ج.م';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs">
                <div><h5 class="font-bold text-white">${item.name}</h5><span class="text-amber-400 font-bold">${item.price} ج.م</span></div>
                <button onclick="cart.splice(${index}, 1); updateCart();" class="text-red-400 cursor-pointer"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    totalEl.innerText = total + ' ج.م';
}

function checkout() {
    if (cart.length === 0) { showCustomToast("تنبيه", "السلة فارغة!"); return; }
    document.getElementById('checkout-modal').classList.remove('hidden');
    document.getElementById('checkout-total-price').innerText = cart.reduce((s, i) => s + i.price, 0) + ' ج.م';
    if (currentUser) document.getElementById('checkout-name').value = currentUser.name || '';
    toggleCart();
}
function closeCheckoutModal() { document.getElementById('checkout-modal').classList.add('hidden'); }

function togglePaymentFields(type) {
    document.getElementById('visa-details').classList.toggle('hidden', type !== 'visa');
    document.getElementById('wallet-details').classList.toggle('hidden', type !== 'wallet');
    document.getElementById('visa-radio').checked = (type === 'visa');
    document.getElementById('wallet-radio').checked = (type === 'wallet');
}

async function submitOrder() {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const paymentType = document.querySelector('input[name="payment"]:checked').value;

    if (!name || !phone || !address) { showCustomToast("خطأ", "أدخل بيانات التوصيل ورقم الهاتف كاملة!"); return; }
    const totalAmount = cart.reduce((s, i) => s + i.price, 0);

    try {
        const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName: name, customerPhone: phone, customerAddress: address, paymentType, items: cart, totalAmount })
        });
        const result = await res.json();
        if (result.success) {
            localStorage.setItem('kazamix_phone', phone);
            document.getElementById('success-order-id').innerText = result.orderId;
            closeCheckoutModal();
            document.getElementById('success-modal').classList.remove('hidden');
            cart = [];
            updateCart();
            checkActiveOrdersPulse();
        }
    } catch (e) { showCustomToast("خطأ", "خطأ في إرسال الطلب"); }
}

function closeSuccessModalAndGoHome() { document.getElementById('success-modal').classList.add('hidden'); }
function openTrackingModal() { 
    document.getElementById('tracking-modal').classList.remove('hidden'); 
    const savedPhone = localStorage.getItem('kazamix_phone');
    if (savedPhone) {
        document.getElementById('track-phone-input').value = savedPhone;
        searchMyOrders();
    }
}
function closeTrackingModal() { document.getElementById('tracking-modal').classList.add('hidden'); }

async function checkActiveOrdersPulse() {
    const phone = localStorage.getItem('kazamix_phone');
    const trackingBtn = document.getElementById('tracking-btn');
    if (!phone || !trackingBtn) return;

    try {
        const res = await fetch(`http://localhost:3000/api/track-orders?phone=${phone}`);
        const orders = await res.json();
        const hasActive = orders.some(o => o.status !== 'تم التوصيل');
        
        if (hasActive) {
            trackingBtn.classList.add('scale-125', 'animate-pulse', 'ring-4', 'ring-emerald-500', 'bg-emerald-500/20');
        } else {
            trackingBtn.classList.remove('scale-125', 'animate-pulse', 'ring-4', 'ring-emerald-500', 'bg-emerald-500/20');
        }
    } catch (e) { console.error(e); }
}

async function searchMyOrders() {
    const phone = document.getElementById('track-phone-input').value.trim();
    if (!phone) { showCustomToast("تنبيه", "أدخل رقم الهاتف"); return; }
    localStorage.setItem('kazamix_phone', phone);
    const container = document.getElementById('tracking-results');
    try {
        const res = await fetch(`http://localhost:3000/api/track-orders?phone=${phone}`);
        const orders = await res.json();
        checkActiveOrdersPulse();

        if (orders.length === 0) { container.innerHTML = '<p class="text-center text-zinc-500 text-xs py-4">لا توجد طلبات لهذا الرقم</p>'; return; }
        
        container.innerHTML = '';
        orders.reverse().forEach(order => {
            let statusColor = order.status === 'تم التوصيل' ? 'text-emerald-400' : 'text-amber-400';
            container.innerHTML += `
                <div class="glass-nav p-4 space-y-2 text-xs rounded-2xl border border-zinc-800">
                    <div class="flex justify-between font-bold"><span class="text-amber-400">${order.orderId}</span><span class="${statusColor} font-black">${order.status}</span></div>
                    <div class="flex justify-between text-zinc-300"><span>الإجمالي: <strong class="text-white">${order.totalAmount} ج.م</strong></span><span>${order.date}</span></div>
                </div>
            `;
        });
    } catch (e) { showCustomToast("خطأ", "خطأ في البحث"); }
}

async function triggerDownload() {
    try {
        const res = await fetch('http://localhost:3000/api/settings');
        const settings = await res.json();
        if (settings.pdfUrl && settings.pdfUrl !== '#') {
            window.open(settings.pdfUrl, '_blank');
        } else {
            showCustomToast("تنبيه", "لم تقم الإدارة بإدراج رابط المنيو PDF بعد.");
        }
    } catch (e) { showCustomToast("خطأ", "تعذر التحميل"); }
}

function setupActiveNavHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) { current = section.getAttribute('id'); }
        });
        navLinks.forEach(link => {
            link.classList.remove('text-amber-400', 'bg-zinc-800/80');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-amber-400', 'bg-zinc-800/80');
            }
        });
    });
}