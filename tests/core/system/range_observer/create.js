// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */
import { SC, GLOBAL } from '../../../../core/core.js';
var source, indexes, observer, obj ; // base array to work with
module("SC.RangeObserver#create", {
  beforeEach: function() {

    // create array with 5 SC.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return SC.Object.create({ item: x, foo: "bar" }) ;
    }, this);

    indexes = SC.IndexSet.create(2,2); // select 2..3

    observer = SC.Object.create({

      callCount: 0,

      rangeDidChange: function() {
        this.callCount++;
      }

    });

    obj = SC.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", true);

  }
});

test("returns new instance", function (assert) {
  assert.ok(obj && obj.isRangeObserver, 'returns range observer');
});

test("sets up observing on properties for each object in range in index if isDeep", function (assert) {
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) {
    source[idx].set('foo', 'baz');
  }
  assert.equal(observer.callCount, 2, 'range observer should fire twice');
});

test("does not observe object properties if isDeep is false", function (assert) {
  // remove unneeded observer
  obj.destroy();

  // use new observer
  obj = SC.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", false);

  var len = source.length, idx;
  for(idx=0;idx<len;idx++) {
    source[idx].set('foo', 'baz');
  }
  assert.equal(observer.callCount, 0, 'range observer should not fire');
});

test("SC.RangeObserver.create should accept methods specified as strings", function (assert) {
  var myArray = [ SC.Object.create({ prop: 0 })],
      rangeObserverCount = 0,
      observer = SC.Object.create({
        rangeObserverDidFire: function(source, object, key, index) {
          ++rangeObserverCount;
        }
      }),
      rangeObserver = SC.RangeObserver.create( myArray, SC.IndexSet.create(0, 1),
                                               observer, 'rangeObserverDidFire',
                                               null, true /* isDeep */);

  assert.equal(rangeObserverCount, 0, "Range observer hasn't fired yet");
  myArray[0].incrementProperty('prop');
  assert.equal(rangeObserverCount, 1, "Range observer should fire on property change");
});
