'use client';

import React from 'react';

interface Props {
  text: string;
}

/**
 * Renders plain-text / simple-markdown agent responses for chat panels.
 * No external markdown lib — lightweight inline renderer.
 */
export default function ChatContent({ text }: Props) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineFormat = (raw: string, key: string | number): React.ReactNode => {
    // Inline code
    const parts = raw.split(/(`[^`]+`)/g);
    return (
      <span key={key}>
        {parts.map((part, idx) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={idx} className="chat-inline-code">
                {part.slice(1, -1)}
              </code>
            );
          }
          // Bold
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bp, bi) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return <strong key={bi} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bp.slice(2, -2)}</strong>;
            }
            // Italic
            const italicParts = bp.split(/(\*[^*]+\*)/g);
            return italicParts.map((ip, ii) => {
              if (ip.startsWith('*') && ip.endsWith('*')) {
                return <em key={ii} style={{ color: 'var(--text-secondary)' }}>{ip.slice(1, -1)}</em>;
              }
              return ip;
            });
          });
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="chat-code-block">
          {lang && <div className="chat-code-lang">{lang}</div>}
          <pre><code>{codeLines.join('\n')}</code></pre>
        </div>
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      elements.push(<h1 key={i} className="chat-h1">{inlineFormat(h1[1], 'h')}</h1>);
      i++; continue;
    }
    if (h2) {
      elements.push(<h2 key={i} className="chat-h2">{inlineFormat(h2[1], 'h')}</h2>);
      i++; continue;
    }
    if (h3) {
      elements.push(<h3 key={i} className="chat-h3">{inlineFormat(h3[1], 'h')}</h3>);
      i++; continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={i} className="chat-hr" />);
      i++; continue;
    }

    // Unordered list item
    const ul = line.match(/^(\s*)[*\-+] (.+)/);
    if (ul) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^(\s*)[*\-+] (.+)/)) {
        const match = lines[i].match(/^(\s*)[*\-+] (.+)/)!;
        listItems.push(
          <li key={i} style={{ marginLeft: `${match[1].length * 8}px` }}>
            {inlineFormat(match[2], i)}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="chat-list">{listItems}</ul>);
      continue;
    }

    // Ordered list item
    const ol = line.match(/^\s*\d+\. (.+)/);
    if (ol) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\. (.+)/)) {
        const match = lines[i].match(/^\s*\d+\. (.+)/)!;
        listItems.push(<li key={i}>{inlineFormat(match[1], i)}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="chat-list chat-list-ordered">{listItems}</ol>);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="chat-blockquote">
          {inlineFormat(line.slice(2), i)}
        </blockquote>
      );
      i++; continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="chat-spacer" />);
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="chat-p">{inlineFormat(line, i)}</p>
    );
    i++;
  }

  return <div className="chat-content">{elements}</div>;
}
