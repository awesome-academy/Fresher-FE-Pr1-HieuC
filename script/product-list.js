"strict";
const productListGrid = document.querySelector(".products-show--grid");
const productListLine = document.querySelector(".products-show--line");
const cartList = document.querySelector(".cart-table");

let buttonDOM = [];
let cart = [];
let products = [];
//////////////Model//////////////////
class Model {
  getProduct = async function (page = 1, limit = 9) {
    try {
      const res = await fetch(
        `http://localhost:3000/products?_page=${page}&_limit=${limit}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      products = data;
      return products;
    } catch (err) {
      console.log(err);
    }
  };
}

class View {
  initialApp() {
    cart = Storage.getCart();
  }

  getProductById(id) {
    return products.find((product) => product.id === id);
  }

  productGrid(product) {
    return `
        <div class="product">
                    <img
                      class="product-img"
                      src=${product.img}
                    />
                    <h4 class="heading-titary">${product.title}</h4>
                    <div class="product-price">
                      <p class="product-price--discount">${product.price}</p>
                      <p class="product-price--initial">${product.initialPrice}</p>
                    </div>
                    <button
                      class="bag-button button button--xxl" data-id=${product.id}
                    >
                      ADD TO CART
                    </button>
                    <p class="product-status"></p>
                    <div class="product-hide">
                      <div class="product-action">
                        <div class="product-action__item">
                          <i class="fa-solid fa-heart"></i>
                          <p>Yêu thích</p>
                        </div>
                        <div class="product-action__item">
                          <i class="fa-solid fa-code-compare"></i>
                          <p>So sánh</p>
                        </div>
                        <div class="product-action__item"></div>
                        <i class="fa-solid fa-link"></i>
                      </div>
                    </div>
                  </div>
    `;
  }

  productLine(product) {
    return `
              <div class="product-line">
                    <img
                      class="product-line__img"
                      src=${product.img}
                    />
                    <div class="product-line__details">
                      <h4 class="heading-titary">${product.title}</h4>
                      <p class="product-line__price">${product.price}</p>
                      <p class="product-line__description">
                        ${product.description}
                      </p>
                      <div class="product-action">
                        <div class="product-action__item">
                          <i class="fa-solid fa-heart"></i>
                          <p>Yêu thích</p>
                        </div>
                        <div class="product-action__item">
                          <i class="fa-solid fa-code-compare"></i>
                          <p>So sánh</p>
                        </div>
                        <div class="product-action__item"></div>
                        <i class="fa-solid fa-link"></i>
                      </div>
                      <button
                        class="bag-button button button--xxl" data-id=${product.id}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
        `;
  }

  renderProducts(products) {
    products.forEach((product) => {
      productListGrid.insertAdjacentHTML(
        "afterbegin",
        this.productGrid(product)
      );
      productListLine.insertAdjacentHTML(
        "afterbegin",
        this.productLine(product)
      );
    });
  }

  addCartButton() {
    const bagButton = [...document.querySelectorAll(".bag-button")];
    buttonDOM = bagButton;
    bagButton.forEach((button) => {
      const productId = button.dataset.id;

      button.addEventListener("click", (e) => {
        const inCart = Storage.getCart().find((item) => item.id === productId);
        if (inCart) {
          let tempItem = cart.find((item) => item.id === productId);
          tempItem.amount += 1;
          Storage.saveCart(cart);
        } else {
          const cartItem = { ...this.getProductById(productId), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
        }
      });
    });
  }
}

class Storage {
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const model = new Model();
  const view = new View();

  view.initialApp();

  model
    .getProduct(1, 9)
    .then((products) => {
      view.renderProducts(products);
    })
    .then(() => {
      view.addCartButton();
    });
});
