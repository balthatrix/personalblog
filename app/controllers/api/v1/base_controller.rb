class Api::V1::BaseController < ApplicationController
 respond_to :json
 def current_user
   @current_user unless @current_user.nil?
   t = Doorkeeper::AccessToken.where("token=?", params[:access_token]).last
   return unless t
   @current_user = User.find_by_id t.resource_owner_id
 end
end
