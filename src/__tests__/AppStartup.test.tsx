import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import { App } from '../application/App';
import { AppStartup } from '../AppStartup';
import { render, waitFor } from '../test/test-utils';

vi.mock('../events');
vi.mock('../io/filesystem');
vi.mock('../settings/settingsManager');
vi.mock('../application/App', () => {
  const FakeApp = vi.fn(() => <div>App</div>);
  return {
    App: FakeApp,
  };
});
vi.mock('../api/server', () => ({
  useRefStudioServerOnDesktop: () => true,
}));
vi.mock('../api/projectsAPI', () => ({
  readAllProjects: () => Promise.resolve([]),
}));

describe('AppStartup', () => {
  afterEach(() => {
    clearMocks();
    vi.clearAllMocks();
  });

  it('should render null while initializing', () => {
    const { container } = render(<AppStartup />);
    expect(vi.mocked(App)).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('should render <App /> while initializing', async () => {
    mockIPC((cmd) => {
      switch (cmd) {
        case 'close_splashscreen':
          return;
        default:
          break;
      }
    });

    render(<AppStartup />);

    await waitFor(() => {
      expect(vi.mocked(App)).toHaveBeenCalled();
    });
  });
});
