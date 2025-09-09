export default class MockSocketModel {
  constructor(newDoc, modelName) {
    try {
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
    } catch (error) {
      console.error(
        "Error constructing mock socket model",
        modelName,
        error.message
      );
    }
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

  find(query, options) {
    if (!query || Object.keys(query).length === 0) {
      const result = this.storage[this.currentModel];

      return this.handleChain(result);
    }

    if (this.currentModel === "chats") {
      const messages = this.storage[this.currentModel].filter(
        (item) =>
          item.receiver._id === query.participants ||
          item.sender._id === query.participants
      );

      const grouped = {};

      for (const message of messages) {
        const ids = [message.sender._id, message.receiver._id].sort();
        const key = ids.join("_");

        if (!grouped[key]) {
          grouped[key] = {
            conversation: [],
          };
        }

        grouped[key].conversation.push(message);
      }

      return this.handleChain(Object.values(grouped));
    }

    const result = this.storage[this.currentModel].filter((item) =>
      Object.entries(query).every(([key, value]) => {
        if (typeof value === "object" && value !== null && "$in" in value) {
          return value["$in"].includes(item[key]);
        }

        if (Array.isArray(item[key])) {
          return item[key].includes(value);
        }
        return item[key] === value;
      })
    );

    return this.handleChain(result);
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

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "object" && value !== null && "$all" in value) {
        result = this.storage[this.currentModel].find((item) => {
          const itemArray = item[key];

          return (
            Array.isArray(itemArray) &&
            value.$all.every((searchValue) => itemArray.includes(searchValue))
          );
        });

        return this.handleChain(result);
      }
    }

    result = this.storage[this.currentModel].find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );

    return this.handleChain(result);
  }

  async findById(id, projection = null, options = {}) {
    let result;
    const queryType = id.split("_")[0];
    const store =
      this.currentModel === "friends"
        ? this.storage["friends"]
        : this.storage["conversations"];

    if (queryType === "frdoc") {
      result = store.find((item) => item._id === id);

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

    if (options.populate) {
      return this.handleChain(result);
    }

    result.populate = this.populate;

    return { ...result };
  }

  async findByIdAndUpdate(id, updates, options = {}) {
    const items = this.storage[this.currentModel];

    const itemFound = items.find((item) => item._id === id);

    const index = items.indexOf(itemFound);

    if (index === -1) return null;

    const updated = { ...items[index], ...updates };
    items[index] = updated;

    return this.handleSelect(options.new ? updated : items[index]);
  }

  async findOneAndUpdate(query, updates, options = {}) {
    const items = this.storage[this.currentModel];
    const itemFound = items.find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );

    const index = items.indexOf(itemFound);

    if (index === -1) return null;

    const updated = { ...items[index], ...updates };
    items[index] = updated;

    return this.handleChain(updated);
  }

  async findByIdAndDelete(id) {
    const items = this.storage[this.currentModel];
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    return deleted;
  }

  async deleteOne(query) {
    const items = this.storage[this.currentModel];

    const itemFound = items.find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );

    if (!itemFound) return null;

    this.storage[this.currentModel] = this.storage[this.currentModel].filter(
      (item) => item._id !== itemFound._id
    );
  }

  cleanupAll() {
    for (const key in this.storage) {
      this.storage[key] = [];
    }
  }

  save() {
    if (!this.queriedDoc) return;

    if (!this.queriedDoc.isRead && this.currentModel === "conversations") {
      this.queriedDoc.isRead = false;
      this.queriedDoc.createdAt = new Date();
    }

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

  cleanupAll() {
    this.prevModel = null;
    this.currentModel = null;
    this._id = null;
    this.storage = Object.entries(this.storage).forEach(
      (key, value) => (key = [])
    );
    this.queriedDoc = null;
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
