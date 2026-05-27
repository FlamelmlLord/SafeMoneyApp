import { BlockMath, InlineMath } from 'react-katex';

export const Formula = ({ tex, block = false }: { tex: string; block?: boolean }) =>
  block ? <BlockMath math={tex} /> : <InlineMath math={tex} />;
