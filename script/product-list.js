"strict";
const productListGrid = document.querySelector(".products-show--grid");
const productListLine = document.querySelector(".products-show--line");
const cartList = document.querySelector(".cart-table");
const productMenu = document.querySelector(".products-menu");
const cartQuantity = document.querySelector(".cart-quantity");
const pagination = document.querySelector(".pagination");

const PRODUCT_PER_PAGE = 6;

let buttonDOM = [];
let cart = [];
let products = [];
let menu = [];
let categoryApplied = "";
let totalProduct = 0;
let currentPage = 1;
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
      totalProduct = res.headers.get("X-Total-Count");
      return products;
    } catch (err) {
      console.log(err);
    }
  };

  getProductByCategory = async function (category, page = 1, limit = 6) {
    const view = new View();
    try {
      const res = await fetch(
        `http://localhost:3000/products?category=${category}&_page=${page}&_limit=${limit}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      totalProduct = res.headers.get("X-Total-Count");
      products = data;
      pagination.innerHTML = "";
      view.renderPagination(totalProduct);
      return products;
    } catch (err) {
      console.log(err);
    }
  };

  getMenu = async function () {
    try {
      const res = await fetch(`http://localhost:3000/menu`);
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      menu = data;
      return menu;
    } catch (err) {
      console.log(err);
    }
  };

  getProductsByPage = async function (category, page, limit) {
    try {
      let res;
      if (categoryApplied) {
        res = await fetch(
          `http://localhost:3000/products?category=${category}&_page=${page}&_limit=${limit}`
        );
      } else {
        res = await fetch(
          `http://localhost:3000/products?_page=${page}&_limit=${limit}`
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      products = data;
    } catch (err) {
      console.log(err);
    }
  };
}

class View {
  initialApp() {
    cart = Storage.getCart();
    this.renderCartQuantity();
  }

  // CART
  renderCartQuantity() {
    let totalQuantity = cart.reduce((total, item) => total + item.amount, 0);
    cartQuantity.textContent = totalQuantity;
  }

  // PRODUCT

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
                      class="bag-button button button--xxl" data-id=${product.id} data-bs-toggle="modal" data-bs-target="#addCartModal"
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
                        class="bag-button button button--xxl" data-id=${product.id} data-bs-toggle="modal" data-bs-target="#addCartModal"
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

  renderProductsByPage = function (action) {
    const paginationBtn = document.querySelectorAll(".page-link");
    paginationBtn.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        await action(
          categoryApplied,
          Number(btn.dataset.page),
          PRODUCT_PER_PAGE
        );
        currentPage = btn.dataset.page;
        productListGrid.innerHTML = "";
        productListLine.innerHTML = "";
        this.renderProducts(products);
      });
    });
  };

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
        this.renderCartQuantity();
      });
    });
  }

  // FILTER BAR

  renderCategoryBar(menu) {
    for (const [key, value] of Object.entries(menu)) {
      productMenu.insertAdjacentHTML(
        "beforeend",
        `<div class="products-menu__group products-menu__group-${key}"><h3>${value[
          "title"
        ].toUpperCase()}</h3></div>`
      );
      value["list"].map((val) => {
        document
          .querySelector(`.products-menu__group-${key}`)
          .insertAdjacentHTML(
            "beforeend",
            `<p class='products-menu__item ' data-category=${val}>
            ${val} 
          </p>`
          );
      });
    }
  }

  renderProductsByCategory = function (action) {
    const categoryBtn = document.querySelectorAll(".products-menu__item");
    categoryBtn.forEach((btn) => {
      btn.addEventListener("click", async () => {
        let category = btn.dataset.category;
        let data = await action(category);
        productListGrid.innerHTML = "";
        productListLine.innerHTML = "";
        categoryApplied = category;
        this.renderProducts(products);
        btn.classList.add("products-menu__item--active");
        categoryBtn.forEach((btn) => {
          if (btn.dataset.category !== category) {
            btn.classList.remove("products-menu__item--active");
          }
        });
        this.addCartButton();
      });
    });
  };

  // PAGINATION

  renderPagination = function (total) {
    const model = new Model();
    let totalPage = Math.ceil(total / PRODUCT_PER_PAGE);
    for (let i = 1; i <= totalPage; i++) {
      let pageHTML = `
         <li class="page-item">
              <a class="page-link" data-page="${i}">${i}</a>
         </li>
      `;
      pagination.insertAdjacentHTML("beforeend", pageHTML);
    }
    this.renderProductsByPage(model.getProductsByPage);
  };
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
    .getProduct(1, PRODUCT_PER_PAGE)
    .then((products) => {
      view.renderProducts(products);
      view.renderProductsByPage(model.getProductsByPage);
    })
    .then(() => {
      view.addCartButton();
      view.renderPagination(totalProduct);
    });

  model.getMenu().then((menu) => {
    view.renderCategoryBar(menu);
    view.renderProductsByCategory(model.getProductByCategory);
    view.renderProductsByPage(model.getProductsByPage);
  });
});
