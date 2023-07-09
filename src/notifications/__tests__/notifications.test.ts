import { emitEvent, RefStudioEventName } from '../../events';
import {
  clearNotifications,
  hideNotifications,
  notifyErr,
  notifyError,
  notifyInfo,
  notifyWarning,
  showNotifications,
} from '../notifications';
import { NotificationItemType } from '../types';

vi.mock('../../events');

const eventNew: RefStudioEventName = 'refstudio://notifications/new';
const eventClear: RefStudioEventName = 'refstudio://notifications/clear';
const eventShowNotifications: RefStudioEventName = 'refstudio://notifications/popup/open';
const eventHideNotifications: RefStudioEventName = 'refstudio://notifications/popup/close';

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

  it.each<{ type?: NotificationItemType }>([
    { type: undefined },
    { type: 'info' },
    { type: 'warning' },
    { type: 'error' },
  ])('should emit event to clear $type notifications', ({ type }) => {
    clearNotifications(type);
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventClear, { type });
  });

  it.each<{ type?: NotificationItemType }>([
    { type: undefined },
    { type: 'info' },
    { type: 'warning' },
    { type: 'error' },
  ])('should emit event to show notifications of type $type', ({ type }) => {
    showNotifications(type);
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventShowNotifications, { type });
  });

  it('should emit event to hide notifications popup', () => {
    hideNotifications();
    expect(vi.mocked(emitEvent)).toHaveBeenCalledWith(eventHideNotifications);
  });
});
