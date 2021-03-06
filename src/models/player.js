import { Record, List, fromJS } from 'immutable'
import PLAYERS from '../data/players'

class Bet extends Record({
  player: null,
  game: 0,
  team_a_score: 0,
  team_b_score: 0,
  winner: null,
  answers: List(),
}) {
  scored() {
    return !isNaN(this.team_a_score) && !isNaN(this.team_a_score)
  }
  hasWinner() {
    return this.winner !== null
  }
}

class Player extends Record({
  id: 0,
  name: null,
  champion: null,
  scorer: null,
  bets: List(),
}) {
  gameScore(game) {
    let score = 0

    if (isNaN(game.team_a_score) || isNaN(game.team_b_score)) {
      return score
    }

    const bet = this.bets.get(game.id)
    if (!bet) {
      return score
    }

    const is_90m_game_draw = game.team_a_score_90m === game.team_b_score_90m
    const is_team_a_winner = game.team_a_score > game.team_b_score
    const is_team_b_winner = game.team_a_score < game.team_b_score
    const game_winner = is_team_a_winner ? game.team_a : is_team_b_winner ? game.team_b : null

    const is_bet_draw = bet.team_a_score === bet.team_b_score

    const winner_bet = bet.winner !== null
    if (winner_bet) {
      score +=
        (bet.winner === game_winner ? 4 : 0) *
        (is_team_a_winner ? game.team_a_factor : game.team_b_factor)
    }
    if (bet.scored()) {
      const toto_points =
        (is_90m_game_draw && is_bet_draw) ||
        (!is_90m_game_draw && is_team_a_winner && bet.team_a_score > bet.team_b_score) ||
        (!is_90m_game_draw && is_team_b_winner && bet.team_b_score > bet.team_a_score)
          ? 2
          : 0

      if (toto_points) {
        const goals_points =
          game.team_a_score_90m === bet.team_a_score && game.team_b_score_90m === bet.team_b_score
            ? 1
            : 0

        const factor = is_90m_game_draw
          ? game.draw_factor
          : is_team_a_winner
            ? game.team_a_factor
            : is_team_b_winner
              ? game.team_b_factor
              : 1

        score += (toto_points + goals_points) * factor
      }
    }

    game.questions.forEach((q, i) => {
      const game_answer = game.answers.get(i)
      if (game_answer === bet.answers.get(i)) {
        score += q
      }
      if (game_answer === '*') {
        score += Number(bet.answers.get(i))
      }
    })

    return Math.round(score * 10) / 10
  }

  betRisk(bet, game) {
    const risk =
      bet.team_a_score > bet.team_b_score
        ? game.team_a_factor
        : bet.team_b_score > bet.team_a_score
          ? game.team_b_factor
          : game.draw_factor

    return Math.round(risk * 10) / 10
  }

  score(games = List()) {
    const score = games.reduce((result, game) => result + this.gameScore(game), 0)
    return Math.round(score * 10) / 10
  }

  isGoalsSuccess(game) {
    if (isNaN(game.team_a_score) || isNaN(game.team_b_score)) {
      return false
    }

    const bet = this.bets.get(game.id)
    if (!bet) {
      return false
    }
    return game.team_a_score_90m === bet.team_a_score && game.team_b_score_90m === bet.team_b_score
  }
  isBonusSuccess(game) {
    const bet = this.bets.get(game.id)
    let result = false
    game.questions.forEach((q, i) => {
      if (game.answers.get(i) === bet.answers.get(i)) {
        result = true
      }
      if (game.answers.get(i) === '*' && Number(bet.answers.get(i)) > 0) {
        result = true
      }
    })
    return result
  }
  isWinnerSuccess(game) {
    const bet = this.bets.get(game.id)
    if (!bet) {
      return false
    }

    let result = false
    if (bet.hasWinner()) {
      result = game.getWinner() === bet.winner
    }
    return result
  }
}

export const initPlayers = () => {
  return fromJS(
    PLAYERS.map((player, i) => {
      return new Player({
        ...player,
        id: i,
        bets: fromJS(
          player.bets.map((bet, gameIndex) => {
            return new Bet({
              ...bet,
              player: i,
              team_a_score: Number(bet.team_a_score),
              team_b_score: Number(bet.team_b_score),
              answers: fromJS(bet.answers || []),
              game: gameIndex,
            })
          }),
        ),
      })
    }),
  )
}
