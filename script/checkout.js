"strict";
const addressExists = document.querySelector(".address-exists");
const checkoutCart = document.querySelector(".checkout-cartlist");
const checkoutSum = document.querySelector(".checkout-sum");
const checkoutTotal = document.querySelector(".checkout-total");
const sendOrderBtn = document.querySelector(".checkout-btn");

let cart = [];
let address = {};

//////////////Model//////////////////
class Model {
  getAddress = async function () {
    try {
      const res = await fetch("http://localhost:3000/address/add01");
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      address = data;
      return address;
    } catch (err) {
      console.log(err);
    }
  };

  sendOrder = async function (order) {
    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      const content = await res.json();
      Storage.deleteCart();
      Storage.saveNewOrder(order);
    } catch (err) {
      console.log(err);
    }
  };
}

class View {
  initialApp() {
    cart = Storage.getCart();
    this.renderCheckoutCart(cart);
  }

  renderAddress(address) {
    for (const [key, value] of Object.entries(address)) {
      const addressEle = `
          <label
          >${key}
                <p>${value}</p>
          </label>
      `;
      addressExists.insertAdjacentHTML("beforeend", addressEle);
    }
  }

  renderCheckoutCart(cartlist) {
    let totalItems = 0;
    let sum = 0;
    if (cartlist.length == 0) {
      checkoutCart.innerHTML = "<h3>Cart is empty</h3>";
      return;
    }
    cartlist.map((cartItem) => {
      totalItems += cartItem.amount;
      sum += cartItem.price * cartItem.amount;
      const htmlCartItem = `
              <div class="checkout-cartitem">
                <div class="checkout-cartitem__img">
                  <img src="${cartItem.img}" />
                </div>
                <p>${cartItem.description}</p>
                <div>
                 <p>${cartItem.title}</p>
                 <p><strong>x ${cartItem.amount}</strong></p>
                </div>
              </div>
      `;
      checkoutCart.insertAdjacentHTML("beforeend", htmlCartItem);
    });
    checkoutSum.innerText = sum;
    checkoutTotal.innerText = sum + 20000;
  }
}

class Storage {
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static deleteCart() {
    localStorage.removeItem("cart", JSON.stringify(cart));
  }

  static saveNewOrder(order) {
    localStorage.setItem("newOrder", JSON.stringify(order));
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
    .getAddress()
    .then((address) => {
      view.renderAddress(address);
    })
    .then(() => {
      sendOrderBtn.addEventListener("click", () => {
        if (cart.length > 0) {
          model.sendOrder({ cart, address });
        }
      });
    });
});
