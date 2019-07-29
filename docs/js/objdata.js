
class Puzzle {
  constructor(nx,ny,size){
    //盤面情報
    this.nx = nx;
    this.ny = ny;
    this.sizex = size;
    this.sizey = size;
    this.spacex = size*0.5+0.5;
    this.spacey = size*0.5+0.5;
    this.resol = 3;

    //描画位置
    this.lastx = -1;
    this.lasty = -1;
    this.surface_drawing = -1; //描画白:0,左:1,右:2
    this.line_drawing = -1;
    this.line_wall_drawing = -1;
    this.num_drawing = -1;
    this.cursolx = 0;
    this.cursoly = 0;
    this.cursolSx = 0;
    this.cursolSy = 0;
    this.cursolEx = 0;
    this.cursolEy = 0;
    this.cursolsize = this.sizex;
    this.cursolSsize = this.sizex*0.5;
    this.cursolEsize = 2/3*this.sizex;

    this.lineD_edge = 0; //0:no 1:edge
    this.lineD_space = 0.2;

    //redo,undo
    this.command_redo = new Stack();
    this.command_undo = new Stack();

    //描画モード
    this.edit_mode = "surface";
    this.edit_submode = "1";
    this.edit_submode_id = "";
    this.edit_stylemode = 1;
    this.edit_stylemode_id = "st_surface1";
    this.edit_subsymbolmode = "circle_L";
    this.panelmode = "number";
    this.mmode = ""; //出題モード用

    this.reset();
  }

  reset(){

    this.command_redo = [];
    this.command_undo = [];

    //盤面状態
    this.arr = {};
    this.arr.surface = {};
    this.arr.lineH = {};
    this.arr.lineV = {};
    this.arr.lineDa = {};
    this.arr.lineDb = {};
    this.arr.lineHE = {};
    this.arr.lineVE = {};
    this.arr.lineDaE = {};
    this.arr.lineDbE = {};
    this.arr.wallH = {};
    this.arr.wallV = {};
    this.arr.number = {};
    this.arr.numberS = {};
    this.arr.numberE = {};
    this.arr.cageH = {};
    this.arr.cageV = {};
    this.frameH = [];
    this.frameV = [];
    this.arr.symbol = {};
    this.arr.symbolE = {};
    this.arr.freeline = {};
    this.arr.freelineE = {};
    this.freelinecircle = [[-1,-1],[-1,-1]];
    this.arr.thermo = [];
    this.arr.arrows =[];
    this.arr.direction = [];
    this.arr.squareframe = [];
    this.arr.deletelineHE = {};
    this.arr.deletelineVE = {};
  }
}


/////////////////////////////////////
// undo-redo process LIFO
///////////////////////////////////////

function Stack() {
	this.__a = [];
}

Stack.prototype.push = function(o) {
	if( this.__a.length > 1000 ) {
    this.__a.shift();
   }
   this.__a.push(o);
};

Stack.prototype.pop = function() {
	if( this.__a.length > 0 ) {
		return this.__a.pop();
	}
	return null;
};

Stack.prototype.size = function() {
	return this.__a.length;
};

Stack.prototype.toString = function() {
	return '[' + this.__a.join(',') + ']';
};

function undo(){
  var a = pu.command_undo.pop();/*a[0]:list_name,a[1]:number,a[2]:value*/
  if(a){
    if((a[0]==="thermo"||a[0]==="arrows"||a[0]==="direction"||a[0]==="squareframe") && a[1] === -1){
      if(pu.arr[a[0]].length > 0){
        pu.command_redo.push([a[0],a[1],pu.arr[a[0]].pop()]);
      }
    }else{
      if(pu.arr[a[0]][a[1]]){
        pu.command_redo.push([a[0],a[1],pu.arr[a[0]][a[1]]]);
      }else{
        pu.command_redo.push([a[0],a[1],null]);
      }
      if(a[2]){
        pu.arr[a[0]][a[1]] = JSON.parse(a[2]);  //JSON.parseでdecode
      }else{
        delete pu.arr[a[0]][a[1]];
      }
    }
    redraw();
  }
}

function redo(){
  var a = pu.command_redo.pop();
  if(a){
    if((a[0]==="thermo"||a[0]==="arrows"||a[0]==="direction"||a[0]==="squareframe") && a[1] === -1){
        pu.command_undo.push([a[0],a[1],null]);
        pu.arr[a[0]].push(a[2]);
    }else{
      if(pu.arr[a[0]][a[1]]){
        pu.command_undo.push([a[0],a[1],JSON.stringify(pu.arr[a[0]][a[1]])]);
      }else{
        pu.command_undo.push([a[0],a[1],null]);
      }
      if(a[2]){
        pu.arr[a[0]][a[1]] = a[2];
      }else{
        delete pu.arr[a[0]][a[1]];
      }
    }
    redraw();
  }
}

function record(arr,num){
  if((arr === "thermo"||arr === "arrows"||arr==="direction"||arr==="squareframe") && num===-1){
    pu.command_undo.push([arr,num,null]);
  }else{
    if (pu.arr[arr][num]){
      pu.command_undo.push([arr,num,JSON.stringify(pu.arr[arr][num])]);   //配列もまとめてJSONで記録
    }else{
      pu.command_undo.push([arr,num,null]);
    }
  }
  pu.command_redo = [];
}

/////////////////////////////
//初期設定
//top_button処理
/////////////////////////////

function newboard(){
  document.getElementById('modal').style.display = 'block';
}

function newsize(){
  document.getElementById('modal-newsize').style.display = 'block';
}

function create(){
  var nx0;
  var ny0;
  var obj = document.getElementById("dvique");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  //盤面サイズ取得
  nx0 = parseInt(document.getElementById("nb_size1").value,10);
  ny0 = parseInt(document.getElementById("nb_size2").value,10);
  size = parseInt(document.getElementById("nb_size3").value,10);
  if(nx0<=30 && ny0<=30 && nx0>0 && ny0>0 && 15<=size && size<=60){
    pu_q = new Puzzle(nx0,ny0,size); //問題
    pu_a = new Puzzle(nx0,ny0,size); //解答
    pu = pu_q;
    //Canvasサイズ設定
    canvas.width=(pu.nx*pu.sizex+pu.spacex*2)*pu.resol;
    canvas.height=(pu.ny*pu.sizey+pu.spacey*2)*pu.resol;
    ctx.scale(pu.resol,pu.resol);
    canvas.style.width = (pu.nx*pu.sizex+pu.spacex*2).toString()+"px";
    canvas.style.height = (pu.ny*pu.sizey+pu.spacey*2).toString()+"px";
    obj.style.width = canvas.style.width;
    obj.style.height = canvas.style.height;
    //描画
    reset_frame(pu_q);
    //redraw();
    draw_panel();
    document.getElementById('modal').style.display = 'none';
    //ボタン選択初期化
    document.getElementById('surface').checked = 'checked';
    mode_surface();
  }else{
    alert("タテヨコ:1~30 サイズ:15~60");
  }
}

function newgrid(){
  var size = parseInt(document.getElementById("nb_size3").value,10);
  if(15<=size && size<=60){
    reset_frame(pu_q);
    pu_a.sizex = size;
    pu_a.sizey = size;
    pu_a.spacex = size*0.5+0.5;
    pu_a.spacey = size*0.5+0.5;
    pu_a.cursolsize = pu.sizex;
    pu_a.cursolSsize = pu.sizex*0.5;
    pu_a.cursolEsize = 2/3*pu.sizex;
    redraw();
    draw_panel();
    document.getElementById('modal').style.display = 'none';
  }else{
    alert("サイズ:15~60");
  }
}

function newgrid_r(){
  var size = parseInt(document.getElementById("nb_size3_r").value,10);
  document.getElementById("nb_size3").value=size;
  if(15<=size && size<=60){
    reset_frame(pu_q);
    pu_a.sizex = size;
    pu_a.sizey = size;
    pu_a.spacex = size*0.5+0.5;
    pu_a.spacey = size*0.5+0.5;
    pu_a.cursolsize = pu.sizex;
    pu_a.cursolSsize = pu.sizex*0.5;
    pu_a.cursolEsize = 2/3*pu.sizex;
    redraw();
    draw_panel();
    document.getElementById('modal-newsize').style.display = 'none';
  }else{
    alert("サイズ:15~60");
  }
}

function reset_frame(pu){
  var obj = document.getElementById("dvique");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var size = parseInt(document.getElementById("nb_size3").value,10);
  pu.sizex = size;
  pu.sizey = size;
  pu.spacex = size*0.5+0.5;
  pu.spacey = size*0.5+0.5;
  pu.cursolsize = pu.sizex;
  pu.cursolSsize = pu.sizex*0.5;
  pu.cursolEsize = 2/3*pu.sizex;

  canvas.width=(pu.nx*pu.sizex+pu.spacex*2)*pu.resol;
  canvas.height=(pu.ny*pu.sizey+pu.spacey*2)*pu.resol;
  ctx.scale(pu.resol,pu.resol);
  canvas.style.width = (pu.nx*pu.sizex+pu.spacex*2).toString()+"px";
  canvas.style.height = (pu.ny*pu.sizey+pu.spacey*2).toString()+"px";
  obj.style.width = canvas.style.width;
  obj.style.height = canvas.style.height;

  var space_up = parseInt(document.getElementById("nb_space1").value,10);
  var space_down = parseInt(document.getElementById("nb_space2").value,10);
  var space_left = parseInt(document.getElementById("nb_space3").value,10);
  var space_right = parseInt(document.getElementById("nb_space4").value,10);
  pu.frameH = [];
  pu.frameV = [];
  var nb_grid = document.getElementsByName("nb_grid");
  var nb_out = document.getElementsByName("nb_out");
  var gr = 1;
  var ot = 2;
  if (nb_grid[1].checked){
    gr = 11; //点線
  }else if(nb_grid[2].checked){
    gr = 0; //線なし
  }
  if (nb_out[1].checked){ //枠なし
    ot = gr;　//枠は内部と同じ線
  }

  for (var i = 0 ; i < pu.nx*(pu.ny+1) ; i++){
    if (((i/pu.nx|0) === space_up || (i/pu.nx|0) === pu.ny-space_down)&&(i%(pu.nx) >= space_left && i%(pu.nx) < pu.nx-space_right)){
      pu.frameH[i] = ot;
    }else if((i/pu.nx|0) < space_up || (i/pu.nx|0) > pu.ny-space_down || i%(pu.nx) < space_left || i%(pu.nx) >= pu.nx-space_right){
      pu.frameH[i] = 0;
    }else{
      pu.frameH[i] = gr;
    }
  }
  for (var i = 0 ; i < pu.ny*(pu.nx+1) ; i++){
    if ((i%(pu.nx+1) === space_left || i%(pu.nx+1) === pu.nx-space_right)&&((i/(pu.nx+1)|0) >= space_up && (i/(pu.nx+1)|0) < pu.ny-space_down)){
      pu.frameV[i] = ot;
    }else if ((i/(pu.nx+1)|0) < space_up || (i/(pu.nx+1)|0) >= pu.ny-space_down || i%(pu.nx+1) < space_left || i%(pu.nx+1) > pu.nx-space_right){
      pu.frameV[i] = 0;
    }else{
      pu.frameV[i] = gr;
    }
  }
}

function framemode_check(){
  var ele_flame = [];
  ele_flame[0] = document.getElementsByName( "nb_grid" );
  ele_flame[1] = document.getElementsByName( "nb_lat" );
  ele_flame[2] = document.getElementsByName( "nb_out" );
  var output = [];
  // 選択状態の値を取得
  for(var j=0;j<3;j++){
    for (var i=0;i<ele_flame[j].length; i++ ) {
    	if ( ele_flame[j][i].checked ) {
        output[j] = ele_flame[j][i].id;
    		break ;
    	}
    }
  }
  return output;
}

function editmode_check(pu){
  return [pu.edit_mode,pu.edit_submode,pu.edit_submode_id,pu.edit_stylemode,pu.edit_stylemode_id,pu.edit_subsymbolmode];
}

function qamode_check(){
  var elements = document.getElementsByName( "mode_qa" ) ;
  for (var i=0;i<elements.length; i++ ) {
    if ( elements[i].checked ) {
      return elements[i].id;
    }
  }
}

function canvasset(pu){
  var obj = document.getElementById("dvique");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var size = parseInt(document.getElementById("nb_size3").value,10);

  canvas.width=(pu.nx*pu.sizex+pu.spacex*2)*pu.resol;
  canvas.height=(pu.ny*pu.sizey+pu.spacey*2)*pu.resol;
  ctx.scale(pu.resol,pu.resol);
  canvas.style.width = (pu.nx*pu.sizex+pu.spacex*2).toString()+"px";
  canvas.style.height = (pu.ny*pu.sizey+pu.spacey*2).toString()+"px";
  obj.style.width = canvas.style.width;
  obj.style.height = canvas.style.height;
}

function resizecanvas(){
  var resizedCanvas = document.createElement("canvas");
  var resizedContext = resizedCanvas.getContext("2d");
  var canvas = document.getElementById("canvas");

  var mode = pu.edit_mode;
  pu.edit_mode = "surface"; //選択枠削除用
  if (document.getElementById("nb_margin2").checked){
    pu_q.spacex = 1.5;
    pu_q.spacey = 1.5;
    pu_a.spacex = 1.5;
    pu_a.spacey = 1.5;
    canvasset(pu_q);
  }
  redraw();
  var width = canvas.width*1.5/pu.resol;
  resizedCanvas.width = width.toString();
  resizedCanvas.height = (width*canvas.height/canvas.width).toString();

  resizedContext.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
  var canvastext = resizedCanvas.toDataURL("image/png")

  var size = parseInt(document.getElementById("nb_size3").value,10);
  pu.edit_mode = mode;
  pu_q.spacex = size*0.5+0.5;
  pu_q.spacey = size*0.5+0.5;
  pu_a.spacex = size*0.5+0.5;
  pu_a.spacey = size*0.5+0.5;
  canvasset(pu_q);
  redraw();

  return canvastext;
}

function saveimage() {
  document.getElementById("modal-image").style.display = 'block';
}

function saveimage_download(){
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById('saveimagename').value;
    if(filename.slice(-4)!=".png"){
      filename += ".png";
    }
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for(var i=0 ; i<filename.length;i++){
      if(str_sym.indexOf(filename[i]) != -1){
        valid_name = 0;
      }
    }
    var canvas = document.getElementById("canvas");

    if(valid_name){
      if (canvas.msToBlob) {
          var blob = canvas.msToBlob();
          window.navigator.msSaveBlob(blob, filename);
      } else {
          downloadLink.href = resizecanvas();
          downloadLink.download = filename;
          downloadLink.click();
      }
    }else{
      alert("ファイル名に使えない文字列が含まれています。")
    }
}

function saveimage_window(){
  var downloadLink = document.getElementById('download_link');
  var win=window.open();
  var address = resizecanvas();
  win.document.write("<img src='"+address+"'/>");
}

function savetext() {
  document.getElementById("modal-save").style.display = 'block';
  document.getElementById("savetextarea").value = "";
}

function savetext_edit() {
  var text = maketext();
  document.getElementById("savetextarea").value = text;
}

function savetext_solve() {
  var text = maketext_solve();
  //text = text.split("?")[0]+"?m=solve&"+text.split("?")[1];
  document.getElementById("savetextarea").value = text;
}

function savetext_copy() {
  var textarea = document.getElementById("savetextarea");

  textarea.select();
  var range = document.createRange();
  range.selectNodeContents(textarea);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  textarea.setSelectionRange(0, 1e5);
  alert("コピーしました。");
  document.execCommand("copy");
}

function savetext_download(){
  var text = document.getElementById("savetextarea").value;
  var downloadLink = document.getElementById('download_link');
  var filename = document.getElementById("savetextname").value;
  if(filename.slice(-4)!=".txt"){
    filename += ".txt";
  }
  var blob = new Blob([text],{type: "text/plain"});
  var ua = window.navigator.userAgent.toLowerCase();
  var str_sym = "\\/:*?\"<>|";
  var valid_name = 1;
  for(var i=0 ; i<filename.length;i++){
    if(str_sym.indexOf(filename[i]) != -1){
      valid_name = 0;
    }
  }
  if(valid_name){
    if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('edge') === -1){
      //safari
      window.open('data:text/plain;base64,' + window.Base64.encode(text), '_blank');
    }else if (window.navigator.msSaveBlob) {
      // for IE
      window.navigator.msSaveBlob(blob, filename);
    }else{
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.target = "_blank";
      downloadLink.download = filename;
      downloadLink.click();
    }
  }else{
    alert("ファイル名に使えない文字列が含まれています。");
  }
}

function savetext_window(){
  var text = document.getElementById("savetextarea").value;
  if(text){
    window.open(text);
  }
}

function duplicate(){
  var address = maketext();
  if (pu_a.mmode === "solve"){
    address = address + "&l=solvedup";
  }
  window.open(address);
}

function maketext(){
  var text = "";
  text = text + pu.nx.toString() + "," + pu.ny.toString() +","+pu.sizex.toString()+","+
      document.getElementById("nb_space1").value + "," + document.getElementById("nb_space2").value + "," +
      document.getElementById("nb_space3").value + "," + document.getElementById("nb_space4").value + "," +
      framemode_check() + "," +  qamode_check() + "," + editmode_check(pu_q) + "," + editmode_check(pu_a) +"\n";

  var arr_text = [];
  for (var i in pu_q.arr){
    arr_text.push(pu_q.arr[i]);
  }
  text += JSON.stringify(arr_text) + "\n";
  arr_text = [];
  for (var i in pu_a.arr){
    arr_text.push(pu_a.arr[i]);
  }
  text += JSON.stringify(arr_text) + "\n";

  var u8text = new TextEncoder().encode(text);
  var deflate = new Zlib.RawDeflate(u8text);
  var compressed = deflate.compress();
  var char8 = Array.from(compressed,e=>String.fromCharCode(e)).join("");
  var ba = window.btoa(char8);
  var url = location.href.split('?')[0];

  //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);
  return url+"?p="+ba;
}

function maketext_solve(){
  var text = "";
  text = text + pu.nx.toString() + "," + pu.ny.toString() +","+pu.sizex.toString()+","+
      document.getElementById("nb_space1").value + "," + document.getElementById("nb_space2").value + "," +
      document.getElementById("nb_space3").value + "," + document.getElementById("nb_space4").value + "," +
      framemode_check() +"\n";

  var arr_text = [];
  for (var i in pu_q.arr){
    arr_text.push(pu_q.arr[i]);
  }
  text += JSON.stringify(arr_text) + "\n";

  //console.log(text);

  var u8text = new TextEncoder().encode(text);
  var deflate = new Zlib.RawDeflate(u8text);
  var compressed = deflate.compress();
  var char8 = Array.from(compressed,e=>String.fromCharCode(e)).join("");
  var ba = window.btoa(char8);
  var url = location.href.split('?')[0];

  //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);
  return url+"?m=solve&p="+ba;
}

function load(){
  var urlParam = location.search.substring(1);
  if(urlParam){
    try{
      var param = urlParam.split('&');
      var paramArray = [];

      //アドレスを要素に分解
      for(var i=0; i<param.length;i++){
        var paramItem = param[i].split('=');
        paramArray[paramItem[0]] = paramItem[1];
      }

      //pを復号
      var ab = atob(paramArray.p);
      ab = Uint8Array.from(ab.split(""),e=>e.charCodeAt(0));
      var inflate = new Zlib.RawInflate(ab);
      var plain = inflate.decompress();
      var rtext = new TextDecoder().decode(plain);
      rtext = rtext.split("\n");

      //初期設定を読み込み
      var rtext_para = rtext[0].split(',');
      document.getElementById("nb_size1").value = rtext_para[0];
      document.getElementById("nb_size2").value = rtext_para[1];
      document.getElementById("nb_size3").value = rtext_para[2];
      document.getElementById("nb_space1").value = rtext_para[3];
      document.getElementById("nb_space2").value = rtext_para[4];
      document.getElementById("nb_space3").value = rtext_para[5];
      document.getElementById("nb_space4").value = rtext_para[6];
      for(var i=7;i<=10;i++){
        if(document.getElementById(rtext_para[i])){
          document.getElementById(rtext_para[i]).checked = true;
        }
      }
      create();

      if(paramArray.m === "solve"){
        set_solvemode()
        mode_reset();

        //盤面状態読み込み
        var k = 0;
        var rt = JSON.parse(rtext[1]);
        for (var i in pu_q.arr){
          if(rt[k]){
            pu_q.arr[i] = rt[k];
            k++;
          }
        }

      }else{
        if(paramArray.l === "solvedup"){
          set_solvemode();
        }
        mode_qa();
        pu_q.edit_mode = rtext_para[11];
        pu_q.edit_submode = rtext_para[12];
        pu_q.edit_submode_id = rtext_para[13];
        pu_q.edit_stylemode = parseInt(rtext_para[14],10);
        pu_q.edit_stylemode_id = rtext_para[15];
        pu_q.edit_subsymbolmode = rtext_para[16];
        pu_a.edit_mode = rtext_para[17];
        pu_a.edit_submode = rtext_para[18];
        pu_a.edit_submode_id = rtext_para[19];
        pu_a.edit_stylemode = parseInt(rtext_para[20],10);
        pu_a.edit_stylemode_id = rtext_para[21];
        pu_a.edit_subsymbolmode = rtext_para[22];

        mode_reset();

        //盤面状態読み込み
        var k = 0;
        var rt = JSON.parse(rtext[1]);
        for (var i in pu_q.arr){
          if(rt[k]){
            pu_q.arr[i] = rt[k];
            k++;
          }
        }
        k = 0;
        rt = JSON.parse(rtext[2]);
        for (var i in pu_a.arr){
          if(rt[k]){
            pu_a.arr[i] = rt[k];
            k++;
          }
        }
      }
      redraw();
    }catch(error){
      alert("不正なアドレスです");
    }
  }
}

function set_solvemode(){
  pu = pu_a;
  pu_a.mmode = "solve";
  document.getElementById("title").innerHTML = "解答モード"
  document.getElementById("nb_size3_r").value = document.getElementById("nb_size3").value;
  document.getElementById("newsize").style.display = "inline";
  document.getElementById("pu_a").checked = true;
  document.getElementById("pu_q_label").style.display = "none";
  if(document.getElementById("sub_lineE5_lb")){
    document.getElementById("sub_lineE5_lb").style.display = "none";
  }
  document.getElementById("savetext").style.display = "none";
  document.getElementById("newboard").style.display = "none";
  document.getElementById("tb_delete").value = "解答消去"
}

function ResetCheck() {
    if( confirm("選択中の記号を消去します") ) {
        reset();
    }
}

function DeleteCheck() {
  var text;
  if(document.getElementById("pu_q").checked){
    text = "問題";
  }else if(document.getElementById("pu_a").checked){
    text = "解答";
  }
  if( confirm(text+"盤面をリセットします") ) {
      pu.reset();
      reset_frame(pu_q);
      redraw();
  }
}

function CreateCheck() {
    if( confirm("現在の盤面はリセットされます") ) {
        create();
    }
}

function reset(){
  switch(pu.edit_mode){
    case "surface":
      pu.arr.surface = {};
      break;
    case "line":
      if(pu.edit_submode != "4"){
        pu.arr.lineH = {};
        pu.arr.lineV = {};
        pu.arr.lineDa = {};
        pu.arr.lineDb = {};
        pu.arr.freeline = {};
      }else{
        for(i in pu.arr.lineH){
          if(pu.arr.lineH[i]===98){
            delete pu.arr.lineH[i];
          }
        }
        for(i in pu.arr.lineV){
          if(pu.arr.lineV[i]===98){
            delete pu.arr.lineV[i];
          }
        }
      }
      break;
    case "lineE":
      if(pu.edit_submode === "4"){
        for(i in pu.arr.lineHE){
          if(pu.arr.lineHE[i]===98){
            delete pu.arr.lineHE[i];
          }
        }
        for(i in pu.arr.lineVE){
          if(pu.arr.lineVE[i]===98){
            delete pu.arr.lineVE[i];
          }
        }
      }else if(pu.edit_submode === "5"){
        pu.arr.deletelineHE = {};
        pu.arr.deletelineVE = {};
      }else{
        pu.arr.lineHE = {};
        pu.arr.lineVE = {};
        pu.arr.lineDaE = {};
        pu.arr.lineDbE = {};
        pu.arr.freelineE = {};
      }
      break;
    case "wall":
      pu.arr.wallH = {};
      pu.arr.wallV = {};
      break;
    case "number":
      if(pu.edit_submode != "3"){
        pu.arr.number = {};
      }else{
        pu.arr.numberS = {};
      }
      break;
    case "numberE":
      pu.arr.numberE = {};
      break;
    case "symbol":
      pu.arr.symbol = {};
      break;
    case "symbolE":
      pu.arr.symbolE = {};
      break;
    case "cage":
      pu.arr.cageH = {};
      pu.arr.cageV = {};
      break;
    case "special":
      pu.arr[pu.edit_submode] = [];
      break;
    }
  redraw();
}

/////////////////////////////
//モード設定
//
/////////////////////////////


function mode_surface(){
  pu.edit_mode = "surface";
  submode_reset();
  document.getElementById('style_surface').style.display='inline-block';
  stylemode_check('style_surface');
  redraw();
}

function mode_line(){
  pu.edit_mode = "line";
  submode_reset();
  document.getElementById('mode_line').style.display='inline-block';
  document.getElementById('style_line').style.display='inline-block';
  submode_check('mode_line');
  stylemode_check('style_line');
  redraw();
}

function mode_lineE(){
  pu.edit_mode = "lineE";
  submode_reset();
  document.getElementById('mode_lineE').style.display='inline-block';
  document.getElementById('style_lineE').style.display='inline-block';
  submode_check('mode_lineE');
  stylemode_check('style_lineE');
  redraw();
}

function mode_wall(){
  pu.edit_mode = "wall";
  submode_reset();
  document.getElementById('style_wall').style.display='inline-block';
  stylemode_check('style_wall');
  redraw();
}

function mode_number(){
  pu.edit_mode = "number";
  submode_reset();
  document.getElementById('mode_number').style.display='inline-block';
  submode_check('mode_number');
  document.getElementById('style_number').style.display='inline-block';
  stylemode_check('style_number');
  redraw();
}

function mode_numberE(){
  pu.edit_mode = "numberE";
  submode_reset();
  document.getElementById('mode_numberE').style.display='inline-block';
  submode_check('mode_numberE');
  document.getElementById('style_numberE').style.display='inline-block';
  stylemode_check('style_numberE');
  redraw();
}

function mode_symbol(){
  pu.edit_mode = "symbol";
  submode_reset();
  document.getElementById('mode_symbol').style.display='inline-block';
  document.getElementById('style_symbol').style.display='inline-block';
  stylemode_check('style_symbolL');
  redraw();
}

function mode_symbolE(){
  pu.edit_mode = "symbolE";
  submode_reset();
  document.getElementById('mode_symbol').style.display='inline-block';
  document.getElementById('style_symbol').style.display='inline-block';
  stylemode_check('style_symbolL');
  redraw();
}

function mode_cage(){
  pu.edit_mode = "cage";
  submode_reset();
  document.getElementById('style_cage').style.display='inline-block';
  stylemode_check('style_cage');
  redraw();
}

function mode_special(){
  pu.edit_mode = "special";
  submode_reset();
  document.getElementById('mode_special').style.display='inline-block';
  submode_check('mode_special');
  redraw();
}

function submode_reset(){
  document.getElementById('mode_line').style.display='none';
  document.getElementById('mode_lineE').style.display='none';
  document.getElementById('mode_number').style.display='none';
  document.getElementById('mode_numberE').style.display='none';
  document.getElementById('mode_symbol').style.display='none';
  document.getElementById('mode_special').style.display='none';

  document.getElementById('style_surface').style.display='none';
  document.getElementById('style_line').style.display='none';
  document.getElementById('style_lineE').style.display='none';
  document.getElementById('style_wall').style.display='none';
  document.getElementById('style_number').style.display='none';
  document.getElementById('style_numberE').style.display='none';
  document.getElementById('style_symbol').style.display='none';
  document.getElementById('style_cage').style.display='none';
}

function submode_check(name){
  var elements = document.getElementsByName( name ) ;
  // 選択状態の値を取得
  for (var i=0;i<elements.length; i++ ) {
  	if ( elements[i].checked ) {
  		pu.edit_submode = elements[i].value;
      pu.edit_submode_id = elements[i].id;
  		break ;
  	}
  }
  redraw();//Cursol更新用
}

function stylemode_check(name){
  var elements = document.getElementsByName( name ) ;
  // 選択状態の値を取得
  for (var i=0;i<elements.length; i++ ) {
  	if ( elements[i].checked ) {
  		pu.edit_stylemode = parseInt(elements[i].value,10);
      pu.edit_stylemode_id = elements[i].id;
  		break ;
  	}
  }
  draw_panel();
}

function subsymbolmode(mode){
  pu.edit_subsymbolmode = mode;
  document.getElementById("symmode_content").innerHTML = mode;
  draw_panel();
  //document.getElementById("mode_symbolul2").style.visibility = "hidden";
}

function panel_onoff(){
  if(document.getElementById('panel_button').textContent === "OFF"){
    document.getElementById('panel_button').textContent = "ON";
    document.getElementById('float-key').style.display = "block";
  }else{
    document.getElementById('panel_button').textContent = "OFF";
    document.getElementById('float-key').style.display = "none";
  }
}

function panel_mode_set(mode) {
  pu.panelmode = mode;
  draw_panel();
}

/*
function panel_mode_check() {
  if(pu.edit_mode === "number"||pu.edit_mode === "numberE"){
    if(pu.panelmode === ""||pu.panelmode === "symbol"){
      pu.panelmode = "number";
    }
  }else if(pu.edit_mode === "symbol"||pu.edit_mode === "symbolE"){
    pu.panelmode = "symbol";
  }
}*/

function mode_qa(){
  var elements = document.getElementsByName( "mode_qa" ) ;
  var mode_qa;
  for (var i=0;i<elements.length; i++ ) {
    if ( elements[i].checked ) {
      mode_qa = elements[i].value;
      break ;
    }
  }
  if (mode_qa === "1"){
    pu = pu_q;
    document.getElementById("sub_lineE5_lb").style.display ='inline-block';
  }else if(mode_qa === "2"){
    pu = pu_a;
    document.getElementById("sub_lineE5_lb").style.display ='none';
  }
  mode_reset();
  redraw(); //cursol更新用
}

function mode_reset(){
  var sub = 'mode_'+ pu.edit_mode;
  var style = 'style_'+ pu.edit_mode;
  if(pu.edit_mode === "symbolE"){sub = 'mode_symbol'; style = 'style_symbol';}
  document.getElementById(pu.edit_mode).checked = true;
  if(document.getElementById(pu.edit_submode_id)){document.getElementById(pu.edit_submode_id).checked = true;}
  if(document.getElementById(pu.edit_stylemode_id)){document.getElementById(pu.edit_stylemode_id).checked = true;}
  submode_reset();
  if(document.getElementById(sub)){document.getElementById(sub).style.display='inline-block';}
  if(document.getElementById(style)){document.getElementById(style).style.display='inline-block';}
  subsymbolmode(pu.edit_subsymbolmode);
}



/////////////////////////////
//キー入力
//
/////////////////////////////
function key_arrow(key_code){
  if (pu.edit_mode === "number" || pu.edit_mode === "symbol"){
    if (pu.edit_mode === "number" && pu.edit_submode === "3"){
      switch(key_code){
        case "ArrowLeft":
          if (pu.cursolSx > 0){pu.cursolSx -= 1;}
          break;
        case "ArrowUp":
          if (pu.cursolSy > 0){pu.cursolSy -= 1;}
          break;
        case "ArrowRight":
          if (pu.cursolSx < 2*pu.nx-1){pu.cursolSx += 1;}
          break;
        case "ArrowDown":
          if (pu.cursolSy < 2*pu.ny-1){pu.cursolSy += 1;}
          break;
      }
    }else{
      switch(key_code){
        case "ArrowLeft":
          if (pu.cursolx > 0){pu.cursolx -= 1;}
          break;
        case "ArrowUp":
          if (pu.cursoly > 0){pu.cursoly -= 1;}
          break;
        case "ArrowRight":
          if (pu.cursolx < pu.nx-1){pu.cursolx += 1;}
          break;
        case "ArrowDown":
          if (pu.cursoly < pu.ny-1){pu.cursoly += 1;}
          break;
      }
    }
  }else if (pu.edit_mode === "numberE" || pu.edit_mode === "symbolE"){
    switch(key_code){
      case "ArrowLeft":
        if (pu.cursolEx > 0){pu.cursolEx -= 1;}
        break;
      case "ArrowUp":
        if (pu.cursolEy > 0){pu.cursolEy -= 1;}
        break;
      case "ArrowRight":
        if (pu.cursolEx < 2*pu.nx){pu.cursolEx += 1;}
        break;
      case "ArrowDown":
        if (pu.cursolEy < 2*pu.ny){pu.cursolEy += 1;}
        break;
    }
  }
    redraw();
}

function key_number(key){
  var number;
  var con,conA;
  var arrow;
  var str_num = "1234567890";
  if(pu.edit_mode === "number"){
    switch(pu.edit_submode){
      case "1":
        record("number",pu.cursolx+pu.cursoly*pu.nx);
        if (str_num.indexOf(key) != -1 && pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = parseInt(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0],10); //数字に変換
          if(con>=1 && con<=9 && pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][2] != "7"){　　 //1~9だったら2桁目へ
            number = con.toString()+key;
          }else{
            number = key;
          }
        }else{
          number = key;
        }
        pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,pu.edit_submode];
        break;
      case "2":
        record("number",pu.cursolx+pu.cursoly*pu.nx);
        if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
        }else{
          con = "";
        }
        if (con.slice(-2,-1)==="_"){
          conA = parseInt(con.slice(0,-2),10);
          arrow = con.slice(-2);
        }else{
          conA = parseInt(con,10);
          arrow = "";
        }
        if (str_num.indexOf(key) != -1){
          if(conA>=1 && conA<=9){　　 //1~9だったら2桁目へ
            number = conA.toString()+key;
          }else{
            number = key;
          }
        }else{
          number = key;
        }
        pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number+arrow,pu.edit_stylemode,pu.edit_submode];
        break;
      case "3"://4 place
        record("numberS",pu.cursolSx+pu.cursolSy*pu.nx*2);
        if(pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2]){
          con = pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2][0];
        }else{
          con = "";
        }
        number = con+key;
        pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2] = [number,pu.edit_stylemode];
        break;
      case "4"://tapa
        if (key === "."){key = " ";}
        record("number",pu.cursolx+pu.cursoly*pu.nx);
        if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
          mode = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][2];
        }else{
          con = "";
          mode = "";
        }
        if (mode !=2){ //arrowでなければ
          if(con.length>=0 && con.length<=3){　　 //3文字以内なら追加
            number = con+key;
          }else{
            number = con;  //4文字以上ならそのまま
          }
        }else{　　//arrowなら上書き
          number = key;
        }
        pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,pu.edit_submode];
        break;
      case "5":
        if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
        }else{
          con = "";
        }
        if(con.length < 10){
          record("number",pu.cursolx+pu.cursoly*pu.nx);
          number = con+key;
          pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,pu.edit_submode];
        }
        break;
      case "6":
        if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
        }else{
          con = "";
        }
        if(con.length < 10){
          record("number",pu.cursolx+pu.cursoly*pu.nx);
          number = con+key;
          pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,pu.edit_submode];
        }
        break;
      case "7":
        record("number",pu.cursolx+pu.cursoly*pu.nx);
        if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
        }else{
          con = "";
        }
        number = onofftext(9,key,con);
        pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,pu.edit_submode];
        break;
    }
  }else if(pu.edit_mode === "numberE"){
    if(pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)]){
      con = pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)][0];
    }else{
      con = "";
    }
    switch(pu.edit_submode){
      case "1":
        record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
        if (str_num.indexOf(key) != -1){
          con = parseInt(con,10); //数字に変換
          if(con>=1 && con<=9){　　 //1~9だったら2桁目へ
            number = con.toString()+key;
          }else{
            number = key;
          }
        }else{
          number = key;
        }
        pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
        break;
      case "4": //tapa
        record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
        if(con.length>=0 && con.length<=3){　　 //3文字以内なら追加
          number = con+key;
        }else{
          number = con;
        }
        pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
        break;
      case "5":
        if(con.length < 10){
          record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
          number = con+key;
          pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
        }
        break;
      case "6":
        if(con.length < 10){
          record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
          number = con+key;
          pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
        }
        break;
      case "7":
        if(con.length < 30){
          record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
          number = con+key;
          pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
        }
        break;
      }
    }else if(pu.edit_mode === "symbol"){
      if (str_num.indexOf(key) != -1){
        if(pu.arr.symbol[pu.cursolx+pu.cursoly*pu.nx]){
          con = pu.arr.symbol[pu.cursolx+pu.cursoly*pu.nx][0];
        }else{
          con = "";
        }
        record("symbol",pu.cursolx+pu.cursoly*pu.nx);
        if(pu.edit_subsymbolmode === "cross" ||pu.edit_subsymbolmode === "arrow_cross"){
          number = onofftext(4,key,con);
        }else if(pu.edit_subsymbolmode === "degital"||pu.edit_subsymbolmode === "degital_f"){
          number = onofftext(7,key,con);
        }else if(pu.edit_subsymbolmode === "arrow_eight"){
          number = onofftext(8,key,con);
        }else if(pu.edit_subsymbolmode === "dice"){
          number = onofftext(9,key,con);
        }else{
          number = parseInt(key,10);
        }
        pu.arr.symbol[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_subsymbolmode,pu.edit_stylemode];
      }
    }else if(pu.edit_mode === "symbolE"){
      if (str_num.indexOf(key) != -1){
        if(pu.arr.symbolE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)]){
          con = pu.arr.symbolE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)][0];
        }else{
          con = "";
        }
        record("symbolE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
        if(pu.edit_subsymbolmode === "cross" ||pu.edit_subsymbolmode === "arrow_cross"){
          number = onofftext(4,key,con);
        }else if(pu.edit_subsymbolmode === "degital"){
          number = onofftext(7,key,con);
        }else if(pu.edit_subsymbolmode === "arrow_eight"){
          number = onofftext(8,key,con);
        }else if(pu.edit_subsymbolmode === "dice"){
          number = onofftext(9,key,con);
        }else{
          number = parseInt(key,10);
        }
        pu.arr.symbolE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_subsymbolmode,pu.edit_stylemode];
      }
    }
  redraw();
}

function key_space(){
  if(pu.edit_mode === "number"){
    if(pu.edit_submode === "3"){
      record("numberS",pu.cursolSx+pu.cursolSy*pu.nx*2);
      delete pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2];
    }else{
      record("number",pu.cursolx+pu.cursoly*pu.nx);
      delete pu.arr.number[pu.cursolx+pu.cursoly*pu.nx];
    }
  }else if(pu.edit_mode === "numberE"){
    record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
    delete pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)];
  }else if(pu.edit_mode === "symbol"){
    record("symbol",pu.cursolx+pu.cursoly*pu.nx);
    delete pu.arr.symbol[pu.cursolx+pu.cursoly*pu.nx];
  }else if(pu.edit_mode === "symbolE"){
    record("symbolE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
    delete pu.arr.symbolE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)];
  }
  redraw();
}

function key_shiftspace(){
  if(pu.edit_mode === "number" || pu.edit_mode === "symbol"){
    if(pu.edit_mode === "number" && pu.edit_submode === "3"){
      record("numberS",pu.cursolSx+pu.cursolSy*pu.nx*2);
      delete pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2];
    }else{
      record("number",pu.cursolx+pu.cursoly*pu.nx);
      delete pu.arr.number[pu.cursolx+pu.cursoly*pu.nx];
      record("symbol",pu.cursolx+pu.cursoly*pu.nx);
      delete pu.arr.symbol[pu.cursolx+pu.cursoly*pu.nx];
    }
  }else if(pu.edit_mode === "numberE" || pu.edit_mode === "symbolE"){
    record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
    delete pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)];
    record("symbolE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
    delete pu.arr.symbolE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)];
  }
  redraw();
}

function key_backspace(){
  var number;
  if(pu.edit_mode === "number"){
    if(pu.edit_submode === "3"){//1/4
      if(pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2]){
        record("numberS",pu.cursolSx+pu.cursolSy*pu.nx*2);
        number = pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2][0].slice(0,-1);
        pu.arr.numberS[pu.cursolSx+pu.cursolSy*pu.nx*2][0] = number;
      }
    }else{
      if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
        record("number",pu.cursolx+pu.cursoly*pu.nx);
        number = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
        if(number){
          if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][2] === "2"){
            if (number.slice(-2,-1) === "_"){
              number = number.slice(0,-2).slice(0,-1)+number.slice(-2);
            }else{
              number = number.slice(0,-1);
            }
          }else if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][2] === "7"){
            key_space();
          }else{
            number = number.slice(0,-1);
          }
        }
        pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0] = number;
      }
    }
  }else if(pu.edit_mode === "numberE"){
    if(pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)]){
      record("numberE",pu.cursolEx+pu.cursolEy*(2*pu.nx+1));
      number = pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)][0];
      if(number != ""){
          number = number.slice(0,-1);
      }
      pu.arr.numberE[pu.cursolEx+pu.cursolEy*(2*pu.nx+1)] = [number,pu.edit_stylemode,pu.edit_submode];
    }
  }
  redraw();
}

function onofftext(n,key,data){
  if(data.length != n){
    data = [];
    for (var i=0;i<n;i++){
      data[i] = 0;
    }
  }
  var q = "1234567890".slice(0,n);
  if(q.indexOf(key) != -1){
    con = parseInt(key,10);
    if(data[con-1] === 1){
      data[con-1] = 0;
    }
    else{
      data[con-1] = 1;
    }
  }
  return data;
}

/////////////////////////////
//マウスイベント
//
/////////////////////////////
function drawonDown(numx,numy){
  switch(pu.edit_mode){
    case "surface":
      re_surface(numx,numy);
      pu.lastx = numx;
      pu.lasty = numy;
      break;
    case "line":
      if (pu.edit_submode === "3"){
        re_linedown_free(numx,numy);
      }else if(pu.edit_submode === "4"){
        re_lineX(numx,numy);
      }else{
        pu.lastx = numx;
        pu.lasty = numy;
      }
      pu.line_drawing = 1;
      break;
    case "lineE":
      if (pu.edit_submode === "3"){
        re_linedown_freeE(numx,numy);
      }else if(pu.edit_submode === "4"){
        re_lineXE(numx,numy);
      }else{
        pu.lastx = numx;
        pu.lasty = numy;
      }
      pu.line_drawing = 1;
      break;
    case "wall":
      pu.line_drawing = 1;
      pu.lastx = numx;
      pu.lasty = numy;
      break;
    case "number":
      if(pu.edit_submode === "3" &&numx>=0 && numx<pu.nx*2 && numy>=0 && numy<pu.ny*2){
        pu.cursolSx = numx;
        pu.cursolSy = numy;
        redraw();
      }else if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
        pu.num_drawing = 1;
        pu.lastx = numx;
        pu.lasty = numy;
        pu.cursolx = numx;
        pu.cursoly = numy;
        redraw();
      }
      break;
    case "numberE":
      if(numx>=0 && numx<=pu.nx*2 && numy>=0 && numy<=pu.ny*2){
        pu.num_drawing = 1;
        pu.lastx = numx;
        pu.lasty = numy;
        pu.cursolEx = numx;
        pu.cursolEy = numy;
        redraw();
      }
      break;
    case "symbol":
      if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
        pu.lastx = numx;
        pu.lasty = numy;
        pu.cursolx = numx;
        pu.cursoly = numy;
        redraw();
      }
      break;
    case "symbolE":
      if(numx>=0 && numx<=pu.nx*2 && numy>=0 && numy<=pu.ny*2){
        pu.lastx = numx;
        pu.lasty = numy;
        pu.cursolEx = numx;
        pu.cursolEy = numy;
        redraw();
      }
      break;
    case "cage":
      pu.line_drawing = 1;
      pu.lastx = numx;
      pu.lasty = numy;
      break;
    case "special":
      re_specialdown(numx,numy,pu.edit_submode);
      break;
  }
}

function drawonDownR(numx,numy){
  switch(pu.edit_mode){
    case "surface":
      re_surfaceR(numx,numy);
      pu.lastx = numx;
      pu.lasty = numy;
      break;
  }
}

function drawonUp(numx,numy){
  switch(pu.edit_mode){
    case "surface":
      pu.surface_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "line":
      if (pu.edit_submode === "3"){
        re_lineup_free(numx,numy);
      }
      pu.line_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "lineE":
      if (pu.edit_submode === "3"){
        re_lineup_freeE(numx,numy);
      }
      pu.line_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "wall":
      pu.line_drawing = -1;
      pu.line_wall_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "number":
      pu.num_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "numberE":
      pu.num_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "cage":
      pu.line_drawing = -1;
      pu.lastx = -1;
      pu.lasty = -1;
      break;
    case "special":
      re_specialup(numx,numy,pu.edit_submode);
      break;
  }
}

function drawonMove(numx,numy){
  if (numx != pu.lastx || numy != pu.lasty){ //別のセルに移動したら
    switch(pu.edit_mode){
      case "surface":
        re_surfacemove(numx,numy);
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "line":
        if (pu.edit_submode === "3"){
          re_linemove_free(numx,numy);
        }else if (pu.edit_submode!= "4" &&(pu.edit_submode != "2" || pu.lineD_edge === 0)){ //対角線でないor対角線で内側
          re_linemove(numx,numy);
          pu.lastx = numx;
          pu.lasty = numy;
        }
        break;
      case "lineE":
        if (pu.edit_submode === "3"){
          re_linemove_freeE(numx,numy);
        }else if (pu.edit_submode != "2" || pu.lineD_edge === 0){
          re_linemoveE(numx,numy);
          pu.lastx = numx;
          pu.lasty = numy;
        }
        break;
      case "wall":
        re_wallmove(numx,numy);
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "cage":
        re_linecage(numx,numy);
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "number":
        if (pu.edit_submode === "2" && pu.num_drawing === 1){
          re_numberarrow(numx,numy);
          pu.lastx = -1;
          pu.lasty = -1;
        }
        break;
      case "numberE":
        if (pu.edit_submode === "2" && pu.num_drawing === 1){
          //re_numberarrowE(numx,numy);
        }
        break;
      case "special":
        if (pu.line_drawing === 1 && pu.lineD_edge === 0){
          re_special(numx,numy,pu.edit_submode);
        }
        break;
      }
  }else if(pu.lastx === -1 || pu.lasty ===-1){
    switch(pu.edit_mode){
      case "line":
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "lineE":
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "wall":
        pu.lastx = numx;
        pu.lasty = numy;
        break;
      case "cage":
        pu.lastx = numx;
        pu.lasty = numy;
        break;
    }
  }
}

function drawonOut() {
    switch(pu.edit_mode){
      case "surface":
        pu.surface_drawing = -1;
        break;
      case "line":
        pu.line_drawing = -1;
        if(pu.edit_submode === "3"){
          re_lineup_free(pu.lastx,pu.lasty);
        }
        break;
      case "lineE":
        pu.line_drawing = -1;
        if(pu.edit_submode === "3"){
          re_lineup_free(pu.lastx,pu.lasty);
        }
        break;
      case "special":
        re_specialup(pu.lastx,pu.lasty,pu.edit_submode);
        break;
    }
}

/////////////////////////////
//盤面状態記録
//
/////////////////////////////

function re_numberarrow(numx,numy){
  if(numx>=-1 && numx<=pu.nx && numy>=-1 && numy<=pu.ny && pu.lastx>=0 && pu.lastx<pu.nx && pu.lasty>=0 && pu.lasty<pu.ny ){
    var con;
    if(pu.arr.number[pu.cursolx+pu.cursoly*pu.nx]){
      con = pu.arr.number[pu.cursolx+pu.cursoly*pu.nx][0];
    }else{
      con = "";
    }
    var number;
    record("number",pu.cursolx+pu.cursoly*pu.nx);
    if(numx - pu.lastx === 1 && numy === pu.lasty){
      if(con.slice(-2)==="_R"){
        number = con.slice(0,-2);
      }else if(con.slice(-2,-1)==="_"){
        number = con.slice(0,-1) + "R";
      }else{
        number = con + "_R";
      }
    }else if(numx - pu.lastx === -1 && numy === pu.lasty){
      if(con.slice(-2)==="_L"){
        number = con.slice(0,-2);
      }else if(con.slice(-2,-1)==="_"){
        number = con.slice(0,-1) + "L";
      }else{
        number = con + "_L";
      }
    }else if(numx === pu.lastx && numy - pu.lasty === 1){
      if(con.slice(-2)==="_D"){
        number = con.slice(0,-2);
      }else if(con.slice(-2,-1)==="_"){
        number = con.slice(0,-1) + "D";
      }else{
        number = con + "_D";
      }
    }else if(numx === pu.lastx && numy - pu.lasty === -1){
      if(con.slice(-2)==="_U"){
        number = con.slice(0,-2);
      }else if(con.slice(-2,-1)==="_"){
        number = con.slice(0,-1) + "U";
      }else{
        number = con + "_U";
      }
    }else{
      number = con;
    }
    pu.arr.number[pu.cursolx+pu.cursoly*pu.nx] = [number,pu.edit_stylemode,"2"];
    redraw();
  }
}

function re_surface(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
    record("surface",numx+numy*pu.nx);
    if(pu.arr.surface[numx+numy*pu.nx] && pu.arr.surface[numx+numy*pu.nx] === pu.edit_stylemode && pu.edit_stylemode === 1){
      pu.arr.surface[numx+numy*pu.nx] = 2;
      pu.surface_drawing = 2;
    }else if(pu.arr.surface[numx+numy*pu.nx] && (pu.arr.surface[numx+numy*pu.nx] === pu.edit_stylemode || (pu.arr.surface[numx+numy*pu.nx] === 2 &&  pu.edit_stylemode === 1))){
      delete pu.arr.surface[numx+numy*pu.nx];
      pu.surface_drawing = 0;
    }else{
      pu.arr.surface[numx+numy*pu.nx] = pu.edit_stylemode;
      pu.surface_drawing = pu.edit_stylemode;
    }
    redraw();
  }
}

function re_surfaceR(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
    record("surface",numx+numy*pu.nx);
    if(pu.arr.surface[numx+numy*pu.nx] && pu.arr.surface[numx+numy*pu.nx] === 2){
      delete pu.arr.surface[numx+numy*pu.nx];
      pu.surface_drawing = 0;
    }else{
      pu.arr.surface[numx+numy*pu.nx] = 2;
      pu.surface_drawing = 2;
    }
    redraw();
  }
}

function re_surfacemove(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
    if(pu.surface_drawing === 0){
      if(!pu.arr.surface[numx+numy*pu.nx] || pu.arr.surface[numx+numy*pu.nx] != pu.surface_drawing){
        record("surface",numx+numy*pu.nx);
        delete pu.arr.surface[numx+numy*pu.nx];
        redraw();
      }
    }else if(pu.surface_drawing != -1){
      if(!pu.arr.surface[numx+numy*pu.nx] || pu.arr.surface[numx+numy*pu.nx] != pu.surface_drawing){
        record("surface",numx+numy*pu.nx);
        pu.arr.surface[numx+numy*pu.nx] = pu.surface_drawing;
        redraw();
      }
    }
  }
}

//line,lineE,cage_実描画
function re_line(array,num,line_style){
  if (pu.arr[array][num] === line_style){
    if(pu.line_drawing === 1){
      record(array,num);
      delete pu.arr[array][num];
      pu.line_drawing = 0;
    }else if(pu.line_drawing === 0){
      record(array,num);
      delete pu.arr[array][num];
    }
  }else{
    if(pu.line_drawing === 1){
      record(array,num);
      pu.arr[array][num] = line_style;
      pu.line_drawing = line_style;
    }else if(pu.line_drawing === line_style){
      record(array,num);
      pu.arr[array][num] = line_style;
    }
  }
}

function re_linemove(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny && pu.lastx>=0 && pu.lastx<pu.nx && pu.lasty>=0 && pu.lasty<pu.ny ){
    if(pu.line_drawing != -1){
      var line_style = pu.edit_stylemode;
      var num;
      var array;
      if (pu.edit_submode === "1"){
        if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
          num = Math.min(numx,pu.lastx)+numy*(pu.nx-1);
          array = "lineH";
          re_line(array,num,line_style);
        }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
          num = numx+Math.min(numy,pu.lasty)*pu.nx;
          array = "lineV";
          re_line(array,num,line_style);
        }
      }else if (pu.edit_submode === "2"){
        if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
          num = Math.min(numx,pu.lastx)+numy*(pu.nx-1);
          array = "lineH";
          re_line(array,num,line_style);
        }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
          num = numx+Math.min(numy,pu.lasty)*pu.nx;
          array = "lineV";
          re_line(array,num,line_style);
        }else if((numy - pu.lasty)*(numx - pu.lastx) === 1){
          num = Math.min(numx,pu.lastx)+Math.min(numy,pu.lasty)*(pu.nx-1);
          array = "lineDa";
          re_line(array,num,line_style);
        }else if((numy - pu.lasty)*(numx - pu.lastx) === -1){
          num = Math.min(numx,pu.lastx)+Math.min(numy,pu.lasty)*(pu.nx-1);
          array = "lineDb";
          re_line(array,num,line_style);
        }
      }
      redraw();
    }
  }
}

function re_lineX(numx,numy){
  var num;
  if(numx>0 && numx<2*pu.nx && numy>0 && numy<2*pu.ny){
    if(numx%2===1 && numy%2===0){
      num = (numx-1)*0.5+(numy*0.5-1)*pu.ny;
      if(!pu.arr.lineV[num]){
        record("lineV",num);
        pu.arr.lineV[num] = 98;
      }else if(pu.arr.lineV[num] === 98){
        record("lineV",num);
        delete pu.arr.lineV[num];
      }
    }else if(numx%2===0 && numy%2===1){
      num = (numx*0.5-1)+(numy-1)*0.5*(pu.ny-1);
      if(!pu.arr.lineH[num]){
        record("lineH",num);
        pu.arr.lineH[num] = 98;
      }else if(pu.arr.lineH[num] === 98){
        record("lineH",num);
        delete pu.arr.lineH[num];
      }
    }
    redraw();
  }
}

function re_lineXE(numx,numy){
  var num;
  if(numx>=0 && numx<=2*pu.nx && numy>=0 && numy<=2*pu.ny){
    if(numx%2===0 && numy%2===1){
      num = numx*0.5+(numy-1)*0.5*(pu.ny+1);
      if(!pu.arr.lineVE[num]){
        record("lineVE",num);
        pu.arr.lineVE[num] = 98;
      }else if(pu.arr.lineVE[num] === 98){
        record("lineVE",num);
        delete pu.arr.lineVE[num];
      }
    }else if(numx%2===1 && numy%2===0){
      num = (numx-1)*0.5+numy*0.5*pu.ny;
      if(!pu.arr.lineHE[num]){
        record("lineHE",num);
        pu.arr.lineHE[num] = 98;
      }else if(pu.arr.lineHE[num] === 98){
        record("lineHE",num);
        delete pu.arr.lineHE[num];
      }
    }
    redraw();
  }
}

function re_linemoveE(numx,numy){
  if(numx>=0 && numx<=pu.nx && numy>=0 && numy<=pu.ny && pu.lastx>=0 && pu.lastx<=pu.nx && pu.lasty>=0 && pu.lasty<=pu.ny ){
    if(pu.line_drawing != -1){
      var line_style = pu.edit_stylemode;
      var num;
      var array;
      if (pu.edit_submode === "1"){
        if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
          num = Math.min(numx,pu.lastx)+numy*pu.nx;
          array = "lineHE";
          re_line(array,num,line_style);
        }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
          num = numx+Math.min(numy,pu.lasty)*(pu.nx+1);
          array = "lineVE";
          re_line(array,num,line_style);
        }
      }else if (pu.edit_submode === "2"){
        if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
          num = Math.min(numx,pu.lastx)+numy*pu.nx;
          array = "lineHE";
          re_line(array,num,line_style);
        }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
          num = numx+Math.min(numy,pu.lasty)*(pu.nx+1);
          array = "lineVE";
          re_line(array,num,line_style);
        }else if((numy - pu.lasty)*(numx - pu.lastx) === 1){
          num = Math.min(numx,pu.lastx)+Math.min(numy,pu.lasty)*pu.nx;
          array = "lineDaE";
          re_line(array,num,line_style);
        }else if((numy - pu.lasty)*(numx - pu.lastx) === -1){
          num = Math.min(numx,pu.lastx)+Math.min(numy,pu.lasty)*pu.nx;
          array = "lineDbE";
          re_line(array,num,line_style);
        }
      }else if (pu.edit_submode === "5"){
        if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
          num = Math.min(numx,pu.lastx)+numy*pu.nx;
          array = "deletelineHE";
          re_line(array,num,1);
        }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
          num = numx+Math.min(numy,pu.lasty)*(pu.nx+1);
          array = "deletelineVE";
          re_line(array,num,1);
        }
      }
      redraw();
    }
  }
}

function re_wallmove(numx,numy){
  if(numx>=0 && numx<2*pu.nx && numy>=0 && numy<2*pu.ny && pu.lastx>=0 && pu.lastx<2*pu.nx && pu.lasty>=0 && pu.lasty<2*pu.ny ){
    if(pu.line_drawing != -1){
      var line_style = pu.edit_stylemode;
      var num;
      var array;
      if(pu.line_wall_drawing != 1 && Math.min(numx,pu.lastx) % 2 === 0 && Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
        num = (Math.min(numx,pu.lastx)*0.5)+parseInt(numy*0.5)*pu.nx;
        array = "wallH";
        re_line(array,num,line_style);
        pu.line_wall_drawing = 0; //HモードのときはVは書かない
      }else if(pu.line_wall_drawing != 0 && Math.min(numy,pu.lasty) % 2 === 0 && Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
        num = parseInt(numx*0.5)+(Math.min(numy,pu.lasty)*0.5)*pu.nx;
        array = "wallV";
        re_line(array,num,line_style);
        pu.line_wall_drawing = 1;
      }
      redraw();
    }
  }
}

function re_linecage(numx,numy){
  if(numx>=0 && numx<2*pu.nx && numy>=0 && numy<2*pu.ny && pu.lastx>=0 && pu.lastx<2*pu.nx && pu.lasty>=0 && pu.lasty<2*pu.ny ){
    if(pu.line_drawing != -1){
      var line_style = pu.edit_stylemode;
      var num;
      var array;
      if(Math.abs(numx - pu.lastx) === 1 && numy === pu.lasty){
        num = Math.min(numx,pu.lastx)+numy*(2*pu.nx-1);
        array = "cageH";
        re_line(array,num,line_style);
      }else if(Math.abs(numy - pu.lasty) === 1 && numx === pu.lastx){
        num = numx+Math.min(numy,pu.lasty)*(2*pu.nx);
        array = "cageV";
        re_line(array,num,line_style);
      }
      redraw();
    }
  }
}
function re_linedown_free(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
    pu.lastx = numx;
    pu.lasty = numy;
    pu.freelinecircle[0] = [numx,numy];
    redraw();
  }
}

function re_linemove_free(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny && pu.lastx>=0 && pu.lastx<pu.nx && pu.lasty>=0 && pu.lasty<pu.ny && pu.line_drawing === 1){
    pu.freelinecircle[1] = [numx,numy];
    redraw();
  }
}

function re_lineup_free(numx,numy){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny && pu.lastx>=0 && pu.lastx<pu.nx && pu.lasty>=0 && pu.lasty<pu.ny && pu.line_drawing === 1){
    if (numx != pu.lastx || numy != pu.lasty){
      var n1 = numx+numy*pu.nx;
      var n2 = pu.lastx+pu.lasty*pu.nx;
      var num = (Math.min(n1,n2)).toString()+","+(Math.max(n1,n2)).toString();
      record("freeline",num);
      if(pu.arr.freeline[num]){
        delete pu.arr.freeline[num];
      }else{
        pu.arr.freeline[num]= pu.edit_stylemode;
      }
    }
  }
  pu.freelinecircle = [[-1,-1],[-1,-1]];
  redraw();
}

function re_linedown_freeE(numx,numy){
  if(numx>=0 && numx<=pu.nx && numy>=0 && numy<=pu.ny){
    pu.lastx = numx;
    pu.lasty = numy;
    pu.freelinecircle[0] = [numx,numy];
    redraw();
  }
}

function re_linemove_freeE(numx,numy){
  if(numx>=0 && numx<=pu.nx && numy>=0 && numy<=pu.ny && pu.lastx>=0 && pu.lastx<=pu.nx && pu.lasty>=0 && pu.lasty<=pu.ny && pu.line_drawing === 1){
    pu.freelinecircle[1] = [numx,numy];
    redraw();
  }
}

function re_lineup_freeE(numx,numy){
  if(numx>=0 && numx<=pu.nx && numy>=0 && numy<=pu.ny && pu.lastx>=0 && pu.lastx<=pu.nx && pu.lasty>=0 && pu.lasty<=pu.ny && pu.line_drawing === 1){
    if (numx != pu.lastx || numy != pu.lasty){
      var n1 = numx+numy*(pu.nx+1);
      var n2 = pu.lastx+pu.lasty*(pu.nx+1);
      var num = (Math.min(n1,n2)).toString()+","+(Math.max(n1,n2)).toString();
      record("freelineE",num);
      if(pu.arr.freelineE[num]){
        delete pu.arr.freelineE[num];
      }else{
        pu.arr.freelineE[num]= pu.edit_stylemode;
      }
    }
  }
  pu.freelinecircle = [[-1,-1],[-1,-1]];
  redraw();
}


function re_specialdown(numx,numy,arr){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny){
    var num = numx + numy*pu.nx;
    record(arr,-1);
    pu.arr[arr].push([num]);
    pu.line_drawing = 1;
    pu.lastx = numx;
    pu.lasty = numy;
  }
}

function re_special(numx,numy,arr){
  if(numx>=0 && numx<pu.nx && numy>=0 && numy<pu.ny && pu.line_drawing === 1){
    if ((numx != pu.lastx || numy != pu.lasty)&&(Math.abs(numx-pu.lastx)<=1)&&(Math.abs(numy-pu.lasty)<=1)){
      var num = numx + numy*pu.nx;
      if(pu.arr[arr].slice(-1)[0].slice(-2)[0]===num){
        pu.arr[arr].slice(-1)[0].pop();
      }else{
        pu.arr[arr].slice(-1)[0].push(num);
      }
      pu.lastx = numx;
      pu.lasty = numy;
    }
  }
  redraw();
}

function re_specialup(numx,numy,arr){
  if(pu.arr[arr].slice(-1)[0] && pu.arr[arr].slice(-1)[0].length===1){
    var num = numx + numy*pu.nx;
    pu.arr[arr].pop();
    for (var i=pu.arr[arr].length-1;i>=0;i--){
      if(pu.arr[arr][i][0]===num){
        record(arr,i);
        pu.arr[arr][i] = [];
        break;
      }
    }
  }
  pu.line_drawing = -1;
  pu.lastx = -1;
  pu.lasty = -1;
  redraw();
}
