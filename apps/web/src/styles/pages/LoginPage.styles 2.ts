import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px) }
  to { opacity: 1; transform: translateY(0) }
`;

export const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  @media(min-width: 768px) { grid-template-columns: 45% 1fr; }
  @media(min-width: 1100px) { grid-template-columns: 50% 1fr; }
`;

export const Brand = styled.aside`
  display: none;
  @media(min-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
    padding: 2.5rem;
    min-height: 100vh;
  }
`;

export const BrandTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const LogoMark = styled.div<{ $small?: boolean }>`
  width: ${({ $small }) => $small ? '32px' : '40px'};
  height: ${({ $small }) => $small ? '32px' : '40px'};
  background: ${({ theme }) => theme.colors.success[500] || '#1D9E75'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ $small }) => $small ? '0.875rem' : '1.125rem'};
  color: #fff;
  flex-shrink: 0;
`;

export const BrandName = styled.div``;

export const BrandTitle = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
`;

export const BrandSub = styled.div<{ $mobile?: boolean }>`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.success[500] || '#1D9E75'};
  letter-spacing: ${({ $mobile }) => $mobile ? '0.06em' : '0.08em'};
  font-weight: 600;
  text-transform: uppercase;
  ${({ $mobile }) => $mobile && `
    display: block;
    margin-top: 1px;
  `}
`;

export const BrandHero = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
`;

export const BrandHeadline = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 1rem;
`;

export const BrandDesc = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.primary[200] || '#85B7EB'};
  line-height: 1.75;
  max-width: 360px;
`;

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

export const Stat = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.primary[600] || '#1A56A0'};
  padding-top: 1rem;
`;

export const StatVal = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success[500] || '#1D9E75'};
`;

export const StatLabel = styled.div`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.primary[200] || '#85B7EB'};
  margin-top: 0.25rem;
`;

export const FormPanel = styled.main`
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 100vh;
`;

export const MobileNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  padding: 1rem 1.25rem;
  flex-shrink: 0;
  @media(min-width: 768px) { display: none; }
`;

export const MobileNavName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
`;

export const MobileNavSub = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.success[500] || '#1D9E75'};
  font-weight: 600;
  letter-spacing: 0.06em;
`;

export const FormScroll = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  overflow-y: auto;
  @media(min-width: 768px) { padding: 3rem; }
`;

export const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.35s ease both;
`;

export const FormTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.25rem;
`;

export const FormSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0 0 1.75rem;
`;

export const Field = styled.div`
  margin-bottom: 1.125rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary || '#2D3748'};
  margin-bottom: 0.375rem;
`;

export const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid ${({ $error, theme }) => $error ? (theme.colors.error[500] || '#E24B4A') : (theme.colors.border || '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary || '#2D3748'};
  background: #fff;
  -webkit-appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &::placeholder { color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[400] || '#378ADD'};
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.2);
  }
`;

export const ErrorMsg = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error[500] || '#E24B4A'};
  margin: 0.25rem 0 0;
`;

export const AlertBox = styled.div`
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.error[600] || '#C53030'};
  margin-bottom: 1.25rem;
`;

export const PwWrapper = styled.div`
  position: relative;
`;

export const PwToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  padding: 0.5rem;
  margin: -0.5rem;
  &:hover { color: ${({ theme }) => theme.colors.primary[500] || '#1A56A0'}; }
`;

export const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  color: #fff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s, transform 0.1s;
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  margin-top: 0.75rem;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primary[600] || '#1A56A0'}; }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

export const HintBox = styled.div`
  margin-top: 1.5rem;
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border: 1px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
  border-radius: 10px;
  padding: 1rem;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#4A5568'};
`;

export const HintTitle = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
`;

export const HintRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
  &:last-child { border: none; }
`;

export const HintUser = styled.span`
  color: ${({ theme }) => theme.colors.primary[500] || '#1A56A0'};
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
`;

export const HintRole = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  font-size: 0.75rem;
`;

export const HintFooter = styled.p`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'};
  margin: 0.5rem 0 0;
`;
