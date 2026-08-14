var searchFieldTagify;

class ProductList {
    allProducts = [];
    metadata = {}

    async loadProducts(jsonFile = 'assets/products_cms_extended.json') {
        const response = await fetch(jsonFile);
        const res = await response.json();
        console.log('loaded data', res);
        this.allProducts = res.products;
        this.metadata = res.site_metadata;
        return this.allProducts;
    }

    getAllProducts() {
        return this.allProducts;
    }

    getMeta(setting) {
        return this.metadata[setting];
    }
}

class Cart {
    cartItems = new Map();

    clearCart() {
        this.cartItems = new Map();
    }
    addProduct(product) {
        const entry = this.cartItems.get(product.id) ?? [, 0];
        this.cartItems.set(product.id, [product, entry[1] + 1])
        console.log(this.cartItems);
        this.saveCart();
    }
    removeProduct(id) {
        return this.cartItems.delete(id);
    }
    loadCart() {
        const cartStr = localStorage.getItem('__saved_cart') || "[]";
        const cartItems = JSON.parse(cartStr);
        cartItems.forEach(item => {
            this.cartItems.set(item[0].id, item);
        })
    }
    saveCart() {
        const cartStr = JSON.stringify(this.getAllItems());
        localStorage.setItem('__saved_cart', cartStr);
    }
    getAllItems() {
        return [...this.cartItems.values()];
    }

    getTotal() {
        let sum = 0;
        for(const entry of this.cartItems.values()) {
            sum += entry[0].price * entry[1];
        }
        return sum;
    }
}

var cart = new Cart();
var productList = new ProductList();

function filterProductByTags(items, selectedTags){
    if(!selectedTags || selectedTags.length === 0) {
        return items;
    }

    return items.filter(item => 
        item.tags.some(tag => selectedTags.includes(tag.toLowerCase()))
    );
}

function loadFilteredProducts(products) {
    console.log('filtered products', products)
    let itemList = document.getElementById('item-list');
    let itemListHtmls = products.map(prod => `
        <div class="card">
                <img src="${prod.images[0]}"
                    class="card-img-top" alt="...">
                <div class="card-body">
                    <div>
                        <h5 class="card-title">${prod.name}</h5>
                        <p class="card-text">${prod.description}</p>
                    </div>
                    <button data-id="${prod.id}" class="btn btn-primary">
                        Buy for ${productList.getMeta('currency_symbol')}${prod.price}
                    </button>
                </div>
            </div>
        
    `);
    itemList.innerHTML = ''.concat(...itemListHtmls);
}

function attachAddItemAction() {
    const cardList = document.getElementById('item-list');
    cardList.addEventListener(
        'click',
        e => {
            const target = e.target;
            const btnId = target.getAttribute('data-id');
            console.log('adding item', btnId);
            console.log(productList, productList.getAllProducts())
            const product = productList.getAllProducts().find(p => p.id === btnId);
            cart.addProduct(product);
            renderCart();
        }
    )
}

function attachRemoveItemAction() {
    const cardList = document.getElementById('cart-list');
    cardList.addEventListener(
        'click',
        e => {
            const target = e.target;
            const btnId = target.getAttribute('data-id');
            console.log('removing item', btnId);
            cart.removeProduct(btnId);
            renderCart();
        }
    )
}

function renderCart () {
    const cardList = document.getElementById('cart-list');
    console.log('cartItems', cart.getAllItems());
    const prdStrs = cart.getAllItems().map(
        prd => renderCartElement(prd)
    );

    cardList.innerHTML =
        "".concat(...prdStrs);

    const total = cart.getTotal();

    document.getElementById('cart-total').innerText = 
     `${productList.getMeta('currency_symbol')}${total}`;
    
    document.getElementById('cart-size').innerText
     = cart.getAllItems().reduce((sum, item) => sum + item[1], 0);

}

function renderCartElement([product, qty]) {
    return `
    <div class="cart-item d-flex align-items-center mb-3 pb-3 border-bottom">
        <img src="${product.images[0]}" alt="Product" class="rounded me-3">
        <div class="flex-grow-1">
            <h6 class="mb-0 fw-semibold">${product.name}</h6>
            <small class="text-muted">Qty: ${qty}</small>
            <button data-id="${product.id}" class="btn btn-secondary px-1 py-0">
                <i data-id="${product.id}"  class="fa-solid fa-trash-can" style="color: rgb(226, 255, 225); font-size: 0.9em"></i>
            </button>
        </div>
        <span class="fw-bold">${productList.getMeta('currency_symbol')}${product.price}</span>
    </div>
    `
}

function attachCartMenuToggle() {
    const cart = document.getElementById('cart');
    const openCart = document.getElementById('cart-open');
    const closeCart = document.getElementById('cart-close');

    openCart.addEventListener('click', (e) => {
        cart.classList.toggle('open');
    })
    closeCart.addEventListener('click', (e) => {
        cart.classList.toggle('open');
    })
}

document.addEventListener(
    'readystatechange',
    ($e) => {
        if (document.readyState === 'complete') {
            productList.loadProducts()
                .then(data => {
                    loadFilteredProducts(data);
                    renderCart();
                });
            // attachTagifyToSearchField();
            attachCartMenuToggle();
            cart.loadCart();
            // listenForPreviewEvents();
            console.log('search', window.location.search);
            const searchParams = new URLSearchParams(window.location.search);
            console.log(searchParams.get('q'));
            if (searchParams.get('q').length > 3) {
                productList.loadProducts(`assets/${searchParams.get('q')}.json`)
                .then(data => {
                    loadFilteredProducts(data);
                });
            }
            attachAddItemAction();
            attachRemoveItemAction();
        }
    }
)

window.addEventListener(
    'beforeunload',
    e => {
        cart.saveCart();
    }
)