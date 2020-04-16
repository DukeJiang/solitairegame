/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import { Header } from './components/header';
import { Landing } from './components/landing';
import { Login } from './components/login';
import { Logout } from './components/logout';
import { Register } from './components/register';
import { Profile } from './components/profile';
import { Start } from './components/start';
import { Results } from './components/results';
import { Game } from './components/game';

const defaultUser = {
  username: '',
  first_name: '',
  last_name: '',
  primary_email: '',
  city: '',
  games: []
};

const GridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'hd'
    'main'
    'ft';

  @media (min-width: 500px) {
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'hd hd hd hd hd'
      'sb sb main main main'
      'ft ft ft ft ft';
  }
`;

const MyApp = () => {
  // If the user has logged in, grab info from sessionStorage
  const data = localStorage.getItem('user');
  let [state, setState] = useState(data ? JSON.parse(data) : defaultUser);
  console.log(`Starting as user: ${state.username}`);

  const loggedIn = () => {
    return state.username && state.primary_email;
  };

  const logIn = async username => {
    try {
      const response = await fetch(`/v1/user/${username}`);
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      setState(user);
    } catch (err) {
      alert('An unexpected error occurred.');
      logOut();
    }
  };

  const logOut = () => {
    // Wipe localStorage
    localStorage.removeItem('user');
    // Reset user state
    setState(defaultUser);
  };

  return (
    <BrowserRouter>
      <GridBase>
        <Header user={state.username} email={state.primary_email} />
        <Route exact path="/" component={Landing} />
        <Route
          path="/login"
          render={p =>
            loggedIn() ? (
              <Redirect to={`/profile/${state.username}`} />
            ) : (
              <Login {...p} logIn={logIn} />
            )
          }
        />
        <Route path="/logout" render={p => <Logout {...p} logOut={logOut} />} />
        <Route
          path="/register"
          render={p => {
            return loggedIn() ? (
              <Redirect to={`/profile/${state.username}`} />
            ) : (
              <Register {...p} />
            );
          }}
        />
        <Route
          path="/profile/:username"
          render={p => <Profile {...p} currentUser={state.username} />}
        />
        <Route
          path="/start"
          render={p => {
            return loggedIn() ? <Start {...p} /> : <Redirect to={'/login'} />;
          }}
        />
        <Route path="/game/:id" render={p => <Game {...p} user={p.user} />} />
        <Route
          path="/results/:id"
          render={p => <Results {...p} user={p.user} />}
        />
      </GridBase>
    </BrowserRouter>
  );
};

render(<MyApp />, document.getElementById('mainDiv'));
