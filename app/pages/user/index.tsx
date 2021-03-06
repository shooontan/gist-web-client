import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from '~/reducers';
import GistItem from '~/components/molecules/GistItem';
import { fetchUserGistsAction, fetchGistsAction } from '~/actions/gistsAction';
import {
  GistGetResponseFiles,
  GistGetResponseForks,
  GistGetResponseHistory,
} from '~/libs/octokit';
import TemplateBase from '~/components/templates/TemplateBase';
import PageHeader from '~/components/organisms/PageHeader';
import PageMain from '~/components/organisms/PageMain';
import PageFooter from '~/components/organisms/PageFooter';
import ButtonLink from '~/components/atoms/ButtonLink';
import GistItemLoading from '~/components/molecules/GistItemLoading';
import getQuery from '~/helpers/getQuery';

type Dispatch = ThunkDispatch<any, any, any>;

interface Props {
  isServer: boolean;
  auth: RootState['auth'];
  files: GistGetResponseFiles;
  forks: GistGetResponseForks;
  error: Error | null;
  history: GistGetResponseHistory;
  gists: RootState['gists'];
  dispatch: Dispatch;
}

class UserPage extends React.PureComponent<Props> {
  static async getInitialProps(Context) {
    const { req, query, store } = Context;
    const {
      dispatch,
      getState,
    }: { dispatch: Dispatch; getState: () => RootState } = store;
    const { name }: { name: string } = query;
    const { auth } = getState();
    const { login, userName } = auth;

    if (req) {
      return {
        isServer: true,
      };
    }

    if (login && name === userName) {
      // own page. display private gists
      await dispatch(fetchGistsAction());
    } else {
      // other user page. display public gists
      await dispatch(fetchUserGistsAction(name));
    }

    return {
      isServer: false,
    };
  }

  componentDidMount() {
    const { isServer, auth, dispatch } = this.props;
    const { login, userName } = auth;
    const { name } = getQuery();

    if (!isServer) {
      return;
    }

    if (login && name === userName) {
      return dispatch(fetchGistsAction());
    }

    if (typeof name === 'string') {
      return dispatch(fetchUserGistsAction(name));
    }
  }

  getHeader = () => {
    const { auth, gists } = this.props;
    const { timeline } = gists;

    // no gist data
    const firstGistId = timeline[0];
    if (!firstGistId) {
      return (
        <PageHeader
          breadcrumb={[
            {
              item: '',
              href: `/user`,
            },
          ]}
          auth={auth}
        />
      );
    }

    const gist = gists.gists[firstGistId];
    const {
      owner: { login },
    } = gist;

    const breadcrumb = [
      {
        item: login,
        href: `/user?name=${login}`,
      },
    ];

    return <PageHeader breadcrumb={breadcrumb} auth={auth} />;
  };

  getMain = () => {
    const { gists, auth } = this.props;
    const { timeline, loading } = gists;
    const firstGistId = timeline[0];
    if (!firstGistId) {
      return <PageMain title="" />;
    }
    const gist = gists.gists[firstGistId];
    const {
      owner: { login },
    } = gist;

    let GistItems = null;

    if (loading) {
      GistItems = <GistItemLoading items={6} />;
    } else {
      GistItems = this.props.gists.timeline.map(gistId => {
        const gistItem = this.props.gists.gists[gistId];
        return <GistItem gist={gistItem} key={gistId} />;
      });
    }

    // add button with own user page
    let buttons = null;
    if (auth && auth.userName === login) {
      buttons = (
        <ButtonLink
          href={{
            pathname: '/gists/add',
          }}
        >
          Add
        </ButtonLink>
      );
    }

    return (
      <PageMain title={login} topButtons={buttons}>
        {GistItems}
      </PageMain>
    );
  };

  render() {
    return (
      <TemplateBase
        header={this.getHeader()}
        main={this.getMain()}
        footer={<PageFooter />}
      />
    );
  }
}

export default connect((state: RootState) => ({
  auth: state.auth,
  gists: state.gists,
}))(UserPage);
