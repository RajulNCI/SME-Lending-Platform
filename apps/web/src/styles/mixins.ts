import { css } from 'styled-components';

// ── Layout helpers ────────────────────────────────────────────────────────────
export const flexRow = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// ── Typography helpers ────────────────────────────────────────────────────────
export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const headingLg = css`
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
`;

export const headingMd = css`
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
`;

export const bodySm = css`
  font-size: 0.875rem;
  line-height: 1.5;
`;

export const bodyXs = css`
  font-size: 0.75rem;
  line-height: 1.5;
`;

// ── Surface helpers ───────────────────────────────────────────────────────────
export const cardBase = css`
  background: #ffffff;
  border-radius: 12px;
  border: 0.5px solid #E2E8F0;
`;

export const focusRing = css`
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.35);
    border-radius: 6px;
  }
`;

// ── Responsive helpers ────────────────────────────────────────────────────────
export const onMobile = (styles: string) => css`
  @media (max-width: 767px) { ${styles} }
`;

export const onTablet = (styles: string) => css`
  @media (min-width: 768px) { ${styles} }
`;

export const onDesktop = (styles: string) => css`
  @media (min-width: 1024px) { ${styles} }
`;
