let products = safeReadStorage("jeygly_products", []);
let cart = safeReadStorage("jeygly_cart", []);

const defaultSettings = {
  name: "Jeygly Store",
  title: "Bienvenido a Jeygly Store",
  subtitle: "Encuentra tus productos favoritos",
  whatsapp: "",
  headerColor: "#111827",
  primaryColor: "#2563eb"
};

let settings = {
  ...defaultSettings,
  ...safeReadStorage("jeygly_settings", {})
};

function safeReadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`No se pudo leer ${key}:`, error);
    return fallback;
  }
}

function saveProducts() {
  try {
    localStorage.setItem("jeygly_products", JSON.stringify(products));
  } catch (error) {
    console.warn("No se pudo guardar productos:", error);
  }
}

function saveCart() {
  try {
    localStorage.setItem("jeygly_cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("No se pudo guardar el carrito:", error);
  }
}

function saveSettingsData() {
  try {
    localStorage.setItem("jeygly_settings", JSON.stringify(settings));
  } catch (error) {
    console.warn("No se pudo guardar la configuración:", error);
  }
}

/* PRODUCTOS */

function renderProducts() {
  const container = document.getElementById("products");

  if (!container) return;

  const search = document.getElementById("search")?.value?.toLowerCase?.() || "";
  const category = document.getElementById("category")?.value || "all";
  const validProducts = Array.isArray(products) ? products : [];

  const filtered = validProducts.filter(product => {
    const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
    const searchOK = text.includes(search);
    const categoryOK = category === "all" || product?.category === category;

    return searchOK && categoryOK;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <h2>No hay productos</h2>
        <p>Agrega un producto para comenzar.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = filtered.map(product => `
    <article class="product">
      <img
        src="${product.image || "https://via.placeholder.com/600x400?text=Producto"}"
        alt="${escapeHTML(product.name || "Producto") }"
      >

      <div class="product-content">
        <h3>${escapeHTML(product.name || "Producto")}</h3>
        <p class="description">${escapeHTML(product.description || "")}</p>
        <div class="price">S/ ${Number(product.price || 0).toFixed(2)}</div>

        <div class="product-buttons">
          <button class="add-btn" onclick="addToCart(${product.id})">🛒 Agregar</button>
          <button class="edit-btn" onclick="editProduct(${product.id})">✏️</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* CATEGORÍAS */

function updateCategories() {
  const select = document.getElementById("category");

  if (!select) return;

  const current = select.value || "all";
  const categories = [...new Set(
    (Array.isArray(products) ? products : [])
      .map(product => product.category)
      .filter(Boolean)
  )];

  select.innerHTML = `<option value="all">Todas las categorías</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  if (categories.includes(current)) {
    select.value = current;
  } else {
    select.value = "all";
  }
}

/* MODAL PRODUCTO */

function openProductModal() {
  const modal = document.getElementById("productModal");
  const preview = document.getElementById("imagePreview");

  if (!modal) return;

  modal.style.display = "block";
  document.getElementById("productModalTitle").textContent = "Agregar producto";
  document.getElementById("productId").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productCategory").value = "";
  document.getElementById("productDescription").value = "";
  document.getElementById("productImage").value = "";

  if (preview) {
    preview.src = "";
    preview.style.display = "none";
  }
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "none";
}

/* IMAGEN */

function previewImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    const preview = document.getElementById("imagePreview");

    if (!preview) return;

    preview.src = event.target.result;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
}

/* GUARDAR PRODUCTO */

function saveProduct() {
  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const category = document.getElementById("productCategory").value.trim();
  const description = document.getElementById("productDescription").value.trim();
  const file = document.getElementById("productImage").files[0];

  if (!name) {
    alert("Escribe el nombre.");
    return;
  }

  if (Number.isNaN(price)) {
    alert("Escribe un precio válido.");
    return;
  }

  if (!category) {
    alert("Escribe una categoría.");
    return;
  }

  if (id) {
    updateProduct(Number(id), name, price, category, description, file);
  } else {
    createProduct(name, price, category, description, file);
  }
}

/* CREAR */

function createProduct(name, price, category, description, file) {
  if (file) {
    const reader = new FileReader();

    reader.onload = function(event) {
      finishCreate(name, price, category, description, event.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    finishCreate(name, price, category, description, "");
  }
}

function finishCreate(name, price, category, description, image) {
  products.push({
    id: Date.now() + Math.random(),
    name,
    price,
    category,
    description,
    image
  });

  saveProducts();
  updateCategories();
  renderProducts();
  closeProductModal();
}

/* EDITAR */

function editProduct(id) {
  const product = (Array.isArray(products) ? products : []).find(item => item.id === id);

  if (!product) return;

  document.getElementById("productModal").style.display = "block";
  document.getElementById("productModalTitle").textContent = "Editar producto";
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productImage").value = "";

  const preview = document.getElementById("imagePreview");

  if (preview) {
    if (product.image) {
      preview.src = product.image;
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  }
}

/* ACTUALIZAR */

function updateProduct(id, name, price, category, description, file) {
  const product = (Array.isArray(products) ? products : []).find(item => item.id === id);

  if (!product) return;

  function finish(image) {
    product.name = name;
    product.price = price;
    product.category = category;
    product.description = description;

    if (image !== null) {
      product.image = image;
    }

    saveProducts();
    updateCategories();
    renderProducts();
    closeProductModal();
  }

  if (file) {
    const reader = new FileReader();

    reader.onload = event => {
      finish(event.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    finish(null);
  }
}

/* ELIMINAR */

function deleteProduct(id) {
  const product = (Array.isArray(products) ? products : []).find(item => item.id === id);

  if (!product) return;

  const confirmed = confirm(`¿Eliminar "${product.name}"?`);

  if (!confirmed) return;

  products = products.filter(item => item.id !== id);
  cart = cart.filter(item => item.id !== id);

  saveProducts();
  saveCart();
  updateCategories();
  renderProducts();
  updateCartCount();
}

/* CARRITO */

function addToCart(id) {
  const product = (Array.isArray(products) ? products : []).find(item => item.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  alert("Producto agregado al carrito.");
}

function updateCartCount() {
  const count = (Array.isArray(cart) ? cart : []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const countEl = document.getElementById("cartCount");

  if (countEl) {
    countEl.textContent = count;
  }
}

function openCart() {
  renderCart();
  const modal = document.getElementById("cartModal");
  if (modal) modal.style.display = "block";
}

function closeCart() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.style.display = "none";
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  if (!container || !totalEl) return;

  if (!Array.isArray(cart) || cart.length === 0) {
    container.innerHTML = `<div class="empty">El carrito está vacío.</div>`;
    totalEl.textContent = "0.00";
    return;
  }

  let total = 0;

  container.innerHTML = cart.map(item => {
    const product = (Array.isArray(products) ? products : []).find(p => p.id === item.id);

    if (!product) return "";

    const subtotal = Number(product.price || 0) * Number(item.quantity || 0);
    total += subtotal;

    return `
      <div class="cart-item">
        <img src="${product.image || "https://via.placeholder.com/100"}">
        <div class="cart-info">
          <strong>${escapeHTML(product.name || "Producto")}</strong><br>
          S/ ${Number(product.price || 0).toFixed(2)}
        </div>
        <div class="qty">
          <button onclick="changeQuantity(${product.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${product.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = total.toFixed(2);
}

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
  updateCartCount();
  renderCart();
}

/* WHATSAPP */

function sendWhatsApp() {
  if (!Array.isArray(cart) || cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const number = (settings.whatsapp || "").replace(/\D/g, "");

  if (!number) {
    alert("Primero coloca tu número de WhatsApp en Configurar.");
    openSettings();
    return;
  }

  let message = "Hola, quiero realizar este pedido:%0A%0A";
  let total = 0;

  cart.forEach(item => {
    const product = (Array.isArray(products) ? products : []).find(p => p.id === item.id);

    if (!product) return;

    const subtotal = Number(product.price || 0) * Number(item.quantity || 0);
    total += subtotal;
    message += `• ${product.name} x${item.quantity} - S/ ${subtotal.toFixed(2)}%0A`;
  });

  message += `%0ATotal: S/ ${total.toFixed(2)}`;

  const url = `https://wa.me/${number}?text=${message}`;
  window.open(url, "_blank");
}

/* CONFIGURACIÓN */

function openSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.style.display = "block";

  document.getElementById("storeName").value = settings.name;
  document.getElementById("storeTitle").value = settings.title;
  document.getElementById("storeSubtitle").value = settings.subtitle;
  document.getElementById("whatsappNumber").value = settings.whatsapp;
  document.getElementById("headerColor").value = settings.headerColor;
  document.getElementById("primaryColor").value = settings.primaryColor;
}

function closeSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.style.display = "none";
}

function saveSettings() {
  settings.name = document.getElementById("storeName").value || "Jeygly Store";
  settings.title = document.getElementById("storeTitle").value || "Bienvenido a Jeygly Store";
  settings.subtitle = document.getElementById("storeSubtitle").value || "Encuentra tus productos favoritos";
  settings.whatsapp = document.getElementById("whatsappNumber").value;
  settings.headerColor = document.getElementById("headerColor").value || "#111827";
  settings.primaryColor = document.getElementById("primaryColor").value || "#2563eb";

  saveSettingsData();
  applySettings();
  closeSettings();
}

/* APLICAR CONFIGURACIÓN */

function applySettings() {
  const logoText = document.getElementById("logoText");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const footerText = document.getElementById("footerText");
  const header = document.querySelector("header");

  if (logoText) logoText.textContent = settings.name;
  if (heroTitle) heroTitle.textContent = settings.title;
  if (heroSubtitle) heroSubtitle.textContent = settings.subtitle;
  if (footerText) footerText.textContent = `© 2026 ${settings.name}`;
  if (header) header.style.background = settings.headerColor;

  document.documentElement.style.setProperty("--primary", settings.primaryColor);
  document.documentElement.style.setProperty("--header-bg", settings.headerColor);
}

/* SEGURIDAD */

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* INICIO */

function initialize() {
  applySettings();
  updateCategories();
  renderProducts();
  updateCartCount();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
