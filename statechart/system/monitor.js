// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

import { SC } from '../../core/core.js';
import { StatechartSequenceMatcher } from './sequence_matcher.js';

export const StatechartMonitor = SC.Object.extend({
  
  statechart: null,
  
  sequence: null,
  
  init: function init () {
    init.base.apply(this, arguments);
    this.reset();
  },
  
  reset: function() {
    this.propertyWillChange('length');
    this.sequence = [];
    this.propertyDidChange('length');
  },
  
  length: function() {
    return this.sequence.length;
  }.property(),
  
  pushEnteredState: function(state) {
    this.propertyWillChange('length');
    this.sequence.push({ action: 'entered', state: state });
    this.propertyDidChange('length'); 
  },
  
  pushExitedState: function(state) {
    this.propertyWillChange('length');
    this.sequence.push({ action: 'exited', state: state });
    this.propertyDidChange('length');
  },
  
  matchSequence: function() {
    return StatechartSequenceMatcher.create({
      statechartMonitor: this
    });
  },
  
  matchEnteredStates: function() {
    var expected = SC.A(arguments.length === 1 ? arguments[0] : arguments),
        actual = this.getPath('statechart.enteredStates'),
        matched = 0,
        statechart = this.get('statechart');
    
    if (expected.length !== actual.length) return false;
    
    expected.forEach(function(item) {
      if (SC.typeOf(item) === SC.T_STRING) item = statechart.getState(item);
      if (!item) return;
      if (statechart.stateIsEntered(item) && item.get('isEnteredState')) matched += 1;
    });
    
    return matched === actual.length;
  },
  
  toString: function() {
    var seq = "",
        i = 0,
        len = 0,
        item = null;
    
    seq += "[";    

    len = this.sequence.length;
    for (i = 0; i < len; i += 1) {
      item = this.sequence[i];
      seq += "%@ %@".fmt(item.action, item.state.get('fullPath'));
      if (i < len - 1) seq += ", ";
    }

    seq += "]";

    return seq;
  }
  
});