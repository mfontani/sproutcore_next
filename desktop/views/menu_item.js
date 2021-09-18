// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { View, ContentDisplay, RenderContext, ImageView, pointInRect } from "../../view/view.js";
import { SC } from '../../core/core.js';
import { MenuPane } from "../panes/menu.js";


/**
  @class

  An MenuItemView is created for every item in a menu.

  @since SproutCore 1.0
*/
export const MenuItemView = View.extend(ContentDisplay,
/** @scope MenuItemView.prototype */ {

  /**
    @type Array
    @default ['sc-menu-item']
    @see View#classNames
  */
  classNames: ['sc-menu-item'],

  /**
    @type Array
    @default ['title', 'isEnabled', 'isSeparator', 'isChecked']
    @see View#displayProperties
  */
  displayProperties: ['title', 'toolTip', 'isEnabled', 'icon', 'isSeparator', 'shortcut', 'isChecked'],

  /**
    The WAI-ARIA role for menu items.

    @type String
    @default 'menuitem'
    @readOnly
  */
  ariaRole: 'menuitem',

  /**
    @type Boolean
    @default true
  */
  escapeHTML: true,

  /**
    @type Boolean
    @default true
  */
  acceptsFirstResponder: true,

  /**
    IE only attribute to block blurring of other controls

    @type Boolean
    @default true
  */
  blocksIEDeactivate: true,

  /**
    @type Boolean
    @default false
  */
  isContextMenuEnabled: false,


  // ..........................................................
  // KEY PROPERTIES
  //

  /**
    The content object the menu view will display.

    @type Object
    @default null
  */
  content: null,

  /**
    The title from the content property.

    @type String
  */
  title: function () {
    var ret = this.getContentProperty('itemTitleKey'),
        localize = this.getPath('parentMenu.localize');

    if (localize && ret) ret = String.loc(ret);

    return ret || '';
  }.property().cacheable(),

  /**
    The value from the content property.

    @type String
  */
  value: function () {
    return this.getContentProperty('itemValueKey');
  }.property().cacheable(),

  /**
    The tooltip from the content property.

    @type String
  */
  toolTip: function () {
    var ret = this.getContentProperty('itemToolTipKey'),
        localize = this.getPath('parentMenu.localize');

    if (localize && ret) ret = String.loc(ret);

    return ret || '';
  }.property().cacheable(),

  /**
    Whether the item is enabled or not.

    @type Boolean
  */
  isEnabled: function () {
    return this.getContentProperty('itemIsEnabledKey') !== false &&
           this.getContentProperty('itemSeparatorKey') !== true;
  }.property().cacheable(),

  /**
    The icon from the content property.

    @type String
  */
  icon: function () {
    return this.getContentProperty('itemIconKey');
  }.property().cacheable(),

  /**
    true if this menu item represents a separator, false otherwise.

    @type Boolean
  */
  isSeparator: function () {
    return this.getContentProperty('itemSeparatorKey') === true;
  }.property().cacheable(),

  /**
    The shortcut from the content property.

    @type String
  */
  shortcut: function () {
    return this.getContentProperty('itemShortCutKey');
  }.property().cacheable(),

  /**
    true if the menu item should include a check next to it.

    @type Boolean
  */
  isChecked: function () {
    return this.getContentProperty('itemCheckboxKey');
  }.property().cacheable(),

  /**
    This menu item's submenu, if it exists.

    @type MenuPane
  */
  subMenu: function () {
    var parentMenu = this.get('parentMenu'),
        menuItems = this.getContentProperty('itemSubMenuKey');

    if (menuItems) {
      if (SC.kindOf(menuItems, MenuPane)) {
        menuItems.set('isModal', false);
        menuItems.set('isSubMenu', true);
        menuItems.set('parentMenu', parentMenu);
        return menuItems;
      } else {
        var subMenu = this._subMenu;
        if (subMenu) {
          if (subMenu.get('isAttached')) {
            this.invokeLast('showSubMenu');
          }
          subMenu.remove();
          subMenu.destroy();
        }

        subMenu = this._subMenu = MenuPane.create({
          layout: { width: 200 },
          items: menuItems,
          isModal: false,
          isSubMenu: true,
          parentMenu: parentMenu,
          controlSize: parentMenu.get('controlSize'),
          exampleView: parentMenu.get('exampleView')
        });
        return subMenu;
      }
    }

    return null;
  }.property().cacheable(),

  /**
    @type Boolean
    @default false
  */
  hasSubMenu: function () {
    return !!this.get('subMenu');
  }.property('subMenu').cacheable(),

  /** @private */
  getContentProperty: function (property) {
    var content = this.get('content'),
        menu = this.get('parentMenu');

    if (content && menu) {
      return content.get(menu.get(property));
    }
  },

  /** @private */
  init: function init () {
    init.base.apply(this,arguments);
    this.contentDidChange();
  },

  /** @private */
  destroy: function destroy () {
    destroy.base.apply(this, arguments);

    var subMenu = this._subMenu;
    if (subMenu) {
      subMenu.destroy();
      this._subMenu = null;
    }
  },

  /** MenuItemView is not able to update itself in place at this time. */
  // TODO: add update: support.
  isReusable: false,

  /** @private
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.

    @param {RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function (context) {
    var content = this.get('content'),
        val,
        menu = this.get('parentMenu'),
        itemWidth = this.get('itemWidth') || menu.layout.width,
        itemHeight = this.get('itemHeight') || SC.getSetting('DEFAULT_MENU_ITEM_HEIGHT'),
        escapeHTML = this.get('escapeHTML');

    this.set('itemWidth', itemWidth);
    this.set('itemHeight', itemHeight);

    //addressing accessibility
    if (this.get('isSeparator')) {
      //assign the role of separator
      context.setAttr('role', 'separator');
    } else if (this.get('isChecked')) {
      //assign the role of menuitemcheckbox
      context.setAttr('role', 'menuitemcheckbox');
      context.setAttr('aria-checked', true);
    }

    context = context.begin('a').addClass('menu-item');

    if (this.get('isSeparator')) {
      context.push('<span class="separator"></span>');
      context.addClass('disabled');
    } else {
      val = this.get('icon');
      if (val) {
        this.renderImage(context, val);
        context.addClass('has-icon');
      }

      val = this.get('title');
      if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
      this.renderLabel(context, val);

      val = this.get('toolTip');
      if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
      if (escapeHTML) {
        val = RenderContext.escapeHTML(val);
      }
      context.setAttr('title', val);

      if (this.get('isChecked')) {
        context.push('<div class="checkbox"></div>');
      }

      if (this.get('hasSubMenu')) {
        this.renderBranch(context);
      }

      val = this.get('shortcut');
      if (val) {
        this.renderShortcut(context, val);
      }
    }

    context = context.end();
  },

  /** @private
   Generates the image used to represent the image icon. override this to
   return your own custom HTML

   @param {RenderContext} context the render context
   @param {String} the source path of the image
   @returns {void}
  */
  renderImage: function (context, image) {
    // get a class name and url to include if relevant
    var classArray = ['icon'];
    if (image && ImageView.valueIsUrl(image)) {
      context.begin('img').addClass(classArray).setAttr('src', image).end();
    } else {
      classArray.push(image);
      context.begin('div').addClass(classArray).end();
    }
  },

  /** @private
   Generates the label used to represent the menu item. override this to
   return your own custom HTML

   @param {RenderContext} context the render context
   @param {String} menu item name
   @returns {void}
  */

  renderLabel: function (context, label) {
    if (this.get('escapeHTML')) {
      label = RenderContext.escapeHTML(label);
    }
    context.push("<span class='value ellipsis'>" + label + "</span>");
  },

  /** @private
   Generates the string used to represent the branch arrow. override this to
   return your own custom HTML

   @param {RenderContext} context the render context
   @returns {void}
  */
  renderBranch: function (context) {
    context.push('<span class="has-branch"></span>');
  },

  /** @private
   Generates the string used to represent the short cut keys. override this to
   return your own custom HTML

   @param {RenderContext} context the render context
   @param {String} the shortcut key string to be displayed with menu item name
   @returns {void}
  */
  renderShortcut: function (context, shortcut) {
    context.push('<span class = "shortcut">' + shortcut + '</span>');
  },

  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordingly.
  */
  showSubMenu: function () {
    var subMenu = this.get('subMenu');
    if (subMenu && !subMenu.get('isAttached')) {
      subMenu.set('mouseHasEntered', false);
      subMenu.popup(this, [0, 0, 0]);
    }

    this._subMenuTimer = null;
  },

  //..........................................
  // Mouse Events Handling
  //

  /** @private */
  mouseUp: function (evt) {
    // SproutCore's event system will deliver the mouseUp event to the view
    // that got the mouseDown event, but for menus we want to track the mouse,
    // so we'll do our own dispatching.
    var targetMenuItem;

    targetMenuItem = this.getPath('parentMenu.rootMenu.targetMenuItem');

    if (targetMenuItem) targetMenuItem.performAction();
    return true;
  },

  /** @private
    Called on mouse down to send the action to the target.

    This method will start flashing the menu item to indicate to the user that
    their selection has been received, unless disableMenuFlash has been set to
    true on the menu item.

    @returns {Boolean}
  */
  performAction: function () {
    // Clicking on a disabled menu item should close the menu.
    if (!this.get('isEnabled')) {
      this.getPath('parentMenu.rootMenu').remove();
      return true;
    }

    // Menus that contain submenus should ignore clicks
    if (this.get('hasSubMenu')) return false;

    var disableFlash = this.getContentProperty('itemDisableMenuFlashKey'),
        menu;

    if (disableFlash) {
      // Menu flashing has been disabled for this menu item, so perform
      // the action immediately.
      this.sendAction();
    } else {
      // Flash the highlight of the menu item to indicate selection,
      // then actually send the action once its done.
      this._flashCounter = 0;

      // Set a flag on the root menu to indicate that we are in a
      // flashing state. In the flashing state, no other menu items
      // should become selected.
      menu = this.getPath('parentMenu.rootMenu');
      menu._isFlashing = true;
      this.invokeLater(this.flashHighlight, 25);
      this.invokeLater(this.sendAction, 150);
    }

    return true;
  },

  /** @private
    Actually sends the action of the menu item to the target.
  */
  sendAction: function () {
    var action = this.getContentProperty('itemActionKey'),
        target = this.getContentProperty('itemTargetKey'),
        rootMenu = this.getPath('parentMenu.rootMenu'),
        responder;

    // Close the menu
    this.getPath('parentMenu.rootMenu').remove();
    // We're no longer flashing
    rootMenu._isFlashing = false;

    action = (action === undefined) ? rootMenu.get('action') : action;
    target = (target === undefined) ? rootMenu.get('target') : target;

    // Notify the root menu pane that the selection has changed
    rootMenu.set('selectedItem', this.get('content'));

    // Legacy support for actions that are functions
    if (SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [rootMenu]);
      //@if (debug)
      SC.Logger.warn('Support for menu item action functions has been deprecated. Please use target and action.');
      //@endif
    } else {
      responder = this.getPath('pane.rootResponder') || RootResponder.responder;

      if (responder) {
        // Send the action down the responder chain
        responder.sendAction(action, target, rootMenu);
      }
    }

  },

  /** @private
    Toggles the focus class name on the menu item layer to quickly flash the
    highlight. This indicates to the user that a selection has been made.

    This is initially called by performAction(). flashHighlight then keeps
    track of how many flashes have occurred, and calls itself until a maximum
    has been reached.
  */
  flashHighlight: function () {
    var flashCounter = this._flashCounter, layer = this.$();
    if (flashCounter % 2 === 0) {
      layer.addClass('focus');
    } else {
      layer.removeClass('focus');
    }

    if (flashCounter <= 2) {
      this.invokeLater(this.flashHighlight, 50);
      this._flashCounter++;
    }
  },

  /** @private*/
  mouseDown: function (evt) {
    // Accept primary clicks only.
    return evt.which === 1;
  },

  /** @private */
  mouseEntered: function (evt) {
    var menu = this.get('parentMenu'),
        rootMenu = menu.get('rootMenu');

    // Ignore mouse entering if we're in the middle of
    // a menu flash.
    if (rootMenu._isFlashing) return;

    menu.set('mouseHasEntered', true);
    this.set('mouseHasEntered', true);
    menu.set('currentMenuItem', this);

    // Become first responder to show highlight
    if (this.get('isEnabled')) {
      this.becomeFirstResponder();
    }

    if (this.get('hasSubMenu')) {
      this._subMenuTimer = this.invokeLater(this.showSubMenu, 100);
    }

    return true;
  },

  /** @private
    Set the focus based on whether the current menu item is selected or not.
  */
  mouseExited: function (evt) {
    var parentMenu, timer;

    // If we have a submenu, we need to give the user's mouse time to get
    // to the new menu before we remove highlight.
    if (this.get('hasSubMenu')) {
      // If they are exiting the view before we opened the submenu,
      // make sure we don't open it once they've left.
      timer = this._subMenuTimer;
      if (timer) {
        timer.invalidate();
      } else {
        this.invokeLater(this.checkMouseLocation, 100);
      }
    } else {
      parentMenu = this.get('parentMenu');

      if (parentMenu.get('currentMenuItem') === this) {
        parentMenu.set('currentMenuItem', null);
      }
    }

    return true;
  },

  /** @private */
  touchStart: function (evt) {
    this.mouseEntered(evt);
    return true;
  },

  /** @private */
  touchEnd: function (evt) {
    return this.mouseUp(evt);
  },

  /** @private */
  touchEntered: function (evt) {
    return this.mouseEntered(evt);
  },

  /** @private */
  touchExited: function (evt) {
    return this.mouseExited(evt);
  },

  /** @private */
  checkMouseLocation: function () {
    var subMenu = this.get('subMenu'), parentMenu = this.get('parentMenu'),
        currentMenuItem, previousMenuItem;

    if (!subMenu.get('mouseHasEntered')) {
      currentMenuItem = parentMenu.get('currentMenuItem');
      if (currentMenuItem === this || currentMenuItem === null) {
        previousMenuItem = parentMenu.get('previousMenuItem');

        if (previousMenuItem) {
          previousMenuItem.resignFirstResponder();
        }
        this.resignFirstResponder();
        subMenu.remove();
      }
    }
  },

  /** @private
    Call the moveUp function on the parent Menu
  */
  moveUp: function (sender, evt) {
    var menu = this.get('parentMenu');
    if (menu) {
      menu.moveUp(this);
    }
    return true;
  },

  /** @private
    Call the moveDown function on the parent Menu
  */
  moveDown: function (sender, evt) {
    var menu = this.get('parentMenu');
    if (menu) {
      menu.moveDown(this);
    }
    return true;
  },

  /** @private
    Call the function to create a branch
  */
  moveRight: function (sender, evt) {
    this.showSubMenu();
    return true;
  },

  /** @private
    Proxies insertText events to the parent menu so items can be selected
    by typing their titles.
  */
  insertText: function (chr, evt) {
    var menu = this.get('parentMenu');
    if (menu) {
      menu.insertText(chr, evt);
    }
  },

  /** @private*/
  keyDown: function (evt) {
    return this.interpretKeyEvents(evt);
  },

  /** @private*/
  keyUp: function (evt) {
    return true;
  },

  /** @private*/
  cancel: function (evt) {
    this.getPath('parentMenu.rootMenu').remove();
    return true;
  },

  /** @private*/
  didBecomeFirstResponder: function (responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu');
    if (parentMenu) {
      parentMenu.set('currentSelectedMenuItem', this);
    }
  },

  /** @private*/
  willLoseFirstResponder: function (responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu');
    if (parentMenu) {
      parentMenu.set('currentSelectedMenuItem', null);
      parentMenu.set('previousSelectedMenuItem', this);
    }
  },

  /** @private*/
  insertNewline: function (sender, evt) {
    this.mouseUp(evt);
  },

  /**
    Close the parent Menu and remove the focus of the current Selected
    Menu Item
  */
  closeParent: function () {
    this.$().removeClass('focus');
    var menu = this.get('parentMenu');
    if (menu) {
      menu.remove();
    }
  },

  /** @private*/
  clickInside: function (frame, evt) {
    return pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
  },


  // ..........................................................
  // CONTENT OBSERVING
  //

  /** @private
    Add an observer to ensure that we invalidate our cached properties
    whenever the content object’s associated property changes.
  */
  contentDidChange: function () {
    var content    = this.get('content'),
        oldContent = this._content;

    if (content === oldContent) return;

    var f = this.contentPropertyDidChange;
    // remove an observer from the old content if necessary
    if (oldContent  &&  oldContent.removeObserver) oldContent.removeObserver('*', this, f);

    // add observer to new content if necessary.
    this._content = content;
    if (content  &&  content.addObserver) content.addObserver('*', this, f);

    // notify that value did change.
    this.contentPropertyDidChange(content, '*') ;
  }.observes('content'),


  /** @private
    Invalidate our cached property whenever the content object’s associated
    property changes.
  */
  contentPropertyDidChange: function (target, key) {
    // If the key that changed in the content is one of the fields for which
    // we (potentially) cache a value, update our cache.
    var menu = this.get('parentMenu');
    if (!menu) return;

    var mapping           = MenuItemView._contentPropertyToMenuItemPropertyMapping,
        contentProperties = keys(mapping),
        i, len, contentProperty, menuItemProperty;


    // Are we invalidating all keys?
    if (key === '*') {
      for (i = 0, len = contentProperties.length;  i < len;  ++i) {
        contentProperty  = contentProperties[i];
        menuItemProperty = mapping[contentProperty];
        this.notifyPropertyChange(menuItemProperty);
      }
    }
    else {
      for (i = 0, len = contentProperties.length;  i < len;  ++i) {
        contentProperty  = contentProperties[i];
        if (menu.get(contentProperty) === key) {
          menuItemProperty = mapping[contentProperty];
          this.notifyPropertyChange(menuItemProperty);

          // Note:  We won't break here in case the menu is set up to map
          //        multiple properties to the same content key.
        }
      }
    }
  }

});


// ..........................................................
// CLASS PROPERTIES
//

/** @private
  A mapping of the "content property key" keys to the properties we use to
  wrap them.  This hash is used in 'contentPropertyDidChange' to ensure that
  when the content changes a property that is locally cached inside the menu
  item, the cache is properly invalidated.

  Implementor note:  If you add such a cached property, you must add it to
                     this mapping.
*/
MenuItemView._contentPropertyToMenuItemPropertyMapping = {
  itemTitleKey: 'title',
  itemValueKey: 'value',
  itemToolTipKey: 'toolTip',
  itemIsEnabledKey: 'isEnabled',
  itemIconKey: 'icon',
  itemSeparatorKey: 'isSeparator',
  itemShortCutKey: 'shortcut',
  itemCheckboxKey: 'isChecked',
  itemSubMenuKey: 'subMenu'
};
