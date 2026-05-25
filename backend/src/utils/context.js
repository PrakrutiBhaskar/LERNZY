const { AsyncLocalStorage } = require("async_hooks");
const contextStorage = new AsyncLocalStorage();

module.exports = {
  contextStorage,
  getRequestId: () => {
    const store = contextStorage.getStore();
    return store ? store.requestId : null;
  }
};
