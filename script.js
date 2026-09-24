/* script.js */
let cart = [];

// Smooth Scroll Animation for Navigation Links
document.querySelectorAll('header nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll Spy for Active Navigation Links
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 200)) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('text-amber-400', 'bg-zinc-800/60', 'shadow-sm');
        link.classList.add('text-zinc-300');
        
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('text-amber-400', 'bg-zinc-800/60', 'shadow-sm');
            link.classList.remove('text-zinc-300');
        }
    });
});

// Scroll Reveal Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// Toast Notification Function
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    toastMsg.textContent = message;
    
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3000);
}

// Cart & Menu Functions
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
    showToast(`تمت إضافة "${name}" بنجاح إلى السلة`);
}

function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-zinc-500 text-center py-8">السلة فارغة حالياً</p>';
        cartTotal.textContent = '٠ ج.م';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div class="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div>
                    <h4 class="font-bold text-white text-sm">${item.name}</h4>
                    <p class="text-amber-400 text-xs font-bold mt-1">${item.price} ج.م × ${item.quantity}</p>
                </div>
                <button onclick="removeItem(${index})" class="text-zinc-500 hover:text-red-400 transition p-2"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    cartItems.innerHTML = html;
    cartTotal.textContent = total + ' ج.م';
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        alert('سلتك فارغة!');
        return;
    }
    alert('تم استلام طلبك بنجاح! جاري تحضيره الآن');
    cart = [];
    updateCartUI();
    toggleCart();
}

function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-amber-500', 'to-orange-500', 'text-zinc-950', 'font-extrabold', 'shadow-md', 'border-amber-400');
        btn.classList.add('bg-zinc-900/80', 'border', 'border-zinc-800', 'text-zinc-300', 'font-bold');
    });
    
    if (event && event.target) {
        event.target.classList.remove('bg-zinc-900/80', 'border', 'border-zinc-800', 'text-zinc-300', 'font-bold');
        event.target.classList.add('bg-gradient-to-r', 'from-amber-500', 'to-orange-500', 'text-zinc-950', 'font-extrabold', 'shadow-md', 'border-amber-400');
    }

    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function scrollToMenuWithOffer() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    addToCart('عرض العيلة (3 برجر + بطاطس)', 299);
}