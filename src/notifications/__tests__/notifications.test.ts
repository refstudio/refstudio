import { emitEvent, RefStudioEventName } from '../../events';
import { notifyErr, notifyError, notifyInfo, notifyWarning } from '../notifications';

vi.mock('../../events');

const eventNew: RefStudioEventName = 'refstudio://notifications/new';

describe('notifications', () => {
  it('should emit event to create info notification', () => {
    notifyInfo('title', 'details');
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventNew, {
      type: 'info',
      title: 'title',
      details: 'details',
    });
  });

  it('should emit event to create warning notification', () => {
    notifyWarning('title', 'details');
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventNew, {
      type: 'warning',
      title: 'title',
      details: 'details',
    });
  });

  it('should emit event to create error notification', () => {
    notifyError('title', 'details');
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventNew, {
      type: 'error',
      title: 'title',
      details: 'details',
    });
  });

  it('should emit event to create error notification from Error', () => {
    const err = new Error('message');
    notifyErr(err);
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventNew, {
      type: 'error',
      title: 'message',
      details: err.stack,
    });
  });

  it('should emit event to create error (notifiyErr) notification from string', () => {
    notifyErr('message');
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventNew, {
      type: 'error',
      title: 'Error',
      details: 'message',
    });
  });
});
