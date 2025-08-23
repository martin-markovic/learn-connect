export default class MockSocketModel {
  constructor(newDoc, modelName) {
    this.prevModel = modelName !== null ? modelName : this.prevModel;
    this.currentModel = modelName !== null ? modelName : this.prevModel;
    this._id = null;
    this.storage = sharedStorage;
    this.queriedDoc =
      newDoc !== null
        ? {
            ...newDoc,
            _id: `frdoc_${this.storage[this.currentModel].length + 1}`,
          }
        : null;
  }

  async create(doc) {
    const created = {
      _id: String(
        doc._id ? doc._id : this.storage[this.currentModel].length + 1
      ),
      ...doc,
    };

    this.storage[this.currentModel].push(created);
    return this.handleChain(created);
  }

  async findOne(query) {
    let result;

    if ("$or" in query) {
      result = this.storage[this.currentModel].find((item) =>
        query.$or.some((condition) =>
          Object.keys(condition).every((key) => item[key] === condition[key])
        )
      );

      return this.handleChain(result);
    }

    result = this.storage[this.currentModel].find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );

    return this.handleChain(result);
  }

  async findById(id) {
    let result;
    const queryType = id.split("_")[0];

    if (queryType === "frdoc") {
      result = this.storage["friends"].find((item) => item._id === id);

      const reqSender = this.storage["users"].find(
        (u) => u._id === result.sender
      );
      const reqReceiver = this.storage["users"].find(
        (u) => u._id === result.receiver
      );

      return this.handleChain({
        ...result,
        sender: reqSender,
        receiver: reqReceiver,
      });
    }

    result =
      this.storage[this.currentModel].find((item) => item._id === id) || null;

    result.populate = this.populate;

    return { ...result };
  }

  cleanupAll() {
    for (const key in this.storage) {
      this.storage[key] = [];
    }
  }

  save() {
    this.storage[this.currentModel].push(this.queriedDoc);
    return this.queriedDoc;
  }

  populate(...args) {
    return this;
  }

  handleChain(doc) {
    if (!doc) {
      return undefined;
    }

    const formattedDoc = {
      ...doc,
      populate: this.populate,
      save: this.save,
    };

    return formattedDoc;
  }
}

const sharedStorage = {
  users: [],
  quizzes: [],
  exams: [],
  scores: [],
  conversations: [],
  chats: [],
  classrooms: [],
  friends: [],
  notifications: [],
};
