import { expect } from "chai";
import MockSocketModel from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";

class ChatFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "chats");

    if (newDoc) {
      this._id = this.queriedDoc._id;
    }
  }

  static async findOne(query) {
    return new this().findOne(query);
  }

  static async findById(id) {
    return new this().findById(id);
  }

  static async create(doc) {
    return new this().create(doc);
  }

  static async findOneAndUpdate(query, updates, options = {}) {
    return new this().findOneAndUpdate(query, updates, options);
  }

  static async deleteOne(query) {
    return new this().deleteOne(query);
  }

  static async cleanupAll() {
    return new this().cleanupAll();
  }
}

class ConversationFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "conversations");

    if (newDoc) {
      this._id = this.queriedDoc._id;
    }
  }

  static async findOne(query) {
    return new this().findOne(query);
  }

  static async findById(id) {
    return new this().findById(id);
  }

  static async create(doc) {
    return new this().create(doc);
  }

  static async findOneAndUpdate(query, updates, options = {}) {
    return new this().findOneAndUpdate(query, updates, options);
  }

  static async deleteOne(query) {
    return new this().deleteOne(query);
  }

  static async cleanupAll() {
    return new this().cleanupAll();
  }
}

class UserFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "users");

    if (newDoc) {
      this._id = this.queriedDoc._id;
    }
  }

  static async findOne(query) {
    return new this().findOne(query);
  }

  static async findById(id) {
    return new this().findById(id);
  }

  static async create(doc) {
    return new this().create(doc);
  }

  static async findOneAndUpdate(query, updates, options = {}) {
    return new this().findOneAndUpdate(query, updates, options);
  }

  static async deleteOne(query) {
    return new this().deleteOne(query);
  }

  static async cleanupAll() {
    return new this().cleanupAll();
  }
}

const ChatData = new MockData();

let mockSender;
let mockReceiver;
let noChatUser;

describe("socket message controllers", () => {
  before(async () => {
    mockSender = await UserFactory.create(ChatData.mockUsers[0]);

    mockReceiver = await UserFactory.create(ChatData.mockUsers[1]);

    noChatUser = await UserFactory.create(ChatData.mockUsers[2]);
  });

  after(() => {
    ChatFactory.cleanupAll();
    ConversationFactory.cleanupAll();
    UserFactory.cleanupAll();
  });

});
