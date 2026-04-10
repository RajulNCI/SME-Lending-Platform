import styled, { css } from 'styled-components';
import { Card } from './Card';
import { bodyXs } from '../../styles/mixins';

interface KpiCardProps {
  $trend?: 'up' | 'down' | 'neutral';
}

export const KpiCard = styled(Card)<KpiCardProps>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

export const KpiLabel = styled.p`
  ${bodyXs}
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

export const KpiValue = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800]};
  line-height: 1;
`;

export const KpiValueNavy = styled(KpiValue)`
  color: #fff;
`;

export const KpiSub = styled.div`
  ${bodyXs}
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

export const KpiTrend = styled.span<{ $dir: 'up' | 'down' | 'neutral' }>`
  ${bodyXs}
  font-weight: 600;
  ${({ $dir }) =>
    $dir === 'up'      ? css` color: #0F6E56; ` :
    $dir === 'down'    ? css` color: #A32D2D; ` :
                        css` color: #5F5E5A; `}
`;

export const KpiIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
`;
