// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

// sc_require('debug/test_suites/array/base');
import { SC } from '../../../../../core/core.js';
import { ArraySuite } from './base.js';

ArraySuite.define(function(T) {

  var observer, obj ;

  module(T.desc("removeAt"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[X].removeAt(0) => [] + notify", function (assert) {

    var before = T.expected(1);
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;

    obj.removeAt(0) ;
    T.validateAfter(obj, [], observer, true);
  });

  test("[].removeAt(200) => throw exception", function (assert) {
    var didThrow = false ;
    try {
      obj.removeAt(200);
    } catch (e) {
      assert.equal(e.message, "Index '200' is out of range 0-0", 'should throw an exception');
      didThrow = true ;
    }
    assert.ok(didThrow, 'should raise exception');
  });

  test("[A,B].removeAt(0) => [B] + notify", function (assert) {
    var before = T.expected(2),
        after   = [before[1]];

    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;

    obj.removeAt(0);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B].removeAt(1) => [A] + notify", function (assert) {
    var before = T.expected(2),
        after   = [before[0]];

    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;

    obj.removeAt(1);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C].removeAt(1) => [A,C] + notify", function (assert) {
    var before = T.expected(3),
        after   = [before[0], before[2]];

    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;

    obj.removeAt(1);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C,D].removeAt(1,2) => [A,D] + notify", function (assert) {
    var before = T.expected(4),
        after   = [before[0], before[3]];

    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;

    obj.removeAt(1,2);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C,D].removeAt(SC.IndexSet<0,2-3>) => [B] + notify", function (assert) {
    var before = T.expected(4),
        after   = [before[1]];

    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;

    obj.removeAt(SC.IndexSet.create(0).add(2,2));
    T.validateAfter(obj, after, observer, true);
  });

});
