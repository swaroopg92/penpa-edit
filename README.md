# penpa-editor

Universal pencil puzzle editor capable of drawing many different kinds of pencil puzzles. You can also solve problems in the software.

You can save images and text in the form of URLs that can be loaded in a browser.

If the message "Invalid address" is displayed on a supported browser, try clearing the cache.

Depending on the browser you can update the page without using the cache with "Ctrl" + "R", "Ctrl" + "F5", "Shift" + "F5", etc.

## Compatible browsers
* Google Chrome
* Safari
* Firefox
* Microsoft Edge

## Shortcut keys
* Ctrl + z: Undo
* Ctrl + y: Redo
* Ctrl + d: Clone
* Ctrl + i: To copy the previous number/alphabet/symbol from Number mode with PANEL: ON
* Ctrl + space: Delete numbers and symbols at the same time
* Shift + space: Enter a space (Works in "Number" Mode + "Long" SubMode option only)
* F2: Problem mode
* F3: Solution mode
* TAB/ENTER: checkout the TAB section below in "Current functions"

## Tips
* Numbers: Back Space can be entered on the panel "1" tab and half-width space can be entered on the "A" tab.
* Number>Arrow: Enter an arrow in the direction you dragged the square.
* Symbol: Input with the numeric keys 1-9,0. When the panel is turned on, a list of symbols that can be entered is displayed, and it corresponds to 1, 2, ... from the upper left. To use the panel place the cursor on the panel symbol and click the board. Erase with two clicks.
* Some symbols such as symbol> figure> cross are onoff input formats. Click the panel to enter directly. Special example: Digital (frame) with the same key. If you press it twice, only the frame will be displayed.
* Special: Delete by clicking the first square of the entered symbol.
* Special: The tip position can be returned to the front by returning to the path that was used during input.
* V: Visibility Button. Users can now choose if they dont want the solution visible in the "Problem" mode. Default is "ON". In "Solution" mode everything will be visible.
* R: Reload Button. Users can now choose if they want the webpage to ask for confirmation for reloading or closing the page. This is to avoid accidental closing of tab or refreshing. Default is "OFF".

## Current functions

### Board types
* Square
	* Rows: Row size, Number of rows in your puzzle
	* Columns: Column size, Number of columns in your puzzle
	* White Space:
		* Over: Number of empty rows from the top. They are removed from the Row Size.
		* Under: Number of empty rows from the bottom. They are removed from the Row Size.
		* Left: Number of empty columns from the left. They are removed from the Column Size.
		* Right: Number of empty columns from the right. They are removed from the Column Size.
	* Example: If you want grid size of 9x9 and 3 empty rows and columns on either side. Then you neet set Rows - 15, Columns - 15, Over - 3, Under - 3, Left - 3, Right -3
* Hexagon
	* Side
	* White Space: Side
* Triangle
	* Side
	* White Space: Border
* Pyramid
	* Side
	* White Space: Border
* Cube
	* Side
* Sudoku
	* Diagonal \
	* Diagonal /
	* Skyscraper/Little Killer
	* Sandwich
* Kakuro
	* Rows
	* Columns

### Surface
* Fill cells. Select a color by style. (Nurikabe, Iceburn, Shakashaka etc.)
* In Dark grey mode only, click twice to get a green square.
* Light grey is used when hiding grey letters and symbols.
* Right click to enter the green square.

### Line
* Normal: A line connecting the center of the square to the horizontal and vertical. (Masyu, Hashi, Palindrome Sudoku, etc.)
* Diagonal: A line connecting the centers of two diagonally adjacent squares. (Zigzag etc.)
* Free: A line that connects arbitrary squares. (Night tour etc.)
* Middle: A line connecting the center of the square and the center of the side.
* Helper (x): An auxiliary cross mark placed on the side.
* Select the color and thickness of the line by style.

### Edge
* Normal: A line that connects two horizontal or vertical vertices of a square. (Heyawake, Slitherlink etc.)
* Diagonal line: A line connecting two diagonal vertices of a square. (Diagonal Sudoku etc.)
* Free line: A line that connects the vertices of any square. (Sharp and blunt loop etc.)
* Helper (x): An auxiliary cross mark placed on the side.
* Erase: Delete the border of the board.
* Select the color and thickness of the line by style.

### Wall
* A vertical or horizontal line drawn inside the square. (Slalom etc.)
* Select the color and thickness of the line by style.

### Number		  
* Normal: Enter numbers, alphabets, and some symbol characters from the keyboard. Some other special symbols are allowed through Panel: ON mode. It also allows custom symbols in the "text" tab (checkout next section for more details)
* L, M, S: Large, medium or small size numbers.
* Candidates: Candidate numbers for Latin Square such as Sudoku. Compatible with 1-9. onoff input.
* 1/4: Small characters at the four corners. (Kakuro, Hairyrin etc.)
* Side: Small characters at the middle of the four sides. (Compass etc.)
* Tapa: Characters for Tapa. Up to 4 characters.
* Arrow: Characters with arrows. Click and hold the mouse and move in the direction of the arrow to draw the arrow. (Yajilin, Castle Wall etc.)
* Long: Long sentence. It is possible to create a list such as seekers.
* Killer: Small characters at the top left corner. (Killer Sudou)
* White, black and red circles have a circle on the back of the numbers.
* White BG: Draw a white circle behind the numbers. Useful when you can't see the numbers because they are hidden behind the lines.
* When the boundary input is turned on, the character is placed on the side/vertex.

#### Any Unicode Symbol
* Select "Number" mode.
* Then select "Long" or "L" or "M" submode. (Preferrable is Long submode, although it should also work in some other Number submodes (i.e. 1/4, side, arrow, L, M, S)).
* Panel: ON.
* Select "Text" tab in the Panel.
* One can copy unicode symbol (supports most (not all) of them although rendering might be different based on browser) from the websites https://unicode-table.com/en/ or https://www.alt-codes.net/ and paste in the textbox available. (You can click on the symbol/shape in the website, it will allow copying).
* Then click "Insert".
* One can also type in the sentence of words and "Insert".
* Clear button to clear the text area.

### Shape
* Numerous symbols. You can browse the symbols that can be entered by opening the panel. Figures such as 〇 and □, inequality signs, digital numbers, and other symbols unique to puzzles.
* Depending on the style, you can select whether to place the figure on the front side or the back side of the line.
* When the boundary input is turned ON, the character is placed on the side/vertex.	  

### Special
* A special symbol that spans multiple squares. (Arrow Sudoku, Thermo Sudoku, moving arrows, square area)
* Click the first cell you entered to erase it.
* Polygon: The vertices are selected in the order in which they are clicked. Click the last clicked vertex or the first clicked vertex again to end selection.

### Frame
* A line that surrounds multiple squares. (Killer Sudoku etc.)
* There are 4 styles: black dotted line, black solid line, grey dotted line, and grey solid line.
* Available in square and regular hexagon.

### Box
* Click to remove or add the square that draws the frame of the board. Useful for irregular board shapes.

### Tab
* This is tab selector button.
* User can now select which modes/sub-modes they wan't to rotate when pressing TAB/Enter key.
	* There is search option available.
	* Search is case-insensitive.
* Default selection is "Surface".
* Then you can either press Tab or Enter (closer to the numpad) to rotate between the selected modes.

### Move
* You can move numbers and symbols by dragging. Originally, you cannot move to a square with a number or sign.
* All can be set to move both numbers and symbols, or either numbers or symbols.

### Composite
* Ability to use multiple input methods simultaneously.
* Paint:
	* Black / dot: Black square drag input and dot
	* White / circle: White circle drag input and black circle
	* Shakashaka: Pull the triangle to input, left click for dot
* Loop:
	* Line or x: Line and auxiliary x (Castle wall) - Right Click for cross and Left Click for Line
	* Line or OX: Line and 〇× in square (Country road)
	* Edge, x, in/out: Edge, auxiliary x, and inside/outside painted yellow and green. (Slitherlink, Cave) - Right Click for cross and Left Click for Line
	* Yajilin: Left mouse click - Black square, Left mouse click drag - green line, Right click - dot
	* Hashi: Draw the line again to make a double line
* Area / Field:
	* Edge/Aux line: An auxiliary line that represents the connection between the edge and the square
* Object:
	* Battleships: Click twice to change the shape according to the condition of the surrounding ships.
	* Star Battle: Left click - star, Right click - x
	* Tents: A tent and a point, an auxiliary x on the side, and a line that connects the tent and a tree - Right click for cross and left click for tent and a point, drag for the line.
	* Magnets: +, - and black square
	* Arrows: Left click drag to draw an arrow in one of the eight directions in a square.
* Number logic:
	* Numerical flick: Input the numerical flick. 123456789 from top left to bottom right.
	* Alphabet flick: Enter the alphabet by flick. ABCDEFGH- from top left to bottom right. Enter '-' in the lower right corner.

### Grid
* You can change the border of the board from the "New grid / frame" menu.
* Grid: Border type
* Gridpoints: Whether to place points at vertices
* Outside frame: Whether to draw a line around the board
* White space: Used when placing numbers outside the grid on the board. (Sandwich puzzle etc.)
* "Reset" button resets the board. The "Change grid" button does not reset the board surface, but updates only display size and frame type.

### Transform
* You can rotate and flip the board or remove and add columns or rows from the "Rotate / Move / Add / Remove" menu. Square and pyramid rotate 90°. Regular hexagon and regular triangle rotate 30° on the board surface.
* Adjust the margin of the board with the "Move board to center" and "Fit window to board" buttons.

### Save image (Screenshot button)
* Settings:
1. White Border: Setting "No" will remove the extra white space around the grid.
2. Image quality: The higher the quality, the better the image quality, but the larger the image size.
3. File Type: Supported image types: PNG, JPG
* Options:
1. Open in new window: Opens the image in a new TAB
2. Download: .png or .jpg image will be downloaded
3. Cancel: Close the window

### Share
* Title - Describe the Puzzle Type (e.g. Classic Sudoku, Arrow Sudoku)

* Author - Puzzle creator's name

* Source - If you are not the author of the puzzle, specify the source URL

* URL for editing
1. Complete creating puzzle in Edit mode "Problem".
2. If you need to save your puzzle creation progress and come back later to edit then click on this button

* URL for solving
1. Complete creating puzzle in Edit mode "Problem".
2. If you want to share your puzzle for others to solve then click on this button

* URL for solving with Solution
1. Complete creating puzzle in Edit mode "Problem".
2. Select Edit mode "Solution" and complete the solution. (Check part of Step 3 before doing this step)
3. If you want to share your puzzle for others to solve with the ability to verify the solution then click on "Extra options" button. A new small window will appear.
	i. Please note that the solution will check only for a certain elements with a certain color and style.
	ii. The small window that appeared will show you all the possibilities.
	iii. You should enter the solution in Step 2 using one of the accepted color and style as shown in the window.
4. Click on "Generate URL with answer check"
5. Click anywhere on the screen outside the small window to close it.

* Options
1. Copy: copies the URL to the clipboard
2. Download: downloads a .txt file with the url
3. Open: opens a new TAB with the same url
4. URL_short:
	1. First create an URL using one of the three methods described above.
	2. Click on "Copy".
	3. Click on "URL_short" (It will open a new TAB).
	4. Paste the URL (CTRL + V on windows).
	5. Click "Shorten"
4. Cancel: close the window

* Extra Options (puzzle_output_file -> GMPuzzle output:)
1. This allows user to generate a text file output that follows the submission formatting rules for GMPuzzles (https://tinyurl.com/GMPuzzlesFormatting).
2. It currently supports (this list is frequently updated):
	* Sudoku
		* classicsudoku (cs)
		* thermosudoku (ts)
		* arrowsudoku (as)
		* evenoddsudoku (eos)
		* consecutivepairssudoku (cps)
		* tightfitsudoku (tfs)
			* (Panel: ON) For Slash/Split: Use Shape Mode -> Shape Submode -> "〇△◻x" from dropdown list -> 6th Shape in the Panel
			* For numbers: Use "1/4" submode to enter in top left or bottom right corner of the split cell, Normal submode for numbers in the cells without split
	* Number Placement
		* tomtom (tt)
			* Use +, -, x, / from keyboard for mathematical operator
			* For numbers: Number mode -> 1/4 submode
		* skyscrapers (ss)
			* Ensure 1 white row/column on top/botton and left/right - e.g. If your puzzle is 7x7 size, then set the Rows = 9, Columns = 9, White Space: Over = 1, Under = 1, Left = 1, Right = 1 in the New Grid settings
		* kakuro
			* (Panel: ON) For Slash/Split: Use Shape Mode -> Special 1 Submode -> "kakuro" from dropdown list -> 1st and 2nd Shape in the Panel
			* For numbers: Use "1/4" submode and "W" style (white) to enter in top right or bottom left corner of the split cell, Normal submode for numbers in the cells without split (Green or Blue color)
		* doublekakuro (dk)
			* (Panel: ON) For Slash/Split: Use Shape Mode -> Special 1 Submode -> "kakuro" from dropdown list -> 1st and 2nd Shape in the Panel
			* For numbers: Use "1/4" submode and "W" style (white) to enter in top right or bottom left corner of the split cell, Normal submode for numbers in the cells without split (Green or Blue color)
			* For 2x2 regions: Use Surface mode and shade the upper-left corner of a 2x2 region with grey color and remaining 3 cells with green color.
			* Solution: Use Number mode --> Normal submode. Fill in all the white and grey shaded cells with appropriate numbers and ignore the green shaded cells. This is similar to as it's described in the document. They grey shaded cell contains the number that belongs to corresponding 2x2 region.
	* Object Placement
		* Statue Park (sp)
			* [Panel: ON] Use Shape mode -> Shape/Circle submode
		* minesweeper (ms)
			* Use 1 to represent mine in the Solution
		* doubleminesweeper (dms)
			* Use 1 and 2 to represent mines in the Solution
		* starbattle (sb)
			* specify number of stars after puzzle type [e.g starbattle2 or starbattle3]
			* use grey shading in solution mode for stars, it is assumed rows=columns as per GMPuzzles formatting
		* battleships (bs)
			* ensure 1 white row/column on bottom and right - e.g. If your puzzle is 10x10 size, then set the Rows = 11, Columns = 11, White Space: Over = 0, Under = 1, Left = 0, Right = 1 in the New Grid settings
			* For numbers: use Normal submode
			* (Panel: ON) For Shapes: use Shape Mode -> Specal 1 submode -> Battleship from dropdown list
			* Unfortunately there is no good way to ask the fleet from user, this output will come with standard fleet, you need to manually modify the [# of types of ships] and [fleet description] if your puzzle has a different set
	* Shading Puzzles
		* kurotto
			* Use Number mode -> White circle Style
			* for empty circle - just place white circle with any digit and then press backspace to remove the digit
		* kuromasu (Use Number mode -> White circle Style)
		* tapa (Number mode -> Tapa submode)
		* nurikabe
		* nanro
		* lits
		* crossthestreams (cts)
			* ensure enough white row/column on top and left - e.g. If your puzzle is 10x10 size and has 4 rows of clues above and 3 columns of clues in the left, then set the Rows = 14, Columns = 13, White Space: Over = 4, Under = 0, Left = 3, Right = 0 in the New Grid settings
			* enter clues using Number mode -> Normal submode (use the multiplication character on digit 8 from the keyboard for star)
			* use grey shading in solution (Surface mode)
	* Region Division Puzzles
		* fillomino
		* pentominous
		* cave
		* snakepit
			* Use Number mode -> White circle Style
			* for empty circle - just place white circle with any digit and then press backspace to remove the digit
		* araf (Use Number mode -> White circle Style, green edge in solution mode for regions)
		* spiralgalaxies (sg)
			* (Panel: ON) use 2nd or 8th or 9th position circles for Black, White and Grey circle respectively in the Shape -> Shape -> Circle
			* (Border: ON) for placing circles on edges and corners
			* green edge in solution mode for regions
	* Loop/ Path Puzzles
		* balanceloop
			* Use Number mode -> White circle style / Black circle style
			* for empty circle, just place white / Black circle with any digit and then press backspace to remove the digit
		* masyu (Use Shape mode -> Shape/Circle submode [Panel: ON])
		* tapalikeloop
		* slitherlink
		* yajilin
			* (Panel: ON) For square - Shape mode -> Shape submode -> Square (from dropdown list - XL size will occupy entire cell), use grey square (9th shape in the panel)
			* For Number and Arrow: use Number mode -> Arrow submode (drag the mouse in the cell for the arrow, type in the number from keyboard or select from panel)
		* doubleyajilin
			* (Panel: ON) For square - Shape mode -> Shape submode -> Square (from dropdown list - XL size will occupy entire cell), use grey square (9th shape in the panel)
			* For Number and Arrow: use Number mode -> Arrow submode (drag the mouse in the cell for the arrow, type in the number from keyboard or select from panel)
		* castlewall
			* (Panel: ON) For square - Shape mode -> Shape submode -> Square (from dropdown list - XL size will occupy entire cell), use black and white square respectively (2nd and 8th shape in the panel)
			* For Number and Arrow: use Number mode -> Arrow submode (drag the mouse in the cell for the arrow, type in the number from keyboard or select from panel)
			* Use white color style for arrow and clue on black square
3. How to use it?
	1. Create a Puzzle in "Edit: Problem" mode.
	2. Select "Solution Mode" and fill in the solution (Grey shading, Green numbering, Green loop, Green edge).
	3. click on Share -> Extra Options -> puzzle_output_file.
	4. In the "Header" area, type the puzzle type you are creating.
	5. click on "GMPUzzle output" button and then click anywhere outside to close this window.
	6. Specify your required filename and click "Download" button.
		* Template: [Constructor Initials]-[SubmissionID]-[Genre]-[ShortTitle].txt
		* Example: SG-012-kurottu-pairs.txt

### Stop Watch
* start - starts the timer. Lowest precision is 1/10th of a second.
* pause - pauses the timer. click on start again to continue.
* stop - stops the timer. click on start again to restart the timer. click on reset to set the timer back to 00:00.
* reset - resets the timer to 00:00.

## Disclaimer
Secondary distribution of code is prohibited. Images created using this software can be used freely with proper due credit. We are not responsible for any damages caused by using this software.
