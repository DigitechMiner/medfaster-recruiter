interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export default function NumPad({ value, onChange }: NumPadProps) {
  const handleKey = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    // Prevent multiple decimals
    if (key === '.' && value.includes('.')) return;
    // Prevent more than 2 decimal places
    const parts = value.split('.');
    if (parts[1] && parts[1].length >= 2) return;
    // Max 7 digits before decimal
    if (!value.includes('.') && value.length >= 7) return;

    onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => handleKey(key)}
          className={`
            flex flex-col items-center justify-center rounded-xl py-4
            text-lg font-semibold text-gray-800 bg-white shadow-sm
            active:scale-95 transition-transform
            ${key === 'del' ? 'text-gray-500' : ''}
          `}
        >
          {key === 'del' ? (
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M8 1L1 8L8 15M21 8H1" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 1H9L1 8L9 15H21V1Z" stroke="#6B7280" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          ) : (
            <>
              <span>{key}</span>
              {/* Letter labels matching Figma */}
              {{'2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ'}[key] && (
                <span className="text-[9px] text-gray-400 font-normal mt-0.5">
                  {{'2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ'}[key]}
                </span>
              )}
            </>
          )}
        </button>
      ))}
    </div>
  );
}
