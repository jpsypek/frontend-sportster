import React, {Component} from 'react'
import './App.css'
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import UserLogin from './Components/UserLogin/UserLogin'
import NewUserForm from './Components/NewUserForm/NewUserForm'
import HomePage from './Components/HomePage/HomePage'
import PickUpContainer from './Components/PickUpContainer/PickUpContainer'

class App extends Component {
  constructor() {
    super()
    this.state = {
      loggedIn: false,
      showLogIn: false,
      showNewUserForm: false,
      userId: ""
    }
  }

  componentDidMount = () => {
    if (localStorage.getItem('pickUpLogin')) {
      this.logIn(localStorage.getItem('pickUpUser'))
    }
  }

  logIn = (userId, token) => {
    localStorage.setItem('pickUpUser', userId)
    localStorage.setItem('pickUpLogin', token)
    this.setState({userId, showLogIn: false, loggedIn: true})
  }

  logOut = () => {
    localStorage.clear()
    window.location.href = "http://localhost:3001/"
    this.setState({loggedIn: false, userId: "", showLogIn: false})
  }

  toggleShowLogIn = () => {
    this.setState({
      showLogIn: !this.state.showLogIn
    })
  }

  toggleShowNewUserForm = () => {
    this.setState({
      showNewUserForm: !this.state.showNewUserForm
    })
  }

  render() {
    const {loggedIn, showLogIn, showNewUserForm} = this.state

    return (
      <div>
        <header>
          <h1 className="app-name">Pick Up Sports!</h1>
          { loggedIn
            ? <button className="button log-out user-credentials" onClick={this.logOut}>Log Out</button>
            : <div className="user-credentials">
                <button onClick={this.toggleShowLogIn}>Log In</button>
                <button onClick={this.toggleShowNewUserForm} className="create-act button">Create Account</button>
                <NewUserForm showNewUserForm={showNewUserForm} toggleShowNewUserForm={this.toggleShowNewUserForm} handleLogIn={this.handleLogIn}/>
              </div>}
          { showLogIn ? <UserLogin logIn={this.logIn}/> : null}
        </header>
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <NavLink exact={true} to="/">Home</NavLink>
                </li>
                <li>
                  <NavLink exact={true} to="/pickups">Pick Up Games</NavLink>
                </li>
              </ul>
            </nav>
            <div className="containers">
              <Route exact={true} path="/" component={() => <HomePage loggedIn={loggedIn}/>} />
              <Route path="/pickups" component={() => <PickUpContainer loggedIn={loggedIn}/>} />
            </div>
          </div>
        </Router>
    </div>
  )
}
}

export default App
