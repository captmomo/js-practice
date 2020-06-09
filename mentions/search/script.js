
const appData = {
  key: {},
  query: "",
  lastKey: "",
  lastChar: "",
  lastPos: "",
  users: [
    {
      name: "joe",
      email: "joe@joe.com"
    },
    {
      name: "test",
      email: "test@tes.com"
    },
    {
      name: "a",
      email: "a@a.a"
    },
    {
      name: "b",
      email: "b@b.c"
    }
  ]
};

const textBox = document.getElementById("sample");
function checkFocus(elem) {
  return elem === document.activeElement;
}

// get document coordinates of the element
function getCoords(elem) {
  let box = elem.getBoundingClientRect();

  return {
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset
  };
}
const mousePosition = { x: 0, y: 0 };
document.addEventListener(
  "mousemove",
  function (mouseMoveEvent) {
    mousePosition.x = mouseMoveEvent.pageX;
    mousePosition.y = mouseMoveEvent.pageY;
    //console.log("pos", mousePosition);
  },
  false
);
window.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
  doMap("#", "name");
  doMap("@", "email");

  [textBox].forEach((elem) => {
    elem.addEventListener("click", function () {
      if (document.getElementById("tool-tip")) {
        document.getElementById("tool-tip").remove();
      }
      Object.keys(appData.key).forEach((prop) => {
        appData.key[prop]["visible"] = false;
        console.log("visible", appData.key[prop]["visible"]);
      });
    });
  });
});


const isLetter = function (key) {
  return key >= "a" && key <= "z";
};
const isNumber = function (key) {
  return key >= "0" && key <= "9";
};
// Function to check letters and numbers
function alphanumeric(inputtxt) {
  var letterNumber = /^[0-9a-zA-Z]+$/;
  console.log(inputtxt.match(letterNumber));
  return inputtxt.match(letterNumber);
}

const checkChar = function checkKey(key) {
  console.log(key);
  if (key.length !== 1) {
    return false;
  }
  if (isLetter(key) || isNumber(key)) {
    console.log("key", key);
    return true;
  }
};
const doMap = function mapCharToProp(char, prop) {
  appData.key[prop] = { key: char, lastKey: false, visible: false };
  //console.log(appData);
  textBox.addEventListener(
    "keydown",
    function (event) {
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      console.log(event);
      const key = event.key.toLowerCase();
      if (checkFocus(textBox) && (event.key == char)) {
        appData.key[prop]["visible"] = true;
        appData.lastPos = getCaretPos(textBox);
        appData.query = "";
        appData.lastChar = key;
        //showSuggestions(appData.users, prop);
        vanillaShow(appData.users, prop);
        return;
      }
      else if (checkFocus(textBox) && appData.key[prop]["visible"] == true && appData.lastChar == char && checkChar(key)) {
        appData.query = appData.query += key;
        let filtered = appData.users.filter(user => user[prop].includes(appData.query));
        if (filtered.length == 0) {
          resetQuery();
          return;
        }
        vanillaShow(filtered, prop)
        return;
      } else {
        return;
      }
    },
    false
  );
};
const resetQuery = function (prop) {
  removeTooltip('tool-tip');
  appData.query = '';
  appData.key[prop]["visible"] = false;
}
const vanillaShow = function (data, property) {
  if (document.getElementById("tool-tip")) {
    document.getElementById("tool-tip").remove();
  }
  let pos = getCaretPos(textBox);
  let offset = getPixelWidth(getCurrentText(textBox, pos));
  let coords = getCoords(textBox);
  let maxLeft = textBox.clientWidth + coords.left;
  let tooltipLeft = coords.left + offset;
  if (tooltipLeft > maxLeft) {
    tooltipLeft = maxLeft;
  }
  let message = document.createElement("div");
  message.id = "tool-tip"
  message.style.cssText = "position:absolute;";
  message.style.left = tooltipLeft + "px";
  message.style.top = coords.bottom + "px";
  message.classList.add('tool-tip');
  message.innerHTML = createPopup(data, property, appData.lastPos).innerHTML;
  document.body.append(message);
}
//https://javascript.info/coordinates
function createMessageUnder(elem, html) {
  let message = document.createElement('div');
  message.style.cssText = "position:absolute; color: red";

  let coords = getCoords(elem);

  message.style.left = coords.left + "px";
  message.style.top = coords.bottom + "px";

  message.innerHTML = html;

  return message;
}
const getPixelWidth = function getStringWidth(input) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  let fontSize = css(textBox, "font-size");
  let fontFamily = css(textBox, "font-family");
  console.log(`${fontSize} ${fontFamily}`)
  ctx.font = `${fontSize} sans-serif`;
  console.log(ctx.measureText(input).width);
  return ctx.measureText(input).width;
};

function css(element, property) {
  return window.getComputedStyle(element, null).getPropertyValue(property);
}
function getCurrentText(elem, pos) {
  return elem.value.substring(0, pos);
}
function getCaretPos(elem) {
  let start = elem.selectionStart;
  let end = elem.selectionEnd;
  return end > start ? end : start;
}

const removeTooltip = function hideElemById(id) {
  if (document.getElementById(id)) {
    document.getElementById(id).remove();
  }
}
const createPopup = function (data, prop) {
  let container = document.createElement("div");
  data.forEach((elem) => {
    let info = document.createElement("p");
    info.innerHTML = `<a class="tag" onclick="insertString('${elem[prop]}', '${prop}')">${elem[prop]}</a>`;
    container.appendChild(info);
  });
  //toggleProp(prop);
  return container;
};
function insertString(info, prop) {
  let current = textBox.value;
  let pos = getCaretPos(textBox);
  console.log(current);
  textBox.value = `${current.substring(0, pos - 1 - appData.query.length)}${info} ${current.substring(pos)}`;
  appData.query = '';
  removeTooltip('tool-tip');
  toggleProp(prop, false);
}
function toggleProp(prop) {
  appData.key[prop]["visible"] = false;
}
function addClickHandler(elem, action) {
  //dconsole.log(elem)
  elem.addEventListener("click", function (event) {
    action();
  });
}