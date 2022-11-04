// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js"; 

// test parsing of query string
var store, storeKey, foo1, foo2, bar1, bar2, baz, barChild, MyApp, q;
module("Query comparison of records", {
  beforeEach: function() {
    
    SC.RunLoop.begin();
    
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = Record.extend();
    MyApp.Bar = Record.extend();
    MyApp.BarChild = MyApp.Bar.extend();
    MyApp.Baz = Record.extend();
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", year: 1974 },
      { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975 }
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { guid: 4, firstName: "Johnny", lastName: "Cash", active: false }
    ]);
    
    MyApp.store.loadRecords(MyApp.Baz, [
      { guid: 5, firstName: "Bert", lastName: "Berthold", active: true }
    ]);

    MyApp.store.loadRecords(MyApp.BarChild, [
      { guid: 6, firstName: "Bert", lastName: "Ernie", active: true }
    ]);
    
    SC.RunLoop.end();
    
    foo1 = MyApp.store.find(MyApp.Foo,1);
    foo2 = MyApp.store.find(MyApp.Foo,2);
    bar1 = MyApp.store.find(MyApp.Bar,3);
    bar2 = MyApp.store.find(MyApp.Bar,4);
    barChild = MyApp.store.find(MyApp.BarChild, 6);
    baz  = MyApp.store.find(MyApp.Baz,5);
    
  },
  
  afterEach: function() {
    MyApp = foo1 = foo2 = bar1 = bar2 = baz = barChild = q = null;
  }
});

// ..........................................................
// BASIC TESTS
// 

test("should only contain records matching recordType or recordTypes", function (assert) {
  
  q = Query.create({ recordType: MyApp.Foo });
  assert.equal(q.contains(foo1), true, 'q with recordType=Foo should contain record of type Foo');
  assert.equal(q.contains(bar1), false, 'q with recordType=Foo should NOT contain record of type Bar');
  assert.equal(q.contains(barChild), false, 'q with recordType=Foo should NOT contain record of type BarChild');
  
  assert.equal(q.contains(baz),  false, 'q with recordType=Foo should NOT contain record of type Baz');
  
  q = Query.create({ recordTypes: [MyApp.Foo, MyApp.Bar] });
  assert.equal(q.contains(foo1), true, 'q with recordTypes=Foo,Bar should contain record of type Foo');
  assert.equal(q.contains(bar1), true, 'q with recordTypes=Foo,Bar should contain record of type Bar');
  assert.equal(SC.kindOf(barChild, MyApp.Bar), true, 'SC.kindOf(barChild, MyApp.Bar)');
  
  assert.equal(q.contains(barChild), true, 'q with recordTypes=Foo,Bar should contain record of type BarChild');

  assert.equal(q.contains(baz),  false, 'q with recordTypes=Foo,Bar should NOT contain record of type Baz');

  q = Query.create();
  assert.equal(q.contains(foo1), true, 'no recordType should contain record of type Foo');
  assert.equal(q.contains(bar1), true, 'no recordType should contain record of type Foo');
  assert.equal(q.contains(barChild), true, 'no recordType should contain record of type BarChild');
  assert.equal(q.contains(baz), true, 'no recordType should contain record of type Foo');
  
});

test("should only contain records within parent scope, if one is defined", function (assert) {
  
  q = Query.create({ scope: SC.Set.create().add(foo1).add(bar1) });
  assert.equal(q.contains(foo1), true, 'scope=[foo1,bar1] should return true for foo1');
  assert.equal(q.contains(foo2), false, 'scope=[foo1,bar1] should return false for foo2');
  assert.equal(q.contains(bar1), true, 'scope=[bar1] should return true for bar1');
  assert.equal(q.contains(bar2), false, 'scope=[foo1,bar1] should return false for bar2');
});

test("should evaluate query against record", function (assert) {
  q = Query.create({ 
    conditions: "firstName = {firstName}", 
    parameters: { firstName: 'Bert' }
  });
  
  assert.equal(q.contains(bar2), false, 'q(firstName=Bert) should return false for bar[firstName=Johnny]');
  assert.equal(q.contains(baz), true, 'q(firstName=Bert) should return true for baz[firstName=Bert]');
  assert.equal(q.contains(barChild), true, 'q(firstName=Bert) should return true for barChild[firstName=Bert]');

  var p  = { firstName: "Johnny" };
  assert.equal(q.contains(bar2, p), true, 'q(firstName=Johnny) should return true for bar[firstName=Johnny]');
  assert.equal(q.contains(baz, p), false, 'q(firstName=Johnny) should return false for baz[firstName=Bert]');
  assert.equal(q.contains(barChild, p), false, 'q(firstName=Johnny) should return false for barChild[firstName=Bert]');
  
});

test("should consider recordType + query conditions", function (assert) {
  q = Query.create({
    conditions: "firstName = {firstName}",
    recordType: MyApp.Bar,
    parameters: { firstName: "Bert" }
  });
  
  assert.equal(q.contains(bar1), false, 'should not contain bar1 (wrong firstName)');
  assert.equal(q.contains(bar2), false, 'should not contain bar2 (wrong firstName)');
  assert.equal(q.contains(barChild), true, 'should contain barChild');
  assert.equal(q.contains(baz), false, 'should contain baz (wrong type)');
  
});


