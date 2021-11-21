// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { CoreView, Pane } from "../../view/view.js";
import { ModalPane } from "./modal.js";
import { SC } from '../../core/core.js';



/** @class

  Most SproutCore applications need modal panels. The default way to use the
  panel pane is to simply add it to your page like this:

      PanelPane.create({
        layout: { width: 400, height: 200, centerX: 0, centerY: 0 },
        contentView: View.extend({
        })
      }).append();

  This will cause your panel to display.  The default layout for a Panel
  is to cover the entire document window with a semi-opaque background, and to
  resize with the window.

  @author Erich Ocean
  @since SproutCore 1.0
*/
export const PanelPane = Pane.extend(
/** @scope PanelPane.prototype */ {

    /**
      Walk like a duck.
      @type {Boolean}
    */
    isPanelPane: true,

    /**
      @type Array
      @default ['sc-panel']
      @see View#classNames
    */
    classNames: ['sc-panel'],

    /**
      @type Boolean
      @default true
      @see Pane#acceptsKeyPane
    */
    acceptsKeyPane: true,

    /**
      The WAI-ARIA role for panel pane.
  
      @type String
      @default 'dialog'
      @constant
    */
    ariaRole: 'dialog',

    /**
      The WAI-ARIA label for the panel. Screen readers will use this to tell
      the user a name for the panel.
  
      @type String
    */
    ariaLabel: null,

    /**
      The WAI-ARIA labelledby for the panel. Screen readers will use this to tell
      the header or name of your panel if there is no label. This should be an id
      to an element inside the panel.
  
      @type String
    */
    ariaLabelledBy: null,

    /**
      The WAI-ARIA describedby text. Screen readers will use this to speak the description
      of the panel. This should be an id to an element inside the panel.
  
      @type String
    */
    ariaDescribedBy: null,

    /**
      Indicates that a pane is modal and should not allow clicks to pass
      though to panes underneath it. This will usually cause the pane to show
      the modalPane underneath it.
  
      @type Boolean
      @default true
    */
    isModal: true,

    /**
      The modal pane to place behind this pane if this pane is modal. This
      must be a subclass or an instance of ModalPane.
    */
    modalPane: ModalPane.extend({
      classNames: 'for-sc-panel'
    }),

    // ..........................................................
    // CONTENT VIEW
    //

    /**
      Set this to the view you want to act as the content within the panel.
  
      @type View
      @default null
    */
    contentView: null,
    contentViewBindingDefault: SC.Binding.single(),

    /**
      @param {View} newContent
    */
    replaceContent: function (newContent) {
      this.removeAllChildren();
      if (newContent) this.appendChild(newContent);
    },

    /** @private */
    createChildViews: function () {
      // if contentView is defined, then create the content
      var view = this.contentView;
      if (view) {
        view = this.contentView = this.createChildView(view);
        this.childViews = [view];
      }
    },


    /**
      Invoked whenever the content property changes. This method will simply
      call replaceContent. Override replaceContent to change how the view is
      swapped out.
    */
    contentViewDidChange: function () {
      this.replaceContent(this.get('contentView'));
    }.observes('contentView'),

    // ..........................................................
    // INTERNAL SUPPORT
    //

    /**
      The name of the theme's `PanelPane` render delegate.
  
      @type String
      @default 'panelRenderDelegate'
    */
    renderDelegateName: 'panelRenderDelegate',

    // get the modal pane.
    _modalPane: function () {
      var pane = this.get('modalPane');

      // instantiate if needed
      if (pane && pane.isClass) {
        pane = pane.create({ owner: this });
        this.set('modalPane', pane);
      }

      return pane;
    },

    /** @private - whenever showing on screen, deal with modal pane as well */
    appendTo: function appendTo(elem) {
      var pane;
      // show the modal only if the pane is currently not visible, or if the pane
      // is currently transitioning out
      if ((!this.get('isVisibleInWindow') || this.get('viewState') == CoreView.ATTACHED_BUILDING_OUT) && this.get('isModal') && (pane = this._modalPane())) {
        this._isShowingModal = true;
        pane.paneWillAppend(this);
      }
      // return sc_super();
      return appendTo.base.apply(this, arguments);
    },

    /** @private - when removing from screen, deal with modal pane as well. */
    remove: function remove() {
      var pane, ret = remove.base.apply(this, arguments)

      if (this._isShowingModal) {
        this._isShowingModal = false;
        if (pane = this._modalPane()) pane.paneDidRemove(this);
      }
      return ret;
    },

    destroy: function destroy() {
      var modal = this.get('modalPane');
      if (modal && !modal.isClass) {
        modal.destroy();
      }

      destroy.base.apply(this, arguments);
    },

    /** @private - if isModal state changes, update pane state if needed. */
    _isModalDidChange: function () {
      var modalPane,
        isModal = this.get('isModal');

      if (isModal) {
        if (!this._isShowingModal && (modalPane = this._modalPane())) {
          this._isShowingModal = true;
          modalPane.paneWillAppend(this);
        }
      } else {
        if (this._isShowingModal && (modalPane = this._modalPane())) {
          this._isShowingModal = false;
          modalPane.paneDidRemove(this);
        }
      }
    }.observes('isModal'),

    /**
      Called when the pane is shown.  Takes on key pane status.
    */
    didShowInDocument: function () {
      this.becomeKeyPane();
    },

    /**
      Called when the pane is attached.  Takes on key pane status.
    */
    didAppendToDocument: function () {
      this.becomeKeyPane();
    },

    /**
      Called when the pane is detached.  Resigns key pane status.
    */
    willRemoveFromDocument: function () {
      this.resignKeyPane();
    },

    /**
      Called when the pane is about to be hidden.  Resigns key pane status.
    */
    willHideInDocument: function () {
      this.resignKeyPane();
    },

    displayProperties: ['ariaLabel', 'ariaLabelledBy', 'ariaDescribedBy']

  });
