onload = function(){

var obj = document.getElementById("dvique");

var canvas = document.createElement("canvas");
canvas.id = "canvas";
obj.appendChild(canvas);
create();
load();

function onDown(e) {
  if(e.type === "mousedown") {
      var event = e;
  } else {
      var event = e.changedTouches[0];
      e.preventDefault();
  }
  var [numx,numy] = coord(event);
  if (event.button === 2){
      drawonDownR(numx,numy);
  }else{  //左クリックorタップ
    //console.log(numx,numy);
      drawonDown(numx,numy);
  }
}

function onUp(e) {
  if(e.type === "mouseup") {
      var event = e;
  } else {
      var event = e.changedTouches[0];
      e.preventDefault();
  }
  var [numx,numy] = coord(event);
  drawonUp(numx,numy);
}

function onClick(e) {
  var [numx,numy] = coord(e);
  drawonClick(numx,numy);
}

function onMove(e) {
  //同様にマウスとタッチの差異を吸収
  if(e.type === "mousemove") {
      var event = e;
  } else {
      var event = e.changedTouches[0];
  }

  //フリックしたときに画面を動かさないようにデフォルト動作を抑制
  e.preventDefault();
  var [numx,numy] = coord(event);
  drawonMove(numx,numy);
}

function onOver(e) {
  return;
}

function onOut() {
  drawonOut();
  return;
}

function onContextmenu(e){ //右クリック
  e.preventDefault();
}

function onKeyDown(e){
  if(e.target.type === "number"){
    //入力フォーム用
  }else{
    var key = e.key;
    var shift_key = e.shiftKey;
    var ctrl_key = e.ctrlKey;
    var alt_key = e.altKey;

    var str_num = "1234567890";
    var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
    var str_alph_up =  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var str_sym = "!\"#$%&\'()-=^~|@[];+:*,.<>/?_";

    if (key ==="ArrowLeft" ||key ==="ArrowRight" ||key ==="ArrowUp" ||key ==="ArrowDown" ){ //arrow
      key_arrow(key);
      event.returnValue = false;
    }

    if(key === "F2"){ //function_key
      event.returnValue = false;
    }
    if(!ctrl_key){
      if (str_num.indexOf(key) != -1 || str_alph_low.indexOf(key) != -1 ||str_alph_up.indexOf(key) != -1|| str_sym.indexOf(key) != -1){
        key_number(key);
      }else if (key === " "){
        key_space();
        event.returnValue = false;
      }else if (key === "Backspace"){
        key_backspace();
        event.returnValue = false;
      }
    }

    if(ctrl_key){
      switch(key){
        case "d"://Ctrl+d
          duplicate();
          event.returnValue = false;
          break;
        case "y"://Ctrl+y
          redo();
          event.returnValue = false;
          break;
        case "z": //Ctrl+z
          undo();
          event.returnValue = false;
          break;
      }
    }
  }
}

function coord(e){
  var x = e.pageX - canvas.offsetLeft - pu.spacex;
  var y = e.pageY - canvas.offsetTop - pu.spacey;
  var [numx,numy] = calc_num(x,y);
  return [numx,numy];
}

function calc_num(x,y){
  var numx;
  var numy;
  var dicx;
  var dicy;
  switch(pu.edit_mode){
    case "surface":
      numx = Math.floor(x/pu.sizex);
      numy = Math.floor(y/pu.sizey);
      break;
    case "line":
      numx = Math.floor(x/pu.sizex);
      numy = Math.floor(y/pu.sizey);
      if (pu.edit_submode === "2"){
        dicx = x/pu.sizex-Math.floor(x/pu.sizex);
        dicy = y/pu.sizey-Math.floor(y/pu.sizey);
        if(dicx < pu.lineD_space || dicx > 1-pu.lineD_space || dicy < pu.lineD_space || dicy > 1-pu.lineD_space){
          pu.lineD_edge = 1;
        }else{
          pu.lineD_edge = 0;
        }
      }
      break;
    case "lineE":
      numx = Math.floor(x/pu.sizex+0.5);
      numy = Math.floor(y/pu.sizey+0.5);
      if (pu.edit_submode === "2"){
        dicx = x/pu.sizex+0.5-Math.floor(x/pu.sizex+0.5);
        dicy = y/pu.sizey+0.5-Math.floor(y/pu.sizey+0.5);
        if(dicx < pu.lineD_space || dicx > 1-pu.lineD_space || dicy < pu.lineD_space || dicy > 1-pu.lineD_space){
          pu.lineD_edge = 1;
        }else{
          pu.lineD_edge = 0;
        }
      }
      break;
    case "wall":
      numx = Math.floor(x/pu.sizex*2);
      numy = Math.floor(y/pu.sizey*2);
      break;
    case "number":
      if (pu.edit_submode === "3"){
        numx = Math.floor(x/pu.sizex*2);
        numy = Math.floor(y/pu.sizey*2);
      }else{
        numx = Math.floor(x/pu.sizex);
        numy = Math.floor(y/pu.sizey);
      }
      break;
    case "numberE":
      numx = Math.floor(x/pu.sizex*2+0.5);
      numy = Math.floor(y/pu.sizey*2+0.5);
      break;
    case "symbol":
      numx = Math.floor(x/pu.sizex);
      numy = Math.floor(y/pu.sizey);
      break;
    case "symbolE":
      numx = Math.floor(x/pu.sizex*2+0.5);
      numy = Math.floor(y/pu.sizey*2+0.5);
      break;
    case "cage":
      numx = Math.floor(x/pu.sizex*2);
      numy = Math.floor(y/pu.sizey*2);
      break;
    case "special":
    numx = Math.floor(x/pu.sizex);
    numy = Math.floor(y/pu.sizey);
    dicx = x/pu.sizex-Math.floor(x/pu.sizex);
    dicy = y/pu.sizey-Math.floor(y/pu.sizey);
    if(dicx < pu.lineD_space || dicx > 1-pu.lineD_space || dicy < pu.lineD_space || dicy > 1-pu.lineD_space){
      pu.lineD_edge = 1;
    }else{
      pu.lineD_edge = 0;
    }
    break;
  }
  return [numx,numy];
}


canvas.addEventListener('mousedown', onDown, {passive: false});
canvas.addEventListener('touchstart', onDown, {passive: false});
canvas.addEventListener('mouseup', onUp, {passive: false});
canvas.addEventListener('touchend', onUp, {passive: false});
canvas.addEventListener('click', onClick, {passive: false});
canvas.addEventListener('mousemove', onMove, {passive: false});
canvas.addEventListener('touchmove', onMove, {passive: false});
canvas.addEventListener('mouseover', onOver, {passive: false});
canvas.addEventListener('mouseout', onOut, {passive: false});
canvas.addEventListener('contextmenu',onContextmenu,{passive: false});
document.addEventListener('keydown',onKeyDown,{passive: false});
window.addEventListener("beforeunload", function(eve){
    eve.returnValue = "ページを移動します";
},{passive: false});

var modal1 = document.getElementById("modal");
var modal2 = document.getElementById("modal-save");
window.addEventListener('click', function(e) {
  if (e.target == modal1) {
    modal1.style.display = 'none';
  }else if(e.target == modal2) {
    modal2.style.display = 'none';
  }
}, {passive: false});
window.addEventListener('touchstart', function(e) {
  e.stopPropagation();
}, {passive: false});

//drag_window
//要素の取得
    var elements = document.getElementById("float-key-header");

    var x_window;
    var y_window;

    elements.addEventListener("mousedown", mdown,{passive: false});
    elements.addEventListener("touchstart", mdown, {passive: false});

    function mdown(e) {
        this.classList.add("drag");

        if(e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        x_window = event.pageX - this.offsetLeft;
        y_window = event.pageY - this.offsetTop;

        document.body.addEventListener("mousemove", mmove, {passive: false});
        document.body.addEventListener("touchmove", mmove, {passive: false});
    }

    function mmove(e) {

        var drag = document.getElementsByClassName("drag")[0];
        var body = document.getElementById("float-key-body");
        if(e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }
        e.preventDefault();

        drag.style.top = event.pageY - y_window + "px";
        drag.style.left = event.pageX - x_window + "px";
        body.style.top = event.pageY - y_window + "px";
        body.style.left = event.pageX - x_window + "px";

        drag.addEventListener('touchmove', function(e){
          e.preventDefault();
        }, {passive: false});
        drag.addEventListener("mouseup", mup, {passive: false});
        document.body.addEventListener("mouseleave", mup, {passive: false});
        drag.addEventListener("touchend", mup, {passive: false});
        document.body.addEventListener("touchleave", mup, {passive: false});

    }

    function mup(e) {
        var drag = document.getElementsByClassName("drag")[0];
        if(drag){
          document.body.removeEventListener("mousemove", mmove, {passive: false});
          drag.removeEventListener("mouseup", mup, {passive: false});
          document.body.removeEventListener("touchmove", mmove, {passive: false});
          drag.removeEventListener("touchend", mup, {passive: false});

          drag.classList.remove("drag");
        }
    }


    //パネル入力設定
    var float_canvas = document.getElementById("float-canvas");

    float_canvas.addEventListener("mousedown", f_mdown, {passive: false});
    float_canvas.addEventListener("touchstart", f_mdown, {passive: false});

    function f_mdown(e) {
      if(e.type === "mousedown") {
        var event = e;
        var xf = event.offsetX;
        var yf = event.offsetY;
      } else {
        var float_canvas = document.getElementById("float-canvas");
        var event = e.changedTouches[0];
        var xf = event.pageX-(float_canvas.getBoundingClientRect().x-document.documentElement.getBoundingClientRect().left);
        var yf = event.pageY-(float_canvas.getBoundingClientRect().y-document.documentElement.getBoundingClientRect().top);
        e.preventDefault();
      }
      var numxf = Math.floor(xf/(pu.sizex+3));
      var numyf = Math.floor(yf/(pu.sizey+3));

      if(pu.panelmode === "number"||pu.edit_mode === "symbol"||pu.edit_mode === "symbolE"){
        var cont = [1,2,3,4,5,6,7,8,9,0,"?",""];
        var n = numxf+numyf*4;
        if (0<=n&&n<=10){
          key_number(cont[n].toString());
        }else if (n===11){
          key_space();
        }
      }else if(pu.panelmode === "alphabet"){
        var cont = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O",
        "P","Q","R","S","T","U","V","W","X","Y","Z","!","?"," ",""];
        var n = numxf+numyf*6;
        if (0<=n&&n<=28){
          key_number(cont[n].toString());
        }else if (n>=29){
          key_space();
        }
      }else if(pu.panelmode === "ja_K"){
        var str = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ"+
        "ヤユヨワンラリルレロャュョヲ　ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォ"
        var cont = str.split("");
        var n = numxf+numyf*10;
        if (0<=n&&n<=79&&n!=49){
          key_number(cont[n]);
        }else if (n===49){
          key_space();
        }
      }
    }

};
