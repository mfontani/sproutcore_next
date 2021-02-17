// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2017 Turnitin. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  This defines the UserDefaultsDelegate, used to be notified when a default
  is required or an error occurs.

  @since SproutCore 1.11.2
*/
export const UserDefaultsDelegate = /** @scope UserDefaultsDelegate */{

  /**
    Called when a value is needed for a user default.
    @param {UserDefaults} userDefaults
    @param {String} keyName
    @param {String} userKeyName
    @returns {Object} default for then given key
  */
  userDefaultsNeedsDefault: function(userDefaults, keyName, userKeyName) {},

  /**
    Called when a default's value is changed.
    @param {UserDefaults} userDefaults
    @param {String} keyName
    @param {Object} value
    @param {String} userKeyName
    @returns {void}
  */
  userDefaultsDidChange: function(userDefaults, keyName, value, userKeyName) {},

  /**
    Called when an error occurs.
    @param {UserDefaults} userDefaults
    @param {String} keyName
    @param {Object} value
    @param {String} userKeyName
    @param {Error} error
    @returns {void}
  */
  userDefaultsDidError: function(userDefaults, keyName, value, userKeyName, error) {}

};
