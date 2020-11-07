## History
* 2020/10/01 ver2.24.12
	* Double and Triple sum arrows now possible. (Use Shape [Mode] -> Special1 [Submode]-> ArrowSums for sums and Special [Mode] -> Arrow [Submode] to draw arrow path).
	* Added Sudoku 6x6 and 8x8 boards option to Sudoku Grid type.
	* Personalized alert messages.
	* Added Composite mode to Tab selector.
	* Rearranged all colors and improved CODE readability.
	* Fixed display of some buttons.
* 2020/10/01 ver2.24.11
	* Fixed backspace symbol display in the PANEL.
	* Fixed number mode bug when user enters invalid unicode symbol.
	* Added Shape mode to the Tab Selector.
	* Removed un-necessary shortcut keys.
	* Improved error message display and added info about white space while setting new grid.
	* I/O Sudoku now allows 6x6 and 8x8 grids as well. Import Sudoku also accepts dots instead of zeros for blank cells.
	* Fixed text area input in ioS (iPhone, iPad).
	* Slowed down bulk UNDO, possibly improved UNDO bug.
	* Added Arrow Key movements to the Hex grid for all rotations.
* 2020/10/22 ver2.24.10
	* Kakuro grid type added.
	* URL for editing will save the UNDO/REDO. "Clone" will not save the UNDO/REDO.
	* Clicking URL_short now automatically copies the URL.
	* Fixed bug in arrow and thermo shapes while using UNDO.
	* Added few more videos to the list.
* 2020/10/15 ver2.24.9
	* I/O Sudoku Button - Input/Output 81 digit string for Sudoku grids. This allows user to import/export the sudoku from sudokuwiki.org and vice-versa.
	* Killer button added to Number mode - User can now select this option to enter killer sums in the cages while creating the killer sudoku. Killer cages can be drawn using "Frame" mode. Then select "Killer" submode under "Number" mode. Select the cell where you wan't to insert the cage total and type in the number.
	* Normal numbers won't overwrite corner and side pencil marks in Problem mode.
	* Spacebar will now automatically remove corner/side pencil marks along with center number
	* Fixed clone bug for other grid types
	* Some bug fixes
* 2020/10/10 ver2.24.8
	* Improved display messages and tool tips for the Delete button
	* Unmerge the arrows ending on same cell
	* Fixed bug with helper(x) delete function in composite mode
	* Added few more videos
	* Some bug fixes
* 2020/10/05 ver2.24.7
	* Unmerge the thermos ending on same cell
	* Added new youtube video to the list
	* Added few more modes to Tab selector and changed default mode to "Surface"
	* CTRL + i shortcut to copy the previous number/alphabet/text/symbols from the Number mode with PANEL: ON
* 2020/10/04 ver2.24.6
	* Added Sudoku Board
	* Penpa plus youtube channel started, video list template added
* 2020/10/02 ver2.24.5
	* Seperated lines for the diagonals into frameline option. Added this to all supported shapes (square, hex, cube, pyramid, etc)
	* Added Large number submode to Triangle and Cubic/Iso board
	* Fixed the Number with Circle style for other boards
	* Fixed Mac Safari Tab Checkmark misplaced bug
	* Fixed white space around mathematical operators
	* Fixed backspace bug for red circle
* 2020/09/26 ver2.24.4
	* Display size range changed to 12~90
	* Red Circle with white text style added to the Number mode
	* Added Jpeg file type support to Screenshot/Download Image.
	* Grey and Green color added to digital parts in Shape (mode) -> Number (submode)
	* Added short diagonal lines of 4 types to Shape (mode) --> Shape (submode) --> Line option (This is to assist diagonal cages) - The styles are similar to Frame (mode).
	* Replaced few more display button text with shapes
	* Some bug fixes
* 2020/09/17 ver2.24.3
	* Some minor fixes
* 2020/09/17 ver2.24.2
	* Reload button "R": ON/OFF - Ask for confirmation on accidental reload or closing of the page. Default is "OFF".
	* "Enter" will also work like "Tab" key. More comfortable to switch modes as it's closer to the numpad.
	* href links now open in new tab and preserving the same page
* 2020/09/12 ver2.24.1
	* Bars added in the Shape submode
	* Improved buttons display of Shape -> Shape submode
	* Text input option added to Number mode in Panel for custom symbols.
	* Android bug fixes
	* Corrected notation of math symbols
	* Updated the changes from upupstream branch
* 2020/09/09 ver2.23.2
	* crossthestreams, tightfitsudoku, battleships, kakuro and doublekakuro support added to the GMPuzzles output list. This completes all the types mentioned in the GMPuzzles document.
	* Added keyboard arrow keys movement to "Cube" board type (Top side direction reference is as seen from the right side of the cube) (Note - This will not work properly if the cube is rotated)
	* Added Red color to Number mode
	* Fixed Generate_URL_answer_check bug
	* Improved readme for GMPuzzles section
* 2020/09/04 ver2.23.1
	* Ipad Support added
	* spiralgalaxies, skyscrapers support added to the GMPuzzles output list
	* Increased the "long" sub-mode (under "Number" mode) limit to 50
	* Increased hex and iso size limit to 20
	* Four colors (Pink, Orange, Purple, Brown) added to the Surface mode
	* Improved rotation functions
	* Updated the changes from upupstream branch
	* Some bug fixes
* 2020/08/23 ver2.19.6
	* Added nanro, starbattle, lits, araf, tomtom to GMPuzzles output list
	* Single digit in Candidate mode is now treated as Normal
	* Fixed the resize bug
	* Improved response messages for erase selection method
	* Added Red/Blue colors to Edge/Line/Wall modes
	* Fixed the backspace bug (it won't work in candidate mode)
	* Fixed the helper(x) bug
	* Improved yajirin (yajilin) composite mode
* 2020/08/15 ver2.19.5
	* Added TAB feature, User can now select their own choice of modes/submodes to rotate when pressing TAB
	* Visibility button if someone doesn't want to see solution on Problem
	* Added tool tips to some elements (e.g. hover over Panel, Border, Undo etc)
	* Added "Thicker" option to Edge Mode
	* Improved buttons display and fixed some other bugs
* 2020/08/07 ver2.19.4
	* Upgraded TAB shortcut
	* Improved buttons displayed in sub-modes
	* Cleaned up the code
	* right click feature implemented in the composite mode
	* updated readme
	* some other minor improvements
* 2020/08/07 ver2.19.3
	* Added shortcuts
	* Normal candidates overwrites corner/edge digits
	* display size upto 80
* 2020/08/04 ver2.19.2
	* Improved buttons and Numbers display
	* Added "TAB" to switch between normal and candidates submode
* 2020/08/02 ver2.19.1
	* Integrated all the new features from the Upstream Branch Opt-pan (creator)
	* includes adding new symbols
	* retains the selection status of the buttons in the Solution mode
* 2020/07/25 ver2.12.3
	* Initiated output text file feature with GMPuzzles formatting requirements
* 2020/07/16 ver2.12.2
	* Stop watch
	* Shortcut to enter space in the text
	* updated readme
* 2020/06/19 ver2.12.1
	* English Translations
	* Short URL
	* Updated Readme instructions
* 2020/01/05 ver2.12
	* Adjusted mouse judgment.
* 2019/12/21 ver2.11
	* Implemented composite mode
* 2019/12/07 ver2.10
	* Ver.2 which was being developed at another address, is integrated with the old address.
* 2019/09/07 ver2.00
	* Deformation board support etc
* 2019/08/16 ver1.05
	* Microsoft Edge compatible
* 2019/08/04 ver1.04 
	* changed the specifications of white border
	* changed the input method of symbols
* 2019/07/29 ver1.03
	* Fixed drawing of dotted line etc
* 2019/07/18 ver1.02
	* iPhone compatible
* 2019/07/14 ver1.01
* 2019/07/13 ver1.00
* 2019/07/07 beta version

## Disclaimer

Secondary distribution of code is prohibited. Images created using this software can be used freely with due credit to Penpa. We are not responsible for any damages caused by using this software.