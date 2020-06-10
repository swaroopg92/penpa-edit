# penpa-editor
Universal pencil puzzle editor. It is software for drawing all pencil puzzles. You can also solve the problem in software.

You can save images and texts. It is loaded by inputting the text output by "Address output" into the address bar.

*If the message "Invalid address" is displayed on a supported browser, try clearing the cache.

Although it depends on the browser, you can update the page without using the cache with "Ctrl" + "R", "Ctrl" + "F5", "Shift" + "F5", etc.

## Supported browser
* Google Chrome
* Safari
* Firefox
* Microsoft Edge

## Shortcut key
* Ctrl + z: go back
* Ctrl + y: move forward
* Ctrl + d: Duplicate board
* Ctrl + space: Delete numbers and symbols at the same time
* F2: Problem mode
* F3: Answer mode

## Tips
* Number: Back Space can be entered on the panel "1" tab and half-width space can be entered on the "A" tab.
* Number > Arrow: Enter an arrow in the direction you dragged the square.
* Symbol: Input with the numeric keys 1-9,0.When the panel is turned on, a list of symbols that can be entered is displayed, and it corresponds to 1, 2, ... from the upper left.To enter the panel, place the cursor on the panel symbol and click the board. Erase with two clicks.
* Some symbols, such as Symbols> Shapes> Crosses, are onoff input formats.Click the panel to enter directly.Special example: If you press the same key twice on the digital (frame), only the frame will be displayed.
* Special: Delete by clicking the first square of the entered symbol.
* Special: The tip position can be returned to the front by returning to the path that was used during input.

## Current features

### black trout
* Black trout Select a color by style. (Nurikabe, Iceburn, Shakashaka etc.)
* Dark ash only, click twice to get a green square.
* Hidden ash is used when hiding over gray letters and symbols.
* Right click and enter the green square.

### line
* Normal: A line that connects the center of the square to the vertical and horizontal. (Mashu, bridge over, palindrome Sudoku, etc.)
* Diagonal line: A line that connects the center of the square to Naname. (Zigzag etc.)
* Free line: A line that connects arbitrary squares. (Night tour etc.)
* Midline: A line connecting the center of the square and the center of the side.
* Auxiliary x: An auxiliary cross mark placed on the side.
* Select the color and thickness of the line by style.

### side
* Normal: A line that connects the top of the square to the horizontal and vertical. (Heyawake, Slither link etc.)
* Diagonal line: A line connecting the vertices of a square to a namame. (Diagonal Sudoku etc.)
* Free line: A line that connects the vertices of any square. (Sharp and blunt loop etc.)
* Auxiliary x: An auxiliary cross mark placed on the side.
* Border erase: Delete the border of the board.
* Select the color and thickness of the line by style.

### wall
* A line drawn vertically in the square. (Vertical and horizontal, slalom etc.)
* Select the color and thickness of the line by style.

### number
* Normal: Enter numbers, alphabets, and some symbol characters from the keyboard.You can also use the panel to input symbols, katakana, hiragana, kanji, etc. (Coloring etc.)
* Arrows: Characters with arrows. (Yagirin, CastleWall etc.)
* Tapa: Character for Tapa. Up to 4 characters.
* 1/4: Characters at the four corners. (Kakuro, Hairyrin, Killer Sudoku etc.)
* Comp: Characters for compass. It is possible to enter small numbers depending on the vertical and horizontal directions.
* Medium/Small: Small size numbers.
* Long sentence: Long sentence.It is possible to create a list such as seekers.
* Candidates: Candidate numbers for Latin Square, such as Sudoku. Compatible with 1-9. onoff input.
* For white circles and black circles, circles are written on the back of the numbers.
* For the white background, draw a white circle behind the numbers.When you can't see the numbers because they are hidden behind the lines.
* When the side input is turned ON, the character is placed on the side/vertex.

### symbol
* Numerous symbols.You can browse the symbols that can be entered by opening the panel.Figures such as 〇 and □, inequality signs, digital numbers, and other symbols unique to puzzles.
* Depending on the style, you can select whether to place the figure on the front side or the back side of the line. (Mashu's 〇 is the back of the line, and “Oh, I'm sorry” is the front of the line )
* When the side input is turned ON, the character is placed on the side/vertex.

### special
* A special symbol that spans multiple squares. (Arrow Sudoku, Thermo Sudoku, moving arrows, square area)
* Click the first cell you entered to erase it.
* Polygonal fill.The vertices are selected in the order in which they are clicked.Click the last clicked vertex or the first clicked vertex again to end selection.

### frame
* A line that surrounds multiple squares. (Killer Sudoku etc.)
* There are 4 styles: black dotted line, black solid line, gray dotted line, and gray solid line.
* Available in square and regular hexagon.

### trout
* Select by clicking the square that draws the frame of the board.

### move
* Numbers and symbols can be moved by dragging. Originally, it is not possible to move to a square with a number or sign.
* All can be set to move both numbers and symbols, either numbers or symbols.

### composite
* Ability to use multiple input methods simultaneously.
* Compound mode list
1. Black/dots Black squares, points can be dragged
2. White circle Black circle White circle, drag the black circle
3. Shaka Shaka Triangular pull input
4. Line, x-ray and auxiliary x (Castle wall)
5. 〇 × (Country Road) for lines and OX lines and squares
6. Side x, inside/outside, auxiliary x, and inside/outside painted yellow and green. (Suririn, Cave)
7. Yajilin black square/dot and line
8. Draw a bridge. If you draw the line again, it becomes a double line.
9. Side/Auxiliary line An auxiliary line that represents the connection between a side and a square
10. Battleship battleship. Click twice to change the shape according to the condition of the surrounding ships.
11. Star Battle Star and ×
12. Tent and point, auxiliary x on the side, line connecting tent and tree.
13. Flick number Enter flick number. 123456789 from top left to bottom right.
14. Flick alphabet Enter the alphabet. ABCDEFGH- from top left to bottom right. Enter-in the lower right corner.

### Deformed board surface
* You can select square, regular hexagon, regular triangle, or pyramid from the "New/Change frame" menu. Functions other than square are limited.
* Adjust the board shape in "mass" mode. From the "Rotate/Move" menu, use the "Move the board to the center" and "Match screen size to the board" buttons to adjust the margins of the board.

### grid
* You can change the border of the board from the "New/Change border" menu.
* Grid: Border type
* Lattice points: whether to place points at vertices
* Outer frame: whether to write a thick line around the board surface
* Margins: Used when numbers are placed outside the grid on the board. (Building puzzle etc.)
* "Create" button resets the board. "Change frame" button does not reset the board surface, but updates only the items below the display size.

### rotation
* You can rotate and flip the board from the "Rotate/Move" menu. Square and pyramid rotate 90°. Regular hexagon, regular triangle Rotate 30° on the board surface.
* Adjust the margin of the board with the "Move the board to the center" and "Match screen size to the board" buttons.

### save image
*　Image quality: The higher the quality, the better the image quality, but the larger the image size.
*　Grid: Selection of internal linetypes. Solid line, dotted line, erase.
*　Lattice points: Presence or absence of lattice points. (Slither link etc.)
*　Outer frame: Presence or absence of grid outer frame.

## History
* 2020/01/05 ver2.12 Adjusted mouse judgment.
* 2019/12/21 ver2.11 Implemented composite mode.
* December 7, 2019 ver2.10 Ver.2, which was being developed with another address, is integrated with the old address.
* 2019/09/07 ver2.00 Deformation board support etc.
* 2019/08/16 ver1.05 Microsoft Edge compatible
* 2019/08/04 ver1.04 Changed the specifications of white border and changed the input method of symbols
* 2019/07/29 ver1.03 Fixed dotted line drawing etc.
* 2019/07/18 ver1.02 iPhone compatible
* 2019/07/14 ver1.01
* 2019/07/13 ver1.00
* 2019/07/07 beta version

## Disclaimer
Secondary distribution of code is prohibited.Images created using this software can be used freely.We are not responsible for any damages caused by using this software.
