import styled from 'styled-components';

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  font-size: 18px;
  /* styles from styles.sectionTitle applied via className in component */
`;

export const StepsContainer = styled.div`
  margin-top: 32px;
`;

export const StepRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const StepTextContainer = styled.div`
  margin-left: 16px;
`;

export const StepLabel = styled.div<{ $active: boolean; $awaiting: boolean; $done: boolean }>`
  font-size: 13px;
  font-weight: ${({ $active, $awaiting }) => ($active || $awaiting ? 700 : 500)};
  color: ${({ $active, $awaiting, $done }) =>
    $active || $done || $awaiting ? '#0F2D6B' : '#64748B'};
  font-family: 'Syne', sans-serif;
`;

export const StepSubLabel = styled.div`
  font-size: 10px;
  color: #64748B;
  font-family: 'DM Mono', monospace;
  margin-top: 2px;
`;

export const StepStatus = styled.div<{ $color: string; $weight?: number }>`
  margin-left: auto;
  font-size: 10px;
  color: ${({ $color }) => $color};
  font-family: 'DM Mono', monospace;
  font-weight: ${({ $weight }) => $weight || 400};
`;

export const ResultCard = styled.div<{ $variant: 'approved' | 'declined' | 'referred' }>`
  text-align: center;
  margin-top: 32px;
  padding: 20px;
  border-radius: 8px;

  ${({ $variant }) =>
    $variant === 'approved' &&
    `
    background: #F0FDF9;
    border: 1px solid rgba(5,150,105,.2);
  `}

  ${({ $variant }) =>
    $variant === 'declined' &&
    `
    background: #FEF2F2;
    border: 1px solid rgba(220,38,38,.2);
  `}

  ${({ $variant }) =>
    $variant === 'referred' &&
    `
    background: #FFFBEB;
    border: 1px solid rgba(217,119,6,.2);
  `}
`;

export const ResultIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

export const ResultTitle = styled.div<{ $color: string }>`
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 4px;
`;

export const ResultDescription = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${({ $color }) => $color};
`;
