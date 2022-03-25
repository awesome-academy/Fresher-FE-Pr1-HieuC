"strict";
const addressExists = document.querySelector(".address-exists");
const checkoutCart = document.querySelector(".checkout-cartlist");
const checkoutSum = document.querySelector(".checkout-sum");
const checkoutTotal = document.querySelector(".checkout-total");
const sendOrderBtn = document.querySelector(".checkout-btn");
const addressListContain = document.querySelector(".address-list");
const addAddressBtn = document.querySelector(".add-address");

let cart = [];
let addressList = [];
let newAddress = { isDefault: true };
let defaultAddress = {};
let addressDOM = [];

//////////////Model//////////////////
class Model {
  getDefaultAddress = function (list) {
    defaultAddress = list.find((addr) => addr.isDefault === true);
  };

  getAddress = async function () {
    try {
      const res = await fetch("http://localhost:3000/address");
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      addressList = data;
      this.getDefaultAddress(addressList);
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
      Storage.deleteCart();
      Storage.saveNewOrder(order);
      window.location.href = "http://localhost:5000/orderConfirm.html";
    } catch (err) {
      console.log(err);
    }
  };

  addNewAddress = async function () {
    const view = new View();
    addAddressBtn.addEventListener("click", async () => {
      try {
        await fetch(`http://localhost:3000/address/${defaultAddress.id}`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isDefault: false }),
        });
        await fetch("http://localhost:3000/address", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAddress),
        });
        this.rerenderAddress();
      } catch (err) {
        console.log(err);
      }
    });
  };

  changeDefaultAddress() {
    const addressBtn = document.querySelectorAll(".address-item");
    addressDOM = addressBtn;
    addressDOM.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const oldDefaultAddress = addressList.find(
          (address) => address.isDefault == true
        );
        try {
          await fetch(
            `http://localhost:3000/address/${btn.dataset.addressid}`,
            {
              method: "PATCH",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ isDefault: true }),
            }
          );
          await fetch(`http://localhost:3000/address/${oldDefaultAddress.id}`, {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isDefault: false }),
          });
          this.rerenderAddress();
        } catch (err) {
          console.log(err);
        }
      });
    });
  }

  rerenderAddress = async function () {
    const view = new View();
    const res = await fetch("http://localhost:3000/address");
    const newAddressList = await res.json();
    addressList = newAddressList;
    this.getDefaultAddress(addressList);
    addressExists.innerHTML = "";
    addressListContain.innerHTML = "";
    view.renderDefaultAddress(
      addressList.find((address) => address.isDefault === true)
    );
    view.renderAddressList(
      addressList.filter((address) => address.isDefault === false)
    );
  };
}

class View {
  initialApp() {
    cart = Storage.getCart();
    this.renderCheckoutCart(cart);
    this.formInputChange();
  }

  renderDefaultAddress(address) {
    const model = new Model();
    for (const [key, value] of Object.entries(address)) {
      let addressEle = `
          <label
          >${key}
                <p>${value}</p>
          </label>
      `;
      if (key == "isDefault" || key == "id") {
        addressEle = "";
      }
      addressExists.insertAdjacentHTML("beforeend", addressEle);
    }
    model.changeDefaultAddress();
  }

  renderAddressList(list) {
    const model = new Model();
    list.map((address) => {
      let addressHTML = `<div class=address-item data-addressId =${address.id}><p>${address.name} ${address.lastname}, ${address.addr},${address.city} - ${address.phone}</p></div>`;
      addressListContain.insertAdjacentHTML("beforeend", addressHTML);
    });
    model.changeDefaultAddress();
  }

  renderCheckoutCart(cartlist) {
    const model = new Model();
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

  formInputChange() {
    let formLabel = [
      "name",
      "lastname",
      "addr",
      "city",
      "nation",
      "zipcode",
      "phone",
    ];
    formLabel.map((label) => {
      document
        .querySelector(`.address-${label}`)
        .addEventListener("change", (e) => {
          newAddress[`${label}`] = e.target.value;
        });
    });
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
    .then(() => {
      let defaultAddress = addressList.filter((add) => add.isDefault === true);
      let unDefaultAddress = addressList.filter(
        (add) => add.isDefault === false
      );
      view.renderDefaultAddress(defaultAddress[0]);
      view.renderAddressList(unDefaultAddress);
      model.changeDefaultAddress();
    })
    .then(() => {
      sendOrderBtn.addEventListener("click", () => {
        if (cart.length > 0) {
          model.sendOrder({ cart, defaultAddress });
        }
      });
    });

  model.addNewAddress();
});
