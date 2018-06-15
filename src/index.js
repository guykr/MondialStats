import React from 'react'
import ReactDOM from 'react-dom'
import { initTeams } from './models/team'
import { initGames } from './models/game'
import { initPlayers } from './models/player'
import AppContext from './context'
import BetsPage from './pages/bets'
import GamesPage from './pages/games'
import PlayersPage from './pages/players'
import { Icon, Layout, Menu } from 'antd'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'

import 'antd/dist/antd.css'
import './styles.css'

const { Sider, Content } = Layout

class App extends React.Component {
  _selectPlayer = selected_player => {
    selected_player !== this.state.selected_player
      ? this.setState({ selected_player })
      : this.setState({ selected_player: null })
  }


  state = {
    sidebar_collapsed: false,
    teams: initTeams(),
    games: initGames(),
    players: initPlayers(),
    selected_player: null,
    selected_game: null,

    selectPlayer: this._selectPlayer,
  }

  onCollapse = () => {
    this.setState(state => ({
      sidebar_collapsed: !state.sidebar_collapsed,
    }))
  }

  render() {
    return (
      <AppContext.Provider value={this.state}>
        <Router>
          <Layout className="app-layout">
            <Layout>
              <Sider
                style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}
                collapsible
                collapsed={this.state.sidebar_collapsed}
                onCollapse={this.onCollapse}>
                <div className="logo" />
                <Menu theme="dark" defaultSelectedKeys={[window.location.pathname]} mode="inline">
                  <Menu.Item key="/">
                    <Icon type="heart" />
                    <span>הימורים</span>
                    <Link to="/" />
                  </Menu.Item>
                  <Menu.Item key="/games">
                    <Icon type="notification" />
                    <span>משחקים</span>
                    <Link to="/games" />
                  </Menu.Item>
                  <Menu.Item key="/players" >
                    <Icon type="user" />
                    <span>מהמרים</span>
                    <Link to="/players" />
                  </Menu.Item>
                </Menu>
              </Sider>
              <Content style={{ marginLeft: this.state.sidebar_collapsed ? 80 : 200 }}>
                <Route exact path="/" component={BetsPage} />
                <Route path="/games" component={GamesPage} />
                <Route path="/players" component={PlayersPage} />
              </Content>
            </Layout>
          </Layout>
        </Router>
      </AppContext.Provider>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
