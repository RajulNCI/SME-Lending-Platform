import styled from 'styled-components';
import { bodySm, bodyXs } from '../../styles/mixins';

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* subtle scroll shadow on mobile */
  background:
    linear-gradient(to right, #fff 30%, rgba(255,255,255,0)),
    linear-gradient(to right, rgba(255,255,255,0), #fff 70%) 0 100%,
    radial-gradient(farthest-side at 0%, rgba(12,43,94,0.08), transparent),
    radial-gradient(farthest-side at 100%, rgba(12,43,94,0.08), transparent) 0 100%;
  background-repeat: no-repeat;
  background-size: 40px 100%, 40px 100%, 12px 100%, 12px 100%;
  background-position: 0 0, 100% 0, 0 0, 100% 0;
  background-attachment: local, local, scroll, scroll;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

export const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border};
`;

export const Th = styled.th`
  ${bodyXs}
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.625rem 1rem;
  text-align: left;
  white-space: nowrap;
`;

export const Tbody = styled.tbody``;

export const Tr = styled.tr`
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border};
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`;

export const Td = styled.td`
  ${bodySm}
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.875rem 1rem;
  vertical-align: middle;
`;

export const TdMuted = styled(Td)`
  color: ${({ theme }) => theme.colors.text.muted};
`;
