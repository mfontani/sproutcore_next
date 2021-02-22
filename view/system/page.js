// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';

/**
  @class Page

  A Page object is used to store a set of views that can be lazily configured
  as needed.  The page object works by overloading the get() method.  The
  first time you try to get the page
  
 */
export const Page = SC.Object.extend(
/** @scope Page.prototype */ {
  
  /**
    When you create a page, you can set it's "owner" property to an
    object outside the page definition. This allows views in the page
    to use the owner object as a target, (as well as other objects
    accessible through the owner object). E.g.
    
        myButton: ButtonView.design({
          title: 'Click me',
          target: outlet('page.owner'),
          action: 'buttonClicked'
        })
    
    Usually, you'll set 'owner' to the object defined in core.js.
  */
  owner: null,
  
  get: function get (key) {
    var value = this[key] ;
    if (value && value.isClass) {
      this[key] = value = value.create({ page: this }) ;
      return value ;
    } else return get.base.apply(this, arguments);
  },

  /**
    Returns the named property unless the property is a view that has not yet
    been configured.  In that case it will return undefined.  You can use this
    method to safely get a view without waking it up.
  */
  getIfConfigured: function(key) {
    var ret = this[key] ;
    return (ret && ret.isViewClass) ? null : this.get(key);
  },

  /**
    Applies a localization to every view builder defined on the page.  You must call this before you construct a view to apply the localization.
  */
  loc: function(locs) {
    var view, key;
    for(key in locs) {
      if (!locs.hasOwnProperty(key)) continue ;
      view = this[key] ;
      if (!view || !view.isViewClass) continue ;
      view.loc(locs[key]);
    }
    return this ;
  }

  //needsDesigner: true,
  
  //inDesignMode: true
    
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
Page.design = Page.create ;

/** Calling localization returns passed attrs. */
Page.localization = function(attrs) { return attrs; };


