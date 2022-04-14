"strict";
const orderCartList = document.querySelector(".ordercart-itemlist");
const orderCartTotal = document.querySelector(".order-carttotal");
const orderAddress = document.querySelector(".order-address");
const orderconfirmContainer = document.querySelector(".orderconfirm-container");
const backHomeBtn = document.querySelector(".order-backhome");

let orderConfirm = {};
//////////////Model//////////////////
class Model {}

class View {
  initialApp() {
    orderConfirm = Storage.getOrderConfirm();
    console.log(typeof orderConfirm, Object.keys(orderConfirm).length);
    if (Object.keys(orderConfirm).length == 0) {
      orderconfirmContainer.innerHTML = `<h3>Not new order</h3>`;
      document.querySelector(".progressbar").innerHTML = "";
    } else {
      this.renderCartList();
      this.renderTotal();
      this.renderAddress();
    }
  }

  renderAddress() {
    let addressConfirm = orderConfirm.defaultAddress;
    let addressHtml = `
       <label
          >Tên
          <p>${addressConfirm.name}</p>
        </label>
        <label
          >SDT
          <p>${addressConfirm.phone}</p>
        </label>
        <p>${addressConfirm.addr}</p>
    `;
    orderAddress.innerHTML = addressHtml;
  }

  renderTotal() {
    let totalCart = orderConfirm.cart.reduce(
      (total, item) => total + item.price * item.amount,
      0
    );
    orderCartTotal.innerText = totalCart;
  }

  renderCartList() {
    orderConfirm.cart.map((item) => {
      const cartHtml = `
       <div class="ordercart-item">
          <img src="${item.img}" alt=${item.title}/>
          <h6>${item.title} <span> x ${item.amount}</span></h6>
        </div>
      `;
      orderCartList.insertAdjacentHTML("afterbegin", cartHtml);
    });
  }

  backToHomePage() {
    backHomeBtn.addEventListener("click", () => {
      Storage.deleteOrderConfirm();
      window.location.href = "http://localhost:5000/product-list.html";
    });
  }
}

class Storage {
  static getOrderConfirm() {
    return localStorage.getItem("newOrder")
      ? JSON.parse(localStorage.getItem("newOrder"))
      : [];
  }

  static deleteOrderConfirm() {
    localStorage.removeItem("newOrder", JSON.stringify("newOrder"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const view = new View();

  view.initialApp();
  view.backToHomePage();
});

window.addEventListener("beforeunload", () => {
  Storage.deleteOrderConfirm();
});
