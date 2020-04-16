/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ErrorMessage, FormButton } from './shared';

const gameNames = [
  'klondike',
  'pyramid',
  'canfield',
  'golf',
  'yukon',
  'hearts'
];

const GameTypesBase = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1em;
`;

const GameTypes = ({ game, onChange }) => {
  const games = gameNames.map((g, i) => (
    <GameChoice key={i} game={g} selected={game === g} onChange={onChange} />
  ));
  return <GameTypesBase>{games}</GameTypesBase>;
};

const GameLabel = styled.label``;

const GameTypeInput = styled.input``;

const GameChoice = ({ game, selected, onChange }) => {
  return (
    <GameLabel>
      <GameTypeInput
        type="radio"
        name="game"
        value={game}
        checked={selected}
        onChange={onChange}
      />
      {game}
    </GameLabel>
  );
};

GameChoice.propTypes = {
  game: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

const StartBase = styled.div`
  grid-area: main;
  margin: 1em;
`;

const StartForm = styled.form`
  display: flex;
  margin: 1em;
`;

const StartOptions = styled.div`
  display: flex;
  flex-flow: column;
  & > div {
    margin-bottom: 1em;
  }
  & > div > label {
    margin-right: 0.5em;
  }
`;

export const Start = ({ history }) => {
  let [state, setState] = useState({
    game: 'klondike',
    draw: 'Draw 1',
    color: 'Red'
  });
  let [error, setError] = useState('');

  const onSubmit = async ev => {
    ev.preventDefault();
    const response = await fetch('/v1/game', {
      body: JSON.stringify({
        game: state.game,
        draw: state.draw,
        color: state.color
      }),
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.ok) {
      history.push(`/game/${data.id}`);
    } else {
      setError(`Error: ${data.error}`);
    }
  };

  const onChange = ev =>
    setState({
      ...state,
      [ev.target.name]: ev.target.value
    });

  return (
    <StartBase>
      <ErrorMessage msg={error} />
      <h4>Create New Game</h4>
      <StartForm>
        <GameTypes game={state.game} onChange={onChange} />
        <StartOptions>
          <div>
            <label htmlFor="draw">Draw:</label>
            <select
              id="draw"
              name="draw"
              disabled={'hearts' === state.game}
              onChange={onChange}
            >
              <option>Draw 1</option>
              <option>Draw 3</option>
            </select>
          </div>
          <div>
            <label htmlFor="color">Card Color:</label>
            <select id="color" name="color" onChange={onChange}>
              <option>Red</option>
              <option>Green</option>
              <option>Blue</option>
              <option>Magical</option>
            </select>
          </div>
        </StartOptions>
      </StartForm>
      <FormButton id="startBtn" onClick={onSubmit}>
        Start
      </FormButton>
    </StartBase>
  );
};

Start.propTypes = {
  history: PropTypes.object.isRequired
};
