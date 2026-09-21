let products =
  JSON.parse(localStorage.getItem("jeygly_products")) || [];

let cart =
  JSON.parse(localStorage.getItem("jeygly_cart")) || [];

let settings =
  JSON.parse(localStorage.getItem("jeygly_settings")) || {

    name: "Jeygly Store",

    title: "Bienvenido a Jeygly Store",

    subtitle: "Encuentra tus productos favoritos",

    whatsapp: "",

    headerColor: "#111827",

    primaryColor: "#2563eb"
  };


function saveProducts() {

  localStorage.setItem(
    "jeygly_products",
    JSON.stringify(products)
  );

}


function saveCart() {

  localStorage.setItem(
    "jeygly_cart",
    JSON.stringify(cart)
  );

}


function saveSettingsData() {

  localStorage.setItem(
    "jeygly_settings",
    JSON.stringify(settings)
  );

}


/* PRODUCTOS */

function renderProducts() {

  const container =
    document.getElementById("products");

  const search =
    document.getElementById("search")
      .value
      .toLowerCase();

  const category =
    document.getElementById("category").value;


  const filtered =
    products.filter(product => {

      const text =
        (
          product.name +
          " " +
          product.description
        ).toLowerCase();

      const searchOK =
        text.includes(search);

      const categoryOK =
        category === "all" ||
        product.category === category;

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


  container.innerHTML =
    filtered.map(product => `

      <article class="product">

        <img
          src="${
            product.image ||
            "https://via.placeholder.com/600x400?text=Producto"
          }"
          alt="${escapeHTML(product.name)}"
        >

        <div class="product-content">

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p class="description">
            ${escapeHTML(product.description)}
          </p>

          <div class="price">
            S/ ${Number(product.price).toFixed(2)}
          </div>

          <div class="product-buttons">

            <button
              class="add-btn"
              onclick="addToCart(${product.id})">
              🛒 Agregar
            </button>

            <button
              class="edit-btn"
              onclick="editProduct(${product.id})">
              ✏️
            </button>

            <button
              class="delete-btn"
              onclick="deleteProduct(${product.id})">
              🗑️
            </button>

          </div>

        </div>

      </article>

    `).join("");

}


/* CATEGORÍAS */

function updateCategories() {

  const select =
    document.getElementById("category");

  const current =
    select.value;

  const categories =
    [...new Set(
      products
        .map(product => product.category)
        .filter(Boolean)
    )];


  select.innerHTML =
    `<option value="all">
      Todas las categorías
    </option>`;


  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    select.appendChild(option);

  });


  if (categories.includes(current)) {

    select.value = current;

  }

}


/* MODAL PRODUCTO */

function openProductModal() {

  document.getElementById(
    "productModal"
  ).style.display = "block";


  document.getElementById(
    "productModalTitle"
  ).textContent = "Agregar producto";


  document.getElementById(
    "productId"
  ).value = "";


  document.getElementById(
    "productName"
  ).value = "";


  document.getElementById(
    "productPrice"
  ).value = "";


  document.getElementById(
    "productCategory"
  ).value = "";


  document.getElementById(
    "productDescription"
  ).value = "";


  document.getElementById(
    "productImage"
  ).value = "";


  document.getElementById(
    "imagePreview"
  ).style.display = "none";

}


function closeProductModal() {

  document.getElementById(
    "productModal"
  ).style.display = "none";

}


/* IMAGEN */

function previewImage(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  const reader =
    new FileReader();


  reader.onload = function(event) {

    const preview =
      document.getElementById(
        "imagePreview"
      );

    preview.src =
      event.target.result;

    preview.style.display =
      "block";

  };


  reader.readAsDataURL(file);

}


/* GUARDAR PRODUCTO */

function saveProduct() {

  const id =
    document.getElementById(
      "productId"
    ).value;


  const name =
    document.getElementById(
      "productName"
    ).value.trim();


  const price =
    parseFloat(
      document.getElementById(
        "productPrice"
      ).value
    );


  const category =
    document.getElementById(
      "productCategory"
    ).value.trim();


  const description =
    document.getElementById(
      "productDescription"
    ).value.trim();


  const file =
    document.getElementById(
      "productImage"
    ).files[0];


  if (!name) {

    alert("Escribe el nombre.");

    return;

  }


  if (isNaN(price)) {

    alert("Escribe un precio válido.");

    return;

  }


  if (!category) {

    alert("Escribe una categoría.");

    return;

  }


  if (id) {

    updateProduct(
      Number(id),
      name,
      price,
      category,
      description,
      file
    );

  } else {

    createProduct(
      name,
      price,
      category,
      description,
      file
    );

  }

}


/* CREAR */

function createProduct(
  name,
  price,
  category,
  description,
  file
) {

  if (file) {

    const reader =
      new FileReader();


    reader.onload = function(event) {

      finishCreate(
        name,
        price,
        category,
        description,
        event.target.result
      );

    };


    reader.readAsDataURL(file);

  } else {

    finishCreate(
      name,
      price,
      category,
      description,
      ""
    );

  }

}


function finishCreate(
  name,
  price,
  category,
  description,
  image
) {

  products.push({

    id: Date.now(),

    name: name,

    price: price,

    category: category,

    description: description,

    image: image

  });


  saveProducts();

  updateCategories();

  renderProducts();

  closeProductModal();

}


/* EDITAR */

function editProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  document.getElementById(
    "productModal"
  ).style.display = "block";


  document.getElementById(
    "productModalTitle"
  ).textContent = "Editar producto";


  document.getElementById(
    "productId"
  ).value = product.id;


  document.getElementById(
    "productName"
  ).value = product.name;


  document.getElementById(
    "productPrice"
  ).value = product.price;


  document.getElementById(
    "productCategory"
  ).value = product.category;


  document.getElementById(
    "productDescription"
  ).value = product.description;


  document.getElementById(
    "productImage"
  ).value = "";


  const preview =
    document.getElementById(
      "imagePreview"
    );


  if (product.image) {

    preview.src =
      product.image;

    preview.style.display =
      "block";

  } else {

    preview.style.display =
      "none";

  }

}


/* ACTUALIZAR */

function updateProduct(
  id,
  name,
  price,
  category,
  description,
  file
) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  function finish(image) {

    product.name = name;

    product.price = price;

    product.category = category;

    product.description =
      description;


    if (image !== null) {

      product.image = image;

    }


    saveProducts();

    updateCategories();

    renderProducts();

    closeProductModal();

  }


  if (file) {

    const reader =
      new FileReader();


    reader.onload =
      event => {

        finish(
          event.target.result
        );

      };


    reader.readAsDataURL(file);

  } else {

    finish(null);

  }

}


/* ELIMINAR */

function deleteProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  const confirmed =
    confirm(
      `¿Eliminar "${product.name}"?`
    );


  if (!confirmed) return;


  products =
    products.filter(
      item => item.id !== id
    );


  cart =
    cart.filter(
      item => item.id !== id
    );


  saveProducts();

  saveCart();

  updateCategories();

  renderProducts();

  updateCartCount();

}


/* CARRITO */

function addToCart(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  const existing =
    cart.find(
      item => item.id === id
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      id: id,

      quantity: 1

    });

  }


  saveCart();

  updateCartCount();

  alert("Producto agregado al carrito.");

}


function updateCartCount() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  document.getElementById(
    "cartCount"
  ).textContent = count;

}


function openCart() {

  renderCart();

  document.getElementById(
    "cartModal"
  ).style.display = "block";

}


function closeCart() {

  document.getElementById(
    "cartModal"
  ).style.display = "none";

}


function renderCart() {

  const container =
    document.getElementById(
      "cartItems"
    );


  if (cart.length === 0) {

    container.innerHTML = `
      <div class="empty">
        El carrito está vacío.
      </div>
    `;

    document.getElementById(
      "cartTotal"
    ).textContent = "0.00";

    return;

  }


  let total = 0;


  container.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          p => p.id === item.id
        );


      if (!product) return "";


      const subtotal =
        product.price *
        item.quantity;


      total += subtotal;


      return `

        <div class="cart-item">

          <img
            src="${
              product.image ||
              "https://via.placeholder.com/100"
            }"
          >

          <div class="cart-info">

            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <br>

            S/ ${Number(
              product.price
            ).toFixed(2)}

          </div>

          <div class="qty">

            <button
              onclick="changeQuantity(${product.id}, -1)">
              −
            </button>

            <span>
              ${item.quantity}
            </span>

            <button
              onclick="changeQuantity(${product.id}, 1)">
              +
            </button>

          </div>

        </div>

      `;

    }).join("");


  document.getElementById(
    "cartTotal"
  ).textContent =
    total.toFixed(2);

}


function changeQuantity(
  id,
  amount
) {

  const item =
    cart.find(
      product => product.id === id
    );


  if (!item) return;


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product => product.id !== id
      );

  }


  saveCart();

  updateCartCount();

  renderCart();

}


/* WHATSAPP */

function sendWhatsApp() {

  if (cart.length === 0) {

    alert("El carrito está vacío.");

    return;

  }


  const number =
    settings.whatsapp
      .replace(/\D/g, "");


  if (!number) {

    alert(
      "Primero coloca tu número de WhatsApp en Configurar."
    );

    openSettings();

    return;

  }


  let message =
    "Hola, quiero realizar este pedido:%0A%0A";


  let total = 0;


  cart.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );


    if (!product) return;


    const subtotal =
      product.price *
      item.quantity;


    total += subtotal;


    message +=
      `• ${product.name} x${item.quantity} - S/ ${subtotal.toFixed(2)}%0A`;

  });


  message +=
    `%0ATotal: S/ ${total.toFixed(2)}`;


  const url =
    `https://wa.me/${number}?text=${message}`;


  window.open(
    url,
    "_blank"
  );

}


/* CONFIGURACIÓN */

function openSettings() {

  document.getElementById(
    "settingsModal"
  ).style.display = "block";


  document.getElementById(
    "storeName"
  ).value = settings.name;


  document.getElementById(
    "storeTitle"
  ).value = settings.title;


  document.getElementById(
    "storeSubtitle"
  ).value = settings.subtitle;


  document.getElementById(
    "whatsappNumber"
  ).value = settings.whatsapp;


  document.getElementById(
    "headerColor"
  ).value = settings.headerColor;


  document.getElementById(
    "primaryColor"
  ).value = settings.primaryColor;

}


function closeSettings() {

  document.getElementById(
    "settingsModal"
  ).style.display = "none";

}


function saveSettings() {

  settings.name =
    document.getElementById(
      "storeName"
    ).value ||
    "Jeygly Store";


  settings.title =
    document.getElementById(
      "storeTitle"
    ).value ||
    "Bienvenido a Jeygly Store";


  settings.subtitle =
    document.getElementById(
      "storeSubtitle"
    ).value ||
    "Encuentra tus productos favoritos";


  settings.whatsapp =
    document.getElementById(
      "whatsappNumber"
    ).value;


  settings.headerColor =
    document.getElementById(
      "headerColor"
    ).value;


  settings.primaryColor =
    document.getElementById(
      "primaryColor"
    ).value;


  saveSettingsData();

  applySettings();

  closeSettings();

}


/* APLICAR CONFIGURACIÓN */

function applySettings() {

  document.getElementById(
    "logoText"
  ).textContent =
    settings.name;


  document.getElementById(
    "heroTitle"
  ).textContent =
    settings.title;


  document.getElementById(
    "heroSubtitle"
  ).textContent =
    settings.subtitle;


  document.getElementById(
    "footerText"
  ).textContent =
    `© 2026 ${settings.name}`;


  document.querySelector(
    "header"
  ).style.background =
    settings.headerColor;


  document.documentElement.style
    .setProperty(
      "--primary",
      settings.primaryColor
    );

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


initialize();
