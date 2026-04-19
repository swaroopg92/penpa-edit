function trans_text(button_text, label_text, placeholder) {
    function getText(textObj, key) {
        if (!textObj[key]) return '';
        const entry = textObj[key];
        return entry[UserSettings.app_language] || entry.EN || entry.JP || '';
    }

    for (var key in button_text) {
        let element = document.getElementById(key);
        if (element) {
            const text = getText(button_text, key);
            if (key === 'page_settings') {
                // show text in ZH/JP mode to align the height of the button
                if (UserSettings.app_language !== 'EN') {
                    element.innerHTML = '<i class="fa fa-cog"></i> ' + text;
                } else {
                    element.innerHTML = '<i class="fa fa-cog"></i>';
                }
            } else {
                element.innerHTML = text;
            }
            element.value = text;
        } else {
            console.warn(`Could not find element #${key}`);
        }
    }

    for (var key in label_text) {
        let element = document.getElementById(key);
        if (element) {
            element.innerHTML = getText(label_text, key);
        } else {
            console.warn(`Could not find element #${key}`);
        }
    }

    PenpaText._innerText.forEach(el => {
        const element = document.getElementById(el);
        if (element) element.textContent = PenpaText.get(el);
    });
    PenpaText._placeholder.forEach(el => {
        const element = document.getElementById(el);
        if (element) element.placeholder = PenpaText.get(el);
    });
    document.querySelectorAll('.lb_generic_yes').forEach(el => el.textContent = PenpaText.get('yes'));
    document.querySelectorAll('.lb_generic_no').forEach(el => el.textContent = PenpaText.get('no'));
    document.querySelectorAll('.lb_generic_on').forEach(el => el.textContent = PenpaText.get('on'));
    document.querySelectorAll('.lb_generic_off').forEach(el => el.textContent = PenpaText.get('off'));

    // reset the button texts based on UserSettings
    if (typeof UserSettings !== 'undefined') {
        if (UserSettings._show_solution !== undefined) {
            const visibilityButton = document.getElementById("visibility_button");
            if (visibilityButton) {
                visibilityButton.textContent = PenpaText.get(UserSettings._show_solution ? "on" : "off");
            }
        }
        if (UserSettings._panel_shown !== undefined) {
            const panelButton = document.getElementById("quick_panel_toggle");
            if (panelButton) {
                panelButton.textContent = PenpaText.get(UserSettings._panel_shown ? "on" : "off");
            }
        }
        if (UserSettings._draw_edges !== undefined) {
            const edgeButton = document.getElementById("edge_button");
            if (edgeButton) {
                edgeButton.textContent = PenpaText.get(UserSettings._draw_edges ? "on" : "off");
            }
        }
    }

    for (var key in placeholder) {
        if (document.getElementById(key)) {
            document.getElementById(key).placeholder = getText(placeholder, key);
        } else {
            console.warn(`Could not find element #${key}`);
        }
    }

    if (pu.replay_mode) {
        document.getElementById("title").innerHTML = PenpaText.get('replay_mode');
        document.getElementById("tb_delete").innerHTML = getText({
            tb_delete: {
                JP: "解答消去",
                EN: "Delete",
                ZH: "清除盘面"
            }
        }, "tb_delete");
    } else if (pu.mmode === "solve") {
        document.getElementById("title").innerHTML = PenpaText.get('solver_mode');
        document.getElementById("tb_delete").innerHTML = getText({
            tb_delete: {
                JP: "解答消去",
                EN: "Delete",
                ZH: "清除盘面"
            }
        }, "tb_delete");
    } else {
        document.getElementById("title").innerHTML = PenpaText.get('setter_mode');
        document.getElementById("tb_delete").innerHTML = getText({
            tb_delete: {
                JP: "問題・解答消去",
                EN: "Delete",
                ZH: "清除盘面"
            }
        }, "tb_delete");
    }

    PenpaUI.initPenpaLite();
    set_input_patterns();
}

function trans() {

    var button_text = {
        "newboard": {JP: "新規 / 更新", EN: "New Grid / Update", ZH: "新建 / 更新"},
        "rotation": {JP: "変身", EN: "Transform", ZH: "盘面更改"},
        "newsize": {JP: "サイズ変更", EN: "Resize", ZH: "尺寸更改"},
        "saveimage": {JP: "画像保存", EN: "Screenshot", ZH: "截图"},
        "savetext": {JP: "出力", EN: "Share", ZH: "分享"},
        "duplicate": {JP: "複製", EN: "Clone", ZH: "复制"},
        "edit_bg_image": {JP: "背景を編集", EN: "Edit Background", ZH: "编辑背景"},
        "input_sudoku": {JP: "数独入出力", EN: "I/O Sudoku", ZH: "数独导入/导出"},
        "input_url": {JP: "入力", EN: "Load", ZH: "加载"},
        "page_settings": {JP: "設定", EN: "Settings", ZH: "设置"},
        "tb_undo": {JP: "戻", EN: "Undo", ZH: "撤销"},
        "tb_redo": {JP: "進", EN: "Redo", ZH: "重做"},
        "tb_reset": {JP: "選択消去", EN: "Erase selected mode", ZH: "清除所选模式"},
        "eraseselect_text": {
            JP: "現在選択中のモードの記号を消去",
            EN: "Erase elements that belongs to the selected mode",
            ZH: "清除当前所选类别的所有元素"
        },
        "erase_text": {JP: "問題／解答盤面を消去", EN: "Erase problem or solution grid", ZH: "清除谜题或解答盘面"},
        "closeBtn_nb1": {JP: "作成", EN: "New grid", ZH: "新建盘面"},
        "closeBtn_nb2": {JP: "枠変更", EN: "Change grid", ZH: "更新盘面"},
        "closeBtn_nb3": {JP: "キャンセル", EN: "Cancel", ZH: "取消"},
        "closeBtn_size1": {JP: "枠変更", EN: "Change grid", ZH: "更新盘面"},
        "closeBtn_size2": {JP: "キャンセル", EN: "Cancel", ZH: "取消"},
        "closeBtn_image1": {JP: "別ウィンドウ", EN: "Open in new window", ZH: "在新窗口打开"},
        "closeBtn_image2": {JP: "ダウンロード", EN: "Download", ZH: "下载"},
        "closeBtn_image3": {JP: "キャンセル", EN: "Cancel", ZH: "取消"},
        "rt_center": {JP: "盤面を中央に移動", EN: "Move board to center", ZH: "将盘面移动到窗口中心"},
        "rt_size": {JP: "画面サイズを盤面に合わせる", EN: "Fit window to board", ZH: "将窗口缩放到盘面大小"},
        "rt_reset": {JP: "移動をリセット", EN: "Reset", ZH: "重置"},
        "closeBtn_rotate1": {JP: "閉じる", EN: "Close", ZH: "关闭"},
        "address_edit": {JP: "編集URL", EN: "URL for editing", ZH: "编辑模式链接"},
        "address_solve": {JP: "出題用URL", EN: "URL for solving", ZH: "解答模式链接"},
        "address_comp": {JP: "コンテスト用URL", EN: "Contest-Mode URL", ZH: "竞赛模式链接"},
        "expansion": {JP: "拡張出力", EN: "URL with Answer Check / Advanced Options", ZH: "答案检测链接/高级设置"},
        "closeBtn_save1": {JP: "コピー", EN: "Copy", ZH: "复制"},
        "closeBtn_save2": {JP: "ダウンロード", EN: "Download", ZH: "下载"},
        "closeBtn_save3": {JP: "開く", EN: "Open", ZH: "打开"},
        "closeBtn_save4": {JP: "キャンセル", EN: "Cancel", ZH: "取消"},
        "solution_open": {JP: "解答判定", EN: "Answer descision", ZH: "答案判断"},
        "closeBtn_save5": {
            JP: "解答判定付き出題用アドレスを出力",
            EN: "Generate URL with answer check",
            ZH: "生成带答案检测的链接"
        },
        "closeBtn_save6": {JP: "短縮", EN: "Shorten", ZH: "生成短链"},
        "pp_file": {JP: "pp_fileを出力", EN: "pp_file output", ZH: "输出 pp_file"},
        "load_url": {JP: "URLを入力", EN: "Load URL", ZH: "加载链接"},
        "puzzlerules": {JP: "ルールを表示", EN: "Show rules", ZH: "显示规则"},
        "saveinfogenre": {
            JP: "ジャンル・タグ選択（任意）",
            EN: "Select Genre/Tags (Optional)",
            ZH: "选择类型/标签（可选）"
        },
        "saveinfogenre2": {
            JP: "競合チェック用タグの編集",
            EN: "Edit tags for conflict checker",
            ZH: "编辑冲突检测标签"
        },
        "closeBtn_input1": {JP: "挿入", EN: "Insert", ZH: "插入"},
        "closeBtn_input2": {JP: "消去", EN: "Clear", ZH: "清除"}
    }
    var label_text = {
        "edit_txt": {JP: "編集：", EN: "Edit:", ZH: "模式"},
        "pu_q_label": {JP: "問題", EN: "Problem", ZH: "谜题"},
        "pu_a_label": {JP: "解答", EN: "Solution", ZH: "解答"},
        "edge_button0": {JP: "辺入力：", EN: "Draw on Edges:", ZH: "沿格线放置："},
        "visibility_button0": {JP: "解答表示：", EN: "Visibility:", ZH: "查看解答盘面："},
        "mode_txt": {JP: "モード：", EN: "Mode:", ZH: "类别"},
        "mo_surface_lb": {JP: "黒マス", EN: "Surface", ZH: "涂色"},
        "mo_multicolor_lb": {JP: "マルチカラー", EN: "Multicolor", ZH: "多色"},
        "mo_line_lb": {JP: "線", EN: "Line", ZH: "线"},
        "mo_lineE_lb": {JP: "辺", EN: "Edge", ZH: "边"},
        "mo_wall_lb": {JP: "壁", EN: "Wall", ZH: "墙"},
        "mo_board_lb": {JP: "マス", EN: "Box", ZH: "格子"},
        "mo_move_lb": {JP: "移動", EN: "Move", ZH: "移动"},
        "mode_txt_space": {JP: "　　　　", EN: "　　　", ZH: "　　　　"},
        "mo_number_lb": {JP: "数字", EN: "Number", ZH: "数字"},
        "mo_symbol_lb": {JP: "記号", EN: "Shape", ZH: "形状"},
        "mo_special_lb": {JP: "特殊", EN: "Special", ZH: "特殊"},
        "mo_cage_lb": {JP: "枠", EN: "Cage", ZH: "笼框"},
        "mo_sudoku_lb": {JP: "数独", EN: "Sudoku", ZH: "数独"},
        "mo_combi_lb": {JP: "複合", EN: "Composite", ZH: "复合"},
        "sub_txt": {JP: "サブ：", EN: "Sub:", ZH: "选项"},
        "sub_line1_lb": {JP: "通常", EN: "Normal", ZH: "常规"},
        "sub_line2_lb": {JP: "対角線", EN: "Diagonal", ZH: "对角线"},
        "sub_line3_lb": {JP: "自由線", EN: "Free", ZH: "自由绘制"},
        "sub_line5_lb": {JP: "中線", EN: "Middle", ZH: "中心线"},
        "sub_line4_lb": {JP: "補助×", EN: "Helper_×", ZH: "×标记"},
        "sub_lineE1_lb": {JP: "通常", EN: "Normal", ZH: "常规"},
        "sub_lineE2_lb": {JP: "対角線", EN: "Diagonal", ZH: "对角线"},
        "sub_lineE3_lb": {JP: "自由線", EN: "Free", ZH: "自由绘制"},
        "sub_lineE4_lb": {JP: "補助×", EN: "Helper_×", ZH: "×标记"},
        "sub_lineE5_lb": {JP: "枠消", EN: "Erase", ZH: "清除"},
        "sub_number1_lb": {JP: "通常", EN: "Normal", ZH: "常规"},
        "sub_number2_lb": {JP: "矢印", EN: "Arrow", ZH: "箭头"},
        "sub_number9_lb": {JP: "", EN: "", ZH: ""},
        "sub_number10_lb": {JP: "大", EN: "L", ZH: "大"},
        "sub_number6_lb": {JP: "中", EN: "M", ZH: "中"},
        "sub_number5_lb": {JP: "小", EN: "S", ZH: "小"},
        "sub_number8_lb": {JP: "長文", EN: "Long", ZH: "长文"},
        "sub_number7_lb": {JP: "候補", EN: "Candidates", ZH: "候选数"},
        "sub_cage2_lb": {JP: "自由", EN: "Free", ZH: "自由"},
        "sub_sudoku1_lb": {JP: "通常", EN: "Normal", ZH: "常规"},
        "sub_sudoku2_lb": {JP: "角", EN: "Corner", ZH: "角落"},
        "sub_sudoku3_lb": {JP: "中央", EN: "Centre", ZH: "中央"},
        "ms1": {JP: "図形", EN: "Shape", ZH: "图形"},
        // "ms1_circle": { JP: "円", EN: "&#x26AB; &#x26AA; &#x25CF; &#x25CB;", ZH: "圆形" },
        // "ms1_square": { JP: "正方形", EN: "&#x2B1B; &#x2B1C; &#x25FC; &#x25FB;", ZH: "正方形" },
        // "ms1_triup": { JP: "上三角", EN: "&#x25B2; &#x25B3; &#x25B4; &#x25B5;", ZH: "上正三角形" },
        // "ms1_tridown": { JP: "下三角", EN: "&#x25BC; &#x25BD; &#x25BE; &#x25BF;", ZH: "下正三角形" },
        // "ms1_triright": { JP: "右三角", EN: "&#9655; &#11208; &#9657; &#9656;", ZH: "右正三角形" },
        // "ms1_trileft": { JP: "左三角", EN: "&#9665; &#11207; &#9667; &#9666;", ZH: "左正三角形" },
        // "ms1_diamond": { JP: "ダイヤ", EN: "&#x2B25; &#x2B26; &#x25C6; &#x25C7;", ZH: "菱形" },
        "ms1_hexpoint": {JP: "六角１", EN: "Hexagon point", ZH: "竖直正六边形"},
        "ms1_hexflat": {JP: "六角２", EN: "Hexagon flat", ZH: "水平正六边形"},
        "ms_ox_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_ox_E": {JP: "緑", EN: "Green", ZH: "绿"},
        "ms_ox_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_cross": {JP: "十字", EN: "Cross", ZH: "十字线"},
        "ms_line": {JP: "線", EN: "Line", ZH: "常用线"},
        "ms_frameline": {JP: "斜線", EN: "Cage Lines", ZH: "斜线"},
        "ms1_bars": {JP: "バー", EN: "Bars &#x25AE; &#x25AF;", ZH: "条线"},
        "ms_bars_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_bars_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_bars_W": {JP: "白", EN: "White", ZH: "白"},
        // "ms_tri": { JP: "直角三角形", EN: "Corner triangle", ZH: "直角三角形" },
        "ms2": {JP: "数字", EN: "Number", ZH: "数字"},
        "ms3_math": {JP: "無限・計算", EN: "Math", ZH: "数学"},
        "ms_math": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_math_G": {JP: "緑", EN: "Green", ZH: "绿"},
        // "ms_inequality": { JP: "不等号", EN: "Inequality", ZH: "不等号" },
        "ms_degital_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_degital_E": {JP: "緑", EN: "Green", ZH: "绿"},
        "ms_degital_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_degital_f": {JP: "デジタル(枠)", EN: "Degital Frame", ZH: "数码管框"},
        "ms3": {JP: "矢印", EN: "Arrow", ZH: "箭头"},
        "ms3_arrow_B": {JP: "太", EN: "Fat", ZH: "粗箭头"},
        "ms_arrow_B_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_arrow_B_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_arrow_B_W": {JP: "白", EN: "White", ZH: "白"},
        "ms3_arrow_N": {JP: "細", EN: "Thin", ZH: "细箭头"},
        "ms_arrow_N_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_arrow_N_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_arrow_N_W": {JP: "白", EN: "White", ZH: "白"},
        "ms3_arrow_tri": {JP: "三角形", EN: "Triangle", ZH: "三角箭头"},
        "ms_arrow_tri_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_arrow_tri_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_arrow_tri_W": {JP: "白", EN: "White", ZH: "白"},
        "ms3_arrow_fouredge": {JP: "四辺", EN: "4-edge", ZH: "四边箭头"},
        "ms_arrow_fouredge_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_arrow_fouredge_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_arrow_fouredge_E": {JP: "緑", EN: "Green", ZH: "绿"},
        "ms_arrow_GP": {JP: "通常", EN: "Normal", ZH: "常规"},
        "ms_arrow_GP_C": {JP: "丸付き", EN: "With circle", ZH: "带圆形"},
        "ms_arrow_Short": {JP: "短太", EN: "Short Fat", ZH: "小粗箭头"},
        "ms_arrow_S": {JP: "小", EN: "Small", ZH: "小箭头"},
        "ms_arrow_cross": {JP: "十字", EN: "Cross", ZH: "十字箭头"},
        "ms_arrow_eight": {JP: "八方", EN: "8-way", ZH: "八方向箭头"},
        "ms_arrow_fourtip": {JP: "四端", EN: "Arrow-tips", ZH: "格线提示"},
        "ms4": {JP: "固有1", EN: "Special1", ZH: "特殊1"},
        "ms4_battleship": {JP: "バトルシップ", EN: "Battleship", ZH: "战舰"},
        "ms_battleship_B": {JP: "黒", EN: "Black", ZH: "黑"},
        "ms_battleship_G": {JP: "灰", EN: "Gray", ZH: "灰"},
        "ms_battleship_W": {JP: "白", EN: "White", ZH: "白"},
        "ms_battleship_B+": {JP: "追加黒", EN: "Curvy Black", ZH: "扩展黑"},
        "ms_battleship_G+": {JP: "追加灰", EN: "Curvy Gray", ZH: "扩展灰"},
        "ms_battleship_W+": {JP: "追加白", EN: "Curvy White", ZH: "扩展白"},
        "ms_kakuro": {JP: "カックロ", EN: "Kakuro", ZH: "数和"},
        "ms_compass": {JP: "コンパス", EN: "Compass", ZH: "指南针"},
        "ms_sudokuetc": {JP: "数独特殊記号", EN: "Sudoku variants", ZH: "数独变体"},
        "ms_polyomino": {JP: "ポリオミノ", EN: "Polyominoes", ZH: "小方形"},
        "ms5": {JP: "固有2", EN: "Special2", ZH: "特殊2"},
        "ms_angleloop": {JP: "鋭直鈍ループ", EN: "Angle loop", ZH: "角度回路"},
        "ms_firefly": {JP: "ホタルビーム", EN: "Fireflies", ZH: "萤火虫"},
        "ms_pencils": {JP: "ペンシルズ", EN: "Pencils", ZH: "铅笔"},
        "ms_arc": {JP: "円弧", EN: "Arc", ZH: "圆弧"},
        "sub_specialthermo_lb": {JP: "サーモ", EN: "Thermo", ZH: "温度计"},
        "sub_specialnobulbthermo_lb": {JP: "サーモ（球なし）", EN: "No Bulb Thermo", ZH: "无泡温度计"},
        "sub_specialarrows_lb": {JP: "アロー", EN: "Arrow", ZH: "箭头"},
        "sub_specialdirection_lb": {JP: "矢印", EN: "Move", ZH: "移动箭头"},
        "sub_specialsquareframe_lb": {JP: "四角枠", EN: "Rec.frame", ZH: "矩形选区"},
        "sub_specialpolygon_lb": {JP: "多角形", EN: "Polygon", ZH: "多边形"},
        "sub_move1_lb": {JP: "全", EN: "All", ZH: "全部"},
        "sub_move2_lb": {JP: "数字", EN: "Number", ZH: "数字"},
        "sub_move3_lb": {JP: "記号", EN: "Shapes", ZH: "形状"},
        "subc1": {JP: "塗り", EN: "Paint", ZH: "涂黑类"},
        "combisub_blpo": {JP: "黒・点", EN: "Black/Dot", ZH: "涂黑/留白"},
        "combisub_blwh": {JP: "白丸黒丸", EN: "Ying-Yang", ZH: "阴阳圆圈"},
        "combisub_shaka": {JP: "シャカシャカ", EN: "Shakashaka", ZH: "摇啊摇"},
        "subc2": {JP: "ループ", EN: "Loop", ZH: "回路"},
        "combisub_linex": {JP: "線・×", EN: "Line ×", ZH: "线、×标记"},
        "combisub_lineox": {JP: "線・OX", EN: "Line OX", ZH: "线、OX标记"},
        "combisub_edgexoi": {JP: "辺・x・内外", EN: "Edge IO", ZH: "边、内外"},
        "combisub_yajilin": {JP: "ヤジリン", EN: "Yajilin", ZH: "仙人指路"},
        "combisub_hashi": {JP: "橋をかけろ", EN: "Hashi", ZH: "数桥"},
        "subc3": {JP: "領域", EN: "Area", ZH: "分区"},
        "combisub_edgesub": {JP: "辺・補助線", EN: "Edge/Aux Line", ZH: "边、辅助线"},
        "subc4": {JP: "物体", EN: "Object", ZH: "置物"},
        "combisub_battleship": {JP: "バトルシップ", EN: "Battleship", ZH: "战舰"},
        "combisub_star": {JP: "スターバトル", EN: "Star Battle", ZH: "星战"},
        "combisub_tents": {JP: "テント", EN: "Tents", ZH: "帐篷"},
        "combisub_magnets": {JP: "マグネット", EN: "Magnets", ZH: "磁铁"},
        "combisub_arrowS": {JP: "矢印フリック", EN: "Arrow flick", ZH: "箭头滑动输入"},
        "subc5": {JP: "数字埋", EN: "Number", ZH: "填数"},
        "combisub_numfl": {JP: "数字フリック", EN: "Number flick", ZH: "数字滑动输入"},
        "combisub_alfl": {JP: "英字フリック", EN: "Alphabet flick", ZH: "字母滑动输入"},
        "style_txt": {JP: "スタイル", EN: "Style:", ZH: "样式"},
        "style_txt_rot": {JP: "スタイル", EN: "Style:", ZH: "样式"},
        "st_surface1_lb": {JP: "濃灰", EN: "DG", ZH: "深灰"},
        "st_surface8_lb": {JP: "隠灰", EN: "GR", ZH: "浅灰"},
        "st_surface3_lb": {JP: "薄灰", EN: "LG", ZH: "亮灰"},
        "st_surface4_lb": {JP: "黒", EN: "BL", ZH: "黑"},
        "st_surface2_lb": {JP: "緑", EN: "GR", ZH: "绿"},
        "st_surface5_lb": {JP: "水", EN: "BL", ZH: "蓝"},
        "st_surface6_lb": {JP: "赤", EN: "RE", ZH: "红"},
        "st_surface7_lb": {JP: "黄", EN: "YE", ZH: "黄"},
        "st_surface9_lb": {JP: "桃", EN: "PI", ZH: "粉"},
        "st_surface10_lb": {JP: "橙", EN: "OR", ZH: "橙"},
        "st_surface11_lb": {JP: "紫", EN: "PU", ZH: "紫"},
        "st_surface12_lb": {JP: "茶", EN: "BR", ZH: "棕"},
        "st_line3_lb": {JP: "緑", EN: "G", ZH: "绿"},
        "st_line80_lb": {JP: "細", EN: "Thin", ZH: "细线"},
        "st_line2_lb": {JP: "太", EN: "B", ZH: "黑"},
        "st_line12_lb": {JP: "点", EN: "Dotted", ZH: "虚线"},
        "st_line13_lb": {JP: "太点", EN: "Fat Dots", ZH: "粗虚线"},
        "st_line5_lb": {JP: "灰", EN: "G", ZH: "灰"},
        "st_line8_lb": {JP: "赤", EN: "R", ZH: "红"},
        "st_line9_lb": {JP: "青", EN: "B", ZH: "青"},
        "st_line40_lb": {JP: "短", EN: "Short", ZH: "短线"},
        "st_line30_lb": {JP: "二重", EN: "Double", ZH: "双线"},
        "st_lineE3_lb": {JP: "緑", EN: "G", ZH: "绿"},
        "st_lineE80_lb": {JP: "細", EN: "Thin", ZH: "细线"},
        "st_lineE2_lb": {JP: "太", EN: "B", ZH: "黑"},
        "st_lineE12_lb": {JP: "点", EN: "Dotted", ZH: "虚线"},
        "st_lineE13_lb": {JP: "太点", EN: "Fat Dots", ZH: "粗虚线"},
        "st_lineE5_lb": {JP: "灰", EN: "G", ZH: "灰"},
        "st_lineE8_lb": {JP: "赤", EN: "R", ZH: "红"},
        "st_lineE9_lb": {JP: "青", EN: "B", ZH: "青"},
        "st_lineE21_lb": {JP: "極太", EN: "Thicker", ZH: "粗线"},
        "st_lineE30_lb": {JP: "二重", EN: "Double", ZH: "双线"},
        "st_wall3_lb": {JP: "緑", EN: "G", ZH: "绿"},
        "st_wall1_lb": {JP: "細", EN: "Thin", ZH: "细线"},
        "st_wall2_lb": {JP: "太", EN: "B", ZH: "黑"},
        "st_wall12_lb": {JP: "点", EN: "Dotted", ZH: "虚线"},
        "st_wall17_lb": {JP: "太点", EN: "Fat Dots", ZH: "粗虚线"},
        "st_wall14_lb": {JP: "灰点", EN: "Gray Dot", ZH: "灰虚线"},
        "st_wall5_lb": {JP: "灰", EN: "G", ZH: "灰"},
        "st_wall8_lb": {JP: "赤", EN: "R", ZH: "红"},
        "st_wall9_lb": {JP: "青", EN: "B", ZH: "青"},
        "st_number1_lb": {JP: "黒", EN: "B", ZH: "黑"},
        "st_number2_lb": {JP: "緑", EN: "G", ZH: "绿"},
        "st_number8_lb": {JP: "水", EN: "B", ZH: "蓝"},
        "st_number3_lb": {JP: "灰", EN: "G", ZH: "灰"},
        "st_number9_lb": {JP: "青", EN: "B", ZH: "青"},
        "st_number10_lb": {JP: "赤", EN: "R", ZH: "红"},
        "st_number4_lb": {JP: "白", EN: "White", ZH: "白"},
        "st_number5_lb": {JP: "白背景", EN: "WhiteBG", ZH: "白背景"},
        "st_sudoku1_lb": {JP: "黒", EN: "B", ZH: "黑"},
        "st_sudoku2_lb": {JP: "緑", EN: "G", ZH: "绿"},
        "st_sudoku8_lb": {JP: "水", EN: "B", ZH: "蓝"},
        "st_sudoku3_lb": {JP: "灰", EN: "G", ZH: "灰"},
        "st_sudoku9_lb": {JP: "青", EN: "B", ZH: "青"},
        "st_sudoku10_lb": {JP: "赤", EN: "R", ZH: "红"},
        "st_symbol1_lb": {JP: "線-奥", EN: "Behind lines", ZH: "显示在线后"},
        "st_symbol2_lb": {JP: "線-前", EN: "In front of lines", ZH: "显示在线前"},
        "panel_buttons0": {JP: "選択中：", EN: "Selection:", ZH: "当前选择："},
        "panel_buttonc0": {JP: "選択中：", EN: "Selection:", ZH: "当前选择："},
        "st_cage10_lb": {JP: "点線", EN: "Dot", ZH: "虚线"},
        "st_cage7_lb": {JP: "灰線", EN: "Gray", ZH: "灰线"},
        "st_cage15_lb": {JP: "灰点", EN: "GrayDot", ZH: "灰虚线"},
        "st_cage16_lb": {JP: "実線", EN: "Black", ZH: "黑线"},
        "sw_start": {JP: "スタート", EN: "Start", ZH: "开始"},
        "sw_pause": {JP: "ポーズ", EN: "Pause", ZH: "暂停"},
        "sw_stop": {JP: "ストップ", EN: "Stop", ZH: "停止"},
        "sw_reset": {JP: "リセット", EN: "Reset", ZH: "重置"},
        "sw_hide": {JP: "隠す", EN: "Hide", ZH: "隐藏"},
        "modal_lb": {JP: "新規作成", EN: "New Grid", ZH: "新建盘面"},
        "nb_gridtype_lb": {JP: "盤面：", EN: "Board type:", ZH: "盘面类型："},
        "nb_gridtype1_lb": {JP: "正方形", EN: "Square", ZH: "正方形"},
        "nb_gridtype2_lb": {JP: "正六角形", EN: "Hexagon", ZH: "正六边形"},
        "nb_gridtype3_lb": {JP: "正三角形", EN: "Triangle", ZH: "正三角形"},
        "nb_gridtype4_lb": {JP: "ピラミッド", EN: "Pyramid", ZH: "金字塔"},
        "nb_gridtype5_lb": {JP: "立方体", EN: "Cube", ZH: "立方体"},
        "nb_gridtype6_lb": {JP: "数独", EN: "Sudoku", ZH: "数独"},
        "nb_gridtype7_lb": {JP: "カックロ", EN: "Kakuro", ZH: "数和"},
        "nb_size_lb": {JP: "サイズ：", EN: "Size:", ZH: "尺寸："},
        "name_size1": {JP: "ヨコ：", EN: "Columns:", ZH: "列数："},
        "name_size2": {JP: "タテ：", EN: "Rows:", ZH: "行数："},
        "nb_space_lb": {JP: "余白：", EN: "White space:", ZH: "留白："},
        "nb_display_lb": {JP: "表示サイズ：", EN: "Display size:", ZH: "显示大小："},
        "nb_sudoku1_lb": {JP: "対角線 &#x27CD;", EN: "Diagonal &#x27CD;", ZH: "主对角线 &#x27CD;"},
        "nb_sudoku4_lb": {JP: "対角線 &#x27CB;", EN: "Diagonal &#x27CB;", ZH: "副对角线 &#x27CB;"},
        "nb_sudoku2_lb": {JP: "外周ヒント", EN: "Outside clues", ZH: "外提示数"},
        "nb_sudoku3_lb": {JP: "外周ヒント(上左)", EN: "Outside clues (top/left)", ZH: "外提示数（左上）"},
        "nb_penrose1_lb": {JP: "回転非対称性", EN: "Rotational asymmetry", ZH: "旋转不对称性"},
        "nb_sudoku8_lb": {JP: "サイズ 4x4", EN: "Size 4x4", ZH: "四宫数独"},
        "nb_sudoku5_lb": {JP: "サイズ 6x6", EN: "Size 6x6", ZH: "六宫数独"},
        "nb_sudoku6_lb": {JP: "サイズ 8x8", EN: "Size 8x8", ZH: "八宫数独"},
        "nb_penrose2_lb": {JP: "タイリングシード", EN: "Tiling Seed", ZH: "填充种子"},
        "name_space1": {JP: "上：", EN: "Over:", ZH: "上："},
        "name_space2": {JP: "下：", EN: "Under:", ZH: "下："},
        "name_space3": {JP: "左：", EN: "Left:", ZH: "左："},
        "name_space4": {JP: "右：", EN: "Right:", ZH: "右："},
        "nb_note": {
            JP: "枠変更では以下の値のみ更新されます",
            EN: "Only bellow will be updated when you change grid.",
            ZH: "更新盘面时只有以下选项生效"
        },
        "nb_grid_lb": {JP: "グリッド：", EN: "Grid:", ZH: "格线："},
        "nb_grid1_lb": {JP: "実線", EN: "Solid", ZH: "实线"},
        "nb_grid2_lb": {JP: "点線", EN: "Dotted", ZH: "虚线"},
        "nb_grid3_lb": {JP: "なし", EN: "None", ZH: "无"},
        "nb_lat_lb": {JP: "　格子点：", EN: "Gridpoints:", ZH: "格点："},
        "nb_lat1_lb": {JP: "あり", EN: "Yes", ZH: "有"},
        "nb_lat2_lb": {JP: "なし", EN: "No", ZH: "无"},
        "nb_out_lb": {JP: "　　外枠：", EN: "Outside frame:", ZH: "外框"},
        "nb_out1_lb": {JP: "あり", EN: "Yes", ZH: "有"},
        "nb_out2_lb": {JP: "なし", EN: "No", ZH: "无"},
        "modal-newsize_lb": {JP: "　サイズ変更", EN: "Change Size", ZH: "更改大小"},
        "modal-newsize_size_lb": {JP: "表示サイズ：", EN: "Display size:", ZH: "显示大小："},
        "saveimagetitle": {JP: "画像保存", EN: "Save screenshot", ZH: "保存截图"},
        "nb_margin_lb": {JP: "　余白：", EN: "White border:", ZH: "留白："},
        "nb_margin1_lb": {JP: "あり", EN: "Yes", ZH: "有"},
        "nb_margin2_lb": {JP: "なし", EN: "No", ZH: "无"},
        "nb_quality_lb": {JP: "　画質：", EN: "Image quality:", ZH: "画质："},
        "nb_quality1_lb": {JP: "高", EN: "High", ZH: "高"},
        "nb_quality2_lb": {JP: "低", EN: "Low", ZH: "低"},
        "nb_type_lb": {JP: "拡張子：", EN: "File type:", ZH: "格式："},
        "savetexttitle": {JP: "回転・移動・追加・削除", EN: "Rotate / Move / Add / Remove", ZH: "旋转/移动/增加/减少"},
        "rt1_lb": {JP: "　回転：", EN: "Rotate:", ZH: "旋转："},
        "rt2_lb": {JP: "　反転：", EN: "Flip:", ZH: "翻转："},
        "rt3_lb": {JP: "　移動：", EN: "Move:", ZH: "移动："},
        "rt4_lb": {JP: "行・列の追加・削除", EN: "Add/Remove Rows/Columns:", ZH: "增加/减少行列"},
        "rt5_lb": {
            JP: "正方形盤面でのみ動作。履歴は削除されます。",
            EN: "*Works only in Square Board Type, it also resets undo/redo. Answer checking if enabled, will only work with original grid size.",
            ZH: "仅在正方形盘面生效，同时会重置历史操作。答案检测仅在原始盘面尺寸生效。"
        },
        "rt6_lb": {JP: "現在の盤面", EN: "Existing Grid", ZH: "当前盘面"},
        "rt6_lb_r": {JP: "現在の盤面", EN: "Existing Grid", ZH: "当前盘面"},
        "savetitle": {JP: "パズル出力", EN: "Share Puzzle", ZH: "分享谜题"},
        "saveinfo_lb": {JP: "パズルインフォメーション", EN: "Puzzle Information", ZH: "谜题信息"},
        "save1_lb": {JP: "タイトル：", EN: "Title:", ZH: "标题："},
        "save2_lb": {JP: "作者：", EN: "Author:", ZH: "作者："},
        "save3_lb": {JP: "ルール：", EN: "Rules:", ZH: "规则："},
        "source_lb": {JP: "ソース：", EN: "Source:", ZH: "原链接："},
        "sourcewarning": {
            JP: "自身が作者でない場合はソースを記入してください",
            EN: "* If you are not the author of the puzzle, please specify the source URL",
            ZH: "如果你不是该谜题的作者，请在此输入原链接"
        },
        "generate_lb": {JP: "URL出力", EN: "Generate URL", ZH: "生成链接"},
        "save_undo_lb": {JP: "履歴の保存", EN: "Save Undo/Redo (History)", ZH: "保存历史操作"},
        "auto_shorten_chk_lb": {
            JP: "TinyURLでURLを短縮",
            EN: "Automatically Shorten with TinyURL",
            ZH: "自动使用TinyURL缩短链接"
        },
        "filename_lb": {JP: "ファイル名：", EN: "File name:", ZH: "文件名："},
        "extend_lb": {JP: "拡張出力", EN: "Extended Output", ZH: "输出扩展"},
        "save3texttitle": {
            JP: "以下の記号を判定：",
            EN: "Solution will check only following:",
            ZH: "答案检测仅检测以下内容："
        },
        // "answerwarning": { JP: "チェックがない場合全てを判定。一部の記号のみ判定したい場合ANDかORの列を選択してください。ANDが優先されます。", EN: "*Default (none selected) it checks for all. Choose either AND or OR column, if both are selected, AND will be given preference.", ZH: "*默认检查全部。如需仅检查部分标记，请选择AND或OR列，两者都选择时优先AND。" },
        "sol_surface_lb": {
            JP: "黒マス：濃灰・隠灰・薄灰・黒",
            EN: "Shading - DG (Dark Grey), GR, LG, BL (Black):",
            ZH: "涂黑：深灰/浅灰/亮灰/黑色"
        },
        "sol_number_lb": {
            JP: "数字：通常・大・中・小：緑・青・赤<br>数独：通常・中央：緑・青・赤",
            EN: "Number - Normal, L, M, S - Green, Blue, Red <br> Sudoku - Normal, Centre - Green, Blue, Red:",
            ZH: "数字：大/中/小、红/绿/蓝<br>数独：大/中/小、红/绿/蓝"
        },
        "sol_loopline_lb": {JP: "線：緑・二重", EN: "Line - Green, Double:", ZH: "线：绿、单双"},
        "sol_ignoreloopline_lb": {
            JP: "線：問題と重なった線を無視",
            EN: "Line - Ignore Given Line Segments:",
            ZH: "线：无视已给出"
        },
        "sol_loopedge_lb": {JP: "辺：緑・二重", EN: "Edge - Green, Double:", ZH: "边：绿、单双"},
        "sol_ignoreborder_lb": {
            JP: "辺：問題・外枠と重なった線を無視",
            EN: "Edge - Ignore Edges on Grid Border / Givens:",
            ZH: "边：无视已给出/盘面边界"
        },
        "sol_wall_lb": {JP: "壁：緑", EN: "Wall - Green:", ZH: "墙：绿"},
        "sol_square_lb": {
            JP: "記号-図形-正方形-XL-2",
            EN: "Shape - Shape - Square - XL size - Option 2:",
            ZH: "形状：图形-正方形-XL-2"
        },
        "sol_circle_lb": {
            JP: "記号-図形-円-M-1,2",
            EN: "Shape - Shape - Circle - M size - Options 1 & 2:",
            ZH: "形状：图形-圆形-M-1,2"
        },
        "sol_tri_lb": {
            JP: "記号-図形-直角三角形-1,2,3,4",
            EN: "Shape - Shape - Corner triangle - Options 1 to 4:",
            ZH: "形状：图形-直角三角形-1,2,3,4"
        },
        "sol_arrow_lb": {JP: "記号-矢印-小-1~8", EN: "Shape - Arrow - Small - Options 1 to 8:", ZH: "形状：箭头-小箭头"},
        "sol_math_lb": {
            JP: "記号-数字-無限・計算-黒・緑-2,3(+-)",
            EN: "Shape - Number - Math - Black, Green - Options 2 & 3:",
            ZH: "形状：数字-数学-黑/绿-2,3(+-)"
        },
        "sol_battleship_lb": {
            JP: "記号-固有1-バトルシップ-黒-1~6<br>追加黒-1~4",
            EN: "Shape - Special 1 - Battleship - Black - Options 1 to 6 <br> and Curvy Black - Options 1 to 4:",
            ZH: "形状：特殊1-战舰-黑、追加黑"
        },
        "sol_tent_lb": {JP: "記号-固有1-テント-2", EN: "Shape - Special 1 - Tent - Option 2:", ZH: "形状：特殊1-帐篷-2"},
        "sol_star_lb": {
            JP: "記号-固有1-スター-1,2,3",
            EN: "Shape - Special 1 - Star - Options 1 to 3:",
            ZH: "形状：特殊1-星-1,2,3"
        },
        "sol_akari_lb": {
            JP: "記号-固有2-美術館-3",
            EN: "Shape - Special 2 - Lightbulb - Option 3:",
            ZH: "形状：特殊2-灯泡-3"
        },
        "sol_mine_lb": {
            JP: "記号-固有2-マインスイーパー-4,5",
            EN: "Shape - Special 2 - Minesweeper - Option 4 & 5:",
            ZH: "形状：特殊2-扫雷-4,5"
        },
        "save5texttitle": {JP: "ヘッダー", EN: "header", ZH: "头文件"},
        "custom_lb": {JP: "カスタムメッセージ", EN: "Custom Message", ZH: "自定义信息"},
        "save6texttitle": {JP: "URL入力", EN: "Load URL", ZH: "载入链接"},
        "quick_panel_toggle_label": {JP: "パネル：", EN: "Panel:", ZH: "浮窗面板："},
        "bg_image_url_lb": {JP: "画像URL：", EN: "Image URL:", ZH: "图像链接："},
        "bg_image_x_lb": {JP: "X位置：", EN: "X position:", ZH: "X偏移："},
        "bg_image_y_lb": {JP: "Y位置：", EN: "Y position:", ZH: "Y偏移："},
        "bg_image_width_lb": {JP: "幅：", EN: "Width:", ZH: "宽度："},
        "bg_image_height_lb": {JP: "高さ：", EN: "Height:", ZH: "高度："},
        "bg_image_opacity_lb": {JP: "不透明度：", EN: "Opacity:", ZH: "不透明度："},
        "bg_image_foreground_lb": {JP: "前景に描画：", EN: "Draw in foreground:", ZH: "在前景显示："},
        "bg_image_mask_white_lb": {
            JP: "画像から白をマスク：",
            EN: "Mask out white from image:",
            ZH: "自动遮罩图像白色："
        },
        "bg_image_threshold_lb": {JP: "白マスクのしきい値：", EN: "White mask threshold:", ZH: "白色遮罩阈值："}
    }

    var placeholder = {
        "saveinfotitle": {
            JP: "例：サーモ数独、ヤジリン",
            EN: "e.g. Thermo Sudoku or Yajilin",
            ZH: "例：温度计数独 或 仙人指路"
        },
        "saveinfoauthor": {JP: "作者名", EN: "Puzzle creator name", ZH: "作者名"},
        "saveinforules": {JP: "例：クラシック数独のルール", EN: "e.g. Classic sudoku rules.", ZH: "例：标准数独规则"},
        "custom_message": {
            JP: "正解時に出るカスタムメッセージ",
            EN: "Custom Congratulation Message on answer check pop up",
            ZH: "答案检测正确时庆祝弹窗内容："
        },
    }
    trans_text(button_text, label_text, placeholder);
}

const PenpaText = {
    get(key, variable) {
        const entry = this.dictionary[key] || {};
        let returnText = entry[UserSettings.app_language] || entry.EN || '';

        if (!variable) {
            return returnText;
        }

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
        'lb_settings_textoutline',
        'lb_settings_pencil_marks',
        'lb_settings_lineanycolor',
        'lb_settings_auto_save_history',
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
        contest_mode: {EN: 'Contest Mode', JP: 'コンテストモード', ZH: '竞赛模式'},
        replay_mode: {EN: 'Replay Mode', JP: 'リプレイモード', ZH: '回放模式'},
        setter_mode: {EN: 'Setter Mode', JP: '編集モード', ZH: '编辑模式'},
        setter_mode_while_solving: {
            EN: 'Setter Mode (while Solving)',
            JP: '編集モード（解答中）',
            ZH: '编辑模式（解答中）'
        },
        solver_mode: {EN: 'Solver Mode', JP: '解答モード', ZH: '解答模式'},
        solver_mode_answer: {
            EN: 'Solver Mode (Answer Checking Enabled)',
            JP: '解答モード（正解判定あり）',
            ZH: '解答模式（含答案检测）'
        },

        // Grid Setup
        columns: {JP: "ヨコ：", EN: "Columns:", ZH: '列：'},
        rows: {JP: "タテ：", EN: "Rows:", ZH: '行'},
        side: {EN: "Side:", JP: '幅：', ZH: '尺寸'},
        sides: {EN: "Sides:", JP: '横：', ZH: '尺寸'},
        over: {EN: "Over:", JP: '上：', ZH: '超过'},
        border: {EN: "Border:", JP: '境界：', ZH: '边界'},
        order: {EN: "Order:", JP: '注文', ZH: '阶数'},
        cut_corners: {EN: "Cut corners:", JP: '手抜きをする', ZH: '偷工减料'},

        nb_gridtype8_lb: {EN: 'Tetrakis square', JP: 'テトラキス正方形', ZH: '四分正方形'},
        nb_gridtype9_lb: {EN: 'Truncated square', JP: '切頂四角形', ZH: '截角正方形'},
        nb_gridtype10_lb: {EN: 'Snub square', JP: 'スナブ正方形', ZH: '扭方体'},
        nb_gridtype11_lb: {EN: 'Cairo pentagonal', JP: 'カイロ五角形', ZH: '开罗五边形'},
        nb_gridtype12_lb: {EN: 'Rhombitrihexagonal', JP: '菱三六角形', ZH: '菱三六边形'},
        nb_gridtype13_lb: {EN: 'Deltoidal trihexagonal', JP: '凧形三六角形', ZH: '三角六角形'},
        nb_gridtype14_lb: {EN: 'Penrose P3', JP: 'ペンローズ P3', ZH: '彭罗斯 P3'},

        // Generic Terms
        on: {EN: "ON", JP: "オン", ZH: '开'},
        off: {EN: "OFF", JP: "オフ", ZH: '关'},
        yes: {EN: "Yes", JP: 'はい', ZH: '是'},
        no: {EN: "No", JP: 'いいえ', ZH: '否'},
        rules_generic: {EN: "Rules:", JP: 'ルール：', ZH: '规则：'},
        close: {EN: 'Close', JP: '閉じる', ZH: '关闭'},
        show: {EN: 'Show', JP: '表示', ZH: '显示'},
        hide: {EN: 'Hide', JP: '隠す', ZH: '隐藏'},
        ok: {EN: 'OK', JP: '', ZH: '确认'},
        cancel: {EN: 'Cancel', JP: 'キャンセル', ZH: '取消'},
        pause_message: {
            JP: "ポーズ中\n\"スタート\"をクリック\nまたは\"F4\"",
            EN: "Paused\nClick on \"Start\"\nor \"F4\"",
            ZH: "已暂停\n点击\"开始\"\n或按\"F4\""
        },

        // Export Image
        nb_rules_lb: {JP: "ルール：", EN: "Rules:", ZH: '规则：'},
        nb_title_lb: {EN: "Title & Author:", JP: 'タイトルと作者：', ZH: '标题、作者：'},
        nb_title1_lb: {EN: "Yes", JP: 'はい', ZH: '有'},
        nb_title2_lb: {EN: "No", JP: 'いいえ', ZH: '无'},
        nb_rules1_lb: {EN: "Yes", JP: 'はい', ZH: '有'},
        nb_rules2_lb: {EN: "No", JP: 'いいえ', ZH: '无'},
        saveimagename: {EN: 'sample_name', JP: '', ZH: '未命名'},

        // Main UI
        page_help: {EN: 'Help', JP: 'ヘルプ', ZH: '帮助'},
        constraints: {EN: 'Constraints (Beta)', JP: '専用モード', ZH: '专用模式'},

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

        search_area: {EN: 'Search Area', JP: '検索範囲', ZH: '搜索范围'},
        live_replay_na: {EN: 'Live Replay N/A', JP: '解答履歴(Live Replay) N/A', ZH: '实时回放不适用'},
        live_replay: {EN: 'Live Replay', JP: '解答履歴(Live Replay)', ZH: '实时回放'},
        solve_path: {EN: 'Solve Path', JP: '想定解法(Solve Path)', ZH: '解题步骤'},

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
        settings_modal_header: {EN: 'General Settings', JP: '一般設定', ZH: '常规设置'},
        lb_settings_app_display: {EN: 'App Display', JP: '画面表示', ZH: '画面显示'},
        lb_settings_display_theme: {EN: 'Display Theme:', JP: '明るさ', ZH: '界面主题'},
        lb_settings_display_theme_light: {EN: 'Light', JP: 'ライト', ZH: '亮色'},
        lb_settings_display_theme_dark: {EN: 'Dark', JP: 'ダーク', ZH: '暗色'},
        lb_settings_display_layout: {EN: 'Display Layout:', JP: 'レイアウト', ZH: '界面排布'},
        lb_settings_display_layout_classic: {EN: 'Classic', JP: '通常', ZH: '经典'},
        lb_settings_display_layout_flex_left: {
            EN: 'Flex (Tools Left)',
            JP: '可動（ツールバー左）',
            ZH: '可动（左侧工具栏）'
        },
        lb_settings_display_layout_flex_right: {
            EN: 'Flex (Tools Right)',
            JP: '可動（ツールバー右）',
            ZH: '可动（右侧工具栏）'
        },
        lb_settings_display_layout_streaming1: {EN: 'Streaming 1 (beta)', JP: '配信（ベータ版）', ZH: '直播（测试版）'},
        lb_settings_timer: {EN: 'Timer:', JP: 'タイマー', ZH: '计时器'},
        lb_settings_timer_show: {EN: 'Show', JP: '表示', ZH: '显示'},
        lb_settings_timer_hide: {EN: 'Hide', JP: '隠す', ZH: '隐藏'},
        lb_settings_puzzle_display: {EN: 'Puzzle Display', JP: '盤面表示', ZH: '盘面显示'},
        lb_settings_sudoku_marks: {EN: 'Sudoku Pencil Marks:', JP: '[数独]補助数字', ZH: '数独辅助标记'},
        lb_settings_sudoku_marks_dynamic: {EN: 'Dynamic', JP: '縦幅可変', ZH: '动态高度'},
        lb_settings_sudoku_marks_large: {EN: 'Large', JP: '縦幅大', ZH: '较大高度'},
        lb_settings_sudoku_marks_small: {EN: 'Small', JP: '縦幅小', ZH: '较小高度'},
        lb_settings_sudoku_normal: {EN: 'Sudoku Normal:', JP: '[数独]通常', ZH: '数独常规数字'},
        lb_settings_sudoku_normal_centered: {EN: 'Centered', JP: '中央', ZH: '居中'},
        lb_settings_sudoku_normal_bottom: {EN: 'Bottom', JP: '下', ZH: '靠下'},
        lb_settings_starbattle_dots: {EN: 'Star Battle Dots:', JP: 'スターバトルの点記号', ZH: '星战点记号'},
        lb_settings_starbattle_dots_high_range: {EN: 'High Range', JP: '入力しやすい', ZH: '输入范围较大'},
        lb_settings_starbattle_dots_low_range: {EN: 'Low Range', JP: '入力しにくい', ZH: '输入范围较小'},
        lb_settings_starbattle_dots_disable: {EN: 'Disable', JP: 'オフ', ZH: '关闭输入'},
        lb_settings_surface_second: {EN: 'Surface Second Color:', JP: 'マスの補助色', ZH: '涂色副选色'},
        lb_settings_surface_second_dark: {EN: 'Dark Grey', JP: '濃灰', ZH: '深灰'},
        lb_settings_surface_second_grey: {EN: 'Grey', JP: '灰', ZH: '浅灰'},
        lb_settings_surface_second_light: {EN: 'Light Grey', JP: '薄灰', ZH: '亮灰'},
        lb_settings_surface_second_black: {EN: 'Black', JP: '黒', ZH: '黑'},
        lb_settings_surface_second_green: {EN: 'Green', JP: '緑', ZH: '绿'},
        lb_settings_surface_second_blue: {EN: 'Blue', JP: '青', ZH: '蓝'},
        lb_settings_surface_second_red: {EN: 'Red', JP: '赤', ZH: '红'},
        lb_settings_surface_second_yellow: {EN: 'Yellow', JP: '黄', ZH: '黄'},
        lb_settings_surface_second_pink: {EN: 'Pink', JP: '桃', ZH: '粉'},
        lb_settings_surface_second_orange: {EN: 'Orange', JP: '橙', ZH: '橙'},
        lb_settings_surface_second_purple: {EN: 'Purple', JP: '紫', ZH: '紫'},
        lb_settings_surface_second_brown: {EN: 'Brown', JP: '茶', ZH: '棕'},
        lb_settings_tools: {EN: 'Tools', JP: '機能', ZH: '工具'},
        lb_settings_custom_colors: {EN: 'Custom Colors (Beta):', JP: '色の設定', ZH: '自定义颜色'},
        lb_settings_floating_panel: {EN: 'Floating Panel:', JP: 'パネル', ZH: '浮窗面板'},
        lb_settings_quick_panel: {EN: 'Quick Panel Button', JP: 'パネル切り替えボタン', ZH: '浮窗面板启用按钮'},
        lb_settings_export: {EN: 'Export', JP: '出力', ZH: '导出'},
        lb_settings_auto_shorten: {EN: 'Auto-Shorten Links', JP: '自動でURLを短縮する', ZH: '自动使用短链接'},
        lb_settings_input_options: {EN: 'Input Options', JP: '入力設定', ZH: '输入选项'},
        lb_settings_mouse_middle: {EN: 'Mouse Middle Button:', JP: 'マウスホイール', ZH: '鼠标中键'},
        lb_settings_reload: {EN: 'Reload Protection:', JP: 'リロード時に警告', ZH: '刷新警告'},
        lb_settings_conflict: {EN: 'Conflict Detection:', JP: '不一致の検出', ZH: '冲突检测'},
        lb_settings_conflict_off_this: {EN: 'OFF (this puzzle)', JP: 'OFF（このパズル）', ZH: '关闭（仅该谜题）'},
        lb_settings_conflict_off_all: {EN: 'OFF (all puzzles)', JP: 'OFF（全てのパズル）', ZH: '关闭（全部谜题）'},
        lb_settings_sudoku_keys: {
            EN: 'Sudoku Z/Y & XCV Keys:',
            JP: '数独のショートカットキ (Z/Y & XCV)',
            ZH: '数独快捷键（Z/Y & XCV）'
        },
        lb_settings_textoutline: {EN: 'Outline on Text:', JP: 'テキストのアウトライン', ZH: '文字描边：'},
        lb_settings_pencil_marks: {EN: 'Check pencil marks:', JP: '候補数字をチェック', ZH: '检测候选数字：'},
        lb_settings_lineanycolor: {
            EN: 'Any color can match green line/edge in solution:',
            JP: 'どの色も解答の緑線/辺と一致する',
            ZH: '任意颜色可与解答中绿色线/边匹配：'
        },
        lb_settings_auto_save_history: {
            EN: 'Auto-save puzzle in browser history:',
            JP: 'ブラウザの履歴にパズルを自動保存',
            ZH: '在浏览器历史中自动保存谜题：'
        },
        lb_settings_storage: {EN: 'Saving/Storage', JP: '保存', ZH: '存储'},
        lb_settings_saved_settings: {EN: 'Saved Settings:', JP: '保存した設定', ZH: '保存设置'},
        clear_settings: {EN: 'Clear cookies', JP: 'クッキーをクリアする', ZH: '清除缓存'},
        lb_settings_local_storage: {EN: 'Local Storage:', JP: 'ローカルストレージ', ZH: '本地存储'},
        clear_storage_one: {EN: 'Clear this puzzle', JP: 'この盤面の履歴を消去する', ZH: '清除该谜题'},
        clear_storage_all: {EN: 'Clear all', JP: '全ての履歴を消去する', ZH: '清除所有'},
        local_storage_browser_message: {
            EN: "Your browser has disabled or doesn't support local storage.",
            JP: "このブラウザはローカルストレージが無効になっているか、対応していません。",
            ZH: '您的浏览器不支持本地存储。'
        },
        local_storage_cleared: {
            EN: 'Local Storage is Cleared',
            JP: 'ローカルストレージが消去されました。',
            ZH: '本地存储已清除。'
        },
        clear_settings_message: {
            EN: 'You must reload the page for the default settings to take effect.',
            JP: '初期設定を有効にするには、ページを再読み込みしてください。',
            ZH: '已重置至初始设置，刷新界面以生效。'
        },
        display_size_max: {
            EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to max value.',
            JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 上限に設定されました。',
            ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最大值。'
        },
        display_size_min: {
            EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to min value.',
            JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 下限に設定されました。',
            ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最小值。'
        },

        copied_success: {
            EN: 'URL is copied to clipboard',
            JP: 'URLがクリップボードにコピーされました。',
            ZH: '已复制链接至剪贴板'
        },
        sudoku_size_unsupported: {
            EN: 'Sorry, sudoku grids of size: $v are not supported',
            JP: '数独サイズ: $vには対応していません。',
            ZH: '不支持大小为 $v 的数独盘面'
        },

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

        preparing_download: {EN: "Preparing your download", JP: 'ダウンロード準備中', ZH: '下载准备中'},

        border_setting_help: {
            EN: 'To place clues on grid border/edges and corners:<br> Turn "Draw on Edges": ON',
            JP: '文字などをマスの線上や角に配置する<br> "Draw on Edges:"→"ON"',
            ZH: '在格子边/角上放置线索：<br>将"沿格线放置"设置为"开"'
        },

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
            ZH: '重置边类别所有消除？'
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
            EN: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename.',
            JP: '<h2 class="warn">\\ / : * ? \" < > |</h2>は使用できません。',
            ZH: '文件名不能使用字符<h2 class="warn">\\ / : * ? \" < > |</h2>'
        },

        file_save_no_contents: {
            EN: 'There is nothing to save to the file.',
            JP: 'ファイルに保存するものがありません。',
            ZH: '没有内容可保存到文件中。'
        },
        file_save_filename_title: {
            EN: 'The characters \\ / : * ? \" < > | cannot be used in filename.',
            JP: '\\ / : * ? \" < > |は使用できません。',
            ZH: '文件名中不能使用字符 \\ / : * ? " < > |。'
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

        "answer_check_shading exact color": {
            EN: "Match exact shading colors",
            JP: 'シェーディングカラーを正確に一致させる',
            ZH: '匹配颜色的涂色'
        },
        "answer_check_shading": {
            EN: "Shade cells in Dark Grey (DG) or Grey (GR) or Light Grey (LG) or Black (BL)",
            JP: '黒マスは濃灰（DG）、灰（GR）、薄灰（LG）、黒（BL）',
            ZH: '深灰、浅灰、亮灰或黑色的涂色'
        },
        "answer_check_number": {
            EN: "Numbers must be in Green, Blue or Red color",
            JP: '数字は緑か青か赤',
            ZH: '绿色、蓝色或红色的数字'
        },
        "answer_check_cell loop exact": {
            EN: "Line must be in Green Color",
            JP: '色とスタイルが一致する線',
            ZH: '匹配颜色的线'
        },
        "answer_check_cell loop": {EN: "Line must be in Green Color", JP: '線は緑', ZH: '绿色的线'},
        "answer_check_edge loop exact": {
            EN: "Edges in matching color/style",
            JP: '色とスタイルがマッチしたエッジ',
            ZH: '匹配颜色的边'
        },
        "answer_check_edge loop": {EN: "Edge must be in Green Color", JP: '辺は緑', ZH: '绿色的边'},
        "answer_check_wall": {EN: "Walls must be in Green Color", JP: '壁は緑', ZH: '绿色的墙'},
        "answer_check_square": {EN: "Black Squares", JP: '黒正方形', ZH: '黑色正方形'},
        "answer_check_circle": {
            EN: "White and Black circles of medium (M) size",
            JP: '中サイズ（M）の白マルまたは黒マル',
            ZH: '大小为中（M）的黑白圆'
        },
        "answer_check_shakashaka": {EN: "Half triangles", JP: '直角三角形', ZH: '直角三角形'},
        "answer_check_arrow": {EN: "Small arrows", JP: '小矢印', ZH: '小箭头'},
        "answer_check_magnets": {EN: "+ and - in black or green color", JP: '＋またはー、黒または緑', ZH: '绿色的+-'},
        "answer_check_battleship": {EN: "Battleship fleet", JP: '艦隊', ZH: '战舰'},
        "answer_check_tents": {EN: "Tents", JP: 'テント', ZH: '帐篷'},
        "answer_check_star battle": {EN: "Stars", JP: '星', ZH: '星'},
        "answer_check_akari": {EN: "Light bulbs", JP: '明かり', ZH: '灯泡'},
        "answer_check_minesweeper": {EN: "Mines", JP: '地雷', ZH: '地雷'},

        "solution_checker_all": {
            EN: 'Solution checker looks for ALL of the following:',
            JP: '以下の全てを正解判定する',
            ZH: '答案检测以下所有元素：'
        },
        "solution_checker_one": {
            EN: 'Solution checker looks for ONE of the following:',
            JP: '以下のうち一つを正解判定する',
            ZH: '答案检测以下任一元素：'
        },

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
        EN: {"all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All"},
        JP: {"all": "全", "items": "項目", "selectAll": "全てチェック", "clearAll": "全てチェックを外す"},
        ZH: {"all": "全部", "items": "项目", "selectAll": "全部选择", "clearAll": "全部清除"}
    }

};
