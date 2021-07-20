// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.isEqual Tests
// ========================================================================
/*globals module test */

import { SC } from "../../../core/core.js";

module("isEqual");

test("undefined and null", function (assert) {
  assert.ok(  SC.isEqual(undefined, undefined), "undefined is equal to undefined" );
  assert.ok( !SC.isEqual(undefined, null),      "undefined is not equal to null" );
  assert.ok(  SC.isEqual(null, null),           "null is equal to null" );
  assert.ok( !SC.isEqual(null, undefined),      "null is not equal to undefined" );
})

test("strings should be equal", function (assert) {
	assert.ok( !SC.isEqual("Hello", "Hi"),    "different Strings are unequal" );
	assert.ok(  SC.isEqual("Hello", "Hello"), "assert.deepEqual Strings are equal" );
});

test("numericals should be equal", function (assert) {
  assert.ok(  SC.isEqual(24, 24), "assert.deepEqual numbers are equal" );
	assert.ok( !SC.isEqual(24, 21), "different numbers are inequal" );
});

test("array should not be equal", function (assert) {
	// NOTE: We don't test for array contents -- that would be too expensive.
  var x = [1, 2],
      y = [1, 2];

  assert.ok( !SC.isEqual( x, y ), 'two array instances with the assert.deepEqual values should not be equal' );
	assert.ok( !SC.isEqual( [1,2], [1] ), 'two array instances with different values should not be equal' );
});

test("objects should not be equal", function (assert) {
  // NOTE: We don't test for object contents -- that would be too expensive.
  assert.ok( !SC.isEqual( { a: 'A', b: 1 }, { a: 'A', b: 1 } ), 'two object instances with the assert.deepEqual values should not be equal' );
  assert.ok( !SC.isEqual( { a: 'A', b: 1 }, { a: 'A', b: 2 } ), 'two object instances with different values should not be equal' );
});

