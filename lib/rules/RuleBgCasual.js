var model = require('../model.js');
var Rule = require('./rule.js');

/**
 * Most popular variant played in Bulgaria called casual (обикновена).
 * @constructor
 * @extends Rule
 */
function RuleBgCasual() {
  Rule.call(this);

  /**
   * Rule name, matching the class name (eg. 'RuleBgCasual')
   * @type {string}
   */
  this.name = 'RuleBgCasual';

  /**
   * Short title describing rule specifics
   * @type {string}
   */
  this.title = 'General';

  /**
   * Full description of rule
   * @type {string}
   */
  this.description = 'Most popular variant of backgammon played in Bulgaria.';

  /**
   * Full name of country where this rule (variant) is played.
   * To list multiple countries use a pipe ('|') character as separator.
   * @type {string}
   */
  this.country = 'Bulgaria';

  /**
   * Two character ISO code of country where this rule (variant) is played.
   * To list multiple codes use a pipe ('|') character as separator.
   * List codes in same order as countries in the field above.
   * @type {string}
   */
  this.countryCode = 'bg';
}

RuleBgCasual.prototype = Object.create(Rule.prototype);
RuleBgCasual.prototype.constructor = RuleBgCasual;

/**
 * Roll dice and generate list of moves the player has to make according to
 * current rules.
 *
 * In casual variant the only specific when rolling dice is that doubles result in
 * four moves, in stead of two, as usual.
 *
 * @memberOf RuleBgCasual
 * @returns {Dice} - Dice object containing random values and allowed moves
 */
RuleBgCasual.prototype.rollDice = function() {
  return Rule.prototype.rollDice.call(this);
};

/**
 * Reset state to initial position of pieces according to current rule.
 * @memberOf RuleBgCasual
 * @param {State} state - Board state
 */
RuleBgCasual.prototype.resetState = function(state) {
  /**
   * Move pieces to correct initial positions for both players.
   * Values in state.points are zero based and denote the .
   * the number of pieces on each position.
   * Index 0 of array is position 1 and increments to the number of maximum
   * points.
   *
   * Position: |12 13 14 15 16 17| |18 19 20 21 22 23| White
   *           |5w          3b   | |5b             2w| <-
   *           |                 | |                 |
   *           |                 | |                 |
   *           |                 | |                 |
   *           |5b          3w   | |5w             2b| <-
   * Position: |11 10 09 08 07 06| |05 04 03 02 01 00| Black
   *
   */


  model.State.clear(state);

  this.place(state, 5, model.PieceType.WHITE, 5);
  this.place(state, 3, model.PieceType.WHITE, 7);
  this.place(state, 5, model.PieceType.WHITE, 12);
  this.place(state, 2, model.PieceType.WHITE, 23);

  this.place(state, 5, model.PieceType.BLACK, 18);
  this.place(state, 3, model.PieceType.BLACK, 16);
  this.place(state, 5, model.PieceType.BLACK, 11);
  this.place(state, 2, model.PieceType.BLACK, 0);
};

/**
 * Increment position by specified number of steps and return an incremented position
 * @memberOf RuleBgCasual
 * @params {number} position - Denormalized position
 * @params {PieceType} type - Type of piece
 * @params {number} steps - Number of steps to increment towards first home position
 * @returns {number} - Incremented position (denormalized)
 */
RuleBgCasual.prototype.incPos = function(position, type, steps) {
  var newPosition;
  if (type === model.PieceType.WHITE) {
    newPosition = position - steps;
  }
  else {
    newPosition = position + steps;
  }

  return newPosition;
};

/**
 * Normalize position - Normalized positions start from 0 to 23 for both players,
 * where 0 is the first position in the home part of the board, 6 is the last
 * position in the home part and 23 is the furthest position - in the opponent's
 * home.
 * @memberOf RuleBgCasual
 * @params {number} position - Denormalized position (0 to 23 for white and 23 to 0 for black)
 * @params {PieceType} type - Type of piece (white/black)
 * @returns {number} - Normalized position (0 to 23 for both players)
 */
RuleBgCasual.prototype.normPos = function(position, type) {
  var normPosition = position;

  if (type == model.PieceType.BLACK) {
    normPosition = 23 - position;
  }
  return normPosition;
};

/**
 * Get denormalized position - start from 0 to 23 for white player and from
 * 23 to 0 for black player.
 * @memberOf RuleBgCasual
 * @param {number} position - Normalized position (0 to 23 for both players)
 * @param {PieceType} type - Type of piece (white/black)
 * @return {number} - Denormalized position (0 to 23 for white and 23 to 0 for black)
 */
RuleBgCasual.prototype.denormPos = function(position, type) {
  var denormPosition = position;

  if (type == model.PieceType.BLACK) {
    denormPosition = 23 - position;
  }
  return denormPosition;
};

/**
 * Move piece by specified number of steps without enforcing any rules.
 * Automatically bear or place piece, instead of moving, if board state
 * requires that.
 * @memberOf RuleBgCasual
 * @params {Game} game - Game
 * @params {number} position - Denormalized position
 * @params {PieceType} type - Type of piece
 * @params {number} steps - Number of steps to increment towards first home position
 * @returns {boolean} - True if piece was moved/borne/placed
 */
RuleBgCasual.prototype.moveBy = function(game, position, type, steps) {
  var piece = game.state.points[position].pop();
  
  if (piece != null) {
    if (piece.PieceType === type) {

      // Determine new piece position
      var newPosition = this.incPos(position, type, steps);

      // Check if piece can be moved to that position

      // TODO: Handle bearing or placing pieces

      if ((newPosition >= 0) || (newPosition <= 23)) {
        game.state.points[newPosition].push(piece);
        return true;
      }
    }
  }

  game.state.points[position].push(piece);
  return false;
};

/**
 * Check if there are any pieces on the bar.
 * @memberOf RuleBgCasual
 * @param {Game} game - Check state of the specified game
 * @param {PieceType} type - Type of piece (white/black)
 * @returns {boolean} - True if there are any pieces on the bar
 */
RuleBgCasual.prototype.havePiecesOnBar = function(game, type) {
  return game.state.bar[type].length > 0;
};

/**
 * Check if all pieces are in the home field.
 * @memberOf RuleBgCasual
 * @param {Game} game - Check state of the specified game
 * @param {PieceType} type - Type of piece (white/black)
 * @returns {boolean} - True if all pieces are in home field
 */
RuleBgCasual.prototype.allPiecesAreHome = function(game, type) {
  var maxPos = 0;

  for (var i = 23; i >= 0; i--) {
    var pos = this.denormPos(i, type);

    var cnt = model.State.countAtPos(game.state, pos, type);

    if (cnt > 0) {
      maxPos = i;
      break;
    }
  }

  return maxPos <= 5;
};

/**
 * Validate piece move according to rules of current rule.
 *
 * First call parent method, then, if result is valid, check also if:
 * - HaveNoPiecesOnBar
 * - PieceIsMovable
 * - PointIsInsideBoard
 * - PointIsUnoccupied
 * -
 * - DestinationIsOutsideBoard
 * - AllPiecesAreHome
 * -
 *
 * If all pieces are home, move is considered valid if:
 *
 * @memberOf RuleBgCasual
 * @param {Game} game - Game
 * @param {number} position - Denormalized position of point
 * @param {PieceType} type - Type of piece (white/black)
 * @param {number} steps - Number of steps to make forward to the first home position
 * @returns {boolean} True if move is valid and should be allowed.
 */
RuleBgCasual.prototype.validateMove = function(game, position, type, steps) {
  // TODO: Finish this method
  var result = Rule.prototype.validateMove.call(this);
  if (!result) {
    return false;
  }

  if (this.havePiecesOnBar(game, type)) {
    var destination = null;
    // If there are pieces on the bar, the player can only place pieces on
    // board
    if (piece.PieceType == model.PieceType.WHITE) {
      destination = steps - 1;
    }
    else {
      destination = 24 - steps;
    }
  }
  else if (this.allPiecesAreHome(game, type)) {
    var destination = this.incPos(position, type, steps);
    var normDestination = this.normPos(destination, type);
    if (normDestination == 0) {
      // can bear off
      return true;
    }
    // If all pieces are home, player can move or bear pieces
    if (this.normPos(position) == steps) {

    }
  }
  else {
    var destination = this.incPos(position, type, steps);
    // If at least one piece is not home, player can only move or place pieces
  }

  var piece = game.state.points[position].pop();
  if (piece != null) {
    if (piece.PieceType === type) {

      // Determine new piece position
      var newPosition;
      if (piece.PieceType == model.PieceType.WHITE) {
        newPosition = position - steps;
      }
      else {
        newPosition = position + steps;
      }

      // Check if piece can be moved to that position
      if ((newPosition >= 0) || (newPosition <= 23)) {
        game.state.points[newPosition].push(piece);
        return true;
      }
    }
  }

  return false;
};

module.exports = new RuleBgCasual();