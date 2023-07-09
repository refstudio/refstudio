import { emitEvent, RefStudioEventName } from '../../events';
import { notifyError, notifyInfo, notifyWarning } from '../notifications';

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
});
