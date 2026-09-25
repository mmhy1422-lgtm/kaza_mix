let cart = [];
let currentUser = JSON.parse(localStorage.getItem('kazamix_user')) || null;

window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadDynamicMenu();
    loadDynamicOffers();
    loadDynamicReviews();
});

function updateAuthUI() {
    const btnText = document.getElementById('auth-btn-text');
    const adminContainer = document.getElementById('admin-btn-container');
    
    if (currentUser) {
        btnText.innerText = currentUser.name.split(' ')[0] + (currentUser.role === 'admin' ? ' (أدمن)' : '');
        
        if (currentUser.role === 'admin' && adminContainer) {
            adminContainer.innerHTML = `
                <a href="admin.html" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 px-4 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-xl transition cursor-pointer shrink-0 animate-pulse">
                    <i class="fa-solid fa-gauge-high"></i><span>لوحة التحكم</span>
                </a>
            `;
        } else if (adminContainer) {
            adminContainer.innerHTML = '';
        }
    } else {
        btnText.innerText = 'دخول';
        if (adminContainer) adminContainer.innerHTML = '';
    }
}

function openAuthModal() {
    if (currentUser) {
        if (confirm(`أهلاً بك يا ${currentUser.name}.\nهل تريد تسجيل الخروج؟`)) {
            localStorage.removeItem('kazamix_user');
            currentUser = null;
            updateAuthUI();
            showToast("تم تسجيل الخروج بنجاح", "مع السلامة");
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

    if (!email || !password || (isRegisterMode && !name)) {
        alert("املأ جميع الحقول المطلوبة!");
        return;
    }

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
            showToast(result.message, "نجاح");
            if (currentUser.role === 'admin') window.location.href = 'admin.html';
        } else {
            alert(result.message);
        }
    } catch (e) {
        alert("خطأ في الاتصال بالسيرفر");
    }
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
                <div onclick="openProductModal('${offer.title}', ${offer.price}, '${offer.desc}', '${offer.img}')" class="cursor-pointer relative rounded-xl sm:rounded-3xl overflow-hidden border border-zinc-700/60 shadow-xl group bg-zinc-900/50 hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div class="h-28 sm:h-60 overflow-hidden relative">
                            <img src="${offer.img}" alt="عرض" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                            <span class="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-black text-[9px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">${offer.badge}</span>
                        </div>
                        <div class="p-2.5 sm:p-6 space-y-1 sm:space-y-2">
                            <h3 class="text-white font-black text-xs sm:text-xl">${offer.title}</h3>
                            <p class="text-zinc-300 text-[11px] sm:text-sm">${offer.desc}</p>
                        </div>
                    </div>
                    <div class="p-2.5 sm:p-6 pt-0 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span class="text-xs sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">${offer.price} ج.م</span>
                        <span class="text-xs bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl font-bold">التفاصيل</span>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("خطأ في جلب العروض");
    }
}

async function loadDynamicMenu() {
    try {
        const res = await fetch('http://localhost:3000/api/menu');
        const items = await res.json();
    } catch (e) {
        console.error(e);
    }
}

async function loadDynamicReviews() {
    try {
        const res = await fetch('http://localhost:3000/api/reviews');
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

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0');
    document.getElementById('modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function calculateModalTotal() {
    if (!currentProduct) return;
    let total = currentProduct.price;
    document.querySelectorAll('input[name="addon"]:checked').forEach(cb => {
        total += parseInt(cb.dataset.price);
    });
    document.getElementById('modal-total-price').innerText = total + ' ج.م';
}

function addModalItemToCart() {
    let addons = [];
    let extraPrice = 0;
    document.querySelectorAll('input[name="addon"]:checked').forEach(cb => {
        addons.push(cb.value);
        extraPrice += parseInt(cb.dataset.price);
    });

    let finalPrice = currentProduct.price + extraPrice;
    cart.push({
        name: currentProduct.name,
        price: finalPrice,
        addons: addons
    });

    updateCart();
    closeProductModal();
    showToast(`تمت إضافة "${currentProduct.name}" إلى السلة`, "إضافة ناجحة");
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function updateCart() {
    const badge = document.getElementById('cart-badge');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    badge.innerText = cart.length;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-center py-8">السلة فارغة حالياً</p>';
        totalEl.innerText = '٠ ج.م';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        let addonsText = item.addons.length > 0 ? `<span class="text-[10px] text-amber-400 block">إضافات: ${item.addons.join(', ')}</span>` : '';
        container.innerHTML += `
            <div class="flex justify-between items-center bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800 text-xs">
                <div class="space-y-1">
                    <h5 class="font-bold text-white text-sm">${item.name}</h5>
                    ${addonsText}
                    <span class="text-amber-400 font-extrabold">${item.price} ج.م</span>
                </div>
                <button onclick="cart.splice(${index}, 1); updateCart();" class="text-red-400 hover:text-red-300 p-2 cursor-pointer"><i class="fa-solid fa-trash text-sm"></i></button>
            </div>
        `;
    });
    totalEl.innerText = total + ' ج.م';
}

function checkout() {
    if (cart.length === 0) {
        alert("السلة فارغة، أضف وجبات أولاً!");
        return;
    }
    toggleCart();
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('hidden');
    document.getElementById('checkout-total-price').innerText = cart.reduce((s, i) => s + i.price, 0) + ' ج.م';
    
    if (currentUser) {
        document.getElementById('checkout-name').value = currentUser.name || '';
    }
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('checkout-modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('opacity-0');
    document.getElementById('checkout-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function submitOrder() {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    
    let paymentType = 'كاش';
    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    if (paymentRadio) paymentType = paymentRadio.value;

    if (!name || !phone || !address) {
        alert("من فضلك أدخل الاسم ورقم الهاتف وعنوان التوصيل كاملة!");
        return;
    }

    const totalAmount = cart.reduce((s, i) => s + i.price, 0);

    try {
        const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName: name, customerPhone: phone, customerAddress: address, paymentType, items: cart, totalAmount })
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('success-order-id').innerText = result.orderId;
            closeCheckoutModal();
            const sModal = document.getElementById('success-modal');
            sModal.classList.remove('hidden');

            cart = [];
            updateCart();
        }
    } catch (e) {
        alert("حدث خطأ أثناء إرسال الطلب للسيرفر");
    }
}

function closeSuccessModalAndGoHome() {
    const sModal = document.getElementById('success-modal');
    sModal.classList.add('hidden');
}

async function triggerDownload() {
    try {
        const res = await fetch('http://localhost:3000/api/settings');
        const settings = await res.json();
        
        if (settings.pdfUrl && settings.pdfUrl !== '#') {
            window.open(settings.pdfUrl, '_blank');
        } else {
            alert("عذراً، لم تقم الإدارة بإدراج رابط ملف الـ PDF بعد.");
        }
    } catch (e) {
        alert("حدث خطأ أثناء تحميل ملف المنيو.");
    }
}

function showToast(msg, title = "تنبيه") {
    const toast = document.getElementById('toast');
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3500);
}