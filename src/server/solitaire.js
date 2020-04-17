/* Copyright G. Hemingway, 2020 - All rights reserved */
"use strict";

const shuffleCards = (includeJokers = false) => {
  /* Return an array of 52 cards (if jokers is false, 54 otherwise). Carefully follow the instructions in the README */
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach(suit => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach(
      value => {
        cards.push({ suit: suit, value: value });
      }
    );
  });
  // Add in jokers here
  if (includeJokers) {
    /*...*/
  }
  // Now shuffle
  let deck = [];
  while (cards.length > 0) {
    // Find a random number between 0 and cards.length - 1
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards[index]);
    cards.splice(index, 1);
  }
  return deck;
};

const initialState = () => {
  /* Use the above function.  Generate and return an initial state for a game */
  let state = {
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
  };

  // Get the shuffled deck and distribute it to the players
  const deck = shuffleCards(false);
  // Setup the piles
  for (let i = 1; i <= 7; ++i) {
    let card = deck.splice(0, 1)[0];
    card.up = true;
    state[`pile${i}`].push(card);
    for (let j = i + 1; j <= 7; ++j) {
      card = deck.splice(0, 1)[0];
      card.up = false;
      state[`pile${j}`].push(card);
    }
  }
  // Finally, get the draw right
  state.draw = deck.map(card => {
    card.up = false;
    return card;
  });
  return state;
};

const filterGameForProfile = game => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondyke",
  start: game.start,
  state: game.state,
  moves: game.moves,
  winner: game.winner
});

const filterMoveForResults = move => ({
  ...move
});

const validateMoveHelper = (suit, value, deck) => {
  const validMoveValue = {
    'ace': '2',
    '2': '3',
    '3': '4',
    '4': '5',
    '5': '6',
    '6': '7',
    '7': '8',
    '8': '9',
    '9': '10',
    '10':'jack',
    'jack': 'queen',
    'queen': 'king',
  };
  if(deck.length === 0){
    return value === 'king';
  } else{
    const top = deck[deck.length - 1];
    if (top.value !== validMoveValue[value]){
      return false;
    } else if ((suit === 'hearts' || suit === 'diamonds') && (top.suit === 'hearts' || top.suit === 'diamonds')){
      return false;
    } else if ((suit === 'spades' || suit === 'clubs') && (top.suit === 'spades' || top.suit === 'clubs')){
      return false;
    } else{
      return true;
    }
  }
};

let validateMove = (state, request, drawCount) => {
  const error = {error: "invalid move"};
  let suite = request.card.slice(0, request.card.indexOf(':'));
  let value = request.card.slice(request.card.indexOf(':') + 1);
  let score = 0;
  const suitetable = {'1': 'hearts', '2': 'diamonds', '3': 'clubs', '4': 'spades'};
  const validAncestor = {
    '2': 'ace',
    '3': '2',
    '4': '3',
    '5': '4',
    '6': '5',
    '7': '6',
    '8': '7',
    '9': '8',
    '10': '9',
    'jack': '10',
    'queen': 'jack',
    'king': 'queen'
  };

  let moveRequest = {cards: [], src: request.src, dst: request.dst};
  const srcPile = state[request.src];
  const dstPile = state[request.dst];

  //draw cards
  if(request.src === 'draw'){
    if (request.dst !== 'discard'){
      return error;
    } else{
      if(drawCount === 1){
      let cardSelected = state[request.src].pop();
        state[request.dst].push(cardSelected);
        moveRequest.cards.push(cardSelected);
        cardSelected.up = true;
      } else if (drawCount === 3){
        for(let i = 0; i < 3; i++){
          let card_moved = state[request.src].pop();
          state[request.dst].push(card_moved);
          moveRequest.cards.push(card_moved);
          card_moved.up = true;
        }
      }
      return {state: state, score: score, move: moveRequest};
    }
  }

  //card moved form one stack to another
  else if (request.dst.indexOf('stack') !== -1){
    const top = srcPile[srcPile.length - 1];
    if (top.value !== value || top.suit !== suite){
      return {error: 'Invalid move!'};
    }
    else if (suite !== suitetable[request.dst.substring(5)]){
      return {error: 'Invalid move!'};
    }
    else if ((dstPile.length === 0 && value !== "ace")
            || (dstPile.length!== 0
            && dstPile[dstPile.length - 1].value !== validAncestor[value])){
      return {error: 'invalid move!'};
    }
    else{
    let cardSelected = state[request.src].pop();
    if(state[request.src].length !== 0){
      state[request.src][state[request.src].length -1].up = true;
    }
      state[request.dst].push(cardSelected);
      moveRequest.cards.push(cardSelected);
      score += 10;
    return {state: state, score: score, move: moveRequest};
    }
  }

  else if (request.dst.indexOf('pile') !== -1){

    if(!validateMoveHelper(suite, value, dstPile)){
      return {error: 'Invalid move!'};
    }
    if (request.src.indexOf('pile') !== -1){
      let index = 0;
      for (let i = 0; i < state[request.src].length; ++i){
        let temp = state[request.src][i];
        if (temp.suit === suite && temp.value === value){
          break;
        }
      }

      let add_array = state[request.src].slice(index);
      state[request.src] = state[request.src].slice(0, index);
          if(state[request.src].length !== 0){
            state[request.src][state[request.src].length -1].up = true;
      }

      state[request.dst] = state[request.dst].concat(add_array);
      score = 5;
      moveRequest.cards = add_array;
      return {state: state, score: score, move: moveRequest};
    }

    else{
      if(srcPile[srcPile.length - 1].suit !== suite || srcPile[srcPile.length - 1].value !== value){
        return {error: 'Wrong card, not matched'};
      }

      const card_moved = state[request.src].pop();
      state[request.dst].push(card_moved);
      moveRequest.cards.push(card_moved);

    score = request.dst === 'discard'? 5: -15;

    return {state: state, score: score, move: moveRequest};
    }
  }
  else{
    return error;
  }
  
};

module.exports = {
  shuffleCards: shuffleCards,
  initialState: initialState,
  filterGameForProfile: filterGameForProfile,
  filterMoveForResults: filterMoveForResults,
  validateMove: validateMove
};
