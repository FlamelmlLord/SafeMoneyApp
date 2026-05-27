declare module 'react-katex' {
  import { FC } from 'react';
  export const BlockMath: FC<{ math: string }>;
  export const InlineMath: FC<{ math: string }>;
}
