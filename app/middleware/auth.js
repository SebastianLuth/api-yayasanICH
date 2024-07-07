function auth(req, res, next){
    //checking user already exist or not in req
    if(req.user?.id) return next()
  
    return res.sendStatus(401)
  }
  
module.exports = auth