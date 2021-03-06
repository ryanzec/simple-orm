var hookable = require('../../orm/hookable');
var expect = require('chai').expect;
var hookableTest = Object.create(hookable);
var EventEmitter = require('events').EventEmitter;
hookable._emitter = new EventEmitter();
hookable._hooks = {};
hookableTest.test1 = function() {
  this.runHooks('test1', myObject);
};
var myObject;

describe('hookable', function() {
  beforeEach(function() {
    myObject = {
      test1: 1,
      test2: 2
    };
  });

  it('should be able to apply a hook', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });

    hookableTest.test1();

    hookableTest.removeHook('test1[test]');

    expect(myObject).to.deep.equal({
      test1: 2,
      test2: 3
    });
  });

  it('should be able to remove hooks', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.removeHook('test1[test]');

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: 1,
      test2: 2
    });
  });

  it('should be able to apply multiple hooks', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.hook('test1[test2]', function(data) {
      data.test1 += 2;
      data.test2 += 2;
    });

    hookableTest.test1();

    hookableTest.removeHook('test1[test]');
    hookableTest.removeHook('test1[test2]');

    expect(myObject).to.deep.equal({
      test1: 4,
      test2: 5
    });
  });

  it('should be able to remove multiple hooks', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.hook('test1[test2]', function(data) {
      data.test1 += 2;
      data.test2 += 2;
    });

    hookableTest.removeHook('test1[test]');
    hookableTest.removeHook('test1[test2]');

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: 1,
      test2: 2
    });
  });

  it('should be able to remove all hooks at once', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.hook('test1[test2]', function(data) {
      data.test1 += 2;
      data.test2 += 2;
    });

    hookableTest.removeAllHooks();

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: 1,
      test2: 2
    });
  });

  it('should run hooks in the order they were added', function*() {
    hookableTest.hook('test1[9]', function(data) {
      data.test1 += '1';
      data.test2 += '1';
    });
    hookableTest.hook('test1[0]', function(data) {
      data.test1 += '2';
      data.test2 += '2';
    });

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: '112',
      test2: '212'
    });
  });

  it('should throw an error if you attempt to attach a hook with the same identifier', function*() {
    var err = "There is already a hooks for 'test1' with the identifier of 'test'";
    hookableTest.hook('test1[test]', function(data) {});

    expect(function() {
      hookableTest.hook('test1[test]', function(data) {});
    }).to.throw(err);
  });
});
