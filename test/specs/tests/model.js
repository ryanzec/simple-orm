var expect = require('chai').expect;
var _ = require('lodash');
var moment = require('moment');

module.exports = function(dataLayerValues) {
  before(function*() {
    var where = {};
    where[this.dataLayer.user._model._primaryKeyColumns[0]] = 1;
    this.user1 = yield this.dataLayer.user.find({
      where: where
    });

    var where = {};
    where[this.dataLayer.user._model._primaryKeyColumns[0]] = 3;
    this.user3 = yield this.dataLayer.user.find({
      where: where
    });

    var where2 = {};
    where2[this.dataLayer.permission._model._primaryKeyColumns[0]] = 1;
    this.permission1 = yield this.dataLayer.permission.find({
      where: where2
    });

    var where3 = {};
    where3[this.dataLayer.permission._model._primaryKeyColumns[0]] = 2;
    this.permission2 = yield this.dataLayer.permission.find({
      where: where3
    });

    var where3 = {};
    where3[this.dataLayer.permission._model._primaryKeyColumns[0]] = 3;
    this.permission3 = yield this.dataLayer.permission.find({
      where: where3
    });

    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
    this.userDetail1 = yield this.dataLayer.userDetail.find({
      where: where
    });

    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]] = 5;
    this.userDetail5 = yield this.dataLayer.userDetail.find({
      where: where
    });
  });

  afterEach(function*() {
    this.user1.reset();
    this.user3.reset();
    this.permission1.reset();
    this.permission2.reset();
    this.permission3.reset();
    this.userDetail1.reset();
    this.userDetail5.reset();

    this.user1.removeAllHooks();
    this.user3.removeAllHooks();
    this.permission1.removeAllHooks();
    this.permission2.removeAllHooks();
    this.permission3.removeAllHooks();
    this.userDetail1.removeAllHooks();
    this.userDetail5.removeAllHooks();
  });

  describe('status', function() {
    it('should be `new` with new instance', function*() {
      var model = this.dataLayer.user.create();

      expect(model._status).to.equal('new');
    });

    it('should be `new` when modify data of a new instance', function*() {
      var model = this.dataLayer.user.create();

      model.firstName = 'test';

      expect(model._status).to.equal('new');
    });

    it('should be `loaded` with new instance', function*() {
      expect(this.user3._status).to.equal('loaded');
    });

    it('should be `dirty` with instance that has unchanged data', function*() {
      this.user3.firstName = 'test';

      expect(this.user3._status).to.equal('dirty');
    });

    it('should be `loaded` with new instance after is save', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      yield model.save();

      expect(model._status).to.equal('loaded');
    });

    it('should be `loaded` with exist instance after is save', function*() {
      this.user3.firstName = 'test';
      yield this.user3.save();

      expect(this.user3._status).to.equal('loaded');
    });
  });

  describe('data management', function() {
    it('should be able to save a new instance', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      yield model.save();

      this.testUserValues(model, {
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      var where = {};
      where[this.dataLayer.user._model._primaryKeyColumns[0]] = model.id;
      var modelFromDatabase = yield this.dataLayer.user.find({
        where: where
      });

      this.testUserValues(modelFromDatabase, {
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(modelFromDatabase.id).to.be.at.least(5);
      expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
    });

    it('should be able to update an instance', function*() {
      var start = moment().format('X');

      this.user3.requirePasswordChangeFlag = true;
      yield this.user3.save();

      this.testUserValues(this.user3, {
        id: 3,
        firstName: 'John',
        lastName: 'Doe2',
        email: 'john.doe2@example.com',
        username: 'john.doe2',
        password: 'password',
        createdTimestamp: '2014-05-17T19:51:49.000Z',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'active'
      });

      var where = {};
      where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
      var modelFromDatabase = yield this.dataLayer.user.find({
        where: where
      });

      this.testUserValues(modelFromDatabase, {
        id: 3,
        firstName: 'John',
        lastName: 'Doe2',
        email: 'john.doe2@example.com',
        username: 'john.doe2',
        password: 'password',
        createdTimestamp: '2014-05-17T19:51:49.000Z',
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'active'
      });

      expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
    });

    it('should be able to delete an instance', function*() {
      expect(yield this.user3.remove()).to.be.true;

      var where = {};
      where[this.dataLayer.user._model._primaryKeyColumns[0]] = 3;
      var model = yield this.dataLayer.user.find({
        where: where
      });

      expect(model).to.be.null;
    });

    it('should be able to load data in bulk', function*() {
      var model = this.dataLayer.user.create();

      model.loadData({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      this.testUserValues(model, {
        id: null,
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        createdTimestamp: null,
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });
    });

    it('should be able to define a custom property getter', function*() {
      var where = {};
      where[this.dataLayer.userEmailCustomGetter._model._primaryKeyColumns[0]] = 3;
      var model = yield this.dataLayer.userEmailCustomGetter.find({
        where: where
      });

      //should work when getting in regular way
      expect(model.email).to.equal('getter-three@example.com');

      //should work when exporting to JSON
      expect(model.toJSON()).to.deep.equal({
        id: 3,
        userId: 3,
        email: 'getter-three@example.com'
      });
    });

    it('should be able to define a custom property setter', function*() {
      var where = {};
      where[this.dataLayer.userEmailCustomSetter._model._primaryKeyColumns[0]] = 3;
      var model = yield this.dataLayer.userEmailCustomSetter.find({
        where: where
      });

      model.email = 'test@example.com';

      //should properly set the value
      expect(model.email).to.equal('setter-test@example.com');

      yield model.save();

      var where = {};
      where[this.dataLayer.userEmailCustomSetter._model._primaryKeyColumns[0]] = 3;
      var freshModel = yield this.dataLayer.userEmailCustomSetter.find({
        where: where
      });

      //should properly save to the database
      expect(freshModel.email).to.equal('setter-test@example.com');
    });

    it('should be able to reset when created with no data', function*() {
      var model = this.dataLayer.user.create();

      model.loadData({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'active'
      });

      model.reset();

      this.testUserValues(model, {
        id: null,
        firstName: null,
        lastName: null,
        email: null,
        username: null,
        password: null,
        createdTimestamp: null,
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });
      expect(model._status).to.equal('new');
    });

    it('should be able to reset when created from data store', function*() {
      this.user1.firstName = 'test';
      this.user1.lastName = 'user';
      this.user1.requirePasswordChangeFlag = true;

      this.user1.reset();

      this.testUserValues(this.user1, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        password: 'password',
        createdTimestamp: '2014-05-17T19:50:15.000Z',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered'
      });
      expect(this.user1._status).to.equal('loaded');
    });
  });

  describe('relationships', function() {
    it('should be able to define a hasOne relationship', function*() {
      var relationalModel = yield this.user1.getUserDetail();

      expect(relationalModel.id).to.equal(1);
      expect(relationalModel.userId).to.equal(1);
      expect(relationalModel.details).to.equal('one');
    });

    it('should be able to define belongsTo relationship', function*() {
      var relationalModel = yield this.userDetail1.getUser();

      this.testUserValues(relationalModel, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        password: 'password',
        createdTimestamp: '2014-05-17T19:50:15.000Z',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered'
      });
    });

    it('should be able to define hasMany relationship', function*() {
      var relationalModels = yield this.user1.getTestUserEmails();

      expect(relationalModels.getByIndex(0).id).to.equal(1);
      expect(relationalModels.getByIndex(0).userId).to.equal(1);
      expect(relationalModels.getByIndex(0).email).to.equal('one@example.com');

      expect(relationalModels.getByIndex(1).id).to.equal(5);
      expect(relationalModels.getByIndex(1).userId).to.equal(1);
      expect(relationalModels.getByIndex(1).email).to.equal('five@example.com');
    });

    it('should be able to define hasMany relationship with through', function*() {
      var relationalModels = yield this.user3.getPermissions();

      expect(relationalModels.getByIndex(0).id).to.equal(1);
      expect(relationalModels.getByIndex(0).title).to.equal('user.create');

      expect(relationalModels.getByIndex(1).id).to.equal(2);
      expect(relationalModels.getByIndex(1).title).to.equal('user.read');

      expect(relationalModels.getByIndex(2).id).to.equal(3);
      expect(relationalModels.getByIndex(2).title).to.equal('user.update');

      expect(relationalModels.getByIndex(3).id).to.equal(4);
      expect(relationalModels.getByIndex(3).title).to.equal('user.delete');
    });

    describe('attach method', function() {
      it('should be added to model when defining a hasMany relationship with through', function*() {
        expect(_.isFunction(this.user1.attachPermissions)).to.be.true;
      });

      it('should be able to accept a single primary key', function*() {
        yield this.user1.attachPermissions(2);

        var permission = yield this.user1.getPermissions();

        expect(permission.length).to.equal(2);
      });

      it('should be able to accept an array of primary keys', function*() {
        yield this.user1.attachPermissions([2, 3]);

        var permission = yield this.user1.getPermissions();

        expect(permission.length).to.equal(3);
      });

      it('should be able to accept a single model', function*() {
        yield this.user1.attachPermissions(this.permission3);

        var permission = yield this.user1.getPermissions();

        expect(permission.length).to.equal(2);
      });

      it('should be able to accept an array of models', function*() {
        yield this.user1.attachPermissions([this.permission3, this.permission2]);

        var permission = yield this.user1.getPermissions();

        expect(permission.length).to.equal(3);
      });

      it('should be able to accept a collection of models', function*() {
        var collection = this.simpleOrm.collection.create([this.permission3, this.permission2]);
        yield this.user1.attachPermissions(collection);

        var permission = yield this.user1.getPermissions();

        expect(permission.length).to.equal(3);
      });

      it('should throw error if bad primary key is passed', function*() {
        var errorThrow = '';

        try {
          yield this.user1.attachPermissions(1000000000);
        } catch(exception) {
          errorThrow = exception;
        }

        expect(errorThrow).to.equal('Cannot find relational model to attach with primary key "1000000000"');
      });

      it('should throw error if non-model object is passed', function*() {
        var err = "Cannot attach a non-model object as a relationship object";
          var errorThrow = '';

          try {
            yield this.user1.attachPermissions({});
          } catch(exception) {
            errorThrow = exception;
          }

          expect(errorThrow).to.equal('Cannot attach a non-model object as a relationship object');
      });
    });

    describe('detach method', function() {
      it('should be added to model when defining a hasMany relationship with through', function*() {
        expect(_.isFunction(this.user3.detachPermissions)).to.be.true;
      });

      it('should be able to accept a single primary key', function*() {
        yield this.user3.detachPermissions(2);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(3);
      });

      it('should be able to accept an array of primary keys', function*() {
        yield this.user3.detachPermissions([2, 3]);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(2);
      });

      it('should be able to accept a single model', function*() {
        yield this.user3.detachPermissions(this.permission1);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(3);
      });

      it('should be able to accept an array of models', function*() {
        yield this.user3.detachPermissions([this.permission1, this.permission2]);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(2);
      });

      it('should be able to accept a collection of models', function*() {
        var collection = this.simpleOrm.collection.create([this.permission1, this.permission2]);
        yield this.user3.detachPermissions(collection);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(2);
      });

      it('should not remove an models if invilad primary key is passed', function*() {
        yield this.user3.detachPermissions(1000000000);

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(4);
      });

      it('should not remove an models if invalid object is passed', function*() {
        yield this.user3.detachPermissions({});

        var permission = yield this.user3.getPermissions();

        expect(permission.length).to.equal(4);
      });
    });

    it('should be able to define hasMany relationship with through model defining fields', function*() {
      //TODO: research: switch this to test for error but test error that are throw from a generator does not seem to be working and this functionality could
      //TODO: break while this test might still pass
      /*var err = "Error: ER_BAD_FIELD_ERROR: Unknown column 'UserPermissionMap.test' in 'on clause'";

      expect(function*() {
        yield model.getPermissions();
      }).to.throw(err);*/

      var relationalModels = yield this.user3.getPermissions();

      expect(relationalModels.getByIndex(0).id).to.equal(1);
      expect(relationalModels.getByIndex(0).title).to.equal('user.create');

      expect(relationalModels.getByIndex(1).id).to.equal(2);
      expect(relationalModels.getByIndex(1).title).to.equal('user.read');

      expect(relationalModels.getByIndex(2).id).to.equal(3);
      expect(relationalModels.getByIndex(2).title).to.equal('user.update');

      expect(relationalModels.getByIndex(3).id).to.equal(4);
      expect(relationalModels.getByIndex(3).title).to.equal('user.delete');
    });

    it('should return null if a belongsTo does not link anyone (basically a "can belong to" type relationship)', function*() {
      var relationalModel = yield this.userDetail5.getUser();

      expect(relationalModel).to.be.null;
    });

    it('should be able to convert to JSON with all relationship data', function*() {
      expect(yield this.user1.toJSONWithRelationships()).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        createdTimestamp: "2014-05-17T19:50:15.000Z",
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered',
        userDetail: {
          id: 1,
          userId: 1,
          details: 'one'
        },
        userDetailTest1: {
          id: 1,
          details: 'one'
        },
        testUserEmailsTest1: [{
          id: 1,
          email: 'one@example.com'
        }, {
          id: 5,
          email: 'five@example.com'
        }],
        testUserEmails: [
          'one@example.com',
          'five@example.com'
        ],
        permissions: [
          'user.create'
        ]
      });
    });

    it('should be able to convert to JSON with specific relationship data', function*() {
      expect(yield this.user1.toJSONWithRelationships([
        'UserDetail',
        'TestUserEmailsTest1',
        'TestUserEmails'
      ])).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        createdTimestamp: "2014-05-17T19:50:15.000Z",
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered',
        userDetail: {
          id: 1,
          userId: 1,
          details: 'one'
        },
        testUserEmailsTest1: [{
          id: 1,
          email: 'one@example.com'
        }, {
          id: 5,
          email: 'five@example.com'
        }],
        testUserEmails: [
          'one@example.com',
          'five@example.com'
        ]
      });
    });

    it('should be able to convert to JSON with 1 specific relationship data', function*() {
      expect(yield this.user1.toJSONWithRelationships([
        'UserDetail'
      ])).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        createdTimestamp: "2014-05-17T19:50:15.000Z",
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered',
        userDetail: {
          id: 1,
          userId: 1,
          details: 'one'
        }
      });
    });

    it('should be able to convert to JSON with 1 specific relationship passed as string', function*() {
      expect(yield this.user1.toJSONWithRelationships('UserDetail')).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        createdTimestamp: "2014-05-17T19:50:15.000Z",
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered',
        userDetail: {
          id: 1,
          userId: 1,
          details: 'one'
        }
      });
    });

    it('should be able to convert to JSON with specific relationship data passed as multiple strings', function*() {
      expect(yield this.user1.toJSONWithRelationships('UserDetail', 'TestUserEmailsTest1', 'TestUserEmails')).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        createdTimestamp: "2014-05-17T19:50:15.000Z",
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: true,
        status: 'registered',
        userDetail: {
          id: 1,
          userId: 1,
          details: 'one'
        },
        testUserEmailsTest1: [{
          id: 1,
          email: 'one@example.com'
        }, {
          id: 5,
          email: 'five@example.com'
        }],
        testUserEmails: [
          'one@example.com',
          'five@example.com'
        ]
      });
    });

    it('should return regular JSON is call to toJSONWithRelationships does not include any valid relationships', function*() {
        var model = this.dataLayer.user.create({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(yield model.toJSONWithRelationships('TestTest')).to.deep.equal({
          id: null,
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          createdTimestamp: null,
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });
    });
  });

  describe('utilities', function() {
    it('should be able to convert to simple JSON', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(model.toJSON()).to.deep.equal({
        id: null,
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        createdTimestamp: null,
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });
    });

    it('should be able to define the fields for JSON conversion', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: null,
        lastPasswordChangeDate: null,
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(model.toJSON({
        properties: [
          'firstName',
          'lastName',
          'updatedTimestamp'
        ]
      })).to.deep.equal({
        firstName: 'test',
        lastName: 'user',
        updatedTimestamp: null
      });
    });

    it('should be able to get primary key data', function*() {
      expect(this.user3._getDataStorePrimaryKeyData()).to.deep.equal({
        id: 3
      });
    });

    it('should be able to get all data store values', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: '13:24:35 12/23/10',
        lastPasswordChangeDate: '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(model._getDataStoreValues(this.dataAdapterManager.getInstance('instance1')._dataConverters)).to.deep.equal({
        id: null,
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        createdTimestamp: null,
        updatedTimestamp: '2010-12-23 13:24:35',
        lastPasswordChangeDate: '2011-01-12',
        requirePasswordChangeFlag: 0,
        status: 'registered'
      });
    });

    it('should be able to get insert sql values', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: '13:24:35 12/23/10',
        lastPasswordChangeDate: '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(model._getInsertDataStoreValues(this.dataAdapterManager.getInstance('instance1')._dataConverters)).to.deep.equal({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        lastPasswordChangeDate: '2011-01-12',
        requirePasswordChangeFlag: 0,
        status: 'registered'
      });
    });

    it('should be able to get update sql values', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: '13:24:35 12/23/10',
        lastPasswordChangeDate: '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status: 'registered'
      });

      expect(model._getUpdateDataStoreValues(this.dataAdapterManager.getInstance('instance1')._dataConverters)).to.deep.equal({
        firstName: 'test',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp: '2010-12-23 13:24:35',
        lastPasswordChangeDate: '2011-01-12',
        requirePasswordChangeFlag: 0,
        status: 'registered'
      });
    });

    it('should be able to attach a plugin globally', function*() {
      var user = this.dataLayer.user.create();

      expect(user.gp()).to.equal('this is a global model plugin');
    });
  });

  describe('hooks', function() {
    describe('types', function() {
      describe('beforeSave (on insert)', function() {
        it('single', function*() {
          var model = this.dataLayer.user.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password'
          });

          model.hook('beforeSave[test]', function(model, saveType) {
            expect(saveType).to.equal('insert');
            model.firstName = 'before-' + model.firstName;
          });
          yield model.save();

          this.testUserValues(model, {
            firstName: 'before-test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'registered'
          });

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = model.id;
          var modelFromDatabase = yield this.dataLayer.user.find({
            where: where
          });

          this.testUserValues(modelFromDatabase, {
            firstName: 'before-test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'registered'
          });

          expect(modelFromDatabase.id).to.be.at.least(5);
          expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          var model = this.dataLayer.user.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password'
          });

          model.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('insert');
            abort();
          });

          //this should never be called since the first hook calls the abort callback
          model.hook('beforeSave[test2]', function(model, saveType, abort) {
            expect(false).to.be.true;
          });

          expect(yield model.save()).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          var model = this.dataLayer.user.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password'
          });

          model.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('insert');
            model.firstName = 'before-' + model.firstName;
            abort();
          });
          expect(yield model.save()).to.be.false;

          this.testUserValues(model, {
            firstName: 'before-test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'registered'
          });
          expect(model.id).to.null;
        });

        it('should allow hook to pass back a custom value if hook executes the abort callback', function*() {
          var model = this.dataLayer.user.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password'
          });

          model.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('insert');
            model.firstName = 'before-' + model.firstName;
            abort('test');
          });
          expect(yield model.save()).to.equal('test')
        });
      });

      describe('afterSave (on insert)', function() {
        it('single', function*() {
          var model = this.dataLayer.user.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password'
          });

          model.hook('afterSave[test]', function(model, saveType) {
            expect(saveType).to.equal('insert');
            model.firstName = 'after-' + model.firstName;
          });
          yield model.save();

          this.testUserValues(model, {
            firstName: 'after-test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'registered'
          });

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = model.id;
          var modelFromDatabase = yield this.dataLayer.user.find({
            where: where
          });

          this.testUserValues(modelFromDatabase, {
            firstName: 'test',
            lastName: 'user',
            email: 'test.user@example.com',
            username: 'test.user',
            password: 'password',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'registered'
          });

          expect(modelFromDatabase.id).to.be.at.least(5);
          expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
        });
      });

      describe('beforeSave (on update)', function() {
        it('single', function*() {
          var start = moment().format('X');

          this.user3.requirePasswordChangeFlag = true;
          this.user3.hook('beforeSave[test]', function(model, saveType) {
            expect(saveType).to.equal('update');
            model.firstName = 'before-' + model.firstName;
          });
          yield this.user3.save();

          this.testUserValues(this.user3, {
            id: 3,
            firstName: 'before-John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: true,
            status: 'active'
          });

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var modelFromDatabase = yield this.dataLayer.user.find({
            where: where
          });

          this.testUserValues(modelFromDatabase, {
            id: 3,
            firstName: 'before-John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: true,
            status: 'active'
          });

          expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user3.firstName = 'test';

          this.user3.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('update');
            abort();
          });

          //this should never be called since the first hook calls the abort callback
          this.user3.hook('beforeSave[test2]', function(model, saveType, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user3.save()).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          var start = moment().format('X');

          this.user3.requirePasswordChangeFlag = true;
          this.user3.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('update');
            model.firstName = 'before-' + model.firstName;
            abort();
          });
          expect(yield this.user3.save()).to.be.false;

          this.testUserValues(this.user3, {
            id: 3,
            firstName: 'before-John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: true,
            status: 'active'
          });

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var modelFromDatabase = yield this.dataLayer.user.find({
            where: where
          });

          this.testUserValues(modelFromDatabase, {
            id: 3,
            firstName: 'John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: false,
            status: 'active'
          });
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          var start = moment().format('X');

          this.user3.requirePasswordChangeFlag = true;
          this.user3.hook('beforeSave[test]', function(model, saveType, abort) {
            expect(saveType).to.equal('update');
            model.firstName = 'before-' + model.firstName;
            abort('test');
          });
          expect(yield this.user3.save()).to.equal('test');
        });
      });

      describe('afterSave (on update)', function() {
        it('single', function*() {
          var start = moment().format('X');

          this.user3.requirePasswordChangeFlag = true;
          this.user3.hook('afterSave[test]', function(model, saveType) {
            expect(saveType).to.equal('update');
            model.firstName = 'after-' + model.firstName;
          });
          yield this.user3.save();

          this.testUserValues(this.user3, {
            id: 3,
            firstName: 'after-John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            updatedTimestamp: null,
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: true,
            status: 'active'
          });

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var modelFromDatabase = yield this.dataLayer.user.find({
            where: where
          });

          this.testUserValues(modelFromDatabase, {
            id: 3,
            firstName: 'John',
            lastName: 'Doe2',
            email: 'john.doe2@example.com',
            username: 'john.doe2',
            password: 'password',
            createdTimestamp: '2014-05-17T19:51:49.000Z',
            lastPasswordChangeDate: null,
            requirePasswordChangeFlag: true,
            status: 'active'
          });

          expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
        });
      });

      describe('beforeRemove', function() {
        it('single', function*() {
          this.user3.hook('beforeRemove[test]', function(model) {
            expect(model.id).to.equal(3);
          });
          expect(yield this.user3.remove()).to.be.true;

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var model = yield this.dataLayer.user.find({
            where: where
          });

          expect(model).to.be.null;
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user3.hook('beforeRemove[test]', function(model, abort) {
            expect(model.id).to.equal(3);
            abort();
          });

          this.user3.hook('beforeRemove[test2]', function(model, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user3.remove()).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.user3.hook('beforeRemove[test]', function(model, abort) {
            expect(model.id).to.equal(3);
            abort();
          });

          expect(yield this.user3.remove()).to.be.false;

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var model = yield this.dataLayer.user.find({
            where: where
          });

          expect(model.id).to.equal(3);
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.user3.hook('beforeRemove[test]', function(model, abort) {
            expect(model.id).to.equal(3);
            abort('before remove abort');
          });

          expect(yield this.user3.remove()).to.equal('before remove abort');
        });
      });

      describe('afterRemove', function() {
        it('single', function*() {
          this.user3.hook('afterRemove[test]', function(model) {
            expect(model.id).to.equal(3);
          });
          expect(yield this.user3.remove()).to.be.true;

          var where = {};
          where[this.dataLayer.user._model._primaryKeyColumns[0]] = this.user3.id;
          var model = yield this.dataLayer.user.find({
            where: where
          });

          expect(model).to.be.null;
        });
      });

      describe('beforeGetRelationship (belongsTo)', function() {
        it('single', function*() {
          this.userDetail1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName) {
            expect(relationshipType).to.equal('belongsTo');
            expect(relationshipModelName).to.equal('User');
          });

          expect((yield this.userDetail1.getUser()).id).to.equal(1);
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.userDetail1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('belongsTo');
            expect(relationshipModelName).to.equal('User');
            abort();
          });

          this.userDetail1.hook('beforeGetRelationship[test2]', function(model, relationshipType, relationshipModelName, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.userDetail1.getUser()).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.userDetail1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('belongsTo');
            expect(relationshipModelName).to.equal('User');
            abort();
          });

          expect(yield this.userDetail1.getUser()).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.userDetail1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('belongsTo');
            expect(relationshipModelName).to.equal('User');
            abort('before get relationship abort');
          });

          expect(yield this.userDetail1.getUser()).to.equal('before get relationship abort');
        });
      });

      describe('afterGetRelationship (belongsTo)', function() {
        it('single', function*() {
          this.userDetail1.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModel) {
            expect(relationshipType).to.equal('belongsTo');
            expect(relationshipModelName).to.equal('User');
            relationalModel.firstName = 'hook';
          });

          var relationalModel = yield this.userDetail1.getUser();

          expect(relationalModel.firstName).to.equal('hook');
        });
      });

      describe('beforeGetRelationship (hasOne)', function() {
        it('single', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasOne');
            expect(relationshipModelName).to.equal('UserDetail');
          });

          expect((yield this.user1.getUserDetail()).id).to.equal(1);
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasOne');
            expect(relationshipModelName).to.equal('UserDetail');
            abort();
          });

          this.user1.hook('beforeGetRelationship[test2]', function(model, relationshipType, relationshipModelName, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user1.getUserDetail()).to.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasOne');
            expect(relationshipModelName).to.equal('UserDetail');
            abort();
          });

          expect(yield this.user1.getUserDetail()).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasOne');
            expect(relationshipModelName).to.equal('UserDetail');
            abort('before get relationship abort');
          });

          expect(yield this.user1.getUserDetail()).to.equal('before get relationship abort');
        });
      });

      describe('afterGetRelationship (hasOne)', function() {
        it('single', function*() {
          this.user1.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModel) {
            expect(relationshipType).to.equal('hasOne');
            expect(relationshipModelName).to.equal('UserDetail');
            relationalModel.details = 'hook';
          });

          var relationalModel = yield this.user1.getUserDetail();

          expect(relationalModel.details).to.equal('hook');
        });
      });

      describe('beforeGetRelationship (hasMany)', function() {
        it('single', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasMany');
            expect(relationshipModelName).to.equal('UserEmail');
          });

          expect((yield this.user1.getTestUserEmails()).length).to.equal(2);
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasMany');
            expect(relationshipModelName).to.equal('UserEmail');
            abort();
          });

          this.user1.hook('beforeGetRelationship[test2]', function(model, relationshipType, relationshipModelName, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user1.getTestUserEmails()).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasMany');
            expect(relationshipModelName).to.equal('UserEmail');
            abort();
          });

          expect(yield this.user1.getTestUserEmails()).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.user1.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
            expect(relationshipType).to.equal('hasMany');
            expect(relationshipModelName).to.equal('UserEmail');
            abort('before get relationship abort');
          });

          expect(yield this.user1.getTestUserEmails()).to.equal('before get relationship abort');
        });
      });

      describe('afterGetRelationship (hasMany)', function() {
        it('single', function*() {
          this.user1.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModels) {
            expect(relationshipType).to.equal('hasMany');
            expect(relationshipModelName).to.equal('UserEmail');
            relationalModels.getByIndex(0).email = 'hook';
          });

          var relationalModels = yield this.user1.getTestUserEmails();

          expect(relationalModels.getByIndex(0).email).to.equal('hook');
        });
      });

      describe('beforeDetach', function() {
        it('single with primary key', function*() {
          this.user3.hook('beforeDetach[test]', function(model, options, abort) {
            expect(model.id).to.equal(3);
            expectedOptions = {
              criteria: {
                where: {}
              }
            };
            expectedOptions.criteria.where[dataLayerValues.userPermissionMapUserField] = 3;
            expectedOptions.criteria.where[dataLayerValues.userPermissionMapPermissionField] = {
              comparison: 'in',
              value: [
                1
              ]
            };
            expect(options).to.deep.equal(expectedOptions);
            options.criteria.where[dataLayerValues.userPermissionMapPermissionField].value = [
              3,
              4
            ];
          });

          yield this.user3.detachPermissions(1);
          var permissions = yield this.user3.getPermissions();

          expect(permissions.length).to.equal(2);
          expect(permissions.getByIndex(0).id).to.equal(1);
          expect(permissions.getByIndex(1).id).to.equal(2);
        });

        it('single with model', function*() {
          this.user3.hook('beforeDetach[test]', function(model, options, abort) {
            expect(model.id).to.equal(3);
            expectedOptions = {
              criteria: {
                where: {}
              }
            };
            expectedOptions.criteria.where[dataLayerValues.userPermissionMapUserField] = 3;
            expectedOptions.criteria.where[dataLayerValues.userPermissionMapPermissionField] = {
              comparison: 'in',
              value: [
                1
              ]
            };
            expect(options).to.deep.equal(expectedOptions);
            options.criteria.where[dataLayerValues.userPermissionMapPermissionField].value = [
              3,
              4
            ];
          });

          yield this.user3.detachPermissions(this.permission1);
          var permissions = yield this.user3.getPermissions();

          expect(permissions.length).to.equal(2);
          expect(permissions.getByIndex(0).id).to.equal(1);
          expect(permissions.getByIndex(1).id).to.equal(2);
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user3.hook('beforeDetach[test]', function(model, options, abort) {
            abort();
          });

          this.user3.hook('beforeDetach[test2]', function(model, options, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user3.detachPermissions(1)).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.user3.hook('beforeDetach[test]', function(model, options, abort) {
            abort()
          });

          expect(yield this.user3.detachPermissions(1)).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.user3.hook('beforeDetach[test]', function(model, options, abort) {
            abort('before detach abort')
          });

          expect(yield this.user3.detachPermissions(1)).to.equal('before detach abort');
        });
      });

      describe('afterDetach', function() {
        it('single', function*() {
          var test = false;
          this.user3.hook('afterDetach[test]', function(model) {
            expect(model.id).to.equal(3);
            test = true;
          });

          yield this.user3.detachPermissions(1);

          expect(test).to.be.true;
        });
      });

      describe('beforeAttach', function() {
        it('single with primary keys', function*() {
          var dataLayer = this.dataLayer;
          this.user1.hook('beforeAttach[test]', function(model, options, abort) {
            expect(model.id).to.equal(1);
            expectedOptions = {
              criteria: {
                where: {}
              }
            };
            expectedOptions.criteria.where[dataLayer.permission._model._primaryKeyColumns[0]] = {
              comparison: 'in',
              value: [
                2
              ]
            };
            expect(options).to.deep.equal(expectedOptions);
            options.criteria.where[dataLayer.permission._model._primaryKeyColumns[0]].value = [
              3,
              4
            ];
          });

          yield this.user1.attachPermissions(2);
          var permissions = yield this.user1.getPermissions();

          expect(permissions.length).to.equal(3);
          expect(permissions.getByIndex(0).id).to.equal(1);
          expect(permissions.getByIndex(1).id).to.equal(3);
          expect(permissions.getByIndex(2).id).to.equal(4);
        });

        it('single with models', function*() {
          var dataLayer = this.dataLayer;
          this.user1.hook('beforeAttach[test]', function(model, options, abort) {
            expect(model.id).to.equal(1);
            expectedOptions = {
              criteria: {
                where: {}
              }
            };
            expectedOptions.criteria.where[dataLayer.permission._model._primaryKeyColumns[0]] = {
              comparison: 'in',
              value: [
                2
              ]
            };
            expect(options).to.deep.equal(expectedOptions);
            options.criteria.where[dataLayer.permission._model._primaryKeyColumns[0]].value = [
              3,
              4
            ];
          });

          yield this.user1.attachPermissions(this.permission2);
          var permissions = yield this.user1.getPermissions();

          expect(permissions.length).to.equal(3);
          expect(permissions.getByIndex(0).id).to.equal(1);
          expect(permissions.getByIndex(1).id).to.equal(3);
          expect(permissions.getByIndex(2).id).to.equal(4);
        });

        it('should not allow other hooks to be called if the abort callback is executed', function*() {
          this.user1.hook('beforeAttach[test]', function(model, options, abort) {
            abort();
          });

          this.user1.hook('beforeAttach[test2]', function(model, options, abort) {
            expect(false).to.be.true;
          });

          expect(yield this.user1.attachPermissions(1)).to.be.false;
        });

        it('should abort action if hook executes the abort callback', function*() {
          this.user1.hook('beforeAttach[test]', function(model, options, abort) {
            abort();
          });

          expect(yield this.user1.attachPermissions(1)).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.user1.hook('beforeAttach[test]', function(model, options, abort) {
            abort('before attach abort');
          });

          expect(yield this.user1.attachPermissions(1)).to.equal('before attach abort');
        });
      });

      describe('afterAttach', function() {
        it('single', function*() {
          var test = false;
          this.user1.hook('afterAttach[test]', function(model) {
            expect(model.id).to.equal(1);
            test = true;
          });

          yield this.user1.attachPermissions(2);

          expect(test).to.be.true;
        });
      });
    });

    it('should be attachable to the base model object and available in the model instances', function*() {
      var model = this.dataLayer.permissionHook.create({
        title: 'user.admin'
      });
      yield model.save();

      expect(model.id).to.be.at.least(5);
      expect(model.title).to.equal('before-user.admin');

      var where = {};
      where[this.dataLayer.permissionHook._model._primaryKeyColumns[0]] = model.id;
      var modelFromDatabase = yield this.dataLayer.permissionHook.find({
        where: where
      });

      expect(modelFromDatabase.id).to.be.at.least(5);
      expect(modelFromDatabase.title).to.equal('before-user.admin');
    });
  });

  describe('bug cases', function() {
    it('invalid date/datetime should return as null', function*() {
      var model = this.dataLayer.user.create();

      model.lastPasswordChangeDate = '0000-00-00';
      model.createdTimestamp = '0000-00-00 00:00:00';

      expect(model.lastPasswordChangeDate).to.be.null;
      expect(model.createdTimestamp).to.be.null;
    });

    it('each model should have it own _status', function*() {
      var model1 = this.dataLayer.user.create();
      var model2 = this.dataLayer.user.create();

      model2._status = 'loaded';

      expect(model1._status).to.equal('new');
      expect(model2._status).to.equal('loaded');
    });
  });
}
