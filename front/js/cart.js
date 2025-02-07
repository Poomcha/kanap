// On teste le pathname de la page pour savoir si on est sur cart.html ou confirmation.html.
if (document.location.pathname.endsWith("/front/html/cart.html")) {
  // Intégration des données du panier :

  // Adresse URL de l'API
  const productsAddress = "http://localhost:3000/api/products";
  // Élément parent de l'HTML à insérer (les produits)
  const panierParent = document.getElementById("cart__items");
  // Élment à insérer pour le total du nombre d'articles
  const totalArticle = document.getElementById("totalQuantity");
  // Élément à insérer pour le total du prix
  const totalPrice = document.getElementById("totalPrice");

  /**
   * Envoie une requête à l'API en utilisant fetch,
   * récupère les données de l'API sous la forme d'un
   * tableau d'objet.
   * @returns { Array.{<colors: Array.<String>, _id: String, name: String, price: Integer,  imageUrl: String, description: String, altTxt: String>} }
   */
  async function receive() {
    return await fetch(productsAddress)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (data) {
        return data;
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  /**
   * Retourne le contenu du panier sous forme de tableau s'il existe, false sinon.
   * @returns { Array.{<colors: Array.<String>, _id: String, name: String, price: Integer,  imageUrl: String, description: String, altTxt: String>} | Boolean{false} }
   */
  function getCart() {
    if (localStorage.cart) {
      return JSON.parse(localStorage.cart);
    }
    return undefined;
  }

  /**
   * Stock le panier entier à jour dans le localStorage
   * @param { Array.{<colors: Array.<String>, _id: String, name: String, price: Integer,  imageUrl: String, description: String, altTxt: String>} } cart
   */
  function setCart(cart) {
    localStorage.cart = JSON.stringify(cart);
  }

  /**
   * Retourne un tableau des données à intégrer.
   * @returns { Array.{<color: String, _id: String, name: String, price: Integer, imageUrl: String, altTxt: String>} }
   */
  async function dataToIntegrate() {
    const products = await receive();
    const productInCart = getCart();
    const data = [];
    // Parcours le panier :
    for (product of productInCart) {
      ({ id, color, quantity } = product);
      const dataFromDatas = [];
      // Stock les produits du panier.
      dataFromDatas.push(id, color, quantity);
      // Parcours l'ensemble des produits de l'API:
      for (prdt of products) {
        // Si l'ID correspond on ajoute les autres attributs aux datas.
        if (prdt._id === id) {
          dataFromDatas.push(prdt.name, prdt.price, prdt.imageUrl, prdt.altTxt);
        }
      }
      data.push(dataFromDatas);
    }
    return data;
  }

  /**
   * Crée le model à insérer dans le DOM à partir des données
   * à intégrer, retourne ce model
   * @param { Array.{<color: String, _id: String, name: String, price: Integer, imageUrl: String, altTxt: String>} } data
   * @returns { String }
   */
  function createHTMLModel(data) {
    const [id, color, quantity, name, price, imageUrl, altTxt] = data;
    const model = `<article class="cart__item" data-id="${id}">
            <div class="cart__item__img">
                <img src="${imageUrl}" alt="${altTxt}">
            </div>
            <div class="cart__item__content">
                <div class="cart__item__content__titlePrice">
                    <h2>${name} ${color}</h2>
                    <p>${price} €</p>
                </div>
                <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                        <p>Qté : </p>
                        <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                        <p class="deleteItem">Supprimer</p>
                    </div>
                </div>
            </div>
        </article>`;
    return model;
  }

  /**
   * Crée l'HTML du panier à intégrer.
   * @returns { String }
   */
  async function createHTML() {
    const data = await dataToIntegrate();
    let html = "";
    for (item of data) {
      html += createHTMLModel(item);
    }
    return html;
  }

  /**
   * Retourne le nombre total d'articles dans le panier.
   * @returns { Integer }
   */
  function getTotalArticles() {
    const cart = getCart();
    let total = 0;
    for (product of cart) {
      total += parseInt(product.quantity);
    }
    return total;
  }

  /**
   * Retourne le prix total.
   * @returns { Integer }
   */
  function getTotalPrice() {
    const pricesCtn = document.querySelectorAll(
      ".cart__item__content__titlePrice > p"
    );
    const quantity = document.querySelectorAll(".itemQuantity");
    let prices = 0;
    let i = 0;
    for (p of pricesCtn) {
      const price = parseInt(p.innerText.replace("€", ""));
      prices += parseInt(quantity[i].value) * price;
      i++;
    }
    return prices;
  }

  /**
   * Intègre l'HTML dans le DOM.
   */
  async function publishHTML() {
    // Intégration du panier :
    panierParent.innerHTML = await createHTML();
    // Intégration du total d'article / prix :
    totalArticle.textContent = getTotalArticles();
    totalPrice.textContent = getTotalPrice();
  }

  // Possibilité de modification / suppression :

  /**
   * Retourne l'ID de l'élément grâce à Element.closest().
   * @param { HTMLElement } element
   * @returns { String }
   */
  function getID(element) {
    // On accède à data-id grâce à dataset.id.
    return element.closest(".cart__item").dataset.id;
  }

  /**
   * Retourne la couleur de l'élément.
   * @param { HTMLElement } element Élément sur écoute
   */
  function getColor(element) {
    const parent = element.closest(".cart__item__content");
    const parentChildText = parent.querySelector("h2").innerText;
    const splitText = parentChildText.split(" ");
    // Retourne le dernier élément de la liste.
    return splitText[splitText.length - 1];
  }

  /**
   * Modifie le localStorage à partir de l'ID d'un item et de quantité
   * @param { Array.<String> } item
   */
  function modifyCart(item) {
    const [id, color, quantity] = item;
    const cart = getCart();
    for (product of cart) {
      if (product.id === id && product.color === color) {
        product.quantity = quantity;
      }
    }
    setCart(cart);
  }

  /**
   * Supprime un article de localStorage et du DOM.
   * @param { Array.<String> } item
   */
  function supItem(item) {
    const cart = getCart();
    const [id, color] = item;
    setCart(
      // Retourne un nouveau tableau qui ne contient plus l'item à supprimer.
      cart.filter((product) => !(product.id === id && product.color === color))
    );
  }

  async function cartMod() {
    const cart = getCart();
    if (cart) {
      await publishHTML();
      // Élément sur lequel on écoute le chgt
      const quantityChanger = document.querySelectorAll(".itemQuantity");
      // Élément sur lequel on écoute la suppression
      const sup = document.querySelectorAll(".deleteItem");
      let i = 0;
      // Création d'un Event Listener de modification pour chaque élément du panier.
      for (i; i < cart.length; i++) {
        quantityChanger[i].addEventListener("input", function () {
          modifyCart([getID(this), getColor(this), this.value]);
          totalArticle.textContent = getTotalArticles();
          totalPrice.textContent = getTotalPrice();
        });
        // Création d'un Event Listener de suppression pour chaque élément du panier.
        sup[i].addEventListener("click", function () {
          supItem([getID(this), getColor(this)]);
          panierParent.removeChild(this.closest(".cart__item"));
          totalArticle.textContent = getTotalArticles();
          totalPrice.textContent = getTotalPrice();
        });
      }
    }
  }

  cartMod();

  // Validation de la commande :

  // Élément à écouter
  const formDatas = document.querySelector(".cart__order__form");

  /**
   * Change le texte d'un élément grâce à son id.
   * @param { String } id
   * @param { String } txt
   */
  function setInnerText(id, txt) {
    document.getElementById(id).innerText = txt;
  }

  /**
   * Check si les données entrées par l'utilisateur sont correctes, retourne true si oui
   * false sinon.
   * @param { Object.<firstName: String, lastName: String, address: String, city: String, email: String> } contact
   * @returns { Boolean }
   */
  function checkEntries(contact) {
    // Le panier existe :
    if (localStorage.cart) {
      const nameMask = /[^A-Za-zÀ-ÿ'\- ]/g;
      const nameCharAuth = `Saisie invalide.
            Caractères autorisés : A-Z a-z À-ÿ`;
      const addressMask =
        /\d{1,}[bis|ter]{0,1} [A-Za-z \-\']{3,} [A-Za-z \-\']{2,}/g;
      const addressFormat = `Adresse invalide.
            Format autorisé : 19 Rue des Trucs`;
      const emailMask =
        /^[0-9A-Za-z]{1,}[\.\-]{0,1}[A-Za-z0-9]{1,}@[A-Za-z0-9]{1,}[\.\-]{0,1}[A-Za-z0-9]{1,}\.[A-Za-z0-9]{1,}[\.\-]{0,1}[A-Za-z0-9]{1,}$/g;
      const emailFormat = `Email invalid.
            Format autorisé : exemple@mail.com`;

      if (nameMask.test(contact.firstName)) {
        setInnerText("firstNameErrorMsg", nameCharAuth);
      } else {
        setInnerText("firstNameErrorMsg", "");
      }

      if (nameMask.test(contact.lastName)) {
        setInnerText("lastNameErrorMsg", nameCharAuth);
      } else {
        setInnerText("lastNameErrorMsg", "");
      }

      if (!contact.address.match(addressMask)) {
        setInnerText("addressErrorMsg", addressFormat);
      } else {
        setInnerText("addressErrorMsg", "");
      }

      if (nameMask.test(contact.city)) {
        setInnerText("cityErrorMsg", nameCharAuth);
      } else {
        setInnerText("cityErrorMsg", "");
      }

      if (!contact.email.match(emailMask)) {
        setInnerText("emailErrorMsg", emailFormat);
      } else {
        setInnerText("emailErrorMsg", "");
      }
      // Si un des formats n'est pas respecté, retourne false, true sinon.
      if (
        nameMask.test(contact.firstName) ||
        nameMask.test(contact.lastName) ||
        nameMask.test(contact.city) ||
        !contact.address.match(addressMask) ||
        !contact.email.match(emailMask)
      ) {
        return false;
      } else {
        return true;
      }
    }
    // Le panier n'existe pas :
    else {
      alert(
        "Votre panier est vide !\nAjouter des articles avant de commander."
      );
      return false;
    }
  }

  /**
   * Retourne la valeur d'un élément <input> grâce à son id.
   * @param { String } id
   * @returns { String }
   */
  function getValue(id) {
    return document.getElementById(id).value;
  }

  /**
   * Retourne l'Array d'id au format JSON à envoyer à l'API pour passer la commande.
   * @returns { Array.<String> }
   */
  function getIDs() {
    cart = getCart();
    // Crée un nouveau tableau avec seulement les id de cart :
    return cart.map((product) => (product = product.id));
  }

  /**
   * Prend en paramètre le contact à envoyer à l'API, retourne la réponse de l'API.
   * @param { Object.<firstName: String, lastName: String, address: String, city: String, email: String> } datas
   * @returns { Object.<contact: Object, products: Array, orderId: String> }
   */
  async function sendDatas(datas) {
    const dataToPost = {
      contact: datas,
      products: getIDs(),
    };
    return await fetch("http://localhost:3000/api/products/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToPost),
    }).then(function (data) {
      return data.json();
    });
  }

  formDatas.addEventListener("submit", async function (evnmt) {
    // Empêche la page de se recharger :
    evnmt.preventDefault();
    // Récupère les valeurs des inputs dans un objet contact :
    const people = {
      firstName: getValue("firstName"),
      lastName: getValue("lastName"),
      address: getValue("address"),
      city: getValue("city"),
      email: getValue("email"),
    };
    // Validation des entrées de l'utilisateur :
    if (checkEntries(people)) {
      const confirmationDatas = await sendDatas(people);
      const orderId = confirmationDatas.orderId;
      document.location.href = "./confirmation.html?orderid=" + orderId;
    }
  });
} else {
  // Affichage de l'ID de commande :
  let searchParam = new URLSearchParams(new URL(document.location.href).search);
  document.getElementById("orderId").innerText =
    "\n\n" + searchParam.get("orderid");
  localStorage.clear();
}
