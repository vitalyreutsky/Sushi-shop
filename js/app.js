const cartWrapper = document.querySelector(".cart-wrapper");

//Добавляем прослушку на всем окне
window.addEventListener("click", (event) => {
  //Обьявляем переменную для счетчика
  let counter;
  if (
    event.target.dataset.action === "plus" ||
    event.target.dataset.action === "minus"
  ) {
    const counterWrapper = event.target.closest(".counter-wrapper");
    counter = counterWrapper.querySelector("[data-counter]");
  }

  //Проверяем является ли элемент по которому был совершен клик кнопкой Плюс
  if (event.target.dataset.action === "plus") {
    counter.innerText = ++counter.innerText;
  }

  //Проверяем является ли элемент по которому был совершен клик кнопкой Минус
  if (event.target.dataset.action === "minus") {
    if (parseInt(counter.innerText) > 1) {
      counter.innerText = --counter.innerText;
    } else if (
      // Проверка на товар каторый находится в корзине
      event.target.closest(".cart-wrapper") &&
      parseInt(counter.innerText) === 1
    ) {
      // Удаляем товар из корзины
      event.target.closest(".cart-item").remove();

      toggleCartStatus();

      //Пересчет общей стоимости в корзине
      calcCartPriceAndDelivery();
    }
  }

  //  Проверяем клик на + или - внутри корзины
  if (
    event.target.hasAttribute("data-action") &&
    event.target.closest(".cart-wrapper")
  ) {
    calcCartPriceAndDelivery();
  }
});

//Добавляем прослушку на всем окне, находим кнопку "добавить в корзину"
window.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-cart")) {
    // Находим карточку товара
    const cart = event.target.closest(".card");

    // Собираем данные с карточки
    const productInfo = {
      id: cart.dataset.id,
      imgSrc: cart.querySelector(".product-img").getAttribute("src"),
      title: cart.querySelector(".item-title").innerText,
      itemInBox: cart.querySelector("[data-items-in-box]").innerText,
      weight: cart.querySelector(".price__weight").innerText,
      price: cart.querySelector(".price__currency").innerText,
      counter: cart.querySelector("[data-counter]").innerText,
    };

    // Проверяеем если ли уже такой товар в корзине
    const itemInCart = cartWrapper.querySelector(
      `[data-id='${productInfo.id}']`
    );
    if (itemInCart) {
      const counterEl = itemInCart.querySelector("[data-counter]");
      counterEl.innerText =
        parseInt(counterEl.innerText) + parseInt(productInfo.counter);
    } else {
      // Если товара нету в корзине

      //Собранные данные подставим в шаблон для товара в корзине
      const cartItemHTML = `
    <div class="cart-item" data-id="${productInfo.id}">
      <div class="cart-item__top">
         <div class="cart-item__img">
            <img src="${productInfo.imgSrc}" alt="">
         </div>
         <div class="cart-item__desc">
            <div class="cart-item__title">${productInfo.title}</div>
            <div class="cart-item__weight">${productInfo.itemInBox} / ${productInfo.weight} </div>

            <div class="cart-item__details">

               <div class="items items--small counter-wrapper">
                  <div class="items__control" data-action="minus">-</div>
                  <div class="items__current" data-counter="">${productInfo.counter}</div>
                  <div class="items__control" data-action="plus">+</div>
               </div>

               <div class="price">
                  <div class="price__currency">${productInfo.price}</div>
               </div>
            </div>

         </div>
      </div>
   </div>
    `;

      // Отобразим товар в корзину
      cartWrapper.insertAdjacentHTML("beforeend", cartItemHTML);
    }

    // Сбрасываем счетчик на единицу
    cart.querySelector("[data-counter]").innerText = 1;

    // Отображение товара в корзине
    toggleCartStatus();

    // Пересчет общей стоимости товара корзины
    calcCartPriceAndDelivery();
  }
});

// Вычисляем общую сумму в корзине
function calcCartPriceAndDelivery() {
  const cartItems = document.querySelectorAll(".cart-item");
  const totalPriceEl = document.querySelector(".total-price");
  const deliveryCost = document.querySelector(".delivery-cost");
  const cartDelivery = document.querySelector("[data-cart-delivery]");

  let totalPrice = 0;

  cartItems.forEach((item) => {
    const amountEl = item.querySelector("[data-counter]");
    const priceEl = item.querySelector(".price__currency");

    const currentPrice =
      parseInt(amountEl.innerText) * parseInt(priceEl.innerText);
    totalPrice += currentPrice;
  });

  //  Отображаем цену на странице
  totalPriceEl.innerText = totalPrice;

  //  Скрываем или показываем блок с стоимостью доставки
  if (totalPriceEl.innerText > 0) {
    cartDelivery.classList.remove("none");
  } else {
    cartDelivery.classList.add("none");
  }

  if (totalPriceEl.innerText >= 20) {
    deliveryCost.classList.add("free");
    deliveryCost.innerText = "Бесплатно";
  } else {
    deliveryCost.classList.remove("free");
    deliveryCost.innerText = "1$";
  }
}

//Скрываем лишние элементы в корзине
function toggleCartStatus() {
  const cartWrapper = document.querySelector(".cart-wrapper");
  const cartEmpty = document.querySelector("[data-cart-empty]");
  const orderForm = document.querySelector("#order-form");

  if (cartWrapper.children.length > 0) {
    cartEmpty.classList.add("none");
    orderForm.classList.remove("none");
  } else {
    cartEmpty.classList.remove("none");
    orderForm.classList.add("none");
  }
}

//Работа с JSON
const productsContainer = document.querySelector("#products-container");

getProducts();

//Ассихронная функция получения данных из файла product.json
async function getProducts() {
  const response = await fetch("./js/products.json");

  //  Парсим данные из JSON формата в JS
  const productsArray = await response.json();

  //  Запускаем функцию рендера (отображение товаров)
  renderProducts(productsArray);
}

function renderProducts(productsArray) {
  productsArray.forEach((item) => {
    const productHTML = `
      <div class="col-md-6">
         <div class="card mb-4" data-id="${item.id}">
            <img class="product-img" src="img/roll/${item.imgSrc}" alt="">
            <div class="card-body text-center">
               <h4 class="item-title">${item.title}</h4>
               <p><small data-items-in-box class="text-muted">${item.itemInBox} шт.</small></p>

               <div class="details-wrapper">
                  <div class="items counter-wrapper">
                     <div class="items__control" data-action="minus">-</div>
                     <div class="items__current" data-counter>1</div>
                     <div class="items__control" data-action="plus">+</div>
                  </div>

                  <div class="price">
                     <div class="price__weight">${item.weight}г.</div>
                     <div class="price__currency">${item.price} $</div>
                  </div>
               </div>

               <button data-cart type="button" class="btn btn-block btn-outline-warning">+ в корзину</button>

            </div>
         </div>
      </div>
      `;

    productsContainer.insertAdjacentHTML("beforeend", productHTML);
  });
}
