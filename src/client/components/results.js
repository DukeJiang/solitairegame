/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ErrorMessage, InfoBlock, InfoData, InfoLabels } from './shared';

const Move = ({ move, index }) => {
  const duration = Date.now() - move.date;
  return (
    <tr>
      <th>{move.id ? move.id : index + 1}</th>
      <th>{duration} seconds</th>
      <th>
        <Link to={`/profile/${move.player}`}>{move.player}</Link>
      </th>
      <th>{move.move}</th>
    </tr>
  );
};

Move.propTypes = {
  move: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

const MovesListTable = styled.table`
  margin: 1em;
  width: 90%;
  min-height: 4em;
  border: 1px solid black;
  text-align: center;
  @media (max-width: 499px) {
    & > tbody > tr > td:nth-of-type(2),
    & > thead > tr > th:nth-of-type(2) {
      display: none;
    }
  }
`;

const MovesList = ({ moves }) => {
  let moveElements = moves.map((move, index) => (
    <Move key={index} move={move} index={index} />
  ));
  return (
    <MovesListTable>
      <thead>
        <tr>
          <th>Id</th>
          <th>Duration</th>
          <th>Player</th>
          <th>Move Details</th>
        </tr>
      </thead>
      <tbody>{moveElements}</tbody>
    </MovesListTable>
  );
};

const GameDetail = ({ start, moves, score, cards_remaining, active }) => {
  const duration = start ? (Date.now() - start) / 1000 : '--';
  return (
    <InfoBlock>
      <InfoLabels>
        <p>Duration:</p>
        <p>Number of Moves:</p>
        <p>Points:</p>
        <p>Cards Remaining:</p>
        <p>Able to Move:</p>
      </InfoLabels>
      <InfoData>
        <p>{duration} seconds</p>
        <p>{moves.length}</p>
        <p>{score}</p>
        <p>{cards_remaining}</p>
        <p>{active ? 'Active' : 'Complete'}</p>
      </InfoData>
    </InfoBlock>
  );
};

GameDetail.propTypes = {
  start: PropTypes.number.isRequired,
  moves: PropTypes.array.isRequired,
  score: PropTypes.number.isRequired,
  cards_remaining: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired
};

const ResultsBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Results = ({ match }) => {
  // Initialize the state
  let [game, setGame] = useState({
    start: 0,
    score: 0,
    cards_remaining: 0,
    active: true,
    moves: []
  });
  let [error, setError] = useState('');
  // Fetch data on load
  useEffect(() => {
    fetch(`/v1/game/${match.params.id}`)
      .then(res => res.json())
      .then(data => {
        setGame(data);
      })
      .catch(err => console.log(err));
  }, [match.params.id]);

  return (
    <ResultsBase>
      <ErrorMessage msg={error} hide={true} />
      <h4>Game Detail</h4>
      <GameDetail {...game} />
      <MovesList moves={game.moves} />
    </ResultsBase>
  );
};

Results.propTypes = {
  match: PropTypes.object.isRequired
};
