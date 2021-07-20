// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals throws */
import { SC, GLOBAL } from '../../../../core/core.js';

var content, controller, extra;

var TestObject = SC.Object.extend({
  title: "test",
  toString: function() { return "TestObject(%@)".fmt(this.get("title")); }
});

var ComplexTestObject = SC.Object.extend({
  firstName: null,
  lastName: null,
  toString: function() { return "TestObject(%@ %@)".fmt(this.get("firstName"), this.get('lastName')); }
});

// ..........................................................
// EMPTY
//

module("SC.ArrayController - array_case - EMPTY", {
  beforeEach: function() {
    content = [];
    controller = SC.ArrayController.create({ content: content });
    extra = TestObject.create({ title: "FOO" });
  },

  afterEach: function() {
    controller.destroy();
  }
});

test("state properties", function (assert) {
  assert.equal(controller.get("hasContent"), true, 'c.hasContent');
  assert.equal(controller.get("canRemoveContent"), true, "c.canRemoveContent");
  assert.equal(controller.get("canReorderContent"), true, "c.canReorderContent");
  assert.equal(controller.get("canAddContent"), true, "c.canAddContent");
});

// addObject should append to end of array + notify observers on Array itself
test("addObject", function (assert) {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  SC.run(function() { controller.addObject(extra); });

  assert.deepEqual(content, [extra], 'addObject(extra) should work');
  assert.equal(callCount, 1, 'should notify observer that content has changed');
  assert.equal(content.get('length'), 1, 'should update length of controller');
});

test("removeObject", function (assert) {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  SC.run(function() { controller.removeObject(extra); });

  assert.deepEqual(content, [], 'removeObject(extra) should have no effect');
  assert.equal(callCount, 0, 'should not notify observer since content did not change');
});

test("basic array READ operations", function (assert) {
  assert.equal(controller.get("length"), 0, 'length should be empty');
  assert.equal(controller.objectAt(0), undefined, "objectAt() should return undefined");
});

test("basic array WRITE operations", function (assert) {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  controller.replace(0,1,[extra]);

  assert.deepEqual(content, [extra], 'should modify content');
  assert.equal(callCount, 1, 'should notify observer that content has changed');
  assert.equal(content.get('length'), 1, 'should update length of controller');
});

test("arrangedObjects", function (assert) {
  assert.equal(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});


// ..........................................................
// NON-EMPTY ARRAY
//

module("SC.ArrayController - array_case - NON-EMPTY", {
  beforeEach: function() {
    content = "1 2 3 4 5".w().map(function(x) {
      return TestObject.create({ title: x });
    });

    controller = SC.ArrayController.create({ content: content });
    extra = TestObject.create({ title: "FOO" });
  },

  afterEach: function() {
    controller.destroy();
  }
});

test("state properties", function (assert) {
  assert.equal(controller.get("hasContent"), true, 'c.hasContent');
  assert.equal(controller.get("canRemoveContent"), true, "c.canRemoveContent");
  assert.equal(controller.get("canReorderContent"), true, "c.canReorderContent");
  assert.equal(controller.get("canAddContent"), true, "c.canAddContent");
});

// addObject should append to end of array + notify observers on Array itself
test("addObject", function (assert) {
  var expected = content.slice();
  expected.push(extra);

  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  SC.run(function() { controller.addObject(extra); });

  assert.deepEqual(content, expected, 'addObject(extra) should work');
  assert.equal(callCount, 1, 'should notify observer that content has changed');
  assert.equal(content.get('length'), expected.length, 'should update length of controller');
});

test("removeObject", function (assert) {
  var expected = content.slice(), obj = expected[3];
  expected.removeObject(obj);

  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  SC.run(function() { controller.removeObject(obj); });

  assert.deepEqual(content, expected, 'removeObject(extra) should remove object');
  assert.equal(callCount, 1, 'should notify observer that content has changed');
  assert.equal(content.get('length'), expected.length, 'should update length of controller');
});

test("basic array READ operations", function (assert) {
  assert.equal(controller.get("length"), content.length, 'length should be empty');

  var loc = content.length+1; // verify 1 past end as well
  while(--loc>=0) {
    assert.equal(controller.objectAt(loc), content[loc], "objectAt(%@) should return same value at content[%@]".fmt(loc, loc));
  }
});

test("basic array WRITE operations", function (assert) {
  var expected = content.slice();
  expected.replace(3,1,[extra]);

  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });

  controller.replace(3,1,[extra]);

  assert.deepEqual(content, expected, 'should modify content');
  assert.equal(callCount, 1, 'should notify observer that content has changed');
  assert.equal(content.get('length'), expected.length, 'should update length of controller');
});

test("arrangedObjects", function (assert) {
  assert.equal(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});


test("The computed properties firstObject, firstSelectableObject & lastObject should update when content changes.", function (assert) {
  assert.equal(controller.get('firstObject'), content[0], 'first object should be the first object in content');
  assert.equal(controller.get('firstSelectableObject'), content[0], 'first selectable object should be the first object in content');
  assert.equal(controller.get('lastObject'), content[4], 'lastObject should be the last object in content');

  // Reorder the content
  var newObject = TestObject.create({ title: "BLAH" });
  controller.set('content', [newObject]);

  assert.equal(controller.get('firstObject'), newObject, 'first object should be the new first object in content');
  assert.equal(controller.get('firstSelectableObject'), newObject, 'first selectable object should be the new first object in content');
  assert.equal(controller.get('lastObject'), newObject, 'lastObject should be the new last object in content');
});

test("The computed properties firstObject, firstSelectableObject & lastObject should update when content items change.", function (assert) {
  assert.equal(controller.get('firstObject'), content[0], 'first object should be the first object in content');
  assert.equal(controller.get('firstSelectableObject'), content[0], 'first selectable object should be the first object in content');
  assert.equal(controller.get('lastObject'), content[4], 'lastObject should be the last object in content');

  // Change the items.
  var newObject = TestObject.create({ title: "BLAH" });
  controller.replace(0, 5, [newObject]);

  assert.equal(controller.get('firstObject'), newObject, 'first object should be the new first object in content');
  assert.equal(controller.get('firstSelectableObject'), newObject, 'first selectable object should be the new first object in content');
  assert.equal(controller.get('lastObject'), newObject, 'lastObject should be the new last object in content');
});

// ..........................................................
// orderBy
//

test("array orderBy using String", function (assert) {
  var testController = SC.ArrayController.create({
    content: content,
    orderBy: 'title ASC'
  });

  assert.equal(testController.get('firstSelectableObject'), content[0], 'first selectable object should be the first object in arrangedObjects');
  assert.equal(testController.get('lastObject'), content[4], 'lastObject should be the last object in content');

  // Reorder the content
  testController.set('orderBy', 'title DESC');

  assert.equal(testController.get('firstSelectableObject'), content[4], 'first selectable object should be the first object in arrangedObjects (changed order)');
  assert.equal(testController.get('lastObject'), content[0], 'lastObject should be the first object in content (changed order)');
});

test("array orderBy using String with property path", function (assert) {
  var c = "1 2 3 4 5".w().map(function(x) {
    return TestObject.create({ title: { title: x }});
  });

  var testController = SC.ArrayController.create({
    content: c,
    orderBy: 'title.title ASC'
  });

  assert.equal(testController.get('firstSelectableObject'), c[0], 'first selectable object should be the first object in arrangedObjects');
  assert.equal(testController.get('lastObject'), c[4], 'lastObject should be the last object in content');

  // Reorder the content
  testController.set('orderBy', 'title.title DESC');

  assert.equal(testController.get('firstSelectableObject'), c[4], 'first selectable object should be the first object in arrangedObjects (changed order)');
  assert.equal(testController.get('lastObject'), c[0], 'lastObject should be the first object in content (changed order)');
});


test("array orderBy using Array", function (assert) {
  var complexContent,
      familyNames = "Keating Zane Alberts Keating Keating".w(),
      givenNames = "Travis Harold Brian Alvin Peter".w(),
      testController;

  complexContent = familyNames.map(function(x, i) {
    return ComplexTestObject.create({ lastName: x, firstName: givenNames.objectAt(i) });
  });

  testController = SC.ArrayController.create({
    content: complexContent
  });

  assert.equal(testController.get('firstSelectableObject'), complexContent[0], 'first selectable object should be the first object in arrangedObjects');

  // Reorder the content
  testController.set('orderBy', ['lastName', 'firstName']); // Brian Alberts, Alvin Keating, Peter Keating, Travis Keating, Harold Zane
  assert.equal(testController.get('firstSelectableObject'), complexContent[2], 'first selectable object should be the first object in arrangedObjects (changed order)');
  assert.equal(testController.objectAt(1), complexContent[3], 'fourth content object should be the second object in arrangedObjects (changed order)');

  // Reorder the content
  testController.set('orderBy', ['lastName', 'firstName DESC']); // Brian Alberts, Travis Keating, Peter Keating, Alvin Keating,Harold Zane
  assert.equal(testController.objectAt(3), complexContent[3], 'fourth content object should be the fourth object in arrangedObjects (changed order)');

});

test("array orderBy using function", function (assert) {
  var testFunc = function(a,b){
    if(a.get('title') > b.get('title')) return -1;
    else if (a.get('title') == b.get('title')) return 0;
    else return 1;
  };
  var expected = content.slice();
  expected.sort(testFunc);

  var testController = SC.ArrayController.create({
    content: content,
    orderBy: testFunc
  });
  assert.deepEqual(testController.get('arrangedObjects').toArray(), expected, 'arrangedObjects should be sortable by a custom function');
});

test("verify length is correct in arrayObserver didChange method when orderBy is set", function (assert) {
  content = [];
  controller = SC.ArrayController.create({
    content: content,
    orderBy: 'i haz your content!'
  });
  assert.expect(2);

  controller.addArrayObservers({
    willChange: function () {
      assert.equal(this.get('length'), 0, 'length should be 0');
    },

    didChange: function () {
      assert.equal(this.get('length'), 1, 'length should be 1');
    }
  });

  content.pushObject(":{");
});

// orderBy impacts arrayContentDidChange calls.

test("verify range observers fire correctly when object added at different sorted index than absolute index", function (assert) {
  content = [ TestObject.create({ value: 1 }), TestObject.create({ value: 2 }) ];
  controller = SC.ArrayController.create({
    content: content,
    orderBy: 'value ASC'
  });
  var callCount = 0;
  controller.addRangeObserver(SC.IndexSet.create(0, 2), null, function() { callCount++; });
  controller.content.pushObject(TestObject.create({ value: 0 }));
  assert.ok(callCount === 1, "Range observer should have fired based on inclusion in the sorted range rather than the raw content range.");
});

// Tests bug introduced in e33416fdd28363479b598bdbab081d5abd9737f7 (see https://github.com/sproutcore/sproutcore/issues/1214). Verified
// more generally in test below.
test("verify enumerable propety chains invalidate without error on ArrayController with orderBy.", function (assert) {
  controller = SC.ArrayController.create({
    content: [],
    orderBy: 'value ASC',
    // Though nonsensical (could be '[]' without error), this property path is our canary.
    rangeProperty: function() {}.property('*content.[]')
  });

  var didError = false;
  try {
    controller.content.pushObject(TestObject.create({ value: 0 }));
  } catch (e) {
    didError = true;
  }

  assert.ok(!didError, "Adding an object to an empty array controller with orderBy and an enumerable property chain proceeds without error.");

});

test("verify arrayContentWillChange and arrayContentDidChange are called with correct values when orderBy is present.", function (assert) {
  // Set up test values.
  var expectedStart = 0,
      expectedRemoved = 0,
      expectedAdded = 0,
      testMessage = "PRELIM %@: Creating array controller, '%@' should be";
  // Create controller.
  controller = SC.ArrayController.create({
    content: [],
    orderBy: 'value ASC',
    arrayContentWillChange: function arrayContentWillChange (start, removed, added) {
      assert.equal(start, expectedStart, testMessage.fmt('arrayContentWillChange', 'start'));
      assert.equal(removed, expectedRemoved, testMessage.fmt('arrayContentWillChange', 'removed'));
      assert.equal(added, expectedAdded, testMessage.fmt('arrayContentWillChange', 'added'));
      return arrayContentWillChange.base.apply(this, arguments);
    },
    arrayContentDidChange: function arrayContentDidChange(start, removed, added) {
      assert.equal(start, expectedStart, testMessage.fmt('arrayContentDidChange', 'start'));
      assert.equal(removed, expectedRemoved, testMessage.fmt('arrayContentDidChange', 'removed'));
      assert.equal(added, expectedAdded, testMessage.fmt('arrayContentDidChange', 'added'));
      return arrayContentDidChange.base.apply(this, arguments);
    }
  });

  // NOTE THAT THE FOLLOWING TESTS DEPEND ON THE CONTENT AS SET BY THE PREVIOUS TEST. (SORRY.)

  // Adding one item to empty array.
  expectedStart = 0;
  expectedRemoved = 0;
  expectedAdded = 1;
  testMessage = "%@: adding a single item to an empty array, '%@' should be";
  controller.content.pushObject(TestObject.create({ value: 0 }));

  // Adding one item to an array with one item.
  expectedStart = 0;
  expectedRemoved = 1;
  expectedAdded = 2;
  testMessage = "%@: adding a single item to an array with one item, '%@' should be";
  controller.content.pushObject(TestObject.create({ value: 0 }));

  // Removing the first item from a two-item array
  expectedStart = 0;
  expectedRemoved = 2;
  expectedAdded = 1;
  testMessage = "%@: adding a single item to an array with one item, '%@' should be";
  controller.content.removeAt(0);

  // Replacing the first item in a one-item array with two items.
  expectedStart = 0;
  expectedRemoved = 1;
  expectedAdded = 2
  testMessage = "%@: adding a single item to an array with one item, '%@' should be";
  controller.content.pushObject(0, 1, [TestObject.create({ value: 1 }), TestObject.create({ value: 0 })]);

});

// ..........................................................
// ADD SPECIAL CASES HERE
//

test("verify rangeObserver fires when content is deleted", function (assert) {

  content = "1 2 3 4 5".w().map(function(x) {
    return TestObject.create({ title: x });
  });

  controller = SC.ArrayController.create({ content: content });

  var cnt = 0,
      observer = SC.Object.create({ method: function() { cnt++; } });

  controller.addRangeObserver(SC.IndexSet.create(0,2), observer, observer.method);

  SC.RunLoop.begin();
  content.replace(0, content.length, []);
  SC.RunLoop.end();

  assert.equal(cnt, 1, 'range observer should have fired once');
});

test("should invalidate computed property once per changed key", function (assert) {
  var setCalls = 0;
  var getCalls = 0;

  window.peopleController = SC.ArrayController.create({
    foo: true,
    content: [SC.Object.create({name:'Juan'}),
              SC.Object.create({name:'Camilo'}),
              SC.Object.create({name:'Pinzon'}),
              SC.Object.create({name:'Señor'}),
              SC.Object.create({name:'Daaaaaale'})],

    fullNames: function(key, value) {
      if (value !== undefined) {
        setCalls++;
        this.setEach('name', value);
      } else {
        getCalls++;
      }

      return this.getEach('name').join(' ');
    }.property('@each.name')
  });

  try {
    var peopleWatcher = SC.Object.create({
      namesBinding: 'peopleController.fullNames'
    });

    SC.run();
    SC.run(function() { peopleWatcher.set('names', 'foo bar baz'); });
    assert.equal(setCalls, 1, "calls set once");
    // assert.equal(getCalls, 3, "calls get three times");
    // TODO: Figure out what the right number is. Recent optimizations have reduced
    // it significantly, but we can't get it below 7.
  } finally {
    window.peopleController = undefined;
  }

});


module("SC.ArrayController - dependent keys with @each");

test("should invalidate property when property on any enumerable changes", function (assert) {
  var inventory = [];
  var recomputed = 0;

  for (var idx = 0; idx < 20; idx++) {
    inventory.pushObject(SC.Object.create({
      price: 5
    }));
  }
  var restaurant = SC.ArrayController.create({
    content: inventory,

    totalCost: function() {
      recomputed++;
      return inventory.reduce(function(prev, item) {
        return prev+item.get('price');
      }, 0);
    }.property('@each.price').cacheable()
  });

  assert.equal(restaurant.get('totalCost'), 100, "precond - computes cost of all items");
  inventory[0].set('price', 6);

  assert.equal(restaurant.get('totalCost'), 101, "recalculates after dependent key on an enumerable item changes");
  inventory[19].set('price', 6);

  assert.equal(restaurant.get('totalCost'), 102, "recalculates after dependent key on a different item changes");
  inventory.pushObject(SC.Object.create({
    price: 5
  }));
  assert.equal(restaurant.get('totalCost'), 107, "recalculates after adding an item to the enumerable");

  var item = inventory.popObject();
  assert.equal(restaurant.get('totalCost'), 102, "recalculates after removing an item from the enumerable");

  recomputed = 0;
  item.set('price', 0);
  assert.equal(recomputed, 0, "does not recalculate after changing key on removed item");
});

test("should invalidate property when property of array item changes after content has changed", function (assert) {
  var inventory = [];
  var recomputed = 0;

  for (var idx = 0; idx < 20; idx++) {
    inventory.pushObject(SC.Object.create({
      price: 5
    }));
  }
  var restaurant = SC.ArrayController.create({
    content: [],

    totalCost: function() {
      recomputed++;
      return inventory.reduce(function(prev, item) {
        return prev+item.get('price');
      }, 0);
    }.property('@each.price').cacheable()
  });

  restaurant.set('content', inventory);

  assert.equal(restaurant.get('totalCost'), 100, "precond - computes cost of all items");
  inventory[0].set('price', 6);

  assert.equal(restaurant.get('totalCost'), 101, "recalculates after dependent key on an enumerable item changes");
  inventory[19].set('price', 6);

  assert.equal(restaurant.get('totalCost'), 102, "recalculates after dependent key on a different item changes");
  inventory.pushObject(SC.Object.create({
    price: 5
  }));
  assert.equal(restaurant.get('totalCost'), 107, "recalculates after adding an item to the enumerable");

  var item = inventory.popObject();
  assert.equal(restaurant.get('totalCost'), 102, "recalculates after removing an item from the enumerable");

  recomputed = 0;
  item.set('price', 0);
  assert.equal(recomputed, 0, "does not recalculate after changing key on removed item");
});

// ..........................................................
// VERIFY SC.ARRAY COMPLIANCE
//

// SC.ArraySuite.generate("SC.ArrayController", {
//   newObject: function(amt) {
//     if (amt === undefined || typeof amt === SC.T_NUMBER) {
//       amt = this.expected(amt);
//     }
//     return SC.ArrayController.create({ content: amt });
//   }
// });
