import styled from 'styled-components';

export const HeaderBadges = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border-radius: 10px;
  padding: 0.875rem 1rem;
  border: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
`;

export const StatLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem;
`;

export const StatValue = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0;
`;

export const ComplianceBox = styled.div`
  background: ${({ theme }) => theme.colors.primary[50] || '#F0F7FF'};
  border: 1px solid ${({ theme }) => theme.colors.primary[200] || '#B5D4F4'};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

export const ComplianceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const ComplianceTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.25rem;
`;

export const ComplianceText = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#4A5568'};
  margin: 0;
  line-height: 1.5;
`;

export const ErrorBox = styled.div`
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #C53030;
  margin-bottom: 1rem;
`;

export const LoadingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  padding: 2rem 0;
  font-size: 0.9375rem;
`;

export const SearchRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

export const SearchInput = styled.input`
  flex: 1;
  height: 44px;
  padding: 0 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'IBM Plex Mono', monospace;
  &::placeholder {
    color: #a0aec0;
    font-family: 'IBM Plex Sans', sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.15);
  }
`;

export const AuditRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.gray[100] || '#f0f0f0'};
  cursor: pointer;
  &:last-child {
    border: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.gray[50] || '#fafbfc'};
    margin: 0 -0.75rem;
    padding: 0.875rem 0.75rem;
    border-radius: 8px;
  }
`;

export const AuditDate = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  font-family: 'IBM Plex Mono', monospace;
  min-width: 85px;
  margin-top: 2px;
  flex-shrink: 0;
`;

export const AuditEventTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[500] || '#1A56A0'};
  margin: 0 0 0.25rem;
`;

export const AuditEventMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
`;

export const AuditChevron = styled.span`
  font-size: 0.75rem;
  color: #a0aec0;
  flex-shrink: 0;
`;

export const EvidenceBox = styled.div`
  background: ${({ theme }) => theme.colors.gray[50] || '#f7fafc'};
  border: 1px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
  border-radius: 10px;
  padding: 1.125rem;
  margin-top: 0.5rem;
`;

export const EvidenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

export const EvidenceTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0;
`;

export const EvidenceActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const EvidenceRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
  font-size: 0.8125rem;
`;

export const EvidenceKey = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;

export const EvidenceValue = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary || '#2D3748'};
  font-family: 'IBM Plex Mono', monospace;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
`;

export const ReportLoadingText = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0.75rem 0 0;
`;

export const ReportBox = styled.div`
  margin-top: 0.75rem;
  background: ${({ theme }) => theme.colors.primary[50] || '#F0F7FF'};
  border-radius: 8px;
  padding: 0.875rem;
`;

export const ReportTitle = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.5rem;
`;

export const ReportPre = styled.pre`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.text.muted || '#4A5568'};
  overflow: auto;
  margin: 0;
  white-space: pre-wrap;
`;
