import styled, { css } from 'styled-components';
import { focusRing } from '../../styles/mixins';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
  $loading?: boolean;
}

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css` height: 34px; padding: 0 0.875rem; font-size: 0.8125rem; `,
  md: css` height: 42px; padding: 0 1.25rem;  font-size: 0.9375rem; `,
  lg: css` height: 52px; padding: 0 1.75rem;  font-size: 1rem;      `,
};

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: #0C2B5E;
    color: #fff;
    border: 1.5px solid #0C2B5E;
    &:hover:not(:disabled) { background: #1A56A0; border-color: #1A56A0; }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
  secondary: css`
    background: #fff;
    color: #0C2B5E;
    border: 1.5px solid #E2E8F0;
    &:hover:not(:disabled) { background: #F0F7FF; border-color: #B5D4F4; }
  `,
  ghost: css`
    background: transparent;
    color: #0C2B5E;
    border: 1.5px solid transparent;
    &:hover:not(:disabled) { background: #F0F7FF; }
  `,
  danger: css`
    background: #fff;
    color: #A32D2D;
    border: 1.5px solid #F09595;
    &:hover:not(:disabled) { background: #FCEBEB; }
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  ${({ $size = 'md' }) => sizeStyles[$size]}
  ${({ $variant = 'primary' }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && css` width: 100%; `}
  ${({ $loading }) => $loading && css`
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${focusRing}
`;

export const IconButton = styled(Button)`
  padding: 0;
  width: ${({ $size }) =>
    $size === 'sm' ? '34px' :
    $size === 'lg' ? '52px' : '42px'};
  border-radius: 8px;
`;
