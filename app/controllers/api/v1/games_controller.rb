class Api::V1::GamesController < Api::V1::BaseController
  before_action :doorkeeper_authorize!, only: [:create, :destroy, :update]
  before_action :set_game,  only: [:update, :show, :destroy]

  def index 
    respond_with Game.all
  end

  def show 
    respond_with :api, :v1, @game 
  end

  def create
    respond_with :api, :v1, Game.create(game_params)
  end

  def destroy
    respond_with @game.destroy
  end

  def update
    @game.update_attributes(game_params)
    respond_with @game, json: game 
  end

  def set_game
    @game = Game.find_by_slug params[:id]
    @game = Game.find params[:id] if @game.nil?
  end

  private

  def game_params
    params.require(:game).permit(:id, :title, :description)
  end
end
