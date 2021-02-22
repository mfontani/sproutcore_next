// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { View } from '../../view/view.js';
/**
  Layout properties needed to anchor a view to the top.

  @static
  @constant
  @type Hash
  @default `{ top: 0 }`
*/
export const ANCHOR_TOP = { top: 0 };

/**
  Layout properties needed to anchor a view to the left.

  @static
  @constant
  @type Hash
  @default `{ left: 0 }`
*/
export const ANCHOR_LEFT = { left: 0 };

/*
  Layout properties to anchor a view to the top left

  @static
  @constant
  @type Hash
  @default `{ top: 0, left: 0 }`
*/
export const ANCHOR_TOP_LEFT = { top: 0, left: 0 };

/**
  Layout properties to anchoe view to the bottom.

  @static
  @constant
  @type Hash
  @default `{ bottom: 0 }`
*/
export const ANCHOR_BOTTOM = { bottom: 0 };

/**
  Layout properties to anchor a view to the right.

  @static
  @constant
  @type Hash
  @default `{ right: 0 }`
*/
export const ANCHOR_RIGHT = { right: 0 };

/**
  Layout properties to anchor a view to the bottom right.

  @static
  @constant
  @type Hash
  @default `{ top: 0, right: 0 }`
*/
export const ANCHOR_BOTTOM_RIGHT = { bottom: 0, right: 0 };

/** @class

  ToolbarView is a simple horizontal view that has been styled like a
  toolbar and can be easily anchored at the top or bottom of a parent view.

  To anchor to the top of the parent view, set `anchorLocation` to
  `ANCHOR_TOP` or to anchor to the bottom, set `anchorLocation` to
  `ANCHOR_BOTTOM`.  The default layout of Toolbar is
  `{ left: 0, right: 0, height: 32, zIndex: 10 }` and so by setting the value of
  `anchorLocation`, the layout will be modified to either:

  `ANCHOR_TOP:`
      { borderBottom: 1, top: 0, left: 0, right: 0, height: 32, zIndex: 10 }

  `ANCHOR_BOTTOM:`
      { borderTop: 1, bottom: 0, left: 0, right: 0, height: 32, zIndex: 10 }

  Of course, you can always override the layout property yourself in order to
  adjust the height, border and zIndex values.

  
  @since SproutCore 1.0
*/
export const ToolbarView = View.extend(
/** @scope ToolbarView.prototype */ {

  /**
    @type Array
    @default ['sc-toolbar-view']
    @see View#classNames
  */
  classNames: ['sc-toolbar-view'],

  /**
    The WAI-ARIA role for toolbar view.

    @type String
    @default 'toolbar'
    @readOnly
  */
  ariaRole: 'toolbar',

  /**
    @type String
    @default 'toolbarRenderDelegate'
  */
  renderDelegateName: 'toolbarRenderDelegate',

  /**
    Default anchor location.  This will be applied automatically to the
    toolbar layout if you set it. Possible values:

      - ANCHOR_TOP
      - ANCHOR_LEFT
      - ANCHOR_TOP_LEFT
      - ANCHOR_BOTTOM
      - ANCHOR_RIGHT
      - ANCHOR_BOTTOM_RIGHT

    @type String
    @default null
  */
  anchorLocation: null,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  layout: { left: 0, right: 0, height: 32, zIndex: 10 },

  /** @private */
  init: function init () {
    // apply anchor location before setting up the rest of the view.
    if (this.anchorLocation) {
      this.layout = SC.merge(this.layout, this.anchorLocation);

      switch (this.anchorLocation) {
      case ANCHOR_TOP:
      case ANCHOR_TOP_LEFT:
        this.layout.borderBottom = 1;
        break;
      case ANCHOR_BOTTOM:
      case ANCHOR_BOTTOM_RIGHT:
        this.layout.borderTop = 1;
        break;
      default:
      }
    }

    init.base.apply(this, arguments);
  }

});

