import * as React from 'react';
import styled from 'styled-components';
import { Headline2 } from '~/components/atoms/Headline';

interface Props {
  maxWidth: number;
  title: string;
  topButtons?: JSX.Element;
}

export default class PageMain extends React.PureComponent<Props> {
  static defaultProps = {
    maxWidth: 1000,
  };

  render() {
    const { children, title, topButtons } = this.props;
    return (
      <Wrapper data-maxwidth={this.props.maxWidth}>
        <Header>
          <Headline>{title}</Headline>
          {topButtons && topButtons}
        </Header>
        {children}
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  margin: 60px auto 0;
  width: 100%;
  max-width: ${props => `${props['data-maxwidth']}px`};
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
`;

const Headline = styled(Headline2)`
  display: flex;
  flex: 1;
  margin: 0;
  padding: 0;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  margin: 18px 24px 0 24px;
  padding: 0 0 0.5em;
  border-bottom: 1px solid #ccc;
`;
