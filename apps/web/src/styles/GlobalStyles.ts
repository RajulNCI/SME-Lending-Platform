import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* prevent font scaling on orientation change on iOS */
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    min-height: 100vh;
    min-height: -webkit-fill-available;
    overflow-x: hidden;
  }

  html { height: -webkit-fill-available; }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.primary[800]};
    line-height: ${({ theme }) => theme.lineHeights.tight};
  }

  a {
    color: ${({ theme }) => theme.colors.text.link};
    text-decoration: none;
    /* larger tap target on mobile */
    &:hover { text-decoration: underline; }
  }

  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.body};
    border: none;
    background: none;
    /* remove tap highlight on mobile */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    /* prevents iOS zoom on focus when font-size < 16px */
    font-size: max(16px, ${({ theme }) => theme.fontSizes.md});
    border-radius: 0;
    -webkit-appearance: none;
  }

  img, svg { display: block; max-width: 100%; }
  ul, ol { list-style: none; }

  :focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focus};
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primary[200]};
    color: ${({ theme }) => theme.colors.primary[800]};
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary[300]};
    border-radius: ${({ theme }) => theme.radii.full};
  }
`;

export default GlobalStyles;
