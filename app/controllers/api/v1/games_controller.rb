class Api::V1::GamesController < Api::V1::BaseController
  def index 
    respond_with Game.all
  end
  def create
    respond_with :api, :v1, Game.create(game_params)
  end
  def destroy
    respond_with Game.destroy(params[:id])
  end
  def update
    game = Game.find(params["id"])
    game.update_attributes(game_params)
    respond_with game, json: game 
  end
  private
  def game_params
    params.require(:game).permit(:id, :title, :description)
  end
end
