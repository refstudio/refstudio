import { notifyErr, notifyError, notifyInfo, notifyWarning } from '../notifications';
import { interceptConsoleMessages, prefixTitle } from '../notifications.console';

vi.mock('../notifications');

describe('notifications.console', () => {
  let resetInterceptor: () => void;
  beforeAll(() => {
    resetInterceptor = interceptConsoleMessages();
  });

  afterAll(() => {
    resetInterceptor();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should intercept console.log', () => {
    console.log('message');
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledWith(prefixTitle('message'), undefined);
  });

  it('should intercept console.log with optional parameters as details in JSON', () => {
    console.log('message', 'some extra');
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledWith(prefixTitle('message'), '"some extra"');
  });

  it('should intercept console.log with optional parameters in multi-line JSON', () => {
    console.log('message', 'some extra', 1, { a: 42 });
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyInfo)).toHaveBeenCalledWith(
      prefixTitle('message'),
      ['"some extra"', 1, JSON.stringify({ a: 42 }, null, 2)].join('\n'),
    );
  });

  it('should intercept console.warn', () => {
    console.warn('message');
    expect(vi.mocked(notifyWarning)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyWarning)).toHaveBeenCalledWith(prefixTitle('message'), undefined);
  });

  it('should intercept console.error', () => {
    console.error('message');
    expect(vi.mocked(notifyError)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyError)).toHaveBeenCalledWith(prefixTitle('message'), undefined);
  });

  it('should intercept console.error with err in first arg', () => {
    const err = new Error('message');
    console.error(err);
    expect(vi.mocked(notifyErr)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyErr)).toHaveBeenCalledWith(err);
  });

  it('should intercept console.error with err in second arg', () => {
    const err = new Error('message');
    console.error('some error', err);
    expect(vi.mocked(notifyErr)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifyErr)).toHaveBeenCalledWith(err, prefixTitle('some error'));
  });

  it('should reset interceptor', () => {
    resetInterceptor();

    console.log('message');
    console.warn('message');
    console.error('message');

    expect(vi.mocked(notifyInfo)).toHaveBeenCalledTimes(0);
    expect(vi.mocked(notifyWarning)).toHaveBeenCalledTimes(0);
    expect(vi.mocked(notifyError)).toHaveBeenCalledTimes(0);
  });

  it('should not intercept if all parameters are false', () => {
    resetInterceptor();
    interceptConsoleMessages(false, false, false);
    console.log('message');
    console.warn('message');
    console.error('message');

    expect(vi.mocked(notifyInfo)).toHaveBeenCalledTimes(0);
    expect(vi.mocked(notifyWarning)).toHaveBeenCalledTimes(0);
    expect(vi.mocked(notifyError)).toHaveBeenCalledTimes(0);
  });
});
