
let productssSelected = [];

/*
  --------------------------------------------------------------------------------------
  Implementação Utius
  --------------------------------------------------------------------------------------
*/

function isValidRequiredFields(fildsValidation) {
  for (let index = 0; index < fildsValidation.length; index++) {
    if (isEmpty(fildsValidation[index])) {
      alert('Preencha todos os campos do produto a ser cadastrado.');
      return false;
    }
    return true;
  }
}

function clearFields(fildsValidation) {
  for (let index = 0; index < fildsValidation.length; index++) {
    document.getElementById(fildsValidation[index]).value = '';
  }
}

function currencyMask(value) {
  var v = value.replace(/\D/g,'');
  v = (v/100).toFixed(2) + '';
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return v;
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

/*
  --------------------------------------------------------------------------------------
  End Utius
  --------------------------------------------------------------------------------------
*/

const getServiceProducts = async (url, method) => {
  fetch(url, {
    method: method,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.produtos) {
        console.log("# data.produtos....: " + JSON.stringify(data.produtos));
        data.produtos.forEach(item => createTableItemsInit(item.id, item.nome, item.quantidade, item.valor, data.produtos));
      } else {
        if (method == 'delete') {
          alert(data.mesage + ' ' + data.id);
        }
        console.log("# result.data...: " + JSON.stringify(data));
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

getServiceProducts('http://127.0.0.1:5000/products/get_all', 'get');

const handleSarchProduct = async () => {
  let inputSarch = document.getElementById("idSarch").value;

  let url = 'http://127.0.0.1:5000/products/sarch_name?nome=' + inputSarch;
  clearRowaTable('productTable');
  getServiceProducts(url, 'get');
}

const clearRowaTable = async (tableName) => {
  var table = document.getElementById(tableName);
  var lengthTable = table.rows.length;

  while (lengthTable > 0) {
    table.deleteRow(0);
  }
}

const createTableItemsInit = (cdProduct, nameProduct, quantity, price, produtos) => {
  let priceMask = currencyMask(price.toString());
  var item = [cdProduct, nameProduct, quantity, priceMask];
  var table = document.getElementById('productTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    if (i == 3) {
      cel.textContent = 'R$ ' + item[i];
    } else {
      cel.textContent = item[i];
    }
  }

  createAddButton(row.insertCell(-1));
  addElementInProductssSelected(produtos);
}

const createAddButton = (parent) => {
  let button = document.createElement("button");
  let txt = document.createTextNode("Selecinar");
  button.type = "button";
  button.className="btn btn-primary btn-sm close";
  button.appendChild(txt);
  parent.appendChild(button);
}

const addElementInProductssSelected = (produtos) => {
  let close = document.getElementsByClassName("close");

  for (let i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeItem = div.getElementsByTagName('td')[0].innerHTML;
      let itemSelected =  produtos.find(p => p.id == nomeItem);

      if (itemSelected) {
        productssSelected.push(itemSelected);
        createTableItemSelected(itemSelected);
        showItensSelected();
      }

      div.remove();
    }
  }
}

const createRemoveButton = (parent) => {
  let button = document.createElement("button");
  let txt = document.createTextNode("Remover");
  button.type = "button";
  button.className="btn btn-primary btn-sm close";
  button.appendChild(txt);
  parent.appendChild(button);
}

const createTableItemSelected = (itemSelected) => {
  let priceMask = currencyMask(itemSelected.valor.toString());
  var item = [itemSelected.id, itemSelected.nome, itemSelected.quantidade, priceMask];
  var table = document.getElementById('itemsTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    if (i == 3) {
      cel.textContent = 'R$ ' + item[i];
    } else {
      cel.textContent = item[i];
    }
  }

  createRemoveButton(row.insertCell(-1));
}

function showItensSelected() {
  var x = document.getElementById("selectedItems");
  if (productssSelected.length > 0) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

const hendleShoping = () => {
  unShowElement('product');
  unShowElement('productDelete');
  showElement('shopping');
  getServiceProducts('http://127.0.0.1:5000/products/get_all', 'get');
}

const hendleProduct = () => {
  unShowElement('shopping');
  unShowElement('productDelete');
  showElement('product');
}

const hendleDeleteProduct = () => {
  unShowElement('shopping');
  unShowElement('product');
  showElement('productDelete');
}

function showElement(element) {
  var x = document.getElementById(element);
  x.style.display = "block";
}

function unShowElement(element) {
  var x = document.getElementById(element);
  x.style.display = "none";
}

const hendleConfirmar = () => {
  console.log("# hendleConfirmar.selecionado....: " + JSON.stringify(productssSelected));
}

const hendleInit = () => {
  showElement('shopping');
  unShowElement('product');
  unShowElement('productDelete');
}

/*
  --------------------------------------------------------------------------------------
  Implementação da seção de produtos
  --------------------------------------------------------------------------------------
*/

const handleInputQuantity = () => {
  let inputQuantity = document.getElementById("inputQuantity").value;
  if (isEmpty(inputQuantity)) { return; }
  document.getElementById("inputQuantity").value = '';
  document.getElementById("inputQuantity").value = inputQuantity.replace(/[^0-9]/g, '');
}

const handleInputPrice = () => {
  let inputPrice = document.getElementById("inputPrice").value;
  document.getElementById("inputPrice").value = currencyMask(inputPrice);
}

const handleProductSave = () => {
  let inputName = document.getElementById("inputName").value;
  let inputQuantity = document.getElementById("inputQuantity").value;
  let inputPrice = document.getElementById("inputPrice").value.replace(',', '.');

  let fildsValidation = [inputName, inputQuantity, inputPrice];
  
  if (!isValidRequiredFields(fildsValidation)) {
    return;
  }

  const formData = new FormData();
  formData.append('nome', inputName);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  postInsertProduct(formData, fildsValidation);
}

const handleInputProductId = () => {
  let inputId = document.getElementById("inputId").value;
  if (isEmpty(inputId)) { return; }
  document.getElementById("inputId").value = '';
  document.getElementById("inputId").value = inputId.replace(/[^0-9]/g, '');
}

const handleProductDelete = () => {
  let inputId = document.getElementById("inputId").value;

  let fildsValidation = [inputId];
  
  if (!isValidRequiredFields(fildsValidation)) {
    return;
  }

  let url = 'http://127.0.0.1:5000/product/delete_id?id=' + inputId;
  getServiceProducts(url, 'delete');

  document.getElementById("inputId").value = '';
}

/*Função para colocar um item na lista do servidor via requisição POST*/
async function postInsertProduct(formData, fildsValidation) {
  try {
    const response = await fetch("http://127.0.0.1:5000/product/add", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (response.status == 200) {
      alert("Produto código " + result.id + " salvo com sucesso.");

      let fildsClear = ["inputName", "inputQuantity", "inputPrice"];
      clearFields(fildsClear);
      console.log("Success:", result);
    } else {
      alert("Erro ao tentar salvar o produto.");
    }
  } catch (error) {
    alert("Erro ao tentar salvar o produto.");
    console.error("Error:", error);
  }
}

hendleInit();
