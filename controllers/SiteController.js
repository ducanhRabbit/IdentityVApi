
class SiteController{
    async checkAccessToken(req,res){
        try{
            res.json('Validated')
        }catch(err){
            res,json(err)
        }
    }
}

module.exports = new SiteController()