// ai生成中のドットコンポーネント
import { Box } from '@mantine/core';

export const AiTypingDots = () => {
  return (
    <Box
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        marginBottom: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w={6}
          h={6}
          bg="gray.6"
          style={{
            borderRadius: '50%',
            animation: `typing-blink 1.4s infinite ${i * 0.2}s`,
          }}
        />
      ))}

      <style>
        {`
        @keyframes typing-blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        `}
      </style>
    </Box>
  );
};
