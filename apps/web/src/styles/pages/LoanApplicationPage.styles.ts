import styled, { keyframes } from 'styled-components';

export const spin = keyframes`to{transform:rotate(360deg)}`;
export const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

export const PageWrap = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const Field = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary || '#2d3748'};
  margin-bottom: 0.375rem;
`;

export const Req = styled.span`
  color: ${({ theme }) => theme.colors.error[500] || '#e24b4a'};
  margin-left: 2px;
`;

export const Input = styled.input<{ $error?: boolean; $prefilled?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 1rem;
  -webkit-appearance: none;
  border: 1.5px solid ${({ $error, $prefilled, theme }) => 
    $error ? (theme.colors.error[500] || '#E24B4A') : 
    $prefilled ? (theme.colors.success[500] || '#1D9E75') : 
    (theme.colors.border || '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary || '#2d3748'};
  background: ${({ $prefilled, theme }) => 
    $prefilled ? (theme.colors.success[50] || '#F0FDF9') : '#fff'};
  font-family: 'IBM Plex Sans', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted || '#a0aec0'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400] || '#378add'};
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;

export const Select = styled.select<{ $error?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 2.5rem 0 1rem;
  -webkit-appearance: none;
  appearance: none;
  border: 1.5px solid ${({ $error, theme }) => 
    $error ? (theme.colors.error[500] || '#E24B4A') : (theme.colors.border || '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary || '#2d3748'};
  background: #fff;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23718096' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  font-family: 'IBM Plex Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400] || '#378add'};
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary || '#2d3748'};
  font-family: 'IBM Plex Sans', sans-serif;
  resize: vertical;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted || '#a0aec0'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400] || '#378add'};
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;

export const ErrMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error[500] || '#e24b4a'};
  margin-top: 0.25rem;
`;

export const Hint = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin-top: 0.25rem;
`;

export const CurrWrap = styled.div`
  position: relative;
`;

export const CurrSym = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.muted || '#4a5568'};
  font-weight: 500;
  pointer-events: none;
`;

export const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
`;

export const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.875rem;
`;

export const StepRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const StepPill = styled.span<{ $s: 'done' | 'active' | 'todo' }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ $s, theme }) => 
    $s === 'done' ? (theme.colors.success[50] || '#E1F5EE') : 
    $s === 'active' ? (theme.colors.primary[800] || '#0C2B5E') : 
    (theme.colors.gray[50] || '#F7FAFC')};
  color: ${({ $s, theme }) => 
    $s === 'done' ? (theme.colors.success[600] || '#0F6E56') : 
    $s === 'active' ? '#fff' : 
    (theme.colors.text.muted || '#718096')};
  border: 0.5px solid ${({ $s, theme }) => 
    $s === 'done' ? (theme.colors.success[300] || '#6EE7B7') : 
    $s === 'active' ? (theme.colors.primary[800] || '#0C2B5E') : 
    (theme.colors.border || '#E2E8F0')};
`;

export const UploadZone = styled.div<{ $drag: boolean; $done: boolean; $err: boolean }>`
  border: 2px dashed ${({ $done, $err, $drag, theme }) =>
    $err ? (theme.colors.error[500] || '#E24B4A') : 
    $done ? (theme.colors.success[500] || '#1D9E75') : 
    $drag ? (theme.colors.primary[400] || '#378ADD') : 
    (theme.colors.gray[300] || '#CBD5E0')};
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $done, $drag, theme }) => 
    $done ? (theme.colors.success[50] || '#F0FDF9') : 
    $drag ? (theme.colors.primary[50] || '#EBF4FF') : 
    (theme.colors.gray[50] || '#FAFBFC')};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400] || '#378add'};
    background: ${({ theme }) => theme.colors.primary[50] || '#ebf4ff'};
  }
`;

export const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
  border-top-color: ${({ theme }) => theme.colors.primary[800] || '#0c2b5e'};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 0.75rem;
`;

export const PrefilledNote = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: ${({ theme }) => theme.colors.success[50] || '#e1f5ee'};
  color: ${({ theme }) => theme.colors.success[600] || '#0f6e56'};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

export const ConsentCard = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.15s;
  background: ${({ $checked, theme }) => 
    $checked ? (theme.colors.success[50] || '#F0FDF9') : 
    (theme.colors.gray[50] || '#FAFBFC')};
  border: 1.5px solid ${({ $checked, theme }) => 
    $checked ? (theme.colors.success[500] || '#1D9E75') : 
    (theme.colors.border || '#E2E8F0')};
`;

export const CheckBox = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.15s;
  border: 2px solid ${({ $checked, theme }) => 
    $checked ? (theme.colors.success[500] || '#1D9E75') : 
    (theme.colors.gray[300] || '#CBD5E0')};
  background: ${({ $checked, theme }) => 
    $checked ? (theme.colors.success[500] || '#1D9E75') : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success[100] || '#D1FAE5'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 1.25rem;
`;

export const SuccessTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 1.375rem;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.5rem;
`;

export const SuccessText = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0 0 1.25rem;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
`;

export const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.primary[50] || '#F0F7FF'};
  border: 1px solid ${({ theme }) => theme.colors.primary[200] || '#B5D4F4'};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.primary[500] || '#1A56A0'};
`;

export const WarningBox = styled.div`
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: #92400E;
  margin: 0.75rem 0 1.25rem;
`;

export const ErrorBox = styled.div`
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #C53030;
  margin: 0.75rem 0;
`;
