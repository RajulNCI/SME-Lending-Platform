import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.primary[800]};
    line-height: ${({ theme }) => theme.lineHeights.tight};
  }

  a {
    color: ${({ theme }) => theme.colors.text.link};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    &:hover { text-decoration: underline; }
  }

  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.body};
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
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

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.gray[100]}; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary[300]};
    border-radius: ${({ theme }) => theme.radii.full};
  }
`;

export default GlobalStyles;
