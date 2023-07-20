import { fireEvent, screen, waitFor } from '@testing-library/react';

import { askForRewrite, AskForRewriteReturn } from '../../../../api/rewrite';
import { RewriteOptions } from '../../../../api/rewrite.config';
import { emitEvent, RefStudioEventName } from '../../../../events';
import { noop } from '../../../../lib/noop';
import { getCachedSetting, OpenAiManner, SettingsSchema } from '../../../../settings/settingsManager';
import { render, setup } from '../../../../test/test-utils';
import { RewriteWidget } from '../RewriteWidget';

const SELECTED_TEXT = 'This is the selected text.';
const CHOICE_OPTION_1 = 'This is the first choice option.';
const CHOICE_OPTION_2 = 'This is the second choice option.';
const CHOICE_OPTION_3 = 'This is the third choice option.';
const INSERT_TEXT_EVENT = 'refstudio://ai/suggestion/insert' as RefStudioEventName;

vi.mock('../../../../api/rewrite');
vi.mock('../../../../settings/settingsManager');
vi.mock('../../../../events');

const mockSettings: Pick<SettingsSchema, 'openAI'> = {
  openAI: {
    chatModel: 'dont-care',
    apiKey: 'dont-care',
    manner: 'elaborate',
    temperature: 0.75,
  },
};

describe('RewriteWidget', () => {
  beforeEach(() => {
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      switch (key) {
        case 'openAI':
          return mockSettings[key];
        default:
          throw new Error('UNEXPECTED CALL FOR KEY ' + key);
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the selection', () => {
    render(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);
    expect(screen.getByText(SELECTED_TEXT)).toBeInTheDocument();
  });

  it('should display openAI settings by default', () => {
    render(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);
    expect(screen.getByLabelText('creativity')).toHaveValue(String(mockSettings.openAI.temperature));
    expect(screen.getByLabelText('manner')).toHaveValue(mockSettings.openAI.manner);
  });

  it('should configure openAI settings and call askForRewrite', async () => {
    const { user } = setup(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);

    // https://github.com/testing-library/user-event/issues/871
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(screen.getByLabelText('creativity'), { target: { value: 0.85 } });
    await user.selectOptions(screen.getByLabelText('manner'), 'scholarly' as OpenAiManner);

    await user.click(screen.getByText('REWRITE'));

    expect(askForRewrite).toHaveBeenCalledTimes(1);
    expect(askForRewrite).toHaveBeenCalledWith<[string, RewriteOptions]>(SELECTED_TEXT, {
      manner: 'scholarly',
      temperature: 0.85,
      nChoices: 3,
    });
  });

  it('should display Processing... while askForRewrite is processing', async () => {
    let resolveFn: () => void = () => fail();
    vi.mocked(askForRewrite).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        // Capture resolve function to call after assertion
        resolveFn = resolve;
      });
      return { ok: true, choices: [CHOICE_OPTION_1, CHOICE_OPTION_2, CHOICE_OPTION_3] } as AskForRewriteReturn;
    });

    const { user } = setup(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);

    await user.click(screen.getByText('REWRITE'));

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    resolveFn();

    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });

  it('should display error message if askForRewrite fails', async () => {
    let rejectFn: (reason?: unknown) => void = () => fail();
    vi.mocked(askForRewrite).mockImplementation(async () => {
      await new Promise<void>((_, reject) => {
        // Capture reject function to call after assertion
        rejectFn = reject;
      });
      return { ok: true, choices: ['A choice option.'] } as AskForRewriteReturn;
    });

    const { user } = setup(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);

    await user.click(screen.getByText('REWRITE'));

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    rejectFn('Error message');

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('should display error message if askForRewrite returns ok:false', async () => {
    let resolveFn: () => void = () => fail();
    vi.mocked(askForRewrite).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        // Capture resolve function to call after assertion
        resolveFn = resolve;
      });
      return { ok: false, message: 'This is an error message.' } as AskForRewriteReturn;
    });

    const { user } = setup(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={noop} />);

    await user.click(screen.getByText('REWRITE'));

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    resolveFn();

    await waitFor(() => {
      expect(screen.getByText('This is an error message.')).toBeInTheDocument();
    });
  });

  const awaitForChoicesOnScreen = async (onChoiceSelected?: (choice: string) => void) => {
    let resolveFn: () => void = () => fail();
    vi.mocked(askForRewrite).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        // Capture resolve function to call after assertion
        resolveFn = resolve;
      });
      return { ok: true, choices: [CHOICE_OPTION_1, CHOICE_OPTION_2, CHOICE_OPTION_3] } as AskForRewriteReturn;
    });

    const { user } = setup(<RewriteWidget selection={SELECTED_TEXT} onChoiceSelected={onChoiceSelected} />);

    await user.click(screen.getByText('REWRITE'));
    resolveFn();

    // wait for the UI to be ready
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });

    return { user };
  };

  it('should display first choice after successfull askForRewrite reply and button to REPLACE', async () => {
    await awaitForChoicesOnScreen();
    expect(screen.getByText(CHOICE_OPTION_1)).toBeInTheDocument();
    expect(screen.getByText('REPLACE')).toBeInTheDocument();
  });

  it('should toggle beetween choices', async () => {
    const { user } = await awaitForChoicesOnScreen();

    expect(screen.getByText(CHOICE_OPTION_1)).toBeInTheDocument();
    await user.click(screen.getByTitle('next choice'));
    expect(screen.getByText(CHOICE_OPTION_2)).toBeInTheDocument();
    await user.click(screen.getByTitle('next choice'));
    expect(screen.getByText(CHOICE_OPTION_3)).toBeInTheDocument();
    await user.click(screen.getByTitle('previous choice'));
    expect(screen.getByText(CHOICE_OPTION_2)).toBeInTheDocument();
  });

  it(`should emitEvent ${INSERT_TEXT_EVENT} and call onChoiceSelected on REPLACE click`, async () => {
    const fn = vi.fn();
    const { user } = await awaitForChoicesOnScreen(fn);

    await user.click(screen.getByText('REPLACE'));

    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(INSERT_TEXT_EVENT, { text: CHOICE_OPTION_1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(CHOICE_OPTION_1);
  });
});
