interface NumericKeypadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
}

export function NumericKeypad({ label, value, onChange, onDone }: NumericKeypadProps) {
  const pressDigit = (d: string) => {
    if (value === '0' || value === '-0') {
      onChange(value.startsWith('-') ? `-${d}` : d);
    } else {
      onChange(value + d);
    }
  };

  const pressDecimal = () => {
    if (value.includes('.')) return;
    onChange(value === '' || value === '-' ? `${value}0.` : `${value}.`);
  };

  const pressBackspace = () => {
    const next = value.slice(0, -1);
    onChange(next === '' || next === '-' ? '0' : next);
  };

  const pressToggleSign = () => {
    onChange(value.startsWith('-') ? value.slice(1) : `-${value}`);
  };

  return (
    <div className="keypad-backdrop" onClick={onDone}>
      <div className="keypad" onClick={(e) => e.stopPropagation()}>
        <div className="keypad-header">
          <span>Score for {label}</span>
          <span className="keypad-value">{value}</span>
        </div>
        <div className="keypad-grid">
          <button type="button" className="keypad-key" onClick={() => pressDigit('7')}>7</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('8')}>8</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('9')}>9</button>
          <button type="button" className="keypad-key keypad-key-func" onClick={pressBackspace}>⌫</button>

          <button type="button" className="keypad-key" onClick={() => pressDigit('4')}>4</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('5')}>5</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('6')}>6</button>
          <button type="button" className="keypad-key keypad-key-func" onClick={pressToggleSign}>+/-</button>

          <button type="button" className="keypad-key" onClick={() => pressDigit('1')}>1</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('2')}>2</button>
          <button type="button" className="keypad-key" onClick={() => pressDigit('3')}>3</button>
          <button type="button" className="keypad-key keypad-key-func" onClick={pressDecimal}>.</button>

          <button type="button" className="keypad-key keypad-key-wide" onClick={() => pressDigit('0')}>0</button>
          <button type="button" className="keypad-key keypad-key-done" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}
