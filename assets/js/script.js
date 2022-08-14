// $ = document.querySelector
// $$ = document.querySelectorAll

// btn nav
let btn_nav = document.querySelector("#btn-nav");
let hide_nav = document.querySelector(".nav");
let btn_nav_text_menu = document.querySelector(".nav_text_menu");
let btn_cook = document.querySelector(".img_pick");

btn_nav.onclick = () => hide_nav.classList.toggle("active");
btn_nav_text_menu.onclick = () =>
  btn_nav_text_menu.classList.toString("active");

// API HTTP POST
async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json();
}
//========================

//check keys

// async function sha256(message) {
//     // encode as UTF-8
//     const msgBuffer = new TextEncoder().encode(message);
//     // hash the message
//     const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
//     // convert ArrayBuffer to Array
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     // convert bytes to hex string
//     const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//     return hashHex;
// }

async function getKeys() {
  const data = await postData("http://192.168.100.15:1880/get-keys");
  const secret = data[0].value;
  const hash_secret = data[1].value;
  const sha_secret = await SHA256(secret);
  let string_timetamps = new Date().getTime().toString();
  const security = await SHA256(
    "Ujabudr75623m" + hash_secret + string_timetamps
  );
  arrBufferSha = {
    secret: sha_secret,
    security: security,
    timestamps: string_timetamps,
  };
  return arrBufferSha;
}

//==================================

// onload reset page
let home_food_img = document.getElementById("id-img-food");
let home_food_id = document.getElementById("id-food");
let home_food_name = document.getElementById("id-name-food");
let menu_num_cart = document.getElementById("id-num-cart");

async function onloadWeb() {
  const data = await postData("http://192.168.100.15:1880/random-food", {
    keys: await getKeys(),
  });
  const category = await postData("http://192.168.100.15:1880/category", {
    keys: await getKeys(),
  });
  home_food_img.src = data.img;
  home_food_id.innerHTML = data.id_food;
  home_food_name.innerHTML = data.name_food;
  menu_num_cart.innerHTML = "0";
  addTagCategory(category);
}

function addTagCategory(category) {
  let element_category = document.getElementById("category");
  let htmlCategory = category.map((item) => `<div> - ${item} </div>`);
  element_category.innerHTML = htmlCategory.join("\n");
}
//=============================

// btn cook in home tab
btn_cook.onclick = async function () {
  let id_food = document.getElementById("id-food").innerText;
  let keys = await getKeys();
  postData("http://192.168.100.15:1880/", {
    btnName: "btn_cook",
    idFood: id_food,
    keys,
  });
};

const arrBufferFood = [];
// function Show Food
function showFood(data_category) {
  let element_showFood = document.getElementById("menu-food-name");
  for (let i = 0; i < 3; i++) {
    data_category.push({
      name_food: "NoN",
      img: "https://giadinh.mediacdn.vn/thumb_w/640/296230595582509056/2021/7/16/photo-3-1626423417722216381475.jpg",
    });
  }

  let html_img_ShowFood = data_category.map(function (item) {
    return `<div class="imgbg">
                            <img src="${item.img}" alt="${item.name_food}">
                                <i class='bx bxs-plus-circle'>
                                    <div class="title_food_name">${item.name_food}</div>
                                </i>
                        </div>`;
  });
  if (data_category.length > 3) data_category = arrBufferFood;
  element_showFood.innerHTML = html_img_ShowFood.join("\n");
}

// btn category
const query_div_category = document.getElementById("category");
query_div_category.onclick = async function (e) {
  let click_category = e.target.innerText;
  let keys = await getKeys();
  const data_category = await postData(
    "http://192.168.100.15:1880/query-category",
    { category: click_category, keys }
  );
  showFood(data_category);
};

//btn next
element_btn_next = document.getElementById("btn-next-item");
element_btn_next.onclick = function () {};

//=============================

// function check has item

// function num-cart sum
let arrBufferCart = [];
function checkItem(namecheck) {
  return arrBufferCart.findIndex(items =>
    items.cart_food_name === namecheck
  );
}

function pushArrCart(name, amount) {
  if (name == "NoN") return;
  var indexName = checkItem(name);
  const item = {
    cart_food_name: `${name}`,
    cart_food_amount: amount,
  };

  if (indexName < 0) {
    arrBufferCart.push(item);
    return;
  }
  arrTemp = arrBufferCart[indexName];
  item.cart_food_amount = arrTemp.cart_food_amount + 1
  arrBufferCart[indexName] = item;
}

const query_i_menufoodname = document.getElementById("menu-food-name");
query_i_menufoodname.onclick = function (e) {
  let totalOder = 0;
  let click_add_food = e.target.innerText;
  if (click_add_food == "") return;

  pushArrCart(click_add_food, 1);
  arrBufferCart.forEach((item) => {
    totalOder += parseInt(item.cart_food_amount);
  });
  document.getElementById("id-num-cart").innerText = totalOder;
};

let btn_cart = document.querySelector(".cart");
btn_cart.onclick = () => {
  render();
};

function removeItem(index) {
  arrBufferCart.splice(index, 1);
  render();
}

function updateAmount(index, amount) {
  if (amount < 1) {
    return;
  }

  arrBufferCart[index].cart_food_amount = amount;
  render();
}

function render() {
  let total = 0;
  arrBufferCart.forEach((item) => {
    total += parseInt(item.cart_food_amount);
  });

  const html = arrBufferCart
    .map(
      (item) => `
        <div class="sub_item">
        <div class="cart_food_name">${item.cart_food_name}
            <div class="cart_food_num">${item.cart_food_amount}</div>
            <div class="add"> + </div>
            <div class="subtract"> - </div>
            <div class="delete"> x </div>
        </div>
        </div>
    `
    )
    .join("\n");
  document.getElementById("id-cart-content").innerHTML = html;
  document.getElementById("id-sum-in-cart").innerText = total;
  document.getElementById("id-num-cart").innerText = total;
  document.querySelector(".cart").classList.toggle("active");
  document.querySelector(".cart_content").classList.toggle("active");

  const btn_add = [...document.querySelectorAll(".add")];
  const btn_sub = [...document.querySelectorAll(".subtract")];
  const btn_delete = [...document.querySelectorAll(".delete")];

  for (let i = 0; i < btn_sub.length; i++) {
    btn_sub[i].addEventListener("click", () => {
      updateAmount(i, arrBufferCart[i].cart_food_amount - 1);
    });
    btn_add[i].addEventListener("click", () => {
      updateAmount(i, arrBufferCart[i].cart_food_amount + 1);
    });
    btn_delete[i].addEventListener("click", () => {
      removeItem(i);
    });
  }
}

//btn cook in cart content
let btn_cook_in_cart = document.getElementById("btn-cook-in-cart");
btn_cook_in_cart.onclick = async function () {
  keys = await getKeys();
  postData("http://192.168.100.15:1880/cook-in-cart", { arrBufferCart, keys });
};
