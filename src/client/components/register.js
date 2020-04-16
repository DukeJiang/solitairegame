/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ErrorMessage,
  FormBase,
  FormInput,
  FormLabel,
  FormButton,
  ModalNotify
} from './shared';
import { validPassword, validUsername } from '../../shared';

export const Register = ({ history }) => {
  let [state, setState] = useState({
    username: '',
    first_name: '',
    last_name: '',
    city: '',
    primary_email: '',
    password: ''
  });
  let [error, setError] = useState('');
  let [notify, setNotify] = useState('');

  useEffect(() => {
    document.getElementById('username').focus();
  }, []);

  const onChange = ev => {
    setError('');
    // Update from form and clear errors
    setState({
      ...state,
      [ev.target.name]: ev.target.value
    });
    // Make sure the username is valid
    if (ev.target.name === 'username') {
      let usernameInvalid = validUsername(ev.target.value);
      if (usernameInvalid) setError(`Error: ${usernameInvalid.error}`);
    }
    // Make sure password is valid
    else if (ev.target.name === 'password') {
      let pwdInvalid = validPassword(ev.target.value);
      if (pwdInvalid) setError(`Error: ${pwdInvalid.error}`);
    }
  };

  const onSubmit = async ev => {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (error !== '') return;
    const res = await fetch('/v1/user', {
      method: 'POST',
      body: JSON.stringify(state),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    });
    if (res.ok) {
      // Notify users
      setNotify(`${state.username} registered.  You will now need to log in.`);
    } else {
      const err = await res.json();
      setError(err.error);
    }
  };

  const onAcceptRegister = () => {
    history.push('/login');
  };

  return (
    <div style={{ gridArea: 'main' }}>
      {notify !== '' ? (
        <ModalNotify
          id="notification"
          msg={notify}
          onAccept={onAcceptRegister}
        />
      ) : null}
      <ErrorMessage msg={error} />
      <FormBase>
        <FormLabel htmlFor="username">Username:</FormLabel>
        <FormInput
          id="username"
          name="username"
          placeholder="Username"
          onChange={onChange}
          value={state.username}
        />

        <FormLabel htmlFor="first_name">First Name:</FormLabel>
        <FormInput
          id="first_name"
          name="first_name"
          placeholder="First Name"
          onChange={onChange}
          value={state.first_name}
        />

        <FormLabel htmlFor="last_name">Last Name:</FormLabel>
        <FormInput
          id="last_name"
          name="last_name"
          placeholder="Last Name"
          onChange={onChange}
          value={state.last_name}
        />

        <FormLabel htmlFor="city">City:</FormLabel>
        <FormInput
          id="city"
          name="city"
          placeholder="City"
          onChange={onChange}
          value={state.city}
        />

        <FormLabel htmlFor="primary_email">Email:</FormLabel>
        <FormInput
          id="primary_email"
          name="primary_email"
          type="email"
          placeholder="Email Address"
          onChange={onChange}
          value={state.primary_email}
        />
        <FormLabel htmlFor="password">Password:</FormLabel>
        <FormInput
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          onChange={onChange}
          value={state.password}
        />
        <div />
        <FormButton id="submitBtn" onClick={onSubmit}>
          Register
        </FormButton>
      </FormBase>
    </div>
  );
};

Register.propTypes = {
  history: PropTypes.object.isRequired
};
