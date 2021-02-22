// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { browser } from '../../event/event.js';
import { ActionSupport, Control, MIXED_STATE, propertyFromRenderDelegate, View } from '../../view/view.js';
import { HOLD_BEHAVIOR, PUSH_BEHAVIOR, TOGGLE_BEHAVIOR, TOGGLE_OFF_BEHAVIOR, TOGGLE_ON_BEHAVIOR } from '../system/constants.js';

/** @class

  Implements a push-button-style button.  This class is used to implement
  both standard push buttons and tab-style controls.  See also CheckboxView
  and RadioView which are implemented as field views, but can also be
  treated as buttons.

  By default, a button uses the Control mixin which will apply CSS
  classnames when the state of the button changes:

   - `active` -- when button is active
   - `sel` -- when button is toggled to a selected state

  @since SproutCore 1.0
*/
export const ButtonView = View.extend(ActionSupport, Control,
/** @scope ButtonView.prototype */ {

  /**
    Tied to the isEnabledInPane state

    @type Boolean
    @default true
  */
  acceptsFirstResponder: function() {
    if (SC.getSetting('FOCUS_ALL_CONTROLS')) { return this.get('isEnabledInPane'); }
    return false;
  }.property('isEnabledInPane'),

  /**
    The name of the method to call when the button is pressed.

    This property is used in conjunction with the `target` property to execute a method when a
    regular button is pressed. If you do not set a target, then pressing the button will cause a
    search of the responder chain for a view that implements the action named. If you do set a
    target, then the button will only try to call the method on that target.

    The action method of the target should implement the following signature:

        action: function (sender) {
          // Return value is ignored by ButtonView.
        }

    Therefore, if a target needs to know which button called its action, it should look to the
    `sender` argument.

    *NOTE:* This property is not relevant when the button is used in toggle mode. Toggle mode only
    modifies the `value` of the button without triggering actions.

    @type String
    @default null
    @see ActionSupport
  */
  action: null,

  /**
    @type Array
    @default ['sc-button-view']
    @see View#classNames
  */
  classNames: ['sc-button-view'],

  /**
    Whether the title and toolTip will be escaped to avoid HTML injection attacks
    or not.

    You should only disable this option if you are sure you are displaying
    non-user generated text.

    Note: this is not an observed display property.  If you change it after
    rendering, you should call `displayDidChange` on the view to update the layer.

    @type Boolean
    @default true
   */
  escapeHTML: true,

  /**
    The target to invoke the action on when the button is pressed.

    If you set this target, the action will be called on the target object directly when the button
    is clicked.  If you leave this property set to `null`, then the responder chain will be
    searched for a view that implements the action when the button is pressed.

    The action method of the target should implement the following signature:

        action: function (sender) {
          // Return value is ignored by ButtonView.
        }

    Therefore, if a target needs to know which button called its action, it should look to the
    `sender` argument.

    *NOTE:* This property is not relevant when the button is used in toggle mode. Toggle mode only
    modifies the `value` of the button without triggering actions.

    @type Object
    @default null
    @see ActionSupport
  */
  target: null,

  /**
    The theme to apply to the button. By default, a subtheme with the name of
    'square' is created for backwards-compatibility.

    @type String
    @default 'square'
  */
  themeName: 'square',


  // ..........................................................
  // Value Handling
  //

  /**
    Used to automatically update the state of the button view for toggle style
    buttons.

    For toggle style buttons, you can set the value and it will be used to
    update the isSelected state of the button view.  The value will also
    change as the user selects or deselects.  You can control which values
    the button will treat as `isSelected` by setting the `toggleOnValue` and
    `toggleOffValue`.  Alternatively, if you leave these properties set to
    `true` or `false`, the button will do its best to convert a value to an
    appropriate state:

     - `null`, `false`, `0` -- `isSelected = false`
     - any other single value -- `isSelected = true`
     - array -- if all values are the same state, that state; otherwise `MIXED`.

    @type Object
    @default null
  */
  value: null,

  /**
    Value of a selected toggle button.

    For a toggle button, set this to any object value you want. The button
    will be selected if the value property equals the targetValue. If the
    value is an array of multiple items that contains the targetValue, then
    the button will be set to a mixed state.

    default is true

    @type Boolean|Object
    @default true
  */
  toggleOnValue: true,

  /**
    Value of an unselected toggle button.

    For a toggle button, set this to any object value you want.  When the
    user toggle's the button off, the value of the button will be set to this
    value.

    @type Boolean|Object
    @default false
  */
  toggleOffValue: false,


  // ..........................................................
  // Title Handling
  //

  /**
    If true, then the title will be localized.

    @type Boolean
    @default false
  */
  localize: false,

  /** @private */
  localizeBindingDefault: SC.Binding.bool(),

  /**
    The button title.  If localize is `true`, then this should be the
    localization key to display.  Otherwise, this will be the actual string
    displayed in the title.  This property is observable and bindable.

    @type String
    @default ""
  */
  title: "",

  /**
    If set, the title property will be updated automatically
    from the content using the key you specify.

    @type String
    @default null
  */
  contentTitleKey: null,

  /**
    The button icon. Set this to either a URL or a CSS class name (for
    spriting). Note that if you pass a URL, it must contain at
    least one slash to be detected as such.

    @type String
    @default null
  */
  icon: null,

  /**
    If you set this property, the icon will be updated automatically from the
    content using the key you specify.

    @type String
    @default null
  */
  contentIconKey: null,

  /**
    If true, button will attempt to display an ellipsis if the title cannot
    fit inside of the visible area. This feature is not available on all
    browsers.

    Note: this is not an observed display property.  If you change it after
    rendering, you should call `displayDidChange` on the view to update the layer.

    @type Boolean
    @default true
  */
  needsEllipsis: true,

  /**
    This is generated by localizing the title property if necessary.

    @type String
    @observes 'title'
    @observes 'localize'
  */
  displayTitle: function() {
    var ret = this.get('title');
    return (ret && this.get('localize')) ? String.loc(ret) : (ret || '');
  }.property('title','localize').cacheable(),

  /**
    The key equivalent that should trigger this button on the page.

    @type String
    @default null
  */
  keyEquivalent: null,


  // ..........................................................
  // BEHAVIOR
  //

  /**
    The behavioral mode of this button.

    Possible values are:

     - `PUSH_BEHAVIOR` -- Pressing the button will trigger an action tied to the
       button. Does not change the value of the button.
     - `TOGGLE_BEHAVIOR` -- Pressing the button will invert the current value of
       the button. If the button has a mixed value, it will be set to true.
     - `TOGGLE_ON_BEHAVIOR` -- Pressing the button will set the current state to
       true no matter the previous value.
     - `TOGGLE_OFF_BEHAVIOR` -- Pressing the button will set the current state to
       false no matter the previous value.
     - `HOLD_BEHAVIOR` -- Pressing the button will cause the action to repeat at a
       regular interval specified by 'holdInterval'

    @type String
    @default PUSH_BEHAVIOR
  */
  buttonBehavior: PUSH_BEHAVIOR,

  /*
    If buttonBehavior is `HOLD_BEHAVIOR`, this specifies, in milliseconds,
    how often to trigger the action. Ignored for other behaviors.

    @type Number
    @default 100
  */
  holdInterval: 100,

  /**
    If true, then this button will be triggered when you hit return.

    This is the same as setting the `keyEquivalent` to 'return'.  This will also
    apply the "def" classname to the button.

    @type Boolean
    @default false
  */
  isDefault: false,
  isDefaultBindingDefault: SC.Binding.oneWay().bool(),

  /**
    If true, then this button will be triggered when you hit escape.
    This is the same as setting the keyEquivalent to 'escape'.

    @type Boolean
    @default false
  */
  isCancel: false,
  isCancelBindingDefault: SC.Binding.oneWay().bool(),

  /*
    TODO When is this property ever changed? Is this redundant with
    render delegates since it can now be turned on on a theme-by-theme
    basis? --TD
  */
  /**
    If true, use a focus ring.

    @type Boolean
    @default false
  */
  supportFocusRing: false,

  // ..........................................................
  // Auto Resize Support
  //
  //
  // These properties are provided so that AutoResize can be mixed in
  // to enable automatic resizing of the button.
  //

  /** @private */
  supportsAutoResize: true,

  /*
    TODO get this from the render delegate so other elements may be used.
  */
  /** @private */
  autoResizeLayer: function() {
    var ret = this.invokeRenderDelegateMethod('getRenderedAutoResizeLayer', this.$());
    return ret || this.get('layer');
  }.property('layer').cacheable(),

  /** @private */
  autoResizeText: function() {
    return this.get('displayTitle');
  }.property('displayTitle').cacheable(),

  /**
    The padding to add to the measured size of the text to arrive at the measured
    size for the view.

    `ButtonView` gets this from its render delegate, but if not supplied, defaults
    to 10.

    @default 10
    @type Number
  */
  autoResizePadding: propertyFromRenderDelegate('autoResizePadding', 10),


  // TODO: What the hell is this? --TD
  _labelMinWidthIE7: 0,

  /**
    Called when the user presses a shortcut key, such as return or cancel,
    associated with this button.

    Highlights the button to show that it is being triggered, then, after a
    delay, performs the button's action.

    Does nothing if the button is disabled.

    @param {Event} evt
    @returns {Boolean} true if successful, false otherwise
  */
  triggerActionAfterDelay: function(evt) {
    // If this button is disabled, we have nothing to do
    if (!this.get('isEnabledInPane')) return false;

    // Set active state of the button so it appears highlighted
    this.set('isActive', true);

    // Invoke the actual action method after a small delay to give the user a
    // chance to see the highlight. This is especially important if the button
    // closes a pane, for example.
    this.invokeLater('triggerAction', ButtonView.TRIGGER_DELAY, evt);
    return true;
  },

  /** @private
    Called by triggerActionAfterDelay; this method actually
    performs the action and restores the button's state.

    @param {Event} evt
  */
  triggerAction: function(evt) {
    this._action(evt, true);
    this.didTriggerAction();
    this.set('isActive', false);
  },

  /**
    Callback called anytime the button's action is triggered.  You can
    implement this method in your own subclass to perform any cleanup needed
    after an action is performed.
  */
  didTriggerAction: function() {},


  // ................................................................
  // INTERNAL SUPPORT
  //

  /** @private - save keyEquivalent for later use */
  init: function init () {
    init.base.apply(this, arguments);

    var keyEquivalent = this.get('keyEquivalent');
    // Cache the key equivalent. The key equivalent is saved so that if,
    // for example, isDefault is changed from true to false, the old key
    // equivalent can be restored.
    if (keyEquivalent) {
      this._defaultKeyEquivalent = keyEquivalent;
    }

    // if value is not null, update isSelected to match value.  If value is
    // null, we assume you may be using isSelected only.
    if (!SC.none(this.get('value'))) this._button_valueDidChange();
  },

  /**
    The WAI-ARIA role of the button.

    @type String
    @default 'button'
    @readOnly
  */
  ariaRole: 'button',

  /**
    The following properties affect how `ButtonView` is rendered, and will
    cause the view to be rerendered if they change.

    Note: 'value', 'isDefault', 'isCancel' are also display properties, but are
    observed separately.

    @type Array
    @default ['icon', 'displayTitle', 'displayToolTip', 'supportFocusRing', 'buttonBehavior']
  */
  displayProperties: ['icon', 'displayTitle', 'displayToolTip', 'supportFocusRing', 'buttonBehavior'],

  /**
    The name of the render delegate in the theme that should be used to
    render the button.

    In this case, the 'button' property will be retrieved from the theme and
    set to the render delegate of this view.

    @type String
    @default 'buttonRenderDelegate'
  */
  renderDelegateName: 'buttonRenderDelegate',

  contentKeys: {
    'contentValueKey': 'value',
    'contentTitleKey': 'title',
    'contentIconKey': 'icon'
  },

  /**
    Handle a key equivalent if set.  Trigger the default action for the
    button.  Depending on the implementation this may vary.

    @param {String} keystring
    @param {Event} evt
    @returns {Boolean}  true if handled, false otherwise
  */
  performKeyEquivalent: function(keystring, evt) {
    //If this is not visible
    if (!this.get('isVisibleInWindow')) return false;

    if (!this.get('isEnabledInPane')) return false;
    var equiv = this.get('keyEquivalent');

    // button has defined a keyEquivalent and it matches!
    // if triggering succeeded, true will be returned and the operation will
    // be handled (i.e performKeyEquivalent will cease crawling the view
    // tree)
    if (equiv) {
      if (equiv === keystring) return this.triggerAction(evt);

    // should fire if isDefault OR isCancel.  This way if isDefault AND
    // isCancel, responds to both return and escape
    } else if ((this.get('isDefault') && (keystring === 'return')) ||
        (this.get('isCancel') && (keystring === 'escape'))) {
          return this.triggerAction(evt);
    }

    return false; // did not handle it; keep searching
  },

  // ..........................................................
  // VALUE <-> isSelected STATE MANAGEMENT
  //

  /**
    This is the standard logic to compute a proposed isSelected state for a
    new value.  This takes into account the `toggleOnValue`/`toggleOffValue`
    properties, among other things.  It may return `true`, `false`, or
    `MIXED_STATE`.

    @param {Object} value
    @returns {Boolean} return state
  */
  computeIsSelectedForValue: function(value) {
    var targetValue = this.get('toggleOnValue'), state, next ;

    if (SC.typeOf(value) === SC.T_ARRAY) {

      // treat a single item array like a single value
      if (value.length === 1) {
        state = (value[0] == targetValue) ;

      // for a multiple item array, check the states of all items.
      } else {
        state = null;
        value.find(function(x) {
          next = (x == targetValue) ;
          if (state === null) {
            state = next ;
          } else if (next !== state) state = MIXED_STATE ;
          return state === MIXED_STATE ; // stop when we hit a mixed state.
        });
      }

    // for single values, just compare to the toggleOnValue...use truthiness
    } else {
      if(value === MIXED_STATE) state = MIXED_STATE;
      else state = (value === targetValue) ;
    }
    return state ;
  },

  /** @private
    Whenever the button value changes, update the selected state to match.
  */
  _button_valueDidChange: function() {
    var value = this.get('value'),
        state = this.computeIsSelectedForValue(value);
    this.set('isSelected', state) ; // set new state...

    // value acts as a display property
    this.displayDidChange();
  }.observes('value'),

  /** @private
    Whenever the selected state is changed, make sure the button value is
    also updated.  Note that this may be called because the value has just
    changed.  In that case this should do nothing.
  */
  _button_isSelectedDidChange: function() {
    var newState = this.get('isSelected'),
        curState = this.computeIsSelectedForValue(this.get('value'));

    // fix up the value, but only if computed state does not match.
    // never fix up value if isSelected is set to MIXED_STATE since this can
    // only come from the value.
    if ((newState !== MIXED_STATE) && (curState !== newState)) {
      var valueKey = (newState) ? 'toggleOnValue' : 'toggleOffValue' ;
      this.set('value', this.get(valueKey));
    }
  }.observes('isSelected'),


  /** @private
    Used to store the keyboard equivalent.

    Setting the isDefault property to true, for example, will cause the
    `keyEquivalent` property to 'return'. This cached value is used to restore
    the `keyEquivalent` property if isDefault is set back to false.

    @type String
  */
  _defaultKeyEquivalent: null,

  /** @private

    Whenever the isDefault or isCancel property changes, re-render and change
    the keyEquivalent property so that we respond to the return or escape key.
  */
  _isDefaultOrCancelDidChange: function() {
    var isDefault = !!this.get('isDefault'),
        isCancel = !isDefault && this.get('isCancel') ;

    if (isDefault) {
      this.set('keyEquivalent', 'return'); // change the key equivalent
    } else if (isCancel) {
      this.set('keyEquivalent', 'escape') ;
    } else {
      // Restore the default key equivalent
      this.set('keyEquivalent', this._defaultKeyEquivalent);
    }

    // isDefault and isCancel act as display properties
    this.displayDidChange();
  }.observes('isDefault', 'isCancel'),

  /** @private
    On mouse down, set active only if enabled.
  */
  mouseDown: function(evt) {
    // Fast path, reject secondary clicks.
    if (evt.which !== 1) return false;

    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabledInPane')) return true ; // handled event, but do nothing
    this.set('isActive', true);
    this._isMouseDown = true;

    if (buttonBehavior === HOLD_BEHAVIOR) {
      this._action(evt);
    } else if (!this._isFocused && (buttonBehavior!==PUSH_BEHAVIOR)) {
      this._isFocused = true ;
      this.becomeFirstResponder(evt);
    }

    return true;
  },

  /** @private
    Remove the active class on mouseExited if mouse is down.
  */
  mouseExited: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', false);
    }
    return true;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */
  mouseEntered: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', true);
    }
    return true;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', false); // track independently in case isEnabledInPane has changed
    this._isMouseDown = false;

    if (this.get('buttonBehavior') !== HOLD_BEHAVIOR) {
      var inside = this.$().within(evt.target);
      if (inside && this.get('isEnabledInPane')) this._action(evt) ;
    }

    return true ;
  },

  /** @private */
  touchStart: function(touch){
    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabledInPane')) return true ; // handled event, but do nothing
    this.set('isActive', true);

    if (buttonBehavior === HOLD_BEHAVIOR) {
      this._action(touch);
    } else if (!this._isFocused && (buttonBehavior!==PUSH_BEHAVIOR)) {
      this._isFocused = true ;
      this.becomeFirstResponder(touch);
    }

    // don't want to do whatever default is...
    touch.preventDefault();

    return true;
  },

  /** @private */
  touchesDragged: function(evt, touches) {
    if (!this.touchIsInBoundary(evt)) {
      if (!this._touch_exited) this.set('isActive', false);
      this._touch_exited = true;
    } else {
      if (this._touch_exited) this.set('isActive', true);
      this._touch_exited = false;
    }

    evt.preventDefault();
    return true;
  },

  /** @private */
  touchEnd: function(touch){
    this._touch_exited = false;
    this.set('isActive', false); // track independently in case isEnabledInPane has changed

    if (this.get('buttonBehavior') !== HOLD_BEHAVIOR) {
      if (this.touchIsInBoundary(touch) && this.get('isEnabledInPane')) {
        this._action();
      }
    }

    touch.preventDefault();
    return true ;
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
      this.triggerActionAfterDelay(evt);
      return true ; // handled
    }

    // let other keys through to browser
    evt.allowDefault();

    return false;
  },

  /** @private
    Perform an action based on the behavior of the button.

     - toggle behavior: switch to on/off state
     - on behavior: turn on.
     - off behavior: turn off.
     - otherwise: invoke target/action
  */
  _action: function(evt, skipHoldRepeat) {
    switch(this.get('buttonBehavior')) {

    // When toggling, try to invert like values. i.e. 1 => 0, etc.
    case TOGGLE_BEHAVIOR:
      var sel = this.get('isSelected') ;
      if (sel) {
        this.set('value', this.get('toggleOffValue')) ;
      } else {
        this.set('value', this.get('toggleOnValue')) ;
      }
      break ;

    // set value to on.  change 0 => 1.
    case TOGGLE_ON_BEHAVIOR:
      this.set('value', this.get('toggleOnValue')) ;
      break ;

    // set the value to false. change 1 => 0
    case TOGGLE_OFF_BEHAVIOR:
      this.set('value', this.get('toggleOffValue')) ;
      break ;

    case HOLD_BEHAVIOR:
      this._runHoldAction(evt, skipHoldRepeat);
      break ;

    // otherwise, just trigger an action if there is one.
    default:
      //if (this.action) this.action(evt);
      this._runAction(evt);
    }
  },

  /** @private */
  _runAction: function(evt) {
    var action = this.get('action');

    if (action) {
      // Legacy support for action functions.
      if (action && (SC.typeOf(action) === SC.T_FUNCTION)) {
        this.action(evt);

      // Use ActionSupport.
      } else {
        this.fireAction();
      }
    }
  },

  /** @private */
  _runHoldAction: function(evt, skipRepeat) {
    if (this.get('isActive')) {
      this._runAction();

      if (!skipRepeat) {
        // This run loop appears to only be necessary for testing
        SC.RunLoop.begin();
        this.invokeLater('_runHoldAction', this.get('holdInterval'), evt);
        SC.RunLoop.end();
      }
    }
  },


  /** @private */
  didBecomeKeyResponderFrom: function(keyView, evt) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = true ;
      this.becomeFirstResponder(evt);
      if (this.get('isVisibleInWindow')) {
        this.$().focus();
      }
    }
  },

  /** @private */
  willLoseKeyResponderTo: function(responder, evt) {
    if (this._isFocused) this._isFocused = false ;
  },

  /** @private */
  didAppendToDocument: function() {
    if(browser.isIE &&
        browser.compare(browser.version, '7') === 0 &&
        this.get('useStaticLayout')){
      var layout = this.get('layout'),
          elem = this.$(), w=0;
      if(elem && elem[0] && (w=elem[0].clientWidth) && w!==0 && this._labelMinWidthIE7===0){
        var label = this.$('.sc-button-label'),
            paddingRight = parseInt(label.css('paddingRight'),0),
            paddingLeft = parseInt(label.css('paddingLeft'),0),
            marginRight = parseInt(label.css('marginRight'),0),
            marginLeft = parseInt(label.css('marginLeft'),0);
        if(marginRight=='auto') Logger.log(marginRight+","+marginLeft+","+paddingRight+","+paddingLeft);
        if(!paddingRight && isNaN(paddingRight)) paddingRight = 0;
        if(!paddingLeft && isNaN(paddingLeft)) paddingLeft = 0;
        if(!marginRight && isNaN(marginRight)) marginRight = 0;
        if(!marginLeft && isNaN(marginLeft)) marginLeft = 0;

        this._labelMinWidthIE7 = w-(paddingRight + paddingLeft)-(marginRight + marginLeft);
        label.css('minWidth', this._labelMinWidthIE7+'px');
      }else{
        this.invokeLater(this.didAppendToDocument, 1);
      }
    }
  }

}) ;

/**
  How long to wait before triggering the action.

  @constant
  @type {Number}
*/
ButtonView.TRIGGER_DELAY = 200;

/**
  The delay after which "click" behavior should transition to "click and hold"
  behavior. This is used by subclasses such as PopupButtonView and
  SelectButtonView.

  @constant
  @type Number
*/
ButtonView.CLICK_AND_HOLD_DELAY = browser.isIE ? 600 : 300;

SC.setSetting('REGULAR_BUTTON_HEIGHT', 24);
