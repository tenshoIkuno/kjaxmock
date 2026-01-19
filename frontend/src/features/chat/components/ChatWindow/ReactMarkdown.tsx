import { Text } from '@mantine/core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

type ReactMarkdownProps = {
  children: string;
};

export const ReactMarkdownComponent: React.FC<ReactMarkdownProps> = ({
  children,
}) => {
  return (
    <ReactMarkdown
      children={children}
      remarkPlugins={[remarkGfm]}
      components={{
        // pタグ
        p: (props) => <Text size="sm" my={2} {...props} />,
        // liタグ
        li: (props) => <Text size="sm" component="li" my={2} {...props} />,
        // preタグは中身そのままレンダリング
        pre: ({ children }) => <>{children}</>,
        // codeタグ（ハイライト処理のメイン）
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');

          if (match) {
            return (
              <SyntaxHighlighter
                language={match[1]}
                style={vscDarkPlus}
                wrapLongLines={true}
                PreTag="div"
                codeTagProps={{
                  style: {
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                }}
                customStyle={{
                  margin: '12px 0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: '0.85rem',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }

          // インラインコード
          return (
            <code
              style={{
                background: '#f2f2f2',
                padding: '2px 4px',
                borderRadius: 4,
                fontSize: '0.85rem',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        // table関連タグ
        table: (props) => (
          <div
            style={{
              overflowX: 'auto',
              marginTop: 12,
              marginBottom: 12,
              borderRadius: 12,
              border: '1px solid #d0d0d0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                borderRadius: 12,
                overflow: 'hidden',
              }}
              {...props}
            />
          </div>
        ),
        th: (props) => (
          <th
            style={{
              padding: '10px 12px',
              background: '#d6eaff',
              fontWeight: 600,
              textAlign: 'left',
              borderBottom: '1px solid #d3d3d3',
              borderRight: '1px solid #dcdcdc',
            }}
            {...props}
          />
        ),
        td: (props) => (
          <td
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #e0e0e0',
              borderRight: '1px solid #e5e5e5',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f2f2')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
            {...props}
          />
        ),
      }}
    />
  );
};
