/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Game = ({ username, game }) => {
  const date = new Date(game.start);
  const url = `/${game.active ? 'game' : 'staus'}/${game.id}`;
  return (
    <tr>
      <td>
        <Link to={url}>{game.active ? 'Active' : 'Complete'}</Link>
      </td>
      <td>{date.toLocaleString()}</td>
      <td>{game.moves}</td>
      <td>{game.score}</td>
      <td>{game.game}</td>
    </tr>
  );
};

Game.propTypes = {
  username: PropTypes.string.isRequired,
  game: PropTypes.object.isRequired
};

const GameHeaderBase = styled.div`
  display: flex;
  margin: 1em;
  & > a {
    margin-right: 1em;
  }
  & > h4 {
    margin: 0;
    flex-grow: 1;
  }
`;

const GameHeader = ({ count, username, toCreateGame }) => {
  return (
    <GameHeaderBase>
      <h4>
        Games ({count}
        ):
      </h4>
      {toCreateGame ? (
        <Link id="startLink" style={{ marginBottom: '1em' }} to="/start">
          Start new game
        </Link>
      ) : null}
    </GameHeaderBase>
  );
};

GameHeader.propTypes = {
  count: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  toCreateGame: PropTypes.bool.isRequired
};

/*************************************************************************/

const GameTable = styled.table`
  width: 100%;
  text-align: center;
  @media (max-width: 499px) {
    & > tbody > tr > td:nth-of-type(2),
    & > thead > tr > th:nth-of-type(2) {
      display: none;
    }
  }
`;

export const GameList = ({ games, username, toCreateGame }) => {
  // Build array of games
  let gameList = games.map((game, index) => (
    <Game key={index} username={username} game={game} />
  ));
  return (
    <Fragment>
      <GameHeader
        count={games.length}
        username={username}
        toCreateGame={toCreateGame}
      />
      <GameTable>
        <thead>
          <tr>
            <th>Status</th>
            <th>Start Date</th>
            <th># of Moves</th>
            <th>Score</th>
            <th>Game Type</th>
          </tr>
        </thead>
        <tbody>{gameList}</tbody>
      </GameTable>
    </Fragment>
  );
};

GameList.propTypes = {
  games: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  toCreateGame: PropTypes.bool.isRequired
};
