import styled, { css } from 'styled-components';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'navy';
type BadgeSize   = 'sm' | 'md';

interface BadgeProps {
  $variant?: BadgeVariant;
  $size?: BadgeSize;
  $dot?: boolean;
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  success: css` background: #E1F5EE; color: #0F6E56; `,
  warning: css` background: #FAEEDA; color: #854F0B; `,
  error:   css` background: #FCEBEB; color: #A32D2D; `,
  info:    css` background: #E6F1FB; color: #0C447C; `,
  neutral: css` background: #F1EFE8; color: #5F5E5A; `,
  navy:    css` background: #0C2B5E; color: #fff;    `,
};

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: ${({ $size }) => $size === 'sm' ? '0.6875rem' : '0.75rem'};
  font-weight: 500;
  padding: ${({ $size }) => $size === 'sm' ? '2px 7px' : '3px 10px'};
  border-radius: 999px;
  white-space: nowrap;
  ${({ $variant = 'neutral' }) => variantStyles[$variant]}

  ${({ $dot, $variant = 'neutral' }) => $dot && css`
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
  `}
`;

// Stage badge specifically for IFRS9
export const StageBadge = styled(Badge)<{ $stage: 1 | 2 | 3 }>`
  ${({ $stage }) =>
    $stage === 1 ? css` background:#E1F5EE; color:#0F6E56; ` :
    $stage === 2 ? css` background:#FAEEDA; color:#854F0B; ` :
                  css` background:#FCEBEB; color:#A32D2D; `}
`;
