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

//validate card moved from 
const validateValueAndSuit = (card_suit, card_value, deck) => {
  const valueLookUp2 = {
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
    return card_value === 'king';
  } else{
    const top_card = deck[deck.length - 1];
    if (top_card.value !== valueLookUp2[card_value]){
      return false;
    } else if ((card_suit === 'hearts' || card_suit === 'diamonds') && (top_card.suit === 'hearts' || top_card.suit === 'diamonds')){
      return false;
    }
    else return !((card_suit === 'spades' || card_suit === 'clubs') && (top_card.suit === 'spades' || top_card.suit === 'clubs'));
  }
};

let validateMove = (state, request, drawCount) => {
  let score = 0;
  let dst = request.dst;
  let returnState = state;
  let card_suit = request.card.slice(0, request.card.indexOf(':'));
  let card_value = request.card.slice(request.card.indexOf(':') + 1);
  const error = {error: "invalid move"};
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

  const suitLookUp = {'1': 'hearts', '2': 'diamonds', '3': 'clubs', '4': 'spades'};

  let move = {cards: [], src: request.src, dst: dst};

  const src_pile = state[request.src];
  const dst_pile = state[dst];

  if(request.src === 'draw'){
    if (dst !== 'discard'){
      return error;
    } else{
      if(drawCount === 1){
  
      let card_moved = returnState[request.src].pop();
      card_moved.up = true;
      returnState[dst].push(card_moved);
      move.cards.push(card_moved);
      } else if (drawCount === 3){
        console.log('here');
        for(let i = 0; i < 3; i++){
          let card_moved = returnState[request.src].pop();
          card_moved.up = true;
          returnState[dst].push(card_moved);
          move.cards.push(card_moved);
        }
        
      }
      return {state: returnState, score: score, move: move};
      
    }
  }

  //if card is being moved to the stack from discard , other stacks, or piles
  else if (dst.indexOf('stack') !== -1){
    //must be the top-most card
    const top_card = src_pile[src_pile.length - 1];
    if (top_card.value !== card_value || top_card.suit !== card_suit){
      return {error: 'must move the topmost card to foundation!'};
    }
    //check if suit is correct
    else if (card_suit !== suitLookUp[dst.substring(5)]){
      return {error: 'wrong suit!'};
    }

    //check if value is correct
    else if ((dst_pile.length === 0 && card_value !== "ace") || (dst_pile.length!== 0 && dst_pile[dst_pile.length - 1].value !== validAncestor[card_value])){
      return {error: 'value is invalid. Must be in ascending order.'};
    }
    else{
    let card_moved = returnState[request.src].pop();

    if(returnState[request.src].length !== 0){
      returnState[request.src][returnState[request.src].length -1].up = true;
    
    }
    returnState[dst].push(card_moved);
    score = 10;
    move.cards.push(card_moved);
    return {state: returnState, score: score, move: move};
    }
  } 

  //if card is being moved to a pile from stacks, other piles, or discard
  else if (dst.indexOf('pile') !== -1){
    //from another pile, move all cards below the target

    if(!validateValueAndSuit(card_suit, card_value, dst_pile)){
      return {error: 'color or value not matched!'};
    }

    //check if values
    if (request.src.indexOf('pile') !== -1){

      let index = 0;
      for (let i = 0; i < state[request.src].length; ++i){
        let cur = state[request.src][i];
        if (cur.suit === card_suit && cur.value === card_value){
          index = i;
          break;
        }
      }

      let add_array = state[request.src].slice(index);
      returnState[request.src] = returnState[request.src].slice(0, index);
          if(returnState[request.src].length !== 0){
            returnState[request.src][returnState[request.src].length -1].up = true;
      }
      
      returnState[dst] = returnState[dst].concat(add_array);
      score = 5;
      move.cards = add_array;
      return {state: returnState, score: score, move: move};
    }

    //from stack or discard
    //check if it is the topmost card
    else{
      if(src_pile[src_pile.length - 1].value !== card_value || src_pile[src_pile.length - 1].suit !== card_suit){
        return {error: 'color or value not matched!'};
      }
      
      const card_moved = returnState[request.src].pop();
    returnState[dst].push(card_moved);
    move.cards.push(card_moved);

    score = dst === 'discard'? 5: -15;

    return {state: returnState, score: score, move: move};
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
