import { noop } from '../../lib/noop';
import { screen, setup } from '../../test/test-utils';
import { PasswordInput } from '../PasswordInput';

describe('PasswordInput', () => {
  it('should start as password toggle to text on "SHOW"/"HIDE" icon click', async () => {
    const { user } = setup(<PasswordInput placeholder="input password" value="some text" onChange={noop} />);

    expect(screen.getByPlaceholderText<HTMLInputElement>('input password')).toBe('password');

    await user.click(screen.getByTitle('Show'));
    expect(screen.getByPlaceholderText<HTMLInputElement>('input password')).toBe('text');

    await user.click(screen.getByTitle('Hide'));
    expect(screen.getByPlaceholderText<HTMLInputElement>('input password')).toBe('password');
  });
});
