import styled, { css } from 'styled-components';
import { cardBase } from '../../styles/mixins';

type CardVariant = 'default' | 'navy' | 'ghost';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  $variant?: CardVariant;
  $padding?: CardPadding;
  $hoverable?: boolean;
}

const paddingMap: Record<CardPadding, string> = {
  sm: '0.75rem 1rem',
  md: '1.25rem 1.5rem',
  lg: '1.75rem 2rem',
};

export const Card = styled.div<CardProps>`
  ${cardBase}
  padding: ${({ $padding = 'md' }) => paddingMap[$padding]};
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  ${({ $variant }) => $variant === 'navy' && css`
    background: #0C2B5E;
    border-color: #1A56A0;
    color: #fff;
  `}

  ${({ $variant }) => $variant === 'ghost' && css`
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  `}

  ${({ $hoverable }) => $hoverable && css`
    cursor: pointer;
    &:hover {
      box-shadow: 0 4px 16px rgba(12, 43, 94, 0.12);
      border-color: #B5D4F4;
    }
  `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0.25rem 0 0;
`;

export const CardDivider = styled.hr`
  border: none;
  border-top: 0.5px solid ${({ theme }) => theme.colors.border};
  margin: 1rem 0;
`;
