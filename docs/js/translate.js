function trans_text(button_text, label_text, placeholder) {
    if (UserSettings.app_language === "EN") {
        var a = 1;
    } else {
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
        document.getElementById("tb_delete").innerHTML = ["解答消去", "Delete"][a];
    } else if (pu.mmode === "solve") {
        document.getElementById("title").innerHTML = PenpaText.get('solver_mode');
        document.getElementById("tb_delete").innerHTML = ["解答消去", "Delete"][a];
    } else {
        document.getElementById("title").innerHTML = PenpaText.get('setter_mode');
        document.getElementById("tb_delete").innerHTML = ["問題・解答消去", "Delete"][a];
    }

    PenpaUI.initPenpaLite();
}

function trans() {

    var button_text = {
        "newboard": ["新規 / 更新", "New Grid / Update"],
        "rotation": ["回転 / 移動", "Rotate / Move"],
        "newsize": ["サイズ変更", "Sizechange"],
        "saveimage": ["画像保存", "Screenshot"],
        "savetext": ["出力", "Share"],
        "duplicate": ["複製", "Clone"],
        "input_sudoku": ["数独入出力", "I/O Sudoku"],
        "input_url": ["入力", "Load"],
        "page_settings": ["設定", "Settings"],
        "tb_undo": ["戻", "Undo"],
        "tb_redo": ["進", "Redo"],
        "tb_reset": ["選択消去", "Erase selected mode"],
        "eraseselect_text": ["現在選択中のモードの記号を消去", "Erase elements that belongs to the selected mode"],
        "erase_text": ["問題／解答盤面を消去", "Erase problem or solution grid"],
        "closeBtn_nb1": ["作成", "New grid"],
        "closeBtn_nb2": ["枠変更", "Change grid"],
        "closeBtn_nb3": ["キャンセル", "Cancel"],
        "closeBtn_size1": ["枠変更", "Change grid"],
        "closeBtn_size2": ["キャンセル", "Cancel"],
        "closeBtn_image1": ["別ウィンドウ", "Open in new window"],
        "closeBtn_image2": ["ダウンロード", "Download"],
        "closeBtn_image3": ["キャンセル", "Cancel"],
        "rt_center": ["盤面を中央に移動", "Move board to center"],
        "rt_size": ["画面サイズを盤面に合わせる", "Fit window to board"],
        "rt_reset": ["移動をリセット", "Reset"],
        "closeBtn_rotate1": ["閉じる", "Close"],
        "address_edit": ["編集URL", "URL for editing"],
        "address_solve": ["出題用URL", "URL for solving"],
        "address_comp": ["コンテスト用URL", "Contest-Mode URL"],
        "expansion": ["拡張出力", "Extra options"],
        "closeBtn_save1": ["コピー", "Copy"],
        "closeBtn_save2": ["ダウンロード", "Download"],
        "closeBtn_save3": ["開く", "Open"],
        "closeBtn_save4": ["キャンセル", "Cancel"],
        "solution_open": ["解答判定", "Answer descision"],
        "closeBtn_save5": ["解答判定付き出題用アドレスを出力", "Generate URL with answer check"],
        "closeBtn_save6": ["短縮", "Shorten"],
        "pp_file": ["pp_fileを出力", "pp_file output"],
        "load_url": ["URLを入力", "Load URL"],
        "puzzlerules": ["ルールを表示", "Show rules"],
        "closeBtn_input1": ["挿入", "Insert"],
        "closeBtn_input2": ["消去", "Clear"]
    }
    var label_text = {
        "edit_txt": ["編集：", "Edit:"],
        "pu_q_label": ["問題", "Problem"],
        "pu_a_label": ["解答", "Solution"],
        "edge_button0": ["辺入力：", "Draw on Edges:"],
        "visibility_button0": ["解答表示：", "Visibility:"],
        "mode_txt": ["モード：", "Mode:"],
        "mo_surface_lb": ["黒マス", "Surface"],
        "mo_line_lb": ["線", "Line"],
        "mo_lineE_lb": ["辺", "Edge"],
        "mo_wall_lb": ["壁", "Wall"],
        "mo_board_lb": ["マス", "Box"],
        "mo_move_lb": ["移動", "Move"],
        "mode_txt_space": ["　　　　", "　　　"],
        "mo_number_lb": ["数字", "Number"],
        "mo_symbol_lb": ["記号", "Shape"],
        "mo_special_lb": ["特殊", "Special"],
        "mo_cage_lb": ["枠", "Cage"],
        "mo_sudoku_lb": ["数独", "Sudoku"],
        "mo_combi_lb": ["複合", "Composite"],
        "sub_txt": ["サブ：", "Sub:"],
        "sub_line1_lb": ["通常", "Normal"],
        "sub_line2_lb": ["対角線", "Diagonal"],
        "sub_line3_lb": ["自由線", "Free"],
        "sub_line5_lb": ["中線", "Middle"],
        "sub_line4_lb": ["補助×", "Helper_×"],
        "sub_lineE1_lb": ["通常", "Normal"],
        "sub_lineE2_lb": ["対角線", "Diagonal"],
        "sub_lineE3_lb": ["自由線", "Free"],
        "sub_lineE4_lb": ["補助×", "Helper_×"],
        "sub_lineE5_lb": ["枠消", "Erase"],
        "sub_number1_lb": ["通常", "Normal"],
        "sub_number2_lb": ["矢印", "Arrow"],
        "sub_number9_lb": ["", ""],
        "sub_number10_lb": ["大", "Big"],
        "sub_number6_lb": ["中", "Middle"],
        "sub_number5_lb": ["小", "Small"],
        "sub_number8_lb": ["長文", "Long"],
        "sub_number7_lb": ["候補", "Candidates"],
        "sub_cage2_lb": ["自由", "Free"],
        "sub_sudoku1_lb": ["通常", "Normal"],
        "sub_sudoku2_lb": ["角", "Corner"],
        "sub_sudoku3_lb": ["中央", "Centre"],
        "ms1": ["図形", "Shape"],
        "ms1_circle": ["円", "Circle"],
        "ms1_square": ["正方形", "Square"],
        "ms1_triup": ["上三角", "UpTri."],
        "ms1_tridown": ["下三角", "DownTri."],
        "ms1_triright": ["右三角", "RightTri."],
        "ms1_trileft": ["左三角", "LeftTri."],
        "ms1_diamond": ["ダイヤ", "Diamond"],
        "ms1_hexpoint": ["六角１", "Hexagon point"],
        "ms1_hexflat": ["六角２", "Hexagon flat"],
        "ms_ox_B": ["黒", "Black"],
        "ms_ox_E": ["緑", "Green"],
        "ms_ox_G": ["灰", "Gray"],
        "ms_cross": ["十字", "Cross"],
        "ms_line": ["線", "Line"],
        "ms_frameline": ["斜線", "Cage Lines"],
        "ms1_bars": ["バー", "Bars &#x25AE; &#x25AF;"],
        "ms_bars_B": ["黒", "Black"],
        "ms_bars_G": ["灰", "Gray"],
        "ms_bars_W": ["白", "White"],
        "ms_tri": ["直角三角形", "Corner triangle"],
        "ms2": ["数字", "Number"],
        "ms3_math": ["無限・計算", "Math"],
        "ms_math": ["黒", "Black"],
        "ms_math_G": ["緑", "Green"],
        "ms_inequality": ["不等号", "Inequality"],
        "ms_degital_B": ["黒", "Black"],
        "ms_degital_E": ["緑", "Green"],
        "ms_degital_G": ["灰", "Gray"],
        "ms_degital_f": ["デジタル(枠)", "Degital Frame"],
        "ms3": ["矢印", "Arrow"],
        "ms3_arrow_B": ["太", "Fat"],
        "ms_arrow_B_B": ["黒", "Black"],
        "ms_arrow_B_G": ["灰", "Gray"],
        "ms_arrow_B_W": ["白", "White"],
        "ms3_arrow_N": ["細", "Thin"],
        "ms_arrow_N_B": ["黒", "Black"],
        "ms_arrow_N_G": ["灰", "Gray"],
        "ms_arrow_N_W": ["白", "White"],
        "ms3_arrow_tri": ["三角形", "Triangle"],
        "ms_arrow_tri_B": ["黒", "Black"],
        "ms_arrow_tri_G": ["灰", "Gray"],
        "ms_arrow_tri_W": ["白", "White"],
        "ms3_arrow_fouredge": ["四辺", "4-edge"],
        "ms_arrow_fouredge_B": ["黒", "Black"],
        "ms_arrow_fouredge_G": ["灰", "Gray"],
        "ms_arrow_fouredge_E": ["緑", "Green"],
        "ms_arrow_GP": ["通常", "Normal"],
        "ms_arrow_GP_C": ["丸付き", "With circle"],
        "ms_arrow_Short": ["短太", "Short Fat"],
        "ms_arrow_S": ["小", "Small"],
        "ms_arrow_cross": ["十字", "Cross"],
        "ms_arrow_eight": ["八方", "8-way"],
        "ms_arrow_fourtip": ["四端", "Arrow-tips"],
        "ms4": ["固有1", "Special1"],
        "ms4_battleship": ["バトルシップ", "Battleship"],
        "ms_battleship_B": ["黒", "Black"],
        "ms_battleship_G": ["灰", "Gray"],
        "ms_battleship_W": ["白", "White"],
        "ms_battleship_B+": ["追加黒", "Curvy Black"],
        "ms_battleship_G+": ["追加灰", "Curvy Gray"],
        "ms_battleship_W+": ["追加白", "Curvy White"],
        "ms_kakuro": ["カックロ", "Kakuro"],
        "ms_compass": ["コンパス", "Compass"],
        "ms_sudokuetc": ["数独特殊記号", "Sudoku variants"],
        "ms_polyomino": ["ポリオミノ", "Polyominoes"],
        "ms5": ["固有2", "Special2"],
        "ms_angleloop": ["鋭直鈍ループ", "Angle loop"],
        "ms_firefly": ["ホタルビーム", "Fireflies"],
        "ms_pencils": ["ペンシルズ", "Pencils"],
        "ms_arc": ["円弧", "Arc"],
        "sub_specialthermo_lb": ["サーモ", "Thermo"],
        "sub_specialnobulbthermo_lb": ["サーモ（球なし）", "No Bulb Thermo"],
        "sub_specialarrows_lb": ["アロー", "Arrow"],
        "sub_specialdirection_lb": ["矢印", "Move"],
        "sub_specialsquareframe_lb": ["四角枠", "Rec.frame"],
        "sub_specialpolygon_lb": ["多角形", "Polygon"],
        "sub_move1_lb": ["全", "All"],
        "sub_move2_lb": ["数字", "Number"],
        "sub_move3_lb": ["記号", "Shapes"],
        "subc1": ["塗り", "Paint"],
        "combisub_blpo": ["黒・点", "Black/Dot"],
        "combisub_blwh": ["白丸黒丸", "Ying Yang"],
        "combisub_shaka": ["シャカシャカ", "Shakashaka"],
        "subc2": ["ループ", "Loop"],
        "combisub_linex": ["線・×", "Line/×"],
        "combisub_lineox": ["線・OX", "Line/OX"],
        "combisub_edgexoi": ["辺・x・内外", "Edge/x/in out"],
        "combisub_yajilin": ["ヤジリン", "Yajilin"],
        "combisub_hashi": ["橋をかけろ", "Hashi"],
        "subc3": ["領域", "Area"],
        "combisub_edgesub": ["辺・補助線", "Edge/AuxLine"],
        "subc4": ["物体", "Object"],
        "combisub_battleship": ["バトルシップ", "Battleship"],
        "combisub_star": ["スターバトル", "Star battle"],
        "combisub_tents": ["テント", "Tents"],
        "combisub_magnets": ["マグネット", "Magnets"],
        "combisub_arrowS": ["矢印フリック", "Arrow flick"],
        "subc5": ["数字埋", "Number"],
        "combisub_numfl": ["数字フリック", "Number flick"],
        "combisub_alfl": ["英字フリック", "Alphabet flick"],
        "style_txt": ["スタイル", "Style:"],
        "st_surface1_lb": ["濃灰", "DG"],
        "st_surface8_lb": ["隠灰", "GR"],
        "st_surface3_lb": ["薄灰", "LG"],
        "st_surface4_lb": ["黒", "BL"],
        "st_surface2_lb": ["緑", "GR"],
        "st_surface5_lb": ["水", "BL"],
        "st_surface6_lb": ["赤", "RE"],
        "st_surface7_lb": ["黄", "YE"],
        "st_surface9_lb": ["桃", "PI"],
        "st_surface10_lb": ["橙", "OR"],
        "st_surface11_lb": ["紫", "PU"],
        "st_surface12_lb": ["茶", "BR"],
        "st_line3_lb": ["緑", "G"],
        "st_line80_lb": ["細", "Thin"],
        "st_line2_lb": ["太", "B"],
        "st_line12_lb": ["点", "Dotted"],
        "st_line13_lb": ["太点", "Fat Dots"],
        "st_line5_lb": ["灰", "G"],
        "st_line8_lb": ["赤", "R"],
        "st_line9_lb": ["青", "B"],
        "st_line40_lb": ["短", "Short"],
        "st_line30_lb": ["二重", "Double"],
        "st_lineE3_lb": ["緑", "G"],
        "st_lineE80_lb": ["細", "Thin"],
        "st_lineE2_lb": ["太", "B"],
        "st_lineE12_lb": ["点", "Dotted"],
        "st_lineE13_lb": ["太点", "Fat Dots"],
        "st_lineE5_lb": ["灰", "G"],
        "st_lineE8_lb": ["赤", "R"],
        "st_lineE9_lb": ["青", "B"],
        "st_lineE21_lb": ["極太", "Thicker"],
        "st_lineE30_lb": ["二重", "Double"],
        "st_wall3_lb": ["緑", "G"],
        "st_wall1_lb": ["細", "Thin"],
        "st_wall2_lb": ["太", "B"],
        "st_wall12_lb": ["点", "Dotted"],
        "st_wall17_lb": ["太点", "Fat Dots"],
        "st_wall14_lb": ["灰点", "Gray Dot"],
        "st_wall5_lb": ["灰", "G"],
        "st_wall8_lb": ["赤", "R"],
        "st_wall9_lb": ["青", "B"],
        "st_number1_lb": ["黒", "B"],
        "st_number2_lb": ["緑", "G"],
        "st_number8_lb": ["水", "B"],
        "st_number3_lb": ["灰", "G"],
        "st_number9_lb": ["青", "B"],
        "st_number10_lb": ["赤", "R"],
        "st_number4_lb": ["白", "White"],
        "st_number5_lb": ["白背景", "WhiteBG"],
        "st_sudoku1_lb": ["黒", "B"],
        "st_sudoku2_lb": ["緑", "G"],
        "st_sudoku8_lb": ["水", "B"],
        "st_sudoku3_lb": ["灰", "G"],
        "st_sudoku9_lb": ["青", "B"],
        "st_sudoku10_lb": ["赤", "R"],
        "st_symbol1_lb": ["線-奥", "Behind lines"],
        "st_symbol2_lb": ["線-前", "In front of lines"],
        "panel_buttons0": ["選択中：", "Selecting:"],
        "panel_buttonc0": ["選択中：", "Selecting:"],
        "st_cage10_lb": ["点線", "Dot"],
        "st_cage7_lb": ["灰線", "Gray"],
        "st_cage15_lb": ["灰点", "GrayDot"],
        "st_cage16_lb": ["実線", "Black"],
        "sw_start": ["スタート", "Start"],
        "sw_pause": ["ポーズ", "Pause"],
        "sw_stop": ["ストップ", "Stop"],
        "sw_reset": ["リセット", "Reset"],
        "sw_hide": ["隠す", "Hide"],
        "modal_lb": ["新規作成", "New Grid"],
        "nb_gridtype_lb": ["盤面：", "Board type:"],
        "nb_gridtype1_lb": ["正方形", "Square"],
        "nb_gridtype2_lb": ["正六角形", "Hexagon"],
        "nb_gridtype3_lb": ["正三角形", "Triangle"],
        "nb_gridtype4_lb": ["ピラミッド", "Pyramid"],
        "nb_gridtype5_lb": ["立方体", "Cube"],
        "nb_gridtype6_lb": ["数独", "Sudoku"],
        "nb_gridtype7_lb": ["カックロ", "Kakuro"],
        "nb_size_lb": ["サイズ：", "Size:"],
        "name_size1": ["ヨコ：", "Columns:"],
        "name_size2": ["タテ：", "Rows:"],
        "nb_space_lb": ["余白：", "White space:"],
        "nb_display_lb": ["表示サイズ：", "Display size:"],
        "nb_sudoku1_lb": ["対角線 &#x27CD;", "Diagonal &#x27CD;"],
        "nb_sudoku4_lb": ["対角線 &#x27CB;", "Diagonal &#x27CB;"],
        "nb_sudoku2_lb": ["外周ヒント", "Outside clues"],
        "nb_sudoku3_lb": ["外周ヒント(上左)", "Outside clues (top/left)"],
        "nb_sudoku8_lb": ["サイズ 4x4", "Size 4x4"],
        "nb_sudoku5_lb": ["サイズ 6x6", "Size 6x6"],
        "nb_sudoku6_lb": ["サイズ 8x8", "Size 8x8"],
        "name_space1": ["上：", "Over:"],
        "name_space2": ["下：", "Under:"],
        "name_space3": ["左：", "Left:"],
        "name_space4": ["右：", "Right:"],
        "nb_note": ["枠変更では以下の値のみ更新されます", "Only bellow will be updated when you change grid."],
        "nb_grid_lb": ["グリッド：", "Grid:"],
        "nb_grid1_lb": ["実線", "Solid"],
        "nb_grid2_lb": ["点線", "Dotted"],
        "nb_grid3_lb": ["なし", "None"],
        "nb_lat_lb": ["　格子点：", "Gridpoints:"],
        "nb_lat1_lb": ["あり", "Yes"],
        "nb_lat2_lb": ["なし", "No"],
        "nb_out_lb": ["　　外枠：", "Outside frame:"],
        "nb_out1_lb": ["あり", "Yes"],
        "nb_out2_lb": ["なし", "No"],
        "modal-newsize_lb": ["　サイズ変更", "Change Size"],
        "modal-newsize_size_lb": ["表示サイズ：", "Display size:"],
        "saveimagetitle": ["画像保存", "Save screenshot"],
        "nb_margin_lb": ["　余白：", "White border:"],
        "nb_margin1_lb": ["あり", "Yes"],
        "nb_margin2_lb": ["なし", "No"],
        "nb_quality_lb": ["　画質：", "Image quality:"],
        "nb_quality1_lb": ["高", "High"],
        "nb_quality2_lb": ["低", "Low"],
        "nb_type_lb": ["拡張子：", "File type:"],
        "savetexttitle": ["回転・移動", "Rotate / Move / Add / Remove"], // JP text needs updating
        "rt1_lb": ["　回転：", "Rotate:"],
        "rt2_lb": ["　反転：", "Flip:"],
        "rt3_lb": ["　移動：", "Move:"],
        "rt4_lb": ["行・列の追加・削除", "Add/Remove Rows/Columns:"],
        "rt5_lb": ["正方形盤面でのみ動作。履歴は削除されます。", "*Works only in Square Board Type, it also resets undo/redo. Answer checking if enabled, will only work with original grid size."],
        "rt6_lb": ["現在の盤面", "Existing Grid"],
        "rt6_lb_r": ["現在の盤面", "Existing Grid"],
        "savetitle": ["パズル出力", "Share Puzzle"],
        "saveinfo_lb": ["パズルインフォメーション", "Puzzle Information"],
        "save1_lb": ["タイトル：", "Title:"],
        "save2_lb": ["作者：", "Author:"],
        "save3_lb": ["ルール：", "Rules:"],
        "source_lb": ["ソース：", "Source:"],
        "sourcewarning": ["自身が作者でない場合はソースを記入してください", "* If you are not the author of the puzzle, please specify the source URL"],
        "generate_lb": ["URL出力", "Generate URL"],
        "save_undo_lb": ["履歴の保存", "Save Undo/Redo (History)"],
        "auto_shorten_chk_lb": ["TinyURLでURLを短縮", "Automatically Shorten with TinyURL"],
        "filename_lb": ["ファイル名：", "File name:"],
        "extend_lb": ["拡張出力", "Extended Output"],
        "save3texttitle": ["以下の記号を判定：", "Solution will check only following:"],
        // "answerwarning": ["チェックがない場合全てを判定。一部の記号のみ判定したい場合ANDかORの列を選択してください。ANDが優先されます。", "*Default (none selected) it checks for all. Choose either AND or OR column, if both are selected, AND will be given preference."],
        "sol_surface_lb": ["黒マス：濃灰・隠灰・薄灰・黒", "Shading - DG (Dark Grey), GR, LG, BL (Black):"],
        "sol_number_lb": ["数字：通常・大・中・小：緑・青・赤<br>数独：通常・中央：緑・青・赤", "Number - Normal, L, M, S - Green, Blue, Red <br> Sudoku - Normal, Centre - Green, Blue, Red:"],
        "sol_loopline_lb": ["線：緑・二重", "Line - Green, Double:"],
        "sol_ignoreloopline_lb": ["線：問題と重なった線を無視", "Line - Ignore Given Line Segments:"],
        "sol_loopedge_lb": ["辺：緑・二重", "Edge - Green, Double:"],
        "sol_ignoreborder_lb": ["辺：問題・外枠と重なった線を無視", "Edge - Ignore Edges on Grid Border / Givens:"],
        "sol_wall_lb": ["壁：緑", "Wall - Green:"],
        "sol_square_lb": ["記号-図形-正方形-XL-2", "Shape - Shape - Square - XL size - Option 2:"],
        "sol_circle_lb": ["記号-図形-円-M-1,2", "Shape - Shape - Circle - M size - Options 1 & 2:"],
        "sol_tri_lb": ["記号-図形-直角三角形-1,2,3,4", "Shape - Shape - Corner triangle - Options 1 to 4:"],
        "sol_arrow_lb": ["記号-矢印-小-1~8", "Shape - Arrow - Small - Options 1 to 8:"],
        "sol_math_lb": ["記号-数字-無限・計算-黒・緑-2,3(+-)", "Shape - Number - Math - Black, Green - Options 2 & 3:"],
        "sol_battleship_lb": ["記号-固有1-バトルシップ-黒-1~6<br>追加黒-1~4", "Shape - Special 1 - Battleship - Black - Options 1 to 6 <br> and Curvy Black - Options 1 to 4:"],
        "sol_tent_lb": ["記号-固有1-テント-2", "Shape - Special 1 - Tent - Option 2:"],
        "sol_star_lb": ["記号-固有1-スター-1,2,3", "Shape - Special 1 - Star - Options 1 to 3:"],
        "sol_akari_lb": ["記号-固有2-美術館-3", "Shape - Special 2 - Lightbulb - Option 3:"],
        "sol_mine_lb": ["記号-固有2-マインスイーパー-4,5", "Shape - Special 2 - Minesweeper - Option 4 & 5:"],
        "save5texttitle": ["ヘッダー", "header"],
        "custom_lb": ["カスタムメッセージ", "Custom Message"],
        "save6texttitle": ["URL入力", "Load URL"],
        "quick_panel_toggle_label": ["パネル：", "Panel:"]
    }

    var placeholder = {
        "saveinfotitle": ["例：サーモ数独、ヤジリン", "e.g. Thermo Sudoku or Yajilin"],
        "saveinfoauthor": ["作者名", "Puzzle creator name"],
        "saveinforules": ["例：クラシック数独のルール", "e.g. Classic sudoku rules."],
        "custom_message": ["正解時に出るカスタムメッセージ", "Custom Congratulation Message on answer check pop up"],
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
        'nb_rules_lb',
        'nb_title_lb',
        'lb_settings_app_display',
        'lb_settings_display_theme',
        'lb_settings_display_theme_light',
        'lb_settings_display_theme_dark',
        'lb_settings_display_layout',
        'lb_settings_display_layout_classic',
        'lb_settings_display_layout_flex_left',
        'lb_settings_display_layout_flex_right',
        'lb_settings_display_layout_streaming1',
        'lb_settings_language',
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
        contest_mode: { EN: 'Contest Mode', JP: 'コンテストモード' },
        replay_mode: { EN: 'Replay Mode', JP: 'リプレイモード' },
        setter_mode: { EN: 'Setter Mode', JP: '編集モード' },
        setter_mode_while_solving: { EN: 'Setter Mode (while Solving)', JP: '編集モード（解答中）' },
        solver_mode: { EN: 'Solver Mode', JP: '解答モード' },
        solver_mode_answer: { EN: 'Solver Mode (Answer Checking Enabled)', JP: '解答モード（正解判定あり）' },

        // Grid Setup
        columns: { JP: "ヨコ：", EN: "Columns:" },
        rows: { JP: "タテ：", EN: "Rows:" },
        side: { EN: "Side:", JP: '幅：' },
        sides: { EN: "Sides:", JP: '横：' },
        over: { EN: "Over:", JP: '上：' },
        border: { EN: "Border:", JP: '境界：' },

        nb_gridtype8_lb: { EN: 'Tetrakis square' },
        nb_gridtype9_lb: { EN: 'Truncated square' },
        nb_gridtype10_lb: { EN: 'Snub square' },
        nb_gridtype11_lb: { EN: 'Cairo pentagonal' },
        nb_gridtype12_lb: { EN: 'Rhombitrihexagonal' },
        nb_gridtype13_lb: { EN: 'Deltoidal trihexagonal' },

        // Generic Terms
        on: { EN: "ON" },
        off: { EN: "OFF" },
        yes: { EN: "Yes" },
        no: { EN: "No" },
        rules_generic: { EN: "Rules:", JP: 'ルール：' },
        close: { EN: 'Close', JP: '閉じる' },
        show: { EN: 'Show', JP: '表示' },
        hide: { EN: 'Hide', JP: '隠す' },
        ok: { EN: 'OK' },

        // Export Image
        nb_rules_lb: { JP: "ルール：", EN: "Rules:" },
        nb_title_lb: { EN: "Title & Author:", JP: 'タイトルと作者：' },
        nb_title1_lb: { EN: "Yes" },
        nb_title2_lb: { EN: "No" },
        nb_rules1_lb: { EN: "Yes" },
        nb_rules2_lb: { EN: "No" },
        saveimagename: { EN: 'sample_name' },

        // Main UI
        page_help: { EN: 'Help', JP: 'ヘルプ' },
        constraints: { EN: 'Constraints (Beta)', JP: '専用モード' },

        disable_penpa_lite: {
            JP: 'Penpa Liteを無効化',
            EN: 'Disable Penpa Lite'
        },
        enable_penpa_lite: {
            JP: 'Penpa Liteを有効化',
            EN: 'Enable Penpa Lite'
        },

        search_area: { EN: 'Search Area', JP: '検索範囲' },
        live_replay_na: { EN: 'Live Replay N/A', JP: '解答履歴(Live Replay) N/A' },
        live_replay: { EN: 'Live Replay', JP: '解答履歴(Live Replay)' },
        solve_path: { EN: 'Solve Path', JP: '想定解法(Solve Path)' },

        feedback_modal: {
            EN: 'Any suggestions or improvements, send an email to <b> penpaplus@gmail.com </b> <br> or <br> Create an issue on github <a href="https://github.com/swaroopg92/penpa-edit/issues" target="_blank">here</a> <br> or <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.gg/BbN89j5" target="_blank">here</a>.',
            JP: '修正やご提案は以下からご連絡ください。 <b> penpaplus@gmail.com </b> <br> / <br> Create an issue on github <a href=https://github.com/swaroopg92/penpa-edit/issues" target="_blank">Github</a> <br> / <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.gg/BbN89j5" target="_blank">Discord</a>."'
        },

        contest_answer: {
            EN: '*Note the Solution Code, go back to <a href="$v" target="_blank">Source</a> and enter in the Submissions Box*',
            JP: 'アンサーキーの入力は、<a href=$v" target="_blank">Source</a> に戻り、Submissions Boxから行ってください*"'
        },

        answer_check_empty: {
            EN: 'No specific option selected by Author. Answer check looks for all the elements with appropriate accepted colors. Check <a href="https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">this</a> for reference.',
            JP: 'この問題には解答チェックのオプションが選択されていません。解答チェックをするためには、配置する物体の種類や色が全て正しい必要があります。 <a href=https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">こちら</a> もご参照ください。"'
        },

        puzzlink_row_column: {
            EN: 'Penpa+ does not support grid size greater than 65 rows or columns',
            JP: 'Penpa+は65行を超えるサイズに対応していません。'
        },
        puzzlink_not_supported: {
            EN: 'It currently does not support puzzle type: $v',
            JP: 'パズル種 $v には現在対応していません。'
        },

        // Settings
        lb_settings_app_display: { EN: 'App Display', JP: '画面表示' },
        lb_settings_display_theme: { EN: 'Display Theme:', JP: '明るさ' },
        lb_settings_display_theme_light: { EN: 'Light', JP: 'ライト' },
        lb_settings_display_theme_dark: { EN: 'Dark', JP: 'ダーク' },
        lb_settings_display_layout: { EN: 'Display Layout:', JP: 'レイアウト' },
        lb_settings_display_layout_classic: { EN: 'Classic', JP: '通常' },
        lb_settings_display_layout_flex_left: { EN: 'Flex (Tools Left)', JP: '可動（ツールバー左）' },
        lb_settings_display_layout_flex_right: { EN: 'Flex (Tools Right)', JP: '可動（ツールバー右）' },
        lb_settings_display_layout_streaming1: { EN: 'Streaming 1 (beta)', JP: '配信（ベータ版）' },
        lb_settings_language: { EN: 'Language:', JP: '言語' },
        lb_settings_timer: { EN: 'Timer:', JP: 'タイマー' },
        lb_settings_timer_show: { EN: 'Show', JP: '表示' },
        lb_settings_timer_hide: { EN: 'Hide', JP: '隠す' },
        lb_settings_puzzle_display: { EN: 'Puzzle Display', JP: '盤面表示' },
        lb_settings_sudoku_marks: { EN: 'Sudoku Pencil Marks:', JP: '[数独]補助数字' },
        lb_settings_sudoku_marks_dynamic: { EN: 'Dynamic', JP: '縦幅可変' },
        lb_settings_sudoku_marks_large: { EN: 'Large', JP: '縦幅大' },
        lb_settings_sudoku_marks_small: { EN: 'Small', JP: '縦幅小' },
        lb_settings_sudoku_normal: { EN: 'Sudoku Normal:', JP: '[数独]通常' },
        lb_settings_sudoku_normal_centered: { EN: 'Centered', JP: '中央' },
        lb_settings_sudoku_normal_bottom: { EN: 'Bottom', JP: '下' },
        lb_settings_starbattle_dots: { EN: 'Star Battle Dots:', JP: 'スターバトルの点記号' },
        lb_settings_starbattle_dots_high_range: { EN: 'High Range', JP: '入力しやすい' },
        lb_settings_starbattle_dots_low_range: { EN: 'Low Range', JP: '入力しにくい' },
        lb_settings_starbattle_dots_disable: { EN: 'Disable', JP: 'オフ' },
        lb_settings_surface_second: { EN: 'Surface Second Color:', JP: 'マスの補助色' },
        lb_settings_surface_second_dark: { EN: 'Dark Grey', JP: '濃灰' },
        lb_settings_surface_second_grey: { EN: 'Grey', JP: '灰' },
        lb_settings_surface_second_light: { EN: 'Light Grey', JP: '薄灰' },
        lb_settings_surface_second_black: { EN: 'Black', JP: '黒' },
        lb_settings_surface_second_green: { EN: 'Green', JP: '緑' },
        lb_settings_surface_second_blue: { EN: 'Blue', JP: '青' },
        lb_settings_surface_second_red: { EN: 'Red', JP: '赤' },
        lb_settings_surface_second_yellow: { EN: 'Yellow', JP: '黄' },
        lb_settings_surface_second_pink: { EN: 'Pink', JP: '桃' },
        lb_settings_surface_second_orange: { EN: 'Orange', JP: '橙' },
        lb_settings_surface_second_purple: { EN: 'Purple', JP: '紫' },
        lb_settings_surface_second_brown: { EN: 'Brown', JP: '茶' },
        lb_settings_tools: { EN: 'Tools', JP: '機能' },
        lb_settings_custom_colors: { EN: 'Custom Colors (Beta):', JP: '色の設定' },
        lb_settings_floating_panel: { EN: 'Floating Panel:', JP: 'パネル' },
        lb_settings_quick_panel: { EN: 'Quick Panel Button', JP: 'パネル切り替えボタン' },
        lb_settings_export: { EN: 'Export', JP: '出力' },
        lb_settings_auto_shorten: { EN: 'Auto-Shorten Links', JP: '自動でURLを短縮する' },
        lb_settings_input_options: { EN: 'Input Options', JP: '入力設定' },
        lb_settings_mouse_middle: { EN: 'Mouse Middle Button:', JP: 'マウスホイール' },
        lb_settings_reload: { EN: 'Reload Protection:', JP: 'リロード時に警告' },
        lb_settings_conflict: { EN: 'Conflict Detection:', JP: '不一致の検出' },
        lb_settings_conflict_off_this: { EN: 'OFF (this puzzle)', JP: 'OFF（このパズル）' },
        lb_settings_conflict_off_all: { EN: 'OFF (all puzzles)', JP: 'OFF（全てのパズル）' },
        lb_settings_sudoku_keys: { EN: 'Sudoku Z/Y & XCV Keys:', JP: '数独のショートカットキー（ZYXCV）' },
        lb_settings_storage: { EN: 'Saving/Storage', JP: '保存' },
        lb_settings_saved_settings: { EN: 'Saved Settings:', JP: '保存した設定' },
        clear_settings: { EN: 'Clear cookies', JP: 'クッキーをクリアする' },
        lb_settings_local_storage: { EN: 'Local Storage:', JP: 'ローカルストレージ' },
        clear_storage_one: { EN: 'Clear this puzzle', JP: 'この盤面の履歴を消去する' },
        clear_storage_all: { EN: 'Clear all', JP: '全ての履歴を消去する' },
        local_storage_browser_message: {
            EN: "Your browser has disabled or doesn't support local storage.",
            JP: "このブラウザはローカルストレージが無効になっているか、対応していません。"
        },
        local_storage_cleared: { EN: 'Local Storage is Cleared', JP: 'ローカルストレージが消去されました。' },
        clear_settings_message: { EN: 'You must reload the page for the default settings to take effect.', JP: '初期設定を有効にするには、ページを再読み込みしてください。' },
        display_size_max: { EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to max value.', JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 上限に設定されました。' },
        display_size_min: { EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to min value.', JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 下限に設定されました。' },

        copied_success: { EN: 'URL is copied to clipboard', JP: 'URLがクリップボードにコピーされました。' },
        sudoku_size_unsupported: { EN: 'Sorry, sudoku grids of size: $v are not supported', JP: '数独サイズ: $vには対応していません。' },

        // Modals
        f2_title: {
            EN: 'Are you sure to switch to Editing Mode?',
            JP: '編集モードに切り替えますか？'
        },
        f2_body: {
            EN: 'You have pressed F2. You can either Cancel or later press F3 to switch back to Solving Mode.',
            JP: 'F2キーが入力されました。キャンセルするかF3キーを押すことで解答モードに切り替えることができます。'
        },
        f2_confirm: {
            EN: 'Yes, switch',
            JP: 'はい、切り替えます。'
        },
        f3_title: {
            EN: 'Are you sure to switch to Solving Mode?',
            JP: '解答モードに切り替えますか？'
        },
        solution_incorrect_title: {
            EN: 'Your solution is incorrect.',
            JP: '解答が誤っています。'
        },
        solution_incorrect_main: {
            EN: Identity.incorrectMessage
        },

        preparing_download: { EN: "Preparing your download", JP: 'ダウンロード準備中' },

        border_setting_help: { EN: 'To place clues on grid border/edges and corners:<br> Turn "Draw on Edges": ON', JP: '文字などをマスの線上や角に配置する<br> "Draw on Edges:"→"ON"' },

        display_size_warning: {
            EN: 'Display size must be in the range <h2 class="warn">12-90</h2>',
            JP: '表示サイズは以下の範囲です <h2 class="warn">12-90</h2>'
        },

        create_check_warning_title: {
            EN: 'Are you sure want to reset the current board? To only change display size and grid lines use "Update display" button',
            JP: '現在の盤面をリセットしますか？ 表示サイズやグリッドを変えるには、枠変更を押してください。'
        },
        create_check_warning_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません'
        },
        create_check_warning_confirm: {
            EN: 'Yes, Reset it!',
            JP: 'はい、リセットします。'
        },
        reset_check_title_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Line Mode?',
            JP: '全ての補助xを消去しますか?'
        },
        reset_check_title_line: {
            EN: 'Erase/Clear all LINE mode elements?',
            JP: '全ての線を消去しますか?'
        },
        reset_check_title_edge_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Edge Mode?',
            JP: '全ての補助xを消去しますか?'
        },
        reset_check_title_edge_erased: {
            EN: 'Reset Erased Edges in Edge Mode?',
            JP: '全ての枠消を消去しますか?'
        },
        reset_check_title_edge: {
            EN: 'Erase/Clear all EDGE mode elements?',
            JP: '全ての辺を消去しますか?'
        },
        reset_check_title_shape: {
            EN: 'Erase/Clear all SHAPE mode elements?',
            JP: '全ての記号を消去しますか?'
        },
        reset_check_title_frame: {
            EN: 'Erase/Clear all FRAME mode elements?',
            JP: '全ての枠を消去しますか?'
        },
        reset_check_title_generic: {
            EN: 'Erase/Clear all $v mode elements?',
            JP: '全ての$vを消去しますか？'
        },
        reset_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません'
        },
        reset_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します'
        },
        delete_check_problem: {
            EN: 'Erase/Clear all the elements in PROBLEM mode?',
            JP: '全ての問題を消去しますか？'
        },
        delete_check_solution: {
            EN: 'Erase/Clear all the elements in SOLUTION mode?',
            JP: '全ての解答を消去しますか？'
        },
        delete_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません'
        },
        delete_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します'
        },

        unsupported_browser_title: {
            EN: 'Unsupported Browser',
            JP: 'サポートされていないブラウザ'
        },
        unsupported_browser_main: {
            EN: 'Your browser does not appear to support the needed functionality for a file to be made.',
            JP: 'あなたのブラウザはSVGに対応していません。' // JP text needs update
        },
        unsupported_filename: {
            EN: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename',
            JP: '<h2 class="warn">\\ / : * ? \" < > |</h2>は使用できません。'
        },

        sudoku_input_minmax_error: {
            EN: 'Error: Min/Max Sudoku Size allowed is 1x1 to 9x9 (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズは1x1〜9x9です（初期設定は9x9）。入力し直してください。'
        },
        sudoku_input_size_error: {
            EN: 'Error: Grid size is smaller than the specified Sudoku size (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズが小さすぎます（初期設定は9x9）。入力し直してください。'
        },
        sudoku_input_square_error: {
            EN: 'Error: The canvas area should be a sudoku grid or square grid',
            JP: 'エラー：描画範囲は数独の盤面か正方形盤面である必要があります。'
        },

        invalid_url: {
            EN: "Error: Invalid URL",
            JP: 'エラー：不正なURLです'
        },

        nb_sudoku3_lb_square: {
            EN: '*White space is subtracted from the row/column size',
            JP: '余白はタテ・ヨコのサイズから引かれます。'
        },
        nb_sudoku3_lb_hex: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。'
        },
        nb_sudoku3_lb_tri: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。'
        },
        nb_sudoku3_lb_pyramid: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。'
        },
        nb_sudoku3_lb_sudoku: {
            EN: 'Outside clues (top/left)',
            JP: '外周ヒント(上左)'
        },
        nb_sudoku7_lb_sudoku: {
            EN: '*Default size is 9x9',
            JP: '標準サイズは9x9です。'
        },

        size_warning_square: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>'
        },
        size_warning_kakuro: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>'
        },
        size_warning_generic: {
            EN: 'Side Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: '一辺の大きさは以下の範囲です <h2 class="warn">1-$v</h2>'
        },

        alpha_warning: {
            EN: "**Alpha Version - It's under development and currently has limited functionality",
            JP: 'これはアルファ版です。開発は初期段階で、機能は制限されています。'
        },

        iostring: {
            EN: 'Enter digits (0-9, 0 or . for an empty cell, no spaces). The number of digits entered should be a perfect square. Default expected length is 81 digits (9x9 sudoku)',
            JP: '数字を入力（0〜9、空白マスは「0」「.」、スペース不可）。文字数は平方数（初期設定では81文字）にしてください。'
        },
        urlstring: {
            EN: 'In case of \"URL too long Error\". Type/Paste Penpa-edit URL here and click on Load button. You can also load puzz.link puzzles here',
            JP: "URLが長すぎるエラーの時はここに入力。puzz.linkの一部のリンクにも対応。"
        },

        "answer_check_shading": { EN: "Shade cells in Dark Grey (DG) or Grey (GR) or Light Grey (LG) or Black (BL)", JP: '黒マスは濃灰（DG）、灰（GR）、薄灰（LG）、黒（BL）' },
        "answer_check_number": { EN: "Numbers must be in Green, Blue or Red color", JP: '数字は緑か青か赤' },
        "answer_check_cell loop": { EN: "Line must be in Green Color", JP: '線は緑' },
        "answer_check_edge loop": { EN: "Edge must be in Green Color", JP: '辺は緑' },
        "answer_check_wall": { EN: "Walls must be in Green Color", JP: '壁は緑' },
        "answer_check_square": { EN: "Black Squares", JP: '黒正方形' },
        "answer_check_circle": { EN: "White and Black circles of medium (M) size", JP: '中サイズ（M）の白マルまたは黒マル' },
        "answer_check_shakashaka": { EN: "Half triangles", JP: '直角三角形' },
        "answer_check_arrow": { EN: "Small arrows", JP: '小矢印' },
        "answer_check_magnets": { EN: "+ and - in black or green color", JP: '＋またはー、黒または緑' },
        "answer_check_battleship": { EN: "Battleship fleet", JP: '艦隊' },
        "answer_check_tents": { EN: "Tents", JP: 'テント' },
        "answer_check_star battle": { EN: "Stars", JP: '星' },
        "answer_check_akari": { EN: "Light bulbs", JP: '明かり' },
        "answer_check_minesweeper": { EN: "Mines", JP: '地雷' },

        "solution_checker_all": { EN: 'Solution checker looks for ALL of the following:', JP: '以下の全てを正解判定する' },
        "solution_checker_one": { EN: 'Solution checker looks for ONE of the following:', JP: '以下のうち一つを正解判定する' },

        "gmp_unsupported": {
            EN: 'Error - It doesnt support puzzle type $v\n' +
                'Please see instructions (Help) for supported puzzle types\n' +
                'For additional genre support please submit your request to penpaplus@gmail.com',
            JP: 'エラー：対応していないパズル種です。$v\n 対応パズル種についてはヘルプを参照してください。'
        },
        "gmp_enter_type": {
            EN: 'Error - Enter the Puzzle type in Header area\n' +
                'Please see instructions (Help) for supported puzzle types\n',
            JP: 'エラー：ヘッダーにパズル種を入力してください。\n 対応パズル種についてはヘルプを参照してください。\n'
        },

        "box_mode_warning": {
            EN: '<h3 class="info">Last cell cannot be removed using the "Box" mode. For a blank grid use the following approach:</h3><ol><li>Click on "New Grid / Update"</li><li>Set "Gridlines" to "None"</li><li>Set "Gridpoints" to "No"</li><li>Set "Outside frame" to "No"</li><li>Click on "Update display"</li></ol>',
            JP: '<h3 class=info">"マス"モードでは盤面全てのマスの削除はできません。マスの無い盤面は以下のように作成してください。</h3><ol><li>"New Grid / Update"を選択</li><li>"Gridlines"→"None"</li><li>"Gridpoints"→"No"</li><li>"Outside frame"→"No"</li><li>"Update display"を選択</li></ol>"'
        },

        _todo: {}
    },

    modes: {
        EN: ["Surface",
            "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
            "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper", "Edge Erase",
            "Wall",
            "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side",
            "Sudoku Normal", "Sudoku Corner", "Sudoku Centre",
            "Shape",
            "Special", "Thermo", "Sudoku Arrow",
            "Composite"
        ],
        JP: ["黒マス",
            "線 通常", "線 対角線", "線 自由線", "線 中線", "線 補助x",
            "辺 通常", "辺 対角線", "辺 自由線", "辺 補助x", "辺 枠消",
            "壁",
            "数字 通常", "数字 大", "数字 中", "数字 小", "数字 候補", "数字 1/4", "数字 辺",
            "数独 通常", "数独 角", "数独 中央",
            "記号",
            "特殊", "サーモ", "数独 アロー",
            "複合"
        ],
        mapping: ["surface",
            "sub_line1", "sub_line2", "sub_line3", "sub_line5", "sub_line4",
            "sub_lineE1", "sub_lineE2", "sub_lineE3", "sub_lineE4", "sub_lineE5",
            "wall",
            "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9",
            "sub_sudoku1", "sub_sudoku2", "sub_sudoku3",
            "symbol",
            "special", "sub_specialthermo", "sub_specialarrows",
            "combi"
        ]
    },

    vanillaSelect: {
        EN: { "all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All" },
        JP: { "all": "全", "items": "項目", "selectAll": "全てチェック", "clearAll": "全てチェックを外す" }
    }

};