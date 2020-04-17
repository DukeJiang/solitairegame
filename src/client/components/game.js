/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Pile} from './pile';
import styled from 'styled-components';
import {ErrorMessage, ModalNotify} from './shared'

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

export const Game = ({ match }) => {
  let [state, setState] = useState({
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: []
  });
  let [target, setTarget] = useState({card: '', pile: '', cards: []});
  let [errorMsg, setErrorMsg] = useState('');
  let [winMsg, setWinMsg] = useState('');

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${match.params.id}`);
      const data = await response.json();
      if (data.stack1.length === 13 &&
          data.stack2.length === 13 &&
          data.stack3.length === 13 &&
          data.stack4.length === 13 ){
          setWinMsg(`You win`);
          }
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard
      });  
    };
    getGameState();
  }, [match.params.id, target, errorMsg]);


  const onClick = async (ev, stack) => {
    ev.stopPropagation();
    if(state[stack].length === 0){
      console.log('empty stack clicked');
      console.log('id is: ', stack);
      if(stack === 'draw'){
        if(target.card === "" && target.pile === "" && target.cards.length === 0){
          const data = {
            card: 'deck',
            src: 'discard',
            dst: 'draw'
          };
          let body = await sendRequest(data);
          if(body.error){
            setErrorMsg(body.error);
          }
      }
      }
      else if(target.card === "" && target.pile === "" && target.cards.length === 0){
        return;
      } else{
        const data = {
          card: target.card,
          src: target.pile,
          dst: stack
        };
        console.log(data);
        console.log('move request');

        let body = await sendRequest(data);

        if (body.error){
          setErrorMsg(body.error);
        }

      }
      setTarget({
        card:'',
        pile: '',
        cards: []});
    } else{
      if(target.card === "" && target.pile === "" && target.cards.length === 0){
        setTarget({
          card: ev.target.id,
          pile: stack,
          cards: state[stack]
        });
      } else{
        const data = {
          card: target.card,
          src: target.pile,
          dst: stack
        };
        console.log(data);
        //send request to server
        let resBody = await sendRequest(data);
        if(resBody.error){
          setErrorMsg(resBody.error);
        }

        setTarget({
          card:'',
          pile: '',
          cards: []});
      }

    if(stack === 'draw'){
      if( target.cards.length === 0 && target.card === "" && target.pile === ""){
      const data = {
        card: ev.target.id,
        src: 'draw',
        dst: 'discard'
      };
      let body = await sendRequest(data);
      if (body.error){
        setErrorMsg(body.error);
      }
    } else{
        setErrorMsg('invalid move');
    }
    setTarget({
      card:'',
      pile: '',
      cards: []});
  }

  }
  };

  const sendRequest = async (data) => {
    let response = await fetch( `/v1/game/${match.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  };

  const initialize = ev => {
    setTarget({card: '', pile: '', cards: []});
  };

  const resultRequest = () => {
    history.push(`/result${match.params.id}`);
  };

  return (
    <GameBase onClick = {initialize}>
      {errorMsg !== ''?
      <ErrorMessage msg = {setErrorMsg}/> : null
      }
      {winMsg !== '' ? (
          <ModalNotify
              id="notification"
              msg={"YOU WIN!!!"}
              onAccept={resultRequest}
          />
      ) : null}
      

      <div>
        <span><b> ---------------♥️️------------------------------ ♦️----------------------------- ♣️ ️------------------------------ ♠️️️ -------------️</b></span>
      </div>
      <CardRow>
        <Pile cards={state.stack1} spacing={0} onClick={ev=> onClick(ev, 'stack1')} />
        <Pile cards={state.stack2} spacing={0} onClick={ev=> onClick(ev, 'stack2')} />
        <Pile cards={state.stack3} spacing={0} onClick={ev=> onClick(ev, 'stack3')} />
        <Pile cards={state.stack4} spacing={0} onClick={ev=> onClick(ev, 'stack4')} />
        <CardRowGap />
        <Pile cards={state.draw} spacing={0} onClick={ev=> onClick(ev, 'draw')} />
        <Pile cards={state.discard} spacing={0} onClick={ev=> onClick(ev, 'discard')} />
      </CardRow>
      <CardRow>
        <Pile cards={state.pile1} onClick={ev=> onClick(ev, 'pile1')} />
        <Pile cards={state.pile2} onClick={ev=> onClick(ev, 'pile2')} />
        <Pile cards={state.pile3} onClick={ev=> onClick(ev, 'pile3')} />
        <Pile cards={state.pile4} onClick={ev=> onClick(ev, 'pile4')} />
        <Pile cards={state.pile5} onClick={ev=> onClick(ev, 'pile5')} />
        <Pile cards={state.pile6} onClick={ev=> onClick(ev, 'pile6')} />
        <Pile cards={state.pile7} onClick={ev=> onClick(ev, 'pile7')} />
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {
  match: PropTypes.object.isRequired
};
