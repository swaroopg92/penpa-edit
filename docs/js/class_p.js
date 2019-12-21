class Point{
  constructor(x,y,type,adjacent,surround,use,neighbor = []){
    this.x = x;
    this.y = y;
    this.type = type;
    this.adjacent = adjacent;
    this.surround = surround;
    this.neighbor = neighbor;
    this.use = use;
  }
}

class Stack{
  constructor(){
    this.__a = [];
  }

  set(list){
    this.__a = list;
  }

  push(o){
    if( this.__a.length > 1000 ) {
      this.__a.shift();
     }
     this.__a.push(o);
  }
  pop(){
    if( this.__a.length > 0 ) {
      return this.__a.pop();
    }
    return null;
  }
  size(){
    return this.__a.length;
  }
  toString(){
    return '[' + this.__a.join(',') + ']';
  }
}

class Puzzle{
  constructor(gridtype){
    this.gridtype = gridtype;
    this.resol = 2.5;//window.devicePixelRatio || 1;
    this.canvasx = 0;//predefine
    this.canvasy = 0;//predefine
    this.center_n = 0;
    this.center_n0 = 0;
    this.margin = 6;

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.obj = document.getElementById("dvique");
    //square
    this.group1 = ["sub_line2_lb","sub_lineE2_lb","sub_number9_lb","ms_tri","ms_pencils","ms_arrow_fourtip","ms0_arrow_fouredge","mo_combi_lb"];
    //square,pyramid,hex
    this.group2 = ["mo_wall_lb","sub_number2_lb","sub_number3_lb","sub_number6_lb","ms4","ms5"];
    //square,tri,hex
    this.group3 = ["sub_line5_lb"];
    //square,hex
    this.group4 = ["mo_cage_lb"];

    //描画位置
    this.last = -1;
    this.first = -1;
    this.start_point = {}; //for move_redo
    this.drawing_surface = -1;
    this.drawing_line = -1;
    this.drawing_wall = -1;
    this.drawing_num = -1;
    this.drawing_sym = -1;
    this.drawing_board = -1;
    this.drawing_move = -1;
    this.cursol = 0;
    this.cursolS = 0;
    this.paneloff = false;
    //描画モード
    this.mmode = ""; //出題モード用
    this.mode = {
      "qa":"pu_q",
      "grid":["1","2","1"],//grid,lattice,out
      "pu_q":{"edit_mode":"surface",
              "surface":["",1],
              "line":["1",3],
              "lineE":["1",2],
              "wall":["",3],
              "cage":["",10],
              "number":["1",1],
              "symbol":["circle_L",2],
              "special":["thermo",""],
              "board":["",""],
              "move":["1",""],
              "combi":["battleship",""]
            },
      "pu_a":{"edit_mode":"surface",
              "surface":["",1],
              "line":["1",3],
              "lineE":["1",3],
              "wall":["",3],
              "cage":["",10],
              "number":["1",2],
              "symbol":["circle_L",2],
              "special":["thermo",""],
              "board":["",""],
              "move":["1",""],
              "combi":["battleship",""]}
            };
    this.theta = 0;
    this.reflect = [1,1];
    this.centerlist = [];

    this.replace = [
      ["\"qa\"","z9"],
      ["\"pu_q\"","zQ"],
      ["\"pu_a\"","zA"],
      ["\"grid\"","zG"],
      ["\"edit_mode\"","zM"],
      ["\"surface\"","zS"],
      ["\"line\"","zL"],
      ["\"lineE\"","zE"],
      ["\"wall\"","zW"],
      ["\"cage\"","zC"],
      ["\"number\"","zN"],
      ["\"symbol\"","zY"],
      ["\"special\"","zP"],
      ["\"board\"","zB"],
      ["\"command_redo\"","zR"],
      ["\"command_undo\"","zU"],
      ["\"numberS\"","z1"],
      ["\"freeline\"","zF"],
      ["\"freelineE\"","z2"],
      ["\"thermo\"","zT"],
      ["\"arrows\"","z3"],
      ["\"direction\"","zD"],
      ["\"squareframe\"","z0"],
      ["\"deletelineE\"","z4"],
      ["\"__a\"","z_"],
      ["null","zO"],
    ]
  }

  reset(){

    //盤面状態
    for (var i of ["pu_q","pu_a"]){
      this[i] = {};
      this[i].command_redo = new Stack();
      this[i].command_undo = new Stack();
      this[i].surface = {};
      this[i].number = {};
      this[i].numberS = {};
      this[i].symbol = {};
      this[i].freeline = {};
      this[i].freelineE = {};
      this[i].thermo = [];
      this[i].arrows =[];
      this[i].direction = [];
      this[i].squareframe = [];
      this[i].polygon = [];
      this[i].line = {};
      this[i].lineE = {};
      this[i].wall = {};
      this[i].cage = {};
      this[i].deletelineE = {};
    }

    this.frame = {};
    this.freelinecircle_g = [-1,-1];
    this.point=[];
  }

  reset_board(){
    this[this.mode.qa] = {};
    this[this.mode.qa].command_redo = new Stack();
    this[this.mode.qa].command_undo = new Stack();
    this[this.mode.qa].surface = {};
    this[this.mode.qa].number = {};
    this[this.mode.qa].numberS = {};
    this[this.mode.qa].symbol = {};
    this[this.mode.qa].freeline = {};
    this[this.mode.qa].freelineE = {};
    this[this.mode.qa].thermo = [];
    this[this.mode.qa].arrows =[];
    this[this.mode.qa].direction = [];
    this[this.mode.qa].squareframe = [];
    this[this.mode.qa].polygon = [];
    this[this.mode.qa].line = {};
    this[this.mode.qa].lineE = {};
    this[this.mode.qa].wall = {};
    this[this.mode.qa].cage = {};
    this[this.mode.qa].deletelineE = {};
  }

  reset_arr(){
    switch(this.mode[this.mode.qa].edit_mode){
      case "surface":
        this[this.mode.qa].surface = {};
        break;
      case "line":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4"){
          this[this.mode.qa].line = {};
          this[this.mode.qa].freeline = {};
        }else{
          for(i in this[this.mode.qa].line){
            if(this[this.mode.qa].line[i]===98){
              delete this[this.mode.qa].line[i];
            }
          }
        }
        break;
      case "lineE":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4"){
          for(i in this[this.mode.qa].lineE){
            if(this[this.mode.qa].lineE[i]===98){
              delete this[this.mode.qa].lineE[i];
            }
          }
        }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5"){
          this[this.mode.qa].deletelineE = {};
        }else{
          this[this.mode.qa].lineE = {};
          this[this.mode.qa].freelineE = {};
        }
        break;
      case "wall":
        this[this.mode.qa].wall = {};
        break;
      case "number":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "3"){
          this[this.mode.qa].number = {};
        }else{
          this[this.mode.qa].numberS = {};
        }
        break;
      case "symbol":
        this[this.mode.qa].symbol = {};
        //this[this.mode.qa].symbol2 = {};
        break;
      case "cage":
        this[this.mode.qa].cage = {};
        break;
      case "special":
        this[this.mode.qa][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
        break;
      }
    redraw();
  }

  reset_frame_newgrid(){
    this.canvasxy_update();
    this.create_point();
    this.search_center();
    this.canvas_size_setting();
    this.point_move((this.canvasx*0.5-this.point[this.center_n].x+0.5),(this.canvasy*0.5-this.point[this.center_n].y+0.5),this.theta);
    if(this.reflect[0]===-1){
      this.point_reflect_LR();
    }
    if(this.reflect[1]===-1){
      this.point_reflect_UD();
    }
    this.make_frameline();
  }

  make_frameline(){
    var gr = 1;//実線
    var ot = 2;//太線
    if (this.mode.grid[0]==="2"){
      gr = 11; //点線
    }else if(this.mode.grid[0]==="3"){
      gr = 0; //線なし
    }
    if (this.mode.grid[2]==="2"){ //枠なし
      ot = gr;　//枠は内部と同じ線
    }
    var max,min,key;
    this.frame = {};
    for (var j=0;j<this.centerlist.length;j++){
      for (var i=0;i<this.corner;i++){
        max = Math.max(this.point[this.centerlist[j]].surround[i],this.point[this.centerlist[j]].surround[(i+1)%this.corner]);
        min = Math.min(this.point[this.centerlist[j]].surround[i],this.point[this.centerlist[j]].surround[(i+1)%this.corner]);
        key = min.toString()+","+max.toString();
        if(this.frame[key]){
          this.frame[key]=gr;
        }else{
          this.frame[key]=ot;
        }
      }
    }
  }

  point_move(x,y,theta){
    var x0 = this.canvasx*0.5+0.5;//canvasの中心+0.5で回転させる、平行移動時にはx,yを+0.5で入力
    var y0 = this.canvasy*0.5+0.5;
    var x1,y1,x2,y2;
    theta = theta/180*Math.PI;
    for (var i in this.point){
      x1 = this.point[i].x + x;
      y1 = this.point[i].y + y;
      x2 = (x1-x0)*Math.cos(theta)-(y1-y0)*Math.sin(theta) + x0;
      y2 = (x1-x0)*Math.sin(theta)+(y1-y0)*Math.cos(theta) + y0;
      this.point[i].x = x2;
      this.point[i].y = y2;
    }
    this.point_usecheck();
  }

  search_center(){
    var xmax = 0,xmin = 1e5;
    var ymax = 0,ymin = 1e5;
    for (var i of this.centerlist){
      if(this.point[i].x>xmax){xmax = this.point[i].x;}
      if(this.point[i].x<xmin){xmin = this.point[i].x;}
      if(this.point[i].y>ymax){ymax = this.point[i].y;}
      if(this.point[i].y<ymin){ymin = this.point[i].y;}
    }
    var x = (xmax+xmin)/2;
    var y = (ymax+ymin)/2;
    this.width = (xmax-xmin)/this.size+2;
    this.height = (ymax-ymin)/this.size+2;

    var min0,min = 10e6;
    var num = 0;
    for (var i in this.point){
        min0 = (x-this.point[i].x)**2+(y-this.point[i].y)**2;
        if(min0<min){
          min = min0;
          num = i;
        }
    }
    this.center_n = parseInt(num);
  }

  rotate_UD(){
    this.point_reflect_UD();
    this.reflect[1] *= -1;
    this.redraw();
  }

  rotate_LR(){
    this.point_reflect_LR();
    this.reflect[0] *= -1;
    this.redraw();
  }

  point_reflect_LR(){
    var x0 = this.canvasx*0.5+0.5;
    for (var i in this.point){
      this.point[i].x = 2*x0-this.point[i].x;
    }
    this.point_usecheck();
  }

  point_reflect_UD(){
    var y0 = this.canvasy*0.5+0.5;
    for (var i in this.point){
      this.point[i].y = 2*y0-this.point[i].y;
    }
    this.point_usecheck();
  }

  rotate_center(){
    this.search_center();
    this.point_move((this.canvasx*0.5-this.point[this.center_n].x+0.5),(this.canvasy*0.5-this.point[this.center_n].y+0.5),0);
    this.point_usecheck();
    this.redraw();
  }

  rotate_size(){
    this.search_center();
    this.width_c = this.width;
    this.height_c = this.height;
    this.canvasxy_update();
    this.canvas_size_setting();
    this.point_move((this.canvasx*0.5-this.point[this.center_n].x+0.5),(this.canvasy*0.5-this.point[this.center_n].y+0.5),0);
    this.point_usecheck();
    this.redraw();
  }

  rotate_reset(){
    this.width_c = this.width0;
    this.height_c = this.height0;
    this.center_n = this.center_n0; //reset for maketext
    this.canvasxy_update();
    this.canvas_size_setting();
    this.point_move((this.canvasx*0.5-this.point[this.center_n].x+0.5),(this.canvasy*0.5-this.point[this.center_n].y+0.5),0);
    this.redraw();
  }

  point_usecheck(){
    for(var i in this.point){
      if(this.point[i].use === -1){
        ;
      }else if (this.point[i].x<this.margin ||this.point[i].x>this.canvasx-this.margin || this.point[i].y<this.margin ||this.point[i].y>this.canvasy-this.margin){
        this.point[i].use = 0;
      }else{
        this.point[i].use = 1;
      }
    }
  }

  canvasxy_update(){//space for imagesave
    this.size = parseInt(document.getElementById("nb_size3").value);
    this.canvasx = (this.width_c)*this.size;
    this.canvasy = (this.height_c)*this.size;
  }

  canvas_size_setting(){
    this.canvas.width=this.canvasx*this.resol;
    this.canvas.height=this.canvasy*this.resol;
    this.ctx.scale(this.resol,this.resol);
    this.canvas.style.width = this.canvasx.toString()+"px";
    this.canvas.style.height = this.canvasy.toString()+"px";
    this.obj.style.width = this.canvas.style.width;
    this.obj.style.height = this.canvas.style.height;
  }

  resizecanvas(){
    var resizedCanvas = document.createElement("canvas");
    var resizedContext = resizedCanvas.getContext("2d");
    var mode = this.mode[this.mode.qa].edit_mode;

    var cx = this.canvasx;
    var cy = this.canvasy;

    this.mode[this.mode.qa].edit_mode = "surface"; //選択枠削除用
    if (document.getElementById("nb_margin2").checked){
      var {yu,yd,xl,xr} = this.gridspace_calculate();
      this.canvasx = xr-xl;
      this.canvasy = yd-yu;
      this.point_move(-xl,-yu,0);
      this.canvas_size_setting();
    }
    this.redraw();

    var qual;
    if (document.getElementById("nb_quality1").checked){
      qual = 1;
    }else{
      qual = 1.5;
    }

    var width = this.canvas.width/qual;
    resizedCanvas.width = width.toString();
    resizedCanvas.height = (width*this.canvas.height/this.canvas.width).toString();

    resizedContext.drawImage(this.canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
    var canvastext = resizedCanvas.toDataURL("image/png")
    this.mode[this.mode.qa].edit_mode = mode;

    if (document.getElementById("nb_margin2").checked){
      this.canvasx = cx;
      this.canvasy = cy;
      this.point_move(xl,yu,0);
      this.canvas_size_setting();
    }
    this.redraw();
    return canvastext;
  }

  gridspace_calculate(){
    this.redraw();
    // ピクセルデータから計算
    var pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = pixels.data;
    var textHeight = 0;
    var currentRow = -1

    for (var i = 0, len = data.length; i < len; i += 4) {
      var r = data[i], g = data[i+1], b = data[i+2], alpha = data[i+3];
      if (r != 255 || g != 255 || b != 255) {
        var yu = (Math.floor((i / 4) / this.canvas.width))/this.resol;
        break;
      }
    };
    for (var i = data.length-4; i > 0; i -= 4) {
      var r = data[i], g = data[i+1], b = data[i+2], alpha = data[i+3];
      if (r != 255 || g != 255 || b != 255) {
        var yd = (Math.floor((i / 4) / this.canvas.width)+1)/this.resol;
        break;
      }
    }
    for (var i = 0, len = data.length; i < len; i += 4) {
      var j = ((i/4)%this.canvas.height)*this.canvas.width*4+Math.floor((i/4)/this.canvas.height)*4;
      var r = data[j], g = data[j+1], b = data[j+2], alpha = data[j+3];
      if (r != 255 || g != 255 || b != 255) {
        var xl = (((j / 4) % this.canvas.width))/this.resol;
        break;
      }
    };
    for (var i = data.length-4; i > 0; i -= 4) {
      var j = ((i/4)%this.canvas.height)*this.canvas.width*4+Math.floor((i/4)/this.canvas.height)*4;
      var r = data[j], g = data[j+1], b = data[j+2], alpha = data[j+3];
      if (r != 255 || g != 255 || b != 255) {
        var xr = (((j / 4) % this.canvas.width)+1)/this.resol;
        break;
      }
    }

    return {yu,yd,xl,xr};
  }

  mode_set(mode){
    this.mode[this.mode.qa].edit_mode = mode;
    if(mode === "number"){
      document.getElementById("sub_txt").innerHTML = "サブ";
    }else{
      document.getElementById("sub_txt").innerHTML = "　サブ：";
    }
    this.submode_reset();
    if(document.getElementById('mode_'+mode)){
      document.getElementById('mode_'+mode).style.display='inline-block';
    }
    if(document.getElementById('style_'+mode)){
      document.getElementById('style_'+mode).style.display='inline-block';
    }
    document.getElementById('mo_'+mode).checked = true;
    this.submode_check('sub_'+mode+this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
    if(mode === "symbol"){
      this.stylemode_check('st_'+mode+this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]%10);
      this.stylemode_check('st_'+mode+parseInt(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]/10)*10);
    }else{
      this.stylemode_check('st_'+mode+this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]);
    }
    if(this.mode[this.mode.qa].edit_mode==="symbol"){
      this.subsymbolmode(this.mode[this.mode.qa].symbol[0]);
    }
    this.redraw();
  }

  submode_check(name){
    if(document.getElementById(name)){
      document.getElementById(name).checked = true;
      this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]=document.getElementById(name).value;
      this.cursolcheck();
      this.redraw();//盤面カーソル更新
    }
    this.type = this.type_set();//選択する座標タイプ
  }

  cursolcheck(){
    return;
  }

  stylemode_check(name){
    if(document.getElementById(name)){
      document.getElementById(name).checked = true;
      if(name === "st_symbol0"){
        this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]=this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]%10;
      }else if(name === "st_symbol10"){
        this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]=this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]%10+10;
      }else{
        this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]=parseInt(document.getElementById(name).value);
      }
      panel_pu.draw_panel();//パネル更新
    }
  }

  subsymbolmode(mode){
    this.mode[this.mode.qa].symbol[0] = mode;
    document.getElementById("symmode_content").innerHTML = mode;
    panel_pu.draw_panel();
    this.redraw();
  }

  subcombimode(mode){
    this.mode[this.mode.qa].combi[0] = mode;
    document.getElementById("combimode_content").innerHTML = mode;
    this.type = this.type_set();
    this.redraw();
  }

  mode_qa(mode){
    document.getElementById(mode).checked = true;
    this.mode.qa = mode;
    this.mode_set(this.mode[this.mode.qa].edit_mode);
    this.redraw(); //cursol更新用
  }

  mode_grid(mode){
    document.getElementById(mode).checked = true;
    if(mode.slice(0,-1)==="nb_grid"){
      this.mode.grid[0]=mode.slice(-1);
    }else if(mode.slice(0,-1)==="nb_lat"){
      this.mode.grid[1]=mode.slice(-1);
    }else if(mode.slice(0,-1)==="nb_out"){
      this.mode.grid[2]=mode.slice(-1);
    }
  }

  submode_reset(){
    document.getElementById('mode_line').style.display='none';
    document.getElementById('mode_lineE').style.display='none';
    document.getElementById('mode_number').style.display='none';
    document.getElementById('mode_symbol').style.display='none';
    document.getElementById('mode_special').style.display='none';
    document.getElementById('mode_move').style.display='none';
    document.getElementById('mode_combi').style.display='none';

    document.getElementById('style_surface').style.display='none';
    document.getElementById('style_line').style.display='none';
    document.getElementById('style_lineE').style.display='none';
    document.getElementById('style_wall').style.display='none';
    document.getElementById('style_number').style.display='none';
    document.getElementById('style_symbol').style.display='none';
    document.getElementById('style_cage').style.display='none';
    document.getElementById('style_combi').style.display='none';
  }

  reset_selectedmode(){
    switch(this.mode[this.mode.qa].edit_mode){
      case "surface":
        this[this.mode.qa].surface = {};
        break;
      case "line":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4"){
          this[this.mode.qa].line = {};
          this[this.mode.qa].freeline = {};
        }else{
          for(i in this[this.mode.qa].line){
            if(this[this.mode.qa].line[i]===98){
              delete this[this.mode.qa].line[i];
            }
          }
        }
        break;
      case "lineE":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4"){
          for(i in this[this.mode.qa].lineE){
            if(this[this.mode.qa].lineE[i]===98){
              delete this[this.mode.qa].lineE[i];
            }
          }
        }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5"){
          this[this.mode.qa].deletelineE = {};
        }else{
          this[this.mode.qa].lineE = {};
          this[this.mode.qa].freelineE = {};
        }
        break;
      case "wall":
        this[this.mode.qa].wall = {};
        break;
      case "number":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "3"){
          this[this.mode.qa].number = {};
        }else{
          this[this.mode.qa].numberS = {};
        }
        break;
      case "symbol":
        this[this.mode.qa].symbol = {};
        //this[this.mode.qa].symbol2 = {};
        break;
      case "cage":
        this[this.mode.qa].cage = {};
        break;
      case "special":
        this[this.mode.qa][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
        break;
      }
    this.redraw();
  }

  ///////SAVE/////////

    maketext(){
      var text = "";
      text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
              this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy +","+ this.center_n +","+this.center_n0 +"\n";
      text += JSON.stringify(this.space) + "\n";
      text += JSON.stringify(this.mode) + "\n";
      text += JSON.stringify(this.pu_q) + "\n";
      text += JSON.stringify(this.pu_a) + "\n";

      var list=[this.centerlist[0]];
      for (var i = 1;i<this.centerlist.length;i++){
        list.push(this.centerlist[i]-this.centerlist[i-1]);
      }

      text += JSON.stringify(list);

      for (var i=0;i<this.replace.length;i++){
        text = text.split(this.replace[i][0]).join(this.replace[i][1]);
      }

      var u8text = new TextEncoder().encode(text);
      var deflate = new Zlib.RawDeflate(u8text);
      var compressed = deflate.compress();
      var char8 = Array.from(compressed,e=>String.fromCharCode(e)).join("");
      var ba = window.btoa(char8);
      var url = location.href.split('?')[0];
      //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);
      return url+"?m=edit&p="+ba;
    }

    maketext_solve(){
      var text = "";
      text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
              this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy +","+ this.center_n +","+this.center_n0 +"\n";
      text += JSON.stringify(this.space) + "\n";
      text += JSON.stringify(this.mode.grid) + "\n";

      var r = this.pu_q.command_redo.__a;
      var u = this.pu_q.command_undo.__a;
      this.pu_q.command_redo.__a = [];
      this.pu_q.command_undo.__a = [];
      text += JSON.stringify(this.pu_q) + "\n"+ "\n";
      this.pu_q.command_redo.__a = r;
      this.pu_q.command_undo.__a = u;

      var list=[this.centerlist[0]];
      for (var i = 1;i<this.centerlist.length;i++){
        list.push(this.centerlist[i]-this.centerlist[i-1]);
      }
      text += JSON.stringify(list);

      for (var i=0;i<this.replace.length;i++){
        text = text.split(this.replace[i][0]).join(this.replace[i][1]);
      }

      var u8text = new TextEncoder().encode(text);
      var deflate = new Zlib.RawDeflate(u8text);
      var compressed = deflate.compress();
      var char8 = Array.from(compressed,e=>String.fromCharCode(e)).join("");
      var ba = window.btoa(char8);
      var url = location.href.split('?')[0];
      //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);
      return url+"?m=solve&p="+ba;
    }

    maketext_ppfile() {
      var text = "";
      var gridsize = "19.842";

      //解答線
      if(!isEmpty(this.pu_a.line)){
        text += '#解答線:2,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:9.921,9.921\n'+
        '*Stroke:80,3,0,1,1\n';
        var i1,i2,x1,x2,y1,y2;
        for(var i in this.pu_a.line){
          i1 = Number(i.split(",")[0]);
          i2 = Number(i.split(",")[1]);
          y1 = (i1%this.nx0)-2;
          y2 = (i2%this.nx0)-2;
          x1 = parseInt(i1/this.nx0)-2;
          x2 = parseInt(i2/this.nx0)-2;
          text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
        }
        text += "--------\n";
      }

      //問題辺
      if(!isEmpty(this.pu_q.lineE)){
        text += '#問題辺:2,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Stroke:100,2,0,1,1\n';
        var i1,i2,x1,x2,y1,y2;
        for(var i in this.pu_q.lineE){
          i1 = Number(i.split(",")[0])-this.nx0*this.ny0;
          i2 = Number(i.split(",")[1])-this.nx0*this.ny0;
          y1 = (i1%this.nx0)-1;
          y2 = (i2%this.nx0)-1;
          x1 = parseInt(i1/this.nx0)-1;
          x2 = parseInt(i2/this.nx0)-1;
          text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
        }
        text += "--------\n";
      }

      //解答辺
      if(!isEmpty(this.pu_a.lineE)){
        text += '#解答辺:2,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Stroke:100,2,0,1,1\n';
        var i1,i2,x1,x2,y1,y2;
        for(var i in this.pu_a.lineE){
          i1 = Number(i.split(",")[0])-this.nx0*this.ny0;
          i2 = Number(i.split(",")[1])-this.nx0*this.ny0;
          y1 = (i1%this.nx0)-1;
          y2 = (i2%this.nx0)-1;
          x1 = parseInt(i1/this.nx0)-1;
          x2 = parseInt(i2/this.nx0)-1;
          text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
        }
        text += "--------\n";
      }

      //盤面枠
      text += '#盤面枠:0,True\n'+
      '*Grid:'+gridsize+','+gridsize+'\n'+
      '*Skew:0,0\n'+
      '*Offset:0,0\n'+
      '*Size:'+gridsize+','+gridsize+'\n'+
      '*Alignment:0,0\n'+
      '*Fill:-1\n';
      if (this.mode.grid[0]==="1"){
        text += '*Stroke:100,0.4,0,1\n'; //実線
      }else if (this.mode.grid[0]==="2"){
        text += '*Stroke:100,0.4,1.804/3.1565/0.902,1\n';　//点線
      }else if(this.mode.grid[0]==="3"){
        text += '*Stroke:-1,0,0,1\n';　//なし
      }
      if (this.mode.grid[2]==="1"){
        text += '*Border:100,2,0,1\n'; //実線
      }else if (this.mode.grid[2]==="2"){
        text += '*Border:-1,0,0,1\n'; //枠なし
      }

      text += "%%盤面マス%%\n";
      text += "--------\n";

      //解答数字
      if(!isEmptycontent("pu_a","number",2,"1")){
        text += '#解答数字:3,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_a.number[i+j*(this.nx0)]&&this.pu_a.number[i+j*(this.nx0)][2]==="1"&&!isNaN(this.pu_a.number[i+j*(this.nx0)][0])){
              text += this.pu_a.number[i+j*(this.nx0)][0]+" ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //解答文字
      if(!isEmptycontent("pu_a","number",2,"1")){
        text += '#解答文字:7,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n'+
        '*Font:IPAGothic,Normal,Normal,Normal,16\n'+
        '*TextAlignment:1,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_a.number[i+j*(this.nx0)]&&this.pu_a.number[i+j*(this.nx0)][2]==="1"&&isNaN(this.pu_a.number[i+j*(this.nx0)][0])){
              text += this.pu_a.number[i+j*(this.nx0)][0]+" ";
            }else{
              text += "_ ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //問題数字
      if(!isEmptycontent("pu_q","number",2,"1")){
        text += '#問題数字:3,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_q.number[i+j*(this.nx0)]&&this.pu_q.number[i+j*(this.nx0)][2]==="1"&&!isNaN(this.pu_q.number[i+j*(this.nx0)][0])){
              text += this.pu_q.number[i+j*(this.nx0)][0]+" ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //問題1/4数字
      if(!isEmpty(this.pu_q.numberS)){
        text += '#問題1/4数字:3,True\n'+
        '*Grid:'+gridsize/2+','+gridsize/2+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize/2+','+gridsize/2+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n';
        var k;
        for (var j=0; j<2*this.ny0-8; j++){
          for (var i=0; i<2*this.nx0-8; i++){
            if(j%2===0&&i%2===0){
              k=4*this.nx0*this.ny0+4*2*this.nx0+8+2*i+2*j*this.nx0;
            }else if(j%2===0&&i%2===1){
              k=4*this.nx0*this.ny0+4*2*this.nx0+8+1+2*(i-1)+2*j*this.nx0;
            }else if(j%2===1&&i%2===0){
              k=4*this.nx0*this.ny0+4*2*this.nx0+8+2+2*i+2*(j-1)*this.nx0;
            }else if(j%2===1&&i%2===1){
              k=4*this.nx0*this.ny0+4*2*this.nx0+8+3+2*(i-1)+2*(j-1)*this.nx0;
            }
            if(this.pu_q.numberS[k]&&!isNaN(this.pu_q.numberS[k][0])){
              text += this.pu_q.numberS[k][0]+" ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";

      }

      //問題文字
      if(!isEmptycontent("pu_q","number",2,"1")){
        text += '#問題文字:7,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n'+
        '*Font:IPAGothic,Normal,Normal,Normal,16\n'+
        '*TextAlignment:1,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_q.number[i+j*(this.nx0)]&&this.pu_q.number[i+j*(this.nx0)][2]==="1"&&isNaN(this.pu_q.number[i+j*(this.nx0)][0])){
              text += this.pu_q.number[i+j*(this.nx0)][0]+" ";
            }else{
              text += "_ ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //問題Tapa数字
      if(!isEmptycontent("pu_q","number",2,"4")){
        text += '#問題Tapa数字:6,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_q.number[i+j*(this.nx0)]&&this.pu_q.number[i+j*(this.nx0)][2]==="4"&&!isNaN(this.pu_q.number[i+j*(this.nx0)][0])){
              text += this.pu_q.number[i+j*(this.nx0)][0]+" ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //問題丸
      if(!isEmptycontent("pu_q","symbol",1,"circle_M")){
        text += '#問題丸:4,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+(gridsize-2)+','+(gridsize-2)+'\n'+
        '*Alignment:1,1\n'+
        '*Fill:100\n'+
        '*Stroke:100,0.5,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_q.symbol[i+j*(this.nx0)]&&this.pu_q.symbol[i+j*(this.nx0)][0]===1&&this.pu_q.symbol[i+j*(this.nx0)][1]==="circle_M"){
              text += "0 ";
            }else if(this.pu_q.symbol[i+j*(this.nx0)]&&this.pu_q.symbol[i+j*(this.nx0)][0]===2&&this.pu_q.symbol[i+j*(this.nx0)][1]==="circle_M"){
              text += "1 ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //解答丸
      if(!isEmptycontent("pu_a","symbol",1,"circle_M")){
        text += '#解答丸:4,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+(gridsize-2)+','+(gridsize-2)+'\n'+
        '*Alignment:1,1\n'+
        '*Fill:100\n'+
        '*Stroke:100,0.5,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_a.symbol[i+j*(this.nx0)]&&this.pu_a.symbol[i+j*(this.nx0)][0]===1&&this.pu_a.symbol[i+j*(this.nx0)][1]==="circle_M"){
              text += "0 ";
            }else if(this.pu_a.symbol[i+j*(this.nx0)]&&this.pu_a.symbol[i+j*(this.nx0)][0]===2&&this.pu_a.symbol[i+j*(this.nx0)][1]==="circle_M"){
              text += "1 ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //解答黒マス
      if(!isEmpty(this.pu_a.surface)){
        text += '#解答黒マス:0,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:80\n'+
        '*Stroke:100,0.25,0,1\n'+
        '*Border:-1,0,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_a.surface[i+j*(this.nx0)]&&this.pu_a.surface[i+j*(this.nx0)]===1){
              text += "1 ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //問題黒マス
      if(!isEmpty(this.pu_q.surface)){
        text += '#問題黒マス:0,True\n'+
        '*Grid:'+gridsize+','+gridsize+'\n'+
        '*Skew:0,0\n'+
        '*Offset:0,0\n'+
        '*Size:'+gridsize+','+gridsize+'\n'+
        '*Alignment:0,0\n'+
        '*Fill:100\n'+
        '*Stroke:-1,0,0,1\n'+
        '*Border:-1,0,0,1\n';
        for (var j=2; j<this.ny0-2; j++){
          for (var i=2; i<this.nx0-2; i++){
            if(this.pu_q.surface[i+j*(this.nx0)]&&(this.pu_q.surface[i+j*(this.nx0)]===1||this.pu_q.surface[i+j*(this.nx0)]===4)){
              text += "1 ";
            }else{
              text += ". ";
            }
          }
          text += "\n";
        }
        text += "--------\n";
      }

      //盤面マス
      text += '#盤面マス:0,True\n'+
      '*Grid:'+gridsize+','+gridsize+'\n'+
      '*Skew:0,0\n'+
      '*Offset:0,0\n'+
      '*Size:'+gridsize+','+gridsize+'\n'+
      '*Alignment:0,0\n'+
      '*Fill:0\n'+
      '*Stroke:-1,0,0,1\n'+
      '*Border:-1,0,0,1\n';
      for (var j=2; j<this.ny0-2; j++){
        for (var i=2; i<this.nx0-2; i++){
          if(this.centerlist.indexOf(i+j*(this.nx0))!=-1){
            text += "1 ";
          }else{
            text += ". ";
          }
        }
        text += "\n";
      }
      text += "--------\n";

      return text;
    }


  undo(){
    var a = this[this.mode.qa].command_undo.pop();/*a[0]:list_name,a[1]:point_number,a[2]:value*/
    if(a){
      if((a[0]==="thermo"||a[0]==="arrows"||a[0]==="direction"||a[0]==="squareframe"||a[0]==="polygon") && a[1] === -1){
        if(this[this.mode.qa][a[0]].length > 0){
          this[this.mode.qa].command_redo.push([a[0],a[1],this[this.mode.qa][a[0]].pop()]);
        }
      }else if(a[0]==="move"){//a[0]:move a[1]:point_from a[2]:point_to
        for (var i in a[1]){
          if(a[1][i]!=a[2]){
            this[this.mode.qa][i][a[1][i]] = this[this.mode.qa][i][a[2]];
            delete this[this.mode.qa][i][a[2]];
          }
        }
        this[this.mode.qa].command_redo.push([a[0],a[1],a[2]]);
      }else{
        if(this[this.mode.qa][a[0]][a[1]]){//symbol etc
          this[this.mode.qa].command_redo.push([a[0],a[1],this[this.mode.qa][a[0]][a[1]]]);
        }else{
          this[this.mode.qa].command_redo.push([a[0],a[1],null]);
        }
        if(a[2]){
          this[this.mode.qa][a[0]][a[1]] = JSON.parse(a[2]);  //JSON.parseでdecode
        }else{
          delete this[this.mode.qa][a[0]][a[1]];
        }
      }
      this.redraw();
    }
  }

  redo(){
    var a = this[this.mode.qa].command_redo.pop();
    if(a){
      if((a[0]==="thermo"||a[0]==="arrows"||a[0]==="direction"||a[0]==="squareframe"||a[0]==="polygon") && a[1] === -1){
          this[this.mode.qa].command_undo.push([a[0],a[1],null]);
          this[this.mode.qa][a[0]].push(a[2]);
      }else if(a[0]==="move"){//a[0]:move a[1]:point_from a[2]:point_to
        for (var i in a[1]){
          if(a[1][i]!=a[2]){
            this[this.mode.qa][i][a[2]] = this[this.mode.qa][i][a[1][i]];
            delete this[this.mode.qa][i][a[1][i]];
          }
        }
        this[this.mode.qa].command_undo.push([a[0],a[1],a[2]]);
      }else{
        if(this[this.mode.qa][a[0]][a[1]]){
          this[this.mode.qa].command_undo.push([a[0],a[1],JSON.stringify(this[this.mode.qa][a[0]][a[1]])]);
        }else{
          this[this.mode.qa].command_undo.push([a[0],a[1],null]);
        }
        if(a[2]){
          this[this.mode.qa][a[0]][a[1]] = a[2];
        }else{
          delete this[this.mode.qa][a[0]][a[1]];
        }
      }
      this.redraw();
    }
  }

  record(arr,num){
    if((arr === "thermo"||arr === "arrows"||arr==="direction"||arr==="squareframe") && num===-1){
      this[this.mode.qa].command_undo.push([arr,num,null]);
    }else if(arr === "move"){
      this[this.mode.qa].command_undo.push([arr,num[0],num[1]]);//num[0]:start_point num[1]:to_point
    }else{
      if (this[this.mode.qa][arr][num]){
        this[this.mode.qa].command_undo.push([arr,num,JSON.stringify(this[this.mode.qa][arr][num])]);   //配列もまとめてJSONで記録
      }else{
        this[this.mode.qa].command_undo.push([arr,num,null]);
      }
    }
    this[this.mode.qa].command_redo = new Stack();
  }


  /////////////////////////////
  //キーイベント
  //
  /////////////////////////////

  key_number(key){
    var number;
    var con,conA;
    var arrow,mode;
    var str_num = "1234567890";
    if(this.mode[this.mode.qa].edit_mode === "number"){
      switch(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]){
        case "1":
          this.record("number",this.cursol);
          if (str_num.indexOf(key) != -1 && this[this.mode.qa].number[this.cursol]){
            con = parseInt(this[this.mode.qa].number[this.cursol][0],10); //数字に変換
            if(con>=1 && con<=9 && this[this.mode.qa].number[this.cursol][2] != "7"){　　 //1~9だったら2桁目へ
              number = con.toString()+key;
            }else{
              number = key;
            }
          }else{
            number = key;
          }
          this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          break;
        case "2":
          this.record("number",this.cursol);
          if(this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "7"){
            con = this[this.mode.qa].number[this.cursol][0];
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
          this[this.mode.qa].number[this.cursol] = [number+arrow,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          break;
        case "3"://4 place
        case "9":
          this.record("numberS",this.cursolS);
          if(this[this.mode.qa].numberS[this.cursolS]){
            con = this[this.mode.qa].numberS[this.cursolS][0];
          }else{
            con = "";
          }
          number = con+key;
          this[this.mode.qa].numberS[this.cursolS] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
          break;
        case "4"://tapa
          if (key === "."){key = " ";}
          this.record("number",this.cursol);
          if(this[this.mode.qa].number[this.cursol]){
            con = this[this.mode.qa].number[this.cursol][0];
            mode = this[this.mode.qa].number[this.cursol][2];
          }else{
            con = "";
            mode = "";
          }
          if (mode != 2 && mode != 7){ //arrowでなければ
            if(con.length>=0 && con.length<=3){　　 //3文字以内なら追加
              number = con+key;
            }else{
              number = con;  //4文字以上ならそのまま
            }
          }else{　　//arrowなら上書き
            number = key;
          }
          this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          break;
        case "5":
          if(this[this.mode.qa].number[this.cursol]&& this[this.mode.qa].number[this.cursol][2] != "2"&&this[this.mode.qa].number[this.cursol][2]!="7"){
            con = this[this.mode.qa].number[this.cursol][0];
          }else{
            con = "";
          }
          if(con.length < 10){
            this.record("number",this.cursol);
            number = con+key;
            this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          }
          break;
        case "6":
          if(this[this.mode.qa].number[this.cursol]&& this[this.mode.qa].number[this.cursol][2] != "2"&&this[this.mode.qa].number[this.cursol][2]!="7"){
            con = this[this.mode.qa].number[this.cursol][0];
          }else{
            con = "";
          }
          if(con.length < 10){
            this.record("number",this.cursol);
            number = con+key;
            this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          }
          break;
        case "7":
          this.record("number",this.cursol);
          if(this[this.mode.qa].number[this.cursol]&& this[this.mode.qa].number[this.cursol][2]==="7"){
            con = this[this.mode.qa].number[this.cursol][0];
          }else{
            con = "";
          }
          number = this.onofftext(9,key,con);
          this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          break;
        case "8":
          if(this[this.mode.qa].number[this.cursol]&& this[this.mode.qa].number[this.cursol][2] != "2"&&this[this.mode.qa].number[this.cursol][2]!="7"){
            con = this[this.mode.qa].number[this.cursol][0];
          }else{
            con = "";
          }
          if(con.length < 30){
            this.record("number",this.cursol);
            number = con+key;
            this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
          }
          break;
        }
      }else if(this.mode[this.mode.qa].edit_mode === "symbol"){
        if (str_num.indexOf(key) != -1){
          if(this[this.mode.qa].symbol[this.cursol]){
            if(this[this.mode.qa].symbol[this.cursol][0]===parseInt(key,10)&&this[this.mode.qa].symbol[this.cursol][1]===this.mode[this.mode.qa].symbol[0]){
              this.key_space();//内容が同じなら削除
              return;
            }else{
              con = this[this.mode.qa].symbol[this.cursol][0];
            }
          }else{
            con = "";
          }
          this.record("symbol",this.cursol);

          if(this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]]){//onoffモードならリスト
            number = this.onofftext(this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]],key,con);
          }else{
            number = parseInt(key,10);
          }
          this[this.mode.qa].symbol[this.cursol] = [number,this.mode[this.mode.qa].symbol[0],this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
        }
      }
    this.redraw();
  }

  onofftext(n,key,data){
    if(data.length != n){
      data = [];
      for (var i=0;i<n;i++){
        data[i] = 0;
      }
    }
    var q = "1234567890".slice(0,n);
    if(q.indexOf(key) != -1){
      var con = parseInt(key,10);
      if(data[con-1] === 1){
        data[con-1] = 0;
      }
      else{
        data[con-1] = 1;
      }
    }
    return data;
  }

  key_space(){
    if(this.mode[this.mode.qa].edit_mode === "number"){
      if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9"){
        this.record("numberS",this.cursolS);
        delete this[this.mode.qa].numberS[this.cursolS];
      }else{
        this.record("number",this.cursol);
        delete this[this.mode.qa].number[this.cursol];
      }
    }else if(this.mode[this.mode.qa].edit_mode === "symbol"){
      this.record("symbol",this.cursol);
      delete this[this.mode.qa].symbol[this.cursol];
    }
    this.redraw();
  }

  key_shiftspace(){
    if(this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol"){
      if(this.mode[this.mode.qa].edit_mode === "number" && (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9")){
        this.record("numberS",this.cursolS);
        delete this[this.mode.qa].numberS[this.cursolS];
      }else{
        this.record("number",this.cursol);
        delete this[this.mode.qa].number[this.cursol];
        this.record("symbol",this.cursol);
        delete this[this.mode.qa].symbol[this.cursol];
      }
    }
    this.redraw();
  }

  key_backspace(){
    var number;
    if(this.mode[this.mode.qa].edit_mode === "number"){
      if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9"){//1/4
        if(this[this.mode.qa].numberS[this.cursolS]){
          this.record("numberS",this.cursolS);
          number = this[this.mode.qa].numberS[this.cursolS][0].slice(0,-1);
          this[this.mode.qa].numberS[this.cursolS][0] = number;
        }
      }else{
        if(this[this.mode.qa].number[this.cursol]){
          this.record("number",this.cursol);
          number = this[this.mode.qa].number[this.cursol][0];
          if(number){
            if(this[this.mode.qa].number[this.cursol][2] === "2"){
              if (number.slice(-2,-1) === "_"){
                number = number.slice(0,-2).slice(0,-1)+number.slice(-2);
              }else{
                number = number.slice(0,-1);
              }
            }else if(this[this.mode.qa].number[this.cursol][2] === "7"){
              key_space();
            }else{
              number = number.slice(0,-1);
            }
          }
          this[this.mode.qa].number[this.cursol][0] = number;
        }
      }
    }
    this.redraw();
  }

  /////////////////////////////
  //マウスイベント
  //
  /////////////////////////////
  drawonDown(num){
    switch(this.mode[this.mode.qa].edit_mode){
      case "surface":
        this.re_surface(num);
        this.last = num;
        break;
      case "line":
        if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
          this.re_linedown_free(num);
        }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4"){
          this.re_lineX(num);
        }else{
          this.last = num;
        }
        this.drawing_line = 1;
        break;
      case "lineE":
        if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
          this.re_linedown_free(num);
        }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4"){
          this.re_lineX(num);
        }else{
          this.last = num;
        }
        this.drawing_line = 1;
        break;
      case "wall":
        this.drawing_line = 1;
        this.last = num;
        this.type = this.type_set();
        break;
      case "number":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9"){
          this.cursolS = num;
          this.redraw();
        }else{
          this.drawing_num = 1;
          this.last = num;
          this.cursol = num;
          this.redraw();
        }
        break;
      case "symbol":
        this.last = num;
        this.cursol = num;
        if(document.getElementById('panel_button').textContent === "ON"&&!this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]]){
          if (0<=panel_pu.edit_num&&panel_pu.edit_num<=8){
            this.key_number((panel_pu.edit_num+1).toString());
          }else if (panel_pu.edit_num===9){
            this.key_number((panel_pu.edit_num-9).toString());
          }else if (panel_pu.edit_num===11){
            this.key_space();
          }
        }
        this.redraw();
        break;
      case "cage":
        this.drawing_line = 1;
        this.last = num;
        break;
      case "special":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="polygon"){
          this.re_polygondown(num);
        }else if(this.point[num].type === 0){
          this.re_specialdown(num,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
        }
        break;
      case "board":
        this.drawing_board = 1;
        this.re_board(num);
        break;
      case "move":
        this.re_movedown(num);
        this.redraw();
        break;
    }
  }

  drawonDownR(num){//右クリック
    switch(this.mode[this.mode.qa].edit_mode){
      case "surface":
        this.re_surfaceR(num);
        this.last = num;
        break;
      case "number":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9"){
          this.cursolS = num;
          this.redraw();
        }else{
          this.cursol = num;
          this.redraw();
        }
        break;
      case "symbol":
        this.last = num;
        this.cursol = num;
        this.redraw();
        break;
    }
  }

  drawonUp(num){
    switch(this.mode[this.mode.qa].edit_mode){
      case "surface":
        this.drawing_surface = -1;
        this.last = -1;
        break;
      case "line":
        if(pu.point[num].use===1){
          if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_lineup_free(num);
          }
        }
        this.drawing_line = -1;
        this.last = -1;
        break;
      case "lineE":
        if(pu.point[num].use===1){
          if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_lineup_free(num);
          }
        }
        this.drawing_line = -1;
        this.last = -1;
        break;
      case "wall":
        this.drawing_line = -1;
        this.last = -1;
        this.type = this.type_set();
        break;
      case "number":
        this.drawing_num = -1;
        this.last = -1;
        break;
      case "cage":
        this.drawing_line = -1;
        this.last = -1;
        break;
      case "special":
        if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]!="polygon"){
          if(pu.point[num].use===1){
            if(this.point[num].type === 0){
              this.re_specialup(num,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
            }
          }
          this.drawing_line = -1;
          this.last = -1;
          this.redraw();
        }
        break;
      case "board":
        this.drawing_board = -1;
        this.last = -1;
        break;
      case "move":
        if(this.last != -1){
          this.re_moveup(num);
          this.drawing_move = -1;
          this.start_point = {};
          this.last = -1;
          break;
        }
    }
  }

  drawonMove(num){
    if (num != this.last){ //別のセルに移動したら
      switch(this.mode[this.mode.qa].edit_mode){
        case "surface":
          this.re_surfacemove(num);
          this.last = num;
          break;
        case "line":
          if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_linemove_free(num);
          }else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]!= "4" && (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "2" || this.point[num].type === 0)){ //対角線でないor対角線で内側
            this.re_linemove(num);
            this.last = num;
          }
          break;
        case "lineE":
          if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_linemove_free(num);
          }else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "2"||this.point[num].type === 1){
            this.re_linemoveE(num);
            this.last = num;
          }
          break;
        case "wall":
          this.re_wallmove(num);
          this.last = num;
          break;
        case "cage":
          this.re_linecage(num);
          this.last = num;
          break;
        case "number":
          if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2" && this.drawing_num === 1){
            this.re_numberarrow(num);
            this.last = -1;
          }
          break;
        case "special":
          if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="polygon"){
            this.re_polygonmove(num);
          }else if (this.drawing_line === 1 &&this.point[num].type === 0){
            this.re_special(num,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
          }
          break;
        case "board":
          this.re_boardmove(num);
          this.last = num;
          break;
        case "move":
          if(this.drawing_move === 1){
            this.re_movemove(num);
          }
          this.redraw();
          break;
        }
    }
  }

  drawonOut() {
      switch(this.mode[this.mode.qa].edit_mode){
        case "surface":
          this.drawing_surface = -1;
          break;
        case "line":
          this.drawing_line = -1;
          if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_lineup_free(this.last);
          }
          break;
        case "lineE":
          this.drawing_line = -1;
          if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"){
            this.re_lineup_free(this.last);
          }
          break;
        case "special":
          this.re_specialup(this.last,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
          this.drawing_line = -1;
          this.last = -1;
          this.redraw();
          break;
        case "board":
          this.drawing_board = -1;
          break;
        case "move":
          if(this.drawing_move != -1){
            this.record("move",[this.start_point,this.last]);
            this.drawing_move = -1;
            this.start_point = {};
            this.last = -1;
          }
          break;
        case "combi":
          if(this.drawing_line != -1){
            this.drawing_line = -1;
          }
          this.paneloff = false;
          break;
      }
  }

  re_numberarrow(num){
      var con;
      if(this[this.mode.qa].number[this.cursol]){
        con = this[this.mode.qa].number[this.cursol][0];
      }else{
        con = "";
      }
      var number;
      this.record("number",this.cursol);
      if (this.last != -1){
        var arrowdirection = this.point[this.last].adjacent.indexOf(num);
        if(arrowdirection != -1){
          if(con.slice(-2)==="_"+arrowdirection){
            number = con.slice(0,-2);
          }else if(con.slice(-2,-1)==="_"){
            number = con.slice(0,-1) + arrowdirection;
          }else{
            number = con + "_" + arrowdirection;
          }
        }else{
          number = con;
        }
        this[this.mode.qa].number[this.cursol] = [number,this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1],"2"];
        this.redraw();
      }
  }

  re_surface(num){
    this.record("surface",num);
    if(this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] === 1){
      this[this.mode.qa].surface[num] = 2;
      this.drawing_surface = 2;
    }else if(this[this.mode.qa].surface[num] && (this[this.mode.qa].surface[num] === this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] || (this[this.mode.qa].surface[num] === 2 &&  this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] === 1))){
      delete this[this.mode.qa].surface[num];
      this.drawing_surface = 0;
    }else{
      this[this.mode.qa].surface[num] = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
      this.drawing_surface = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
    }
    this.redraw();
  }

  re_surfaceR(num){
      this.record("surface",num);
      if(this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === 2){
        delete this[this.mode.qa].surface[num];
        this.drawing_surface = 0;
      }else{
        this[this.mode.qa].surface[num] = 2;
        this.drawing_surface = 2;
      }
      this.redraw();
  }

  re_surfacemove(num){
      if(this.drawing_surface === 0){
        if(!this[this.mode.qa].surface[num] || this[this.mode.qa].surface[num] != this.drawing_surface){
          this.record("surface",num);
          delete this[this.mode.qa].surface[num];
          this.redraw();
        }
      }else if(this.drawing_surface != -1){
        if(!this[this.mode.qa].surface[num] || this[this.mode.qa].surface[num] != this.drawing_surface){
          this.record("surface",num);
          this[this.mode.qa].surface[num] = this.drawing_surface;
          this.redraw();
        }
      }
  }

  re_board(num){
    var index = this.centerlist.indexOf(num);
    if(index===-1){
      this.centerlist.push(num);
      this.drawing_board = 1;
    }else{
      this.centerlist.splice(index,1);
      this.drawing_board = 0;
    }
    this.make_frameline();
    this.redraw();
  }

  re_boardmove(num){
    var index = this.centerlist.indexOf(num);
    if(this.drawing_board === 1 && index===-1){
      this.centerlist.push(num);
      this.drawing_board = 1;
    }else if(this.drawing_board === 0 && index != -1){
      this.centerlist.splice(index,1);
      this.drawing_board = 0;
    }
    this.make_frameline();
    this.redraw();
  }

  re_movedown(num){
    var array_list = {};
    if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="1"){
      array_list = ["number","symbol"];
    }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="2"){
      array_list = ["number"];
    }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="3"){
      array_list = ["symbol"];
    }

    for (var array of array_list){
      if(this[this.mode.qa][array][num]){
        this.drawing_move = 1;
        this.start_point[array] = num;
        this.last = num;
        this.cursol = num;
      }
    }
  }

  re_movemove(num){
    var array_list;
    var array_list_record = [];
    var flag = 1;

    this.cursol = num;

    if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="1"){
      array_list = ["number","symbol"];
    }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="2"){
      array_list = ["number"];
    }else if(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="3"){
      array_list = ["symbol"];
    }
    for (var array in this.start_point){
      if(this[this.mode.qa][array][num]){
        flag = 0;
      }
    }
    if (flag === 1){
      for (var array of array_list){
        if(!this.start_point[array] && this[this.mode.qa][array][this.cursol]){
          this.start_point[array] = this.cursol;
        }
      }
      for (var array in this.start_point){
        if(this[this.mode.qa][array][this.last]){
          this[this.mode.qa][array][this.cursol]=this[this.mode.qa][array][this.last];
          delete this[this.mode.qa][array][this.last];
        }
      }
      this.last = this.cursol;
    }
    //console.log(this[this.mode.qa]["symbol"]);
    this.redraw();
  }

  re_moveup(num){
    this.record("move",[this.start_point,num]);
    this.redraw();
  }

  //line,lineE,cage_実描画
  re_line(array,num,line_style){
    if (this[this.mode.qa][array][num] === line_style){
      if(this.drawing_line === 1){
        this.record(array,num);
        delete this[this.mode.qa][array][num];
        this.drawing_line = 0;
      }else if(this.drawing_line === 0){
        this.record(array,num);
        delete this[this.mode.qa][array][num];
      }
    }else{
      if(this.drawing_line === 1){
        this.record(array,num);
        this[this.mode.qa][array][num] = line_style;
        this.drawing_line = line_style;
      }else if(this.drawing_line === line_style){
        this.record(array,num);
        this[this.mode.qa][array][num] = line_style;
      }
    }
  }

  re_linemove(num){
    if(this.drawing_line != -1){
      var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
      var array;
      if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1"){
        if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){
          array = "line";
          var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
          this.re_line(array,key,line_style);
        }
      }else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5"){//centerline
        if(this.point[num].neighbor.indexOf(parseInt(this.last)) != -1){
          array = "line";
          var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
          this.re_line(array,key,line_style);
        }
      }
      this.redraw();
    }
  }

  re_lineX(num){
    if(!this[this.mode.qa].line[num]){//線が引かれてない
      this.record("line",num);
      this[this.mode.qa].line[num] = 98;
    }else if(this[this.mode.qa].line[num] === 98){//×印
      this.record("line",num);
      delete this[this.mode.qa].line[num];
    }else{//線が引かれている
      this.record("line",num);
      this[this.mode.qa].line[num] = 98;
    }
    this.redraw();
  }

  re_linemoveE(num){
    if(this.drawing_line != -1){
      var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
      var array;
      if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1"){
        if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){//隣接していたら
          array = "lineE";
          var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
          this.re_line(array,key,line_style);
        }
      }else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5"){
        if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){//隣接していたら
          array = "deletelineE";
          var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
          this.re_line(array,key,1);
        }
      }
      this.redraw();
    }
  }

  re_wallmove(num){
      if(this.drawing_line != -1){
        var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
        var array;
        if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){//隣接していたら
          array = "wall";
          var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
          this.re_line(array,key,line_style);
        }
        this.redraw();
      }
  }

  re_linecage(num){
    if(this.drawing_line != -1){
      var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
      var array;
      if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){
        array = "cage";
        var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
        this.re_line(array,key,line_style);
      }
      this.redraw();
    }
  }

  re_linedown_free(num){
      this.last = num;
      this.freelinecircle_g[0] = num;
      this.redraw();
  }

  re_linemove_free(num){
      this.freelinecircle_g[1] = num;
      this.redraw();
  }

  re_lineup_free(num){
    if (num != this.last && this.last != -1){
        var key = (Math.min(num,this.last)).toString()+","+(Math.max(num,this.last)).toString();
        this.record("freeline",key);
        if(this[this.mode.qa].freeline[key]){
          delete this[this.mode.qa].freeline[key];
        }else{
          this[this.mode.qa].freeline[key]= this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
        }
    }
    this.freelinecircle_g = [-1,-1];
    this.last = -1;
    this.redraw();
  }

  re_specialdown(num,arr){
    this.record(arr,-1);
    this[this.mode.qa][arr].push([num]);
    this.drawing_line = 1;
    this.last = num;
  }

  re_special(num,arr){
    if(this.point[num].adjacent.indexOf(parseInt(this.last)) != -1){//隣接していたら
      if(this[this.mode.qa][arr].slice(-1)[0].slice(-2)[0]===num){
        this[this.mode.qa][arr].slice(-1)[0].pop();
      }else{
        this[this.mode.qa][arr].slice(-1)[0].push(num);
      }
      this.last = num;
    }
    this.redraw();
  }

  re_specialup(num,arr){
    if(this[this.mode.qa][arr].slice(-1)[0] && this[this.mode.qa][arr].slice(-1)[0].length===1){
      this[this.mode.qa][arr].pop();
      for (var i=this[this.mode.qa][arr].length-1;i>=0;i--){
        if(this[this.mode.qa][arr][i][0]===num){
          this.record(arr,i);
          this[this.mode.qa][arr][i] = [];
          break;
        }
      }
    }
  }

  re_polygonmove(num){
    var arr = "polygon";
    this.freelinecircle_g[1] = num;
    if(this.drawing_line === 1){
      this[this.mode.qa][arr].slice(-1)[0][this[this.mode.qa][arr].slice(-1)[0].length-1] = num;
    }
    this.redraw();
  }

  re_polygondown(num){
    var arr = "polygon";
    if(this.drawing_line  != 1){
      /* //1マス目をクリックすると消える機能
      for (var i=this[this.mode.qa][arr].length-1;i>=0;i--){
        if(this[this.mode.qa][arr][i][0]===num){
          this.record(arr,i);
          this[this.mode.qa][arr][i] = [];
          return;
        }
      }
      */
      this.drawing_line = 1;
      this.record(arr,-1);
      this[this.mode.qa][arr].push([num,num]);
    }else if(this.drawing_line === 1){
      if(num != this[this.mode.qa][arr].slice(-1)[0][0] && num != this[this.mode.qa][arr].slice(-1)[0][this[this.mode.qa][arr].slice(-1)[0].length-2]){
        this[this.mode.qa][arr].slice(-1)[0].push(num);
      }else{
        this[this.mode.qa][arr].slice(-1)[0].pop();
        this.drawing_line = -1;
      }
    }
  }

  redraw(){
    this.flushcanvas();
    panel_pu.draw_panel();
    this.draw();
    this.set_redoundocolor();
  }

  set_redoundocolor(){
    if(this[this.mode.qa].command_redo.__a.length===0){
      document.getElementById('tb_redo').style.color = '#ccc';
    }else{
      document.getElementById('tb_redo').style.color = '#000';
    }
    if(this[this.mode.qa].command_undo.__a.length===0){
      document.getElementById('tb_undo').style.color = '#ccc';
    }else{
      document.getElementById('tb_undo').style.color = '#000';
    }
  }

  flushcanvas(){
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(){
    return;//override
  }

  draw_frame() {
    for(var i in this.frame){
      if(this.frame[i]&&!this.pu_q.deletelineE[i]){
        set_line_style(this.ctx,this.frame[i]);
        var i1 = i.split(",")[0];
        var i2 = i.split(",")[1];
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[i1].x,this.point[i1].y);
        this.ctx.lineTo(this.point[i2].x,this.point[i2].y);
        this.ctx.stroke();
      }
    }
  }
  draw_frameBold(){
    /*frame-B*/
    for(var i in this.frame){
      if(this.frame[i]===2&&!this.pu_q.deletelineE[i]){
        set_line_style(this.ctx,this.frame[i]);
        var i1 = i.split(",")[0];
        var i2 = i.split(",")[1];
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[i1].x,this.point[i1].y);
        this.ctx.lineTo(this.point[i2].x,this.point[i2].y);
        this.ctx.stroke();
      }
    }
  }

  draw_polygonsp(pu) {
    for(var i=0; i<this[pu].polygon.length;i++){
      if(this[pu].polygon[i][0]){
        this.ctx.setLineDash([]);
        this.ctx.lineCap = "square";
        this.ctx.strokeStyle = "#000";
        this.ctx.fillStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[this[pu].polygon[i][0]].x,this.point[this[pu].polygon[i][0]].y);
        for(var j=1;j<this[pu].polygon[i].length;j++){
          this.ctx.lineTo(this.point[this[pu].polygon[i][j]].x,this.point[this[pu].polygon[i][j]].y);
        }
        this.ctx.stroke();
        this.ctx.fill();
      }
    }
  }

  draw_freecircle(){
    /*free_circle*/
    if (((this.mode[this.mode.qa].edit_mode === "line"||this.mode[this.mode.qa].edit_mode === "lineE") && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3")||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]==="polygon"){
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.strokeStyle = "#1e90ff";
      this.ctx.lineWidth = 4;
      if(this.freelinecircle_g[0]!=-1){
        this.draw_circle(this.ctx,this.point[this.freelinecircle_g[0]].x,this.point[this.freelinecircle_g[0]].y,0.3);
      }
      if(this.freelinecircle_g[1]!=-1){
        this.draw_circle(this.ctx,this.point[this.freelinecircle_g[1]].x,this.point[this.freelinecircle_g[1]].y,0.3);
      }
    }
  }

  draw_cursol(){
    /*cursol*/
    if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol"){
      set_line_style(this.ctx,99);
      if(this.mode[this.mode.qa].edit_mode === "symbol" && document.getElementById('panel_button').textContent === "ON" && !pu.onoff_symbolmode_list[pu.mode[this.mode.qa].symbol[0]]){
        this.ctx.strokeStyle = "#00008b";
      }
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      if (this.mode[this.mode.qa].edit_mode === "number" && (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3"||this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9")){
        this.draw_polygon(this.ctx,this.point[this.cursolS].x,this.point[this.cursolS].y,0.2,4,45);
      }else if(document.getElementById('edge_button').textContent === "ON"){
        this.draw_polygon(this.ctx,this.point[this.cursol].x,this.point[this.cursol].y,0.2,4,45);
      }else{
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[this.point[this.cursol].surround[0]].x,this.point[this.point[this.cursol].surround[0]].y);
        for(var j=1;j<this.point[this.cursol].surround.length;j++){
          this.ctx.lineTo(this.point[this.point[this.cursol].surround[j]].x,this.point[this.point[this.cursol].surround[j]].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
      }
    }/*else if(this.mode[this.mode.qa].edit_mode === "move"){//移動モードのカーソル
      set_line_style(this.ctx,99);
      this.ctx.strokeStyle = "#999999";
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      if(document.getElementById('edge_button').textContent === "ON"){
        this.draw_polygon(this.ctx,this.point[this.cursol].x,this.point[this.cursol].y,0.2,4,45);
      }else{
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[this.point[this.cursol].surround[0]].x,this.point[this.point[this.cursol].surround[0]].y);
        for(var j=1;j<this.point[this.cursol].surround.length;j++){
          this.ctx.lineTo(this.point[this.point[this.cursol].surround[j]].x,this.point[this.point[this.cursol].surround[j]].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
      }
      if(this.last != -1){
        set_line_style(this.ctx,99);
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        if(document.getElementById('edge_button').textContent === "ON"){
          this.draw_polygon(this.ctx,this.point[this.last].x,this.point[this.last].y,0.2,4,45);
        }else{
          this.ctx.beginPath();
          this.ctx.moveTo(this.point[this.point[this.last].surround[0]].x,this.point[this.point[this.last].surround[0]].y);
          for(var j=1;j<this.point[this.last].surround.length;j++){
            this.ctx.lineTo(this.point[this.point[this.last].surround[j]].x,this.point[this.point[this.last].surround[j]].y);
          }
          this.ctx.closePath();
          this.ctx.stroke();
          this.ctx.fill();
        }
      }
    }*/
  }
}
