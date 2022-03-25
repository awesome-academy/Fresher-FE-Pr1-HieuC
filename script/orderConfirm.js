"strict";
const orderCartList = document.querySelector(".ordercart-itemlist");
const orderCartTotal = document.querySelector(".order-carttotal");
const orderAddress = document.querySelector(".order-address");

let cartList = [];
//////////////Model//////////////////
class Model {}

class View {
  initialApp() {
    this.renderCartList();
    this.renderTotal();
    this.renderAddress();
  }

  renderAddress() {
    let addressConfirm = Storage.getOrderConfirm().address;
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
    let orderConfirm = Storage.getOrderConfirm();
    let totalCart = orderConfirm.cart.reduce(
      (total, item) => total + item.price * item.amount,
      0
    );
    console.log(totalCart);
    orderCartTotal.innerText = totalCart;
  }

  renderCartList() {
    Storage.getOrderConfirm().cart.map((item) => {
      const cartHtml = `
       <div class="ordercart-item">
          <img src="${item.img}" alt=${item.title}/>
          <h6>${item.title} <span> x ${item.amount}</span></h6>
        </div>
      `;
      orderCartList.insertAdjacentHTML("afterbegin", cartHtml);
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
    localStorage.removeItem("newOrder", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const view = new View();

  view.initialApp();
});
