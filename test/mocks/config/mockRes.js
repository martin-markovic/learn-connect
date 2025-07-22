export default class MockRes {
  constructor() {
    this.statusCode = null;
    this.body = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.body = data;
    return this;
  }

  reset() {
    this.statusCode = null;
    this.body = null;
  }
}
