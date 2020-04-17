/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';
//how to revert state when clicking on non-card elements?
//how to select empty stack?
//how to update server side?
//how to select multiple cards?
//game model confusion.
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
  let [errmsg, setMsg] = useState('');
  let [winmsg, setWin] = useState('');

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${match.params.id}`);
      const data = await response.json();
      if (data.stack1.length === 13 &&
          data.stack2.length === 13 &&
          data.stack3.length === 13 &&
          data.stack4.length === 13 ){
            setWin(`You win`);
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
    //console.log(target, startDrag);
  }, [match.params.id, target, errmsg]);


  const sendData = async (data) => {
    let response = await fetch( `/v1/game/${match.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
    });
    return await response.json();
  };

  const onClick = async (ev, stack) => {
    ev.stopPropagation();
    //clicked on empty elements
    if(state[stack].length === 0){
      console.log('empty stack clicked');
      console.log('id is: ', stack);
      if(stack === 'draw'){
        if(target.card === "" && target.pile === "" && target.cards.length === 0){
          //send request to shuffle all cards back to draw deck
          const data = {
            card: 'all:cards',
            src: 'discard',
            dst: 'draw'
          };
          let resBody = await sendData(data);
          if(resBody.error){
            setMsg(resBody.error);
          }else{
            setMsg('');
          }
      }
      }
      //do nothing if nothing is selected
      else if(target.card === "" && target.pile === "" && target.cards.length === 0){
        setMsg('');
        return;
      } else{
        const data = {
          card: target.card,
          src: target.pile,
          dst: stack
        };
        console.log(data);
        console.log('move request');

        let resBody = await sendData(data);

        if (resBody.error){
          setMsg(resBody.error);
        }

      }
      setTarget({
        card:'',
        pile: '',
        cards: []});
    
    } else{
    //special case if stack is "draw", set target immediately to empty and send put request, from draw to discard.
    //let target = ev.target;
    if(stack === 'draw'){
      if(target.card === "" && target.pile === "" && target.cards.length === 0){
      console.log('move cards from draw to discard');
      const data = {
        card: ev.target.id,
        src: 'draw',
        dst: 'discard'
      };
      let resBody = await sendData(data);

      if (resBody.error){
          setMsg(resBody.error);
      } else{
        setMsg('');
      }

    }

    else{
      console.log('Cannot move to draw!');
      setMsg('cannot move to draw!');
    }
    setTarget({
      card:'',
      pile: '',
      cards: []});
  }



    else if(target.card === "" && target.pile === "" && target.cards.length === 0){
      console.log('selecting');
      setTarget({
        card: ev.target.id,
        pile: stack,
        cards: state[stack]
      });
      setMsg('');
    } else{
      const data = {
        card: target.card,
        src: target.pile,
        dst: stack
      };
      console.log(data);
      console.log('moving cards');
      //send PUT request
      let resBody = await sendData(data);
      if(resBody.error){
          setMsg(resBody.error);
      } else{
        
            setMsg('');
      }
        
      setTarget({
        card:'',
        pile: '',
        cards: []});
    }
  }
    //console.log('click on', ev.target.id);
  };
  //write another function onclick
  const onClick2 = ev => {
    console.log("gamebase clicked. State initialized");
    setTarget({card: '', pile: '', cards: []});
    setMsg('');
  };

  const onAcceptResult = () => {
    history.push(`/result${match.params.id}`);
  };

  return (
    <GameBase onClick = {onClick2}>
      {errmsg !== ''?
      <ErrorMessage msg = {errmsg}/> :
      null
      }

    {winmsg !== '' ? (
        <ModalNotify
          id="notification"
          msg={winmsg}
          onAccept={onAcceptResult}
        />
      ) : null}
      

      <div>
        <span><b> ❤️                                                                      💎
                  ♦️                                                                      ♣️</b></span>
      </div>
      <CardRow>
        <Pile cards={state.stack1} spacing={0} onClick={ev=> onClick(ev, 'stack1')} id = 'stack1'/>
        <Pile cards={state.stack2} spacing={0} onClick={ev=> onClick(ev, 'stack2')} id = 'stack2'/>
        <Pile cards={state.stack3} spacing={0} onClick={ev=> onClick(ev, 'stack3')} id = 'stack3' />
        <Pile cards={state.stack4} spacing={0} onClick={ev=> onClick(ev, 'stack4')} id = 'stack4' />
        <CardRowGap />
        <Pile cards={state.draw} spacing={0} onClick={ev=> onClick(ev, 'draw')} id = 'draw'/>
        <Pile cards={state.discard} spacing={0} onClick={ev=> onClick(ev, 'discard')} id = 'discard'/>
      </CardRow>
      <CardRow>
        <Pile cards={state.pile1} onClick={ev=> onClick(ev, 'pile1')} id = 'pile1'/>
        <Pile cards={state.pile2} onClick={ev=> onClick(ev, 'pile2')} id = 'pile2'/>
        <Pile cards={state.pile3} onClick={ev=> onClick(ev, 'pile3')} id = 'pile3'/>
        <Pile cards={state.pile4} onClick={ev=> onClick(ev, 'pile4')} id = 'pile4'/>
        <Pile cards={state.pile5} onClick={ev=> onClick(ev, 'pile5')} id = 'pile5'/>
        <Pile cards={state.pile6} onClick={ev=> onClick(ev, 'pile6')} id = 'pile6'/>
        <Pile cards={state.pile7} onClick={ev=> onClick(ev, 'pile7')} id = 'pile7'/>
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {
  match: PropTypes.object.isRequired
};
