// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;
module("Query registered query extensions", {
  beforeEach: function() {
    SC.RunLoop.begin();

    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", year: 1974 },
      { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975 },
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { guid: 4, firstName: "Johnny", lastName: "Cash", active: false },
      { guid: 5, firstName: "Bert", lastName: "Jules", active: true }
    ]);
    
    rec1 = MyApp.store.find(MyApp.Foo,1);
    rec2 = MyApp.store.find(MyApp.Foo,2);
    rec3 = MyApp.store.find(MyApp.Foo,3);
    rec4 = MyApp.store.find(MyApp.Foo,4);
    rec5 = MyApp.store.find(MyApp.Foo,5);
    
    
    q = Query.create();

    SC.RunLoop.end();
  }
});
 
 
// ..........................................................
// TESTS
// 

test("Query.queryExtensions", function (assert) {
  Query.registerQueryExtension('STARTS_WITH_J', {
    reservedWord: true,
    leftType: 'PRIMITIVE',
    evalType: 'BOOLEAN',
    evaluate: function (r,w) {
                var word = this.leftSide.evaluate(r,w);
                return ( word.substr(0,1) == 'J' );
              }
  });

  assert.ok(q.queryLanguage['STARTS_WITH_J'], 'extension STARTS_WITH_J should be set');
  
  q.conditions = "firstName STARTS_WITH_J";
  q.parse();
  assert.ok(q.contains(rec2), "Jane should match");
  assert.ok(!q.contains(rec3), "Emily should not match");
  
  q.conditions = "firstName STARTS_WITH_J OR lastName STARTS_WITH_J";
  q.parse();
  assert.ok(q.contains(rec2), "Jane Doe should match");
  assert.ok(q.contains(rec5), "Bert Jules should match");

});
