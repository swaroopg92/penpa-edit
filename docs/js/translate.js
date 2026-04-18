function trans_text(button_text, label_text, placeholder) {
    if (UserSettings.app_language === "EN") {
        var a = 1;
    } else if (UserSettings.app_language === "ZH") {
        var a = 2;
    } else{
        var a = 0;
    }
    for (var i in button_text) {
        let element = document.getElementById(i);
        if (element) {
            element.innerHTML = button_text[i][a];
            element.value = button_text[i][a];
        } else {
            console.warn(`Could not find element #${i}`);
        }
    }

    for (var i in label_text) {
        if (document.getElementById(i)) {
            document.getElementById(i).innerHTML = label_text[i][a];
        } else {
            console.warn(`Could not find element #${i}`);
        }
    }

    PenpaText._innerText.forEach(el => document.getElementById(el).textContent = PenpaText.get(el));
    PenpaText._placeholder.forEach(el => document.getElementById(el).placeholder = PenpaText.get(el));
    document.querySelectorAll('.lb_generic_yes').forEach(el => el.textContent = PenpaText.get('yes'));
    document.querySelectorAll('.lb_generic_no').forEach(el => el.textContent = PenpaText.get('no'));
    document.querySelectorAll('.lb_generic_on').forEach(el => el.textContent = PenpaText.get('on'));
    document.querySelectorAll('.lb_generic_off').forEach(el => el.textContent = PenpaText.get('off'));

    for (var i in placeholder) {
        if (document.getElementById(i)) {
            document.getElementById(i).placeholder = placeholder[i][a];
        } else {
            console.warn(`Could not find element #${i}`);
        }
    }

    for (var i in placeholder) {
        if (document.getElementById(i)) {
            document.getElementById(i).placeholder = placeholder[i][a];
        } else {
            console.warn(`Could not find element #${i}`);
        }
    }

    if (pu.replay_mode) {
        document.getElementById("title").innerHTML = PenpaText.get('replay_mode');
        document.getElementById("tb_delete").innerHTML = ["解答消去", "Delete", "清除盘面"][a];
    } else if (pu.mmode === "solve") {
        document.getElementById("title").innerHTML = PenpaText.get('solver_mode');
        document.getElementById("tb_delete").innerHTML = ["解答消去", "Delete", "清除盘面"][a];
    } else {
        document.getElementById("title").innerHTML = PenpaText.get('setter_mode');
        document.getElementById("tb_delete").innerHTML = ["問題・解答消去", "Delete", "清除盘面"][a];
    }

    PenpaUI.initPenpaLite();
}

function trans() {

    var button_text = {
        "newboard": ["新規 / 更新", "New Grid / Update", "新建 / 更新"],
        "rotation": ["変身", "Transform", "盘面更改"],
        "newsize": ["サイズ変更", "Resize", "尺寸更改"],
        "saveimage": ["画像保存", "Screenshot", "截图"],
        "savetext": ["出力", "Share", "分享"],
        "duplicate": ["複製", "Clone", "复制"],
        "edit_bg_image": ["背景を編集", "Edit Background", "编辑背景"],
        "input_sudoku": ["数独入出力", "I/O Sudoku", "数独导入/导出"],
        "input_url": ["入力", "Load", "加载"],
        "tb_undo": ["戻", "Undo", "撤销"],
        "tb_redo": ["進", "Redo", "重做"],
        "tb_reset": ["選択消去", "Erase selected mode", "清除所选模式"],
        "eraseselect_text": ["現在選択中のモードの記号を消去", "Erase elements that belongs to the selected mode", "清除当前所选类别的所有元素"],
        "erase_text": ["問題／解答盤面を消去", "Erase problem or solution grid", "清除谜题或解答盘面"],
        "closeBtn_nb1": ["作成", "New grid", "新建盘面"],
        "closeBtn_nb2": ["枠変更", "Change grid", "更新盘面"],
        "closeBtn_nb3": ["キャンセル", "Cancel", "取消"],
        "closeBtn_size1": ["枠変更", "Change grid", "更新盘面"],
        "closeBtn_size2": ["キャンセル", "Cancel", "取消"],
        "closeBtn_image1": ["別ウィンドウ", "Open in new window", "在新窗口打开"],
        "closeBtn_image2": ["ダウンロード", "Download", "下载"],
        "closeBtn_image3": ["キャンセル", "Cancel", "取消"],
        "rt_center": ["盤面を中央に移動", "Move board to center", "将盘面移动到窗口中心"],
        "rt_size": ["画面サイズを盤面に合わせる", "Fit window to board", "将窗口缩放到盘面大小"],
        "rt_reset": ["移動をリセット", "Reset", "重置"],
        "closeBtn_rotate1": ["閉じる", "Close", "关闭"],
        "address_edit": ["編集URL", "URL for editing", "编辑模式链接"],
        "address_solve": ["出題用URL", "URL for solving", "解答模式链接"],
        "address_comp": ["コンテスト用URL", "Contest-Mode URL", "竞赛模式链接"],
        "expansion": ["拡張出力", "URL with Answer Check / Advanced Options", "答案检测链接/高级设置"],
        "closeBtn_save1": ["コピー", "Copy", "复制"],
        "closeBtn_save2": ["ダウンロード", "Download", "下载"],
        "closeBtn_save3": ["開く", "Open", "打开"],
        "closeBtn_save4": ["キャンセル", "Cancel", "取消"],
        "solution_open": ["解答判定", "Answer descision", "答案判断"],
        "closeBtn_save5": ["解答判定付き出題用アドレスを出力", "Generate URL with answer check", "生成带答案检测的链接"],
        "closeBtn_save6": ["短縮", "Shorten", "生成短链"],
        "pp_file": ["pp_fileを出力", "pp_file output", "输出 pp_file"],
        "load_url": ["URLを入力", "Load URL", "加载链接"],
        "puzzlerules": ["ルールを表示", "Show rules", "显示规则"],
        "closeBtn_input1": ["挿入", "Insert", "插入"],
        "closeBtn_input2": ["消去", "Clear", "清除"]
    }
    var label_text = {
        "edit_txt": ["編集：", "Edit:", "模式"],
        "pu_q_label": ["問題", "Problem", "谜题"],
        "pu_a_label": ["解答", "Solution", "解答"],
        "edge_button0": ["辺入力：", "Draw on Edges:", "沿格线放置："],
        "visibility_button0": ["解答表示：", "Visibility:", "查看解答盘面："],
        "mode_txt": ["モード：", "Mode:", "类别"],
        "mo_surface_lb": ["黒マス", "Surface", "涂色"],
        "mo_multicolor_lb": ["マルチカラー", "Multicolor", "多色"],
        "mo_line_lb": ["線", "Line", "线"],
        "mo_lineE_lb": ["辺", "Edge", "边"],
        "mo_wall_lb": ["壁", "Wall", "墙"],
        "mo_board_lb": ["マス", "Box", "格子"],
        "mo_move_lb": ["移動", "Move", "移动"],
        "mode_txt_space": ["　　　　", "　　　", "　　　　"],
        "mo_number_lb": ["数字", "Number", "数字"],
        "mo_symbol_lb": ["記号", "Shape", "形状"],
        "mo_special_lb": ["特殊", "Special", "特殊"],
        "mo_cage_lb": ["枠", "Cage", "笼框"],
        "mo_sudoku_lb": ["数独", "Sudoku", "数独"],
        "mo_combi_lb": ["複合", "Composite", "复合"],
        "sub_txt": ["サブ：", "Sub:", "选项"],
        "sub_line1_lb": ["通常", "Normal", "常规"],
        "sub_line2_lb": ["対角線", "Diagonal", "对角线"],
        "sub_line3_lb": ["自由線", "Free", "自由绘制"],
        "sub_line5_lb": ["中線", "Middle", "中心线"],
        "sub_line4_lb": ["補助×", "Helper_×", "×标记"],
        "sub_lineE1_lb": ["通常", "Normal", "常规"],
        "sub_lineE2_lb": ["対角線", "Diagonal", "对角线"],
        "sub_lineE3_lb": ["自由線", "Free", "自由绘制"],
        "sub_lineE4_lb": ["補助×", "Helper_×", "×标记"],
        "sub_lineE5_lb": ["枠消", "Erase", "清除"],
        "sub_number1_lb": ["通常", "Normal", "常规"],
        "sub_number2_lb": ["矢印", "Arrow", "箭头"],
        "sub_number9_lb": ["", "", ""],
        "sub_number10_lb": ["大", "L", "大"],
        "sub_number6_lb": ["中", "M", "中"],
        "sub_number5_lb": ["小", "S", "小"],
        "sub_number8_lb": ["長文", "Long", "长文"],
        "sub_number7_lb": ["候補", "Candidates", "候选数"],
        "sub_cage2_lb": ["自由", "Free", "自由"],
        "sub_sudoku1_lb": ["通常", "Normal", "常规"],
        "sub_sudoku2_lb": ["角", "Corner", "角落"],
        "sub_sudoku3_lb": ["中央", "Centre", "中央"],
        "ms1": ["図形", "Shape", "图形"],
        // "ms1_circle": ["円", "&#x26AB; &#x26AA; &#x25CF; &#x25CB;", "圆形"],
        // "ms1_square": ["正方形", "&#x2B1B; &#x2B1C; &#x25FC; &#x25FB;", "正方形"],
        // "ms1_triup": ["上三角", "&#x25B2; &#x25B3; &#x25B4; &#x25B5;", "上正三角形"],
        // "ms1_tridown": ["下三角", "&#x25BC; &#x25BD; &#x25BE; &#x25BF;", "下正三角形"],
        // "ms1_triright": ["右三角", "&#9655; &#11208; &#9657; &#9656;", "右正三角形"],
        // "ms1_trileft": ["左三角", "&#9665; &#11207; &#9667; &#9666;", "左正三角形"],
        // "ms1_diamond": ["ダイヤ", "&#x2B25; &#x2B26; &#x25C6; &#x25C7;", "菱形"],
        "ms1_hexpoint": ["六角１", "Hexagon point", "竖直正六边形"],
        "ms1_hexflat": ["六角２", "Hexagon flat", "水平正六边形"],
        "ms_ox_B": ["黒", "Black", "黑"],
        "ms_ox_E": ["緑", "Green", "绿"],
        "ms_ox_G": ["灰", "Gray", "灰"],
        "ms_cross": ["十字", "Cross", "十字线"],
        "ms_line": ["線", "Line", "常用线"],
        "ms_frameline": ["斜線", "Cage Lines", "斜线"],
        "ms1_bars": ["バー", "Bars &#x25AE; &#x25AF;", "条线"],
        "ms_bars_B": ["黒", "Black", "黑"],
        "ms_bars_G": ["灰", "Gray", "灰"],
        "ms_bars_W": ["白", "White", "白"],
        // "ms_tri": ["直角三角形", "Corner triangle", "直角三角形"],
        "ms2": ["数字", "Number", "数字"],
        "ms3_math": ["無限・計算", "Math", "数学"],
        "ms_math": ["黒", "Black", "黑"],
        "ms_math_G": ["緑", "Green", "绿"],
        // "ms_inequality": ["不等号", "Inequality", "不等号"],
        "ms_degital_B": ["黒", "Black", "黑"],
        "ms_degital_E": ["緑", "Green", "绿"],
        "ms_degital_G": ["灰", "Gray", "灰"],
        "ms_degital_f": ["デジタル(枠)", "Degital Frame", "数码管框"],
        "ms3": ["矢印", "Arrow", "箭头"],
        "ms3_arrow_B": ["太", "Fat", "粗箭头"],
        "ms_arrow_B_B": ["黒", "Black", "黑"],
        "ms_arrow_B_G": ["灰", "Gray", "灰"],
        "ms_arrow_B_W": ["白", "White", "白"],
        "ms3_arrow_N": ["細", "Thin", "细箭头"],
        "ms_arrow_N_B": ["黒", "Black", "黑"],
        "ms_arrow_N_G": ["灰", "Gray", "灰"],
        "ms_arrow_N_W": ["白", "White", "白"],
        "ms3_arrow_tri": ["三角形", "Triangle", "三角箭头"],
        "ms_arrow_tri_B": ["黒", "Black", "黑"],
        "ms_arrow_tri_G": ["灰", "Gray", "灰"],
        "ms_arrow_tri_W": ["白", "White", "白"],
        "ms3_arrow_fouredge": ["四辺", "4-edge", "四边箭头"],
        "ms_arrow_fouredge_B": ["黒", "Black", "黑"],
        "ms_arrow_fouredge_G": ["灰", "Gray", "灰"],
        "ms_arrow_fouredge_E": ["緑", "Green", "绿"],
        "ms_arrow_GP": ["通常", "Normal", "常规"],
        "ms_arrow_GP_C": ["丸付き", "With circle", "带圆形"],
        "ms_arrow_Short": ["短太", "Short Fat", "小粗箭头"],
        "ms_arrow_S": ["小", "Small", "小箭头"],
        "ms_arrow_cross": ["十字", "Cross", "十字箭头"],
        "ms_arrow_eight": ["八方", "8-way", "八方向箭头"],
        "ms_arrow_fourtip": ["四端", "Arrow-tips", "格线提示"],
        "ms4": ["固有1", "Special1", "特殊1"],
        "ms4_battleship": ["バトルシップ", "Battleship", "战舰"],
        "ms_battleship_B": ["黒", "Black", "黑"],
        "ms_battleship_G": ["灰", "Gray", "灰"],
        "ms_battleship_W": ["白", "White", "白"],
        "ms_battleship_B+": ["追加黒", "Curvy Black", "扩展黑"],
        "ms_battleship_G+": ["追加灰", "Curvy Gray", "扩展灰"],
        "ms_battleship_W+": ["追加白", "Curvy White", "扩展白"],
        "ms_kakuro": ["カックロ", "Kakuro", "数和"],
        "ms_compass": ["コンパス", "Compass", "指南针"],
        "ms_sudokuetc": ["数独特殊記号", "Sudoku variants", "数独变体"],
        "ms_polyomino": ["ポリオミノ", "Polyominoes", "小方形"],
        "ms5": ["固有2", "Special2", "特殊2"],
        "ms_angleloop": ["鋭直鈍ループ", "Angle loop", "角度回路"],
        "ms_firefly": ["ホタルビーム", "Fireflies", "萤火虫"],
        "ms_pencils": ["ペンシルズ", "Pencils", "铅笔"],
        "ms_arc": ["円弧", "Arc", "圆弧"],
        "sub_specialthermo_lb": ["サーモ", "Thermo", "温度计"],
        "sub_specialnobulbthermo_lb": ["サーモ（球なし）", "No Bulb Thermo", "无泡温度计"],
        "sub_specialarrows_lb": ["アロー", "Arrow", "箭头"],
        "sub_specialdirection_lb": ["矢印", "Move", "移动箭头"],
        "sub_specialsquareframe_lb": ["四角枠", "Rec.frame", "矩形选区"],
        "sub_specialpolygon_lb": ["多角形", "Polygon", "多边形"],
        "sub_move1_lb": ["全", "All", "全部"],
        "sub_move2_lb": ["数字", "Number", "数字"],
        "sub_move3_lb": ["記号", "Shapes", "形状"],
        "subc1": ["塗り", "Paint", "涂黑类"],
        "combisub_blpo": ["黒・点", "Black/Dot", "涂黑/留白"],
        "combisub_blwh": ["白丸黒丸", "Ying-Yang", "阴阳圆圈"],
        "combisub_shaka": ["シャカシャカ", "Shakashaka", "摇啊摇"],
        "subc2": ["ループ", "Loop", "回路"],
        "combisub_linex": ["線・×", "Line ×", "线、×标记"],
        "combisub_lineox": ["線・OX", "Line OX", "线、OX标记"],
        "combisub_edgexoi": ["辺・x・内外", "Edge IO", "边、内外"],
        "combisub_yajilin": ["ヤジリン", "Yajilin", "仙人指路"],
        "combisub_hashi": ["橋をかけろ", "Hashi", "数桥"],
        "subc3": ["領域", "Area", "分区"],
        "combisub_edgesub": ["辺・補助線", "Edge/Aux Line", "边、辅助线"],
        "subc4": ["物体", "Object", "置物"],
        "combisub_battleship": ["バトルシップ", "Battleship", "战舰"],
        "combisub_star": ["スターバトル", "Star Battle", "星战"],
        "combisub_tents": ["テント", "Tents", "帐篷"],
        "combisub_magnets": ["マグネット", "Magnets", "磁铁"],
        "combisub_arrowS": ["矢印フリック", "Arrow flick", "箭头滑动输入"],
        "subc5": ["数字埋", "Number", "填数"],
        "combisub_numfl": ["数字フリック", "Number flick", "数字滑动输入"],
        "combisub_alfl": ["英字フリック", "Alphabet flick", "字母滑动输入"],
        "style_txt": ["スタイル", "Style:", "样式"],
        "st_surface1_lb": ["濃灰", "DG", "深灰"],
        "st_surface8_lb": ["隠灰", "GR", "浅灰"],
        "st_surface3_lb": ["薄灰", "LG", "亮灰"],
        "st_surface4_lb": ["黒", "BL", "黑"],
        "st_surface2_lb": ["緑", "GR", "绿"],
        "st_surface5_lb": ["水", "BL", "蓝"],
        "st_surface6_lb": ["赤", "RE", "红"],
        "st_surface7_lb": ["黄", "YE", "黄"],
        "st_surface9_lb": ["桃", "PI", "粉"],
        "st_surface10_lb": ["橙", "OR", "橙"],
        "st_surface11_lb": ["紫", "PU", "紫"],
        "st_surface12_lb": ["茶", "BR", "棕"],
        "st_line3_lb": ["緑", "G", "绿"],
        "st_line80_lb": ["細", "Thin", "细线"],
        "st_line2_lb": ["太", "B", "黑"],
        "st_line12_lb": ["点", "Dotted", "虚线"],
        "st_line13_lb": ["太点", "Fat Dots", "粗虚线"],
        "st_line5_lb": ["灰", "G", "灰"],
        "st_line8_lb": ["赤", "R", "红"],
        "st_line9_lb": ["青", "B", "青"],
        "st_line40_lb": ["短", "Short", "短线"],
        "st_line30_lb": ["二重", "Double", "双线"],
        "st_lineE3_lb": ["緑", "G", "绿"],
        "st_lineE80_lb": ["細", "Thin", "细线"],
        "st_lineE2_lb": ["太", "B", "黑"],
        "st_lineE12_lb": ["点", "Dotted", "虚线"],
        "st_lineE13_lb": ["太点", "Fat Dots", "粗虚线"],
        "st_lineE5_lb": ["灰", "G", "灰"],
        "st_lineE8_lb": ["赤", "R", "红"],
        "st_lineE9_lb": ["青", "B", "青"],
        "st_lineE21_lb": ["極太", "Thicker", "粗线"],
        "st_lineE30_lb": ["二重", "Double", "双线"],
        "st_wall3_lb": ["緑", "G", "绿"],
        "st_wall1_lb": ["細", "Thin", "细线"],
        "st_wall2_lb": ["太", "B", "黑"],
        "st_wall12_lb": ["点", "Dotted", "虚线"],
        "st_wall17_lb": ["太点", "Fat Dots", "粗虚线"],
        "st_wall14_lb": ["灰点", "Gray Dot", "灰虚线"],
        "st_wall5_lb": ["灰", "G", "灰"],
        "st_wall8_lb": ["赤", "R", "红"],
        "st_wall9_lb": ["青", "B", "青"],
        "st_number1_lb": ["黒", "B", "黑"],
        "st_number2_lb": ["緑", "G", "绿"],
        "st_number8_lb": ["水", "B", "蓝"],
        "st_number3_lb": ["灰", "G", "灰"],
        "st_number9_lb": ["青", "B", "青"],
        "st_number10_lb": ["赤", "R", "红"],
        "st_number4_lb": ["白", "White", "白"],
        "st_number5_lb": ["白背景", "WhiteBG", "白背景"],
        "st_sudoku1_lb": ["黒", "B", "黑"],
        "st_sudoku2_lb": ["緑", "G", "绿"],
        "st_sudoku8_lb": ["水", "B", "蓝"],
        "st_sudoku3_lb": ["灰", "G", "灰"],
        "st_sudoku9_lb": ["青", "B", "青"],
        "st_sudoku10_lb": ["赤", "R", "红"],
        "st_symbol1_lb": ["線-奥", "Behind lines", "显示在线后"],
        "st_symbol2_lb": ["線-前", "In front of lines", "显示在线前"],
        "panel_buttons0": ["選択中：", "Selection:", "当前选择："],
        "panel_buttonc0": ["選択中：", "Selection:", "当前选择："],
        "st_cage10_lb": ["点線", "Dot", "虚线"],
        "st_cage7_lb": ["灰線", "Gray", "灰线"],
        "st_cage15_lb": ["灰点", "GrayDot", "灰虚线"],
        "st_cage16_lb": ["実線", "Black", "黑线"],
        "sw_start": ["スタート", "Start", "开始"],
        "sw_pause": ["ポーズ", "Pause", "暂停"],
        "sw_stop": ["ストップ", "Stop", "停止"],
        "sw_reset": ["リセット", "Reset", "重置"],
        "sw_hide": ["隠す", "Hide", "隐藏"],
        "modal_lb": ["新規作成", "New Grid", "新建盘面"],
        "nb_gridtype_lb": ["盤面：", "Board type:", "盘面类型："],
        "nb_gridtype1_lb": ["正方形", "Square", "正方形"],
        "nb_gridtype2_lb": ["正六角形", "Hexagon", "正六边形"],
        "nb_gridtype3_lb": ["正三角形", "Triangle", "正三角形"],
        "nb_gridtype4_lb": ["ピラミッド", "Pyramid", "金字塔"],
        "nb_gridtype5_lb": ["立方体", "Cube", "立方体"],
        "nb_gridtype6_lb": ["数独", "Sudoku", "数独"],
        "nb_gridtype7_lb": ["カックロ", "Kakuro", "数和"],
        "nb_size_lb": ["サイズ：", "Size:", "尺寸："],
        "name_size1": ["ヨコ：", "Columns:", "列数："],
        "name_size2": ["タテ：", "Rows:", "行数："],
        "nb_space_lb": ["余白：", "White space:", "留白："],
        "nb_display_lb": ["表示サイズ：", "Display size:", "显示大小："],
        "nb_sudoku1_lb": ["対角線 &#x27CD;", "Diagonal &#x27CD;", "主对角线 &#x27CD;"],
        "nb_sudoku4_lb": ["対角線 &#x27CB;", "Diagonal &#x27CB;", "副对角线 &#x27CB;"],
        "nb_sudoku2_lb": ["外周ヒント", "Outside clues", "外提示数"],
        "nb_sudoku3_lb": ["外周ヒント(上左)", "Outside clues (top/left)", "外提示数（左上）"],
        "nb_penrose1_lb": ["回転非対称性", "Rotational asymmetry", "旋转不对称性"],
        "nb_sudoku8_lb": ["サイズ 4x4", "Size 4x4", "四宫数独"],
        "nb_sudoku5_lb": ["サイズ 6x6", "Size 6x6", "六宫数独"],
        "nb_sudoku6_lb": ["サイズ 8x8", "Size 8x8", "八宫数独"],
        "nb_penrose2_lb": ["タイリングシード", "Tiling Seed", "填充种子"],
        "name_space1": ["上：", "Over:", "上："],
        "name_space2": ["下：", "Under:", "下："],
        "name_space3": ["左：", "Left:", "左："],
        "name_space4": ["右：", "Right:", "右："],
        "nb_note": ["枠変更では以下の値のみ更新されます", "Only bellow will be updated when you change grid.", "更新盘面时只有以下选项生效"],
        "nb_grid_lb": ["グリッド：", "Grid:", "格线："],
        "nb_grid1_lb": ["実線", "Solid", "实线"],
        "nb_grid2_lb": ["点線", "Dotted", "虚线"],
        "nb_grid3_lb": ["なし", "None", "无"],
        "nb_lat_lb": ["　格子点：", "Gridpoints:", "格点："],
        "nb_lat1_lb": ["あり", "Yes", "有"],
        "nb_lat2_lb": ["なし", "No", "无"],
        "nb_out_lb": ["　　外枠：", "Outside frame:", "外框"],
        "nb_out1_lb": ["あり", "Yes", "有"],
        "nb_out2_lb": ["なし", "No", "无"],
        "modal-newsize_lb": ["　サイズ変更", "Change Size", "更改大小"],
        "modal-newsize_size_lb": ["表示サイズ：", "Display size:", "显示大小："],
        "saveimagetitle": ["画像保存", "Save screenshot", "保存截图"],
        "nb_margin_lb": ["　余白：", "White border:", "留白："],
        "nb_margin1_lb": ["あり", "Yes", "有"],
        "nb_margin2_lb": ["なし", "No", "无"],
        "nb_quality_lb": ["　画質：", "Image quality:", "画质："],
        "nb_quality1_lb": ["高", "High", "高"],
        "nb_quality2_lb": ["低", "Low", "低"],
        "nb_type_lb": ["拡張子：", "File type:", "格式："],
        "savetexttitle": ["回転・移動・追加・削除", "Rotate / Move / Add / Remove", "旋转/移动/增加/减少"],
        "rt1_lb": ["　回転：", "Rotate:", "旋转："],
        "rt2_lb": ["　反転：", "Flip:", "翻转："],
        "rt3_lb": ["　移動：", "Move:", "移动："],
        "rt4_lb": ["行・列の追加・削除", "Add/Remove Rows/Columns:", "增加/减少行列"],
        "rt5_lb": ["正方形盤面でのみ動作。履歴は削除されます。", "*Works only in Square Board Type, it also resets undo/redo. Answer checking if enabled, will only work with original grid size.", "仅在正方形盘面生效，同时会重置历史操作。答案检测仅在原始盘面尺寸生效。"],
        "rt6_lb": ["現在の盤面", "Existing Grid", "当前盘面"],
        "rt6_lb_r": ["現在の盤面", "Existing Grid", "当前盘面"],
        "savetitle": ["パズル出力", "Share Puzzle", "分享谜题"],
        "saveinfo_lb": ["パズルインフォメーション", "Puzzle Information", "谜题信息"],
        "save1_lb": ["タイトル：", "Title:", "标题："],
        "save2_lb": ["作者：", "Author:", "作者："],
        "save3_lb": ["ルール：", "Rules:", "规则："],
        "source_lb": ["ソース：", "Source:", "原链接："],
        "sourcewarning": ["自身が作者でない場合はソースを記入してください", "* If you are not the author of the puzzle, please specify the source URL", "如果你不是该谜题的作者，请在此输入原链接"],
        "generate_lb": ["URL出力", "Generate URL", "生成链接"],
        "save_undo_lb": ["履歴の保存", "Save Undo/Redo (History)", "保存历史操作"],
        "auto_shorten_chk_lb": ["TinyURLでURLを短縮", "Automatically Shorten with TinyURL", "自动使用TinyURL缩短链接"],
        "filename_lb": ["ファイル名：", "File name:", "文件名："],
        "extend_lb": ["拡張出力", "Extended Output", "输出扩展"],
        "save3texttitle": ["以下の記号を判定：", "Solution will check only following:", "答案检测仅检测以下内容："],
        // "answerwarning": ["チェックがない場合全てを判定。一部の記号のみ判定したい場合ANDかORの列を選択してください。ANDが優先されます。", "*Default (none selected) it checks for all. Choose either AND or OR column, if both are selected, AND will be given preference."],
        "sol_surface_lb": ["黒マス：濃灰・隠灰・薄灰・黒", "Shading - DG (Dark Grey), GR, LG, BL (Black):", "涂黑：深灰/浅灰/亮灰/黑色"],
        "sol_number_lb": ["数字：通常・大・中・小：緑・青・赤<br>数独：通常・中央：緑・青・赤", "Number - Normal, L, M, S - Green, Blue, Red <br> Sudoku - Normal, Centre - Green, Blue, Red:", "数字：大/中/小、红/绿/蓝<br>数独：大/中/小、红/绿/蓝"],
        "sol_loopline_lb": ["線：緑・二重", "Line - Green, Double:", "线：绿、单双"],
        "sol_ignoreloopline_lb": ["線：問題と重なった線を無視", "Line - Ignore Given Line Segments:", "线：无视已给出"],
        "sol_loopedge_lb": ["辺：緑・二重", "Edge - Green, Double:", "边：绿、单双"],
        "sol_ignoreborder_lb": ["辺：問題・外枠と重なった線を無視", "Edge - Ignore Edges on Grid Border / Givens:", "边：无视已给出/盘面边界"],
        "sol_wall_lb": ["壁：緑", "Wall - Green:", "墙：绿"],
        "sol_square_lb": ["記号-図形-正方形-XL-2", "Shape - Shape - Square - XL size - Option 2:", "形状：图形-正方形-XL-2"],
        "sol_circle_lb": ["記号-図形-円-M-1,2", "Shape - Shape - Circle - M size - Options 1 & 2:", "形状：图形-圆形-M-1,2"],
        "sol_tri_lb": ["記号-図形-直角三角形-1,2,3,4", "Shape - Shape - Corner triangle - Options 1 to 4:", "形状：图形-直角三角形-1,2,3,4"],
        "sol_arrow_lb": ["記号-矢印-小-1~8", "Shape - Arrow - Small - Options 1 to 8:", "形状：箭头-小箭头"],
        "sol_math_lb": ["記号-数字-無限・計算-黒・緑-2,3(+-)", "Shape - Number - Math - Black, Green - Options 2 & 3:", "形状：数字-数学-黑/绿-2,3(+-)"],
        "sol_battleship_lb": ["記号-固有1-バトルシップ-黒-1~6<br>追加黒-1~4", "Shape - Special 1 - Battleship - Black - Options 1 to 6 <br> and Curvy Black - Options 1 to 4:", "形状：特殊1-战舰-黑、追加黑"],
        "sol_tent_lb": ["記号-固有1-テント-2", "Shape - Special 1 - Tent - Option 2:", "形状：特殊1-帐篷-2"],
        "sol_star_lb": ["記号-固有1-スター-1,2,3", "Shape - Special 1 - Star - Options 1 to 3:", "形状：特殊1-星-1,2,3"],
        "sol_akari_lb": ["記号-固有2-美術館-3", "Shape - Special 2 - Lightbulb - Option 3:", "形状：特殊2-灯泡-3"],
        "sol_mine_lb": ["記号-固有2-マインスイーパー-4,5", "Shape - Special 2 - Minesweeper - Option 4 & 5:", "形状：特殊2-扫雷-4,5"],
        "save5texttitle": ["ヘッダー", "header", "头文件"],
        "custom_lb": ["カスタムメッセージ", "Custom Message", "自定义信息"],
        "save6texttitle": ["URL入力", "Load URL", "载入链接"],
        "quick_panel_toggle_label": ["パネル：", "Panel:", "浮窗面板："],
        "bg_image_url_lb": ["画像URL：", "Image URL:", "图像链接："],
        "bg_image_x_lb": ["X位置：", "X position:", "X偏移："],
        "bg_image_y_lb": ["Y位置：", "Y position:", "Y偏移："],
        "bg_image_width_lb": ["幅：", "Width:", "宽度："],
        "bg_image_height_lb": ["高さ：", "Height:", "高度："],
        "bg_image_opacity_lb": ["不透明度：", "Opacity:", "不透明度："],
        "bg_image_foreground_lb": ["前景に描画：", "Draw in foreground:", "在前景显示："],
        "bg_image_mask_white_lb": ["画像から白をマスク：", "Mask out white from image:", "自动遮罩图像白色："],
        "bg_image_threshold_lb": ["白マスクのしきい値：", "White mask threshold:", "白色遮罩阈值："]
    }

    var placeholder = {
        "saveinfotitle": ["例：サーモ数独、ヤジリン", "e.g. Thermo Sudoku or Yajilin", "例：温度计数独 或 仙人指路"],
        "saveinfoauthor": ["作者名", "Puzzle creator name", "作者名"],
        "saveinforules": ["例：クラシック数独のルール", "e.g. Classic sudoku rules.", "例：标准数独规则"],
        "custom_message": ["正解時に出るカスタムメッセージ", "Custom Congratulation Message on answer check pop up", "答案检测正确时庆祝弹窗内容："],
    }
    trans_text(button_text, label_text, placeholder);
}

const PenpaText = {
    get(key, variable) {
        const entry = this.dictionary[key] || {};
        let returnText = entry[UserSettings.app_language] || entry.EN || '';

        if (!variable) { return returnText; }

        return returnText.replace('$v', variable);
    },
    _innerText: [
        'constraints',
        'page_help',
        'nb_gridtype8_lb',
        'nb_gridtype9_lb',
        'nb_gridtype10_lb',
        'nb_gridtype11_lb',
        'nb_gridtype12_lb',
        'nb_gridtype13_lb',
        'nb_gridtype14_lb',
        'nb_rules_lb',
        'nb_title_lb',
        'settings_modal_header',
        'lb_settings_app_display',
        'lb_settings_display_theme',
        'lb_settings_display_theme_light',
        'lb_settings_display_theme_dark',
        'lb_settings_display_layout',
        'lb_settings_display_layout_classic',
        'lb_settings_display_layout_flex_left',
        'lb_settings_display_layout_flex_right',
        'lb_settings_display_layout_streaming1',
        'lb_settings_timer',
        'lb_settings_timer_show',
        'lb_settings_timer_hide',
        'lb_settings_puzzle_display',
        'lb_settings_sudoku_marks',
        'lb_settings_sudoku_marks_dynamic',
        'lb_settings_sudoku_marks_large',
        'lb_settings_sudoku_marks_small',
        'lb_settings_sudoku_normal',
        'lb_settings_sudoku_normal_centered',
        'lb_settings_sudoku_normal_bottom',
        'lb_settings_starbattle_dots',
        'lb_settings_starbattle_dots_high_range',
        'lb_settings_starbattle_dots_low_range',
        'lb_settings_starbattle_dots_disable',
        'lb_settings_surface_second',
        'lb_settings_surface_second_dark',
        'lb_settings_surface_second_grey',
        'lb_settings_surface_second_light',
        'lb_settings_surface_second_black',
        'lb_settings_surface_second_green',
        'lb_settings_surface_second_blue',
        'lb_settings_surface_second_red',
        'lb_settings_surface_second_yellow',
        'lb_settings_surface_second_pink',
        'lb_settings_surface_second_orange',
        'lb_settings_surface_second_purple',
        'lb_settings_surface_second_brown',
        'lb_settings_tools',
        'lb_settings_custom_colors',
        'lb_settings_floating_panel',
        'lb_settings_quick_panel',
        'lb_settings_export',
        'lb_settings_auto_shorten',
        'lb_settings_input_options',
        'lb_settings_mouse_middle',
        'lb_settings_reload',
        'lb_settings_conflict',
        'lb_settings_conflict_off_this',
        'lb_settings_conflict_off_all',
        'lb_settings_sudoku_keys',
        'lb_settings_storage',
        'lb_settings_saved_settings',
        'clear_settings',
        'lb_settings_local_storage',
        'clear_storage_one',
        'clear_storage_all',
        'local_storage_browser_message'
    ],
    _placeholder: [
        'saveimagename',
        'iostring',
        'urlstring'
    ],
    dictionary: {
        // Modes
        contest_mode: { EN: 'Contest Mode', JP: 'コンテストモード', ZH: '竞赛模式' },
        replay_mode: { EN: 'Replay Mode', JP: 'リプレイモード', ZH: '回放模式' },
        setter_mode: { EN: 'Setter Mode', JP: '編集モード', ZH: '编辑模式' },
        setter_mode_while_solving: { EN: 'Setter Mode (while Solving)', JP: '編集モード（解答中）', ZH: '编辑模式（解答中）' },
        solver_mode: { EN: 'Solver Mode', JP: '解答モード', ZH: '解答模式' },
        solver_mode_answer: { EN: 'Solver Mode (Answer Checking Enabled)', JP: '解答モード（正解判定あり）', ZH: '解答模式（含答案检测）' },

        // Grid Setup
        columns: { JP: "ヨコ：", EN: "Columns:", ZH: '列：' },
        rows: { JP: "タテ：", EN: "Rows:", ZH: '行' },
        side: { EN: "Side:", JP: '幅：', ZH: '尺寸' },
        sides: { EN: "Sides:", JP: '横：' },
        over: { EN: "Over:", JP: '上：' },
        border: { EN: "Border:", JP: '境界：' },
        order: { EN: "Order:", ZH: '阶数' },

        nb_gridtype8_lb: { EN: 'Tetrakis square' },
        nb_gridtype9_lb: { EN: 'Truncated square' },
        nb_gridtype10_lb: { EN: 'Snub square' },
        nb_gridtype11_lb: { EN: 'Cairo pentagonal' },
        nb_gridtype12_lb: { EN: 'Rhombitrihexagonal' },
        nb_gridtype13_lb: { EN: 'Deltoidal trihexagonal' },
        nb_gridtype14_lb: { EN: 'Penrose P3' },

        // Generic Terms
        on: { EN: "ON", ZH: '开' },
        off: { EN: "OFF", ZH: '关' },
        yes: { EN: "Yes", ZH: '是' },
        no: { EN: "No", ZH: '否' },
        rules_generic: { EN: "Rules:", JP: 'ルール：', ZH: '规则：' },
        close: { EN: 'Close', JP: '閉じる', ZH: '关闭' },
        show: { EN: 'Show', JP: '表示', ZH: '显示' },
        hide: { EN: 'Hide', JP: '隠す', ZH: '隐藏' },
        ok: { EN: 'OK', ZH: '确认' },

        // Export Image
        nb_rules_lb: { JP: "ルール：", EN: "Rules:", ZH: '规则：' },
        nb_title_lb: { EN: "Title & Author:", JP: 'タイトルと作者：', ZH: '标题、作者：' },
        nb_title1_lb: { EN: "Yes", ZH: '有' },
        nb_title2_lb: { EN: "No", ZH: '无' },
        nb_rules1_lb: { EN: "Yes", ZH: '有' },
        nb_rules2_lb: { EN: "No", ZH: '无' },
        saveimagename: { EN: 'sample_name', ZH: '未命名' },

        // Main UI
        page_help: { EN: 'Help', JP: 'ヘルプ', ZH: '帮助' },
        constraints: { EN: 'Constraints (Beta)', JP: '専用モード', ZH: '专用模式' },

        disable_penpa_lite: {
            JP: 'Penpa Liteを無効化',
            EN: 'Disable Penpa Lite',
            ZH: '关闭类别筛选'
        },
        enable_penpa_lite: {
            JP: 'Penpa Liteを有効化',
            EN: 'Enable Penpa Lite', 
            ZH: '开启类别筛选'
        },

        search_area: { EN: 'Search Area', JP: '検索範囲', ZH: '搜索范围' },
        live_replay_na: { EN: 'Live Replay N/A', JP: '解答履歴(Live Replay) N/A', ZH: '实时回放不适用' },
        live_replay: { EN: 'Live Replay', JP: '解答履歴(Live Replay)', ZH: '实时回放' },
        solve_path: { EN: 'Solve Path', JP: '想定解法(Solve Path)', ZH: '解题步骤' },

        feedback_modal: {
            EN: 'Any suggestions or improvements, send an email to <b> penpaplus@gmail.com </b> <br> or <br> Create an issue on github <a href="https://github.com/swaroopg92/penpa-edit/issues" target="_blank">here</a> <br> or <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">here</a>.',
            JP: '修正やご提案は以下からご連絡ください。 <b> penpaplus@gmail.com </b> <br> / <br> Create an issue on github <a href=https://github.com/swaroopg92/penpa-edit/issues" target="_blank">Github</a> <br> / <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">here</a>."',
            ZH: '若您有任何改进意见和建议，可以发送邮件至 <b> penpaplus@gmail.com </b> <br> 或 <br> 在 <a href=https://github.com/swaroopg92/penpa-edit/issues" target="_blank">Github</a> 上创建issue <br> 或 <br> 在 <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">Discord 服务器</a> 的 #penpa-plus 频道进行讨论。'
        },

        contest_answer: {
            EN: '*Note the Solution Code, go back to <a href="$v" target="_blank">Source</a> and enter in the Submissions Box*',
            JP: 'アンサーキーの入力は、<a href=$v" target="_blank">Source</a> に戻り、Submissions Boxから行ってください*"',
            ZH: '*回到<a href="$v" target="_blank">原地址</a>并在提交框输入答案提交码*'
        },

        answer_check_empty: {
            EN: 'No specific option selected by Author. Answer check looks for all the elements with appropriate accepted colors. Check <a href="https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">this</a> for reference.',
            JP: 'この問題には解答チェックのオプションが選択されていません。解答チェックをするためには、配置する物体の種類や色が全て正しい必要があります。 <a href=https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">こちら</a> もご参照ください。"',
            ZH: '作者未设置答案检测选项，答案检测将匹配所有可接受的对应颜色元素。详情请参考<a href=https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">此处</a>。'
        },

        puzzlink_row_column: {
            EN: 'Penpa+ does not support grid size greater than $v rows or columns',
            JP: 'Penpa+は $v 行を超えるサイズに対応していません。',
            ZH: 'Penpa+ 不支持大于 $v 行/列的盘面尺寸。'
        },
        puzzlink_not_supported: {
            EN: 'It currently does not support puzzle type: $v',
            JP: 'パズル種 $v には現在対応していません。',
            ZH: '谜题类型 $v 目前暂不支持。'
        },

        // Settings
        settings_modal_header: { EN: 'General Settings', JP: '一般設定', ZH: '常规设置' },
        lb_settings_app_display: { EN: 'App Display', JP: '画面表示', ZH: '画面显示' },
        lb_settings_display_theme: { EN: 'Display Theme:', JP: '明るさ', ZH: '界面主题' },
        lb_settings_display_theme_light: { EN: 'Light', JP: 'ライト', ZH: '亮色' },
        lb_settings_display_theme_dark: { EN: 'Dark', JP: 'ダーク', ZH: '暗色' },
        lb_settings_display_layout: { EN: 'Display Layout:', JP: 'レイアウト', ZH: '界面排布' },
        lb_settings_display_layout_classic: { EN: 'Classic', JP: '通常', ZH: '经典' },
        lb_settings_display_layout_flex_left: { EN: 'Flex (Tools Left)', JP: '可動（ツールバー左）', ZH: '可动（左侧工具栏）' },
        lb_settings_display_layout_flex_right: { EN: 'Flex (Tools Right)', JP: '可動（ツールバー右）', ZH: '可动（右侧工具栏）' },
        lb_settings_display_layout_streaming1: { EN: 'Streaming 1 (beta)', JP: '配信（ベータ版）', ZH: '直播（测试版）' },
        lb_settings_timer: { EN: 'Timer:', JP: 'タイマー', ZH: '计时器' },
        lb_settings_timer_show: { EN: 'Show', JP: '表示', ZH: '显示' },
        lb_settings_timer_hide: { EN: 'Hide', JP: '隠す', ZH: '隐藏' },
        lb_settings_puzzle_display: { EN: 'Puzzle Display', JP: '盤面表示', ZH: '盘面显示' },
        lb_settings_sudoku_marks: { EN: 'Sudoku Pencil Marks:', JP: '[数独]補助数字', ZH: '数独辅助标记' },
        lb_settings_sudoku_marks_dynamic: { EN: 'Dynamic', JP: '縦幅可変', ZH: '动态高度' },
        lb_settings_sudoku_marks_large: { EN: 'Large', JP: '縦幅大', ZH: '较大高度' },
        lb_settings_sudoku_marks_small: { EN: 'Small', JP: '縦幅小', ZH: '较小高度' },
        lb_settings_sudoku_normal: { EN: 'Sudoku Normal:', JP: '[数独]通常', ZH: '数独常规数字' },
        lb_settings_sudoku_normal_centered: { EN: 'Centered', JP: '中央', ZH: '居中' },
        lb_settings_sudoku_normal_bottom: { EN: 'Bottom', JP: '下', ZH: '靠下' },
        lb_settings_starbattle_dots: { EN: 'Star Battle Dots:', JP: 'スターバトルの点記号', ZH: '星战点记号' },
        lb_settings_starbattle_dots_high_range: { EN: 'High Range', JP: '入力しやすい', ZH: '输入范围较大' },
        lb_settings_starbattle_dots_low_range: { EN: 'Low Range', JP: '入力しにくい', ZH: '输入范围较小' },
        lb_settings_starbattle_dots_disable: { EN: 'Disable', JP: 'オフ', ZH: '关闭输入' },
        lb_settings_surface_second: { EN: 'Surface Second Color:', JP: 'マスの補助色', ZH: '涂色副选色' },
        lb_settings_surface_second_dark: { EN: 'Dark Grey', JP: '濃灰', ZH: '深灰' },
        lb_settings_surface_second_grey: { EN: 'Grey', JP: '灰', ZH: '浅灰' },
        lb_settings_surface_second_light: { EN: 'Light Grey', JP: '薄灰', ZH: '亮灰' },
        lb_settings_surface_second_black: { EN: 'Black', JP: '黒', ZH: '黑' },
        lb_settings_surface_second_green: { EN: 'Green', JP: '緑', ZH: '绿' },
        lb_settings_surface_second_blue: { EN: 'Blue', JP: '青', ZH: '蓝' },
        lb_settings_surface_second_red: { EN: 'Red', JP: '赤', ZH: '红' },
        lb_settings_surface_second_yellow: { EN: 'Yellow', JP: '黄', ZH: '黄' },
        lb_settings_surface_second_pink: { EN: 'Pink', JP: '桃', ZH: '粉' },
        lb_settings_surface_second_orange: { EN: 'Orange', JP: '橙', ZH: '橙' },
        lb_settings_surface_second_purple: { EN: 'Purple', JP: '紫', ZH: '紫' },
        lb_settings_surface_second_brown: { EN: 'Brown', JP: '茶', ZH: '棕' },
        lb_settings_tools: { EN: 'Tools', JP: '機能', ZH: '工具' },
        lb_settings_custom_colors: { EN: 'Custom Colors (Beta):', JP: '色の設定', ZH: '自定义颜色' },
        lb_settings_floating_panel: { EN: 'Floating Panel:', JP: 'パネル', ZH: '浮窗面板' },
        lb_settings_quick_panel: { EN: 'Quick Panel Button', JP: 'パネル切り替えボタン', ZH: '浮窗面板启用按钮' },
        lb_settings_export: { EN: 'Export', JP: '出力', ZH: '导出' },
        lb_settings_auto_shorten: { EN: 'Auto-Shorten Links', JP: '自動でURLを短縮する', ZH: '自动使用短链接' },
        lb_settings_input_options: { EN: 'Input Options', JP: '入力設定', ZH: '输入选项' },
        lb_settings_mouse_middle: { EN: 'Mouse Middle Button:', JP: 'マウスホイール', ZH: '鼠标中键' },
        lb_settings_reload: { EN: 'Reload Protection:', JP: 'リロード時に警告', ZH: '刷新警告' },
        lb_settings_conflict: { EN: 'Conflict Detection:', JP: '不一致の検出', ZH: '冲突检测' },
        lb_settings_conflict_off_this: { EN: 'OFF (this puzzle)', JP: 'OFF（このパズル）', ZH: '关闭（仅该谜题）' },
        lb_settings_conflict_off_all: { EN: 'OFF (all puzzles)', JP: 'OFF（全てのパズル）', ZH: '关闭（全部谜题）' },
        lb_settings_sudoku_keys: { EN: 'Sudoku Z/Y & XCV Keys:', JP: '数独のショートカットキ (Z/Y & XCV)', ZH: '数独快捷键（Z/Y & XCV）' },
        lb_settings_storage: { EN: 'Saving/Storage', JP: '保存', ZH: '存储' },
        lb_settings_saved_settings: { EN: 'Saved Settings:', JP: '保存した設定', ZH: '保存设置' },
        clear_settings: { EN: 'Clear cookies', JP: 'クッキーをクリアする', ZH: '清除缓存' },
        lb_settings_local_storage: { EN: 'Local Storage:', JP: 'ローカルストレージ', ZH: '本地存储' },
        clear_storage_one: { EN: 'Clear this puzzle', JP: 'この盤面の履歴を消去する', ZH: '清除该谜题' },
        clear_storage_all: { EN: 'Clear all', JP: '全ての履歴を消去する', ZH: '清除所有' },
        local_storage_browser_message: {
            EN: "Your browser has disabled or doesn't support local storage.",
            JP: "このブラウザはローカルストレージが無効になっているか、対応していません。",
            ZH: '您的浏览器不支持本地存储。'
        },
        local_storage_cleared: { EN: 'Local Storage is Cleared', JP: 'ローカルストレージが消去されました。', ZH: '本地存储已清除。' },
        clear_settings_message: { EN: 'You must reload the page for the default settings to take effect.', JP: '初期設定を有効にするには、ページを再読み込みしてください。', ZH: '已重置至初始设置，刷新界面以生效。' },
        display_size_max: { EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to max value.', JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 上限に設定されました。', ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最大值。' },
        display_size_min: { EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to min value.', JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 下限に設定されました。', ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最小值。' },

        copied_success: { EN: 'URL is copied to clipboard', JP: 'URLがクリップボードにコピーされました。', ZH: '已复制链接至剪贴板' },
        sudoku_size_unsupported: { EN: 'Sorry, sudoku grids of size: $v are not supported', JP: '数独サイズ: $vには対応していません。', ZH: '不支持大小为 $v 的数独盘面' },

        // Modals
        f2_title: {
            EN: 'Are you sure to switch to Editing Mode?',
            JP: '編集モードに切り替えますか？',
            ZH: '确定切换到编辑模式？'
        },
        f2_body: {
            EN: 'You have pressed F2. You can either Cancel or later press F3 to switch back to Solving Mode.',
            JP: 'F2キーが入力されました。キャンセルするかF3キーを押すことで解答モードに切り替えることができます。',
            ZH: '您摁下了F2。您可以取消本次操作或在稍后摁下F3返回解答模式。'
        },
        f2_confirm: {
            EN: 'Yes, switch',
            JP: 'はい、切り替えます。',
            ZH: '确定切换'
        },
        f3_title: {
            EN: 'Are you sure to switch to Solving Mode?',
            JP: '解答モードに切り替えますか？',
            ZH: '确定切换到解答模式？'
        },
        solution_incorrect_title: {
            EN: 'Your solution is incorrect.',
            JP: '解答が誤っています。',
            ZH: '您的解答有误'
        },
        solution_incorrect_main: {
            EN: Identity.incorrectMessage
        },

        preparing_download: { EN: "Preparing your download", JP: 'ダウンロード準備中', ZH: '下载准备中' },

        border_setting_help: { EN: 'To place clues on grid border/edges and corners:<br> Turn "Draw on Edges": ON', JP: '文字などをマスの線上や角に配置する<br> "Draw on Edges:"→"ON"', ZH: '在格子边/角上放置线索：<br>将"沿格线放置"设置为"开"' },

        display_size_warning: {
            EN: 'Display size must be in the range <h2 class="warn">12-90</h2>',
            JP: '表示サイズは以下の範囲です <h2 class="warn">12-90</h2>',
            ZH: '显示大小必须处于以下范围内 <h2 class="warn">12-90</h2>'
        },

        create_check_warning_title: {
            EN: 'Are you sure want to reset the current board? To only change display size and grid lines use "Update display" button',
            JP: '現在の盤面をリセットしますか？ 表示サイズやグリッドを変えるには、枠変更を押してください。',
            ZH: '确定要重置现有盘面吗？仅改变显示大小和格线请点击“更新盘面”按钮'
        },
        create_check_warning_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        create_check_warning_confirm: {
            EN: 'Yes, Reset it!',
            JP: 'はい、リセットします。',
            ZH: '确定重置'
        },
        reset_check_title_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Line Mode?',
            JP: '全ての補助xを消去しますか?',
            ZH: '消除线类别所有×标记？'
        },
        reset_check_title_line: {
            EN: 'Erase/Clear all LINE mode elements?',
            JP: '全ての線を消去しますか?',
            ZH: '消除线类别所有元素？'
        },
        reset_check_title_edge_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Edge Mode?',
            JP: '全ての補助xを消去しますか?',
            ZH: '消除边类别所有×标记？'
        },
        reset_check_title_edge_erased: {
            EN: 'Reset Erased Edges in Edge Mode?',
            JP: '全ての枠消を消去しますか?',
            ZH: '重置边类别所以消除？'
        },
        reset_check_title_edge: {
            EN: 'Erase/Clear all EDGE mode elements?',
            JP: '全ての辺を消去しますか?',
            ZH: '消除边类别所有元素？'
        },
        reset_check_title_shape: {
            EN: 'Erase/Clear all SHAPE mode elements?',
            JP: '全ての記号を消去しますか?',
            ZH: '消除形状类别所有元素？'
        },
        reset_check_title_frame: {
            EN: 'Erase/Clear all FRAME mode elements?',
            JP: '全ての枠を消去しますか?',
            ZH: '消除笼框类别所有元素？'
        },
        reset_check_title_generic: {
            EN: 'Erase/Clear all $v mode elements?',
            JP: '全ての$vを消去しますか？',
            ZH: '消除$v类别所有元素？'
        },
        reset_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        reset_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します',
            ZH: '确定消除'
        },
        delete_check_problem: {
            EN: 'Erase/Clear all the elements in PROBLEM mode?',
            JP: '全ての問題を消去しますか？',
            ZH: '消除谜题模式所有元素？'
        },
        delete_check_solution: {
            EN: 'Erase/Clear all the elements in SOLUTION mode?',
            JP: '全ての解答を消去しますか？',
            ZH: '消除解答模式所有元素？'
        },
        delete_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        delete_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します',
            ZH: '确定消除'
        },

        unsupported_browser_title: {
            EN: 'Unsupported Browser',
            JP: 'サポートされていないブラウザ',
            ZH: '不支持的浏览器'
        },
        unsupported_browser_main: {
            EN: 'Your browser does not appear to support the needed functionality for a file to be made.',
            JP: 'あなたのブラウザはSVGに対応していません。', // JP text needs update
            ZH: '您的浏览器不支持创建文件所需功能'
        },
        unsupported_filename: {
            EN: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename',
            JP: '<h2 class="warn">\\ / : * ? \" < > |</h2>は使用できません。',
            ZH: '文件名不能使用字符<h2 class="warn">\\ / : * ? \" < > |</h2>'
        },

        sudoku_input_minmax_error: {
            EN: 'Error: Min/Max Sudoku Size allowed is 1x1 to 9x9 (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズは1x1〜9x9です（初期設定は9x9）。入力し直してください。',
            ZH: '错误：数独盘面尺寸应在1x1~9x9之间（默认为9x9）。在下方更新参数。'
        },
        sudoku_input_size_error: {
            EN: 'Error: Grid size is smaller than the specified Sudoku size (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズが小さすぎます（初期設定は9x9）。入力し直してください。',
            ZH: '错误：盘面尺寸小于设定的数独大小（默认为9x9）。在下方更新参数。'
        },
        sudoku_input_square_error: {
            EN: 'Error: The canvas area should be a sudoku grid or square grid',
            JP: 'エラー：描画範囲は数独の盤面か正方形盤面である必要があります。',
            ZH: '错误：数独盘面应使用正方形网格'
        },

        invalid_url: {
            EN: "Error: Invalid URL",
            JP: 'エラー：不正なURLです',
            ZH: '错误：无效的链接'
        },

        nb_sudoku3_lb_square: {
            EN: '*White space is subtracted from the row/column size',
            JP: '余白はタテ・ヨコのサイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_hex: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_tri: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_pyramid: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_sudoku: {
            EN: 'Outside clues (top/left)',
            JP: '外周ヒント(上左)',
            ZH: '外提示数（左上）'
        },
        nb_sudoku7_lb_sudoku: {
            EN: '*Default size is 9x9',
            JP: '標準サイズは9x9です。',
            ZH: '默认大小为9x9'
        },

        size_warning_square: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        size_warning_kakuro: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        size_warning_generic: {
            EN: 'Side Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: '一辺の大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        order_warning_generic: {
            EN: 'Order must be in the range <h2 class="warn">3-$v</h2>',
            JP: '注文は範囲内でなければなりません <h2 class="warn">3-$v</h2>',
            ZH: '盘面阶数取值必须在<h2 class="warn">3-$v</h2>范围内'
        },
        rotational_asymmetry_warning_generic: {
            EN: 'Rotational asymmetry must be in the range <h2 class="warn">0-$v</h2> for this order',
            JP: '回転非対称性は範囲内でなければならない <h2 class="warn">0-$v</h2> この注文について',
            ZH: '旋转不对称性取值必须在<h2 class="warn">0-$v</h2>范围内'
        },

        alpha_warning: {
            EN: "**Alpha Version - It's under development and currently has limited functionality",
            JP: 'これはアルファ版です。開発は初期段階で、機能は制限されています。',
            ZH: '**Alpha版本：该内容正在开发中，目前功能有限。'
        },

        iostring: {
            EN: 'Enter digits (0-9, 0 or . for an empty cell, no spaces). The number of digits entered should be a perfect square. Default expected length is 81 digits (9x9 sudoku)',
            JP: '数字を入力（0〜9、空白マスは「0」「.」、スペース不可）。文字数は平方数（初期設定では81文字）にしてください。',
            ZH: '输入数字（0~9,不可输入空格，空白格使用0或.表示）。数字长度应为平方数（默认长度为81位）。'
        },
        urlstring: {
            EN: 'In case of \"URL too long Error\". Type/Paste Penpa-edit URL here and click on Load button. You can also load puzz.link puzzles here',
            JP: "URLが長すぎるエラーの時はここに入力。puzz.linkの一部のリンクにも対応。",
            ZH: '如果出现“链接过长”错误，可在此处输入/粘贴Penpa-edit链接并点击加载按钮。也可以在此处加载puzz.link谜题。'
        },

        "answer_check_shading exact color": { EN: "Match exact shading colors", JP: 'シェーディングカラーを正確に一致させる', ZH: '匹配颜色的涂色' },
        "answer_check_shading": { EN: "Shade cells in Dark Grey (DG) or Grey (GR) or Light Grey (LG) or Black (BL)", JP: '黒マスは濃灰（DG）、灰（GR）、薄灰（LG）、黒（BL）', ZH: '深灰、浅灰、亮灰或黑色的涂色' },
        "answer_check_number": { EN: "Numbers must be in Green, Blue or Red color", JP: '数字は緑か青か赤', ZH: '绿色、蓝色或红色的数字' },
        "answer_check_cell loop exact": { EN: "Line must be in Green Color", JP: '色とスタイルが一致する線', ZH: '匹配颜色的线' },
        "answer_check_cell loop": { EN: "Line must be in Green Color", JP: '線は緑', ZH: '绿色的线' },
        "answer_check_edge loop exact": { EN: "Edges in matching color/style", JP: '色とスタイルがマッチしたエッジ', ZH: '匹配颜色的边' },
        "answer_check_edge loop": { EN: "Edge must be in Green Color", JP: '辺は緑', ZH: '绿色的边' },
        "answer_check_wall": { EN: "Walls must be in Green Color", JP: '壁は緑', ZH: '绿色的墙' },
        "answer_check_square": { EN: "Black Squares", JP: '黒正方形', ZH: '黑色正方形' },
        "answer_check_circle": { EN: "White and Black circles of medium (M) size", JP: '中サイズ（M）の白マルまたは黒マル', ZH: '大小为中（M）的黑白圆' },
        "answer_check_shakashaka": { EN: "Half triangles", JP: '直角三角形', ZH: '直角三角形' },
        "answer_check_arrow": { EN: "Small arrows", JP: '小矢印', ZH: '小箭头' },
        "answer_check_magnets": { EN: "+ and - in black or green color", JP: '＋またはー、黒または緑', ZH: '绿色的+-' },
        "answer_check_battleship": { EN: "Battleship fleet", JP: '艦隊', ZH: '战舰' },
        "answer_check_tents": { EN: "Tents", JP: 'テント', ZH: '帐篷' },
        "answer_check_star battle": { EN: "Stars", JP: '星', ZH: '星' },
        "answer_check_akari": { EN: "Light bulbs", JP: '明かり', ZH: '灯泡' },
        "answer_check_minesweeper": { EN: "Mines", JP: '地雷', ZH: '地雷' },

        "solution_checker_all": { EN: 'Solution checker looks for ALL of the following:', JP: '以下の全てを正解判定する', ZH: '答案检测以下所有元素：' },
        "solution_checker_one": { EN: 'Solution checker looks for ONE of the following:', JP: '以下のうち一つを正解判定する', ZH: '答案检测以下任一元素：' },

        "gmp_unsupported": {
            EN: 'Error - It doesnt support puzzle type $v\n' +
                'Please see instructions (Help) for supported puzzle types\n' +
                'For additional genre support please submit your request to penpaplus@gmail.com',
            JP: 'エラー：対応していないパズル種です。$v\n 対応パズル種についてはヘルプを参照してください。',
            ZH: '错误：不支持的谜题类型 $v 。请查看帮助确认支持的谜题类型。'
        },
        "gmp_enter_type": {
            EN: 'Error - Enter the Puzzle type in Header area\n' +
                'Please see instructions (Help) for supported puzzle types\n',
            JP: 'エラー：ヘッダーにパズル種を入力してください。\n 対応パズル種についてはヘルプを参照してください。\n',
            ZH: '错误：需在头文件区域输入谜题类型。请查看帮助确认支持的谜题类型。'
        },

        "box_mode_warning": {
            EN: '<h3 class="info">Last cell cannot be removed using the "Box" mode. For a blank grid use the following approach:</h3><ol><li>Click on "New Grid / Update"</li><li>Set "Gridlines" to "None"</li><li>Set "Gridpoints" to "No"</li><li>Set "Outside frame" to "No"</li><li>Click on "Update display"</li></ol>',
            JP: '<h3 class=info">"マス"モードでは盤面全てのマスの削除はできません。マスの無い盤面は以下のように作成してください。</h3><ol><li>"New Grid / Update"を選択</li><li>"Gridlines"→"None"</li><li>"Gridpoints"→"No"</li><li>"Outside frame"→"No"</li><li>"Update display"を選択</li></ol>"', 
            ZH: '<h3 class="info">无法使用“格子”模式删去全部格子。如果需要空盘面请按照以下步骤操作：</h3><ol><li>点击“新建/更新”</li><li>设置“格线”为“无”</li><li>设置“格点”为“无”</li><li>设置“外框”为“无”</li><li>点击“更新盘面”</li></ol>'
        },

        _todo: {}
    },

    modes: {
        EN: ["Surface", "Multicolor",
            "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
            "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper", "Edge Erase",
            "Wall",
            "Move All",
            "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side",
            "Sudoku Normal", "Sudoku Corner", "Sudoku Centre",
            "Shape",
            "Special", "Thermo", "Sudoku Arrow",
            "Composite"
        ],
        JP: ["黒マス", "多色",
            "線 通常", "線 対角線", "線 自由線", "線 中線", "線 補助x",
            "辺 通常", "辺 対角線", "辺 自由線", "辺 補助x", "辺 枠消",
            "壁",
            "移動 全",
            "数字 通常", "数字 大", "数字 中", "数字 小", "数字 候補", "数字 1/4", "数字 辺",
            "数独 通常", "数独 角", "数独 中央",
            "記号",
            "特殊", "サーモ", "数独 アロー",
            "複合"
        ],
        ZH: ["涂色", "多色",
            "线 常规", "线 对角线", "线 自由绘制", "线 中心线", "线 x标记",
            "边 常规", "边 对角线", "边 自由绘制", "边 x标记", "边 清除",
            "墙",
            "移动 全部",
            "数字 常规", "数字 大", "数字 中", "数字 小", "数字 候选数", "数字 1/4", "数字 边缘",
            "数独 常规", "数独 角", "数独 中央",
            "形状",
            "特殊", "温度计", "数独箭头",
            "复合"],
        mapping: ["surface", "multicolor",
            "sub_line1", "sub_line2", "sub_line3", "sub_line5", "sub_line4",
            "sub_lineE1", "sub_lineE2", "sub_lineE3", "sub_lineE4", "sub_lineE5",
            "wall",
            "sub_move1",
            "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9",
            "sub_sudoku1", "sub_sudoku2", "sub_sudoku3",
            "symbol",
            "special", "sub_specialthermo", "sub_specialarrows",
            "combi"
        ]
    },

    vanillaSelect: {
        EN: { "all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All" },
        JP: { "all": "全", "items": "項目", "selectAll": "全てチェック", "clearAll": "全てチェックを外す" },
        ZH: { "all": "全部", "items": "项目", "selectAll": "全部选择", "clearAll": "全部清除" }
    }

};
