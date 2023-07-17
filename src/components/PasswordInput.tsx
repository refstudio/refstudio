import { useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [masked, setMasked] = useState(true);

  return (
    <div className="relative flex items-center justify-between">
      <input {...props} type={masked ? 'password' : 'text'} />
      <span className="absolute right-0 mr-2 cursor-pointer">
        {!masked && <VscEye title="Hide" onClick={() => setMasked(true)} />}
        {masked && <VscEyeClosed title="Show" onClick={() => setMasked(false)} />}
      </span>
    </div>
  );
}
