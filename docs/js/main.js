onload = function(){

var obj = document.getElementById("dvique");

var canvas = document.createElement("canvas");
canvas.id = "canvas";
obj.appendChild(canvas);
create();
load();

document.addEventListener("beforeunload", function(eve){
    eve.returnValue = "ページを移動します";
},{passive: false});

var ua = navigator.userAgent;
if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
    ondown_key = "touchstart";
} else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
    ondown_key = "touchstart";
} else {
    ondown_key = "mousedown";
}

var checkms;//hover event用一時変数

//canvas
//canvas.addEventListener('mousedown', onDown, {passive: false});
//canvas.addEventListener('touchstart', onDown, {passive: false});
canvas.addEventListener('mouseup', onUp, {passive: false});
canvas.addEventListener('touchend', onUp, {passive: false});
//canvas.addEventListener('click', onClick, {passive: false});
canvas.addEventListener('mousemove', onMove, {passive: false});
canvas.addEventListener('touchmove', onMove, {passive: false});
canvas.addEventListener('mouseover', onOver, {passive: false});
canvas.addEventListener('mouseout', onOut, {passive: false});
canvas.addEventListener('contextmenu',onContextmenu,{passive: false});
document.addEventListener('keydown',onKeyDown,{passive: false});

function onDown(e) {
  if(e.type === "mousedown") {
      var event = e;
  } else {
      var event = e.changedTouches[0];
      //e.preventDefault();
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
      //e.preventDefault();
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
  if(e.target.type === "number" || e.target.type === "text"){
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
      document.getElementById("pu_q").checked = true;
      mode_qa();
      event.returnValue = false;
    }else if(key === "F3"){
      document.getElementById("pu_a").checked = true;
      mode_qa();
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
        case " ": //Ctrl+space
          key_shiftspace();
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
      if (pu.edit_submode === "4"){
        numx = Math.floor(x/pu.sizex*2+0.5);
        numy = Math.floor(y/pu.sizey*2+0.5);
      }else{
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


//クリックイベント
document.addEventListener(ondown_key, window_click, {passive: false});

function window_click(e) {
  //console.log(e.target.id);
  //modalwindow
  if (e.target.className === "modal") {
    document.getElementById(e.target.id).style.display = 'none';
    e.preventDefault();
  }
  switch(e.target.id){
    //canvas
    case "canvas":
      onDown(e);
      break;
    //top/bottom button
    case "newboard":
      newboard();
      e.preventDefault(); break;
    case "newsize":
      newsize();
      e.preventDefault(); break;
    case "saveimage":
      saveimage();
      e.preventDefault(); break;
    case "savetext":
      savetext();
      e.preventDefault(); break;
    //case "duplicate":
      //duplicate();
    //  break;
    case "tb_undo":
      undo();
      e.preventDefault(); break;
    case "tb_redo":
      redo();
      e.preventDefault(); break;
    case "tb_reset":
      ResetCheck();
      e.preventDefault(); break;
    case "tb_delete":
      DeleteCheck();
      e.preventDefault(); break;
    //panel_menu
    case "panel_1_lbmenu":
      panel_mode_set('number');
      e.preventDefault(); break;
    case "panel_A_lbmenu":
      panel_mode_set('alphabet');
      e.preventDefault(); break;
    case "panel_!_lbmenu":
      panel_mode_set('key_symbol');
      e.preventDefault(); break;
    case "panel_ja_K_lbmenu":
      panel_mode_set('ja_K');
      e.preventDefault(); break;
    case "float-canvas":
      f_mdown(e);
      break;
    //savetext
    case "address_edit":
      savetext_edit();
      e.preventDefault(); break;
    case "address_solve":
      savetext_solve();
      e.preventDefault(); break;
    case "savetextarea":
      return;
    case "savetextname":
      return;
    case "closeBtn_save1":
      savetext_copy();
      e.preventDefault(); break;
    case "closeBtn_save2":
      savetext_download();
      e.preventDefault(); break;
    //case "closeBtn_save3":
    //  savetext_window();
    //  break;
    case "closeBtn_save4":
      document.getElementById('modal-save').style.display='none';
      e.preventDefault(); break;
    //saveimage
    case "nb_margin1_lb":
      document.getElementById("nb_margin1").checked = true;
      e.preventDefault(); break;
    case "nb_margin2_lb":
      document.getElementById("nb_margin2").checked = true;
      e.preventDefault(); break;
    case "saveimagename":
      return;
    //case "closeBtn_image1":
    //  saveimage_window();
    //  break;
    case "closeBtn_image2":
      saveimage_download();
      e.preventDefault(); break;
    case "closeBtn_image3":
      document.getElementById('modal-image').style.display='none';
      e.preventDefault(); break;
    //newboard
    case "nb_size1":
      return;
    case "nb_size2":
      return;
    case "nb_size3":
      return;
    case "nb_space1":
      return;
    case "nb_space2":
      return;
    case "nb_space3":
      return;
    case "nb_space4":
      return;
    case "nb_grid1_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_grid2_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_grid3_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_lat1_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_lat2_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_out1_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "nb_out2_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      e.preventDefault(); break;
    case "closeBtn_nb1":
      CreateCheck();
      e.preventDefault(); break;
    case "closeBtn_nb2":
      newgrid();
      e.preventDefault(); break;
    case "closeBtn_nb3":
      document.getElementById('modal').style.display='none';
      e.preventDefault(); break;
    //newsize
    case "nb_size3_r":
      return;
    case "closeBtn_size1":
      newgrid_r();
      e.preventDefault(); break;
    case "closeBtn_size2":
      document.getElementById('modal-newsize').style.display='none';
      e.preventDefault(); break;
    case "float-key-header":
      mdown(e);
      e.preventDefault(); break;
    case "float-key-header-lb":
      mdown(e);
      e.preventDefault(); break;
    //buttons
    case "panel_button":
      panel_onoff();
      e.preventDefault(); break;
    case "pu_q_label":
      document.getElementById("pu_q").checked = true;
      mode_qa();
      e.preventDefault(); break;
    case "pu_a_label":
      document.getElementById("pu_a").checked = true;
      mode_qa();
      e.preventDefault(); break;
    case "surface_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_surface();
      e.preventDefault(); break;
    case "line_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_line();
      e.preventDefault(); break;
    case "lineE_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_lineE();
      e.preventDefault(); break;
    case "wall_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_wall();
      e.preventDefault(); break;
    case "cage_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_cage();
      e.preventDefault(); break;
    case "number_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_number();
      e.preventDefault(); break;
    case "numberE_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_numberE();
      e.preventDefault(); break;
    case "symbol_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_symbol();
      e.preventDefault(); break;
    case "symbolE_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_symbolE();
      e.preventDefault(); break;
    case "special_lb":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      mode_special();
      e.preventDefault(); break;
  }
  switch(e.target.id.slice(0,-4)){
    case "line":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      submode_check('mode_'+e.target.id.slice(0,-4));
      e.preventDefault(); break;
    case "lineE":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      submode_check('mode_'+e.target.id.slice(0,-4));
      e.preventDefault(); break;
    case "number":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      submode_check('mode_'+e.target.id.slice(0,-4));
      e.preventDefault(); break;
    case "numberE":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      submode_check('mode_'+e.target.id.slice(0,-4));
      e.preventDefault(); break;
    case "special":
      document.getElementById(e.target.id.slice(0,-3)).checked = true;
      submode_check('mode_'+e.target.id.slice(0,-4));
      e.preventDefault(); break;
    }
    //スタイル
  if(e.target.id.slice(0,3)==="st_"){
    document.getElementById(e.target.id.slice(0,-3)).checked = true;
    stylemode_check('style_'+e.target.id.slice(3,-4));
    e.preventDefault();
  }
    //シンボル
  if(e.target.id.slice(0,3)==="ms_"){
    checkms = 1;
    subsymbolmode(e.target.id.slice(3));
    e.preventDefault();
    //シンボルホバーetc
  }else if(e.target.id.slice(0,2)==="ms"){
    checkms = 1;
    return;  //preventDefault回避
  }else if(checkms === 1){
    checkms = 0;
    return;
  }else{
    switch(e.target.id){
      //preventbuttonclick
      /*case "edit_button":
        e.preventDefault(); break;
      case "panel_button0":
        e.preventDefault(); break;
      case "mode_button":
        e.preventDefault(); break;
      case "submode_button":
        e.preventDefault(); break;
      case "stylemode_button":
        e.preventDefault(); break;
      case "edit_txt":
        e.preventDefault(); break;
      case "mode_txt":
        e.preventDefault(); break;
      case "sub_txt":
        e.preventDefault(); break;
      case "style_txt":
        e.preventDefault(); break;*/
    }
  }
}

//panel(drag_window)
    var x_window;
    var y_window;

    function mdown(e) {
        var elements = document.getElementById("float-key-header");
        elements.classList.add("drag");

        if(e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        x_window = event.pageX - elements.offsetLeft;
        y_window = event.pageY - elements.offsetTop;
        var drag = document.getElementsByClassName("drag")[0];
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
      }else if(pu.panelmode === "key_symbol"){
        var str = "!?#$%&()[]+－×＊/÷＝\u{221E}^<>～|@;:,._   "
        var cont = str.split("");
        var n = numxf+numyf*6;
        if (cont[n] && cont[n]!=" "){
          key_number(cont[n]);
        }else if (cont[n]===" "){
          key_space();
        }
      }else if(pu.panelmode === "ja_K"){
        var str = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ"+
        "ヤユヨ　　ラリルレロワヲン　　ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォャュョ　　ー。、　　"
        var cont = str.split("");
        var n = numxf+numyf*10;
        if (cont[n] && cont[n]!="　"){
          key_number(cont[n]);
        }else if (cont[n]==="　"){
          key_space();
        }
      }
    }

};
