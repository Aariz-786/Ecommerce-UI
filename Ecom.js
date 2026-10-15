//Implement your code here to make it a functional shopping website
const API_URL = "https://dummyjson.com/products";

const productsContainer = document.querySelector(".products");
const cartSection = document.getElementById("cart");
const cartBtn = document.getElementById("cartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

let productsList = [];
let cart = [];
// Keeps track of the current image index for each product ID: { [productId]: imageIndex }
let currentImageIndices = {}; 

// 1. Fetch all products from the API using async/await
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // DummyJSON returns products inside a 'products' array
        productsList = data.products || data; 
        renderProducts();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        productsContainer.innerHTML = "<p>Failed to load products. Please try again later.</p>";
    }
}

// 2. Render all products onto the screen
function renderProducts() {
    productsContainer.innerHTML = "";

    productsList.forEach(product => {
        // Default to index 0 if not tracked yet
        if (!(product.id in currentImageIndices)) {
            currentImageIndices[product.id] = 0;
        }
        const imgIdx = currentImageIndices[product.id];
        const currentImg = product.images && product.images.length > 0 
            ? product.images[imgIdx] 
            : product.thumbnail || '';

        const productCard = document.createElement("div");
        productCard.classList.add("product");
        productCard.style.height = "auto"; // Allow card to expand dynamically for content

        productCard.innerHTML = `
            <div class="img_con" style="justify-content: center; align-items: center; position: relative; height: 160px;">
                <button class="prev-img" data-id="${product.id}">&#10094;</button>
                <img src="${currentImg}" alt="${product.title}" style="max-height: 140px; max-width: 140px; object-fit: contain;" />
                <button class="next-img" data-id="${product.id}">&#10095;</button>
            </div>
            <div class="card_footer" style="padding: 10px;">
                <h3 style="font-size: 16px; margin: 5px 0;">${product.title}</h3>
                <p style="margin: 5px 0; font-weight: bold;">$${product.price}</p>
                <button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        productsContainer.appendChild(productCard);
    });

    attachProductEventListeners();
}

// Attach event listeners for product image toggling and adding to cart
function attachProductEventListeners() {
    // Previous Image Buttons
    document.querySelectorAll(".prev-img").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.getAttribute("data-id"));
            const product = productsList.find(p => p.id === id);
            if (product && product.images && product.images.length > 0) {
                currentImageIndices[id] = (currentImageIndices[id] - 1 + product.images.length) % product.images.length;
                renderProducts();
            }
        });
    });

    // Next Image Buttons
    document.querySelectorAll(".next-img").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.getAttribute("data-id"));
            const product = productsList.find(p => p.id === id);
            if (product && product.images && product.images.length > 0) {
                currentImageIndices[id] = (currentImageIndices[id] + 1) % product.images.length;
                renderProducts();
            }
        });
    });

    // Add to Cart Buttons
    document.querySelectorAll(".addToCartBtn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.getAttribute("data-id"));
            addToCart(id);
        });
    });
}

// 3. Add product to cart or increment quantity
function addToCart(productId) {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    alert(`${product.title} has been added to your cart!`);
}

// 4. Update Cart Section UI
function updateCartUI() {
    // Clear existing cart items, keeping header and checkout button container intact or rebuilding the section content
    cartSection.innerHTML = `<h2>Cart</h2>`;

    if (cart.length === 0) {
        cartSection.innerHTML += `<p style="padding: 10px;">Your cart is empty.</p>`;
        return;
    }

    cart.forEach(item => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart_item");
        cartItemDiv.innerHTML = `
            <span><strong>${item.title}</strong></span>
            <span>Price: $${item.price}</span>
            <span>Qty: ${item.quantity}</span>
            <button class="remove-item" data-id="${item.id}" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remove</button>
            <button class="decrease-item" data-id="${item.id}" style="margin-right: 10px; background-color: #ddd; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">- Qty</button>
        `;
        cartSection.appendChild(cartItemDiv);
    });

    attachCartEventListeners();
}

// Attach listeners for cart item actions (Decrease quantity / Remove)
function attachCartEventListeners() {
    document.querySelectorAll(".decrease-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.getAttribute("data-id"));
            const cartItem = cart.find(item => item.id === id);
            if (cartItem) {
                cartItem.quantity -= 1;
                if (cartItem.quantity <= 0) {
                    cart = cart.filter(item => item.id !== id);
                }
                updateCartUI();
            }
        });
    });

    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.getAttribute("data-id"));
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
        });
    });
}

// 5. Toggle between Products section and Cart section when clicking Cart button
cartBtn.addEventListener("click", () => {
    const isCartVisible = cartSection.classList.toggle("show");
    if (isCartVisible) {
        productsContainer.style.display = "none";
        checkoutBtn.style.display = "block";
        cartBtn.textContent = "Shop";
    } else {
        productsContainer.style.display = "flex";
        checkoutBtn.style.display = "none";
        cartBtn.textContent = "Cart";
    }
});

// 6. Checkout button alert showing total price
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Checkout successful! Total amount to be paid: $${total.toFixed(2)}`);
    
    // Optional: Reset cart after checkout
    cart = [];
    updateCartUI();
});

// Hide checkout button initially until cart view is open
checkoutBtn.style.display = "none";

// Initialize application
fetchProducts();