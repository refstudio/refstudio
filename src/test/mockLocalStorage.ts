export const mockLocalStorage = () => {
  const setItemMock = vi.fn();
  const getItemMock = vi.fn();
  const removeItemMock = vi.fn();

  beforeEach(() => {
    Storage.prototype.setItem = setItemMock;
    Storage.prototype.getItem = getItemMock;
    Storage.prototype.removeItem = removeItemMock;
  });

  afterEach(() => {
    setItemMock.mockRestore();
    getItemMock.mockRestore();
    removeItemMock.mockRestore();
  });

  return { setItemMock, getItemMock, removeItemMock };
};
