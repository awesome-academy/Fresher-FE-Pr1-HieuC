"strict";
const cartList = document.querySelector(".cart-table-content");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".cart-clear");

let cart = [];
let cartItemEvent = [];

//////////////Model//////////////////

class View {
  initialApp() {
    cart = Storage.getCart();
    this.setcartValues();
  }

  setcartValues() {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = tempTotal;
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setcartValues();
    Storage.saveCart(cart);
  }

  clearCart() {
    // let cartItems = cart.map((item) => item.id);
    // cartItems.forEach((id) => this.removeItem(id));
    // while (cartList.children.length > 0) {
    //   cartList.removeChild(cartList.children[0]);
    // }
    cart = [];
    this.setcartValues();
    Storage.saveCart(cart);
    cartList.innerHTML = "";
  }

  renderCart() {
    cart.map((cartItem) => {
      const cartHtml = `
            <tr class="cart-item">
              <th><img src="${cartItem.img}" /></th>
              <th>${cartItem.title}</th>
              <th class="hightlight-column">${cartItem.price}</th>
              <th >
               <div class="cart-amountCtr">
                <i class="fa-solid fa-plus cart-up" data-id=${cartItem.id}></i>
                <p class="item-amount" data-id=${cartItem.id}>${
        cartItem.amount
      }</p>
                <i class="fa-solid fa-minus cart-down" data-id=${
                  cartItem.id
                }></i>
               </div> 
              </th>
              <th class="hightlight-column item-sum" data-id=${cartItem.id}>${
        cartItem.price * cartItem.amount
      }</th>
              <th><i class="fa-solid fa-trash" data-id=${cartItem.id}></i></th>
            </tr>
      `;
      cartList.insertAdjacentHTML("afterbegin", cartHtml);
    });
  }

  updateCart(productId, amount, total) {
    const itemAmountList = [...document.querySelectorAll(".item-amount")];
    const itemSumList = [...document.querySelectorAll(".item-sum")];
    itemAmountList.forEach((item) => {
      if (item.dataset.id === productId) {
        item.innerText = amount;
      }
    });
    itemSumList.forEach((item) => {
      if (item.dataset.id === productId) {
        item.innerText = total;
      }
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartList.addEventListener("click", (e) => {
      const controlBtn = e.target;
      const productId = controlBtn.dataset.id;
      let tempItem = cart.find((item) => item.id === productId);
      if (e.target.classList.contains("cart-up")) {
        tempItem.amount += 1;
        let tempTotal = tempItem.amount * tempItem.price;
        this.setcartValues(cart);
        Storage.saveCart(cart);
        this.updateCart(productId, tempItem.amount, tempTotal);
      }
      if (e.target.classList.contains("cart-down")) {
        tempItem.amount -= 1;
        let tempTotal = tempItem.amount * tempItem.price;
        if (tempItem.amount > 0) {
          this.setcartValues(cart);
        } else {
          cartList.removeChild(
            controlBtn.parentElement.parentElement.parentElement
          );
          this.removeItem(productId);
        }
        Storage.saveCart(cart);
        this.updateCart(productId, tempItem.amount, tempTotal);
      }
      if (e.target.classList.contains("fa-trash")) {
        const trashBtn = document.querySelector(".fa-trash");
        cartList.removeChild(trashBtn.parentElement.parentElement);
        this.removeItem(productId);
      }
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
  const view = new View();

  view.initialApp();
  view.renderCart();
  view.cartLogic();
});
