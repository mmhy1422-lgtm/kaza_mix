// script.js
let cart = [];

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
    showToast(name);
}

function updateCart() {
    const container = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
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
        container.innerHTML += `
            <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                <div>
                    <h5 class="font-bold text-sm text-white">${item.name}</h5>
                    <span class="text-amber-400 text-xs">${item.price} ج.م</span>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300 text-sm"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    totalEl.innerText = total + ' ج.م';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function showToast(name) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-msg');
    msg.innerText = `تمت إضافة "${name}" للسلة بنجاح`;
    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3000);
}

function checkout() {
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }
    alert("تم إتمام طلبك بنجاح! سيتم التواصل معك قريباً.");
    cart = [];
    updateCart();
    toggleCart();
}

// Hide Logo on Scroll
window.addEventListener('scroll', function() {
    const logo = document.getElementById('floating-logo');
    if (window.scrollY > 40) {
        logo.classList.add('opacity-0', 'pointer-events-none', '-translate-y-10');
    } else {
        logo.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-10');
    }
});

// PDF Download Button Animation
function triggerDownload() {
    const btn = document.getElementById('download-pdf-btn');
    const icon = document.getElementById('dl-icon');
    const text = document.getElementById('dl-text');
    
    if (btn.classList.contains('completed')) return;

    btn.classList.add('opacity-90', 'scale-95');
    icon.className = "fa-solid fa-spinner fa-spin text-lg";
    text.innerText = "جاري التحميل...";

    setTimeout(() => {
        btn.classList.remove('from-purple-600', 'to-indigo-600', 'hover:from-purple-500', 'hover:to-indigo-500', 'opacity-90', 'scale-95');
        btn.classList.add('bg-emerald-600', 'completed');
        icon.className = "fa-solid fa-check text-lg";
        text.innerText = "Completed";
    }, 1800);
}