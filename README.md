# CS 4288: Web-based System Architecture 
## Programming Assignment 6

## Overview

This is it!  In this assignment you will get to a deployed web-based Klondike Solitaire application.  Let's get started...

On the Derby Day your application will be evaluated by a number of other students in class.  Your application will earn points based on its capabilities (see below).

IMPORTANT: Modify your landing page to list which items below should be tested.  That way someone coming to your site knows what they should spend time on and what they should not waste their time on.

* 30% of your grade will be awarded based on a manual code review by the instructor
* 70+% of your grade will be based on the Derby Day peer review  
* It is possible to earn more than 100% of the points
* You are free to change, add or remove any code within your application.  All reused code (not recorded into package.json) must be attributed

### Here are the places to earn (or lose) points:

1. (30 points - mandatory) Instructor code review.  Is it clean, well-structured, modular code.

1. (20 points - mandatory) You need to deploy with HTTPS.  It must be publicly available on the general internet (not just on Vandy campus).  The IP address must not change for the 3 days prior to the Derby and during the entire Derby Day.  This means AWS is an excellent option, but not the only one.  You must employ HTTPS with a CA issued certificate.  Must not pop any warnings or errors on users' Chrome browser.

1. (10 points) Enable modification of a user's profile.  Must be saved back to the DB and viewable immediately by anyone else the going to the user's profile page and within the user's own header component.

1. (10 points) Fully working "results" page.  Must display information for every move in a game.

1. (30 points) If results page is fully working (see above), additional points can be earned if each move is click-able and renders the state of the game after the completion of the clicked move.  Game does not need to be playable from that rendering.

1. (40 points) Register and log in via Github.  Offer users the ability register and login using either native auth or the Github OAuth mechanism discussed in class.  You must never directly ask the user for their username, password, or any other information if they choose Github - it must all be pulled from Github.

1. (40 points) Autocomplete button.  Will play all valid moves from the piles to the stacks.  Must send (and validate) each move to the server.  Should be clickable at any time as long as there are valid moves.

1. (10 points) Recognize end of game, i.e. that there are no moves from piles to the stacks and that there are no useable moves from the discard pile to the stacks.  This recognition may miss rearrangements of the piles that would result in new moves becoming available.  So, if end-of-game is recognized, prompt user if they want to end game.

1. (10 points) Infinite undo/redo.  Two UI buttons that let the user undo all moves back to the start of the game.  This will require new REST API endpoints to properly handle game state.  The redo stack should always be cleared if the user plays a new move.

1. (-10 points) Game not playable.  You had to implement all of the gameplay mechanics for Assignment 5, so this should be solid.

1. (-10 points) Console is spewing any errors or warnings.  I like it clean people!

### Super Bonus Points

* 10 points - Awarded to the one most attractive application as voted on by the other students.  A tie will split the points.

* 10 points - Awarded to the one student with the smallest client JS bundle (```/public/main.js```).  A tie will split the points


## Submission:

You must still commit your code to your repo by the start of class on Derby Day.  Failure to do so will result in the loss of the 30 points from code review.  Failure to publicly host the application during the Derby will result in the loss of 70+% of your points.  You have to make this happen.
