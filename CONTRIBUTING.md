# Contributing

Author: Swaroop Guggilam, penpaplus@gmail.com

The purpose of this file is to provide guidance on contributing to Penpa-edit. If you don't want to go technical and would like to help with documentation and instructions then let me know. Any help is always appreciated.

## Branch Clarification

### master

* The main branch which is being hosted at https://swaroopg92.github.io/penpa-edit/
* It only should be updated when a major/minor release is delivered.
* The **master** branch should only have pull requests from the **dev** branch.

### dev

The *working* version of the package that incorporates feature changes and bug
fixes. The **dev** branch should have pull requests from any feature/bug fix
branch.

### other

Any feature and bug fix branch should have descriptive names that indicate what
enhancements are being done.

## Contributing new feature

* Fork/clone the latest repository
* Create a new branch with appropriate name relevant to the feature
* Make modifications and test it locally on the web-browser
	* If you would like to help me achieve some of the feature requests by other solvers/users, please checkout https://github.com/swaroopg92/penpa-edit/projects/1. It contains all the to-do-list items.
	* Please refrain from changing existing style options like color, thickness etc
	* If you would like to add more style options then you can do so, but please remember that adding lot of options might just lead to more confusion, so unless its absolutely necessary, I would recommend to avoid such small changes.
	* I use https://packagecontrol.io/packages/HTML-CSS-JS%20Prettify to keep the code clean and structured. You don't necessarily need to use this package but follow similar clean structure as rest of the code.
	* Add useful comments to your code wherever necessary for easier understanding.
* Tests are a WIP. For further details, read test/README.md. In the meantime, some sample testing links have been provided in TESTING.md file.
* Make use of developer tools (e.g. https://developers.google.com/web/tools/chrome-devtools), it allows you to test your changes not only on the desktop version, but also on the mobile version.
* If you want to see live effect of your changes in the files, you can use the following handy tool - https://www.browsersync.io/
* Finally send a Pull Request of your branch to integrate to **dev** branch (see below for the details).

## Pull Request Process

1. Ensure your changes are working and other functionality are same as before
2. Ensure your branch contains up-to-date changes of the **Master** branch.
3. Update ChangeLog.md
4. Submit Pull Request through GitHub and tag me as a reviewer.
5. Reviewer makes comments and submitter fixes them iteratively as needed.
6. Final acceptance will be based on Author's discretion.

## Sample test links

1. https://git.io/JReKb
