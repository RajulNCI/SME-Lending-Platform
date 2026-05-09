import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Shell = styled.div`display:flex;min-height:100vh;background:#F5F7FA;`;
const Main = styled.div`flex:1;display:flex;flex-direction:column;min-width:0;overflow-x:hidden;`;
const Content = styled.main`
  flex:1;padding:1.5rem;
  @media(min-width:768px){padding:1.75rem 2rem;}
  @media(min-width:1024px){padding:2rem 2.5rem;}
`;

interface PageLayoutProps {
  title: string;
  notifCount?: number;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, notifCount, actions, children }) => (
  <Shell>
    <Sidebar />
    <Main>
      <TopBar title={title} notifCount={notifCount} actions={actions} />
      <Content>{children}</Content>
    </Main>
  </Shell>
);

export default PageLayout;
