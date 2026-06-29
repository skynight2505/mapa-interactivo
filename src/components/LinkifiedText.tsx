import { linkifyText } from '../utils/translateContent';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export default function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = linkifyText(text);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        typeof part === 'string'
          ? <span key={i}>{part}</span>
          : <a key={i} href={part.href} target="_blank" rel="noopener noreferrer"
               style={{ color: '#60A5FA', textDecoration: 'underline', wordBreak: 'break-all' }}
               onClick={e => e.stopPropagation()}>
              {part.label}
            </a>
      )}
    </span>
  );
}
