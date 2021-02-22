// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { HOLD_BEHAVIOR } from '../system/constants.js';
import { ButtonView } from "./button.js";

/** @class

  Represents a Checkbox Button.

  The view is an `ButtonView` put into toggle mode and with the 'theme' property
  set to "checkbox".

  Rendering
  ----------------------------
  ButtonView delegates its rendering to its theme. As the theme is set
  to "checkbox", the way the checkbox renders (including DOM) will actually
  be different than ButtonView's.

  @since SproutCore 1.0
*/
export const CheckboxView = ButtonView.extend(
/** @scope CheckboxView.prototype */ {

  /**
    @type Array
    @default ['sc-checkbox-view', 'sc-checkbox-control']
    @see View#classNames
  */
  classNames: ['sc-checkbox-view', 'sc-checkbox-control'],

  /**
    The WAI-ARIA role of checkbox.

    @type String
    @readOnly
  */
  ariaRole: 'checkbox',

  // no special theme for Checkbox; button defaults to 'square', so we have to stop that.
  themeName: null,

  /**
    @type String
    @default 'checkboxRenderDelegate'
  */
  renderDelegateName: 'checkboxRenderDelegate',

  /**
    Ellipsis is disabled by default to allow multiline text

    @type Boolean
    @default false
  */
  needsEllipsis: false,

  /**
    `true` if `isEnabledInPane` is `true`, `false` otherwise

    @type Boolean
    @default false
    @observes isEnabledInPane
  */
  acceptsFirstResponder: function() {
    if (SC.getSetting('FOCUS_ALL_CONTROLS')) { return this.get('isEnabledInPane'); }
    return false;
  }.property('isEnabledInPane'),

  /** @private */
  _toggleValue: function(){
    var isOn = this.get('value') === this.get('toggleOnValue');
    this.set('value', isOn ? this.get('toggleOffValue') : this.get('toggleOnValue'));
  },

  /** @private */
  mouseDown: function(evt) {
    // Fast path, reject secondary clicks.
    if (evt.which && evt.which !== 1) return false;

    if(!this.get('isEnabledInPane')) return true;
    this.set('isActive', true);
    this._isMouseDown = true;
    if (evt && this.get('acceptsFirstResponder')) evt.allowDefault();
    return true;
  },

  /** @private */
  mouseUp: function(evt) {
    if(!this.get('isEnabledInPane')) return true;

    this.set('isActive', false);
    this._isMouseDown = false;

    // fire action
    if (this.get('buttonBehavior') !== HOLD_BEHAVIOR) {
      if (this.$().within(evt.target)) {
        this._toggleValue();
        this._action(evt);
      }
    }

    return true;

  },

  /** @private */
  keyDown: function(evt) {
    // handle tab key
    if(!this.get('isEnabledInPane')) return true;

    if (evt.which === 9 || evt.keyCode === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder(evt);
      else evt.allowDefault();
      return true ; // handled
    }

    if (evt.which === 13 || evt.which === 32) {
      this._toggleValue();

      // fire action
      if (this.get('buttonBehavior') !== HOLD_BEHAVIOR) {
        if (this.$().within(evt.target)) { this._action(evt); }
      }

      return true ; // handled
    }

    // let other keys through to browser
    evt.allowDefault();

    return false;
  },



  /** @private */
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  /** @private */
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }

});
